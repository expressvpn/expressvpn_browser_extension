/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import UAParser from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
import com from './modules/nativeCommunication';
import * as utils from './modules/utils';
import rating from './modules/rating';
import coords from './modules/locations.json';
import bk from './modules/backgroundHelper';
import locationPicker from './modules/locationPicker';
import localStorage2 from './modules/localStorage2';

const { ICONS } = utils;
const badStates = ['BAD_OS_VERSION', 'BAD_APP_VERSION'];

const MIN_APP_VERSION = {
  MAC: '7.1.0',
  WINDOWS: '6.9.0',
  LINUX: '2.0.0',
};

(function () {
  let { currentInfo } = utils;
  let locationsData = {};
  let recommendedLocationsList = [];
  let allLocationsList = [];
  let prefs = utils.defaultPreferences;
  let myBrowser = UAParser(window.navigator.userAgent).browser;
  let whiteList = [];
  let notificationUpdateId = '';
  let mockData = {
    prevNotificationId: '',
    prevState: '',
  };

  console.info('Loaded!', new Date());
  // Generates and saves a random nonce to be used in the network lock page to make that page was meant to be shown by the extension
  localStorage.setItem('nonce', crypto.getRandomValues( (new Uint32Array(3))).join(''));

  require('./modules/https/https.js');

  function setWebrtcOption() {
    let enableStates = ['connecting', 'reconnecting', 'connected', 'disconnecting', 'connection_error'];
    // checking if the current browser supports chrome.privacy
    if (typeof chrome.privacy === 'undefined') {
      return;
    }
    // update webRTCIPHandlingPolicy setting
    // first get the setting access permission and usage details
    chrome.privacy.network.webRTCIPHandlingPolicy.get({}, (details) => {
      // check if we can modify it
      if ((details) && ((details.levelOfControl === 'controllable_by_this_extension') || (details.levelOfControl === 'controlled_by_this_extension'))) {
        let isEnabled = (prefs['chrome.prevent_webrtc_leaks'] && (enableStates.includes(currentInfo.state)));
        let settingValue = isEnabled ? 'disable_non_proxied_udp' : 'default';
        chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: settingValue }, () => {
          // check if we managed to change the setting successfuly.
          // Not sure when this can ever fail if we passed the 'controllable_by_this_extension' check
          if (chrome.runtime.lastError !== undefined) {
            // console.error(chrome.runtime.lastError);
          }
        });
      }
    });
  }

  function updateExtensionSettings(skipMimic) {
    chrome.storage.local.get('prefs', (storage) => {
      if (typeof storage.prefs === 'object') {
        prefs = Object.assign({}, prefs, storage.prefs); // make sure new options are added
      }
      chrome.storage.local.set({ prefs });
      utils.setLanguage(prefs.language).then(langObj => {
        window.localizedStrings = langObj.strings; // utils.localize background compatibility
        currentInfo.localizedStrings = langObj.strings;
        currentInfo.locale = langObj.locale;

        // Mimic popup startup API calls
        if (!skipMimic) {
          com.getStatus();
          // eslint-disable-next-line no-use-before-define
          updatePopupState();
          com.getLocationList();
          com.getMessages();
        }
      });
      setWebrtcOption();
    });
  }

  function setRatingConfig() {
    chrome.storage.sync.get('rating', (storage) => {
      if (typeof storage.rating === 'object' && Object.keys(storage.rating).length > 0) {
        currentInfo.ratingData = storage.rating;
      } else {
        currentInfo.ratingData = rating.defaultRatingData;
      }
    });
  }

  function updateIcon(newIcon) {
    chrome.browserAction.setBadgeText({ text: newIcon.text });
    if (chrome.browserAction.setBadgeTextColor) { // Requires FF 63+
      chrome.browserAction.setBadgeTextColor({ color: '#FFFFFF' });
    }
    chrome.browserAction.setBadgeBackgroundColor({ color: newIcon.color });
  }

  function localize(localeKey) {
    return currentInfo.localizedStrings[localeKey] ? currentInfo.localizedStrings[localeKey].message : '';
  }

  function showConnectionNotification(state, cb) {
    let options = {
      type: 'basic',
      title: '',
      message: '',
      iconUrl: `/images/${state}.png`,
    };
    let key = '';
    switch (state) {
      case 'connected':
        options.title = localize('vpn_status_notification_connected_label');
        options.message = localize('vpn_status_notification_connected_text').replace('%s', currentInfo.selectedLocation.name);
        break;
      case 'reconnecting':
        options.title = localize('vpn_status_notification_reconnecting_label');
        key = currentInfo.preferences.traffic_guard_level ? 'vpn_status_notification_reconnecting_network_lock_on_text' :
          'vpn_status_notification_reconnecting_network_lock_off_text';
        options.message = localize(key).replace('%s', currentInfo.selectedLocation.name);
        options.iconUrl = '/images/connecting.svg';
        break;
      case 'connection_error':
        options.title = localize('vpn_status_notification_connection_failed_label');
        key = currentInfo.preferences.traffic_guard_level ? 'vpn_status_notification_connection_failed_network_lock_on_text' :
          'vpn_status_notification_connection_failed_network_lock_off_text';
        options.message = localize(key).replace('%s', currentInfo.selectedLocation.name);
        break;
      case 'duplicate_license_used':
        options.title = localize('vpn_status_notification_connection_limit_label');
        options.message = localize('vpn_status_notification_connection_limit_text');
        options.iconUrl = '/images/connection_error.svg';
        break;
      default:
        options.title = '';
        break;
    }
    if (options.title !== '') {
      chrome.notifications.create(options, (id) => {
        if (cb) {
          cb(id);
        }
      });
    }
  }

  function updateStatus(name, data) {
    switch (name) {
      case 'WaitForNetworkReady':
        currentInfo.networkStatus = data.result;
        break;
      case 'VPNClustersUpdated':
      case 'SmartLocationChanged':
        com.getLocationList();
        com.getStatus();
        break;
      case 'ServiceStateChanged':
        switch (data.newstate) {
          case 'ready':
            com.getLocationList();
            updateIcon(ICONS.default);
            currentInfo.progress = 0;
            break;
          case 'reconnecting':
          case 'connecting':
            updateIcon(ICONS.connecting);
            break;
          case 'connected':
            updateIcon(ICONS.connected);
            break;
          case 'disconnecting':
            updateIcon(ICONS.connecting);
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
            updateIcon(ICONS.error);
            break;
          default:
            // console.info('Default icon', data.newstate);
            updateIcon(ICONS.default);
            break;
        }

        if (data.oldstate && data.newstate && data.oldstate !== data.newstate) {
          currentInfo.hasCurrentStateSince = Date.now(); // Saves when the current state has been set

          if ((data.oldstate === 'ready' || data.oldstate === 'connection_error') && data.newstate === 'connecting') {
            // Remove cancelled connections
            currentInfo.connectingTimes = currentInfo.connectingTimes.filter(el => Object.prototype.hasOwnProperty.call(el, 'delta'));
            // Adding new connection entry
            currentInfo.connectingTimes.push({
              startTime: (Date.now() / 1000),
            });
          } else if (data.oldstate === 'connecting' && (data.newstate === 'connected' || data.newstate === 'connection_error')) {
            let currentId = currentInfo.connectingTimes.findIndex(el => !Object.prototype.hasOwnProperty.call(el, 'delta'));
            if (currentId) {
              currentInfo.connectingTimes[currentId].delta = (Date.now() / 1000) - currentInfo.connectingTimes[currentId].startTime;
              currentInfo.connectingTimes = currentInfo.connectingTimes.slice(0, 5);
            }
          }

          if (prefs['chrome.desktop_notification'] === true) {
            showConnectionNotification(data.newstate);
          }

          currentInfo.ratingData = rating.updateRatingDataFromState(currentInfo.ratingData, data);
          chrome.storage.sync.set({ 'rating': currentInfo.ratingData });
        }

        if (!badStates.includes(currentInfo.state)) {
          currentInfo.state = (data.newstate === 'activated') ? 'ready' : data.newstate;
          if (data.newstate === 'activated') { // initialize all value when activated app.
            setRatingConfig();
          }
        }
        break;
      case 'MessagesUpdated':
        com.getMessages();
        break;
      case 'SpeedTestProgress':
        currentInfo.progress = parseInt(data.progress, 10) * 100;
        break;
      case 'ConnectionProgress':
        currentInfo.state = 'connecting';
        currentInfo.selectedLocation = locationPicker.getLocationByName(allLocationsList, utils.localizeLocation(data.current_location));
        if (currentInfo.smartLocation.id === currentInfo.selectedLocation.id) {
          currentInfo.selectedLocation.is_smart_location = true;
        }

        currentInfo.selectedLocation.is_country = false; // ConnectionProgressData.current_location always contains a cluster, not a country
        currentInfo.progress = data.progress;
        break;
      case 'SelectedLocationChanged':
        if (data.is_country === true) {
          currentInfo.selectedLocation = {
            name: utils.localizeLocation(data.name),
            id: 0,
            is_country: true,
            is_smart_location: false,
          };
        } else {
          currentInfo.selectedLocation = locationPicker.getLocationByName(allLocationsList, utils.localizeLocation(data.name));
          if (currentInfo.smartLocation.id === currentInfo.selectedLocation.id) {
            currentInfo.selectedLocation.is_smart_location = true;
          }
        }
        break;
      default:
        break;
    }

    // on fresh installs this property does not exist
    if ((typeof currentInfo.selectedLocation !== 'undefined') && (currentInfo.selectedLocation.name !== '') &&
      (typeof locationsData[currentInfo.selectedLocation.name] === 'object')) {

      currentInfo.selectedLocation.country_code = locationsData[currentInfo.selectedLocation.name].country_code;
      currentInfo.selectedLocation.coords = utils.calculateRandomPosition(locationsData[currentInfo.selectedLocation.name].coords); // randomise the coords
      currentInfo.selectedLocation.id = locationsData[currentInfo.selectedLocation.name].id;
    }

    chrome.runtime.sendMessage({ state: true, data: currentInfo });
    chrome.storage.local.set({ 'currentInfo': currentInfo });
    setWebrtcOption();
  }

  // wait for currentInfo to be defined
  function waitForCurrentInfo() {
    if ((typeof currentInfo.selectedLocation !== 'undefined') && (currentInfo.selectedLocation.name !== '') && (Array.isArray(currentInfo.recent_locations_ids))) {
      if ((prefs['chrome.auto_connect'] === true) && (currentInfo.state === 'ready') && (currentInfo.recent_locations_ids.length > 0)) {
        let lastLocation = locationPicker.getLocationById(allLocationsList, currentInfo.recent_locations_ids[0]);
        com.selectLocation(lastLocation);
        com.connectToLocation(lastLocation, { isAutoConnect: true });
      }
    } else {
      setTimeout(waitForCurrentInfo, 50);
    }
  }

  function updatePopupState(dontGetPrefs) {
    if (com.isInstalled() === false) {
      if (currentInfo.state !== 'BAD_OS_VERSION') {
        currentInfo.state = 'NOT_INSTALLED';
        window.top.postMessage({ method: 'resetBackoff' }, '*');
      }
      updateIcon(ICONS.error);
    } else {
      if (dontGetPrefs !== true) {
        com.getEnginePreferences();
      }
      if ((typeof currentInfo.selectedLocation !== 'undefined') && (currentInfo.selectedLocation.name !== '')) {
        currentInfo.selectedLocation.country_code = locationsData[currentInfo.selectedLocation.name].country_code;
      }
      currentInfo.recommendedLocationsList = recommendedLocationsList;
      currentInfo.allLocationsList = allLocationsList;
    }
    chrome.runtime.sendMessage({ state: true, data: currentInfo });
  }

  function checkVersion(data) {
    if (typeof data.app_version !== 'undefined') {
      // check minimum app version to run the extension
      if (typeof MIN_APP_VERSION[currentInfo.os] !== 'undefined' && utils.versionCompare(data.app_version, MIN_APP_VERSION[currentInfo.os]) < 0) {
        currentInfo.state = 'BAD_APP_VERSION';
      }

      currentInfo.app.version = data.app_version;
    }
  }

  function filterByProtocol(loc) {
    return ((currentInfo.preferences.preferred_protocol.toLowerCase() === 'auto') || (loc.protocols.includes(currentInfo.preferences.preferred_protocol.toLowerCase())));
  }

  function showUpdateNotification(currentVersion) {
    let options = {
      type: 'basic',
      title: localize('notification_extension_update_title'),
      message: localize('notification_extension_update_message').replace('%VERSION%', currentVersion),
      iconUrl: '/images/toolbar-icon-128.png',
    };
    chrome.notifications.create(null, options, id => {
      notificationUpdateId = id;
      mockData.prevNotificationId = id;
    });
  }

  // For Firefox, when open new browser window, badge background color become red.
  // This issue is related to Firefox itself.
  // So we need to update extension app state including badge color when open a new window.
  if (myBrowser.name === 'Firefox') {
    chrome.windows.onCreated.addListener(function () {
      com.getStatus();
    });
  }

  function sendData(category) {
    if (!localStorage.getItem('uuid')) {
      localStorage.setItem('uuid', uuidv4()); // generate random uuid
    }
    // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#tid
    const fetchOptions = {
      method: 'POST',
      body: new URLSearchParams({
        'v': 1,
        'tid': (__IS_BETA__ || __IS_ALPHA__ || process.env.NODE_ENV === 'development') ? 'UA-29468734-12' : 'UA-29468734-11',
        'cid': localStorage.getItem('uuid'),
        'aip': 1,
        't': 'event',
        'ec': category,
      }),
    };
    fetch('https://www.google-analytics.com/collect', fetchOptions);
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.mock && process.env.NODE_ENV === 'development') {
      console.log('Got mock', message);
      switch (message.category) {
        case 'connection':
          if (mockData.prevState === message.data) {
            return;
          }
          chrome.notifications.clear(mockData.prevNotificationId);
          showConnectionNotification(message.data, (id) => {
            mockData.prevNotificationId = id;
            mockData.prevState = message.data;
          });
          break;
        case 'locale':
          if (currentInfo.locale === message.locale) {
            return;
          }
          utils.setLanguage(message.locale).then(langObj => {
            currentInfo.localizedStrings = langObj.strings;
            currentInfo.locale = langObj.locale;
            chrome.runtime.sendMessage({ state: true, data: currentInfo });
          });
          break;
        case 'update':
          chrome.notifications.clear(mockData.prevNotificationId);
          showUpdateNotification(chrome.runtime.getManifest().version);
          break;
        default:
          break;
      }
    } else if (message.customLocation) {
      com.openLocationPicker();
    } else if (message.getLocations) {
      com.getLocationList();
    } else if (message.disconnect) {
      com.disconnect();
    } else if (message.getConnectionLogs) {
      com.getConnectionLogs();
    } else if (message.getMessages) {
      if (!badStates.includes(currentInfo.state)) {
        com.getMessages();
      }
    } else if (message.finishedWelcome) {
      currentInfo.showWelcome = false;
      updatePopupState();
    } else if (message.getState) {
      com.getStatus(); // check if there are app updates
      updatePopupState();
    } else if (message.connectToSelectedLocation) {
      if (currentInfo.state === 'ready' || currentInfo.state === 'connection_error') {
        com.selectLocation(currentInfo.selectedLocation);
        com.connectToLocation(currentInfo.selectedLocation);
      } else if (currentInfo.state === 'connected') {
        com.connectToLocation(currentInfo.selectedLocation, { connectWhileConnected: true });
      }
    } else if (message.reconnect) {
      com.retryConnect();
    } else if (message.reset) {
      com.reset();
    } else if (message.resetState) {
      com.resetState();
    } else if (message.cancelConnection) {
      com.disconnect();
    } else if (message.updateSelectedLocation) {
      currentInfo.selectedLocation = message.selectedLocation;
      if (currentInfo.state === 'ready' || currentInfo.state === 'connection_error') {
        // Notify expressVPN service of new location selected
        com.selectLocation(currentInfo.selectedLocation);
      }
    } else if (message.openApp) {
      // if the app is not activated, then the extension is most likely not connected to the helper at this time
      if (currentInfo.state === 'not_activated') {
        com.connect();
      }
      com.openApp();
    } else if (message.cancelSpeedTest) {
      com.cancelSpeedTest();
    } else if (message.openChromePreferences) {
      com.openChromePreferences();
    } else if (message.openPreferences) {
      com.openPreferences();
    } else if (message.updateExtensionSettings) {
      updateExtensionSettings();
    } else if (message.proceedAnyway) {
      whiteList.push({ 'tabId': message.tabId, 'url': message.url });
      chrome.tabs.update(message.tabId, { url: message.url });
    } else if (message.telemetry) {
      if (prefs.helpImprove === true && !localStorage2.get('GA_' + message.category)) {
        sendData(message.category);
        const today = new Date();
        localStorage2.set('GA_' + message.category, true, (new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)));
      }
    }
  });

  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
      currentInfo.showWelcome = true;
    } else if (details.reason === 'update' && prefs['chrome.desktop_notification'] === true) {
      const rx = /^(\d{1,2}.\d{1,2})/g; // Only show notification for major and minor update
      const currentVersion = chrome.runtime.getManifest().version;
      const currentVersionMatches = currentVersion.match(rx);
      const previousVersionMatches = details.previousVersion.match(rx);

      if (currentVersionMatches.length === 1 && previousVersionMatches.length === 1 && previousVersionMatches[0] !== currentVersionMatches[0]) {
        setTimeout(() => { // Allow the strings used in localize() to be created
          showUpdateNotification(currentVersion);
          if (!localStorage.getItem('hasSeenHelpImproveScreen')) {
            currentInfo.showWelcome = true;
            currentInfo.forceShowHelpImproveScreen = true;
          }
        }, 100);
      }
    }
  });

  chrome.notifications.onClicked.addListener(notificationId => {
    switch (notificationId) {
      case notificationUpdateId:
        chrome.tabs.create({ url: `${currentInfo.website_url}/support/release-notes/browser-extension/` });
        break;
      default:
        break;
    }
  });

  chrome.storage.onChanged.addListener(changes => {
    if (changes.rating) {
      setRatingConfig();
    }
  });

  chrome.webRequest.onBeforeRequest.addListener(details => {
    if (
      details.method === 'GET'
      && currentInfo.preferences.traffic_guard_level
      && ['connecting', 'reconnecting', 'connection_error'].includes(currentInfo.state)
      && myBrowser.name !== 'Firefox'
    ) {
      return { redirectUrl: `${chrome.runtime.getURL('/html/networkLock.html')}?nonce=${localStorage.getItem('nonce')}&url=${details.url}` };
    }
  }, {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame'],
  }, ['blocking']);

  // message listener for background communication
  window.addEventListener('message', (event) => {
    if (event.origin !== chrome.extension.getURL('/').slice(0, -1)) {
      // console.error('Bad origin', event.origin);
      return false;
    }
    const message = event.data;
    switch (message.method) {
      case 'updateLocationsData':
        recommendedLocationsList = utils.sortAndGroupBy(message.data.recommended || [], 'country', filterByProtocol);
        allLocationsList = utils.sortAndGroupBy(message.data.all || [], 'region', filterByProtocol);
        for (let region in allLocationsList) {
          if (region) {
            allLocationsList[region] = utils.sortAndGroupBy(allLocationsList[region], 'country');
          }
        }

        if ((typeof currentInfo.selectedLocation === 'undefined') && utils.isNullOrEmpty(currentInfo.smartLocation.name)) {
          const [firstRecommendedLocation] = message.data.recommended;
          currentInfo.selectedLocation = firstRecommendedLocation;
          com.selectLocation(currentInfo.selectedLocation);
        }

        message.data.all.forEach((location) => {
          locationsData[location.name] = {};
          locationsData[location.name].country_code = location.country_code;
          if ((typeof coords[location.country] === 'object') && (typeof coords[location.country][location.name] === 'object')) {
            locationsData[location.name].coords = coords[location.country][location.name];
          } else if (typeof coords[location.country] === 'object') {
            locationsData[location.name].coords = coords[location.country].default;
          } else {
            locationsData[location.name].coords = { lat: 38.883333, lon: -77.000 };
          }
          locationsData[location.name].id = location.id;

          // Might not be needed anymore
          locationsData[location.country] = {};
          locationsData[location.country].country_code = location.country_code;
          locationsData[location.country].id = location.id;
          locationsData[location.country].coords = (typeof coords[location.country] === 'object') ? coords[location.country].default : { lat: 38.883333, lon: -77.000 };
        });
        if ((typeof currentInfo.selectedLocation !== 'undefined') && (currentInfo.selectedLocation.name !== '')) {
          currentInfo.selectedLocation.coords = locationsData[currentInfo.selectedLocation.name].coords;
          chrome.storage.local.set({ 'currentInfo': currentInfo });
        }

        // Smartlocation object might not have a country_code on rare situations
        if (currentInfo.smartLocation.name && !currentInfo.smartLocation.country_code) {
          currentInfo.smartLocation.country_code = locationsData[currentInfo.smartLocation.name].country_code;
        }

        if (!currentInfo.selectedLocation.id && !currentInfo.selectedLocation.is_country) {
          currentInfo.selectedLocation = locationPicker.getLocationByName(allLocationsList, currentInfo.selectedLocation.name);
          if (currentInfo.smartLocation.id === currentInfo.selectedLocation.id) {
            currentInfo.selectedLocation.is_smart_location = true;
          }
        }

        currentInfo.recent_locations_ids = message.data.recent_locations_ids; // eslint-disable-line camelcase

        if ((typeof currentInfo.selectedLocation !== 'undefined') && !currentInfo.selectedLocation.id) {
          currentInfo.selectedLocation.id = locationsData[currentInfo.selectedLocation.name].id;
        }

        updatePopupState();
        break;
      case 'updateStatus':
        if (message.name === 'ServiceStateChanged' && message.data && message.data.newstate === 'connected') {
          com.getStatus();
        }
        updateStatus(message.name, message.data);
        break;
      case 'currentState':
        currentInfo.selectedLocation = message.currentInfo.selectedLocation;
        currentInfo.app.latest_version = message.currentInfo.app.latest_version;
        currentInfo.app.latest_version_url = message.currentInfo.app.latest_version_url;
        currentInfo.subscription = message.currentInfo.subscription;
        if (currentInfo.subscription) {
          currentInfo.ratingData.isRegularUser = utils.isRegularUser(currentInfo.subscription);
        }
        currentInfo.website_url = message.currentInfo.website_url || currentInfo.website_url;
        currentInfo.raw = message.currentInfo.raw;
        if (currentInfo.raw.state === 'connected' && currentInfo.raw.current_location && currentInfo.raw.connection) {
          currentInfo.previousConnection = { id: currentInfo.raw.current_location.id, protocol: currentInfo.raw.connection.protocol };
        }

        updateStatus('ServiceStateChanged', { newstate: message.currentInfo.state });
        break;
      case 'connectedToHelper':
        com.getStatus();
        com.getEnginePreferences();
        com.getLocationList();
        com.getMessages();

        // check if app version is compatible with the extension
        if (Object.keys(message.data).length > 0) {
          checkVersion(message.data);
        }

        // wait for currentInfo to be defined
        waitForCurrentInfo();
        break;
      case 'updateSmartLocation':
        if (typeof message.data === 'object') {
          currentInfo.smartLocation = Object.assign({}, message.data, { is_smart_location: true, is_country: false });
          // on fresh installs this property does not exist
          if (typeof currentInfo.selectedLocation === 'undefined') {
            currentInfo.selectedLocation = currentInfo.smartLocation;
            com.selectLocation(currentInfo.selectedLocation);
          }
        }
        break;
      case 'updatePreferences':
        currentInfo.preferences = message.data;
        // check if we have a smart location (not always true after activating)
        if (((typeof currentInfo.smartLocation === 'undefined') || utils.isNullOrEmpty(currentInfo.smartLocation.name)) && (typeof currentInfo.recommendedList !== 'undefined')) {
          let tmpSmartLocation = currentInfo.recommendedList.find((location) => (currentInfo.preferences.preferred_protocol.toLowerCase() === 'auto') ||
            (location.protocols.includes(currentInfo.preferences.preferred_protocol.toLowerCase())));
          currentInfo.smartLocation = {
            name: tmpSmartLocation.name,
            id: tmpSmartLocation.id,
            country_code: tmpSmartLocation.country_code,
          };
        }
        if (allLocationsList.length > 0 && !utils.isNullOrEmpty(currentInfo.selectedLocation.name)) {
          let selectedLocationObj = locationPicker.getLocationByName(allLocationsList, currentInfo.selectedLocation.name);
          // if it can't find it, it means it's using other protocol

          if ((!selectedLocationObj && !currentInfo.selectedLocation.is_country) || (currentInfo.preferences.preferred_protocol.toLowerCase() !== 'auto' &&
            selectedLocationObj.protocols.includes(currentInfo.preferences.preferred_protocol.toLowerCase()))) {
            currentInfo.selectedLocation = {
              name: currentInfo.smartLocation.name,
              id: currentInfo.smartLocation.id,
              country_code: currentInfo.smartLocation.country_code,
              is_smart_location: true,
              is_country: false,
            };
          }
        }
        if (Object.keys(locationsData).length > 0) {
          updatePopupState(true);
        }
        break;
      default:
        break;
    }
  }, false);

  const sys = UAParser(window.navigator.userAgent);
  currentInfo.os = bk.groupOsName(sys.os.name.split(' ')[0]).toUpperCase();
  currentInfo.system.os = sys.os;
  currentInfo.system.browser = sys.browser;
  const errorState = bk.checkPlatformCompatibility(currentInfo);

  // Setup listeners depending on current preferences
  chrome.storage.local.get('prefs', (storage) => {
    if (typeof storage.prefs === 'object') {
      prefs = Object.assign({}, prefs, storage.prefs); // make sure new options are added
    }
  });

  if (errorState) {
    currentInfo.state = errorState;
  } else {
    updateExtensionSettings(true);
    setRatingConfig();
    com.connect();
  }
}());
