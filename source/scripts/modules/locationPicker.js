/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
const filterLocationsByProtocol = (locationsList, targetProtocol) => {
  const filterPredicate = loc => (targetProtocol.toLowerCase() === 'auto'
    || loc.protocols.indexOf(targetProtocol.toLowerCase()) > -1);
  if (Array.isArray(locationsList)) {
    return locationsList.filter(filterPredicate);
  }
  const filteredLocs = {};
  for (let country in locationsList) {
    if (country) {
      Object.assign(filteredLocs, {
        [country]: locationsList[country].filter(filterPredicate),
      });
    }
  }
  return filteredLocs;
};

const trimLocationName = (loc) => {
  let countryTrimmedLocationName = loc.name.includes(' - ') ?
    loc.name.slice(loc.name.indexOf(' - ') + 3) : loc.name;
  if (/^\d+/.test(countryTrimmedLocationName)) {
    countryTrimmedLocationName = loc.name;
  }
  return countryTrimmedLocationName;
};

const isValidRecommendedCountry = (countryLocations, recentLocations) => {
  if (recentLocations.length === 0 || countryLocations.length > 1) {
    return true;
  }
  return countryLocations[0].id !== recentLocations[0].id && (
    recentLocations.length > 1 ? countryLocations[0].id !== recentLocations[1].id : true);
};

const getRecentConnectedLocations = (locationsList) => {
  let max1Time = new Date('0000-01-01T00:00:00Z').getTime();
  let max2Time = new Date('0000-01-01T00:00:00Z').getTime();
  let lastConnectedLocation1 = null;
  let lastConnectedLocation2 = null;
  const recentLocations = [];

  for (let region in locationsList) {
    if (region) {
      const sublist = locationsList[region];
      for (let country in sublist) {
        if (country) {
          for (let i = 0; i < sublist[country].length; i += 1) {
            const lastConnectedTime = new Date(sublist[country][i].last_connected_time).getTime();
            if (lastConnectedTime > 0 && lastConnectedTime > max1Time) {
              max2Time = max1Time;
              max1Time = lastConnectedTime;
              lastConnectedLocation2 = lastConnectedLocation1;
              lastConnectedLocation1 = sublist[country][i];
            } else if (lastConnectedTime > 0 && lastConnectedTime > max2Time) {
              max2Time = lastConnectedTime;
              lastConnectedLocation2 = sublist[country][i];
            }
          }
        }
      }
    }
  }

  if (lastConnectedLocation1) { recentLocations.push(lastConnectedLocation1); }
  if (lastConnectedLocation2) { recentLocations.push(lastConnectedLocation2); }
  return recentLocations;
};

const getLocationByName = (locationsList, name) => {
  for (let continent in locationsList) {
    for (let country in locationsList[continent]) {
      let foundLocationObj = locationsList[continent][country].find(location => location.name === name);
      if (foundLocationObj) {
        return foundLocationObj;
      }
    }
  }
};

const getLocationById = (locationsList, _id) => {
  let id = parseInt(_id, 10);
  for (let continent in locationsList) {
    for (let country in locationsList[continent]) {
      let foundLocationObj = locationsList[continent][country].find(location => parseInt(location.id, 10) === id);
      if (foundLocationObj) {
        return foundLocationObj;
      }
    }
  }
};

const getRecentLocations = (allLocationsList, recentLocations) => {
  let returnLocations = [];

  if (recentLocations && allLocationsList) {
    for (let locationId of recentLocations) {
      returnLocations.push(getLocationById(allLocationsList, locationId));
    }
  }

  return returnLocations;
};

export default {
  filterLocationsByProtocol,
  getLocationByName,
  trimLocationName,
  isValidRecommendedCountry,
  getRecentConnectedLocations,
  getLocationById,
  getRecentLocations,
};
