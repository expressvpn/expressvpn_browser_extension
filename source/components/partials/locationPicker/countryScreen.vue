<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
<div class="country-screen">
  <div class="country-screen-header">
    <div class="back-container" @click="$root.$emit('close-country-screen', { scrollTop: country.scrollTop, region: country.region, searchText: country.searchText })">
      <div class="icon icon-medium icon-12-back"></div>
    </div>
    <img class="flag-icon" v-bind:src="imgSrc" @error="iconError = true" />
    <span id="selectedCountry">{{ country.name }}</span>
  </div>
  <div class="locationList" id="countryLocationsList">
    <location-item
    v-for="location in countryLocations"
    :showFlag="false"
    :model="location"
    :key="location.id"
    type="location"
    />
  </div>
</div>
</template>
<script>

import locationItem from './locationItem.vue';

export default {
  props: {
    country: Object,
  },
  data() {
    return {
      iconError: false,
    };
  },
  computed: {
    countryLocations() {
      let countryLocations = this.locationPicker.filterLocationsByProtocol(this.country.region ? this.currentInfo.allLocationsList[this.country.region][this.country.name] : this.currentInfo.recommendedLocationsList[this.country.name], this.currentInfo.preferences.preferred_protocol);
      return countryLocations;
    },
    imgSrc() {
      let iconName = this.country.code;
      if (this.iconError === true) {
        iconName = 'XV';
      }
      return chrome.extension.getURL('/images/flags/' + iconName.toUpperCase() + '.svg');
    },
  },
  components: {
    locationItem,
  },
  methods: {
    sideBackBtnClick(event) {
      this.$store.dispatch('setCurrentView', 'mainScreen');
    },
  },
  mounted() {
  },
};
</script>
<style lang="scss" scoped>
.country-screen {

  &-header {
    display: flex;
    align-items: center;
    font-size: 16px;
    text-transform: uppercase;
    color: var(--black20);
    height: 29px;
    margin: 23px 0 18px 0;
    padding: 5px 0;

    .flag-icon {
      width: 29px;
      height: 29px;
      margin-right: 10px;
    }

    .icon {
      margin-right: 11px;
    }

    .back-container {
      border-right: 1px solid var(--gray30);
      margin-right: 15px;

      .icon {
        &:hover {
          color: var(--gray20);
        }
        &:active {
          color: var(--black30);
        }
      }
    }
  }
}
</style>
