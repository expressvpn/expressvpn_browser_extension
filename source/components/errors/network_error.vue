<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <div class="errorHeader">
      <div id="errorHeader">{{ localize(currentInfo.os === 'LINUX' ? 'error_activate_app_LINUX_title' : 'error_open_app_title') }}</div>
      <span class="promobar-icon"></span>
    </div>
    <div class='errorMessage' :class="currentInfo.state">
      <p id='p1' v-html="localize(currentInfo.os === 'LINUX' ? 'error_activate_app_LINUX_text' : 'error_open_app_text')"></p>
    </div>
    <div class="errorBtnsHolder">
      <button id="openApp" :class="{ invisible: (currentInfo.os === 'LINUX') }" @click="openApp">{{ localize('error_open_app_open_app_button_label') }}</button>
      <button id="contactSupport" @click="contactSupport">{{ localize('error_open_app_contact_support_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';
  
  export default {
    name: 'network_error',
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
    },
    // when component uses other components
    components: {},
    // methods
    watch: {},
    methods: {
      contactSupport: function (event) {
        let targetUrl = this.currentInfo.website_url;
        if (this.currentInfo.os === 'LINUX') {
          targetUrl += '/support/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_activated_linux';
        } else {
          targetUrl += '/support/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_activated_contact_support';
        }
        this.createTab({ url: targetUrl });
      },
    },
    // component Lifecycle hooks
    beforeCreate() {},
    mounted() {},
};
</script>

<style lang="scss" scoped>
.network_error {
  .errorBtnsHolder {
    button#contactSupport {
      background-color: #ffffff;
      border: 1px solid #c8252c !important;
      text-align: center;
      color: #c8252c;
      border: 0;
      margin-top: 10px;
      transition: all .2s;
    }
    button#contactSupport:hover {
      color: #ffffff;
      background-color: #c8252c;
      opacity: 1;
    }
  }
}
</style>