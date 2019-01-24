/*
HTTPS Everywhere:
Copyright © 2010-2018 Electronic Frontier Foundation and others
Licensed GPL v2+

HTTPS Everywhere Rulesets (src/chrome/content/rules):
To the extent copyright applies to the rulesets, they can be used according to GPL v2 or later.

This file was modified by Express VPN International Ltd on May 16th, 2018
*/

"use strict";

(function(exports) {

const rules = require('./rules'),
  store = require('./store'),
  incognito = require('./incognito'),
  util = require('./util'),
  update = require('./update');

let all_rules = new rules.RuleSets();

async function initialize() {
  await store.initialize();
  await store.performMigrations();
  await initializeStoredGlobals();
  await getUpgradeToSecureAvailable();
  await update.initialize(store, initializeAllRules);
  await all_rules.loadFromBrowserStorage(store, update.applyStoredRulesets);
  await incognito.onIncognitoDestruction(destroy_caches);
}
initialize();

async function initializeAllRules() {
  const r = new rules.RuleSets();
  await r.loadFromBrowserStorage(store, update.applyStoredRulesets);
  Object.assign(all_rules, r);
}

chrome.storage.onChanged.addListener(async function(changes, areaName) {
  if ((areaName === 'sync' || areaName === 'local') && (changes.prefs)) {
    /*
    if ('httpNowhere' in changes.prefs) {
      httpNowhereOn = changes.httpNowhere.newValue;
    }
    */
    isExtensionEnabled = changes.prefs.newValue.httpsEverywhere;
  }
});

/**
 * Load preferences. Structure is:
 *  {
 *    httpNowhere: Boolean,
 *    isExtensionEnabled: Boolean
 *  }
 */
var httpNowhereOn = false;
var isExtensionEnabled = true;

function initializeStoredGlobals(){
  return new Promise(resolve => {
    store.get({
      httpNowhere: false,
      globalEnabled: true,
      enableMixedRulesets: false
    }, function(item) {
      httpNowhereOn = item.httpNowhere;
      isExtensionEnabled = item.globalEnabled;

      rules.settings.enableMixedRulesets = item.enableMixedRulesets;

      resolve();
    });
  });
}

let upgradeToSecureAvailable;

function getUpgradeToSecureAvailable() {
  if (typeof browser !== 'undefined') {
    return browser.runtime.getBrowserInfo().then(function(info) {
      let version = info.version.match(/^(\d+)/)[1];
      if (info.name == "Firefox" && version >= 59) {
        upgradeToSecureAvailable = true;
      } else {
        upgradeToSecureAvailable = false;
      }
    });
  } else {
    return new Promise(resolve => {
      upgradeToSecureAvailable = false;
      resolve();
    });
  }
}


var urlBlacklist = new Set();

// redirect counter workaround
var redirectCounter = new Map();

/**
 * Called before a HTTP(s) request. Does the heavy lifting
 * Cancels the request/redirects it to HTTPS. URL modification happens in here.
 * @param details of the handler, see Chrome doc
 * */
function onBeforeRequest(details) {
  // If HTTPSe has been disabled by the user, return immediately.
  if (!isExtensionEnabled) {
    return;
  }

  let uri = new URL(details.url);

  // Normalise hosts with tailing dots, e.g. "www.example.com."
  let canonical_host = uri.hostname;
  while (canonical_host.charAt(canonical_host.length - 1) == ".") {
    canonical_host = canonical_host.slice(0, -1);
    uri.hostname = canonical_host;
  }

  // Should the request be canceled?
  // true if the URL is a http:// connection to a remote canonical host, and not
  // a tor hidden service
  const shouldCancel = httpNowhereOn &&
    uri.protocol === 'http:' &&
    uri.hostname.slice(-6) !== '.onion' &&
    uri.hostname !== 'localhost' &&
    !/^127(\.[0-9]{1,3}){3}$/.test(canonical_host) &&
    !/^0\.0\.0\.0$/.test(canonical_host) &&
    uri.hostname !== '[::1]';

  // If there is a username / password, put them aside during the ruleset
  // analysis process
  let using_credentials_in_url = false;
  let tmp_user;
  let tmp_pass;
  if (uri.password || uri.username) {
    using_credentials_in_url = true;
    tmp_user = uri.username;
    tmp_pass = uri.password;
    uri.username = '';
    uri.password = '';
  }

  var canonical_url = uri.href;
  if (details.url != canonical_url && !using_credentials_in_url) {
    util.log(util.INFO, "Original url " + details.url +
        " changed before processing to " + canonical_url);
  }
  if (urlBlacklist.has(canonical_url)) {
    return {cancel: shouldCancel};
  }

  var potentiallyApplicable = all_rules.potentiallyApplicableRulesets(canonical_host);

  if (redirectCounter.get(details.requestId) >= 8) {
    util.log(util.NOTE, "Redirect counter hit for " + canonical_url);
    urlBlacklist.add(canonical_url);
    rules.settings.domainBlacklist.add(canonical_host);
    util.log(util.WARN, "Domain blacklisted " + canonical_host);
    return {cancel: shouldCancel};
  }

  // whether to use mozilla's upgradeToSecure BlockingResponse if available
  let upgradeToSecure = false;
  var newuristr = null;
  // check rewritten URIs against the trivially upgraded URI
  let trivialUpgradeUri = canonical_url.replace(/^http:/, "https:");

  for (let ruleset of potentiallyApplicable) {
    if (ruleset.active && !newuristr) {
      newuristr = ruleset.apply(canonical_url);
      // only use upgradeToSecure for trivial rulesets
      if (newuristr == trivialUpgradeUri) {
        upgradeToSecure = true;
      }
    }
  }

  // re-insert userpass info which was stripped temporarily
  if (using_credentials_in_url) {
    if (newuristr) {
      const uri_with_credentials = new URL(newuristr);
      uri_with_credentials.username = tmp_user;
      uri_with_credentials.password = tmp_pass;
      newuristr = uri_with_credentials.href;
    } else {
      const canonical_url_with_credentials = new URL(canonical_url);
      canonical_url_with_credentials.username = tmp_user;
      canonical_url_with_credentials.password = tmp_pass;
      canonical_url = canonical_url_with_credentials.href;
    }
  }


  if (httpNowhereOn) {
    // If loading a main frame, try the HTTPS version as an alternative to
    // failing.
    if (shouldCancel) {
      upgradeToSecure = true;
      if (!newuristr) {
        newuristr = canonical_url.replace(/^http:/, "https:");
      } else {
        newuristr = newuristr.replace(/^http:/, "https:");
      }
    }
    if (newuristr && newuristr.substring(0, 5) === "http:") {
      // Abort early if we're about to redirect to HTTP in HTTP Nowhere mode
      return {cancel: true};
    }
  }

  if (upgradeToSecureAvailable && upgradeToSecure) {
    util.log(util.INFO, 'onBeforeRequest returning upgradeToSecure: true');
    return {upgradeToSecure: true};
  } else if (newuristr) {
    util.log(util.INFO, 'onBeforeRequest returning redirectUrl: ' + newuristr);
    return {redirectUrl: newuristr};
  } else {
    util.log(util.INFO, 'onBeforeRequest returning shouldCancel: ' + shouldCancel);
    return {cancel: shouldCancel};
  }
}


// Map of which values for the `type' enum denote active vs passive content.
// https://developer.chrome.com/extensions/webRequest.html#event-onBeforeRequest
const mixedContentTypes = {
  object: 1, other: 1, script: 1, stylesheet: 1, sub_frame: 1, xmlhttprequest: 1,
  image: 0, main_frame: 0
};

/**
 * Return the number of properties in an object. For associative maps, this is
 * their size.
 * @param obj: object to calc the size for
 * */
function objSize(obj) {
  if (typeof obj == 'undefined') return 0;
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}

/**
 * monitor cookie changes. Automatically convert them to secure cookies
 * @param changeInfo Cookie changed info, see Chrome doc
 * */
function onCookieChanged(changeInfo) {
  if (!changeInfo.removed && !changeInfo.cookie.secure && isExtensionEnabled) {
    if (all_rules.shouldSecureCookie(changeInfo.cookie)) {
      let cookie = {
        name:changeInfo.cookie.name,
        value:changeInfo.cookie.value,
        path:changeInfo.cookie.path,
        httpOnly:changeInfo.cookie.httpOnly,
        expirationDate:changeInfo.cookie.expirationDate,
        storeId:changeInfo.cookie.storeId,
        secure: true
      };

      // Host-only cookies don't set the domain field.
      if (!changeInfo.cookie.hostOnly) {
        cookie.domain = changeInfo.cookie.domain;
      }

      // Chromium cookie sameSite status, see https://tools.ietf.org/html/draft-west-first-party-cookies
      if (changeInfo.cookie.sameSite) {
        cookie.sameSite = changeInfo.cookie.sameSite;
      }

      // Firefox first-party isolation
      if (changeInfo.cookie.firstPartyDomain) {
        cookie.firstPartyDomain = changeInfo.cookie.firstPartyDomain;
      }

      // The cookie API is magical -- we must recreate the URL from the domain and path.
      if (changeInfo.cookie.domain[0] == ".") {
        cookie.url = "https://www" + changeInfo.cookie.domain + cookie.path;
      } else {
        cookie.url = "https://" + changeInfo.cookie.domain + cookie.path;
      }
      // We get repeated events for some cookies because sites change their
      // value repeatedly and remove the "secure" flag.
      util.log(util.DBUG,
        "Securing cookie " + cookie.name + " for " + changeInfo.cookie.domain + ", was secure=" + changeInfo.cookie.secure);
      chrome.cookies.set(cookie);
    }
  }
}

/**
 * handling redirects, breaking loops
 * @param details details for the redirect (see chrome doc)
 * */
function onBeforeRedirect(details) {
  // Catch redirect loops (ignoring about:blank, etc. caused by other extensions)
  let prefix = details.redirectUrl.substring(0, 5);
  if (prefix === "http:" || prefix === "https") {
    let count = redirectCounter.get(details.requestId);
    if (count) {
      redirectCounter.set(details.requestId, count + 1);
      util.log(util.DBUG, "Got redirect id "+details.requestId+
                ": "+count);
    } else {
      redirectCounter.set(details.requestId, 1);
    }
  }
}

/**
 * handle webrequest.onCompleted, cleanup redirectCounter
 * @param details details for the chrome.webRequest (see chrome doc)
 */
function onCompleted(details) {
  if (redirectCounter.has(details.requestId)) {
    redirectCounter.delete(details.requestId);
  }
}

/**
 * handle webrequest.onErrorOccurred, cleanup redirectCounter
 * @param details details for the chrome.webRequest (see chrome doc)
 */
function onErrorOccurred(details) {
  if (redirectCounter.has(details.requestId)) {
    redirectCounter.delete(details.requestId);
  }
}

/**
 * handle webrequest.onHeadersReceived, insert upgrade-insecure-requests directive and
 * rewrite access-control-allow-origin if presented in HTTP Nowhere mode
 * @param details details for the chrome.webRequest (see chrome doc)
 */
function onHeadersReceived(details) {
  if (isExtensionEnabled && httpNowhereOn) {
    // Do not upgrade the .onion requests in HTTP Nowhere Mode,
    // See https://github.com/EFForg/https-everywhere/pull/14600#discussion_r168072480
    const uri = new URL(details.url);
    if (uri.hostname.slice(-6) == '.onion') {
      return {};
    }

    let responseHeadersChanged = false;
    let cspHeaderFound = false;

    for (const idx in details.responseHeaders) {
      if (details.responseHeaders[idx].name.match(/Content-Security-Policy/i)) {
        // Existing CSP headers found
        cspHeaderFound = true;
        const value = details.responseHeaders[idx].value;

        // Prepend if no upgrade-insecure-requests directive exists
        if (!value.match(/upgrade-insecure-requests/i)) {
          details.responseHeaders[idx].value = "upgrade-insecure-requests; " + value;
          responseHeadersChanged = true;
        }
      }

      if (details.responseHeaders[idx].name.match(/Access-Control-Allow-Origin/i)) {
        // Existing access-control-allow-origin header found
        const value = details.responseHeaders[idx].value;

        // If HTTP protocol is used, change it to HTTPS
        if (value.match(/http:/)) {
          details.responseHeaders[idx].value = value.replace(/http:/g, "https:");
          responseHeadersChanged = true;
        }
      }
    }

    if (!cspHeaderFound) {
      // CSP headers not found
      const upgradeInsecureRequests = {
        name: 'Content-Security-Policy',
        value: 'upgrade-insecure-requests'
      }
      details.responseHeaders.push(upgradeInsecureRequests);
      responseHeadersChanged = true;
    }

    if (responseHeadersChanged) {
      return {responseHeaders: details.responseHeaders};
    }
  }
  return {};
}

// Registers the handler for requests
// See: https://github.com/EFForg/https-everywhere/issues/10039
chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {urls: ["*://*/*"]}, ["blocking"]);

// Try to catch redirect loops on URLs we've redirected to HTTPS.
chrome.webRequest.onBeforeRedirect.addListener(onBeforeRedirect, {urls: ["https://*/*"]});

// Cleanup redirectCounter if neccessary
chrome.webRequest.onCompleted.addListener(onCompleted, {urls: ["*://*/*"]});

// Cleanup redirectCounter if neccessary
chrome.webRequest.onErrorOccurred.addListener(onErrorOccurred, {urls: ["*://*/*"]})

// Insert upgrade-insecure-requests directive in httpNowhere mode
chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, {urls: ["https://*/*"]}, ["blocking", "responseHeaders"]);

// Listen for cookies set/updated and secure them if applicable. This function is async/nonblocking.
chrome.cookies.onChanged.addListener(onCookieChanged);


/**
 * Clear any cache/ blacklist we have.
 */
function destroy_caches() {
  util.log(util.DBUG, "Destroying caches.");
  all_rules.cookieHostCache.clear();
  all_rules.ruleCache.clear();
  rules.settings.domainBlacklist.clear();
  urlBlacklist.clear();
}

Object.assign(exports, {
  all_rules,
  urlBlacklist
});

})(typeof exports == 'undefined' ? require.scopes.background = {} : exports);
