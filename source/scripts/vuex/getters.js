/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
export default {
  currentInfo: state => state.currentInfo,
  errorStates: state => state.errorStates,
  latestMessage: state => state.latestMessage,
  currentContainer: state => state.currentContainer,
  currentView: state => state.currentView,
  previousView: state => state.previousView,
  previousScrollPosition: state => state.previousScrollPosition,
  currentCountry: state => state.currentCountry,
  currentRegion: state => state.currentRegion,
  country_code: state => state.country_code,
  ratingMessageType: state => state.ratingMessageType,
};
