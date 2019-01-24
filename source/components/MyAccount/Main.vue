<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="MyAccount" :class="currentInfo.state">
    <div class='sideHeader'>
      <div id='settingsBackBtn' class="sideBackBtn" @click="sideBackBtnClick"></div>
      <span>{{ localize('menu_myaccount_title') }}</span>
    </div>
    <div class="my-account-container">
      <div class="account-data-container">
        <div class="account-card account-status">
          <div class="account-card-icon"></div>
          <div class="account-card-label">{{ localize('myaccount_account_status_label') }}</div>
          <div class="account-card-value">{{ localize(`myaccount_account_status_${this.getAccountStatus()}_text`) }}</div>
        </div>
        <div class="account-card-separator"></div>
        <div class="account-card account-expiry">
          <div class="account-card-icon"></div>
          <div class="account-card-label" id="account_expiry">{{ localize(`myaccount_account_${this.getExpiryType()}_label`) }}</div>
          <div class="account-card-value">{{ getExpirationDate() }}</div>
        </div>
      </div>
      <div class="information-container">
        <component :is="currentAccountView"></component>
      </div>
    </div>
  </div>
</template>
<script>
// Loads all vue components "semi-dynamically"
const getAllMyAccountComponents = () => {
  const vueFiles = require.context('./', false, /\.vue$/);
  const components = {};
  vueFiles.keys().forEach(key => {
    if (key === './Main.vue') {
      return;
    }
    components[key.replace(/(\.\/|\.vue)/g, '')] = vueFiles(key).default;
  });
  return components;
};

export default {
  name: 'MyAccount',
  components: getAllMyAccountComponents(),
  computed: {
    currentAccountView() {
      let componentName = '';
      if (this.currentInfo.subscription.plan_type === 'business') {
        componentName = '';
      } else if (((this.currentInfo.subscription.expiration_time - Date.now() / 1000) < 10 * 24 * 60 * 60) || this.currentInfo.subscription.status === 'FREE_TRIAL_ACTIVE') {
        componentName = 'Expiring';
      } else if (this.currentInfo.subscription.plan_type === 'full') {
        componentName = 'Active';
      }
      return componentName;
    },
  },
  mixins: [],
  methods: {
    sideBackBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
    getExpiryType: function () {
      let subscriptionInfo = this.currentInfo.subscription;
      if ((subscriptionInfo.expiration_time - (Date.now() / 1000)) <= 0) {
        return 'expired';
      } else if (subscriptionInfo.plan_type === 'business' || subscriptionInfo.status === 'FREE_TRIAL_ACTIVE' || !subscriptionInfo.auto_bill) {
        return 'expiry';
      }
      return 'renews';
    },
    getExpirationDate: function () {
      let time = this.currentInfo.subscription.expiration_time;
      let options = {
        month: 'short', day: 'numeric', year: 'numeric',
      };
      return this.getFormattedDate(time, options);
    },
    getAccountStatus: function () {
      if ((this.currentInfo.subscription.expiration_time - (Date.now() / 1000)) <= 0) {
        if (this.currentInfo.subscription.status === 'FREE_TRIAL_ACTIVE') {
          return 'trial_expired';
        }
        return 'expired';
      }
      return this.currentInfo.subscription.status.toLowerCase();
    },
  },
  mounted() {
  },
};
</script>

<style lang="scss">
$xvpn_red: #c8252c;
#MyAccount {
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

  .account-card-separator {
    margin: 5px 0px 5px 20px;
    content: ' ';
    height: 1px;
    width: 220px;
    background-color: #ddd;
  }

  .my-account-container {
    height: 370px;
    margin: 0px 10px;
    border-radius: 3px;
    background-color: #fefefe;
    box-shadow: 0 1.5px 4px 2px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .account-data-container {
      background-color: #f6f6f6;
      padding: 10px;
      font-size: 12px;
    }

    .information-container {
      background-color: #fff;
      height: 100%;
      padding: 10px;
      font-size: 13px;

      .buttons-holder {
        text-align: center;
        margin-top: 25px;
        button {
          width: 240px;
          height: 39px;
          border-radius: 4px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
          background-color: $xvpn_red;
          text-align: center;
          color: #ffffff;
          border: 0;
          font-family: ProximaNova;
          font-size: 15px;
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    .account-card {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .account-card-label {
      margin-left: 8px;
      height: 13.5px;
      font-family: ProximaNova;
      font-size: 12px;
      font-weight: 600;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.25;
      letter-spacing: normal;
      text-align: left;
      color: #1a1c21;
    }

    .account-card-value {
      color: #6D6D6D;
      margin-left: auto;
      order: 2;
    }

    .account-card-icon {
      content: ' ';
      height: 15px;
      width: 15px;
      background-size: contain;
      background-repeat: no-repeat;
      display: inline-block;
    }
  }
}
</style>
