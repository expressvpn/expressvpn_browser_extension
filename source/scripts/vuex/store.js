/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';

import { currentInfo as currentInfoModel, defaultPreferences } from '../modules/utils';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    currentInfo: currentInfoModel,
    errorStates: [
      // virtual states
      'BAD_OS_VERSION', 'BAD_APP_VERSION', 'NOT_INSTALLED', 'iapError', 'subscription_expiring', 'subscription_expiring_autobill',
      // real states returned by the engine
      'not_activated', 'connection_error', 'fraudster', 'internal_error', 'network_error', 'subscription_expired',
      'license_revoked', 'activation_error', 'duplicate_license_used', 'forced_signout',
    ],
    latestMessage: {},
    currentView: 'mainScreen',
    previousView: '',
    currentContainer: '',
    ignoringStateUpdates: false,
    langList: [],
    extensionPreferences: defaultPreferences,
    imageSuffix: '',
  },
  getters: getters,
  mutations: mutations,
  actions: actions,
});

export default store;
