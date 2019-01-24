<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="menuScreen">
    <div class="header" id="header">
      <div class="longLogo"></div>
      <button id="backToMainScreenButton" @click="backToMainScreen"></button>
    </div>
    <div class="menuContainer" id="menuContainer">
      <menu-item
        v-for="item in menuItems"
        v-bind:key="item.id"
        :model="item"
      >
      </menu-item>
    </div>
    <popup
      :options="options"
    >
    </popup>
  </div>
</template>
<script>
import menuItem from './menuItem.vue';
import popup from './popup.vue';

export default {
  name: 'menuScreen',
  data: function () {
    return {
      menuItems: [
        { id: 'settings_general', nameId: 'menu_settings_general_name', iconId: 'Settings' },
        { id: 'settings_privacy', nameId: 'menu_settings_privacy_security_name', iconId: 'Security' },
        { id: 'myAccount', nameId: 'menu_my_account', iconId: 'Account' },
        { id: 'help_support', nameId: 'menu_help_support', iconId: 'Help' },
        {
          id: 'other_devices', nameId: 'menu_setup_other_devices', iconId: 'Devices', condition: this.canSetupOtherDevices,
        },
        {
          id: 'get_free', nameId: 'menu_get_30_days_free', iconId: 'Gift', condition: this.canGetFreeTrial,
        },
        {
          id: 'rate_vpn', nameId: 'menu_rate_expressvpn', iconId: 'ThumbsUp', condition: this.canRateExtension, callback: this.rateMenuItemClick,
        },
      ],
      options: {},
      isAvailableRateVPN: false,
      isRegularUser: false,
    };
  },
  computed: {
  },
  components: {
    'menu-item': menuItem,
    'popup': popup,
  },
  methods: {
    backToMainScreen: function (event) {
      this.$store.dispatch('setCurrentView', 'mainScreen');
    },
    rateMenuItemClick: function () {
      this.options = {
        id: 'menu_ratevpn',
        cbBtn1: this.leaveRatingClick,
        cbBtn2: this.helpBtnClick,
        condition: true,
        style: 'VERTICAL',
      };
    },
    leaveRatingClick: function (event) {
      let currentBrowser = this.browserInfo.name;
      if (currentBrowser === 'Chrome') {
        this.createTab({ url: 'https://chrome.google.com/webstore/detail/expressvpn-for-chrome/fgddmllnllkalaagkghckoinaemmogpe/reviews' });
      } else if (currentBrowser === 'Firefox') {
        this.createTab({ url: 'https://addons.mozilla.org/en-US/firefox/addon/expressvpn/' });
      }
    },
    helpBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'helpScreen');
    },
    canSetupOtherDevices: function () {
      return this.isRegularUser;
    },
    canGetFreeTrial: function () {
      return this.isRegularUser;
    },
    canRateExtension: function () {
      return this.isAvailableRateVPN;
    },
  },
  mounted() {
    let self = this;
    chrome.storage.local.get(null, function (storage) {
      let ratingValues = storage.rating;
      self.isRegularUser = ratingValues.isRegularUser;
      self.isAvailableRateVPN = (storage.isSubscriber === true);
    });
  },
};
</script>
<style lang="scss" scoped>
$xvpn_red: #c8252c;
#menuScreen {
  background-color: #f6f6f6;
  width: 100vw;
  height: 100vh;
  z-index: 3;
  float: left;
  position: absolute;
  top: 0;

  .longLogo {
    top: 18px;
    left: 18px;
  }

  #backToMainScreenButton {
    position: absolute;
    content: ' ';
    height: 13px;
    width: 13px;
    background-color: transparent;
    background-size: contain;
    background-repeat: no-repeat;
    border: none;
    right: 18px;
    top: 27px;
    transition: opacity 600ms, visibility 600ms;
    visibility: visible;
    filter: invert(60%);
    cursor: pointer;
    opacity: 1;
  }

  #backToMainScreenButton:hover {
    filter: invert(80%);
  }

  #menuContainer {
    padding-top: 15px;
  }

  .signoutBtnHolder {
    position: absolute;
    bottom: 18px;
    text-align: center;
    width: 100%;
    button {
      width: 213px;
      height: 32.6px;
      border-radius: 3.2px;
      background-color: #ffffff;
      border: 1px solid #c8252c !important;
      text-align: center;
      color: #c8252c;
      border: 0;
      transition: all .2s;
      font-weight: bold;
      font-size: 13px;
    }
    button:hover {
      color: #ffffff;
      background-color: #c8252c;
    }
    button:focus {
      color: #ffffff;
      background: #9d1d23;
    }
  }
}
</style>
