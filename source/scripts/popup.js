/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import Vue from 'vue';
import { mapGetters } from 'vuex';
import store from './vuex/store';
import utils from './modules/utils';
import rating from './modules/rating';
import App from '../components/app.vue';
import mixin from './mixin';

Vue.mixin(mixin);
const app = new Vue({
  el: '#app',
  store,
  render: h => h(App),
  mounted() {
    chrome.runtime.sendMessage({ getState: true });
    chrome.runtime.sendMessage({ getLocations: true });
    chrome.runtime.sendMessage({ getMessages: true });

    let self = this;
    chrome.storage.local.get(null, (storage) => {
      // show message from cache in case it fails to get a response.
      let msgNumber = 0;
      setInterval((function message() {
        if (typeof storage.latestMessage === 'object') {
          self.$store.dispatch('setLatestMessage', storage.latestMessage[msgNumber]);
          msgNumber = (msgNumber + 1 >= storage.latestMessage.length) ? 0 : msgNumber + 1;
        }
        return message;
      }()), 5 * 60 * 1000);
    });
    // Chromium bug: https://bugs.chromium.org/p/chromium/issues/detail?id=428044
    // Forces pop to increase its size by 2px 100ms after load
    window.setTimeout(function () {
      document.body.style.height = '452px';
      window.setTimeout(function () {
        document.body.style.height = '450px';
      }, 100);
    }, 100);
  },
  computed: mapGetters([
    'currentView',
  ]),
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.state) {
    let currentInfo = message.data;
    let debugState = (new URL(window.location.href)).searchParams.get('state');
    if (!utils.isNullOrEmpty(debugState)) {
      currentInfo.state = debugState;
    }

    app.$store.dispatch('updateCurrentInfo', currentInfo);
    if (app.errorStates.indexOf(currentInfo.state) === -1 && currentInfo.state !== 'NOT_INSTALLED') {
      if (((currentInfo.state === 'connecting') || (currentInfo.state === 'reconnecting')) && (app.currentView !== 'SettingsGeneral' && app.currentView !== 'mainScreen')) {
        app.$store.dispatch('setCurrentView', 'mainScreen');
      }
    }
  } else if (message.latestMessage) {
    if (typeof message.data !== 'undefined') {
      app.$store.dispatch('setLatestMessage', message.data);
    }
  } else if (message.checkRatingMessage) { // Whenever successfully connected, background sends message and here receives.
    if (app.currentView === 'mainScreen') {
      chrome.storage.local.get(null, function (storage) {
        if (rating.isAvailableRateMessageItem(storage.rating, storage.isSubscriber) === true) {
          setTimeout(function () {
            chrome.runtime.sendMessage({ 'updateReviewDate': true });
            app.$store.dispatch('setRatingMessageType', rating.ratingContainer.FACES_SCREEN);
          }, 2000);
        }
      });
    }
  }
});
