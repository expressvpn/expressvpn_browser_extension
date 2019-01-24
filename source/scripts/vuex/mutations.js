/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
export default {
  UPDATE_CURRENTINFO(stateParams, newCurrentInfo) {
    let state = stateParams;
    state.currentInfo = newCurrentInfo;
    if (state.errorStates.indexOf(state.currentInfo.state) === -1 && state.currentInfo.state !== 'NOT_INSTALLED') {
      state.currentContainer = 'okContainer';
    } else if (state.errorStates.indexOf(state.currentInfo.state) > -1) {
      state.currentContainer = 'errorContainer';
    } else {
      state.currentContainer = 'noAppContainer';
    }
  },
  SET_LATEST_MESSAGE(stateParams, newLatestMessage) {
    let state = stateParams;
    state.latestMessage = newLatestMessage;
  },
  SET_CURRENT_VIEW(stateParams, newCurrentView) {
    let state = stateParams;
    state.previousView = state.currentView;
    state.currentView = newCurrentView;
  },
  SET_CURRENT_COUNTRY_INFO(stateParams, info) {
    let state = stateParams;
    state.currentCountry = info.country;
    state.currentRegion = info.region;
    state.country_code = info.country_code;
  },
  SET_PREVIOUS_SCROLL_POSITION(stateParams, pos) {
    let state = stateParams;
    state.previousScrollPosition = pos;
  },
  SET_RATING_MESSAGE_TYPE(stateParams, newRatingMessageType) {
    let state = stateParams;
    state.ratingMessageType = newRatingMessageType;
  },
};
