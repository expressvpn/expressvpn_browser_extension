/* eslint-disable class-methods-use-this */
/*
ExpressVPN Browser Extension:
Copyright 2017-2023 Express VPN International Ltd
Licensed GPL v2
*/
import UAParser from 'ua-parser-js';
import * as utils from './modules/utils';
import bkHelper from './modules/backgroundHelper';
import NativeCommunication from './modules/nativeCommunication';
import rating from './modules/rating';
// @ts-ignore
import coords from './modules/locations.json';
import locationPicker from './modules/locationPicker';
import * as chromeStorage from './modules/chromeStorage';
import Telemetry from './modules/telemetry';

const { ICONS } = utils;
const badStates = ['BAD_OS_VERSION', 'BAD_APP_VERSION'];


const MIN_APP_VERSION = {
  MAC: '7.1.0',
  WINDOWS: '6.9.0',
  LINUX: '2.0.0',
};

const defaultCurrentInfo = utils.currentInfo;
const defaultPrefs = utils.defaultPreferences;

class Background {
  currentInfo = defaultCurrentInfo;
  prefs = defaultPrefs;
  com;
  locationsData = {};
  recommendedLocationsList = [];
  allLocationsList = [];
  myBrowser = UAParser(navigator.userAgent).browser;
  notificationUpdateId = '';
  mockData = {
    prevNotificationId: '',
    prevState: '',
  };
  subscriptionId;
  ldClient;
  telemetry;
  isVivaldi = false;

  constructor() {
    console.info('Loaded!', new Date());
    this.com = new NativeCommunication(this);
    this.telemetry = new Telemetry(this);
  }

  async initialize() {
    // Generates and saves a random nonce to be used in the network lock page to make that page was meant to be shown by the extension
    await chromeStorage.set('nonce', crypto.getRandomValues(new Uint32Array(3)).join(''));
    this.addListeners();

    const sys = UAParser(navigator.userAgent);
    this.currentInfo.os = bkHelper.groupOsName(sys.os.name.split(' ')[0]).toUpperCase();
    this.currentInfo.system.os = sys.os;
    this.currentInfo.system.browser = sys.browser;
    // Vivaldi does not seem to implement chrome.runtime.getContexts properly
    // This is a (hopefully) temporary workaround
    // Runtime errors in Vivaldi are expected since we cannot check if the popup is open before sending a message
    this.isVivaldi = await (async () => {
      const tabs = await chrome.tabs.query({});
      return !!tabs?.[0]?.['vivExtData'];
    })();

    chrome.storage.local.get('prefs', (storage) => {
      if (typeof storage.prefs === 'object') {
        this.prefs = { ...this.prefs, ...storage.prefs }; // make sure new options are added
      }
    });

    const errorState = bkHelper.checkPlatformCompatibility();
    if (errorState) {
      this.currentInfo.state = errorState;
    } else {
      this.updateExtensionSettings(true);
      this.setRatingConfig();
      this.com.connect();
    }
  }

  async safeSendRuntimeMessage(message) {
    return this.isVivaldi ? chrome.runtime.sendMessage(message) : utils.safeSendRuntimeMessage(message);
  }

  updateExtensionSettings(skipMimic) {
    chrome.storage.local.get('prefs', (storage) => {
      if (typeof storage.prefs === 'object') {
        this.prefs = { ...this.prefs, ...storage.prefs }; // make sure new options are added
      }
      chrome.storage.local.set({ prefs: this.prefs });
      utils.setLanguage(this.prefs.language).then(langObj => {
        chrome.storage.session.set({ localizedStrings: langObj.strings });
        // @ts-ignore
        navigator.localizedStrings = langObj.strings;
        this.currentInfo.localizedStrings = langObj.strings;
        this.currentInfo.locale = langObj.locale;

        // Mimic popup startup API calls
        if (!skipMimic) {
          this.com.getStatus();
          // eslint-disable-next-line no-use-before-define
          this.updatePopupState();
          this.com.getLocationList();
          this.com.getMessages();
        }
      });
      bkHelper.setWebrtcOption(this.prefs['chrome.prevent_webrtc_leaks'], this.currentInfo.state);
    });
  }

  setRatingConfig() {
    chrome.storage.sync.get('rating', (storage) => {
      if (typeof storage.rating === 'object' && Object.keys(storage.rating).length > 0) {
        this.currentInfo.ratingData = storage.rating;
      } else {
        this.currentInfo.ratingData = rating.defaultRatingData;
      }
    });
  }

  localize(localeKey) {
    return this.currentInfo.localizedStrings[localeKey] ? this.currentInfo.localizedStrings[localeKey].message : '';
  }

  showConnectionNotification(state, cb) {
    const notificationMap = {
      'connected': {
        title: this.localize('vpn_status_notification_connected_label'),
        message: this.localize('vpn_status_notification_connected_text').replace('%s', this.currentInfo.selectedLocation.name),
        iconUrl: '/images/connected.png',
      },
      'reconnecting': {
          title: this.localize('vpn_status_notification_reconnecting_label'),
          message: this.localize(this.currentInfo.preferences.traffic_guard_level 
              ? 'vpn_status_notification_reconnecting_network_lock_on_text' 
              : 'vpn_status_notification_reconnecting_network_lock_off_text').replace('%s', this.currentInfo.selectedLocation.name),
          iconUrl: '/images/connecting.svg',
      },
      'connection_error': {
          title: this.localize('vpn_status_notification_connection_failed_label'),
          message: this.localize(this.currentInfo.preferences.traffic_guard_level 
              ? 'vpn_status_notification_connection_failed_network_lock_on_text' 
              : 'vpn_status_notification_connection_failed_network_lock_off_text').replace('%s', this.currentInfo.selectedLocation.name),
          iconUrl: '/images/connection_error.svg',
      },
      'duplicate_license_used': {
          title: this.localize('vpn_status_notification_connection_limit_label'),
          message: this.localize('vpn_status_notification_connection_limit_text'),
          iconUrl: '/images/connection_error.svg',
      }
    };

    let options = notificationMap[state];
    if (options) {
        chrome.notifications.create({ type: 'basic', ...options }, (id) => {
            if (cb) {
                cb(id);
            }
        });
    }
  }

  updateStatus(name, data) {
    switch (name) {
      case 'WaitForNetworkReady':
        this.currentInfo.networkStatus = data.result;
        break;
      case 'VPNClustersUpdated':
      case 'SmartLocationChanged':
        this.com.getLocationList();
        this.com.getStatus();
        break;
      case 'ServiceStateChanged':
        switch (data.newstate) {
          case 'ready':
            this.com.getLocationList();
            bkHelper.updateIcon(ICONS.default);
            this.currentInfo.progress = 0;
            break;
          case 'reconnecting':
          case 'connecting':
            bkHelper.updateIcon(ICONS.connecting);
            break;
          case 'connected':
            bkHelper.updateIcon(ICONS.connected);
            if (data.oldstate === 'connecting' && this.myBrowser.name !== 'Firefox') {
              // Allow new DNS and whatnot to settle in and then send telemetry event if the user allows them
              setTimeout(() => {
                // Part of the Google captcha metrics collection described below in the webRequest's section.
                // If the user allows it, count a successful connection
                this.telemetry.send('captcha', 'connection_success', true);
              }, 1500);
            }
            break;
          case 'disconnecting':
            bkHelper.updateIcon(ICONS.connecting);
            break;
          case 'internal_error':
          case 'network_error':
          case 'fraudster':
          case 'subscription_expired':
          case 'license_revoked':
          case 'activation_error':
          case 'duplicate_license_used':
          case 'connection_error':
          case 'not_activated':
            bkHelper.updateIcon(ICONS.error);
            break;
          default:
            // console.info('Default icon', data.newstate);
            bkHelper.updateIcon(ICONS.default);
            break;
        }

        bkHelper.toggleNetworkLockGuard(data.newstate, this.myBrowser.name, this.currentInfo.preferences.traffic_guard_level);

        if (data.oldstate && data.newstate && data.oldstate !== data.newstate) {
          this.currentInfo.hasCurrentStateSince = Date.now(); // Saves when the current state has been set

          if ((data.oldstate === 'ready' || data.oldstate === 'connection_error') && data.newstate === 'connecting') {
            // Remove cancelled connections
            this.currentInfo.connectingTimes = this.currentInfo.connectingTimes.filter(el => Object.prototype.hasOwnProperty.call(el, 'delta'));
            // Adding new connection entry
            this.currentInfo.connectingTimes.push({
              startTime: (Date.now() / 1000),
            });
          } else if (data.oldstate === 'connecting' && (data.newstate === 'connected' || data.newstate === 'connection_error')) {
            let currentId = this.currentInfo.connectingTimes.findIndex(el => !Object.prototype.hasOwnProperty.call(el, 'delta'));
            if (currentId) {
              this.currentInfo.connectingTimes[currentId].delta = (Date.now() / 1000) - this.currentInfo.connectingTimes[currentId].startTime;
              this.currentInfo.connectingTimes = this.currentInfo.connectingTimes.slice(0, 5);
            }
          }

          if (this.prefs['chrome.desktop_notification'] === true) {
            this.showConnectionNotification(data.newstate);
          }

          this.currentInfo.ratingData = rating.updateRatingDataFromState(this.currentInfo.ratingData, data);
          chrome.storage.sync.set({ 'rating': this.currentInfo.ratingData });
        }

        if (!badStates.includes(this.currentInfo.state)) {
          this.currentInfo.state = (data.newstate === 'activated') ? 'ready' : data.newstate;
          if (data.newstate === 'activated') { // initialize all value when activated app.
            this.setRatingConfig();
          }
        }
        break;
      case 'MessagesUpdated':
        this.com.getMessages();
        break;
      case 'SpeedTestProgress':
        this.currentInfo.progress = parseInt(data.progress, 10) * 100;
        break;
      case 'ConnectionProgress':
        this.currentInfo.state = 'connecting';
        this.currentInfo.selectedLocation = locationPicker.getLocationByName(this.allLocationsList, utils.localizeLocation(data.current_location));
        if (this.currentInfo.smartLocation.id === this.currentInfo.selectedLocation.id) {
          this.currentInfo.selectedLocation.is_smart_location = true;
        }

        this.currentInfo.selectedLocation.is_country = false; // ConnectionProgressData.current_location always contains a cluster, not a country
        this.currentInfo.progress = data.progress;
        break;
      case 'SelectedLocationChanged':
        if (data.is_country === true) {
          // @ts-ignore
          this.currentInfo.selectedLocation = {
            name: utils.localizeLocation(data.name),
            id: 0,
            is_country: true,
            is_smart_location: false,
          };
        } else {
          // Since the new protocol's SelectedLocationChanged event contains the full selected location object,
          // we can just use it. We cannot just check for currentInfo.isNewProtocol since this event might
          // get sent before the first status message is received from the engine.
          // eslint-disable-next-line no-lonely-if
          if (['name', 'id', 'is_smart_location', 'country_code'].every(key => key in data)) {
            this.currentInfo.selectedLocation = data;
          } else {
            this.currentInfo.selectedLocation = locationPicker.getLocationByName(this.allLocationsList, utils.localizeLocation(data.name));
            if (this.currentInfo.smartLocation && this.currentInfo.smartLocation.id === this.currentInfo.selectedLocation.id) {
              this.currentInfo.selectedLocation.is_smart_location = true;
            }
          }
        }
        break;
      default:
        break;
    }

    // on fresh installs this property does not exist
    if ((typeof this.currentInfo.selectedLocation !== 'undefined') && (this.currentInfo.selectedLocation.name !== '') &&
      (typeof this.locationsData[this.currentInfo.selectedLocation.name] === 'object')) {

      this.currentInfo.selectedLocation.country_code = this.locationsData[this.currentInfo.selectedLocation.name].country_code;
      this.currentInfo.selectedLocation.coords = utils.calculateRandomPosition(this.locationsData[this.currentInfo.selectedLocation.name]?.coords); // randomise the coords
      this.currentInfo.selectedLocation.id = this.locationsData[this.currentInfo.selectedLocation.name]?.id;
    }

    this.safeSendRuntimeMessage({ state: true, data: this.currentInfo });
    chrome.storage.local.set({ 'currentInfo': this.currentInfo });
    bkHelper.setWebrtcOption(this.prefs['chrome.prevent_webrtc_leaks'], this.currentInfo.state);
  }

  // wait for currentInfo to be defined
  waitForCurrentInfo() {
    const isLocationSelected = typeof this.currentInfo.selectedLocation !== 'undefined' && this.currentInfo.selectedLocation.name !== '';
    const hasRecentLocations = Array.isArray(this.currentInfo.recent_locations_ids) && this.currentInfo.recent_locations_ids.length > 0;
    const isReadyForAutoConnect = this.prefs['chrome.auto_connect'] === true && this.currentInfo.state === 'ready';

    if (!isLocationSelected || !hasRecentLocations) {
      setTimeout(() => this.waitForCurrentInfo(), 50);
      return;
    }

    if (isReadyForAutoConnect) {
      const lastLocationId = this.currentInfo.recent_locations_ids[0];
      const lastLocation = locationPicker.getLocationById(this.allLocationsList, lastLocationId);
      this.com.selectLocation(lastLocation);
      this.com.connectToLocation(lastLocation, { isAutoConnect: true });
    }
  }

  updatePopupState(dontGetPrefs) {
    if (this.com.isInstalled() === false) {
      if (this.currentInfo.state !== 'BAD_OS_VERSION') {
        this.currentInfo.state = 'NOT_INSTALLED';
        this.com.resetBackoff();
      }
      bkHelper.updateIcon(ICONS.error);
    } else {
      if (dontGetPrefs !== true) {
        this.com.getEnginePreferences();
      }
      if ((typeof this.currentInfo.selectedLocation !== 'undefined') && (this.currentInfo.selectedLocation.name !== '')) {
        this.currentInfo.selectedLocation.country_code = this.locationsData[this.currentInfo.selectedLocation.name].country_code;
      }
      this.currentInfo.recommendedLocationsList = this.recommendedLocationsList;
      this.currentInfo.allLocationsList = this.allLocationsList;
    }
    this.safeSendRuntimeMessage({ state: true, data: this.currentInfo });
  }

  checkVersion(data) {
    if (typeof data.app_version !== 'undefined') {
      // check minimum app version to run the extension
      if (typeof MIN_APP_VERSION[this.currentInfo.os] !== 'undefined' && utils.versionCompare(data.app_version, MIN_APP_VERSION[this.currentInfo.os]) < 0) {
        this.currentInfo.state = 'BAD_APP_VERSION';
      }

      this.currentInfo.app.version = data.app_version;
    }
  }

  showUpdateNotification(currentVersion) {
    let options = {
      type: 'basic',
      title: this.localize('notification_extension_update_title'),
      message: this.localize('notification_extension_update_message').replace('%VERSION%', currentVersion),
      iconUrl: '/images/toolbar-icon-128.png',
    };
    // @ts-ignore
    chrome.notifications.create(null, options, id => {
      this.notificationUpdateId = id;
      this.mockData.prevNotificationId = id;
    });
  }

  addListeners() {
    chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
      sendResponse({
        coords: this.currentInfo.selectedLocation?.coords,
        fakeIt:
          ['connected', 'connecting', 'disconnecting', 'reconnecting', 'connection_error'].includes(this.currentInfo.state) &&
          this.prefs.hideLocation,
      });
    });

    /**
     * Attempt to detect if a Google's Captcha is shown to the user when using our service
     *
     * The frequency of Google captcha hits by users is an important quality metric that will help us improve the user experience when using Google services.
     * We are making improvements to reduce the number of Captchas that our users are seeing in their day-to-day.
     * We are only interested in captchas shown when using a Google service. This metric is only collected if the user has the "Help Improve" option enabled.
     * No user private data, or any data about the online activity is collected in the metric.
     * You can read more about our commitment to privacy in our Privacy policy: https://www.expressvpn.com/privacy-policy
     */
    if (this.myBrowser.name !== 'Firefox') {
      chrome.webRequest.onCompleted.addListener(async ({tabId}) => {
        const { url } = await chrome.tabs.get(tabId);

        // Confirm the URL that uses the recaptcha is the Google's internal "unusual traffic" page
        if (url.startsWith('https://www.google.com/sorry/')) {
          console.log('[captcha debug] CAPTCHA DETECTED!');
          // The following method will check if the user allows telemetry and if so, count this event.
          this.telemetry.send('captcha', 'captcha_seen', true);
        }
      }, { urls: ['https://www.google.com/recaptcha/api2/anchor?*'] });
    }

    chrome.runtime.onMessage.addListener(async (message, sender) => {
      if (message.mock && process.env.NODE_ENV === 'development') {
        console.log('Got mock', message);
        switch (message.category) {
          case 'connection':
            if (this.mockData.prevState === message.data) {
              return;
            }
            chrome.notifications.clear(this.mockData.prevNotificationId);
            this.showConnectionNotification(message.data, (id) => {
              this.mockData.prevNotificationId = id;
              this.mockData.prevState = message.data;
            });
            break;
          case 'locale':
            if (this.currentInfo.locale === message.locale) {
              return;
            }
            utils.setLanguage(message.locale).then(langObj => {
              this.currentInfo.localizedStrings = langObj.strings;
              this.currentInfo.locale = langObj.locale;
              this.safeSendRuntimeMessage({ state: true, data: this.currentInfo });
            });
            break;
          case 'update':
            chrome.notifications.clear(this.mockData.prevNotificationId);
            this.showUpdateNotification(chrome.runtime.getManifest().version);
            break;
          default:
            break;
        }
      } else if (message.customLocation) {
        this.com.openLocationPicker();
      } else if (message.getLocations) {
        this.com.getLocationList();
      } else if (message.disconnect) {
        this.com.disconnect();
      } else if (message.getConnectionLogs) {
        this.com.getConnectionLogs();
      } else if (message.getMessages) {
        if (!badStates.includes(this.currentInfo.state)) {
          this.com.getMessages();
        }
      } else if (message.finishedWelcome) {
        this.currentInfo.showWelcome = false;
        this.updatePopupState();
      } else if (message.getState) {
        this.com.getStatus(); // check if there are app updates
        this.updatePopupState();
      } else if (message.connectToSelectedLocation) {
        if (this.currentInfo.state === 'ready' || this.currentInfo.state === 'connection_error') {
          this.com.selectLocation(this.currentInfo.selectedLocation);
          this.com.connectToLocation(this.currentInfo.selectedLocation);
        } else if (this.currentInfo.state === 'connected') {
          this.com.connectToLocation(this.currentInfo.selectedLocation, { connectWhileConnected: true });
        }
      } else if (message.reconnect) {
        this.com.retryConnect();
      } else if (message.reset) {
        this.com.reset();
      } else if (message.resetState) {
        this.com.resetState();
      } else if (message.cancelConnection) {
        this.com.disconnect();
      } else if (message.updateSelectedLocation) {
        this.currentInfo.selectedLocation = message.selectedLocation;
        if (this.currentInfo.state === 'ready' || this.currentInfo.state === 'connection_error') {
          // Notify expressVPN service of new location selected
          this.com.selectLocation(this.currentInfo.selectedLocation);
        }
      } else if (message.openApp) {
        // if the app is not activated, then the extension is most likely not connected to the helper at this time
        if (this.currentInfo.state === 'not_activated') {
          this.com.connect();
        }
        this.com.openApp();
      } else if (message.cancelSpeedTest) {
        this.com.cancelSpeedTest();
      } else if (message.openChromePreferences) {
        this.com.openChromePreferences();
      } else if (message.openPreferences) {
        this.com.openPreferences();
      } else if (message.updateExtensionSettings) {
        this.updateExtensionSettings();
      } else if (message.telemetry) {
        const key = `${chromeStorage.GA_PREFIX}${message.category}`;
        const item = await chromeStorage.get(key);
        if (!item) {
          this.telemetry.send(message.category, message.action);
          const today = new Date();
          await chromeStorage.set(key, true, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
        }
      }
    });

    chrome.notifications.onClicked.addListener(notificationId => {
      switch (notificationId) {
        case this.notificationUpdateId:
          chrome.tabs.create({ url: `${this.currentInfo.website_url}/support/release-notes/browser-extension/` });
          break;
        default:
          break;
      }
    });

    chrome.storage.onChanged.addListener(changes => {
      if (changes.rating) {
        this.setRatingConfig();
      }
    });
  }

  /**
   * Update locations data.
   * @param {Array} recommendedLocations - Array of recommended locations.
   * @param {Array} allLocations - Array of all locations.
   * @param {Array} recentLocationIds - Array of recent location IDs.
   * @returns {void}
   */
  updateLocationsData(recommendedLocations, allLocations, recentLocationIds) {
    this.recommendedLocationsList = utils.sortAndGroupBy(recommendedLocations || [], 'country', this.currentInfo.preferences.preferred_protocol);
    this.allLocationsList = utils.sortAndGroupBy(allLocations || [], 'region', this.currentInfo.preferences.preferred_protocol);

    Object.keys(this.allLocationsList).forEach(region => {
      this.allLocationsList[region] = utils.sortAndGroupBy(this.allLocationsList[region], 'country');
    });

    if (!this.currentInfo.selectedLocation && recommendedLocations.length) {
      this.currentInfo.selectedLocation = recommendedLocations[0];
      this.com.selectLocation(this.currentInfo.selectedLocation);
    }

    allLocations.forEach(location => {
      const countryCoords = coords[location.country]?.default || { lat: 38.883333, lon: -77.000 };
      if (!this.locationsData[location.country]) {
          this.locationsData[location.country] = {
              country_code: location.country_code,
              id: location.id, // Assuming id is the same for all locations within a country
              coords: countryCoords
          };
      }
      const locationCoords = coords[location.country]?.[location.name] || countryCoords;
      this.locationsData[location.name] = {
          country_code: location.country_code,
          id: location.id,
          coords: locationCoords
      };
    });

    if (this.currentInfo.selectedLocation?.name) {
        this.currentInfo.selectedLocation.coords = this.locationsData[this.currentInfo.selectedLocation.name]?.coords;
        chrome.storage.local.set({ 'currentInfo': this.currentInfo });
    }

    if (this.currentInfo.smartLocation?.name && !this.currentInfo.smartLocation.country_code) {
        this.currentInfo.smartLocation.country_code = this.locationsData[this.currentInfo.smartLocation.name].country_code;
    }

    if (!this.currentInfo.selectedLocation?.id && !this.currentInfo.selectedLocation?.is_country) {
        this.currentInfo.selectedLocation = locationPicker.getLocationByName(this.allLocationsList, this.currentInfo.selectedLocation.name);
        this.currentInfo.selectedLocation.is_smart_location = this.currentInfo.smartLocation.id === this.currentInfo.selectedLocation.id;
    }

    this.currentInfo.recent_locations_ids = recentLocationIds;

    if (this.currentInfo.selectedLocation?.name && !this.currentInfo.selectedLocation.id) {
        this.currentInfo.selectedLocation.id = this.locationsData[this.currentInfo.selectedLocation.name]?.id;
    }

    this.updatePopupState();
  }

  /**
   * Handle update status.
   * @param {string} status - Name of the service state.
   * @param {Object} data - Data related to the service state.
   * @returns {void}
   */
  handleStatusUpdate(status, data) {
    if (status === 'ServiceStateChanged' && data?.newstate === 'connected') {
      this.com.getStatus();
    }
    this.updateStatus(status, data);
  }

  /**
  * Handle current state.
  * @param {Object} newCurrentInfo - (Partial) Updated CurrentInfo.
  * @returns {void}
  */
  updateCurrentInfoFromEngine(newCurrentInfo) {
    this.currentInfo = {
      ...this.currentInfo,
      ...newCurrentInfo,
      app: {
        ...this.currentInfo.app,
        ...newCurrentInfo.app
      },
      website_url: newCurrentInfo.website_url || this.currentInfo.website_url
    };

    // Additional logic for conditional updates
    if (this.currentInfo.subscription) {
      this.currentInfo.ratingData.isRegularUser = utils.isRegularUser(this.currentInfo.subscription);
    }
    if (this.currentInfo.raw.state === 'connected' && this.currentInfo.raw.current_location && this.currentInfo.raw.connection) {
      this.currentInfo.previousConnection = {
        id: this.currentInfo.raw.current_location.id,
        protocol: this.currentInfo.raw.connection.protocol
      };
    }

    this.updateStatus('ServiceStateChanged', { newstate: newCurrentInfo.state });
    if (this.currentInfo.subscription && this.currentInfo.subscription.subscription_id !== this.subscriptionId) {
      this.subscriptionId = this.currentInfo.subscription.subscription_id;
    }
  }

  /**
   * Handle connected to helper.
   * @param {Object} helperData - Data received from the helper.
   * @returns {void}
   */
  handleConnectedToHelper(helperData) {
    this.com.getStatus();
    this.com.getEnginePreferences();
    this.com.getLocationList();
    this.com.getMessages();

    // check if app version is compatible with the extension
    if (Object.keys(helperData).length > 0) {
      this.checkVersion(helperData);
    }

    // wait for currentInfo to be defined
    this.waitForCurrentInfo();
  }

  /**
   * Handle update smart location.
   * @param {Object} smartLocationData - Data of the smart location.
   * @returns {void}
   */
  updateSmartLocation(smartLocationData) {
    if (typeof smartLocationData === 'object') {
      this.currentInfo.smartLocation = { ...smartLocationData, is_smart_location: true, is_country: false };
      // on fresh installs this property does not exist
      if (typeof this.currentInfo.selectedLocation === 'undefined') {
        // @ts-ignore
        this.currentInfo.selectedLocation = this.currentInfo.smartLocation;
        this.com.selectLocation(this.currentInfo.selectedLocation);
      }
    }
  }

  /**
  * Handle update preferences.
  * @param {Object} preferencesData - User preferences data.
  * @returns {void}
  */
  handleEnginePreferencesUpdate(preferencesData) {
    this.currentInfo.preferences = preferencesData;
    const { preferences, smartLocation, recommendedList, selectedLocation, allLocationsList } = this.currentInfo;

    if (!smartLocation?.name && recommendedList?.length) {
        const protocol = preferences.preferred_protocol.toLowerCase();
        const newSmartLocation = recommendedList.find(location => protocol === 'auto' || location.protocols.includes(protocol)) || smartLocation;

        this.currentInfo.smartLocation = { ...newSmartLocation, is_smart_location: true, is_country: false };
    }

    if (selectedLocation?.name && allLocationsList.length) {
        const selectedLocationObj = locationPicker.getLocationByName(allLocationsList, selectedLocation.name);
        const protocolMismatch = selectedLocationObj?.protocols.includes(preferences.preferred_protocol.toLowerCase()) === false;

        if (protocolMismatch && !selectedLocationObj?.is_country) {
            this.currentInfo.selectedLocation = { ...this.currentInfo.smartLocation, is_smart_location: true, is_country: false };
        }
    }

    if (Object.keys(this.locationsData).length > 0) {
        this.updatePopupState(true);
    }
  }
}
const background = new Background();

(async () => {
  await background.initialize();
})();

// Needs to be outside of an async wrapper otherwise it does not get called
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    background.currentInfo.showWelcome = true;
  } else if (details.reason === 'update') {
    if (background.prefs['chrome.desktop_notification'] === true) {
      const rx = /^(\d{1,2}.\d{1,2})/g; // Only show notification for major and minor update
      const currentVersion = chrome.runtime.getManifest().version;
      const currentVersionMatches = currentVersion.match(rx);
      const previousVersionMatches = details.previousVersion.match(rx);

      if (
        currentVersionMatches.length === 1 &&
        previousVersionMatches.length === 1 &&
        previousVersionMatches[0] !== currentVersionMatches[0]
      ) {
        setTimeout(async () => {
          const hasSeenHelpImproveScreen = await chromeStorage.get('hasSeenHelpImproveScreen');
          background.showUpdateNotification(currentVersion);

          if (!hasSeenHelpImproveScreen) {
            background.currentInfo.showWelcome = true;
            background.currentInfo.forceShowHelpImproveScreen = true;
          }
        }, 100);
      }
    }
  }
});

export default Background;