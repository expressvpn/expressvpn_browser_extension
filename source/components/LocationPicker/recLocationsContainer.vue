<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="locationList" :class="{ invisible: !visible }" id="recommendedLocationsList">
    <div class='category-header'>
      <div>{{ localize('location_picker_smart_location_text') }}</div>
      <div
        class="location-icon smart"
      />
    </div>
    <location-item
      :model="currentInfo.smartLocation"
      category="recommended"
      type="smart"
    >
    </location-item>
    <div class='category-header' v-show="recentLocations.length > 0">
      <div>{{ localize('location_picker_recent_locations_text') }}</div>
      <div
        class="location-icon recent"
      />
    </div>
    <location-item
      v-for="location in recentLocations"
      :key="location.id"
      :model="location"
      category="recommended"
      type="location"
      :is-recent="true"
    >
    </location-item>
    <div class='category-header'>
      <div>{{ localize('location_picker_recommended_locations_text') }}</div>
      <div
        class="location-icon recommended"
      />
    </div>
    <location-item
      v-for="(locations, country) in recommendedLocations"
      :key="`rec-${country}`"
      :model="locations[0]"
      category="recommended"
      :type="locations.length > 1 ? 'country' : 'location'"
      v-if="locationPicker.isValidRecommendedCountry(locations, recentLocations)"
    >
    </location-item>
  </div>
</template>
<script>

import { mapGetters } from 'vuex';
import locationItem from './locationItem.vue';

export default {
  computed: {
    ...mapGetters([
      'recentLocations',
    ]),
    recentLocations: function () {
      return this.locationPicker.getRecentConnectedLocations(this.currentInfo.allLocationsList);
    },
    recommendedLocations: function () {
      return this.locationPicker.filterLocationsByProtocol(this.currentInfo.recommendedLocationsList, this.currentInfo.preferences.preferred_protocol);
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
    visible: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss">
.locationList {
  .locationItem:last-child {
    margin-bottom: 5px;
  }
  .category-header {
    height: 12.5px;
    padding: 0 10px;
    margin-top: 20px;
    div {
      float: left;
      text-transform: uppercase;
      font-size: 13px;
      line-height: 16.5px;
      letter-spacing: -0.1px;
      color: #1e1e1e;
      font-family: ProximaNova-Light;
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
</style>
