/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
export default {
  updateCurrentInfo({ commit }, currentInfo) {
    commit('UPDATE_CURRENTINFO', currentInfo);
  },
  setLatestMessage({ commit }, currentInfo) {
    commit('SET_LATEST_MESSAGE', currentInfo);
  },
  setCurrentView({ commit }, currentView) {
    commit('SET_CURRENT_VIEW', currentView);
  },
  setCurrentCountryInfo({ commit }, info) {
    commit('SET_CURRENT_COUNTRY_INFO', info);
  },
  setPreviousScrollPosition({ commit }, pos) {
    commit('SET_PREVIOUS_SCROLL_POSITION', pos);
  },
  setRatingMessageType({ commit }, ratingMessageType) {
    commit('SET_RATING_MESSAGE_TYPE', ratingMessageType);
  },
};
