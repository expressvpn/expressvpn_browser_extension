<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div :class="['header', currentNotification]" :style="hideIcon ? 'border:0' : ''">
    <img v-if="!currentNotification" class="logo" src="/images/logo-header.png" />
    <div v-else class="promobar" @click="onPromoBarClick">
      <div class="promobar-header">{{ notificationHeaderText }}</div>
      <div class="promobar-text">{{ notificationBodyText }}</div>
    </div>
    <div :class="['icon', ' icon-medium', icon]" :style="hideIcon ? 'visibility: hidden;' : ''" @click="iconClickCallback ? iconClickCallback() : showMenu()"></div>
  </div>
</template>
<script>
import mixinSubscription from '../../scripts/mixins/subscription';

export default {
  name: 'mainHeader',
  mixins: [mixinSubscription],
  props: {
    hideIcon: {
      type: Boolean,
      required: false,
      default: false,
    },
    icon: {
      type: String,
      required: false,
      default: 'icon-128-menu',
    },
    iconClickCallback: {
      type: Function,
      required: false,
    },
    canShowPromobar: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    currentNotification() {
      let notification = '';

      // Only show the promobar in the home screen
      if (this.errorStates.includes(this.currentInfo.state) || this.canShowPromobar !== true) {
        return;
      }

      let subscriptionObj = this.currentInfo.subscription;

      if (!subscriptionObj) {
        return null;
      }

      if (subscriptionObj.status === 'ACTIVE' && this.utils.isLastInAppPurchasesFailure(subscriptionObj) &&
          this.utils.getTimeDelta(subscriptionObj.expiration_time).days > -10 && this.utils.getTimeDelta(subscriptionObj.expiration_time).days <= 1) {
        notification = 'iap_failed';
      } else if (this.hasSubscriptionExpired() && !this.isRenewable()) {
        notification = 'subscription_expired';
      } else if (this.hasSubscriptionExpired() && this.isRenewable()) {
        notification = 'subscription_expiring_autobill';
      } else if (this.isRegularUser() && this.isExpiringSoon() && !this.isRenewable()) {
        notification = 'subscription_expiring_soon';
      } else if (subscriptionObj.status === 'FREE_TRIAL_ACTIVE' && !this.utils.isInAppPurchasesRenewable(subscriptionObj)) {
        notification = 'free_trial_expiring_soon';
      } else if (this.currentInfo.app.version && this.utils.versionCompare(this.currentInfo.app.version, this.currentInfo.app.latest_version) < 0) {
        notification = 'update_available';
      } else if (typeof this.currentInfo.preferences === 'object') {
        let splittunnel = this.currentInfo.preferences.split_tunnel || {};
        let mode = splittunnel.mode || '';
        let useVpn = splittunnel.use_vpn || [];
        let noVpn = splittunnel.no_vpn || [];
        let showSplitTunnelNotification = false;
        let self = this;

        switch (mode) {
          case 'vpn': // do not allow selected apps to use the VPN
            showSplitTunnelNotification = noVpn.some(function (splitApp) {
              return (self.browserDict[splitApp.name] === self.browserInfo.name);
            });
            break;
          case 'internet': // Only allow selected apps to use the VPN
            showSplitTunnelNotification = !useVpn.some(function (splitApp) {
              return (self.browserDict[splitApp.name] === self.browserInfo.name);
            });
            break;
          default:
            break;
        }
        if (showSplitTunnelNotification === true) {
          notification = 'splittunneling';
        }
      }
      return notification;
    },
    notificationBodyText() {
      let locKey = `promobar_${this.currentNotification}_text`;
      if (this.currentNotification === 'subscription_expiring_soon') {
        locKey = 'promobar_subscription_expiring_soon_renewable_' + this.isRenewable().toString() + '_text';
      } else if (this.currentNotification === 'subscription_expired') {
        locKey = 'promo_bar_subscription_expiring_soon_renew_now_button_label';
      }
      return this.localize(locKey);
    },
    notificationHeaderText() {
      if (this.currentNotification) {
        if (!this.currentNotification.includes('_expiring_soon')) {
          return this.localize(`promobar_${this.currentNotification}_header`);
        }
        const remainingTime = this.getTimeToExpiry().rawDifference / 1000;
        if (remainingTime <= 0) {
          return this.localize(`promobar_${this.currentNotification}_expired_header`);
        } else if (remainingTime < 60 * 60) {
          return this.localize(`promobar_${this.currentNotification}_less_than_one_hour_header`);
        } else if (remainingTime < 24 * 60 * 60) {
          return this.localize(`promobar_${this.currentNotification}_hours_header`).replace('[hours]', `${Math.ceil(remainingTime / (60 * 60))}`);
        }
        return this.localize(`promobar_${this.currentNotification}_days_header`).replace('[days]', `${Math.ceil(remainingTime / (24 * 60 * 60))}`);
      }
      return '';
    },
  },
  methods: {
    showMenu() {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
    onPromoBarClick: function (ev) {
      let url = '';
      switch (this.currentNotification) {
        case 'subscription_expiring_soon':
          if (this.utils.isPaymentMethodIAP(this.currentInfo.subscription)) {
            url = this.currentInfo.website_url + '/sessions/new';
          } else {
            url = this.currentInfo.website_url + '/users/sign_in';
            if (this.isTimeElapsed()) {
              url += '?utm_campaign=renew_subscription&utm_content=promobar_expired&utm_medium=apps&utm_source=extension';
            } else {
              url += '?utm_campaign=renew_subscription&utm_content=promobar_renew_now_now&utm_medium=apps&utm_source=extension';
            }
          }
          break;
        case 'subscription_expired':
          this.currentInfo.state = 'subscription_expiring';
          this.$store.dispatch('updateCurrentInfo', this.currentInfo);
          break;
        case 'subscription_expiring_autobill':
          this.currentInfo.state = 'subscription_expiring_autobill';
          this.$store.dispatch('updateCurrentInfo', this.currentInfo);
          break;
        case 'free_trial_expiring_soon':
          url = this.currentInfo.website_url + '/order?source=free-trial&utm_campaign=free_trial&utm_content=promobar_free_trial_upgrade_now&utm_medium=apps&utm_source=extension';
          if (this.utils.isPaymentMethodIAP(this.currentInfo.subscription)) {
            url += '&payment_method=ios-iap';
          }
          break;
        case 'update_available':
          url = this.currentInfo.app.latest_version_url;
          break;
        case 'splittunneling':
          chrome.runtime.sendMessage({ openPreferences: true });
          break;
        case 'iap_failed':
          this.currentInfo.state = 'iapError';
          this.$store.dispatch('updateCurrentInfo', this.currentInfo);
          break;
        default:
          break;
      }
      if (url !== '') {
        this.createTab({ url: url });
      }
    },
    isTimeElapsed() {
      return (this.currentInfo.subscription.expiration_time - (Date.now() / 1000)) <= 0;
    },
  },
};
</script>
<style lang="scss" scoped>
.header {
  height: 60px;
  background-color: $gray-40;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-content: space-between;
  border-bottom: 1px solid $gray-30;

  &.update_available {
    background-color: $blue-40;
    * {
      color: $blue-10 !important;
    }
  }
  &.free_trial_expiring_soon, &.subscription_expiring_soon, &.splittunneling {
    background-color: $yellow-40;
    * {
      color: $yellow-10 !important;
    }
  }

  &.iap_failed, &.subscription_expired, &.subscription_expiring_autobill {
    background-color: $red-40;
    * {
      color: $red-10 !important;
    }
  }

  .promobar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 15px;
    height: 100%;
    width: 80%; // leave some space to allow the user to click the settings button

    &-header {
      font-family: ProximaNova-Semibold;
      font-size: 16px;
      margin-bottom: 4px;
    }
    &-text {
      font-size: 12px;
    }
  }

  .logo {
    width: 150px;
    height: 30px;
    margin-left: 15px;
  }

  .icon {
    color: $black-20;
    margin-right: 15px;

    &:hover {
      color: $gray-20;
    }
    &:active {
      color: $black-30;
    }
  }
}
</style>