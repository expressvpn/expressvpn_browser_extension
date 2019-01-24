/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import 'babel-core/register';
import 'babel-polyfill';
import 'chromereload/devonly';
import UAParser from 'ua-parser-js';

import com from './modules/nativeCommunication';
import utils from './modules/utils';
import rating from './modules/rating';
import coords from './modules/locations.json';
import bk from './modules/backgroundHelper';
import locationPicker from './modules/locationPicker';

const { ICONS } = utils;
const badStates = ['BAD_OS', 'BAD_OS_VERSION', 'BAD_APP_VERSION', 'BAD_BROWSER'];

const MIN_APP_VERSION = {
  MAC: {
    Chrome: '6.4.2',
    Firefox: '6.4.3',
  },
  WINDOWS: {
    Chrome: '6.2.0',
    Firefox: '6.2.0',
  },
  LINUX: {
    Chrome: '1.3.0',
    Chromium: '1.3.2',
    Firefox: '1.3.0',
  },
};

(function () {
  let { currentInfo } = utils;
  let locationsData = {};
  let recommendedLocationsList = [];
  let allLocationsList = [];
  let prefs = utils.defaultPreferences;
  let ratingData = rating.defaultRatingData;
  let myBrowser = UAParser(window.navigator.userAgent).browser;
  let whiteList = [];

  console.info('Loaded!', new Date());

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

  function updateExtensionSettings() {
    chrome.storage.local.get('prefs', (storage) => {
      if (typeof storage.prefs === 'object') {
        prefs = Object.assign({}, prefs, storage.prefs); // make sure new options are added
      }
      chrome.storage.local.set({ prefs });
      utils.setLanguage(prefs.language);
      setWebrtcOption();
    });
  }

  function setRatingConfig() {
    chrome.storage.local.get('rating', (storage) => {
      if (typeof storage.rating === 'object') {
        ratingData = Object.assign({}, ratingData, storage.rating);
      }
      ratingData.activatedDate = (ratingData.activatedDate === 0) ? Date.now() / 1000 : ratingData.activatedDate;
      ratingData.lastReviewDate = (ratingData.lastReviewDate === 0) ? ratingData.activatedDate : ratingData.lastReviewDate;
      ratingData.successfulConnections = (ratingData.successfulConnections > 0) ? ratingData.successfulConnections : 0;
      if (ratingData.isUserEligible === null) {
        ratingData.isUserEligible = (Math.round(100 * Math.random()) <= 10);
      }
      rating.updateSubscriberPeriodicity(prefs.ratingPeriodicity);
      chrome.alarms.create('checkIfSubscriber', { periodInMinutes: prefs.ratingPeriodicity / 60 });
      chrome.storage.local.set({ 'rating': ratingData });
    });
  }

  function updateIcon(newIcon) {
    chrome.browserAction.setBadgeText({ text: newIcon.text });
    chrome.browserAction.setBadgeBackgroundColor({ color: newIcon.color });
  }

  function localize(localeKey) {
    return utils.localize(localeKey);
  }

  function showConnectionNotification(state) {
    let options = {
      type: 'basic',
      title: '',
      message: '',
      iconUrl: '/images/' + state + '.png',
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
        break;
      default:
        options.title = '';
        break;
    }
    if (options.title !== '') {
      chrome.notifications.create(options, null);
    }
  }

  function updateStatus(name, data) {
    switch (name) {
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

        if (ratingData.lastState !== data.newstate) {
          if (prefs['chrome.desktop_notification'] === true) {
            showConnectionNotification(data.newstate);
          }
          ratingData = rating.updateRatingDataFromState(ratingData, data.newstate);
          chrome.storage.local.set({ 'rating': ratingData });
        }
        if (!badStates.includes(currentInfo.state)) {
          currentInfo.state = (data.newstate === 'activated') ? 'ready' : data.newstate;
          if (data.newstate === 'activated') { // initialize all value when activated app.
            chrome.storage.local.set({ 'rating': rating.defaultRatingData });
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
        updateIcon(ICONS.connecting);
        currentInfo.state = 'connecting';
        currentInfo.selectedLocation = locationPicker.getLocationByName(allLocationsList, data.current_location);
        currentInfo.selectedLocation.is_country = false; // ConnectionProgressData.current_location always contains a cluster, not a country
        currentInfo.progress = data.progress;
        break;
      case 'SelectedLocationChanged':
        if (data.is_country === true) {
          currentInfo.selectedLocation = {
            name: data.name,
            id: 0,
            is_country: true,
            is_smart_location: false,
          };
        } else {
          currentInfo.selectedLocation = locationPicker.getLocationByName(allLocationsList, data.name);
          if (currentInfo.smartLocation.id === currentInfo.selectedLocation.id) {
            currentInfo.selectedLocation.is_smart_location = true;
          }
        }
        break;
      case 'VPNClustersUpdated':
        com.getLocationList();
        break;
      default:
        break;
    }

    // on fresh installs this property does not exist
    if ((typeof currentInfo.selectedLocation !== 'undefined') && (currentInfo.selectedLocation.name !== '') &&
      (typeof locationsData[currentInfo.selectedLocation.name] === 'object')) {
      currentInfo.selectedLocation.country_code = locationsData[currentInfo.selectedLocation.name].country_code;
      currentInfo.selectedLocation.coords = utils.calculateRandomPosition(locationsData[currentInfo.selectedLocation.name].coords); // randomise the coords
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
        com.connectToLocation(lastLocation);
      }
    } else {
      setTimeout(waitForCurrentInfo, 50);
    }
  }

  function updatePopupState(dontGetPrefs) {
    if (com.isInstalled() === false) {
      if ((currentInfo.state !== 'BAD_OS_VERSION') && (currentInfo.state !== 'BAD_OS')) {
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
      if (typeof MIN_APP_VERSION[currentInfo.os] === 'undefined' || typeof MIN_APP_VERSION[currentInfo.os][myBrowser.name] === 'undefined' ||
          utils.versionCompare(data.app_version, MIN_APP_VERSION[currentInfo.os][myBrowser.name]) < 0) {
        currentInfo.state = 'BAD_APP_VERSION';
      } else {
        currentInfo.state = ''; // overwrite a possible BAD_APP_VERSION state
      }

      currentInfo.app.version = data.app_version;
    }
  }

  function filterByProtocol(loc) {
    return ((currentInfo.preferences.preferred_protocol.toLowerCase() === 'auto') || (loc.protocols.includes(currentInfo.preferences.preferred_protocol.toLowerCase())));
  }

  // For Firefox, when open new browser window, badge background color become red.
  // This issue is related to Firefox itself.
  // So we need to update extension app state including badge color when open a new window.
  if (myBrowser.name === 'Firefox') {
    chrome.windows.onCreated.addListener(function () {
      com.getStatus();
    });
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.debug("message", message);
    if (message.customLocation) {
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
    } else if (message.getState) {
      com.getStatus(); // check if there are app updates
      updatePopupState();
    } else if (message.connectToSelectedLocation) {
      com.selectLocation(currentInfo.selectedLocation);
      com.connectToLocation(currentInfo.selectedLocation);
    } else if (message.reconnect) {
      com.retryConnect();
    } else if (message.reset) {
      com.reset();
    } else if (message.resetState) {
      com.resetState();
    } else if (message.cancelConnection) {
      com.disconnect();
    } else if (message.updateSelectedLocation) {
      // Notify expressVPN service of new location selected
      currentInfo.selectedLocation = message.selectedLocation;
      com.selectLocation(currentInfo.selectedLocation);
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
    } else if (message.updateReviewDate) {
      ratingData.lastReviewDate = Date.now() / 1000;
      chrome.storage.local.set({ 'rating': ratingData });
    } else if (message.proceedAnyway) {
      whiteList.push({ 'tabId': message.tabId, 'url': message.url });
      chrome.tabs.update(message.tabId, { url: message.url });
    }
  });

  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (changes.prefs && changes.prefs.newValue && changes.prefs.oldValue) {
      if (changes.prefs.newValue.ratingPeriodicity !== changes.prefs.oldValue.ratingPeriodicity) {
        setRatingConfig();
      }
    }
  });

  chrome.alarms.onAlarm.addListener(alarm => {
    switch (alarm.name) {
      case 'checkIfSubscriber':
        rating.checkIfSubscriber(ratingData);
        break;
      default:
        break;
    }
  });

  chrome.runtime.setUninstallURL('https://expressv.typeform.com/to/LjmI4J');

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

          // Might not be needed anymore
          locationsData[location.country] = {};
          locationsData[location.country].country_code = location.country_code;
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

        updatePopupState();
        break;
      case 'updateStatus':
        updateStatus(message.name, message.data);
        break;
      case 'currentState':
        currentInfo.selectedLocation = message.currentInfo.selectedLocation;
        currentInfo.app.latest_version = message.currentInfo.app.latest_version;
        currentInfo.app.latest_version_url = message.currentInfo.app.latest_version_url;
        currentInfo.subscription = message.currentInfo.subscription;
        if (currentInfo.subscription) {
          ratingData.isRegularUser = utils.isRegularUser(currentInfo.subscription);
        }
        currentInfo.website_url = message.currentInfo.website_url || currentInfo.website_url;
        updateStatus('ServiceStateChanged', { newstate: message.currentInfo.state });
        break;
      case 'connectedToHelper':
        com.getStatus();
        com.getEnginePreferences();
        com.getLocationList();

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

  currentInfo.os = bk.groupOsName(UAParser(window.navigator.userAgent).os.name.split(' ')[0]).toUpperCase();
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
    updateExtensionSettings();
    setRatingConfig();
    com.connect();
  }
}());
