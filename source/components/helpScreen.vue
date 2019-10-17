<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <secondary-header stringkey="menu_help_support" :onBackClick="sideBackBtnClick" :showSearchOption="false" />
    <div class="help-container">
      <div class="help-section">
        <div class="help-section-header">{{ localize('menu_section_support_title') }}</div>
        <menuItem :model="menuModels['report']" />
        <menuItem :model="menuModels['improvements']" />
        <menuItem :model="menuModels['talk']" />
      </div>
      <div class="divider" />

      <div class="help-section">
        <div class="help-section-header">{{ localize('menu_section_about_title') }}</div>
        <menuItem :model="menuModels['acknowledgements']" />
        <div class="version-info">{{ extensionVersion }}</div>
        <div class="version-info">{{ appVersion }}</div>
        <div class="version-info">{{ hasProxy }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import secondaryHeader from './partials/secondaryHeader.vue';
import menuItem from './partials/menuItem.vue';

export default {
  name: 'helpScreen',
  data: function () {
    return {
      isProxyControllable: false,
      hasProxy: '',
      menuModels: {
        report: {
          icon: 'icon-17-bugs',
          localeKey: 'menu_section_support_report_menu_label',
          classColor: 'accent-20',
          callback: this.contactSupport,
        },
        improvements: {
          icon: 'icon-113-tips',
          localeKey: 'menu_section_support_improvements_menu_label',
          classColor: 'accent-20',
          callback: this.suggestImprovements,
        },
        talk: {
          icon: 'icon-67-live-chat',
          localeKey: 'menu_section_support_chat_menu_label',
          classColor: 'accent-20',
          callback: this.talkToUs,
        },
        acknowledgements: {
          icon: 'icon-3-acknowledge',
          localeKey: 'menu_item_acknowledgements_text',
          classColor: 'accent-20',
          callback: this.acknowledgementsButtonClick,
        },
      },
    };
  },
  computed: {
    extensionVersion() {
      return this.localize('menu_item_extension_version_text').replace('%VERSION%', chrome.runtime.getManifest().version);
    },
    appVersion() {
      let osName = this.currentInfo.os.charAt(0) + this.currentInfo.os.substr(1).toLowerCase();
      return this.localize('menu_item_app_version_text').replace('%OS%', osName).replace('%VERSION%', this.currentInfo.app.version);
    },
  },
  methods: {
    sideBackBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
    contactSupport() {
      this.createTab({ url: `${this.currentInfo.website_url}/support/?utm_source=extension&utm_medium=browser_extension&utm_campaign=contact_support&utm_content=menu_contact_support` });
    },
    talkToUs() {
      this.createTab({ url: `${this.currentInfo.website_url}/support/?utm_source=extension&utm_medium=browser_extension&utm_campaign=contact_support&utm_content=menu_contact_support#open-chat` });
    },
    suggestImprovements() {
      this.createTab({ url: 'https://expressv.typeform.com/to/Jla85o' });
    },
    acknowledgementsButtonClick: function () {
      this.$store.dispatch('setCurrentView', 'acknowledgementsScreen');
    },
  },
  components: {
    secondaryHeader,
    menuItem,
  },
  created() {
    const self = this;
    chrome.proxy.settings.get({}, config => {
      self.isProxyControllable = config.levelOfControl === 'controllable_by_this_extension';
    });
  },
};
</script>

<style lang="scss" scoped>
.divider {
  border-bottom: 1px solid #DEDEDE;
  margin-top: 25px;
}
.version-info {
  margin-top: 25px;
  color: $gray-20;
  font-family: ProximaNova-Semibold;
  font-size: 16px;
  height: 20px;
  line-height: 20px;
  user-select: text;
}
.help {
  &-container {
    background: $gray-50;
    padding: 0 15px;
    height: 100vh;
    border-top: 1px solid #DEDEDE;
  }
  &-section {

      &-header {
        margin-top: 25px;
        margin-bottom: 15px;
        color: $black-20;
        font-family: ProximaNova-Light;
        font-size: 24px;
      }
    }
}
</style>