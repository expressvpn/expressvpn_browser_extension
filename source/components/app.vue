<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <!--<transition :name="'fade_' + currentView" mode="out-in">-->
  <div id="appContainer">
    <transition name="slide">
      <component :is="currentView" :class="getClassName"></component>
    </transition>
  </div>
</template>

<script>
import mainScreen from './mainScreen.vue';
import locationsScreen from './LocationPicker/locationsScreen.vue';
import countryScreen from './LocationPicker/countryScreen.vue';
import SettingsGeneral from './settings/SettingsGeneral.vue';
import SettingsPrivacy from './settings/SettingsPrivacy.vue';
import menuScreen from './menuScreen.vue';
import myAccount from './MyAccount/Main.vue';
import helpScreen from './helpScreen.vue';
import acknowledgementsScreen from './acknowledgementsScreen.vue';

export default {
  data() {
    return {
    };
  },
  computed: {
    currentView() {
      return this.$store.getters.currentView;
    },
    previousView() {
      return this.$store.getters.previousView;
    },
    getClassName() {
      if (this.$el !== undefined) {
        this.$el.firstElementChild.className = this.previousView + '-' + this.currentView;
      }
      return this.currentView + '-' + this.previousView;
    },
  },
  components: {
    mainScreen,
    locationsScreen,
    countryScreen,
    SettingsGeneral,
    SettingsPrivacy,
    menuScreen,
    myAccount,
    helpScreen,
    acknowledgementsScreen,
  },
  methods: {
  },
  mounted() {
    // Update rating message conditions whenever open extension since values don't change.
    let self = this;
    chrome.storage.local.get(null, function (storage) {
      if (typeof storage.prefs === 'object') {
        self.rating.updateRatingMessageConditions(storage.prefs.ratingPeriodicity);
      }
    });
  },
};
</script>

<style lang="scss">
  #appContainer {
    display: block;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.4s ease;
  }
  .mainScreen-menuScreen,
  .menuScreen-SettingsGeneral,
  .SettingsGeneral-menuScreen,
  .menuScreen-SettingsPrivacy,
  .SettingsPrivacy-menuScreen,
  .menuScreen-myAccount,
  .myAccount-menuScreen,
  .menuScreen-helpScreen,
  .helpScreen-menuScreen,
  .helpScreen-acknowledgementsScreen,
  .acknowledgementsScreen-helpScreen,
  .mainScreen-locationsScreen,
  .locationsScreen-countryScreen,
  .countryScreen-locationsScreen {
    margin-left: 0;
  }
  .menuScreen-mainScreen.slide-enter,
  .menuScreen-mainScreen.slide-leave-active,
  .SettingsGeneral-menuScreen.slide-enter,
  .SettingsGeneral-menuScreen.slide-leave-active,
  .SettingsPrivacy-menuScreen.slide-enter,
  .SettingsPrivacy-menuScreen.slide-leave-active,
  .myAccount-menuScreen.slide-enter,
  .myAccount-menuScreen.slide-leave-active,
  .acknowledgementsScreen-helpScreen.slide-enter,
  .acknowledgementsScreen-helpScreen.slide-leave-active,
  .helpScreen-menuScreen.slide-enter,
  .helpScreen-menuScreen.slide-leave-active {
    margin-left: -100%;
  }
  .locationsScreen-mainScreen.slide-enter,
  .locationsScreen-mainScreen.slide-leave-active,
  .countryScreen-locationsScreen.slide-enter,
  .countryScreen-locationsScreen.slide-leave-active,
  .countryScreen-mainScreen.slide-enter,
  .countryScreen-mainScreen.slide-leave-active {
    margin-left: 100%;
  }
</style>
