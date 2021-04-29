<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template>
<div class="country-screen">
  <div class="country-screen-header">
    <div class="back-container" @click="$root.$emit('close-country-screen', { scrollTop: country.scrollTop, region: country.region, searchText: country.searchText })">
      <img class="country-back-icon" v-svg-inline src='/images/icons/chevron-left.svg' width="24" height="24" />
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
};
</script>
<style lang="scss" scoped>
.country-screen {
  &-header {
    display: flex;
    align-items: center;

    //font-family: Inter-Regular;
    font-size: 14px;
    font-weight: normal;
    letter-spacing: -0.15px;

    .flag-icon {
      width: 24px;
      height: 24px;
      margin-right: 15px;
    }

    .back-container {
      width: 24px;
      height: 24px;
      margin-right: 15px;
    }
  }
  .location-item:nth-child(n + 2):before {
    content: '';
    border-top: 1px solid var(--location-item-border-color);
    top: 0;
    width: 100%;
    left: 0;
    opacity: 0.4;
    position: absolute;
  }
}
</style>
<style lang="scss">
.country-back-icon path {
  fill: var(--font-color-highlight);
}
</style>
