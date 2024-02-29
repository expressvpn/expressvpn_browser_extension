const eventName = Math.random().toString(36).substring(2) + crypto.getRandomValues(new Uint32Array(3)).join('');
let isLocationSpoofEnabled = true;
let isScriptInjected = false;
let shadowRoot;
let currentInfo;

function shouldInject() {
  return ((document instanceof HTMLDocument) || (document instanceof XMLDocument))
}

function sendFirefoxEvent() {
  // check for firefox
  if (typeof browser === 'undefined') {
    return;
  }
  const detail = {
    coords: currentInfo.selectedLocation?.coords,
    fakeIt: ['connected', 'connecting', 'disconnecting', 'reconnecting', 'connection_error'].includes(currentInfo.state) && isLocationSpoofEnabled,
  };
  const event = new CustomEvent(eventName, {bubbles: true,  composed: true, detail: JSON.stringify(detail) }); // Must be serialized otherwise it will throw an access error
  shadowRoot?.dispatchEvent(event);
}

function inject_chrome() {
  // Inserting the script inline will make sure it will be executed first
  let script = document.createElementNS('http://www.w3.org/1999/xhtml', 'script');
  script.src = chrome.runtime.getURL('/scripts/content/gps.js');

  let parent = document.head || document.body || document.documentElement;
  let firstChild = (parent.childNodes && (parent.childNodes.length > 0)) ? parent.childNodes[0] : null;
  if (firstChild) {
    parent.insertBefore(script, firstChild);
  } else {
    parent.appendChild(script);
  }
  isScriptInjected = true;
}

function inject_firefox() {
  let shadowHost = document.createElement('div');
  shadowHost.style.display = 'none';
  let parent = document.head || document.body || document.documentElement;
  let firstChild = (parent.childNodes && (parent.childNodes.length > 0)) ? parent.childNodes[0] : null;
  if (firstChild) {
    parent.insertBefore(shadowHost, firstChild);
  } else {
    parent.appendChild(shadowHost);
  }

  shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
  let script = document.createElementNS('http://www.w3.org/1999/xhtml', 'script');
  script.appendChild(document.createTextNode(`__GPSJS_CONTENT__`.replace('hookGeo();', `hookGeo('${eventName}');`)));
  shadowRoot.appendChild(script);
  sendFirefoxEvent();

  isScriptInjected = true;
}

// Inject on page load if enabled by the user
chrome.storage.local.get(['currentInfo', 'prefs'], function (storage) {
  isLocationSpoofEnabled = storage.prefs.hideLocation;
  currentInfo = storage.currentInfo;

  if (shouldInject() && isLocationSpoofEnabled === true) {
    inject();
  }
});

// Inject on User config change
chrome.storage.onChanged.addListener((changes) => {
  if (changes?.prefs?.newValue) {
    isLocationSpoofEnabled = changes?.prefs?.newValue?.hideLocation;
  }
  if (changes?.currentInfo?.newValue) {
    currentInfo = changes?.currentInfo?.newValue;
  }
  
  if (changes?.prefs?.newValue?.hideLocation === true && !isScriptInjected) {
    inject();
  }
  if (isScriptInjected) {
    sendFirefoxEvent();
  }
});
