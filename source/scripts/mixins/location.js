/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
import locationsHelper from '../modules/locationPicker';

export default {
  data: function () {
    return {
    };
  },
  methods: {
    updateLocationAndConnect: function (location) {
      this.currentInfo.selectedLocation = location;
      this.$store.dispatch('updateCurrentInfo', this.currentInfo);
      chrome.runtime.sendMessage({ updateSelectedLocation: true, selectedLocation: this.currentInfo.selectedLocation });
      chrome.runtime.sendMessage({ connectToSelectedLocation: true });
    },
  },
  computed: {
    recentLocations() {
      return locationsHelper.getRecentLocations(this.currentInfo.allLocationsList, this.currentInfo.recent_locations_ids);
    },
    recommendedLocations() {
      const filteredLocations = locationsHelper.filterLocationsByProtocol(this.currentInfo.recommendedLocationsList, this.currentInfo.preferences.preferred_protocol);
      const recentLocations = this.recentLocations; // No need to keep recalculating
      let recommendedLocations = {};
      for (let [locationName, locationObj] of Object.entries(filteredLocations)) {
        if (
          recentLocations.length === 0 ||
          locationObj.length > 1 ||
          recentLocations.some(loc => locationObj[0].id === loc.id) === false
        ) {
          recommendedLocations = Object.assign(recommendedLocations, { [locationName]: locationObj });
        }
      }
      return recommendedLocations;
    },
  },
  mounted() {
  },
  created: function () {
  },
  updated: function () {
  },
};

