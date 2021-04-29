<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <!--<transition :name="'fade_' + currentView" mode="out-in">-->
  <div id="appContainer" @click="discardHint">
    <transition name="slide">
      <component :is="currentView" :class="getClassName"></component>
    </transition>
  </div>
</template>

<script>
import mainScreen from './mainScreen.vue';
import locationPicker from './locationPicker.vue';
import SettingsGeneral from './settings/SettingsGeneral.vue';
import SettingsPrivacy from './settings/SettingsPrivacy.vue';
import menuScreen from './menuScreen.vue';
import myAccount from './account.vue';
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
    extensionPreferences() {
      return this.$store.getters.extensionPreferences;
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
    locationPicker,
    SettingsGeneral,
    SettingsPrivacy,
    menuScreen,
    myAccount,
    helpScreen,
    acknowledgementsScreen,
  },
  methods: {
    discardHint: function (ev) {
      if (!!this.$el.querySelector('.hint') === true) {
        this.$emit('discard-hint');
      }
    },
  },
  created() {
    let self = this;
    chrome.storage.local.get('prefs', function (storage) {
      if (typeof storage.prefs === 'object') {
        self.$store.dispatch('setExtensionPreferences', Object.assign({}, self.utils.defaultPreferences, storage.prefs));
      }
    });
  },
};
</script>

<style lang="scss">
@import '@/styles/global.scss';

#appContainer {
  display: block;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>
