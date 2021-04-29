/*
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
*/
import rating from './rating';

const currentInfo = {
  state: 'ready',
  selectedLocation: {
    name: '',
    country_code: '',
    is_smart_location: false,
    is_country: false,
    id: 0,
  },
  previousConnection: {
    id: 0,
    protocol: '',
  },
  smartLocation: {
    name: '',
    country_code: '',
    id: 0,
  },
  system: {
    browser: {},
    os: {},
  },
  networkStatus: 'has internet',
  showWelcome: false,
  recommendedLocationsList: [],
  allLocationsList: [],
  app: {
    version: '',
    latest_version: '',
    latest_version_url: '',
  },
  preferences: {},
  subscription: {},
  website_url: 'https://www.ujsrxts.com',
  connectingTimes: [],
  localizedStrings: {},
  ratingData: rating.defaultRatingData,
  raw: {},
};

const defaultPreferences = {
  'chrome.auto_connect': false,
  'chrome.prevent_webrtc_leaks': true,
  'chrome.desktop_notification': true,
  'httpsEverywhere': true,
  'httpsPeriodicity': 86400,
  'language': '',
  'hideLocation': true,
  'helpImprove': false,
};

const ICONS = {
  connected: {
    text: '✓',
    color: '#0f866c',
  },
  connecting: {
    text: '···',
    color: '#fd9b3f',
  },
  default: {
    text: '',
    color: [0, 0, 0, 0], // transparent
  },
  error: {
    text: '✕',
    color: '#cf1369',
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

const setLanguage = (_locale) => {
  let locale = isNullOrEmpty(_locale) ? (navigator.language || '').split('-')[0] : _locale;
  let localeFileUrl = `${chrome.runtime.getURL('/_locales')}/[XX]/messages.json`;
  const fetchDefaultLang = function (error) {
    return fetch(localeFileUrl.replace('[XX]', 'en'))
      .then(function (response) {
        console.log('Defaulting to en');
        return response.json();
      })
      .then(function (strings) {
        return { strings, locale: 'en' };
      });
  };

  return !isNullOrEmpty(locale) ?
    fetch(localeFileUrl.replace('[XX]', locale))
      .then(function (response) {
        return response.json();
      })
      .then(function (strings) {
        return { strings, locale };
      })
      .catch(fetchDefaultLang) // 404 -> default to English
    : fetchDefaultLang();
};

const localize = (localeKey) => {
  if (!window.localizedStrings) {
    setLanguage();
  }

  let strings = window.localizedStrings || {};
  let obj = strings[localeKey] || '';

  if (obj && typeof obj === 'object') {
    return obj.message || '';
  }
  return '';
};

const localizeLocation = (_location) => {
  if (!_location) {
    return;
  }
  let location;
  if (typeof _location === 'object') {
    location = { ..._location };
    if (_location.name) location.name = localize('_locationName_' + _location.name.replace(/[ \-()]/g, '_')) || _location.name;
    if (_location.country) location.country = localize('_locationName_' + _location.country.replace(/[ \-()]/g, '_')) || _location.country;
    if (_location.region) location.region = localize('_locationName_' + _location.region.replace(/[ \-()]/g, '_')) || _location.region;
  } else {
    location = localize('_locationName_' + _location.replace(/[ \-()]/g, '_')) || _location;
  }
  return location;
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

const getTimeDelta = (_date1, _date2) => {
  _date2 = _date2 || (new Date()).getTime() / 1000; // eslint-disable-line no-param-reassign

  let date1 = new Date(_date1 * 1000);
  let date2 = new Date(_date2 * 1000);

  let rawDifference = (date2 - date1);

  let seconds = Math.floor((rawDifference) / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  hours -= (days * 24);
  minutes = (days * 24 * 60) - (hours * 60);
  seconds -= (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

  return {
    days, hours, minutes, seconds, rawDifference,
  };
};

/**
 *  Given a subscription object, return true or false if the user's subscription expired
*/
const isSubscriptionExpired = (subscriptionObj) => (getTimeDelta(subscriptionObj.expiration_time).rawDifference > 0);

/**
 *  Given a subscription object, return true or false if the user's subscription in grace period
*/
const isInGracePeriod = (subscriptionObj) => isSubscriptionExpired(subscriptionObj) && ['ACTIVE', 'FREE_TRIAL_ACTIVE', 'MULTI_DEVICE_FREE_TRIAL_ACTIVE'].includes(subscriptionObj.status);

/**
 *  Given a subscription object, return true or false if the user's subscription was paid via IAP
*/
const isPaymentMethodIAP = (subscriptionObj) => {
  let isIAP = subscriptionObj.is_using_in_app_purchase;
  return isIAP && (subscriptionObj.payment_method === 'app_store_auto_renewable' || subscriptionObj.payment_method === 'app_store_non_renewable');
};

/**
 *  Given a subscription object, return true or false if the user's subscription is automatically renewable
*/
const isInAppPurchasesRenewable = (subscriptionObj) => {
  let isIAP = subscriptionObj.is_using_in_app_purchase;
  return isIAP && subscriptionObj.payment_method === 'app_store_auto_renewable' && subscriptionObj.auto_bill === true;
};

/**
 *  Given a subscription object, return true or false if the user's last IAP subscription failed
*/
const isLastInAppPurchasesFailure = (subscriptionObj) => {
  let isIAP = subscriptionObj.is_using_in_app_purchase;
  return isIAP && subscriptionObj.payment_method === 'app_store_auto_renewable' && subscriptionObj.last_auto_bill_failure === true;
};

/**
 * Checks if the current subscription data makes it impossible to continue
*/
const getLastIAPFatalError = (subscriptionObj) => {
  let iapStatus = null;

  if (isPaymentMethodIAP(subscriptionObj) === false) {
    return null;
  }
  if ((subscriptionObj.status === 'FREE_TRIAL_EXPIRED') && isLastInAppPurchasesFailure(subscriptionObj) && (subscriptionObj.auto_bill === true)) {
    iapStatus = 'FREE_TRIAL_IAP_RENEWAL_FAILED';
  } else if ((subscriptionObj.status === 'FREE_TRIAL_EXPIRED') && (isSubscriptionExpired(subscriptionObj) === true) && (subscriptionObj.auto_bill === false)) {
    iapStatus = 'FREE_TRIAL_IAP_NON_RENEWAL_EXPIRED';
  } else if (isSubscriptionExpired(subscriptionObj) && !isInGracePeriod(subscriptionObj) && (subscriptionObj.auto_bill === true)) {
    iapStatus = 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_ON';
  } else if (isSubscriptionExpired(subscriptionObj) && !isInGracePeriod(subscriptionObj) && (subscriptionObj.auto_bill === false)) {
    iapStatus = 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_OFF';
  }

  return iapStatus;
};

export {
  isNullOrEmpty,
  fixedEncodeURIComponent,
  getRandomIntInclusive,
  capitalize,
  calculateRandomPosition,
  versionCompare,
  sortAndGroupBy,
  escapeRegExp,
  currentInfo,
  setLanguage,
  localize,
  localizeLocation,
  isRegularUser,
  defaultPreferences,
  ICONS,
  isPaymentMethodIAP,
  isInAppPurchasesRenewable,
  isLastInAppPurchasesFailure,
  getTimeDelta,
  isInGracePeriod,
  getLastIAPFatalError,
  isSubscriptionExpired,
};
