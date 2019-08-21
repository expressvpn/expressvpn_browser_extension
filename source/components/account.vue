<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <secondary-header stringkey="menu_myaccount_title" :onBackClick="sideBackBtnClick" :showSearchOption="false" />
    <div class="account-container">
      <div class="account-info-container">
        <div class="account-info">
          <i class="icon icon-2-account" />
          <div class="account-info-label">{{ localize('myaccount_account_status_label') }}</div>
          <div class="account-info-value">{{ localize(`myaccount_account_status_${this.getAccountStatus()}_text`) }}</div>
        </div>
        <div class="account-info-separator"></div>
        <div class="account-info">
          <i class="icon icon-45-expiry" />
          <div class="account-info-label" id="account_expiry">{{ localize(`myaccount_account_${this.getExpiryType()}_label`) }}</div>
          <div class="account-info-value">{{ getExpirationDate() }}</div>
        </div>
      </div>
      <div class="account-extra-info">
        <component :is="currentAccountView"></component>
      </div>
    </div>
  </div>
</template>
<script>
import subscriptionMixin from '@/scripts/mixins/subscription';
import secondaryHeader from './partials/secondaryHeader.vue';
import activeView from './partials/account/active.vue';
import expiringView from './partials/account/expiring.vue';
import expiredView from './partials/account/expired.vue';

export default {
  name: 'account',
  components: {
    secondaryHeader,
    activeView,
    expiringView,
    expiredView,
  },
  computed: {
    currentAccountView() {
      return `${this.state}View`;
    },
  },
  mixins: [subscriptionMixin],
  methods: {
    sideBackBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
    getExpiryType: function () {
      if (this.hasSubscriptionExpired() && this.isRenewable() && this.isPaymentMethodIAP() && !this.isLastInAppPurchasesFailure()) {
        return 'payment_due';
      } else if (this.hasSubscriptionExpired()) {
        return 'expired';
      } else if (this.subscription.status === 'FREE_TRIAL_ACTIVE' && this.subscription.auto_bill === true) {
        return 'subscription_starts';
      } else if (this.subscription.auto_bill === true) {
        return 'renews';
      } else if (this.subscription.plan_type === 'business' || this.subscription.status === 'FREE_TRIAL_ACTIVE' || !this.subscription.auto_bill) {
        return 'expiry';
      }
    },
    getAccountStatus() {
      let accountStatus = this.subscription.status.toLowerCase();
      if (this.hasSubscriptionExpired()) {
        accountStatus = 'expired';
      } else if (this.hasSubscriptionExpired() && this.isTrialUser()) {
        accountStatus = 'trial_expired';
      } else if (this.isPaymentMethodIAP() && this.isTrialUser()) {
        accountStatus = 'trial';
      }
      return accountStatus;
    },
  },
  mounted() {
  },
};
</script>

<style lang="scss">
.sub-header {
  color: $black-20;
  font-family: ProximaNova-Light;
  font-size: 24px;
}

.account {

  &-info {
    display: flex;
    align-items: center;
    font-size: 16px;
    position: relative;

    .icon {
      color: $accent-20;
      font-size: 24px;
    }

    &-separator {
      border-bottom: 1px solid #DEDEDE;
      margin: 12px 0px;
      margin-left: calc(24px + 10px);
    }
    &-label {
      color: $black-20;
      font-family: ProximaNova-Semibold;
      margin-left: 10px;    
    }
    &-value {
      color: $gray-20;
      position: absolute;
      right: 0;
    }
  
    &-container {
      background: $gray-40;
      padding: 0px 15px;
      height: 105px;
    }
  }

  &-extra-info {
    border-top: 1px solid #DEDEDE;
    background: $gray-50;
    height: 100vh;
    padding: 25px 15px;
  }
}
</style>
