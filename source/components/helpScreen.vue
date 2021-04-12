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
      menuModels: {
        report: {
          icon: 'bugs',
          localeKey: 'menu_section_support_report_menu_label',
          callback: this.contactSupport,
          showChevron: true,
        },
        improvements: {
          icon: 'tips',
          localeKey: 'menu_section_support_improvements_menu_label',
          callback: this.suggestImprovements,
          showChevron: true,
        },
        talk: {
          icon: 'live-chat',
          localeKey: 'menu_section_support_chat_menu_label',
          callback: this.talkToUs,
          showChevron: true,
        },
        acknowledgements: {
          icon: 'acknowledge',
          localeKey: 'menu_item_acknowledgements_text',
          callback: this.acknowledgementsButtonClick,
          showChevron: true,
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
      this.createTab({ url: `${this.currentInfo.website_url}/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=contact_support&utm_content=menu_contact_support` });
    },
    talkToUs() {
      this.createTab({ url: `${this.currentInfo.website_url}/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=contact_support&utm_content=menu_contact_support#open-chat` });
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
};
</script>

<style lang="scss" scoped>
.divider {
  margin-top: 25px;
}
.version-info {
  margin-top: 15px;
  color: $eds-color-grey-20;
  font-size: 16px;
  line-height: 28px;
  user-select: text;
}
.help {
  &-container {
    padding: 10px 20px;
    height: 100vh;

    p:first-child {
      margin-block-start: 0;
      margin-block-end: 0;
    }
  }
  &-section {
      &-header {
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 0px;
        line-height: 26px;
        margin-bottom: 10px;
      }
    }
}

</style>
