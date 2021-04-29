/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import Vue from 'vue';
import { mapGetters } from 'vuex';
import VueSvgInlinePlugin from 'vue-svg-inline-plugin';
import store from './vuex/store';
import * as utils from './modules/utils';
import App from '../components/app';
import mixin from './mixin';

Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.use(VueSvgInlinePlugin, {
  cache: {
    version: '1.0',
    persistent: false,
  },
});
Vue.directive('visible', (el, binding) => {
  // eslint-disable-next-line no-param-reassign, no-extra-boolean-cast
  el.style.visibility = !!binding.value ? 'visible' : 'hidden';
});
Vue.mixin(mixin);
const app = new Vue({
  el: '#app',
  store,
  render: h => h(App),
  mounted() {
    let self = this;

    chrome.runtime.sendMessage({ getState: true });
    chrome.runtime.sendMessage({ getLocations: true });
    chrome.runtime.sendMessage({ getMessages: true });

    chrome.storage.local.get(null, (storage) => {
      // show message from cache in case it fails to get a response.
      let msgNumber = 0;
      setInterval((function message() {
        if (typeof storage.messages === 'object') { // it's actually an Array...
          self.$store.dispatch('setLatestMessage', storage.messages[msgNumber]);
          msgNumber = (msgNumber + 1 >= storage.messages.length) ? 0 : msgNumber + 1;
        }
        return message;
      }()), 30 * 60 * 1000);
    });
  },
  computed: mapGetters([
    'currentView',
  ]),
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.state) {
    let currentInfo = message.data;
    if (process.env.NODE_ENV === 'development') {
      let debugData = (new URL(window.location.href)).searchParams.get('data');
      let debugLocale = (new URL(window.location.href)).searchParams.get('locale');
      let debugBackgroundData = (new URL(window.location.href)).searchParams.get('bkdata');
      if (!utils.isNullOrEmpty(debugData)) {
        currentInfo = require('object-assign-deep')(currentInfo, JSON.parse(debugData));
      }
      if (!utils.isNullOrEmpty(debugLocale)) {
        chrome.runtime.sendMessage({ mock: true, category: 'locale', locale: debugLocale });
      }
      if (!utils.isNullOrEmpty(debugBackgroundData)) {
        let bkdata = JSON.parse(debugBackgroundData);
        chrome.runtime.sendMessage({ mock: true, category: bkdata.category, data: bkdata.data });
      }
    }
    if (app.$store.getters.ignoringStateUpdates === false) {
      app.$store.dispatch('updateCurrentInfo', currentInfo);
    }

    if (utils.getLastIAPFatalError(currentInfo.subscription) !== null && !app.errorStates.filter(state => state !== 'subscription_expired').includes(currentInfo.state)) {
      currentInfo.state = 'iapError';
      app.$store.dispatch('updateCurrentInfo', currentInfo);
    }

    if (app.errorStates.indexOf(currentInfo.state) === -1) {
      if (((currentInfo.state === 'connecting') || (currentInfo.state === 'reconnecting')) && (app.currentView !== 'SettingsGeneral' && app.currentView !== 'mainScreen')) {
        app.$store.dispatch('setCurrentView', 'mainScreen');
      }
    }

    // Set language list
    app.$store.dispatch('setlangList', [
      { code: 'da', label: app.localize('language_dropdown_danish') },
      { code: 'de', label: app.localize('language_dropdown_german') },
      { code: 'en', label: app.localize('language_dropdown_english') },
      { code: 'es', label: app.localize('language_dropdown_spanish') },
      { code: 'fr', label: app.localize('language_dropdown_french') },
      { code: 'it', label: app.localize('language_dropdown_italian') },
      { code: 'nl', label: app.localize('language_dropdown_dutch') },
      { code: 'no', label: app.localize('language_dropdown_norwegian') },
      { code: 'pl', label: app.localize('language_dropdown_polish') },
      { code: 'pt_BR', label: app.localize('language_dropdown_portuguese') },
      { code: 'ru', label: app.localize('language_dropdown_russian') },
      { code: 'fi', label: app.localize('language_dropdown_finnish') },
      { code: 'sv', label: app.localize('language_dropdown_swedish') },
      { code: 'th', label: app.localize('language_dropdown_thai') },
      { code: 'tr', label: app.localize('language_dropdown_turkish') },
      { code: 'ja', label: app.localize('language_dropdown_japanese') },
      { code: 'ko', label: app.localize('language_dropdown_korean') },
    ]);
  }
});

chrome.runtime.sendMessage({ telemetry: true, category: 'has_opened' });
