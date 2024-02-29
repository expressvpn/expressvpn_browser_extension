import * as utils from './utils';

/* eslint-disable class-methods-use-this */
class NativeCommunication {
  port;
  isConnected = false;
  isNewProtocol = false;
  currentBackoffCollision = 0;
  prevCurrentBackoffCollision = 0;
  englishLocations = [];
  bk;

  constructor(bk) {
    this.bk = bk;
  }

  // helper method to build the requests.
  buildRequest(_method, _params) {
    let method = _method;
    let params = _params;

    let request = {
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    };
    if (this.isNewProtocol) {
      switch (_method) {
        case 'XVPN.GetEnginePreferences':
          method = 'GetPreferences';
          break;
        case 'XVPN.Reset':
          method = 'SignOut';
          break;
        case 'XVPN.SelectLocation':
          method = 'SelectLocation';
          params = { ...params.selected_location };
          break;
        default:
          method = _method.replace(/^XVPN(UI)?\./, '');
          break;
      }

      // @ts-ignore
      request = {
        method,
        params,
      };
    }
    return request;
  };

  /*
  * This function implements the Exponential backoff algorithm to determine
  * how long should the extension wait before attempting to reconnect
  */
  getNextDelay() {
    const getRandomIntInclusive = (_min, _max) => {
      let min = Math.ceil(_min);
      let max = Math.floor(_max);
      return Math.floor(Math.random() * ((max - min) + 1)) + min;
    };
    const delay = 100; // ms
    let maximumBackoffTime = Math.pow(2, this.currentBackoffCollision) - 1;
    let nextDelay = getRandomIntInclusive(0, maximumBackoffTime) * delay;
    console.log('currentBackoffCollision', this.currentBackoffCollision, 'maximumBackoffTime', maximumBackoffTime, 'next delay', nextDelay);
    this.currentBackoffCollision += 1;
    return nextDelay;
  };

  handleNewProtocol(msg) {
    const { type: responseType, name: responseName, data: responseData } = msg;
    if (responseType === 'event') {
      this.bk.handleStatusUpdate(responseName, responseData);
    } else if (responseType === 'method') {
      if (responseName === 'status') {
        const info = responseData.info;
        const app = responseData.app;

        let currentInfo = {
          state: info.state,
          selectedLocation: utils.localizeLocation(info.selected_location || info.last_location),
          app,
          subscription: responseData.subscription,
          website_url: info.website_url,
          isNewProtocol: this.isNewProtocol,
          raw: responseData,
        };
        this.bk.updateCurrentInfoFromEngine(currentInfo);
      } else if (responseName === 'preferences') {
        this.bk.handleEnginePreferencesUpdate(responseData);
      } else if (responseName === 'messages') {
        if (responseData.length > 0) {
          chrome.storage.local.set({ 'messages': responseData });
        }
      } else if (responseName === 'locations') {
        this.englishLocations = responseData.locations;
        let recommendedList = [];
        const allLocations = responseData.locations.map(el => {
          const localizedEl = {
            country: utils.localizeLocation(el.country),
            name: utils.localizeLocation(el.name),
            region: utils.localizeLocation(el.region),
          };
          const item = { ...el, ...localizedEl };
          if (msg.data.recommended_location_ids.includes(item.id)) {
            recommendedList.push(item);
          }
          return item;
        });

        this.bk.updateLocationsData(recommendedList, allLocations, responseData.recent_locations_ids);

        if (responseData.smart_location_id) {
          const smartLocation = responseData.locations.find((el) => el.id === responseData.smart_location_id);
          if (smartLocation) {
            this.bk.updateSmartLocation(utils.localizeLocation(smartLocation));
          }
        }
      } else {
        console.error('Method not supported', msg);
      }
    } else if (responseType === 'error') {
      console.error('Engine error:', responseData.message);
    }
  }

  connect() {
    const helperName = 'com.expressvpn.helper';
    this.port = chrome.runtime.connectNative(helperName);
    this.port.onMessage.addListener((msg) => {
      console.log('Port msg:', msg);
      if ((msg === null) || (typeof msg !== 'object')) { // null is an object...
        return true; // must return true to keep the event listener running
      }
      if (this.isNewProtocol) {
        this.handleNewProtocol(msg);
        return true;
      }
      if (msg.error && typeof msg.error === 'string' && msg.error.includes('sendEngineCommand: not activated')) {
        this.currentBackoffCollision = this.prevCurrentBackoffCollision;
      } else if (msg.connected) {
        this.handleConnection(msg);
      } else if (msg.info && msg.info.state) {
        this.handleInfo(msg);
      } else if (msg.name) {
        let data = msg.data ? msg.data[`${msg.name}Data`] : {};
        this.bk.handleStatusUpdate(msg.name, data);
      } else if (msg.Preferences) {
        this.bk.handleEnginePreferencesUpdate(msg.Preferences);
      } else if (msg.locations) {
        this.handleLocations(msg);
      } else if (msg.messages) {
        if (msg.messages.length > 0) {
          chrome.storage.local.set({ 'messages': msg.messages });
        }
      } else if (msg.data && !msg.name) {
        console.error(msg);
      }
    });

    /* *
    * Fired when the port disconnects.
    * Try to reconnect
    * */
    this.port.onDisconnect.addListener((event) => {
      // console.log('disconnected');
      this.isConnected = false;
      setTimeout(() => {
        this.connect();
      }, this.getNextDelay());
    });
  };

  handleConnection(msg) {
    if (msg.browser_helper_protocol === 2) {
      this.isNewProtocol = true;
    }
    this.prevCurrentBackoffCollision = this.currentBackoffCollision;
    this.currentBackoffCollision = 0; // reset backoff counter on connect

    if (!this.isConnected) {
      console.log('connected');
      this.isConnected = true;
      let data = msg.app_version ? { app_version: msg.app_version } : {};
      this.bk.handleConnectedToHelper(data);
    }
  }

  handleInfo(msg) {
    const defaultLocation = msg.info.current_location || msg.info.last_location;
    let selectedLocation = utils.localizeLocation(msg.info.selected_location || defaultLocation);

    // since selectedLocation does not contain the cluster name if it's a country
    // we need to get the full location object from either current_location (if it's connected) or last_location (if it's not connected to the VPN server)
    if (msg.info.state !== 'ready' && selectedLocation?.is_country && typeof msg.info.current_location === 'object') {
      selectedLocation = utils.localizeLocation(msg.info.current_location);
    }

    const currentInfo = {
      state: msg.info.state,
      selectedLocation,
      app: {
          latest_version: msg.info.latest_version,
          latest_version_url: msg.info.latest_version_url,
      },
      subscription: msg.subscription,
      website_url: msg.info.website_url,
      raw: msg.info,
    };

    this.bk.updateCurrentInfoFromEngine(currentInfo);
  }

  handleLocations(msg) {
    this.englishLocations = msg.locations;

    const allLocations = msg.locations.map(el => ({
      ...el,
      country: utils.localizeLocation(el.country),
      name: utils.localizeLocation(el.name),
      region: utils.localizeLocation(el.region),
    }));

    const recommendedList = allLocations
      .filter(location => location.recommended)
      .sort((a, b) => a.sort_order - b.sort_order);

    if (msg.default_location !== undefined) {
      this.bk.updateSmartLocation(utils.localizeLocation(msg.default_location));
    }

    this.bk.updateLocationsData(recommendedList, allLocations, msg.recent_locations_ids);
  }

  resetBackoff() {
    console.debug('resetBackoff');
    this.currentBackoffCollision = 0;
    this.connect();
  }

  /**
   * Sends a native message. Checks first if we're connected
   *
  */
  sendNativeMessage(_msg) {
    let msg = _msg;

    if (this.isConnected === true) {
      this.port.postMessage(msg);
      console.debug('COMMAND SENT', msg);
    }
  };

  /* *
   * Requests the current status of the expressVPN application
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  getStatus() {
    this.sendNativeMessage(this.buildRequest('XVPN.GetStatus'));
  }
  /* *
   * Gets current chrome settings from the xVPN service
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  getBrowserPreferences() {
    this.sendNativeMessage(this.buildRequest('XVPN.GetBrowserPreferences'));
  }
  /* *
   * Gets engine settings
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  getEnginePreferences() {
    this.sendNativeMessage(this.buildRequest('XVPN.GetEnginePreferences'));
  }
  /* *
   * Requests the current list of locations
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  // eslint-disable-next-line camelcase
  getLocationList() {
    this.sendNativeMessage(
      this.buildRequest('XVPN.GetLocations', {
        include_default_location: true,
        include_recent_connections: true,
      })
    );
  }
  /* *
   * Requests the expressVPN's connection logs
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  getConnectionLogs() {
    this.sendNativeMessage(this.buildRequest('XVPN.GetLogs'));
  }
  /* *
   * Cancels the speed test
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  cancelSpeedTest() {
    this.sendNativeMessage(this.buildRequest('XVPN.StopSpeedTest'));
  }

  /* *
  * Called when user selects a new location.
  * returns the stringified request made to the watchdog so this method can be tested
  * */
  selectLocation(selectedLocation) {
    const englishLocation = this.englishLocations.find(el => el.id === selectedLocation.id);
    return this.sendNativeMessage(this.buildRequest('XVPN.SelectLocation', {
      selected_location: {
        ...selectedLocation,
        name: selectedLocation.is_country ? englishLocation.country : englishLocation.name,
      },
    }));
  };

  /* *
   * Connects to the location passed in the parameter
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  connectToLocation(location, options = {}) {
    const { connectWhileConnected = false, isAutoConnect = false } = options;
    const englishLocation = this.englishLocations.find(el => el.id === location.id);

    let connectionData = {
      // eslint-disable-next-line camelcase
      change_connected_location: connectWhileConnected,
      is_auto_connect: isAutoConnect
    };

    if (location.is_country) {
      connectionData = {
        ...connectionData,
        country: englishLocation.country,
        country_code: location.country_code
      };
    } else {
      connectionData = {
        ...connectionData,
        name: englishLocation.name,
        is_default: location.is_smart_location,
        id: location.id
      };
    }

    return this.sendNativeMessage(this.buildRequest('XVPN.Connect', connectionData));
  }

  /* *
   * Called when user click 'Back to Home' in the connection failed screen. to the location passed
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  resetState() {
    this.sendNativeMessage(this.buildRequest('XVPN.ResetState'));
  }
  /* *
   * Logs out the current user
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  reset() {
    this.sendNativeMessage(this.buildRequest('XVPN.Reset'));
  }
  /* *
   * Opens the Location picker dialog
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  openLocationPicker(location) {
    this.sendNativeMessage(this.buildRequest('XVPNUI.OpenLocationPicker'));
  }
  /* *
   * Open preferences window and change to "Chrome" tab in native Mac/Windows apps.
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  openChromePreferences(location) {
    this.sendNativeMessage(this.buildRequest('XVPNUI.OpenChromePreferences'));
  }
  /* *
   * Open preferences window in native Mac/Windows apps.
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  openPreferences(location) {
    this.sendNativeMessage(this.buildRequest('XVPNUI.OpenPreferences'));
  }
  /* *
   * Disconnects from the current connections
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  disconnect() {
    this.sendNativeMessage(this.buildRequest('XVPN.Disconnect'));
  }
  /* *
   * Returns a list of messages to display to the user in the footer
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  getMessages() {
    this.sendNativeMessage(this.buildRequest('XVPN.GetMessages'));
  }
  /* *
   * Retry connect to last selected location. This command should only
   * be used in connection_error state.
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  retryConnect() {
    this.sendNativeMessage(this.buildRequest('XVPN.RetryConnect'));
  }
  /* *
   * Returns the connection status to the helper application
   * */
  isInstalled() {
    return this.isConnected;
  }
  /* *
   * Opens native app
   * returns the stringified request made to the watchdog so this method can be tested
   * */
  openApp() {
    this.sendNativeMessage(this.buildRequest('XVPNUI.LaunchApp'));
  }
}

export default NativeCommunication;
