<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div :class="['menu-item', { [model.classColor]: hover }]" @click="menuClick" v-if="isVisible && !model.isDivider" @mouseover="hover = true" @mouseleave="hover = false">
    <i :class="['icon', 'icon-medium', model.icon, model.classColor]"></i>
    <span :id="model.id">{{ localize(model.localeKey) }}</span>
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
  data() {
    return {
      hover: false,
    };
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
.primary-20 {
  color: var(--primary20) !important;
}
.accent-20 {
  color: var(--accent20) !important;
}
.information-20 {
  color: var(--blue20) !important;
}
.purple-20 {
  color: var(--purple20) !important;
}
.menu-item {
  height: 45px;
  display: flex;
  align-items: center;
  color: var(--black20);

  span {    
    font-size: 16px;
    font-family: ProximaNova-Semibold;
  }

  &:hover {

  }

  .icon {
    margin-right: 10px;
  }
}
.divider {
  border-bottom: 1px solid var(--gray30);
  margin: 10px 0;
}
</style>