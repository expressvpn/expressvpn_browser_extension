<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="active">
    <div v-if="isPaymentMethodIAP()">
      <div class="button-container">
      </div>
    </div>
    <div v-else-if="subscription.plan_type === 'business'">
    </div>
    <div v-else class="active-regular">
      <span id="p1">{{ localize('myaccount_account_active_p1_text') }}</span>
      <img src="/images/gift.svg" />
      <span id="p2">{{ localize('myaccount_account_active_p2_text') }}</span>
      <div class="button-container">
        <button class="button-primary" @click="createTab({ url: `${currentInfo.subscription.referral_url}&utm_source=extension&utm_medium=apps&utm_campaign=refer_friends&utm_content=account_referfriends` })">{{ localize('myaccount_active_refer_button_label') }}</button>
        <button class="button-secondary" @click="createTab({ url: `${currentInfo.website_url}/subscriptions?utm_source=extension&utm_medium=apps&utm_campaign=refer_friends&utm_content=account_referfriends` })">{{ localize('myaccount_manage_button_label') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import subscriptionMixin from '@/scripts/mixins/subscription';

export default {
  name: 'active',
  computed: {
  },
  mixins: [subscriptionMixin],
  methods: {
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
.active {
  color: $black-20;
  font-family: ProximaNova-Regular;
  font-size: 18px;

  &-regular {
    display: flex;
    flex-direction: column;

    img {
      width: 125px;
      height: 125px;
      margin: 25px auto;
    }
  }
}
</style>