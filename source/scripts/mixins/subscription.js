/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
export default {
  data: function () {
    return {
      DAYS_TO_EXPIRING_STATE: 10, // number of days before expired state that we show expiring related messages
    };
  },
  methods: {
    hasSubscriptionExpired() {
      return (this.getTimeToExpiry().rawDifference < 0);
    },
    isExpiringSoon(nDays = 10) {
      return (this.getTimeToExpiry().days < nDays);
    },
    isInGracePeriod() {
      return this.hasSubscriptionExpired() && ['ACTIVE', 'FREE_TRIAL_ACTIVE', 'MULTI_DEVICE_FREE_TRIAL_ACTIVE'].includes(this.subscription.status);
    },
    isRegularUser() {
      return this.status === 'ACTIVE' && this.subscription.plan_type === 'full';
    },
    isTrialUser() {
      return this.status.startsWith('FREE_TRIAL_');
    },
    isBusinessUser() {
      return this.subscription.plan_type === 'business';
    },
    isRenewable() {
      return this.isInAppPurchasesRenewable() || this.subscription.auto_bill === true;
    },
    isPaymentMethodIAP() {
      let isIAP = this.subscription.is_using_in_app_purchase;
      let paymentMethod = (this.subscription.payment_method || '').toLowerCase();
      return isIAP && (paymentMethod === 'app_store_auto_renewable' || paymentMethod === 'app_store_non_renewable');
    },
    isInAppPurchasesRenewable() {
      let isIAP = this.subscription.is_using_in_app_purchase || '';
      return isIAP && this.subscription.payment_method.toLowerCase() === 'app_store_auto_renewable' && this.subscription.auto_bill === true;
    },
    isLastInAppPurchasesFailure() {
      let isIAP = this.subscription.is_using_in_app_purchase;
      return isIAP && this.subscription.payment_method.toLowerCase() === 'app_store_auto_renewable' && this.subscription.last_auto_bill_failure === true;
    },
    getLastIAPFatalError() {
      let iapStatus = null;

      if (this.isPaymentMethodIAP() === false) {
        return null;
      }

      if ((this.subscription.status === 'FREE_TRIAL_EXPIRED') && this.isLastInAppPurchasesFailure() && (this.subscription.auto_bill === true)) {
        iapStatus = 'FREE_TRIAL_IAP_RENEWAL_FAILED';
      } else if ((this.subscription.status === 'FREE_TRIAL_EXPIRED') && (this.hasSubscriptionExpired() === true) && (this.subscription.auto_bill === false)) {
        iapStatus = 'FREE_TRIAL_IAP_NON_RENEWAL_EXPIRED';
      } else if (this.hasSubscriptionExpired() && !this.isInGracePeriod() && (this.subscription.auto_bill === true)) {
        iapStatus = 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_ON';
      } else if (this.hasSubscriptionExpired() && !this.isInGracePeriod() && (this.subscription.auto_bill === false)) {
        iapStatus = 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_OFF';
      }

      return iapStatus;
    },
    getTimeToExpiry() {
      let date1 = (new Date()).getTime();
      let date2 = new Date(this.subscription.expiration_time * 1000); // convert to ms

      let rawDifference = (date2 - date1);

      let seconds = Math.floor((rawDifference) / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      let days = Math.floor(hours / 24);

      hours -= (days * 24);
      minutes = (days * 24 * 60) - (hours * 60);
      seconds -= (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

      return {
        days, hours, minutes, seconds, rawDifference,
      };
    },
    getExpirationDate() {
      let time = this.subscription.expiration_time;
      let options = {
        month: 'short', day: 'numeric', year: 'numeric',
      };
      return this.getFormattedDate(time, options);
    },
  },
  computed: {
    status() {
      return this.subscription.status || '';
    },
    subscription() {
      return this.currentInfo.subscription;
    },
    state() {
      let accountState;

      if (this.getTimeToExpiry().rawDifference < 0) {
        accountState = 'expired';
      } else if (this.getTimeToExpiry().days < this.DAYS_TO_EXPIRING_STATE && !this.isRenewable() && this.subscription.plan_type !== 'business') {
        accountState = 'expiring';
      } else {
        accountState = 'active';
      }

      return accountState;
    },
  },
  mounted() {
  },
  created: function () {
  },
  updated: function () {
  },
};

