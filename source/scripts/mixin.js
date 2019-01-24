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
    localize: utils.localize,
    setLanguage: function () {
      utils.setLanguage();
      this.$forceUpdate();
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
  },
  computed: {
    ...mapGetters([
      'currentInfo',
      'errorStates',
    ]),
  },
  mounted() {
    // setLanguage (popup.js) is called after localize. Must be called before localize.
    if (utils.isNullOrEmpty(window.localizedStrings)) {
      let self = this;
      chrome.storage.local.get('prefs', function (storage) {
        if (storage.prefs && storage.prefs.language) {
          window.currentLanguageCode = storage.prefs.language;
        } else {
          window.currentLanguageCode = navigator.language.toLowerCase();
        }
        self.setLanguage();
      });
    }
  },
  created: function () {
  },
  data: function () {
    return {
      utils: utils,
      rating: rating,
      localizedStrings: {},
      locationPicker: locationPicker,
      browserInfo: UAParser(window.navigator.userAgent).browser,
      langList: [
        { code: 'en', language: 'English', label: 'English (English)' },
        { code: 'fr', language: 'French', label: 'Français (French)' },
      ],
      webrtcMinimumVersion: [
        {
          name: 'Firefox',
          minimumVersion: '54',
        },
      ],
      browserDict: {
        'Google Chrome': 'Chrome',
        'Firefox': 'Firefox',
      },
    };
  },
};

