# ExpressVPN Browser Extension

[![Chrome Web Store][chrome-version-image]][chrome-package-url] [![Chrome Web Store][chrome-rating-image]][chrome-package-url] [![Chrome Web Store][chrome-rating-count-image]][chrome-package-url] [![Chrome Web Store][chrome-download-image]][chrome-package-url]


[![Firefox Add-ons][firefox-version-image]][firefox-package-url] [![Firefox Add-ons][firefox-rating-image]][firefox-package-url] [![Firefox Add-ons][firefox-download-image]][firefox-package-url]

## ExpressVPN

One of the world’s largest providers of VPN services, ExpressVPN enables users to protect their privacy and security online with just a few clicks. The company’s award-winning apps for Windows, Mac, iOS, Android, Linux, routers, and browsers secure user information and identities with best-in-class encryption and leak-proofing. 

With 2,000+ servers across 94 countries, ExpressVPN provides a fast connection and uncensored access to sites and services across the globe. The company is based in the British Virgin Islands and has been operating since 2009. 

## About the browser extension

This repository contains the source code to facilitate review of the ExpressVPN browser extension. The ExpressVPN browser extension, in conjunction with the ExpressVPN app for Windows, Mac, or Linux, enables users to connect to our network of VPN servers around the world from their web browser.

The ExpressVPN app has been comprehensively leak tested using our [open source test suite](https://github.com/expressvpn/expressvpn_leak_testing). The ExpressVPN Browser Extension code has been independently [audited by Cure53](https://www.expressvpn.com/blog/browser-extension-audit-and-open-sourcing?sa=D&ust=1548311254592000&usg=AFQjCNFzgYBqcDptsoVC_htK5HqX2w6y6g).

### Additional privacy and security features

* Automatically secure your traffic on browser launch
* Spoof your location
* HTTPS Everywhere
* Block WebRTC


### Requirements
- Node.JS LTS


### Pack it for the extension store:

1. `cd xv_chrome`
2. `npm install`

3. Depending on the target browser
    #### Firefox
    `npm run build:prod -- --pack --browser=firefox`
    #### Chrome
    `npm run build:prod -- --pack --browser=chrome`

A zipped store-ready version of the extension is created in the `dist/` directory


### Watch

Run `$ npm run watch` and load the `build/development/[BROWSER]/` directory.

## Tasks

### Build

    $ npm run build

Processes all files and copies them to the appropriate directory depending on the browser. It does not minify them

    $ npm run build:prod

Same as above but makes the code production ready (Minification, console.* removal, removes comment, etc.)

| Option         | Description                                                                                                                                           |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--browser`    | Compile the extension for different browsers (chrome, firefox)  Default: chrome                                                                |


### Pack (ie. extension store ready)

Creates a zipped store-ready version of the extension in the `dist/` directory

    $ npm run build:prod -- --pack --browser=[BROWSER]

eg.:

    $ npm run build:prod -- --pack --browser=

| Option         | Description                                                                                                              |
|----------------|--------------------------------------------------------------------------------------------------------------------------|
| `--alpha`      | Updates the packed manifest to mention the Alpha keyword and specific key\application properties                         |
| `--beta`       | Updates the packed manifest to mention the Beta keyword and specific key\application properties                          |


[chrome-version-image]: https://img.shields.io/chrome-web-store/v/fgddmllnllkalaagkghckoinaemmogpe.svg?maxAge=25912&style=flat-square&color=4285F4
[chrome-rating-count-image]: https://img.shields.io/chrome-web-store/rating-count/fgddmllnllkalaagkghckoinaemmogpe.svg?maxAge=25000&style=flat-square&color=4285F4
[chrome-rating-image]: https://img.shields.io/chrome-web-store/rating/fgddmllnllkalaagkghckoinaemmogpe.svg?maxAge=25500&style=flat-square&color=4285F4
[chrome-download-image]: https://img.shields.io/chrome-web-store/d/fgddmllnllkalaagkghckoinaemmogpe.svg?maxAge=245701&style=flat-square&color=4285F4
[chrome-package-url]: https://chrome.google.com/webstore/detail/fgddmllnllkalaagkghckoinaemmogpe

[firefox-version-image]: https://img.shields.io/amo/v/expressvpn.svg?maxAge=245701&style=flat-square&color=FF6611
[firefox-rating-image]: https://img.shields.io/amo/rating/expressvpn.svg?maxAge=245701&style=flat-square&color=FF6611
[firefox-download-image]: https://img.shields.io/amo/users/expressvpn.svg?maxAge=245701&style=flat-square&color=FF6611
[firefox-package-url]: https://addons.mozilla.org/en-US/firefox/addon/expressvpn/

## License

This project is licensed under the [GNU General Public License, version 2](https://www.gnu.org/licenses/gpl-2.0.html).
