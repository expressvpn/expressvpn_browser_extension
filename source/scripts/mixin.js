/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import UAParser from 'ua-parser-js';
import { mapGetters } from 'vuex';
import utils from './modules/utils';
import rating from './modules/rating';
import locationPicker from './modules/locationPicker';

export default {
  methods: {
    createTab: (opts, event) => {
      if (event) {
        event.stopPropagation();
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
        if (this.langList[i].code === window.currentLanguageCode) {
          currentLangObj = this.langList[i];
          break;
        }
      }
      if (currentLangObj !== null) {
        dateStr = expiryDate.toLocaleDateString(window.currentLanguageCode, optionEl);
      } else {
        dateStr = expiryDate.toLocaleDateString('en-us', optionEl).replace(/[^ -~]/g, '');
      }
      return dateStr;// format eg : 'January 19, 2017' for 'en' locale
    },
    openLocationPicker() {
      if (['connected', 'ready'].includes(this.currentInfo.state)) {
        this.$store.dispatch('setCurrentView', 'locationPicker');
      }
    },
  },
  computed: {
    ...mapGetters([
      'currentInfo',
      'errorStates',
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
      rating: rating,
      localizedStrings: {},
      locationPicker: locationPicker,
      browserInfo: UAParser(window.navigator.userAgent).browser,
      langList: [
        /*
        { code: 'da', language: 'Danish', label: 'Dansk (Danish)' },
        { code: 'de', language: 'German', label: 'Deutsch (German)' },
        */
        { code: 'en', language: 'English', label: 'English (English)' },
        /*
        { code: 'es', language: 'Spanish', label: 'Español (Spanish)' },
        */
        { code: 'fr', language: 'French', label: 'Français (French)' },
        /*
        { code: 'it', language: 'Italian', label: 'Italiano (Italian)' },
        { code: 'nl', language: 'Dutch', label: 'Nederlands (Dutch)' },
        { code: 'no', language: 'Norwegian', label: 'Norsk (Norwegian)' },
        { code: 'pl', language: 'Polish', label: 'Polski (Polish)' },
        { code: 'pt', language: 'Portuguese', label: 'Português (Portuguese)' },
        { code: 'ru', language: 'Russian', label: 'Русский (Russian)' },
        { code: 'fi', language: 'Finnish', label: 'Suomi (Finnish)' },
        { code: 'sv', language: 'Swedish', label: 'Svenska (Swedish)' },
        { code: 'th', language: 'Thai', label: ' ภาษาไทย (Thai)' },
        { code: 'tr', language: 'Turkish', label: 'Türkçe (Turkish)' },
        { code: 'ja', language: 'Japanese', label: '日本語 (Japanese)' },
        { code: 'ko', language: 'Korean', label: '한국어 (Korean)' },
        */
      ],
      browserDict: {
        'Google Chrome': 'Chrome',
        'Firefox': 'Firefox',
      },
    };
  },
};

