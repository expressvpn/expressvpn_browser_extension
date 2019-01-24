<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="locationList" :class="{ invisible: !visible }" id="allLocationsList">
    <template
      v-for="(locationsList, region) in currentInfo.allLocationsList"
    >
      <region-item
        :key="region"
        :name="region"
        :expanded="currentExpandedRegion === region"
        @click.native="regionItemClick"
      >
      </region-item>
      <div class="regionList" :data-region="region" :key="`list-${region}`">
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
      currentExpandedRegion: this.$store.state.currentRegion || '',
    };
  },
  components: {
    'location-item': locationItem,
    'region-item': regionItem,
  },
  methods: {
    regionItemClick(event) {
      const regionEl = event.currentTarget;
      const currentRegionItem = this.$el.querySelector('.regionItem.selected');
      let updatedRegion = '';

      if (currentRegionItem) {
        const currentRegionList = currentRegionItem.nextElementSibling;
        currentRegionList.style.maxHeight = null;
      }

      if (!currentRegionItem || currentRegionItem.dataset.name !== regionEl.dataset.name) {
        this.expandRegionItem(regionEl);
        updatedRegion = regionEl.dataset.name;
      }
      this.currentExpandedRegion = decodeURIComponent(updatedRegion);
      const { country, region, country_code } = { country: this.$store.getters.currentCountry, country_code: this.$store.getters.country_code, region: this.currentExpandedRegion };
      this.$store.dispatch('setCurrentCountryInfo', { country, country_code, region });
    },
    expandRegionItem(regionEl, scrollPos) {
      const targetItem = regionEl || this.$el.querySelector('.regionItem.selected');
      if (targetItem) {
        const targetList = targetItem.nextElementSibling;
        targetList.style.maxHeight = targetList.scrollHeight + 'px';
        setTimeout(() => {
          if (scrollPos) {
            this.$el.scrollTop = scrollPos;
          } else {
            targetItem.scrollIntoView(true);
          }
        }, 50);
      }
    },
  },
  mounted() {
    if (this.currentExpandedRegion) {
      this.expandRegionItem(null, this.$store.state.previousScrollPosition);
    }
  },
  beforeDestroy() {
    this.$store.dispatch('setPreviousScrollPosition', this.$el.scrollTop);
  },
  props: {
    visible: Boolean,
  },
};
</script>

<style lang="scss" scoped>
#allLocationsList {
  margin-top: 6px;
  .locationItem:first-child {
    margin-top: 14px;
  }
  .locationItem:last-child {
    margin-bottom: 6px;
  }
  .regionItem {
    margin-top: 0px;
    margin-bottom: 6px;
    :last-child {
      margin-bottom: 5px;
    }
  }
}
</style>
