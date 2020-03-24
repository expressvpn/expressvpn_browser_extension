/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
export default {
  updateCurrentInfo({ commit }, currentInfo) {
    commit('UPDATE_CURRENTINFO', currentInfo);
  },
  setLatestMessage({ commit }, latestMessage) {
    commit('SET_LATEST_MESSAGE', latestMessage);
  },
  setCurrentView({ commit }, currentView) {
    commit('SET_CURRENT_VIEW', currentView);
  },
  setCurrentContainer({ commit }, currentContainer) {
    commit('SET_CURRENT_CONTAINER', currentContainer);
  },
  setIgnoreStateUpdates({ commit }, shouldIgnore) {
    commit('SET_IGNORE_STATE_UPDATES', shouldIgnore);
    if (shouldIgnore === false) {
      chrome.runtime.sendMessage({ getState: true });
    }
  },
  setlangList({ commit }, langList) {
    commit('SET_LANG_LIST', langList);
  },
  setExtensionPreferences({ commit }, extensionPreferences) {
    commit('SET_EXTENSION_PREFERENCES', extensionPreferences);
  },
};
