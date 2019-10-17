/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/

const defaultRatingData = {
  'activatedDate': Date.now() / 1000,
  'currentConnectionStartTime': 0,
  'lastConnectionStartTime': 0,
  'successfulConnections': 0,
  'isRegularUser': false,
  'previousConnectionTime': 0,
  'isSuccessfulConnection': false,
  'everClickedMaxRating': false,
  'lastDiscardDate': 0,
  'lastFailedRateDate': 0,
};

function checkIfSubscriber(ratingData) {
  const activationTimeframe = (__IS_ALPHA__ || process.env.NODE_ENV === 'development') ? 0 : 15 * 24 * 60 * 60;
  return (
    Date.now() / 1000 - ratingData.activatedDate >= activationTimeframe &&
    ratingData.successfulConnections >= 5 &&
    ratingData.isRegularUser === true
  );
}

const updateRatingDataFromState = (ratingParam, data) => {
  let ratingData = ratingParam;
  if (data.oldstate === 'ready' && data.newstate === 'connecting') {
    ratingData.currentConnectionStartTime = Date.now() / 1000;
  } else if (data.oldstate === 'connecting' && data.newstate === 'connected') {
    if (Date.now() / 1000 - ratingData.currentConnectionStartTime < 10) { // connection time is not higher than 10 seconds (this excludes auto connect, reconnections, etc).
      ratingData.isSuccessfulConnection = true;
      ratingData.successfulConnections += 1;
    }
    ratingData.currentConnectionStartTime = 0; // reset it
    ratingData.lastConnectionStartTime = Date.now() / 1000;
  } else if (data.oldstate === 'connected') {
    ratingData.previousConnectionTime = (Date.now() / 1000 - ratingData.lastConnectionStartTime);
    ratingData.lastConnectionStartTime = 0; // reset it
    ratingData.isSuccessfulConnection = false;
  }
  ratingData.isSubscriber = checkIfSubscriber(ratingData);
  return ratingData;
};

export default {
  defaultRatingData,
  updateRatingDataFromState,
};
