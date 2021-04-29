<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="active">
    <div v-if="isPaymentMethodIAP()">
      <div class="button-container" style="bottom: 15px;">
        <button v-if="isRenewable()" class="secondary" @click="createTab({ url: `${currentInfo.website_url}/subscriptions?utm_source=browser_extension&utm_medium=apps&utm_campaign=refer_friends&utm_content=account` })">{{ localize('myaccount_manage_subscription_button_label') }}</button>
      </div>
    </div>
    <div v-else-if="subscription.plan_type === 'business'">
    </div>
    <div v-else class="active-regular">
      <div id="p1">{{ localize('myaccount_account_active_p1_text') }}</div>
      <div class="img-container">
        <img class="gift" src="/images/illustrations/Gift.svg" />
      </div>
      <div id="p2">{{ localize('myaccount_account_active_p2_text') }}</div>
      <div class="button-container">
        <button class="primary" @click="createTab({ url: `${currentInfo.subscription.referral_url}&utm_source=browser_extension&utm_medium=apps&utm_campaign=refer_friends&utm_content=account_referfriends` })">{{ localize('myaccount_active_refer_button_label') }}</button>
        <button class="secondary" @click="createTab({ url: `${currentInfo.website_url}/subscriptions?utm_source=browser_extension&utm_medium=apps&utm_campaign=refer_friends&utm_content=account_referfriends` })">{{ localize('myaccount_manage_button_label') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import subscriptionMixin from '@/scripts/mixins/subscription';

export default {
  name: 'active',
  mixins: [subscriptionMixin],
};
</script>

<style lang="scss" scoped>
.active {
  //font-family: Inter-Regular;
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 0px;
  line-height: 28px;
  display: flex;
  flex-direction: column;

  .img-container {
    margin: 5px 0;
    text-align: center;
  }
  &-regular .button-container {
    margin-bottom: 15px;
  }
}
</style>