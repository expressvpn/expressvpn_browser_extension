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
import locationItem from './locationItem.vue';

export default {
  computed: {
    searchItemCount: function () {
      return Object.keys(this.searchMatchedLocations).length;
    },
    searchMatchedLocations: function () {
      let filteredLocations = [];
      let regionObj = [];
      let rxSearch = new RegExp(this.utils.escapeRegExp(this.searchText.replace(/ +(?= )/g, '')), 'i');
      if (!this.searchText.trim()) {
        rxSearch = new RegExp(/(?:)/, 'i');
      }
      for (let region in this.currentInfo.allLocationsList) {
        regionObj = this.locationPicker.filterLocationsByProtocol(this.currentInfo.allLocationsList[region], this.currentInfo.preferences.preferred_protocol);
        for (let country in regionObj) {
          // Allow search by partial country name and by country code
          if (rxSearch.test(country) || regionObj[country].some((el) => el.country_code === this.searchText.toUpperCase())) {
            if (regionObj[country].length > 1) {
              if (this.currentCountry) {
                regionObj[country].forEach(function (locationObj) {
                  if (rxSearch.test(locationObj.name)) {
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
              if (rxSearch.test(locationObj.name)) {
                filteredLocations.push({ isCountry: false, locationObj: locationObj });
              }
            });
          }
        }
      }
      return filteredLocations.sort((loc1, loc2) => (loc1.locationObj.sort_order - loc2.locationObj.sort_order));
    },
  },
  components: {
    'location-item': locationItem,
  },
  methods: {
  },
  mounted() {
  },
  props: {
    searchText: {
      type: String,
      default: '',
    },
    currentCountry: {
      type: String,
      default: '',
    },
    currentRegion: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss">
.locationList {
  .category-header {
    height: 12.5px;
    padding: 0 10px;
    margin-top: 20px;
    div {
      float: left;
      text-transform: uppercase;
      font-size: 12px;
      line-height: 16.5px;
    }
    .location-icon {
      float: right;
      height: 12px;
      width: 12px;
      background-size: contain;
      background-repeat: no-repeat;
    }
  }
}
.searchResultContainer {
  width: 260px;
  height: 325px;
  border-radius: 4px;
  background-color: #fefefe;
  box-shadow: 0 1.5px 4px 2px rgba(0, 0, 0, 0.1);
  margin-left: 10px;
  overflow-y: auto;
  overflow-x: hidden;    
  .locationItem:first-child {
    margin-top: 20px;
  }
}
.search-no-result {
  width: 240px;
  height: 17.3px;
  font-size: 13.5px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.28;
  letter-spacing: normal;
  text-align: left;
  color: #1a1c21;
  margin-top: 20px;
  margin-left: 10px;
}

</style>
