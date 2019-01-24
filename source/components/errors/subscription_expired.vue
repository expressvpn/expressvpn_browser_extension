<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <div class="errorHeader">
      <div id="errorHeader">{{ localize(`error_${localeKey}_title`) }}</div>
      <span class="promobar-icon"></span>
    </div>
    <div class='errorMessage' :class="currentInfo.state">
      <!-- <p id='p1'>{{ expireMessage }}</p> -->
      <p id="p1" v-html="localize(`error_${localeKey}_benefits_text`)"></p>
      <div id="ulWrapper">
        <ul id="errorWhyRenew">
          <li id="l1" class="errorItemStyle">{{ localize(`error_${localeKey}_l1_text`) }}</li>
          <li id="l2" class="errorItemStyle">{{ localize(`error_${localeKey}_l2_text`) }}</li>
          <li id="l3" class="errorItemStyle">{{ localize(`error_${localeKey}_l3_text`) }}</li>
          <li id="l4" class="errorItemStyle">{{ localize(`error_${localeKey}_l4_text`) }}</li>
        </ul>
      </div>
    </div>
    <div class="errorBtnsHolder">
      <button @click="openLink">{{ localize(localeKey === 'subscription_expired' ? 'error_subscription_expired_buy_subscription_button_label' : 'error_free_trial_expired_upgrade_now_button_label') }}</button>
      <button id="signoutBtn" :class="{ invisible: (currentInfo.os === 'LINUX') }" @click="openApp">{{ localize('error_open_app_open_app_button_label') }}</button>
      <!-- <a  class="linkButton" @click="openApp">{{ localize(`error_${localeKey}_enter_new_code_button_label`) }}</a> -->
    </div>
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';

  export default {
    name: 'subscription_expired',
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
        return this.localize(`error_${this.localeKey}_status_text`).replace('%1', this.getExpirationDate());
      },
      localeKey() {
        return (this.currentInfo.subscription.status === 'FREE_TRIAL_EXPIRED') ? 'free_trial_expired' : 'subscription_expired';
      },
    },
    // when component uses other components
    components: {},
    // methods
    watch: {},
    methods: {
      openLink: function () {
        let trackingLink;
        if (this.localeKey === 'subscription_expired') {
          trackingLink = '/order?utm_source=browser_extensions&utm_medium=apps&utm_campaign=reactivation&utm_content=subscriptionexpired_buynewsubscription';
        } else {
          trackingLink = '/order?source=free-trial&utm_campaign=free_trial&utm_content=free_trial_expired&utm_medium=apps&utm_source=browser_extension';
        }
        this.createTab({ url: this.currentInfo.website_url + trackingLink });
      },
      signoutBtnClick: function (event) {
        this.resetState();
        this.currentInfo.state = 'not_activated';
        this.$store.dispatch('setCurrentView', 'mainScreen');
      },
      getExpirationDate: function () {
        let time = this.currentInfo.subscription.expiration_time;
        return this.getFormattedDate(time);
      },
    },
    // component Lifecycle hooks
    beforeCreate() {},
    mounted() {
    },
};
</script>

<style lang="scss" scoped>
.subscription_expired {
  #errorHeader {
    text-align: left !important;
  }
  .errorMessage {
    margin-top: 12px !important;
    #ulWrapper {
      margin-top: 20px;
    }
  }
  #errorWhyRenew {
    list-style-type: none;
    font-size: 12px;
    color: #4a4a4a;
    padding-left: 0;
    text-align: left;
    margin-top: 2px;
  }

  #errorWhyRenew > li {
    background-position: left center;
    background-repeat: no-repeat;
    padding: 5px 0 5px 21px;
    font-size: 14px;
  }

  #p2 {
    font-weight: 600;
    margin-top: 14px;
  }
  .errorItemStyle {
    background-image: url('/images/checkgreen.png')!important;
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
