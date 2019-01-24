<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="Expiring">
    <div :class="currentClassName()" id="promobar"><div id="promobar_text">{{ promobarText }}</div><span class="promobar-icon"></span></div>
    <span class="checkmark-header" v-html="localize(`error_${localeKey}_benefits_title`)"></span>
    <div class="ulWrapper">
      <ul>
        <li id="l1">{{ localize(`error_${localeKey}_l1_text`) }}</li>
        <li id="l2">{{ localize(`error_${localeKey}_l2_text`) }}</li>
        <li id="l3">{{ localize(`error_${localeKey}_l3_text`) }}</li>
        <li id="l4">{{ localize(`error_${localeKey}_l4_text`) }}</li>
      </ul>
    </div>
    <div class="buttons-holder">
      <button @click="renewOrBuy()">{{ localize(`myaccount_expiring_${isRenewable() ? 'renew' : 'buy'}_button_label`) }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Expiring',
  computed: {
    promobarText() {
      let returnText = '';
      let expiringWhat = this.isTrial() ? 'free_trial' : 'subscription';
      let remainingTime = this.currentInfo.subscription.expiration_time - (Date.now() / 1000);
      if (remainingTime <= 0) {
        returnText = this.localize(`promo_bar_${expiringWhat}_expiring_soon_expired_text`);
      } else if (remainingTime < 60 * 60) {
        returnText = this.localize(`promo_bar_${expiringWhat}_expiring_soon_less_than_one_hour_text`);
      } else if (remainingTime < 24 * 60 * 60) {
        returnText = this.localize(`promo_bar_${expiringWhat}_expiring_soon_hours_text`).replace('[hours]', `${Math.ceil(remainingTime / (60 * 60))}`);
      } else {
        returnText = this.localize(`promo_bar_${expiringWhat}_expiring_soon_days_text`).replace('[days]', `${Math.ceil(remainingTime / (24 * 60 * 60))}`);
      }
      return returnText;
    },
    localeKey() {
      return (this.isTrial()) ? 'free_trial_expired' : 'subscription_expired';
    },
  },
  mixins: [],
  methods: {
    isTrial: function () {
      return this.currentInfo.subscription.status === 'FREE_TRIAL_ACTIVE';
    },
    renewOrBuy: function () {
      let url = this.currentInfo.website_url;
      if (!this.isRenewable()) {
        url += '/subscriptions?utm_source=extension&utm_medium=browser_extension&utm_campaign=renew_subscription&utm_content=browser_extension_my_account';
      } else {
        url += '/order?source=free-trial&utm_campaign=free_trial&utm_content=free_trial_active_account_screen&utm_medium=browser_extension&utm_source=extension';
      }
      this.createTab({ url });
    },
    isRenewable: function () {
      if (!this.isTrial() && this.currentInfo.subscription.auto_bill) {
        return true;
      }
      return false;
    },
    currentClassName: function () {
      if (!this.isTrial() && this.isTimeElapsed()) {
        return 'promobar expired';
      }
      return 'promobar';
    },
    isTimeElapsed: function () {
      return (this.currentInfo.subscription.expiration_time - (Date.now() / 1000)) <= 0;
    },
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
.promobar {
  background-color: #FBBC00;
  color: #fff;
  border-radius: 3px;
  padding: 10px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 12px;
}
.promobar.expired {
  background-color: #EF0A00;
}
.checkmark-header {
  width: 240px;
  height: 22.5px;
  font-family: ProximaNova;
  font-size: 18px;
  font-weight: 300;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  letter-spacing: normal;
  text-align: left;
  color: #1a1c219c;
}
.ulWrapper ul {
  list-style-type: none;
  font-size: 15px;
  color: #1a1c21d1;
  font-family: ProximaNova;
  padding-left: 0;
  text-align: left;
  margin-top: 7px;
}

.ulWrapper ul > li {
  background-position: left center;
  background-repeat: no-repeat;
  padding: 5px 0 5px 21px;
}
</style>