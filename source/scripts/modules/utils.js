/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
const utils = (function () {
  const currentInfo = {
    state: 'ready',
    selectedLocation: {
      name: '',
      country_code: '',
      is_smart_location: false,
      is_country: false,
      id: 0,
    },
    smartLocation: {
      name: '',
      country_code: '',
      id: 0,
    },
    recommendedLocationsList: [],
    allLocationsList: [],
    app: {
      version: '',
      latest_version: '',
      latest_version_url: '',
    },
    subscription: {},
    website_url: 'https://www.exp3links3.net',
  };

  const defaultPreferences = {
    'chrome.auto_connect': false,
    'chrome.prevent_webrtc_leaks': true,
    'chrome.desktop_notification': true,
    'httpsEverywhere': true,
    'httpsPeriodicity': 86400,
    'ratingPeriodicity': 86400,
    'language': '',
    'hideLocation': true,
  };

  const ICONS = {
    connected: {
      text: '✓',
      color: '#45B649',
    },
    connecting: {
      text: '···',
      color: '#F5A827',
    },
    default: {
      text: '',
      color: [0, 0, 0, 0], // transparent
    },
    error: {
      text: '✕',
      color: '#999999',
    },
  };

  // based on C# String.IsNullOrEmpty()
  const isNullOrEmpty = str => (str === null || typeof str === 'undefined' || str === '');

  // stringent encodeURIComponent
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  const fixedEncodeURIComponent = str => encodeURIComponent(str).replace(
    /[!'()*]/g,
    c => `%${c.charCodeAt(0).toString(16)}`,
  );

  /**
   * Capitalizes the string
  */
  const capitalize = str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

  // Returns a random integer between two values, inclusive
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  const getRandomIntInclusive = (min, max) => {
    const cMin = Math.ceil(min);
    const fMax = Math.floor(max);
    return Math.floor(Math.random() * (fMax - cMin + 1)) + cMin;
  };

  /*
    returns a random (close) position given the current one
  */
  const calculateRandomPosition = (srcCoords) => {
    if (typeof srcCoords !== 'object') {
      return srcCoords;
    }
    const DEGREES_TO_RADIANS = Math.PI / 180.0;
    const RADIANS_TO_DEGREES = 180.0 / Math.PI;
    const EARTH_RADIUS = 6378137.0; // https://en.wikipedia.org/wiki/World_Geodetic_System#Main_parameters

    // random bearing and distance
    const bearing = getRandomIntInclusive(-180, 180); // from -180° to 180°
    const distance = getRandomIntInclusive(100, 1000); // distance in metres from 100m to 1000m

    const latA = srcCoords.lat * DEGREES_TO_RADIANS;
    const lonA = srcCoords.lon * DEGREES_TO_RADIANS;
    const angularDistance = distance / EARTH_RADIUS;
    const trueCourse = bearing * DEGREES_TO_RADIANS;

    const lat = Math.asin(Math.sin(latA) * Math.cos(angularDistance) +
      Math.cos(latA) * Math.sin(angularDistance) * Math.cos(trueCourse));

    const dlon = Math.atan2(
      Math.sin(trueCourse) * Math.sin(angularDistance) * Math.cos(latA),
      Math.cos(angularDistance) - Math.sin(latA) * Math.sin(lat),
    );

    const lon = ((lonA + dlon + Math.PI) % (Math.PI * 2)) - Math.PI;

    return {
      lat: lat * RADIANS_TO_DEGREES,
      lon: lon * RADIANS_TO_DEGREES,
    };
  };

  /**
   * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
   *
   * This function was born in http://stackoverflow.com/a/6832721.
   *
   * @param {string} v1 The first version to be compared.
   * @param {string} v2 The second version to be compared.
   * @param {object} [options] Optional flags that affect comparison behavior:
   * <ul>
   *     <li>
   *         <tt>lexicographical: true</tt> compares each part of the version strings lexicographically instead of
   *         naturally; this allows suffixes such as "b" or "dev" but will cause "1.10" to be considered smaller than
   *         "1.2".
   *     </li>
   *     <li>
   *         <tt>zeroExtend: true</tt> changes the result if one version string has less parts than the other. In
   *         this case the shorter string will be padded with "zero" parts instead of being considered smaller.
   *     </li>
   * </ul>
   * @returns {number|NaN}
   * <ul>
   *    <li>0 if the versions are equal</li>
   *    <li>a negative integer iff v1 < v2</li>
   *    <li>a positive integer iff v1 > v2</li>
   *    <li>NaN if either version string is in the wrong format</li>
   * </ul>
   *
   */
  const versionCompare = (v1, v2, options) => {
    const lexicographical = options && options.lexicographical;
    const zeroExtend = options && options.zeroExtend;
    if (!v2) {
      v2 = v1; // eslint-disable-line no-param-reassign
    }
    let v1parts = v1.split('.');
    let v2parts = v2.split('.');

    const isValidPart = x => (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
      return NaN;
    }

    if (zeroExtend) {
      while (v1parts.length < v2parts.length) v1parts.push('0');
      while (v2parts.length < v1parts.length) v2parts.push('0');
    }

    if (!lexicographical) {
      v1parts = v1parts.map(Number);
      v2parts = v2parts.map(Number);
    }

    for (let i = 0; i < v1parts.length; i += 1) {
      if (v2parts.length === i) {
        return 1;
      }

      if (v1parts[i] > v2parts[i]) {
        return 1;
      } else if (v1parts[i] !== v2parts[i]) {
        return -1;
      }
    }

    if (v1parts.length !== v2parts.length) {
      return -1;
    }

    return 0;
  };

  const setLanguage = (locale) => {
    let request = new XMLHttpRequest();
    let langPath = chrome.runtime.getURL('/_locales/');
    let defaultLangURL = langPath + 'en/messages.json';
    request.onload = function () {
      if (this.responseText != null) {
        window.localizedStrings = JSON.parse(this.responseText);
      } else {
        window.localizedStrings = {};
      }
    };
    request.onerror = function () {
      this.open('GET', defaultLangURL, false);
      this.send(null);
    };
    try {
      let localeStr = isNullOrEmpty(locale) ? window.currentLanguageCode.split('-')[0] : locale;
      request.open('GET', langPath + localeStr + '/messages.json', false);
      request.send(null);
    } catch (e) {
      request.open('GET', defaultLangURL, false);
      request.send(null);
    }
  };

  const localize = (localeKey) => {
    let strings = window.localizedStrings || {};
    let obj = strings[localeKey] || '';
    if (obj && typeof obj === 'object') {
      return obj.message || '';
    }
    return '';
  };

  /**
   * Group collection items by certain predicate and sort groups by min value of given factor per group.
  */
  const sortAndGroupBy = (data, factor, filterBy) => {
    const sortOrderMap = {};
    const groupedData = (filterBy ? data.filter(filterBy) : data).reduce((result, val, index) => {
      const key = val[factor];
      if (hasOwnProperty.call(result, key)) {
        result[key].push(val);
      } else {
        Object.assign(result, { [key]: [val] });
      }
      return result;
    }, {});
    data.forEach((item) => {
      sortOrderMap[item[factor]] = sortOrderMap[item[factor]] ? Math.min(
        sortOrderMap[item[factor]],
        item.sort_order,
      ) : item.sort_order;
    });
    const keys = Object.keys(groupedData);
    keys.sort((a, b) => (sortOrderMap[a] - sortOrderMap[b]));
    const sortedGroupedData = {};
    keys.forEach((key) => {
      sortedGroupedData[key] = groupedData[key];
      sortedGroupedData[key].sort((loc1, loc2) => (loc1.sort_order - loc2.sort_order));
    });
    return sortedGroupedData;
  };

  /**
   * escapes strings so they can be safely used in regex patterns
  */
  const escapeRegExp = (str) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

  const isRegularUser = (subscriptionInfo) => (subscriptionInfo.status === 'ACTIVE') && (subscriptionInfo.plan_type === 'full');

  /**
   * Filter source array by excluding elements that belong to target array.
  */
  const removeCommonElements = (source, target) => source.filter(el => target.indexOf(el) === -1);

  return {
    isNullOrEmpty,
    fixedEncodeURIComponent,
    getRandomIntInclusive,
    capitalize,
    calculateRandomPosition,
    versionCompare,
    sortAndGroupBy,
    escapeRegExp,
    removeCommonElements,
    currentInfo,
    setLanguage,
    localize,
    isRegularUser,
    defaultPreferences,
    ICONS,
  };
}());

module.exports = utils;
