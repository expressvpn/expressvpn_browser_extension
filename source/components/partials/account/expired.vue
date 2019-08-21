<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="expired">
    <div v-if="isTrialUser()">
      <promobar :text="localize('promo_bar_free_trial_expiring_soon_expired_text')" customClass="error" />
      <div class="sub-header">{{ localize(`myaccount_why_get_subscription_subheader_text`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`list_item_apps_for_every_device`) }}</li>
        <li v-if="!isPaymentMethodIAP()">{{ localize(`list_item_30day_guarantee`) }}</li>
        <li>{{ localize(`list_item_locations_worldwide`) }}</li>
        <li>{{ localize(`list_item_247_support`) }}</li>
      </ul>
      <div class="button-container">
        <button class="button-primary" @click="createTab({ url: `${currentInfo.website_url}/order?utm_source=browser_extensions&utm_medium=apps&utm_campaign=myaccount&utm_content=subscriptionexpired_buynewsubscription` })">{{ localize('error_free_trial_expired_upgrade_now_button_label') }}</button>
      </div>
    </div>
    <div v-else-if="(isPaymentMethodIAP() && isRenewable() && hasSubscriptionExpired())">
      <div class="sub-header">{{ localize(`myaccount_why_renew_subheader_text`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`list_item_apps_for_every_device`) }}</li>
        <li>{{ localize(`list_item_locations_worldwide`) }}</li>
        <li>{{ localize(`list_item_247_support`) }}</li>
      </ul>
      <div class="button-container">
        <button class="button-primary" @click="createTab({ url: `${currentInfo.website_url}/order?payment_method=ios-iap&utm_content=expiring_account_screen&utm_medium=browser_extension&utm_source=extension` })">{{ localize('myaccount_expiring_renew_button_label') }}</button>
      </div>
    </div>
    <div v-else-if="subscription.plan_type === 'business' || (isPaymentMethodIAP() && isRenewable())">
    </div>
    <div v-else>
      <promobar v-if="!isPaymentMethodIAP()" :text="localize('promo_bar_subscription_expiring_soon_expired_text')" customClass="error" />
      <div class="sub-header">{{ localize(`myaccount_why_renew_subheader_text`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`list_item_apps_for_every_device`) }}</li>
        <li v-if="!isPaymentMethodIAP()">{{ localize(`list_item_refer_frieds`) }}</li>
        <li>{{ localize(`list_item_locations_worldwide`) }}</li>
        <li>{{ localize(`list_item_247_support`) }}</li>
      </ul>
      <div class="button-container">
        <button class="button-primary" @click="createTab({ url: `${currentInfo.website_url}/order?${isPaymentMethodIAP() ? 'payment_method=ios-iap&' : ''}utm_content=expiring_account_screen&utm_medium=browser_extension&utm_source=extension` })">{{ localize('myaccount_expiring_renew_button_label') }}</button>
      </div>
    </div>
  </div>
</template>
<script>
import subscriptionMixin from '@/scripts/mixins/subscription';
import promobar from './promobar.vue';

export default {
  name: 'expired',
  components: { promobar },
  mixins: [subscriptionMixin],
};
</script>

<style lang="scss" scoped>
</style>
