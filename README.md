# ExpressVPN Browser Extension

## ExpressVPN

One of the world’s largest providers of VPN services, ExpressVPN enables users to protect their privacy and security online with just a few clicks. The company’s award-winning apps for Windows, Mac, iOS, Android, Linux, routers, and browsers secure user information and identities with best-in-class encryption and leak-proofing. 

With 2,000+ servers across 94 countries, ExpressVPN provides a fast connection and uncensored access to sites and services across the globe. The company is based in the British Virgin Islands and has been operating since 2009. 

## About the browser extension

This repository contains the source code to facilitate review of the ExpressVPN browser extension. The ExpressVPN browser extension, in conjunction with the ExpressVPN app for Windows, Mac, or Linux, enables users to connect to our network of VPN servers around the world from their web browser.

The ExpressVPN app has been comprehensively leak tested using our [open source test suite](https://github.com/expressvpn/expressvpn_leak_testing). The ExpressVPN Browser Extension code has been independently [audited by Cure53](https://www.expressvpn.com/blog/browser-extension-audit-and-open-sourcing&sa=D&ust=1548311254592000&usg=AFQjCNFzgYBqcDptsoVC_htK5HqX2w6y6g).

### Additional privacy and security features

* Automatically secure your traffic on browser launch
* Spoof your location
* HTTPS Everywhere
* Block WebRTC

## Notes

We have not included the build scripts, tools, and tests necessary to build your own version of the ExpressVPN browser extension. Their inclusion would not enable a developer to build a working extension as the ExpressVPN apps verify that any extension is included in a whitelist prior to interfacing with it.

## License

This project is licensed under the [GNU General Public License, version 2](https://www.gnu.org/licenses/gpl-2.0.html).
