<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="Active">
    <p id="p1">{{ localize('myaccount_account_active_p1_text') }}</p>
    <p id="p2">{{ localize('myaccount_account_active_p2_text') }}</p>
    <div class="buttons-holder">
      <button @click="createTab({ url: `${currentInfo.subscription.referral_url}&utm_source=extension&utm_medium=apps&utm_campaign=refer_friends&utm_content=bob_hamburger_referfriends` })">{{ localize('myaccount_get30day_button_label') }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Active',
  computed: {
  },
  mixins: [],
  methods: {
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
p {
  margin-top: 15px;
}
</style>