/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import UAParser from 'ua-parser-js';
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
  const checkPlatformCompatibility = (currentInfo) => {
    const systemInfo = UAParser(window.navigator.userAgent);
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

  // removes username and password from the url so it can be safely checked (EXP-01-005)
  function standardizeUrl(url) {
    let safeUrl;
    try {
      let urlObj = new URL(url);
      safeUrl = urlObj.origin + urlObj.pathname + urlObj.search; // The fragment identifier is removed but it's ok since we don't need it anyway;
    } catch (err) {
      safeUrl = url; // should never happen, either way, AdBlock parsing library will ignore malformed urls
    }
    return safeUrl;
  }


  return {
    checkPlatformCompatibility, groupOsName, standardizeUrl,
  };
}());

export default backgroundHelper;
