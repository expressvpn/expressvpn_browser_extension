/*
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
*/
const utils = require('./utils');

export default (function () {
  let port;
  let isConnected = false;
  let currentBackoffCollision = 0;
  let prevCurrentBackoffCollision = 0;
  let englishLocations = [];
  let isNewProtocol = false;

  // helper method to build the requests.
  const buildRequest = (_method, _params) => {
    let method = _method;
    let params = _params;

    let request = {
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    };
    if (isNewProtocol) {
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
          method = _method.replace(/^XVPN\./, '');
          break;
      }

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
  const getNextDelay = () => {
    const getRandomIntInclusive = (_min, _max) => {
      let min = Math.ceil(_min);
      let max = Math.floor(_max);
      return Math.floor(Math.random() * ((max - min) + 1)) + min;
    };
    const delay = 100; // ms
    let maximumBackoffTime = Math.pow(2, currentBackoffCollision) - 1;
    let nextDelay = getRandomIntInclusive(0, maximumBackoffTime) * delay;
    console.log('currentBackoffCollision', currentBackoffCollision, 'maximumBackoffTime', maximumBackoffTime, 'next delay', nextDelay);
    currentBackoffCollision += 1;
    return nextDelay;
  };

  function handleNewProtocol(msg) {
    const { type: responseType, name: responseName, data: responseData } = msg;

    if (responseType === 'event') {
      window.top.postMessage({ method: 'updateStatus', name: responseName, data: responseData }, '*');
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
          isNewProtocol,
          raw: responseData,
        };
        window.top.postMessage({ method: 'currentState', currentInfo }, '*');
      } else if (responseName === 'preferences') {
        window.top.postMessage({ method: 'updatePreferences', data: responseData }, '*');
      } else if (responseName === 'messages') {
        if (responseData.length > 0) {
          chrome.storage.local.set({ 'messages': responseData });
        }
      } else if (responseName === 'locations') {
        englishLocations = responseData.locations;
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

        window.top.postMessage({
          method: 'updateLocationsData',
          // eslint-disable-next-line camelcase
          data: { recommended: recommendedList, all: allLocations, recent_locations_ids: responseData.recent_locations_ids },
        }, '*');

        if (responseData.smart_location_id) {
          const smartLocation = responseData.locations.find((el) => el.id === responseData.smart_location_id);
          if (smartLocation) {
            window.top.postMessage({ method: 'updateSmartLocation', data: utils.localizeLocation(smartLocation) }, '*');
          }
        }
      } else {
        console.error('Method not supported', msg);
      }
    } else if (responseType === 'error') {
      console.error('Engine error:', responseData.message);
    }
  }

  const connect = () => {
    const helperName = 'com.expressvpn.helper';
    port = chrome.runtime.connectNative(helperName);
    port.onMessage.addListener((_msg) => {
      let msg = _msg;
      console.log('Port msg:', msg);
      if ((msg === null) || (typeof msg !== 'object')) { // null is an object...
        return true; // must return true to keep the event listener running
      }
      if (isNewProtocol) {
        handleNewProtocol(msg);
        return true;
      }
      if (msg.error && typeof msg.error === 'string') {
        if (msg.error.indexOf('sendEngineCommand: not activated') > 0) {
          currentBackoffCollision = prevCurrentBackoffCollision;
        }
      } else if (msg.connected) {
        if (msg.browser_helper_protocol === 2) {
          isNewProtocol = true;
        }
        prevCurrentBackoffCollision = currentBackoffCollision;
        currentBackoffCollision = 0; // reset exponential backoff collision counter on connect
        if (!isConnected) { // Notify extension is connected to helper
          console.log('connected');
          isConnected = true;
          let data = {};
          if (typeof msg.app_version !== 'undefined') {
            data.app_version = msg.app_version;
          }
          window.top.postMessage({ method: 'connectedToHelper', data }, '*');
        }
      } else if (msg.info && msg.info.state) {
        let currentInfo = {
          state: msg.info.state,
          selectedLocation: utils.localizeLocation(msg.info.selected_location || msg.info.last_location),
          app: {
            latest_version: msg.info.latest_version,
            latest_version_url: msg.info.latest_version_url,
          },
          subscription: msg.subscription,
          website_url: msg.info.website_url,
          raw: msg.info,
        };
        // since selectedLocation does not contain the cluster name if it's a country
        // we need to get the full location object from either current_location (if it's connected) or last_location (if it's not connected to the VPN server)
        if (currentInfo.state !== 'ready' && currentInfo.selectedLocation && currentInfo.selectedLocation.is_country === true && typeof msg.info.current_location === 'object') {
          currentInfo.selectedLocation = utils.localizeLocation(msg.info.current_location);
        }
        window.top.postMessage({ method: 'currentState', currentInfo }, '*');
      } else if (msg.name) {
        let data = msg.data ? msg.data[`${msg.name}Data`] : {};
        window.top.postMessage({ method: 'updateStatus', name: msg.name, data }, '*');
      } else if (msg.Preferences) {
        window.top.postMessage({ method: 'updatePreferences', data: msg.Preferences }, '*');
      } else if (msg.locations) {
        englishLocations = msg.locations;
        const allLocations = msg.locations.map(el => {
          const localizedItems = {
            country: utils.localizeLocation(el.country),
            name: utils.localizeLocation(el.name),
            region: utils.localizeLocation(el.region),
          };
          return { ...el, ...localizedItems };
        });
        let recommendedList = [];
        allLocations.forEach((location) => {
          if (location.recommended === true) {
            recommendedList.push(location);
          }
        });

        recommendedList.sort((a, b) => {
          if (a.sort_order < b.sort_order) {
            return -1;
          } else if (a.sort_order > b.sort_order) {
            return 1;
          }
          return 0;
        });
        if (typeof msg.default_location !== 'undefined') {
          window.top.postMessage({ method: 'updateSmartLocation', data: utils.localizeLocation(msg.default_location) }, '*');
        }
        // eslint-disable-next-line camelcase
        window.top.postMessage({ method: 'updateLocationsData', data: { recommended: recommendedList, all: allLocations, recent_locations_ids: msg.recent_locations_ids } }, '*');
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
    port.onDisconnect.addListener((event) => {
      // console.log('disconnected');
      isConnected = false;
      setTimeout(() => {
        connect();
      }, getNextDelay());
    });
  };

  // Listen for messages from the other background scripts
  window.addEventListener('message', (event) => {
    if (event.origin !== chrome.extension.getURL('/').slice(0, -1)) {
      console.error('Bad origin', event.origin);
      return false;
    }
    let message = event.data;
    switch (message.method) {
      case 'resetBackoff':
        console.debug('resetBackoff');
        currentBackoffCollision = 0;
        connect();
        break;
      default:
        break;
    }
  }, false);

  /**
   * Sends a native message. Checks first if we're connected
   *
  */
  const sendNativeMessage = (_msg) => {
    let msg = _msg;

    if (isConnected === true) {
      port.postMessage(msg);
      console.debug('COMMAND SENT', msg);
    }
  };

  /* *
   * Requests the current status of the expressVPN application
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const getStatus = () => sendNativeMessage(buildRequest('XVPN.GetStatus'));

  /* *
  * Gets current chrome settings from the xVPN service
  * returns the stringified request made to the watchdog so this method can be tested
  * */
  const getBrowserPreferences = () => sendNativeMessage(buildRequest('XVPN.GetBrowserPreferences'));

  /* *
  * Gets engine settings
  * returns the stringified request made to the watchdog so this method can be tested
  * */
  const getEnginePreferences = () => sendNativeMessage(buildRequest('XVPN.GetEnginePreferences'));

  /* *
   * Requests the current list of locations
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  // eslint-disable-next-line camelcase
  const getLocationList = () => sendNativeMessage(buildRequest('XVPN.GetLocations', { include_default_location: true, include_recent_connections: true }));

  /* *
   * Requests the expressVPN's connection logs
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const getConnectionLogs = () => sendNativeMessage(buildRequest('XVPN.GetLogs'));

  /* *
  * Cancels the speed test
  * returns the stringified request made to the watchdog so this method can be tested
  * */
  const cancelSpeedTest = () => sendNativeMessage(buildRequest('XVPN.StopSpeedTest'));

  /* *
  * Called when user selects a new location.
  * returns the stringified request made to the watchdog so this method can be tested
  * */
  const selectLocation = (selectedLocation) => {
    const englishLocation = englishLocations.find(el => el.id === selectedLocation.id);
    return sendNativeMessage(buildRequest('XVPN.SelectLocation', {
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
  const connectToLocation = (location, options = {}) => {
    const { connectWhileConnected, isAutoConnect } = options;
    const englishLocation = englishLocations.find(el => el.id === location.id);
    let connectionData = {};
    if (location.is_country) {
      connectionData.country = englishLocation.country;
      connectionData.country_code = location.country_code;
    } else {
      connectionData.name = englishLocation.name;
      connectionData.is_default = location.is_smart_location;
      connectionData.id = location.id;
    }
    connectionData.change_connected_location = !!connectWhileConnected; // eslint-disable-line camelcase
    connectionData.is_auto_connect = !!isAutoConnect;
    return sendNativeMessage(buildRequest('XVPN.Connect', connectionData));
  };

  /* *
   * Called when user click 'Back to Home' in the connection failed screen. to the location passed
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const resetState = () => sendNativeMessage(buildRequest('XVPN.ResetState'));

  /* *
   * Logs out the current user
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const reset = () => sendNativeMessage(buildRequest('XVPN.Reset'));

  /* *
   * Opens the Location picker dialog
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const openLocationPicker = (location) => sendNativeMessage(buildRequest('XVPNUI.OpenLocationPicker'));

  /* *
   * Open preferences window and change to "Chrome" tab in native Mac/Windows apps.
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const openChromePreferences = (location) => sendNativeMessage(buildRequest('XVPNUI.OpenChromePreferences'));

  /* *
   * Open preferences window in native Mac/Windows apps.
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const openPreferences = (location) => sendNativeMessage(buildRequest('XVPNUI.OpenPreferences'));

  /* *
   * Disconnects from the current connections
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const disconnect = () => sendNativeMessage(buildRequest('XVPN.Disconnect'));

  /* *
   * Returns a list of messages to display to the user in the footer
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const getMessages = () => sendNativeMessage(buildRequest('XVPN.GetMessages'));

  /* *
   * Retry connect to last selected location. This command should only
   * be used in connection_error state.
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const retryConnect = () => sendNativeMessage(buildRequest('XVPN.RetryConnect'));

  /* *
   * Returns the connection status to the helper application
  * */
  const isInstalled = () => isConnected;

  /* *
   * Opens native app
   * returns the stringified request made to the watchdog so this method can be tested
  * */
  const openApp = () => sendNativeMessage(buildRequest('XVPNUI.LaunchApp'));

  return {
    buildRequest, // needs to be exported in order to be testable
    getStatus,
    getBrowserPreferences,
    getEnginePreferences,
    connect,
    getLocationList,
    getConnectionLogs,
    cancelSpeedTest,
    selectLocation,
    connectToLocation,
    openLocationPicker,
    openChromePreferences,
    openPreferences,
    disconnect,
    isInstalled,
    getMessages,
    openApp,
    reset,
    resetState,
    retryConnect,
  };
}());
