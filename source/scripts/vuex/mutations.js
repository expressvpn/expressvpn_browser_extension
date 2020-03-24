/* eslint-disable no-param-reassign */
/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
export default {
  UPDATE_CURRENTINFO(stateParams, newCurrentInfo) {
    let state = stateParams;
    state.currentInfo = newCurrentInfo;
    if (state.currentContainer.startsWith('iap') !== true) {
      if (state.errorStates.indexOf(state.currentInfo.state) === -1) {
        state.currentContainer = 'home'; // 'okContainer';
      } else if (state.errorStates.indexOf(state.currentInfo.state) > -1) {
        state.currentContainer = 'errorContainer';
      }
    }
  },
  SET_CURRENT_CONTAINER(stateParams, newCurrentContainer) { // ToDo: Remove
    let state = stateParams;
    state.currentContainer = newCurrentContainer;
  },
  SET_LATEST_MESSAGE(state, newLatestMessage) {
    state.latestMessage = newLatestMessage;
  },
  SET_CURRENT_VIEW(stateParams, newCurrentView) {
    let state = stateParams;
    state.previousView = state.currentView;
    state.currentView = newCurrentView;
  },
  SET_IGNORE_STATE_UPDATES(stateParams, shouldIgnore) {
    let state = stateParams;
    state.ignoringStateUpdates = shouldIgnore;
  },
  SET_LANG_LIST(state, langList) {
    state.langList = langList;
  },
  SET_EXTENSION_PREFERENCES(state, extensionPreferences) {
    state.extensionPreferences = extensionPreferences;
  },
};
