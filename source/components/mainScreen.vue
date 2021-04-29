<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
<div id="mainScreen" :class="currentContainer" class="container">
  <component :is="currentContainer"></component>
</div>
</template>
<script>
import { mapGetters } from 'vuex';
import home from './home.vue';
import errorContainer from './errors/errorContainer.vue';
import welcome from './welcome.vue';
import issueReporter from './issueReporter.vue';

export default {
  name: 'mainScreen',
  mounted() {
    let self = this;
    chrome.storage.local.get(null, function (storage) {
      if (typeof storage.prefs === 'object') {
        self.prefs = Object.assign({}, self.utils.defaultPreferences, storage.prefs);
      }
    });
  },
  components: {
    home,
    errorContainer,
    welcome,
    issueReporter,
  },
  computed: {
    ...mapGetters([
      'currentInfo',
    ]),
    currentContainer() {
      return this.currentInfo.showWelcome ? 'welcome' : this.$store.getters.currentContainer;
    },
  },
  methods: {
    menuIconClick: function () {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
  },
};
</script>

<style lang="scss" scoped>
#mainScreen {
  height: 100%;
  #settingsIcon {
    position: absolute;
    content: ' ';
    height: 24px;
    width: 24px;
    background-size: contain;
    left: 10px;
    top: 12px;
    //transition: opacity 600ms, visibility 600ms;
    visibility: visible;
    opacity: 1;
  }

  #settingsIcon:hover, #settingsIcon:active {
    cursor: pointer;
  }
}
</style>
