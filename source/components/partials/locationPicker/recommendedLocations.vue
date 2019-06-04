<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="recommended-locations">
    <div class='category-header'>
      <div>{{ localize('location_picker_smart_location_text') }}</div>
      <div class="icon icon-small icon-103-smart-location"></div>
    </div>
    <location-item
      :model="currentInfo.smartLocation"
      category="recommended"
      type="smart"
    />

    <div class='category-header' v-if="recentLocations.length > 0">
      <div>{{ localize('location_picker_recent_locations_text') }}</div>
      <div class="icon icon-small icon-88-recent"></div>
    </div>
    <location-item
      v-for="location in recentLocations.slice(0, 2)"
      :key="location.id"
      :model="location"
      category="recommended"
      type="location"
    />

    <div class='category-header'>
      <div>{{ localize('location_picker_recommended_locations_text') }}</div>
      <div class="icon icon-small icon-87-rate"></div>
    </div>
    <location-item
      v-for="(locations, countryName) in recommendedLocations"
      :key="`rec-${countryName}`"
      :model="locations[0]"
      category="recommended"
      :type="locations.length > 1 ? 'country' : 'location'"
    />
  </div>
</template>
<script>
import mixinLocation from '@/scripts/mixins/location';
import locationItem from './locationItem.vue';

export default {
  mixins: [mixinLocation],
  components: {
    locationItem,
  },
};
</script>

<style lang="scss">
.category-header {
  font-size: 16px;
  color: #1E1E1E;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  text-transform: uppercase;
}
</style>
