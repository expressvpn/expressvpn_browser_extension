<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="helpScreen" :class="currentInfo.state">
    <div class='sideHeader'>
      <div id='settingsBackBtn' class="sideBackBtn" @click="sideBackBtnClick"></div>
      <span>{{ localize('menu_help_support') }}</span>
    </div>
    <div class="help-screen-container">
      <div class="help-section">
        <div class="section-header" id="help_support">{{ localize('menu_section_support_title') }}</div>
        <div class="section-body">
          <div class="section-item" id="help_faq" @click="createTab({ url: currentInfo.website_url + '/support/vpn-setup/expressvpn-browser-extension/?utm_source=extension&utm_medium=browser_extension&utm_campaign=browser_extension_links&utm_content=faq' })">{{ localize('menu_item_faq_text') }}</div>
          <div class="section-item" id="help_contact_support" @click="openAppSupportScreen">{{ localize('menu_item_contact_support_text') }}</div>
<!--           <div class="section-item" id="help_diagnostic" v-if="currentInfo.os !== 'LINUX'" @click="openAppDiagnosticScreen">{{ localize('menu_item_diagnostic_text') }}</div>
 -->        </div>
      </div>
      <div class="help-section">
        <div class="section-header" id="help_tools">{{ localize('menu_section_tools_title') }}</div>
        <div class="section-body">
          <div class="section-item" id="help_ip_check" @click="createTab({ url: currentInfo.website_url + '/what-is-my-ip?utm_source= extension&utm_medium=browser_extension&utm_campaign=ip_address_checker&utm_content=bob_hamburger_ip_address_checker' })">{{ localize('menu_item_ip_address_checker_text') }}</div>
          <div class="section-item" id="help_dns_leak" @click="createTab({ url: currentInfo.website_url + '/dns-leak-test?utm_source= extension&utm_medium=browser_extension&utm_campaign=dns_leak_test&utm_content=bob_hamburger_dns_leak_test' })">{{ localize('menu_item_DNS_leak_test_text') }}</div>
          <div class="section-item" id="help_webrtc_leak" @click="createTab({ url: currentInfo.website_url + '/webrtc-leak-test?utm_source= extension&utm_medium=browser_extension&utm_campaign=webrtc_leak_test&utm_content=bob_hamburger_webrtc_leak_test' })">{{ localize('menu_item_webRTC_leak_test_text') }}</div>
        </div>
      </div>
      <div class="help-section">
        <div class="section-header" id="help_about">{{ localize('menu_section_about_title') }}</div>
        <div class="app-version-container" v-html="extensionVersionContent"/>
        <div class="app-version-container" v-html="appVersionContent"/>
        <div class="section-body">
          <div class="section-item" id="acknowledgementsBtn" @click="acknowledgementsButtonClick">{{ localize('menu_item_acknowledgements_text') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'helpScreen',
  computed: {
    extensionVersionContent() {
      let version = '';
      ({ version } = chrome.runtime.getManifest());
      return '<span class="app-version-text">' + this.localize('menu_item_extension_version_text').replace('%s', version) + '</span>';
    },
    appVersionContent() {
      let osName = this.currentInfo.os.charAt(0) + this.currentInfo.os.substr(1).toLowerCase();
      return '<span class="app-version-text">' +
                this.localize('menu_item_app_version_text').replace('[%p]', osName).replace('%s', this.currentInfo.app.version) +
              '</span>';
    },
  },
  methods: {
    sideBackBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
    openAppSupportScreen: function () {
      let suportScreenText = '/support?utm_source= extension&utm_medium=browser_extension&utm_campaign=contact_support&utm_content=bob_hamburger_contact_support';
      this.createTab({ url: this.currentInfo.website_url + suportScreenText });
    },
    openAppDiagnosticScreen: function () {
      // native will be added later
    },
    acknowledgementsButtonClick: function () {
      this.$store.dispatch('setCurrentView', 'acknowledgementsScreen');
    },
  },
  mounted() {
  },
};
</script>

<style lang="scss">
$xvpn_blue: #1f475a;
$xvpn_blue_light: #317190;
#helpScreen {
  background-color: #f6f6f6;
  height: 100vh;
  width: 100vw;
  z-index: 4;
  float: left;
  position: absolute;
  top: 0;

  .sideHeader {
    border: 0;
  }

  .help-screen-container {
    height: 370px;
    margin: 0px 10px;
    border-radius: 3px;
    background-color: rgb(254,254,254);
    box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.25);
    overflow: hidden;
    .help-section {
      padding: 18px 12px 0 12px;
      .section-header {
        height: 24px;
        font-size: 18px;
        font-family: ProximaNova-Light;
      }
      .section-item {
        height: 24px;
        border-radius: 5px;
        background: $xvpn_blue;
        color: #ffffff;
        line-height: 25px;
        text-align: center;
        margin-bottom: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all .2s;
      }
      .section-item:last-child {
        margin-bottom: 0;
      }
      .section-item:hover {
        background: $xvpn_blue_light;
      }
      .app-version-container {
        font-size: 13px;
        margin-bottom: 5px;
        .app-version-text {
          //  Increase font-size 1 px of "Extension Version" text and make it bold, font-family "PROXIMA NOVA" (original font)
          font-size: 14px;
          font-family: 'ProximaNova-SemiBold';
          span {
            font-size: 13px;
            font-family: 'ProximaNova';
            font-weight: normal;
          }
        }
      }
    }
  }
}
</style>