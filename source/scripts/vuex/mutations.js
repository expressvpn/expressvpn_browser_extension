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
  SET_LATEST_MESSAGE(stateParams, newLatestMessage) {
    let state = stateParams;
    state.latestMessage = newLatestMessage;
  },
  SET_CURRENT_VIEW(stateParams, newCurrentView) {
    let state = stateParams;
    state.previousView = state.currentView;
    state.currentView = newCurrentView;
  },
  SET_RATING_MESSAGE_TYPE(stateParams, newRatingMessageType) {
    let state = stateParams;
    state.ratingMessageType = newRatingMessageType;
  },
  SET_IGNORE_STATE_UPDATES(stateParams, shouldIgnore) {
    let state = stateParams;
    state.ignoringStateUpdates = shouldIgnore;
  },
};
