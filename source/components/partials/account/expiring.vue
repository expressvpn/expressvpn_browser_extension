<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="expiring">
    <div v-if="isPaymentMethodIAP() && !isTrialUser()">
      <promobar :text="promobarText" customClass="warning" />
      <div class="sub-header">{{ localize(`myaccount_why_renew_subheader_text`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`list_item_apps_for_every_device`) }}</li>
        <li>{{ localize(`list_item_locations_worldwide`) }}</li>
        <li>{{ localize(`list_item_247_support`) }}</li>
        <li>{{ localize(`list_item_unlimited_bandwidth`) }}</li>
      </ul>
      <div class="button-container">
        <button class="button-primary" @click="createTab({ url: `${currentInfo.website_url}/order?utm_content=iap_expiring_account_screen&utm_medium=apps&utm_source=browser_extension` })">{{ localize('myaccount_expiring_renew_button_label') }}</button>
      </div>
    </div>
    <div v-else-if="isTrialUser()">
      <promobar :text="promobarText" customClass="warning" />
      <div class="sub-header">{{ localize(`error_free_trial_expired_benefits_title`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`error_free_trial_expired_l1_text`) }}</li>
        <li v-if="!isPaymentMethodIAP()">{{ localize(`error_free_trial_expired_l2_text`) }}</li>
        <li>{{ localize(`error_free_trial_expired_l3_text`) }}</li>
        <li>{{ localize(`error_free_trial_expired_l4_text`) }}</li>
        <li v-if="isPaymentMethodIAP()">{{ localize(`list_item_unlimited_bandwidth`) }}</li>
      </ul>
       <div class="button-container">
        <button class="button-primary" @click="createTab({ url: `${currentInfo.website_url}/order?${isPaymentMethodIAP() ? 'payment_method=ios-iap&' : ''}source=free-trial&utm_campaign=free_trial&utm_content=free_trial_active_account_screen&utm_medium=apps&utm_source=browser_extension` })">{{ localize('myaccount_expiring_upgrade_button_label') }}</button>
      </div>
    </div>
    <div v-else>
      <promobar :text="promobarText" customClass="warning" />
      <div class="sub-header">{{ localize(`myaccount_why_renew_subheader_text`) }}</div>
      <ul class="check-list">
        <li>{{ localize(`list_item_apps_for_every_device`) }}</li>
        <li>{{ localize(`list_item_refer_frieds`) }}</li>
        <li>{{ localize(`list_item_locations_worldwide`) }}</li>
        <li>{{ localize(`list_item_247_support`) }}</li>
      </ul>
       <div class="button-container">
        <button class="button-primary" @click="createTab({ url: `${currentInfo.website_url}/order?utm_medium=apps&utm_source=browser_extension` })">{{ localize('myaccount_expiring_renew_button_label') }}</button>
      </div>
    </div>
    
    
  </div>
</template>

<script>
import subscriptionMixin from '@/scripts/mixins/subscription';
import promobar from './promobar.vue';

export default {
  name: 'expiring',
  components: { promobar },
  computed: {
    promobarText() {
      let returnText = '';
      let expiringWhat = this.isTrialUser() ? 'free_trial' : 'subscription';
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
  },
  mixins: [subscriptionMixin],
};
</script>

<style lang="scss" scoped>
</style>