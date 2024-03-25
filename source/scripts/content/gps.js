/* eslint-disable camelcase */
/*
ExpressVPN Browser Extension:
Copyright 2017-2023 Express VPN International Ltd
Licensed GPL v2
*/

//<![CDATA[
function hookGeo(eventName) {
	//<![CDATA[
	const WAIT_TIME = 100;
	const hookedObj = {
		getCurrentPosition: navigator.geolocation.getCurrentPosition.bind(navigator.geolocation),
		watchPosition: navigator.geolocation.watchPosition.bind(navigator.geolocation),
		fakeGeo: true,
		genLat: 38.883333,
		genLon: -77.000
	};

	function waitGetCurrentPosition() {
		if ((typeof hookedObj.fakeGeo !== 'undefined')) {
			if (hookedObj.fakeGeo === true) {
				hookedObj.tmp_successCallback({
					coords: {
						latitude: hookedObj.genLat,
						longitude: hookedObj.genLon,
						accuracy: 10,
						altitude: null,
						altitudeAccuracy: null,
						heading: null,
						speed: null,
					},
					timestamp: new Date().getTime(),
				});
			} else {
				hookedObj.getCurrentPosition(hookedObj.tmp_successCallback, hookedObj.tmp_errorCallback, hookedObj.tmp_options);
			}
		} else {
			setTimeout(waitGetCurrentPosition, WAIT_TIME);
		}
	}

	function waitWatchPosition() {
		if ((typeof hookedObj.fakeGeo !== 'undefined')) {
			if (hookedObj.fakeGeo === true) {
				navigator.geolocation.getCurrentPosition(hookedObj.tmp2_successCallback, hookedObj.tmp2_errorCallback, hookedObj.tmp2_options);
				return Math.floor(Math.random() * 10000); // random id
			} else {
				hookedObj.watchPosition(hookedObj.tmp2_successCallback, hookedObj.tmp2_errorCallback, hookedObj.tmp2_options);
			}
		} else {
			setTimeout(waitWatchPosition, WAIT_TIME);
		}
	}

	Object.getPrototypeOf(navigator.geolocation).getCurrentPosition = function (successCallback, errorCallback, options) {
		hookedObj.tmp_successCallback = successCallback;
		hookedObj.tmp_errorCallback = errorCallback;
		hookedObj.tmp_options = options;
		waitGetCurrentPosition();
	};
	Object.getPrototypeOf(navigator.geolocation).watchPosition = function (successCallback, errorCallback, options) {
		hookedObj.tmp2_successCallback = successCallback;
		hookedObj.tmp2_errorCallback = errorCallback;
		hookedObj.tmp2_options = options;
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
					let parser = new DOMParser();
					let xmlDoc;
					if (mimeType.useXMLparser === true) {
						xmlDoc = parser.parseFromString(args[0].join(''), mimeType.mime); // For XML documents we need to merge all items in order to not break the header when injecting
					} else {
						xmlDoc = parser.parseFromString(args[0][0], mimeType.mime);
					}

					if (xmlDoc.getElementsByTagName("parsererror").length === 0) { // if no errors were found while parsing...
						if (typeEl.type === "image/svg+xml") {
						  const scriptElem = xmlDoc.createElementNS(
						    "http://www.w3.org/2000/svg",
						    "script",
						  );
						  scriptElem.setAttributeNS(null, "type", "application/ecmascript");
						  scriptElem.innerHTML = `(${hookGeo})();`;
						  xmlDoc.documentElement.insertBefore(
						    scriptElem,
						    xmlDoc.documentElement.firstChild,
						  );
						} else {
						  const injectedCode = `<script>(
											    	${hookGeo}
											    )();<\/script>`;
						  xmlDoc.documentElement.insertAdjacentHTML(
						    "afterbegin",
						    injectedCode,
						  );
						}
		
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

	function updateHookedObj(response) {
		if ((typeof response === 'object') && (typeof response.coords === 'object')) {
			hookedObj.genLat = response.coords.lat;
			hookedObj.genLon = response.coords.lon;
			hookedObj.fakeGeo = response.fakeIt;
		}
	}

	if (typeof chrome !== 'undefined') {
		// https://developer.chrome.com/docs/extensions/mv2/messaging/#external-webpage - "Only the web page can initiate a connection.", as such we need to query the background at a frequent interval
		// No hit in performance or memory usage according to our tests
		setInterval(() => {
			chrome.runtime.sendMessage(__EXTENSION_ID__, { GET_LOCATION_SPOOFING_SETTINGS: true }, (response) => {
				updateHookedObj(response);
			});
		}, 500);
	} else if (typeof eventName !== 'undefined') {
		document.addEventListener(eventName, function(event) {
			try {
				const response = JSON.parse(event.detail);
				updateHookedObj(response);
			} catch (ex) {
				// noop
			}			
		});
	}
	//]]>
}

hookGeo();
