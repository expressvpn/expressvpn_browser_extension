<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <error-icon iconName="Laptop2" v-if="!['FREE_TRIAL_IAP_NON_RENEWAL_EXPIRED', 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_OFF'].includes(IAPstate)"/>
    
    <div v-if="['FREE_TRIAL_IAP_RENEWAL_FAILED', 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_ON', 'SUBSCRIPTION_ACTIVE_LAST_IAP_FAILED'].includes(IAPstate)">
      <h1>{{ localize('error_IAP_MAIN_title') }}</h1>
      <p>{{ localize('error_IAP_CONTINUE_USING_p1_text') }}</p>
      <p>{{ localize('error_IAP_WILL_AUTO_ACTIVATE_p2_text') }}</p>
    </div>
    <div v-else-if="IAPstate == 'FREE_TRIAL_IAP_NON_RENEWAL_EXPIRED'">
      <h1>{{ localize(`error_${IAPstate}_title`) }}</h1>
      <p v-html="localize('error_free_trial_expired_benefits_text')" />
      <ul class="check-list">
        <li>{{ localize('error_free_trial_expired_l1_text') }}</li>
        <li>{{ localize('error_free_trial_expired_l3_text') }}</li>
        <li>{{ localize('error_free_trial_expired_l4_text') }}</li>
      </ul>
    </div>
    <div v-else-if="IAPstate == 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_OFF'">
      <h1>{{ localize(`error_${IAPstate}_title`) }}</h1>
      <p v-html="localize('error_subscription_expired_benefits_text')" />
      <ul class="check-list">
        <li>{{ localize('error_subscription_expired_l1_text') }}</li>
        <li>{{ localize('error_subscription_expired_l3_text') }}</li>
        <li>{{ localize('error_subscription_expired_l4_text') }}</li>
      </ul>
    </div>

    <div class="button-container">
      <button class="primary" @click="handleMainAction">{{ localize(`error_${IAPstate}_main_button_label`) }}</button>
      <button class="secondary" @click="handleSubAction">{{ localize(`error_${IAPstate}_sub_button_label`) }}</button>
    </div>
  </div>
</template>
<script>
import errorIcon from '../partials/errorIcon.vue';
import mixinSubscription from '../../scripts/mixins/subscription';

export default {
  mixins: [mixinSubscription],
  data: function () {
    return {
      IAPstate: '',
    };
  },
  methods: {
    handleMainAction() {
      switch (this.IAPstate) {
        case 'FREE_TRIAL_IAP_RENEWAL_FAILED':
        case 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_ON':
        case 'SUBSCRIPTION_ACTIVE_LAST_IAP':
          this.createTab({ url: `${this.currentInfo.website_url}/support/troubleshooting/ios-in-app-purchases/#payment-failed` });
          break;
        case 'SUBSCRIPTION_ACTIVE_LAST_IAP_FAILED':
        case 'FREE_TRIAL_IAP_NON_RENEWAL_EXPIRED':
        case 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_OFF':
          this.createTab({ url: `${this.currentInfo.website_url}/order?source=free-trial&payment_method=ios-iap` });
          break;
        default:
          break;
      }
    },
    handleSubAction() {
      switch (this.IAPstate) {
        case 'FREE_TRIAL_IAP_RENEWAL_FAILED':
        case 'FREE_TRIAL_IAP_NON_RENEWAL_EXPIRED':
        case 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_ON':
        case 'SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_OFF':
          this.resetState();
          break;
        case 'SUBSCRIPTION_ACTIVE_LAST_IAP_FAILED':
          this.$store.dispatch('setIgnoreStateUpdates', false);
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    this.IAPstate = this.getLastIAPFatalError();
    if (this.IAPstate === null && this.hasSubscriptionExpired() && this.isLastInAppPurchasesFailure() && this.isInGracePeriod()) {
      this.IAPstate = 'SUBSCRIPTION_ACTIVE_LAST_IAP_FAILED';
      this.$store.dispatch('setIgnoreStateUpdates', true); // Prevent state updates from overwriting this screen
    }
    this.$forceUpdate();
  },
  components: {
    errorIcon,
  },
};
</script>

<style lang="scss" scoped>
</style>