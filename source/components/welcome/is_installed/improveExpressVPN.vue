<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <error-icon iconName="icon-6-analytics" />
    <h1>{{ localize('welcome_help_improve_expressvpn_header') }}</h1>
    <p>{{ localize('welcome_help_improve_expressvpn_p1_text') }}</p>
    <div class="button-container">
      <button class="button-primary" @click="helpImprove(true)">{{ localize('welcome_help_improve_expressvpn_ok_button_label') }}</button>
      <button class="button-secondary" @click="helpImprove(false)">{{ localize('welcome_help_improve_expressvpn_no_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
import errorIcon from '../../partials/errorIcon';

export default {
  name: 'improveExpressVPN',
  components: { errorIcon },
  methods: {
    helpImprove: function (value) {
      const self = this;
      chrome.storage.local.get('prefs', function (storage) {
        if (typeof storage.prefs === 'object') {
          const updatedPrefs = Object.assign({}, self.utils.defaultPreferences, storage.prefs, { helpImprove: value });
          chrome.storage.local.set({ 'prefs': updatedPrefs }, function () {
            self.$store.dispatch('setExtensionPreferences', updatedPrefs);
          });
        }
      });
      this.$store.dispatch('setIgnoreStateUpdates', false);
      chrome.runtime.sendMessage({ finishedWelcome: true });
    },
  },
  mounted() {
    localStorage.setItem('hasSeenHelpImproveScreen', true);
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-family: ProximaNova-Light;
  font-size: 24px;
  color: var(--black20);
  text-align: center;
  font-weight: normal;
  margin: 0;
}

p {
  margin-top: 25px;    
  color: var(--black20);
}

a, p, span, li {
  font-size: 18px;
  line-height: 23px;
}
</style>
