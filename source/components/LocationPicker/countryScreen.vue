<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="countryScreen">
    <div class='sideHeader'>
      <div id='locationBackBtn' class="sideBackBtn" @click="sideBackBtnClick"></div>
      <span>{{ localize('location_picker_locations_title') }}</span>
      <div id='searchBtn' class="searchBtn" @click="showSearchBox"></div>
    </div>
    <template v-if="searchFlag">
      <search-box-container :visible="searchFlag" v-model="searchText"></search-box-container>
    </template>
    <template v-if="searchTypingStatus">
      <search-locations-list :searchText="searchText" :currentCountry="currentCountry" :currentRegion="currentRegion"></search-locations-list>
    </template>
    <template v-else>
      <div class="countryLocationsList" v-bind:style="[searchFlag ? { height:'324px'} : { height:'370px'} ]">
        <div class="countryHeader">
          <div id="countryBackBtn" @click="sideLocationBackBtnClick"></div>
          <img
            class="splitbar-icon"
            :src="chromePath('/images/splitbar@3x.png')"
          />
          <img class="flag-icon" v-bind:src="imgSrc" @error="this.setPlaceholder"/>
          <span id="selectedCountry">{{ currentCountry }}</span>
        </div>
        <div class="locationList" id="countryLocationsList">
          <location-item
            v-for="loc in locationPicker.filterLocationsByProtocol(currentRegion ? currentInfo.allLocationsList[currentRegion][currentCountry] : currentInfo.recommendedLocationsList[currentCountry], currentInfo.preferences.preferred_protocol)"
            category="locationItem"
            :model="loc"
            :key="loc.id"
            type="location"
          >
          </location-item>
        </div>
      </div>      
    </template>
  </div>
</template>
<script>

import { mapGetters } from 'vuex';
import locationItem from './locationItem.vue';
import searchLocationsContainer from './searchLocationsContainer.vue';
import searchBoxContainer from './searchBoxContainer.vue';

export default {
  created() {
    this.$on('cancelSearch', this.cancelSearch);
    let iconName = this.country_code;
    if (window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches) {
      iconName += '@2x';
    }
    this.imgSrc = chrome.extension.getURL('/images/flags/' + iconName + '.png');
  },
  data() {
    return {
      searchText: '',
      searchFlag: false,
      imgSrc: '',
    };
  },
  computed: {
    ...mapGetters([
      'currentInfo',
      'currentCountry',
      'currentRegion',
      'country_code',
    ]),
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
    'location-item': locationItem,
    'search-locations-list': searchLocationsContainer,
    'search-box-container': searchBoxContainer,
  },
  methods: {
    setPlaceholder() {
      let iconName = this.type === 'smart' ? 'smartLocation' : 'placeholder';
      if (window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches) {
        iconName += '@2x';
      }
      this.imgSrc = chrome.extension.getURL('/images/flags/' + iconName + '.png');
    },
    sideBackBtnClick(event) {
      this.$store.state.currentRegion = null;
      this.$store.dispatch('setCurrentView', 'mainScreen');
    },
    sideLocationBackBtnClick(event) {
      this.$store.dispatch('setCurrentView', 'locationsScreen');
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
<style lang="scss" >
  #countryScreen {
    .locationList {
      img.flag-icon {
        display: none;
      }
    }
  }
</style>
<style lang="scss" scoped>
  #countryScreen {
    background: lightblue;
    background-color: #f6f6f6;
    height: 100vh;
    width: 100vw;
    z-index: 4;
    float: left;
    position: absolute;
    top: 0;
  }
  .countryLocationsList {
    position: relative;
    width: 260px;
    height: 370px;
    border-radius: 4px;
    background-color: rgb(254,254,254);
    box-shadow: 0 1.5px 4px 2px rgba(0, 0, 0, 0.1);
    margin-left: 10px;
  }
  #countryLocationsList {
    height: 330px;
    position: absolute;
    left: 0;
    top: 40px;
    right: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .splitbar-icon {
    width: 1px;
    height: 18px;
    position: absolute;
    top: 14px;
    left: 35.5px;
  }
  .flag-icon {
    position: absolute;
    width: 22px;
    height: 22px;
    content: ' ';
    background-size: contain;
    background-repeat: no-repeat;
    margin-right: 12px;
    left: 44px;
    top: 12px;
  }
  #selectedCountry {
    position: absolute;
    left: 75px;
    top: 17px;
    font-size: 13px;
    text-transform: uppercase;
  }
</style>
