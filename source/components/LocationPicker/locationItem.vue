<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div
    class="locationItem"
    :class="{ isSmart: type === 'smart', isRecent: isRecent, isCountry: (category === 'recommended' && type === 'country') }"
    @click="locationItemClick"
  >
    <img class="flag-icon" v-bind:src="imgSrc" @error="this.setPlaceholder" />
    <div style="margin-top: 1px;" v-if="type === 'smart'">
      <div class="locationName">{{ model.name }}</div>
    </div>
    {{ type !== 'smart' ? (type === 'country' ? model.country : model.name) : '' }}
    <img
      class="arrow-icon"
      :data-type="category"
      :src="chromePath('/images/right-arrow@3x.png')"
      @click="countryClick"
      v-if="type === 'country'"
    />
    <img
      class="splitbar-icon"
      :data-type="category"
      :src="chromePath('/images/splitbar@3x.png')"
      @click="countryClick"
      v-if="type === 'country'"
    />
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      imgSrc: '',
    };
  },
  computed: {
  },
  methods: {
    setPlaceholder() {
      let iconName = this.type === 'smart' ? 'smartLocation' : 'placeholder';
      if (window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches) {
        iconName += '@2x';
      }
      this.imgSrc = chrome.extension.getURL('/images/flags/' + iconName + '.png');
    },
    countryClick(event) {
      event.stopPropagation();
      const { country, region, country_code } = this.model;
      if (this.category === 'recommended') {
        this.$store.dispatch('setCurrentCountryInfo', { country, country_code });
      } else {
        this.$store.dispatch('setCurrentCountryInfo', { country, country_code, region });
      }
      this.$store.dispatch('setCurrentView', 'countryScreen');
    },
    locationItemClick(event) {
      let is_smart_location = (this.currentInfo.smartLocation.id === this.model.id);
      let is_country = (this.type === 'country');
      let selectedLocation = Object.assign({}, this.model, { is_smart_location, is_country });
      if (is_country === true) {
        selectedLocation.name = this.model.country;
      }
      this.currentInfo.selectedLocation = selectedLocation;
      this.$store.dispatch('updateCurrentInfo', this.currentInfo);

      chrome.runtime.sendMessage({ updateSelectedLocation: true, selectedLocation: selectedLocation });
      chrome.runtime.sendMessage({ connectToSelectedLocation: true });
    },
  },
  created() {
    let iconName = this.model.country_code;
    if (window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches) {
      iconName += '@2x';
    }
    this.imgSrc = chrome.extension.getURL('/images/flags/' + iconName + '.png');
  },
  mounted() {
  },
  props: {
    model: Object,
    category: String,
    type: String,
    isRecent: Boolean,
  },
};
</script>

<style lang="css">
  .locationItem {
    height: 34px;
    width: 93%;
    display: flex;
    align-items: center;
    padding: 5px 30px 6px 11px;
    cursor: pointer;
    line-height: 15px;
    color: #1a1c21;
    position: relative;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: #f6f6f6;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    margin-top: 6px;
    margin-left: 10px;
    font-size: 13px;
    font-family: ProximaNova-Semibold;
  }

  .locationItem img.flag-icon {
    width: 22px;
    height: 22px;
    content: ' ';
    background-size: contain;
    background-repeat: no-repeat;
    margin-right: 10px;
  }

  .locationItem img.arrow-icon {
    position: absolute;
    top: 2px;
    right: 0px;
    height: 10px;
    padding: 10px;
  }

  .locationItem img.splitbar-icon {
    position: absolute;
    top: 7px;
    right: 28px;
    height: 21px;
  }

  .locationItem img.clock-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    height: 15px;
  }

  .locationItem:hover{
    background-color: #f5f5f5;
  }
</style>
