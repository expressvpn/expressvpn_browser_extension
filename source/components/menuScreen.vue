<!--
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <secondary-header stringkey="menu_header" :onBackClick="backToMainScreen" />
    <div class="menu-container">
      <menu-item v-for="item in menuItems" :key="item.id" :model="item" />
    </div>
  </div>
</template>
<script>
import UAParser from 'ua-parser-js';
import secondaryHeader from './partials/secondaryHeader';
import menuItem from './partials/menuItem';

export default {
  name: 'menuScreen',
  data: function () {
    return {
      menuItems: [
        {
          id: 'settings_general',
          localeKey: 'menu_settings_general_name',
          icon: 'settings',
        },
        {
          id: 'settings_privacy',
          localeKey: 'menu_settings_privacy_security_name',
          icon: 'security',
        },
        {
          id: 'myAccount',
          localeKey: 'menu_my_account',
          icon: 'account',
        },
        {
          isDivider: true,
        },
        {
          id: 'help_support',
          localeKey: 'menu_help_support',
          icon: 'help',
        },
        {
          isDivider: true,
        },
        {
          id: 'other_devices',
          localeKey: 'menu_setup_other_devices',
          isVisible: this.canSetupOtherDevices,
          icon: 'devices',
        },
        {
          id: 'get_free',
          localeKey: 'menu_get_30_days_free',
          isVisible: this.canGetFreeTrial,
          icon: 'refer',
        },
        {
          id: 'rate_vpn',
          localeKey: 'menu_rate_expressvpn',
          isVisible: this.canRateExtension,
          icon: 'rate',
          callback: this.rateMenuItemClick,
        },
        {
          id: 'beta_feedback',
          localeKey: 'menu_beta_feedback',
          isVisible: () => __IS_BETA__,
          icon: 'bugs',
          callback: this.sendBetaFeedback,
        },
      ],
      isAvailableRateVPN: false,
    };
  },
  computed: {
  },
  components: {
    secondaryHeader,
    menuItem,
  },
  methods: {
    canGetFreeTrial() {
      return this.utils.isRegularUser(this.currentInfo.subscription) && !this.utils.isPaymentMethodIAP(this.currentInfo.subscription);
    },
    canRateExtension() {
      return (
        ['Chrome', 'Firefox'].includes(this.browserInfo.name)
        && this.isAvailableRateVPN
        && this.currentInfo.ratingData
        && this.currentInfo.ratingData.everClickedMaxRating === false
        && !__IS_BETA__) || (__IS_ALPHA__ || (process.env.NODE_ENV === 'development'));
    },
    canSetupOtherDevices() {
      return this.utils.isRegularUser(this.currentInfo.subscription);
    },
    backToMainScreen: function (event) {
      this.$store.dispatch('setCurrentView', 'mainScreen');
    },
    rateMenuItemClick: function () {
      let self = this;
      this.backToMainScreen();
      setTimeout(() => {
        self.$root.$emit('show-rating-prompt');
      }, 100);
    },
    helpBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'helpScreen');
    },
    sendBetaFeedback() {
      const systemInfo = UAParser(window.navigator.userAgent);
      const url = `https://expressv.typeform.com/to/Jla85o?browser_name=${systemInfo.browser.name}&browser_ver=${systemInfo.browser.version}&ext_ver=${chrome.runtime.getManifest().version}&os_name=${systemInfo.os.name}&os_ver=${systemInfo.os.version}&app_ver=${this.currentInfo.app.version}&locale=${this.currentInfo.locale}&is_beta=true`;
      this.createTab({ url });
    },
  },
  mounted() {
    let self = this;
    chrome.storage.local.get(null, function (storage) {
      self.isAvailableRateVPN = (storage.isSubscriber === true);
    });
  },
};
</script>
<style lang="scss" scoped>
.menu-container {
  padding: 0px 20px;
}
</style>
