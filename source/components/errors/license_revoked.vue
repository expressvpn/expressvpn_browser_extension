<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <div class="errorHeader">
      <div id="errorHeader">{{ localize(`error_business_subscription_expired_title`) }}</div>
      <span class="promobar-icon"></span>
    </div>
    <div class='errorMessage' :class="currentInfo.state">
      <!-- <p id='p1'>{{ expireMessage }}</p> -->
      <p id='p1'>{{ localize('error_business_subscription_expired_text') }}</p>
      <p v-html="getConvertedText(localize(`error_business_subscription_expired_contact_support_text`))" @click="checkForLinks"></p>
    </div>
    <div class="errorBtnsHolder">
      <button id="signoutBtn" @click="resetState">{{ localize('error_business_subscription_expired_signout_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';

  export default {
    name: 'license_revoked',
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
      expireMessage() {
        return this.localize('error_business_subscription_expired_status_text').replace('%1', this.getExpirationDate());
      },
    },
    // when component uses other components
    components: {},
    // methods
    watch: {},
    methods: {
      getExpirationDate: function () {
        let time = this.currentInfo.subscription.expiration_time;
        return this.getFormattedDate(time);
      },
      checkForLinks: function (ev) {
        if (ev.target.nodeName === 'A') {
          this.createTab({ url: ev.target.dataset.href }, ev);
        }
      },
      getConvertedText: function (text) {
        let url = this.currentInfo.website_url + '/support/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=license_revoked_contact_support';
        return text.replace('[', `<a data-href='${url}'>`).replace(']', '</a>');
      },
    },
    // component Lifecycle hooks
    beforeCreate() {},
    mounted() {},
};
</script>

<style lang="scss" scoped>
.license_revoked {
  p:nth-child(2) {
    margin-top: 20px;
  }
  .errorBtnsHolder {
    button#signoutBtn {
      background-color: #ffffff;
      border: 1px solid #c8252c !important;
      text-align: center;
      color: #c8252c;
      border: 0;
      margin-top: 10px;
      transition: all .2s;
    }
    button#signoutBtn:hover {
      color: #ffffff;
      background-color: #c8252c;
      opacity: 1;
    }
  }
}
</style>
