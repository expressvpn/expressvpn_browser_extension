<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="locationList">
    <template v-for="(locationsList, region) in currentInfo.allLocationsList">
      <region-item
        :key="region"
        :name="region"
        :expanded="currentExpandedRegion === region"
        @click.native="currentExpandedRegion = (currentExpandedRegion !== region ? region : '')" />
      <div class="regionList" :data-region="region" :key="`list-${region}`" v-show="currentExpandedRegion === region">
        <location-item
          v-for="(locations, country) in locationPicker.filterLocationsByProtocol(locationsList, currentInfo.preferences.preferred_protocol)"
          :key="`all-${country}`"
          :model="locations[0]"
          category="all"
          :type="locations.length > 1 ? 'country' : 'location'"
        >
        </location-item>
      </div>
    </template>
  </div>
</template>
<script>
import locationItem from './locationItem.vue';
import regionItem from './regionItem.vue';

export default {
  data() {
    return {
      currentExpandedRegion: this.expandRegion || '',
    };
  },
  components: {
    locationItem,
    regionItem,
  },
  props: {
    expandRegion: {
      type: String,
      required: false,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
