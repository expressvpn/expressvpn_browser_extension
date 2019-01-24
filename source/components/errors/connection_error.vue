<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <div class="errorHeader">
      <div id="errorHeader" v-html="localize('error_connection_error_to_location_text').replace('%1', '<br /><div style=\'margin-top: 3px;font-weight: bold;\'>' + currentInfo.selectedLocation.name + '</div>')"></div>
      <span class="promobar-icon"></span>
    </div>
    <div class='errorMessage' :class="currentInfo.state">
      <p id='p1'>{{ localize('error_connection_error_check_connection_text') }}</p>
      <p id='p2' v-html="getConvertedText(localize(`error_connection_error_contact_support_text`))" @click="checkForLinks"></p>
      <p v-if="lockStatus == 'on'">{{ localize('error_connection_error_lock_on_text') }}</p>
    </div>
    <div class="errorBtnsHolder">
      <button @click="reconnect" id="btnTryAgain">{{ localize('error_connection_error_try_again_button_label') }}</button>
      <button @click="resetState" id="btnReturnHome">{{ localize(`error_connection_error_return_home_button_label_network_lock_${lockStatus}`) }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';

  export default {
    name: 'connection_error',
    // share common functionality with component mixins
    mixins: [],
    // compose new components
    extends: errorContainer,
    // component properties/variables
    props: {
    },
    // variables
    data: function () {
      return {
      };
    },
    computed: {
      lockStatus() {
        return this.currentInfo.preferences.traffic_guard_level ? 'on' : 'off';
      },
    },
    // when component uses other components
    components: {},
    // methods
    watch: {},
    methods: {
      reconnect: function (event) {
        chrome.runtime.sendMessage({ reconnect: true });
      },
      checkForLinks: function (ev) {
        if (ev.target.nodeName === 'A') {
          this.createTab({ url: ev.target.dataset.href }, ev);
        }
      },
      getConvertedText: function (text) {
        let supportUrl = "/support/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=connection_failed_contact_support'>";
        let prefix = "<a style='font-size: 13.6px;' data-href='" + this.currentInfo.website_url + supportUrl;
        let suffix = '</a>';
        return text.replace('[', prefix).replace(']', suffix);
      },
    },
    // component Lifecycle hooks
    beforeCreate() {},
    mounted() {},
};
</script>

<style lang="scss" scoped>
.connection_error {
  p:nth-of-type(n + 2) {
    margin-top: 20px;
  }
  .errorBtnsHolder {
    button#btnReturnHome {
      background-color: #ffffff;
      border: 1px solid #c8252c !important;
      text-align: center;
      color: #c8252c;
      border: 0;
      margin-top: 10px;
      transition: all .2s;
    }
    button#btnReturnHome:hover {
      color: #ffffff;
      background-color: #c8252c;
      opacity: 1;
    }
  }
}
</style>