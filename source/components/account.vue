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
        <hint v-if="expiryWarning" :text="expiryWarning" iconName="error" :type="state === 'expiring' ? 'warning' : 'error'" />
        <div class="account-info">
          <img v-svg-inline class="icon chevron" :src="`/images/icons/account.svg`" viewbox="0 0 24 24" width="24" height="24" />
          <div class="account-info-label">{{ localize('myaccount_account_status_label') }}</div>
          <div class="account-info-value">{{ localize(`myaccount_account_status_${this.getAccountStatus()}_text`) }}</div>
        </div>
        <div class="account-info">
          <img v-svg-inline class="icon chevron" :src="`/images/icons/expiry.svg`" viewbox="0 0 24 24" width="24" height="24" />
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
import hint from './partials/hint';

export default {
  name: 'account',
  components: {
    secondaryHeader,
    activeView,
    expiringView,
    expiredView,
    hint,
  },
  computed: {
    currentAccountView() {
      return `${this.state}View`;
    },
    expiryWarning() {
      let warning = '';

      if (this.state === 'expiring') {
        let expiringWhat = this.isTrialUser() ? 'free_trial' : 'subscription';
        let remainingTime = this.currentInfo.subscription.expiration_time - (Date.now() / 1000);
        if (remainingTime <= 0) {
          warning = this.localize(`promo_bar_${expiringWhat}_expiring_soon_expired_text`);
        } else if (remainingTime < 60 * 60) {
          warning = this.localize(`promo_bar_${expiringWhat}_expiring_soon_less_than_one_hour_text`);
        } else if (remainingTime < 24 * 60 * 60) {
          warning = this.localize(`promo_bar_${expiringWhat}_expiring_soon_hours_text`).replace('[hours]', `${Math.ceil(remainingTime / (60 * 60))}`);
        } else {
          warning = this.localize(`promo_bar_${expiringWhat}_expiring_soon_days_text`).replace('[days]', `${Math.ceil(remainingTime / (24 * 60 * 60))}`);
        }
      } else if (this.state === 'expired') {
        if (this.isTrialUser()) {
          warning = this.localize('promo_bar_free_trial_expiring_soon_expired_text');
        } else if (!this.isPaymentMethodIAP()) {
          warning = this.localize('promo_bar_subscription_expiring_soon_expired_text');
        }
      }

      return warning;
    },
  },
  mixins: [subscriptionMixin],
  methods: {
    sideBackBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
    getExpiryType: function () {
      let expiryType = '';
      if (this.hasSubscriptionExpired() && this.isRenewable() && this.isPaymentMethodIAP() && !this.isLastInAppPurchasesFailure()) {
        expiryType = 'payment_due';
      } else if (this.hasSubscriptionExpired()) {
        expiryType = 'expired';
      } else if (this.subscription.status === 'FREE_TRIAL_ACTIVE' && this.subscription.auto_bill === true) {
        expiryType = 'subscription_starts';
      } else if (this.subscription.auto_bill === true) {
        expiryType = 'renews';
      } else if (this.subscription.plan_type === 'business' || this.subscription.status === 'FREE_TRIAL_ACTIVE' || !this.subscription.auto_bill) {
        expiryType = 'expiry';
      }
      return expiryType;
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
  //font-family: Inter-Bold;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0px;
  margin-bottom: 15px;
  line-height: 26px;
}

.account {
  &-container {
    padding: 0 20px;
  }
  &-info {
    display: flex;
    align-items: center;
    position: relative;
    //font-family: Inter-Regular;
    font-size: 14px;
    font-weight: normal;
    letter-spacing: 0px;
    line-height: 28px;
    margin-top: 20px;

    &:last-of-type {
      margin-top: 15px;
    }

    &-label {
      margin-left: 10px;
    }
    &-value {
      position: absolute;
      right: 0;
      color: $eds-color-grey-20;
    }

    .icon path {
      fill: var(--icon-color);
    }
  }

  &-extra-info {
    height: 100vh;
    margin-top: 30px;

    .button-container {
      width: calc(100% - 40px);
      position: absolute;
      bottom: 0;

      button:nth-of-type(n+2) {
        margin-top: 15px;
      }
    }
  }
}
@media (prefers-color-scheme: light) {
  .account-container {
    --icon-color: #{$eds-color-grey-20};
  }
}
@media (prefers-color-scheme: dark) {
  .account-container {
    --icon-color: #{$eds-color-grey-30};
  }
}
</style>
