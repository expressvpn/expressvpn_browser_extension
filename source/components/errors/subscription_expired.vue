<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
<div>
  <div v-if="isBusinessUser()">
    <error-icon iconName="icon-2-account" />
    <h1>{{ localize(`error_business_subscription_expired_title`) }}</h1>
    <p>{{ localize('error_business_subscription_expired_text') }}</p>
    <p v-html="$parent.addAnchor('error_business_subscription_expired_contact_support_text', '/support/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=license_revoked_contact_support')" @click="$parent.checkForLinks"></p>
    <div class="button-container">
      <button class="button-primary" @click="resetState">{{ localize('error_business_subscription_expired_signout_button_label') }}</button>
    </div>
  </div>
  <div v-else>
    <h1>{{ localize(`error_${localeKey}_title`) }}</h1>
    <p>{{localize(`error_${localeKey}_benefits_text`)}}</p>
    <ul class="check-list">
      <li>{{ localize(`error_${localeKey}_l1_text`) }}</li>
      <li>{{ localize(`error_${localeKey}_l2_text`) }}</li>
      <li>{{ localize(`error_${localeKey}_l3_text`) }}</li>
      <li>{{ localize(`error_${localeKey}_l4_text`) }}</li>
    </ul>
    <div class="button-container">
      <button class="button-primary" @click="openLink">{{ localize(localeKey === 'subscription_expired' ? 'error_subscription_expired_buy_subscription_button_label' : 'error_free_trial_expired_upgrade_now_button_label') }}</button>
      <button class="button-secondary" @click="resetState">{{ localize('error_signout_button') }}</button>
    </div>
  </div>
</div>
</template>

<script type="text/javascript">
import mixinSubscription from '../../scripts/mixins/subscription';
import errorIcon from '../partials/errorIcon.vue';

export default {
  name: 'subscription_expired',
  mixins: [mixinSubscription],
  props: {
  },
  data: function () {
    return {
    };
  },
  computed: {
    localeKey() {
      return this.currentInfo.subscription.status.startsWith('FREE_TRIAL_') ? 'free_trial_expired' : 'subscription_expired';
    },
  },
  components: { errorIcon },
  watch: {},
  methods: {
    openLink: function () {
      let url = '/order?';
      if (this.isPaymentMethodIAP()) {
        url += 'payment_method=ios-iap&';
      }
      if (this.localeKey === 'subscription_expired') {
        url += 'utm_source=browser_extensions&utm_medium=apps&utm_campaign=reactivation&utm_content=subscriptionexpired_buynewsubscription';
      } else {
        url += 'source=free-trial&utm_campaign=free_trial&utm_content=free_trial_expired&utm_medium=apps&utm_source=browser_extension';
      }
      this.createTab({ url: this.currentInfo.website_url + url });
    },
  },
  beforeCreate() {},
  mounted() {
  },
};
</script>

<style lang="scss" scoped>

</style>
