<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="searchResultContainer">
      <div class="search-no-result" v-if="searchItemCount < 1">
        {{ localize('location_picker_search_no_results_text') }}
      </div>
      <location-item
        v-for="matchData in searchMatchedLocations"
        :key="`all-${matchData.locationObj.id}`"
        :model="matchData.locationObj"
        category="all"
        :type="matchData.isCountry ? 'country' : 'location'"
      >
      </location-item>
  </div>
</template>
<script>
import locationItem from './locationItem';

export default {
  computed: {
    searchItemCount: function () {
      return Object.keys(this.searchMatchedLocations).length;
    },
    searchMatchedLocations: function () {
      const cleanText = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let filteredLocations = [];
      let regionObj = [];
      let rxSearch = new RegExp(this.utils.escapeRegExp(cleanText(this.searchText).replace(/ +(?= )/g, '')), 'i');
      if (!cleanText(this.searchText).trim()) {
        rxSearch = new RegExp(/(?:)/, 'i');
      }
      // In case we're inside the country screen, show only matches for given country
      if (this.$parent.showCountryScreen === true) {
        Object.keys(this.currentInfo.allLocationsList).forEach(regionName => {
          let countryObj = this.locationPicker.filterLocationsByProtocol(this.currentInfo.allLocationsList[regionName], this.currentInfo.preferences.preferred_protocol)[this.$parent.currentCountry.name];
          if (countryObj) {
            countryObj.forEach(function (locationObj) {
              if (rxSearch.test(cleanText(locationObj.name))) {
                filteredLocations.push({ isCountry: false, locationObj: locationObj });
              }
            });
          }
        });
      } else {
        for (let region in this.currentInfo.allLocationsList) {
          regionObj = this.locationPicker.filterLocationsByProtocol(this.currentInfo.allLocationsList[region], this.currentInfo.preferences.preferred_protocol);
          for (let country in regionObj) {
            // Allow search by partial country name and by country code
            if (rxSearch.test(cleanText(country)) || regionObj[country].some((el) => el.country_code === this.searchText.toUpperCase())) {
              if (regionObj[country].length > 1) {
                if (this.currentCountry) {
                  regionObj[country].forEach(function (locationObj) {
                    if (rxSearch.test(cleanText(locationObj.name))) {
                      filteredLocations.push({ isCountry: false, locationObj: locationObj });
                    }
                  });
                } else {
                  filteredLocations.push({ isCountry: true, locationObj: regionObj[country][0] });
                }
              } else {
                // Set type to location if country has only one location since it doesn't make sense to show the country screen for just 1 cluster
                filteredLocations.push({ isCountry: false, locationObj: regionObj[country][0] });
              }
            } else {
              regionObj[country].forEach(function (locationObj) {
                if (rxSearch.test(cleanText(locationObj.name))) {
                  filteredLocations.push({ isCountry: false, locationObj: locationObj });
                }
              });
            }
          }
        }
      }
      return filteredLocations.sort((loc1, loc2) => (loc1.locationObj.sort_order - loc2.locationObj.sort_order));
    },
  },
  components: {
    'location-item': locationItem,
  },
  props: {
    searchText: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.search-no-result {
  //font-family: Inter-Regular;
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 0px;
  line-height: 28px;
  text-align: center;
}
</style>
