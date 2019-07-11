<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <main-header icon="icon-23-close" :iconClickCallback="backToMainScreen"></main-header>
    <div class="menu-container">
      <menu-item v-for="item in menuItems" :key="item.id" :model="item" />
      <!--
      <div class="button-container">
        <button class="button-secondary" @click="resetState">{{ localize('menu_signout_text') }}</button>
      </div>
       -->
    </div>
  </div>
</template>
<script>
import UAParser from 'ua-parser-js';
import mainHeader from './partials/mainHeader.vue';
import menuItem from './partials/menuItem.vue';

export default {
  name: 'menuScreen',
  data: function () {
    return {
      menuItems: [
        {
          id: 'settings_general',
          localeKey: 'menu_settings_general_name',
          icon: 'icon-99-settings',
          classColor: 'primary-20',
        },
        {
          id: 'settings_privacy',
          localeKey: 'menu_settings_privacy_security_name',
          icon: 'icon-97-security',
          classColor: 'primary-20',
        },
        {
          id: 'myAccount',
          localeKey: 'menu_my_account',
          icon: 'icon-2-account',
          classColor: 'primary-20',
        },
        {
          isDivider: true,
        },
        {
          id: 'help_support',
          localeKey: 'menu_help_support',
          icon: 'icon-53-help',
          classColor: 'accent-20',
        },
        {
          isDivider: true,
        },
        {
          id: 'other_devices',
          localeKey: 'menu_setup_other_devices',
          isVisible: this.canSetupOtherDevices,
          icon: 'icon-34-devices',
          classColor: 'information-20',
        },
        {
          id: 'get_free',
          localeKey: 'menu_get_30_days_free',
          isVisible: this.canGetFreeTrial,
          icon: 'icon-91-refer',
          classColor: 'information-20',
        },
        {
          id: 'rate_vpn',
          localeKey: 'menu_rate_expressvpn',
          isVisible: this.canRateExtension,
          icon: 'icon-87-rate',
          callback: this.rateMenuItemClick,
          classColor: 'information-20',
        },
        {
          id: 'beta_feedback',
          localeKey: 'menu_beta_feedback',
          isVisible: () => __IS_BETA__,
          icon: 'icon-17-bugs',
          callback: this.sendBetaFeedback,
          classColor: 'purple-20',
        },
      ],
      isAvailableRateVPN: false,
    };
  },
  computed: {
  },
  components: {
    mainHeader,
    menuItem,
  },
  methods: {
    canGetFreeTrial() {
      return this.utils.isRegularUser(this.currentInfo.subscription) && !this.utils.isPaymentMethodIAP(this.currentInfo.subscription);
    },
    canRateExtension() {
      return (
        this.isAvailableRateVPN && 
        this.currentInfo.ratingData && 
        this.currentInfo.ratingData.everClickedMaxRating === false && 
        !__IS_BETA__) || (__IS_ALPHA__ || (process.env.NODE_ENV === 'development'));
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
  background: $gray-50;
  padding: 20px 15px;
  height: 100vh;
}
</style>
