<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="menu-item" @click="menuClick" v-if="isVisible && !model.isDivider">
    <img v-svg-inline class="icon" :src="`/images/icons/${model.icon}.svg`" width="24" height="24" viewbox="0 0 24 24" />
    <span :id="model.id">{{ localize(model.localeKey) }}</span>
    <img v-if="model.showChevron" v-svg-inline class="icon chevron" :src="`/images/icons/chevron-right.svg`" viewbox="0 0 24 24" width="24" height="24" />
  </div>
  <div class="divider" v-else-if="model.isDivider"></div>
</template>
<script>
export default {
  props: {
    model: {
      type: Object,
    },
  },
  computed: {
    isVisible() {
      return typeof this.model.isVisible !== 'undefined' ? this.model.isVisible() : true;
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
          url = this.currentInfo.website_url + '/setup?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=install_vpn_apps';
          break;
        case 'get_free':
          url = this.currentInfo.subscription.referral_url + '&utm_source=browser_extension&utm_medium=apps&utm_campaign=refer_friends&utm_content=bob_hamburger_referfriends';
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
};
</script>

<style lang="scss" scoped>
.menu-item {
  height: 45px;
  display: flex;
  align-items: center;

  span {
    font-size: 16px;
  }

  &:hover {
    color: var(--font-color-highlight);
  }

  .icon {
    margin-right: 15px;

    &.chevron {
      margin-right: 0;
      margin-left: auto;
      order: 2;
    }
  }
}
.divider {
  height: 20px;
}
</style>
<style lang="scss">
.menu-item {
  .icon path {
    fill: var(--font-color);
  }
  &:hover {
    .icon path {
      fill: var(--font-color-highlight);
    }
  }
}
</style>
