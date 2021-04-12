<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <error-icon :iconName="iconName" />
    <h1>{{ title }}</h1>
    <p>{{ localize(`error_app_not_found_require_${currentInfo.os}_text`) }}</p>
    <p v-if="!isChromeOS && !isLinux" v-html="addAnchor('error_app_not_found_contact_support_text', '/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_contact_support')" @click="checkForLinks"></p>
    <p v-else-if="isLinux" v-html="addAnchor('error_app_not_found_require_LINUX_snap_text', '/support/vpn-setup/app-for-linux/#software-center')" @click="checkForLinks"></p>
    <p v-else v-html="addAnchor('error_NOT_INSTALLED_chromeOS_manual', '/latest?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_contact_support#manual')" @click="checkForLinks"></p>
    <div class="button-container">
      <button class="primary" @click="primaryClick">{{ localize(`error_NOT_INSTALLED_${isChromeOS ? 'chromeOS_' : ''}primary_button`) }}</button>
      <button class="secondary" @click="secondaryClick">{{ localize(`error_NOT_INSTALLED_${isChromeOS ? 'chromeOS_' : ''}secondary_button`) }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
import errorIcon from '../partials/errorIcon.vue';
import mixinError from '../../scripts/mixins/error';

export default {
  name: 'NOT_INSTALLED',
  // share common functionality with component mixins
  mixins: [mixinError],
  // component properties/variables
  props: {
  },
  // variables
  data: function () {
    return {
    };
  },
  computed: {
    iconName() {
      let name = 'Laptop';

      if (this.isChromeOS) {
        name = 'Laptop3';
      } else if (this.isLinux) {
        name = 'MissingApp';
      }
      return name;
    },
    title() {
      let titleKey = '';
      switch (this.currentInfo.os) {
        case 'LINUX':
          titleKey = 'error_NOT_INSTALLED_linux_title';
          break;
        case 'CHROMIUM':
          titleKey = 'error_NOT_INSTALLED_chromeOS_title';
          break;
        default:
          titleKey = 'error_NOT_INSTALLED_title';
          break;
      }
      return this.localize(titleKey);
    },
    isChromeOS() {
      return this.currentInfo.os === 'CHROMIUM';
    },
    isLinux() {
      return this.currentInfo.os === 'LINUX';
    },
  },
  // when component uses other components
  components: { errorIcon },
  // methods
  watch: {},
  methods: {
    primaryClick() {
      let url = this.currentInfo.website_url + '/setup?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_sign_in_to_set_up';
      if (this.isChromeOS === true) {
        url = 'https://play.google.com/store/apps/details?id=com.expressvpn.vpn&utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_get_started';
      }
      this.createTab({ url });
    },
    secondaryClick() {
      let url = '/order?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_get_started';

      if (this.isChromeOS === true) {
        url = '/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_contact_support';
      }
      url = this.currentInfo.website_url + url;
      this.createTab({ url });
    },
  },
  // component Lifecycle hooks
  beforeCreate() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
.images-container {

  img {
    height: 75px;
    width: 75px;

    &:nth-of-type(n+2) {
      margin-left: 15px;
    }

    &.center {
      height: 100px;
      width: 100px;
    }
  }
}
</style>