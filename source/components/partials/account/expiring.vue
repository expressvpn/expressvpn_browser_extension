<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="expiring">
    <div v-if="isPaymentMethodIAP() && !isTrialUser()">
      <div class="sub-header">{{ localize(`myaccount_why_renew_subheader_text`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`list_item_apps_for_every_device`) }}</li>
        <li>{{ localize(`list_item_locations_worldwide`) }}</li>
        <li>{{ localize(`list_item_247_support`) }}</li>
        <li>{{ localize(`list_item_unlimited_bandwidth`) }}</li>
      </ul>
      <div class="button-container">
        <button class="primary" @click="createTab({ url: `${currentInfo.website_url}/order?utm_content=iap_expiring_account_screen&utm_medium=apps&utm_source=browser_extension` })">{{ localize('myaccount_expiring_renew_button_label') }}</button>
      </div>
    </div>
    <div v-else-if="isTrialUser()">
      <div class="sub-header">{{ localize(`error_free_trial_expired_benefits_title`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`error_free_trial_expired_l1_text`) }}</li>
        <li v-if="!isPaymentMethodIAP()">{{ localize(`error_free_trial_expired_l2_text`) }}</li>
        <li>{{ localize(`error_free_trial_expired_l3_text`) }}</li>
        <li>{{ localize(`error_free_trial_expired_l4_text`) }}</li>
        <li v-if="isPaymentMethodIAP()">{{ localize(`list_item_unlimited_bandwidth`) }}</li>
      </ul>
       <div class="button-container">
        <button class="primary" @click="createTab({ url: `${currentInfo.website_url}/order?${isPaymentMethodIAP() ? 'payment_method=ios-iap&' : ''}source=free-trial&utm_campaign=free_trial&utm_content=free_trial_active_account_screen&utm_medium=apps&utm_source=browser_extension` })">{{ localize('myaccount_expiring_upgrade_button_label') }}</button>
      </div>
    </div>
    <div v-else>
      <div class="sub-header">{{ localize(`myaccount_why_renew_subheader_text`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`list_item_apps_for_every_device`) }}</li>
        <li>{{ localize(`list_item_refer_frieds`) }}</li>
        <li>{{ localize(`list_item_locations_worldwide`) }}</li>
        <li>{{ localize(`list_item_247_support`) }}</li>
      </ul>
       <div class="button-container">
        <button class="primary" @click="createTab({ url: `${currentInfo.website_url}/order?utm_medium=apps&utm_source=browser_extension` })">{{ localize('myaccount_expiring_renew_button_label') }}</button>
      </div>
    </div>
    
    
  </div>
</template>

<script>
import subscriptionMixin from '@/scripts/mixins/subscription';

export default {
  name: 'expiring',
  mixins: [subscriptionMixin],
};
</script>

<style lang="scss" scoped>
</style>
