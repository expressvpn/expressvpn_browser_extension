<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
<div class="expired-container">
  <div v-if="isBusinessUser()">
    <error-icon iconName="Laptop2" />
    <h1>{{ localize(`error_business_subscription_expired_title`) }}</h1>
    <p>{{ localize('error_business_subscription_expired_text') }}</p>
    <p v-html="$parent.addAnchor('error_business_subscription_expired_contact_support_text', '/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=license_revoked_contact_support')" @click="$parent.checkForLinks"></p>
    <div class="button-container">
      <button class="primary" @click="resetState">{{ localize('error_business_subscription_expired_signout_button_label') }}</button>
    </div>
  </div>
  <div v-else>
    <h1>{{ localize(`error_${localeKey}_title`) }}</h1>
    <p v-html="localize(`error_${localeKey}_benefits_text`)" />
    <div :class="['list-container', `list-${this.localeKey}`]">
      <div class="list-item" v-for="n in 4" :key="n">
        <img v-svg-inline class="list-icon" :src="getItemData(n).icon" viewbox="0 0 24 24" width="24" height="24" />
        <div class="list-text">{{ localize(getItemData(n).key) }}</div>
      </div>
    </div>
    <div class="button-container">
      <button class="primary" @click="openLink">{{ localize(isTrialUser() ? 'error_subscription_expired_get_subscription_button_label' : 'error_SUBSCRIPTION_EXPIRED_NOGRACE_AUTOBILL_OFF_main_button_label') }}</button>
      <button class="secondary" @click="resetState">{{ localize('error_signout_button') }}</button>
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
    getItemData(index) {
      let icon = '/images/icons/';
      let key = `error_${this.localeKey}_l${index}_text`;
      if (this.isTrialUser()) {
        if (this.isPaymentMethodIAP()) {
          switch (index) {
            case 1:
              icon += 'iphone.svg';
              break;
            case 2:
              key = 'list_item_locations_worldwide';
              icon += 'pin-on.svg';
              break;
            case 3:
              key = 'list_item_247_support';
              icon += 'live-chat.svg';
              break;
            case 4:
              key = 'list_item_unlimited_bandwidth';
              icon += 'infinity.svg';
              break;
          }
        } else {
          switch (index) {
            case 1:
              icon += 'iphone.svg';
              break;
            case 2:
              icon += 'price.svg';
              break;
            case 3:
              icon += 'pin-on.svg';
              break;
            case 4:
              icon += 'live-chat.svg';
              break;
          }
        }
      } else {
        switch (index) {
          case 1:
            key = 'list_item_apps_for_every_device';
            icon += 'iphone.svg';
            break;
          case 2:
            key = 'list_item_refer_frieds';
            icon += 'refer.svg';
            break;
          case 3:
            key = 'list_item_locations_worldwide';
            icon += 'pin-on.svg';
            break;
          case 4:
            icon += 'live-chat.svg';
            break;
        }
      }
      return { icon, key };
    },
    openLink: function () {
      let url = '/order?';
      if (this.isPaymentMethodIAP()) {
        url += 'payment_method=ios-iap&';
      }
      if (this.localeKey === 'subscription_expired') {
        url += 'utm_source=browser_extension&utm_medium=apps&utm_campaign=reactivation&utm_content=subscriptionexpired_buynewsubscription';
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
.expired-container {
  overflow: auto;
}
.list {
  &-container {
    margin-top: 30px;
  }

  &-item {
    display: flex;
    align-items: center;

    &:not(:last-of-type) {
      margin-bottom: 15px;
    }
  }
  &-icon {
    margin-right: 10px;
    width: 24px;
    height: 24px;
  }
  &-text {
    font-size: 16px;
    font-weight: normal;
    letter-spacing: 0px;
    line-height: 28px;
    max-width: 275px;
  }
}
</style>
<style lang="scss">
.list-icon path {
  fill: var(--font-color)
}
</style>
