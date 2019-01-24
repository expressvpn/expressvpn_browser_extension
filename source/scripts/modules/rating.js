/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/

const ratingContainer = {
  GENERAL_MESSAGE: 0,
  FACES_SCREEN: 1,
  NOT_HAPPY_SCREEN: 2,
  HAPPY_SCREEN: 3,
};

const defaultRatingData = {
  'activatedDate': 0,
  'successfulConnections': 0,
  'lastState': '',
  'isRegularUser': false,
  'previousConnectionTime': 0,
  'lastReviewDate': 0,
  'isUserEligible': null,
  'isSuccessfulConnection': false, // I JUST connected successfully after clicking on BOB and my time to connect was not higher than 10 sec.
};

let ratingMessageValues = {
  'prevConnectionTime': 30 * 60,
  'availableReviewTime': 30 * 24 * 60 * 60,
  'isUserEligible': true,
};

// For alpha test, we set previous connection time to 1 minute, set to 5 minutes for last review history, user experiment default value to 100.
// In production mode, previous connection time is 30 mins and review time is 30 days from last review or activated, user experiment value is 10%.
const updateRatingMessageConditions = (periodicity) => {
  if (periodicity === 300) {
    ratingMessageValues = {
      'prevConnectionTime': 1 * 60,
      'availableReviewTime': 5 * 60,
      'isUserEligible': false,
    };
  } else {
    ratingMessageValues = {
      'prevConnectionTime': 30 * 60,
      'availableReviewTime': 30 * 24 * 60 * 60,
      'isUserEligible': true,
    };
  }
};

const isAvailableRateMessageItem = (ratingData, isSubscriber) => {
  if (isSubscriber === true &&
    ratingData.isSuccessfulConnection === true &&
    Date.now() / 1000 - ratingData.lastReviewDate >= ratingMessageValues.availableReviewTime &&
    ratingData.previousConnectionTime >= ratingMessageValues.prevConnectionTime &&
    // in production : ratingData.isUserEligible = true , alpha build: ratingMessageValues.isUserEligible = false
    (ratingData.isUserEligible === true || ratingMessageValues.isUserEligible === false)) {
    return true;
  }
  return false;
};

const updateRatingDataFromState = (ratingParam, newState) => {
  let connectionStartTime = 0;
  let ratingData = ratingParam;
  if (ratingData.lastState === 'ready' && newState === 'connected') {
    chrome.runtime.sendMessage({ 'checkRatingMessage': true });
    connectionStartTime = parseInt(localStorage.getItem('connectionStartTime'), 10);
    if (Date.now() / 1000 - connectionStartTime < 10) { // connection time is not higher than 10 seconds (this excludes auto connect, reconnections, etc).
      ratingData.isSuccessfulConnection = true;
    }
    ratingData.successfulConnections += 1;
    localStorage.setItem('connectionStartTime', Date.now() / 1000); // get the start time to calculate connection lasted time since connected.
  } else if (ratingData.lastState === 'ready' && newState === 'connecting') {
    localStorage.setItem('connectionStartTime', Date.now() / 1000); // get the start time we click on bob.
  } else if (ratingData.lastState === 'connected') {
    connectionStartTime = parseInt(localStorage.getItem('connectionStartTime'), 10);
    ratingData.previousConnectionTime = Date.now() / 1000 - connectionStartTime;
    ratingData.isSuccessfulConnection = false;
  }
  ratingData.lastState = (newState === 'connecting') ? ratingData.lastState : newState; // 'connecting' is buffering condition from one to another.
  return ratingData;
};

let isSubscriberPeriodicity = 15 * 24 * 60 * 60; // 15 days.

// For alpha build, we update Subscriber period for rateVPNItem.
// If set to 300 (5 mins, alpha test), the period will be 300 and if not(production mode), it will be set to default: 15 days.
function updateSubscriberPeriodicity(periodicity) {
  isSubscriberPeriodicity = (periodicity === 300) ? periodicity : periodicity * 15;
}

function checkIfSubscriber(ratingData) {
  if (Date.now() / 1000 - ratingData.activatedDate >= isSubscriberPeriodicity && ratingData.successfulConnections > 4 && ratingData.isRegularUser === true) {
    chrome.storage.local.set({ 'isSubscriber': true });
    chrome.alarms.clear('checkIfSubscriber');
  }
}

module.exports = {
  ratingContainer,
  defaultRatingData,
  isAvailableRateMessageItem,
  updateRatingMessageConditions,
  updateSubscriberPeriodicity,
  checkIfSubscriber,
  updateRatingDataFromState,
};
