<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="locationPicker">
    <secondary-header stringkey="location_picker_locations_title" :onBackClick="sideBackBtnClick" :showSearchOption="!searchFlag" :onSearchClick="showSearchBox" />

    <div>
      <div class="location-tab-container">
        <div :class="['location-tab', { active: activeTab === 'recommended' }]" @click="setActiveTab('recommended')">{{ localize('location_picker_tab_recommended_text') }}</div>
        <div :class="['location-tab', { active: activeTab === 'all' }]" @click="setActiveTab('all')">{{ localize('location_picker_tab_all_text') }}</div>
      </div>

      <div class="location-list-container">
        <div v-if="searchFlag">
          <search-box-container v-if="searchFlag" v-model="searchText" :initialText="initialText"/>
          <search-locations-container v-if="searchTypingStatus" :searchText="searchText" />
        </div>

        <country-screen v-if="showCountryScreen && searchTypingStatus === false" :country="currentCountry"/>
        
        <div v-if="showCountryScreen === false && searchTypingStatus === false">
          <recommended-locations v-if="activeTab === 'recommended'" />
          <all-locations v-else :expandRegion="currentExpandedRegion" />
        </div>
      </div>
    </div>

    <popup :options="popupOptions"></popup>
  </div>
</template>
<script>
import mixinLocation from '@/scripts/mixins/location';
import secondaryHeader from './partials/secondaryHeader.vue';
import recommendedLocations from './partials/locationPicker/recommendedLocations.vue';
import allLocations from './partials/locationPicker/allLocations.vue';
import searchLocationsContainer from './partials/locationPicker/searchLocationsContainer.vue';
import searchBoxContainer from './partials/locationPicker/searchBoxContainer.vue';
import countryScreen from './partials/locationPicker/countryScreen.vue';
import popup from './partials/popup.vue';

export default {
  name: 'locationsScreen',
  mixins: [mixinLocation],
  data() {
    return {
      activeTab: 'recommended',
      initialText: '',
      searchText: '',
      searchFlag: false,
      currentCountry: {},
      currentExpandedRegion: '',
      popupOptions: {},
    };
  },
  computed: {
    showCountryScreen() {
      return Object.keys(this.currentCountry).length > 0;
    },
    searchTypingStatus: function () {
      let searchString = this.searchText; // .toLowerCase();
      searchString = searchString.replace(/-/g, '');
      if (this.searchFlag && searchString !== '') {
        return true;
      }
      return false;
    },
  },
  mounted() {
    this.$on('cancelSearch', this.cancelSearch);

    this.$root.$on('show-country-screen', (data) => {
      this.currentCountry = Object.assign(data, { searchText: this.searchText });
    });

    this.$root.$on('close-country-screen', (data) => {
      this.currentExpandedRegion = data.region;
      if (data.searchText !== '') {
        this.initialText = data.searchText;
      } else {
        this.cancelSearch();
      }

      this.currentCountry = {};
      setTimeout(() => {
        document.querySelector('.location-list-container').scrollTop = data.scrollTop;
      }, 10);
    });

    this.$root.$on('connect-to-location', (selectedLocation) => {
      if ((this.currentInfo.state === 'ready' || this.currentInfo.state === 'connection_error') || localStorage.getItem('hasCWCbefore')) {
        this.updateLocationAndConnect(selectedLocation);
      } else if (this.currentInfo.state === 'connected') {
        this.popupOptions = {
          id: 'home_change_location_popup',
          buttons: [
            {
              callback: () => { this.popupOptions = {}; },
            },
            {
              highlightIt: true,
              callback: () => {
                localStorage.setItem('hasCWCbefore', true);
                this.updateLocationAndConnect(selectedLocation);
                this.popupOptions = {};
              },
            },
          ],
          isVisible: true,
          style: 'horizontal',
        };
      }
    });
  },
  components: {
    recommendedLocations,
    allLocations,
    searchLocationsContainer,
    searchBoxContainer,
    secondaryHeader,
    countryScreen,
    popup,
  },
  methods: {
    onWheel(event) {
      if (event.deltaX > 10) {
        this.setActiveTab('all');
      } else if (event.deltaX < -10) {
        this.setActiveTab('recommended');
      }
    },
    sideBackBtnClick(event) {
      this.$store.dispatch('setCurrentView', 'mainScreen');
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
    setActiveTab(tabName) {
      if (this.activeTab !== tabName) {
        this.activeTab = tabName;
        this.currentExpandedRegion = '';
        this.currentCountry = {};
      }
    },
  },
};
</script>

<style lang="scss">
.location-tab {
  font-size: 16px;
  font-family: ProximaNova-Semibold;
  color: #6D6D6D;
  height: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--gray30);

  &.active {
    color: var(--primary20);
    border-bottom: 4px solid var(--primary20);
  }

  &-container {
    height: 45px;
    width: 100%;
    background-color: var(--gray40);
    display: flex;
    align-items: center;
  }
}

.location-list-container {
  background: var(--gray50);
  padding: 0px 15px 10px 15px;
  height: calc(600px - 60px - 45px); // Total popup height - secondary header's height - location-tab-container's height 
  overflow-y: auto;
}

@supports (-moz-appearance:none) {
  // Workaround for Firefox's bug ignoring padding-bottom - https://bugzilla.mozilla.org/show_bug.cgi?id=748518
  .location-list-container:after {
    content: '';
    height: 10px;
    display: block;
  }
}

.location-item {
  height: 45px;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 8px 10px; // set to 10px to remove existing padding from the icon
  cursor: pointer;
  color: var(--black20);
  border-radius: 4px;
  background-color: var(--gray40);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
  margin-top: 10px;

  &-content {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-family: ProximaNova-Semibold;
  }

  &:hover {
    background-color: var(--gray30);

    .location-expand {
      border-color: var(--gray10);
    }
  }

  &:active {
    background-color: var(--gray40);
    box-shadow: none;

    .location-expand {
      border-color: var(--gray30);
    }
  }
  
  .flag-icon {
    width: 29px;
    height: 29px;
    margin-right: 10px;
  }

  .location-expand {
    border-left: 1px solid var(--gray30);
    padding-left: 10px;
  }
}
</style>
<style lang="scss">
[data-theme="dark"] {
  .location-item:hover {
    background-color: var(--black10);
  }
  .location-tab:not(.active) {
    color: var(--gray10);
  }
}
</style>