<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="recommended-locations">
    <div class='category-header'>
      <img v-svg-inline class="icon" src='/images/icons/smart-location.svg' height="20" width="20" viewbox="0 0 24 24" />
      <div>{{ localize('location_picker_smart_location_text') }}</div>
    </div>
    <location-item
      :model="currentInfo.smartLocation"
      category="recommended"
      type="smart"
    />

    <div class='category-header' v-if="recentLocations.length > 0">
      <img v-svg-inline class="icon" src='/images/icons/recent.svg' height="20" width="20" viewbox="0 0 24 24" />
      <div>{{ localize('location_picker_recent_locations_text') }}</div>
    </div>
    <div class="category-container">
      <location-item
        v-for="location in recentLocations.slice(0, 2)"
        :key="location.id"
        :model="location"
        category="recommended"
        type="location"
      />
    </div>
    

    <div class='category-header'>
      <img v-svg-inline class="icon" src='/images/icons/rate.svg' height="20" width="20" viewbox="0 0 24 24" />
      <div>{{ localize('location_picker_recommended_locations_text') }}</div>
    </div>
    <div class="category-container">
      <location-item
        v-for="(locations, countryName) in recommendedLocations"
        :key="`rec-${countryName}`"
        :model="locations[0]"
        category="recommended"
        :type="locations.length > 1 ? 'country' : 'location'"
      />
    </div>
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

<style lang="scss" scoped>
.category-header {
  //font-family: Inter-Regular;
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 0px;
  line-height: 28px;
  display: flex;
  align-items: center;

  .icon {
    margin-right: 15px;
    margin-left: 2px;
  }

  &:nth-of-type(n + 2) {
    margin-top: 30px;
  }
}
</style>
<style lang="scss">
.recommended-locations .icon path {
  fill: $eds-color-grey-30;
}
@media (prefers-color-scheme: light) {
  .recommended-locations {
    --cat-header-icon-color: #{$eds-color-grey-30};
  }
}
@media (prefers-color-scheme: dark) {
  .recommended-locations {
    --cat-header-icon-color: #{$eds-color-grey-30};
  }
}
</style>
