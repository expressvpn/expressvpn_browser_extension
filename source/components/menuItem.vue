<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="menuItem" @click="menuClick" v-if="isAvailable">
    <img
      class="menu-icon"
      :src="chromePath(`/images/${model.iconId}@3x.png`)"
    />
    <div style="margin-top: 1px;margin-left: 8px;">
      <div :id="getId">{{ localize(model.nameId) }}</div>
    </div>
    <img
      class="arrow-icon"
      :src="chromePath('/images/right-arrow@3x.png')"
    />
  </div>
</template>
<script>
export default {
  computed: {
    isAvailable() {
      return (typeof this.model.condition === 'undefined') ? true : this.model.condition();
    },
    getId: function () {
      return this.model.id;
    },
  },
  methods: {
    menuClick($event) {
      let url = '';
      $event.stopPropagation();
      switch (this.model.id) {
        case 'settings_general':
          this.$store.dispatch('setCurrentView', 'SettingsGeneral');
          break;
        case 'settings_privacy':
          this.$store.dispatch('setCurrentView', 'SettingsPrivacy');
          break;
        case 'myAccount':
          this.$store.dispatch('setCurrentView', 'myAccount');
          break;
        case 'help_support':
          this.$store.dispatch('setCurrentView', 'helpScreen');
          break;
        case 'other_devices':
          url = this.currentInfo.website_url + '/setup?utm_source=extension&utm_medium=browser_extension&utm_campaign=browser_extension_links&utm_content=install_vpn_apps';
          break;
        case 'get_free':
          url = this.currentInfo.subscription.referral_url + '&utm_source=extension&utm_medium=browser_extension&utm_campaign=refer_friends&utm_content=bob_hamburger_referfriends';
          break;
        default:
          break;
      }
      if (url !== '') {
        this.createTab({ url: url });
      }
      if (this.model.callback) {
        this.model.callback($event);
      }
    },
  },
  mounted() {
  },
  props: {
    model: Object,
  },
};
</script>

<style lang="css">
  .menuItem {
    height: 35px;
    width: 86%;
    left: 7%;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    line-height: 15px;
    color: #1a1c21;
    position: relative;
    box-sizing: border-box;
    border-bottom: 1px solid #d3d3d3;
    font-family: ProximaNova-Semibold;
  }

  .menuItem img.menu-icon {
    height: 20px;
    width: 20px;
    margin-left: 1px;
  }

  .menuItem img.arrow-icon {
    position: absolute;
    top: 3px;
    right: 0;
    height: 10px;
    padding: 9px 5px 9px 9px;
    filter: invert(60%);
  }

  .menuItem:hover{
    background-color: #f5f5f5;
  }
</style>