import Vue from 'vue';
import store from './vuex/store';
import networkLock from '../components/networkLock';
import * as utils from './modules/utils';
import mixin from './mixin';

Vue.mixin(mixin);

// eslint-disable-next-line no-new
const app = new Vue({
  el: '#app',
  store,
  mounted() {
    chrome.runtime.sendMessage({ getState: true });
  },
  render: h => h(networkLock),
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.state) {
    let currentInfo = message.data;
    if (process.env.NODE_ENV === 'development') {
      let debugData = (new URL(window.location.href)).searchParams.get('data');
      let debugLocale = (new URL(window.location.href)).searchParams.get('locale');
      if (!utils.isNullOrEmpty(debugData)) {
        currentInfo = require('object-assign-deep')(currentInfo, JSON.parse(debugData));
      }
      if (!utils.isNullOrEmpty(debugLocale)) {
        chrome.runtime.sendMessage({ mock: true, category: 'locale', locale: debugLocale });
      }
    }
    app.$store.dispatch('updateCurrentInfo', currentInfo);
  }
});
