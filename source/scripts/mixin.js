/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import UAParser from 'ua-parser-js';
import { mapGetters } from 'vuex';
import * as utils from './modules/utils';
import locationPicker from './modules/locationPicker';

export default {
  methods: {
    createTab: function (opts, event) {
      let websiteUrl = new URL(this.currentInfo.website_url);
      let url = new URL(opts.url);

      if (event) {
        event.stopPropagation();
      }
      if (this.currentInfo.locale !== 'en' && url.host === websiteUrl.host) { // Only localize our website
        let localeMap = {
          'pt_BR': 'pt',
          'ja': 'jp',
          'sv': 'se',
          'da': 'dk',
          'ko': 'kr',
        };
        let locale = localeMap[this.currentInfo.locale] ? localeMap[this.currentInfo.locale] : this.currentInfo.locale;
        let allUrlsLocales = ['fr', 'de', 'es', 'pt', 'it', 'nl'];
        if ((url.pathname === '/support/' && allUrlsLocales.includes(locale)) || (url.pathname !== '/support/')) {
          url.pathname = '/' + locale + url.pathname;
          // eslint-disable-next-line no-param-reassign
          opts.url = url.href;
        }
      }
      chrome.tabs.create(opts);
      window.close(); // Firefox doesn't always close the popup...
    },
    resetState: () => {
      chrome.runtime.sendMessage({ resetState: true });
    },
    chromePath: path => chrome.extension.getURL(path),
    reset: () => {
      chrome.runtime.sendMessage({ reset: true });
    },
    openApp: () => {
      chrome.runtime.sendMessage({ openApp: true });
    },
    getUrl: (path) => chrome.extension.getURL(path),
    localize: function (localeKey) {
      let strings = this.currentInfo.localizedStrings || {};

      let obj = strings[localeKey] || '';

      if (obj && typeof obj === 'object') {
        return obj.message || '';
      }
      return strings[localeKey] || '';
    },
    getFormattedDate: function (time, options) {
      let defaultOptions = {
        month: 'long', day: 'numeric', year: 'numeric',
      };
      let optionEl = options || defaultOptions;
      let expiryDate = new Date(time * 1000);
      let currentLangObj = null;
      let dateStr = '';
      for (let i in this.langList) {
        if (this.langList[i].code === this.currentInfo.locale) {
          currentLangObj = this.langList[i];
          break;
        }
      }
      if (currentLangObj !== null) {
        dateStr = expiryDate.toLocaleDateString(this.currentInfo.locale.replace('_', '-'), optionEl);
      } else {
        dateStr = expiryDate.toLocaleDateString('en-us', optionEl).replace(/[^ -~]/g, '');
      }
      return dateStr;// format eg : 'January 19, 2017' for 'en' locale
    },
    openLocationPicker() {
      if (['connected', 'ready', 'connection_error'].includes(this.currentInfo.state)) {
        this.$store.dispatch('setCurrentView', 'locationPicker');
      }
    },
  },
  computed: {
    ...mapGetters([
      'currentInfo',
      'errorStates',
      'langList',
    ]),
  },
  mounted: function () {
    if (process.env.NODE_ENV === 'development') { // this will get stripped out in the production build
      this.$nextTick(function () {
        window.parent.postMessage('expressvpn_test_loaded', '*');
        if (!document.getElementById('mockFlag')) {
          document.querySelector('body').insertAdjacentHTML('beforeend', '<div style="position: absolute;" id="mockFlag"></div>');
        }
      });
    }
  },
  data: function () {
    return {
      utils: utils,
      localizedStrings: {},
      locationPicker: locationPicker,
      browserInfo: UAParser(window.navigator.userAgent).browser,
      browserDict: {
        'Google Chrome': 'Chrome',
        'Firefox': 'Firefox',
        'Microsoft Edge': 'Edge',
      },
    };
  },
};

