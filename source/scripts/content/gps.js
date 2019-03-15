/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
function hookGeo() {
  //<![CDATA[
  window.getCurrentPositionX = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
  window.watchPositionX = navigator.geolocation.watchPosition.bind(navigator.geolocation);
  let WAIT_TIME = 100;

  
  if (!['http:', 'https:'].includes(window.location.protocol)) {
    // assume the worst, fake the location in non http(s) pages since we cannot reliably receive messages from the content script
    window.fakeGeo = true;
    window.genLat = 38.883333;
    window.genLon = -77.000;
  }

  function waitGetCurrentPosition() {
    if ((typeof window.fakeGeo !== 'undefined')) {
      if (window.fakeGeo === true) {
        window.tmp_successCallback({
          coords: {
            latitude: window.genLat,
            longitude: window.genLon,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: new Date().getTime(),
        });
      } else {
        window.getCurrentPositionX(window.tmp_successCallback, window.tmp_errorCallback, window.tmp_options);
      }
    } else {
      setTimeout(waitGetCurrentPosition, WAIT_TIME);
    }
  }

  function waitWatchPosition() {
    if ((typeof window.fakeGeo !== 'undefined')) {
      if (window.fakeGeo === true) {
        navigator.getCurrentPosition(window.tmp2_successCallback, window.tmp2_errorCallback, window.tmp2_options);
        return Math.floor(Math.random() * 10000); // random id
      } else {
        window.watchPositionX(window.tmp2_successCallback, window.tmp2_errorCallback, window.tmp2_options);
      }
    } else {
      setTimeout(waitWatchPosition, WAIT_TIME);
    }
  }

  navigator.geolocation.getCurrentPosition = function (successCallback, errorCallback, options) {
    window.tmp_successCallback = successCallback;
    window.tmp_errorCallback = errorCallback;
    window.tmp_options = options;
    waitGetCurrentPosition();
  };
  navigator.geolocation.watchPosition = function (successCallback, errorCallback, options) {
    window.tmp2_successCallback = successCallback;
    window.tmp2_errorCallback = errorCallback;
    window.tmp2_options = options;
    waitWatchPosition();
  };

  const instantiate = (constructor, args) => {
    const bind = Function.bind;
    const unbind = bind.bind(bind);
    return new (unbind(constructor, null).apply(null, args));
  }

  Blob = function (_Blob) {
    function secureBlob(...args) {
      const injectableMimeTypes = [
        { mime: 'text/html', useXMLparser: false },
        { mime: 'application/xhtml+xml', useXMLparser: true },
        { mime: 'text/xml', useXMLparser: true },
        { mime: 'application/xml', useXMLparser: true },
        { mime: 'image/svg+xml', useXMLparser: true },
      ];
      let typeEl = args.find(arg => (typeof arg === 'object') && (typeof arg.type === 'string') && (arg.type));

      if (typeof typeEl !== 'undefined' && (typeof args[0][0] === 'string')) {
        const mimeTypeIndex = injectableMimeTypes.findIndex(mimeType => mimeType.mime.toLowerCase() === typeEl.type.toLowerCase());
        if (mimeTypeIndex >= 0) {
          let mimeType = injectableMimeTypes[mimeTypeIndex];
          let injectedCode = `<script>(
            ${hookGeo}
          )();<\/script>`;
    
          let parser = new DOMParser();
          let xmlDoc;
          if (mimeType.useXMLparser === true) {
            xmlDoc = parser.parseFromString(args[0].join(''), mimeType.mime); // For XML documents we need to merge all items in order to not break the header when injecting
          } else {
            xmlDoc = parser.parseFromString(args[0][0], mimeType.mime);
          }

          if (xmlDoc.getElementsByTagName("parsererror").length === 0) { // if no errors were found while parsing...
            xmlDoc.documentElement.insertAdjacentHTML('afterbegin', injectedCode);
    
            if (mimeType.useXMLparser === true) {
              args[0] = [new XMLSerializer().serializeToString(xmlDoc)];
            } else {
              args[0][0] = xmlDoc.documentElement.outerHTML;
            }
          }
        }
      }

      return instantiate(_Blob, args); // arguments?
    }

    // Copy props and methods
    let propNames = Object.getOwnPropertyNames(_Blob);
    for (let i = 0; i < propNames.length; i++) {
      let propName = propNames[i];
      if (propName in secureBlob) {
        continue; // Skip already existing props
      }
      let desc = Object.getOwnPropertyDescriptor(_Blob, propName);
      Object.defineProperty(secureBlob, propName, desc);
    }

    secureBlob.prototype = _Blob.prototype;
    return secureBlob;
  }(Blob);

  Object.freeze(navigator.geolocation);

  window.addEventListener('message', function (event) {
    if (event.source !== window) {
      return;
    }
    const message = event.data;
    switch (message.method) {
      case 'updateLocationX':
        if ((typeof message.info === 'object') && (typeof message.info.coords === 'object')) {
          window.genLat = message.info.coords.lat;
          window.genLon = message.info.coords.lon;
          window.fakeGeo = message.info.fakeIt;
        }
        break;
      default:
        break;
    }
  }, false);
  //]]>
}

function getRandomString(N) {
  let alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array(N)
    .join()
    .split(',')
    .map(function () { return alpha.charAt(Math.floor(Math.random() * alpha.length)); })
    .join('');// 6 characters random string
}

pref_hideLocation = true;
 domain = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
 mapNames = { // randomize variable names
  genLat: getRandomString(5),
  genLon: getRandomString(5),
  fakeGeo: getRandomString(5),
  getCurrentPositionX: getRandomString(7),
  watchPositionX: getRandomString(7),
  updateLocationX: getRandomString(7),
  hookGeo: getRandomString(5),
  tmp_successCallback: getRandomString(7),
  tmp_errorCallback: getRandomString(7),
  tmp_options: getRandomString(5),
  tmp2_successCallback: getRandomString(7),
  tmp2_errorCallback: getRandomString(7),
  tmp2_options: getRandomString(5),
};

function sendLocation(currentInfo) {
  let injectStates = ['connected', 'connecting', 'disconnecting', 'reconnecting', 'connection_error'];
  let info = {
    fakeIt: false,
    coords: {
      lat: 38.883333,
      lon: -77.000,
    },  
  };

  if ((typeof currentInfo === 'object') && (typeof currentInfo.selectedLocation === 'object') && (typeof currentInfo.selectedLocation.coords === 'object')) {
    info.coords = currentInfo.selectedLocation.coords;
    info.fakeIt = ((injectStates.indexOf(currentInfo.state) > -1) && pref_hideLocation);
  }
  if (['http:', 'https:'].includes((new URL(domain).protocol))) { // It's not possible to reliably set the origin with non-http(s) protocol, so let's try to not trigger any errors
    window.postMessage({ method: mapNames.updateLocationX, info: info }, domain);
  }
}

function shouldInject() {
  return ((document instanceof HTMLDocument) || (document instanceof XMLDocument))
}

function inject(storage) {
  sendLocation(storage.currentInfo);

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.prefs) {
      pref_hideLocation = changes.prefs.hideLocation;
    }
    sendLocation(changes.currentInfo);
  });

  let re = new RegExp(Object.keys(mapNames).join('|'), 'gi');
  let func = hookGeo.toString().replace(re, function (matched) {
    return mapNames[matched];
  });

  let injectedCode = '(function(){' +
    func +
    mapNames.hookGeo + '();' +
  '})()';

  // Inserting the script inline will make sure it will be executed first
  let script = document.createElementNS('http://www.w3.org/1999/xhtml', 'script');
  script.appendChild(document.createTextNode(injectedCode));

  let parent = document.head || document.body || document.documentElement;
  let firstChild = (parent.childNodes && (parent.childNodes.length > 0)) ? parent.childNodes[0] : null;
  if (firstChild) {
    parent.insertBefore(script, firstChild);
  } else {
    parent.appendChild(script);
  }
}

chrome.storage.local.get(['currentInfo', 'prefs'], function (storage) {
  pref_hideLocation = storage.prefs.hideLocation;

  if (shouldInject() && pref_hideLocation === true) {
    inject(storage);
  }
});
