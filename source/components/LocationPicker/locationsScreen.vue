<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="locationsScreen">
    <div class='sideHeader'>
      <div id='locationBackBtn' class="sideBackBtn" @click="sideBackBtnClick"></div>
      <span>{{ localize('location_picker_locations_title') }}</span>
      <div id='searchBtn' class="searchBtn" @click="showSearchBox"></div>
    </div>
    <template v-if="searchFlag">
      <search-box-container v-model="searchText"></search-box-container>
    </template>
    <template v-if="searchTypingStatus">
      <search-locations-list :searchText="searchText"></search-locations-list>
    </template>
    <template v-else>
      <div class="sideHeader1">
        <div
          id="recLocationsBtn"
          class="locationTypeBtn"
          :class="{ active: currentLocationType === 'recommended' }"
          @click="switchLocationType"
        >
          {{ localize('location_picker_tab_recommended_text') }}
        </div>
        <div
          id="allLocationsBtn"
          class="locationTypeBtn"
          :class="{ active: currentLocationType === 'all' }"
          @click="switchLocationType"
        >
          {{ localize('location_picker_tab_all_text') }}
        </div>
      </div>
      <div id="locationListContainer" class="locationListContainer" v-bind:style="[searchFlag ? { height:'279px'} : { height:'325px'} ]">
        <recommended-locations-list :visible="currentLocationType === 'recommended'"></recommended-locations-list>
        <all-locations-list :visible="currentLocationType === 'all'"></all-locations-list>
      </div>
    </template>
  </div>
</template>
<script>

import recLocationsContainer from './recLocationsContainer.vue';
import allLocationsContainer from './allLocationsContainer.vue';
import searchLocationsContainer from './searchLocationsContainer.vue';
import searchBoxContainer from './searchBoxContainer.vue';
import locationItem from './locationItem.vue';

export default {
  name: 'locationsScreen',
  created() {
    this.$on('cancelSearch', this.cancelSearch);
  },
  data() {
    return {
      currentLocationType: (this.$store.state.previousView === 'countryScreen' &&
        !!this.$store.state.currentRegion) ? 'all' : 'recommended',
      searchText: '',
      searchFlag: false,
    };
  },
  computed: {
    searchTypingStatus: function () {
      let searchString = this.searchText; // .toLowerCase();
      searchString = searchString.replace(/-/g, '');
      if (this.searchFlag && searchString !== '') {
        return true;
      }
      return false;
    },
  },
  components: {
    'recommended-locations-list': recLocationsContainer,
    'all-locations-list': allLocationsContainer,
    'search-locations-list': searchLocationsContainer,
    'search-box-container': searchBoxContainer,
    'location-item': locationItem,
  },
  methods: {
    sideBackBtnClick(event) {
      this.$store.state.currentRegion = null;
      this.$store.dispatch('setCurrentView', 'mainScreen');
    },
    switchLocationType(event) {
      const buttonId = event.target.id;
      if (buttonId === 'allLocationsBtn' && this.currentLocationType === 'recommended') {
        this.currentLocationType = 'all';
      } else if (buttonId === 'recLocationsBtn' && this.currentLocationType === 'all') {
        this.currentLocationType = 'recommended';
      }
    },
    showSearchBox(event) {
      // Show search box
      this.searchFlag = !this.searchFlag;
    },
    cancelSearch(event) {
      // Hide search box
      this.searchFlag = false;
      this.searchText = '';
    },
  },
  mounted() {
  },
};
</script>

<style lang="scss">
  #locationsScreen {
    background: lightblue;
    background-color: #f6f6f6;
    width: 100vw;
    height: 100vh;
    z-index: 3;
    float: left;
    position: absolute;
    top: 0;
  }
  .locationListContainer {
    width: 260px;
    margin-left: 10px;
    height: 338px;
    position: relative;
    border-radius: 0 0 4px 4px;
    background-color: #fefefe;
    box-shadow: 0 4px 4px 2px rgba(0, 0, 0, 0.1);
  }
.locationTypeBtn {
  flex: 1;
  cursor: pointer;
  font-size: 15px;
  text-align: center;
  padding: 17px 0;
  font-family: ProximaNova-Light;
}

.locationTypeBtn.active {
  background-color: #fefefe;
  border-radius: 3px 3px 0 0;
  box-shadow: 0 0 4px 2px rgba(0, 0, 0, 0.1);
  font-family: ProximaNova-Semibold;
}
</style>
