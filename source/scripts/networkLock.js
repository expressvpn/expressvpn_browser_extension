import Vue from 'vue';
import VueSvgInlinePlugin from 'vue-svg-inline-plugin';
import store from './vuex/store';
import networkLock from '../components/networkLock';
import * as utils from './modules/utils';
import mixin from './mixin';

Vue.mixin(mixin);
Vue.use(VueSvgInlinePlugin, {
  cache: {
    version: '1.0',
    persistent: false,
  },
});

// eslint-disable-next-line no-new
const app = new Vue({
  el: '#app',
  store,
  mounted() {
    chrome.runtime.sendMessage({ getState: true });
  },
  render: h => h(networkLock),
});

function updateCurrentInfo(_currentInfo) {
  let currentInfo = _currentInfo;
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

chrome.storage.local.get(['currentInfo'], function (storage) {
  if (storage.currentInfo) {
    updateCurrentInfo(storage.currentInfo);
  }
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.currentInfo) {
    updateCurrentInfo(changes.currentInfo.newValue);
  }
});
