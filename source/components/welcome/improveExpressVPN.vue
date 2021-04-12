<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div class="improveExpressVPN">
    <img v-svg-inline class="logo" src='/images/logo.svg' height="32" width="40" viewbox="0 0 128 128" />
    <div class="illustration-container">
      <img class="illustration" src="/images/illustrations/improve.svg" />
    </div>
    <h1>{{ localize('welcome_help_improve_expressvpn_header') }}</h1>
    <p>{{ localize('welcome_help_improve_expressvpn_p1_text') }}</p>

    <div class="button-container">
      <button class="primary" @click="helpImprove(true)">{{ localize('welcome_help_improve_expressvpn_ok_button_label') }}</button>
      <button class="secondary" @click="helpImprove(false)">{{ localize('welcome_help_improve_expressvpn_no_button_label') }}</button>
    </div>
  </div>
</template>
<script type="text/javascript">
export default {
  name: 'improveExpressVPN',
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
.improveExpressVPN {
position: relative;
  height: 100%;

  .illustration-container {
    text-align: center;
  }

  h1 {
    //font-family: Inter-Bold;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0px;
    line-height: 26px;
  }
  p {
    //font-family: Inter-Regular;
    font-size: 16px;
    letter-spacing: 0px;
    line-height: 28px;
  }
}

.logo {
  margin-bottom: 30px;
}

.button-container {
  width: 100%;
  position: absolute;
  bottom: 0px;

  button:nth-of-type(n+2) {
    margin-top: 15px;
  }
}
</style>
<style lang="scss">
@media (prefers-color-scheme: dark) {
  .improveExpressVPN .logo path {
    fill: $eds-color-grey-40;
  }
}
</style>
