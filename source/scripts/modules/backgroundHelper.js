/*
ExpressVPN Browser Extension:
Copyright 2017-2023 Express VPN International Ltd
Licensed GPL v2
*/
import UAParser from 'ua-parser-js';
import * as chromeStorage from './chromeStorage';
import * as utils from './utils';

const minimumOSRequirements = [
  {
    name: 'Mac OS',
    minimumVersion: '10.10',
  },
  {
    name: 'Windows',
    minimumVersion: '7',
  },
  {
    name: 'Linux',
    minimumVersion: '',
  },
];

// quick way of grouping all those Linux flavors that the UAParser library returns
const groupOsName = (os) => {
  const linuxFlavors = [
    'Fedora', 'Gentoo', 'Mandriva', 'Mint', 'Redhat',
    'Slackware', 'Suse', 'Ubuntu',
  ];

  return (linuxFlavors.findIndex(item => os.toLowerCase() === item.toLowerCase()) >= 0) ? 'Linux'
    : os;
};

// Add background testable methods here
const backgroundHelper = (function () {
  /**
   *
   * @param {string} state
   * @param {string} myBrowserName
   * @param {boolean} trafficGuardLevel
   * @returns
   */
  const toggleNetworkLockGuard = async (state, myBrowserName, trafficGuardLevel) => {
    if (!trafficGuardLevel || myBrowserName === 'Firefox') {
        return;
    }
    const nonce = await chromeStorage.get('nonce');
    // Every time we add the redirect rule, we must delete any existing rule with the same ID to avoid conflicts
    const RULE_ID = 1;
    const ruleUpdateOptions = { removeRuleIds: [RULE_ID] };
    const rule = {
      id: RULE_ID,
      priority: 1, // High priority
      action: {
          type: 'redirect',
          redirect: {
              regexSubstitution:
                  chrome.runtime.getURL('/html/networkLock.html') + `#${nonce},\\0`, // We're adding the originally requested URL after the hash. Query parameters can break the regex replacement
          },
      },
      condition: {
          regexFilter: '^(http[s]?://.*)$', // capture all http/s requests
          resourceTypes: ['main_frame'], // just interested in the main frame
          requestMethods: ['get'], // just interested in GET request to avoid breaking form submissions
      },
    };

    if (['connecting', 'reconnecting', 'connection_error'].includes(state)) {
      ruleUpdateOptions.addRules = [rule];
    }
    chrome.declarativeNetRequest.updateDynamicRules(ruleUpdateOptions, () => {
      if (chrome.runtime.lastError) {
        console.error('Error updating redirect rule:', chrome.runtime.lastError);
      } else {
        console.log('Redirect rule updated successfully');
      }
    });
  };

  const checkPlatformCompatibility = () => {
    const systemInfo = UAParser(navigator.userAgent);
    const platform = systemInfo.os;
    const platformVersion = (platform.name === 'Windows' && platform.version === 'XP') ? '5.1' : platform.version;
    // so we know which update link to show in the popup

    for (let i = 0; i < minimumOSRequirements.length; i += 1) {
      let os = minimumOSRequirements[i];
      if (groupOsName(platform.name) === os.name) {
        if (os.minimumVersion === '' ||
          utils.versionCompare(platformVersion, os.minimumVersion) >= 0) {
          return;
        }
        return 'BAD_OS_VERSION';
      }
    }
  };

  function setWebrtcOption(isWebRTCPrefEnabled, state) {
    // checking if the current browser supports chrome.privacy
    if (typeof chrome.privacy === 'undefined') {
      return;
    }
    const enableStates = ['connecting', 'reconnecting', 'connected', 'disconnecting', 'connection_error'];
    const isEnabled = (isWebRTCPrefEnabled && (enableStates.includes(state)));
    // update webRTCIPHandlingPolicy setting
    // first get the setting access permission and usage details
    chrome.privacy.network.webRTCIPHandlingPolicy.get({}, (details) => {
      // check if we can modify it
      if ((details) && ((details.levelOfControl === 'controllable_by_this_extension') || (details.levelOfControl === 'controlled_by_this_extension'))) {
        const settingValue = isEnabled ? 'disable_non_proxied_udp' : 'default';
        chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: settingValue }, () => {
          // check if we managed to change the setting successfuly.
          // Not sure when this can ever fail if we passed the 'controllable_by_this_extension' check
          if (chrome.runtime.lastError) {
            console.error('[Not able to set webRTCIPHandlingPolicy]', chrome.runtime.lastError);
          }
        });
      }
    });
    // update peerConnectionEnabled setting (required on Firefox to fully block WebRTC)
    // eslint-disable-next-line no-unused-expressions
    // @ts-ignore
    chrome.privacy.network.peerConnectionEnabled?.get({}, (details) => {
      // check if we can modify it
      if ((details) && ((details.levelOfControl === 'controllable_by_this_extension') || (details.levelOfControl === 'controlled_by_this_extension'))) {
        const settingValue = !isEnabled;
        // @ts-ignore
        chrome.privacy.network.peerConnectionEnabled.set({ value: settingValue }, () => {
          // check if we managed to change the setting successfuly
          if (chrome.runtime.lastError) {
            console.error('[Not able to set peerConnectionEnabled]', chrome.runtime.lastError);
          }
        });
      }
    });
  }

  function updateIcon(newIcon) {
    chrome.action.setBadgeText({ text: newIcon.text });
    chrome.action.setBadgeBackgroundColor({ color: newIcon.color });
  };


  return {
    checkPlatformCompatibility, groupOsName, toggleNetworkLockGuard, setWebrtcOption, updateIcon
  };
}());

export default backgroundHelper;