<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
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
    setTheme: function () {
      this.$store.state.imageSuffix = (this.extensionPreferences.displayMode === 'dark' || this.extensionPreferences.displayMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '_dark' : '';
      switch (this.extensionPreferences.displayMode) {
          case 'light':
          case 'dark':
            document.documentElement.setAttribute('data-theme', this.extensionPreferences.displayMode);
            break;
          case 'auto':
            document.documentElement.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            break;
          default:
            break;
        }
    }
  },
  created() {
    let self = this;
    chrome.storage.local.get('prefs', function (storage) {
      if (typeof storage.prefs === 'object') {
        self.$store.dispatch('setExtensionPreferences', Object.assign({}, self.utils.defaultPreferences, storage.prefs));
        self.setTheme();
      }
    });
    window.matchMedia("(prefers-color-scheme: dark)").addListener((ev) => {
      self.setTheme();
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
