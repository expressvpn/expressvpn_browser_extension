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
  ignoringStateUpdates: state => state.ignoringStateUpdates,
  langList: state => state.langList,
  extensionPreferences: state => state.extensionPreferences,
};
