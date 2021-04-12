<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div :class="['header', currentNotification ? 'promobar' : '', currentNotification]">
    <div class="menu-holder" @click="showMenu()">
      <img v-svg-inline class="menu-holder-icon" src='/images/icons/menu.svg' />
    </div>
    <div v-if="currentNotification" class="promobar-content">
      <div class="promobar-content-text">{{ notificationHeaderText }}</div>
      <div :class="['promobar-content-button', `promobar-content-button-${buttonType}`]" @click="onPromoBarClick">{{ notificationBodyText }}</div>
    </div>
  </div>
</template>
<script>
import mixinSubscription from '../../scripts/mixins/subscription';

export default {
  name: 'mainHeader',
  mixins: [mixinSubscription],
  props: {
    canShowPromobar: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    buttonType() {
      return ['splittunneling', 'update_available'].includes(this.currentNotification) ? 'info' : 'warning';
    },
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

      const standardizedVersion = this.currentInfo.app.latest_version ? this.currentInfo.app.latest_version.match(/(?:\d+\.)(?:\d+\.)(?:\d+)/g)[0] : '1.0.0';
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
      } else if (this.currentInfo.app.version && this.utils.versionCompare(this.currentInfo.app.version, standardizedVersion) < 0) {
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
        locKey = 'promobar_subscription_expiring_soon_renewable_true_text';
      } else if (this.currentNotification === 'subscription_expired') {
        locKey = 'promo_bar_subscription_expiring_soon_renew_now_button_label';
      }
      return this.localize(locKey);
    },
    notificationHeaderText() {
      let text = '';
      if (this.currentNotification) {
        if (!this.currentNotification.includes('_expiring_soon')) {
          return this.localize(`promobar_${this.currentNotification}_header`);
        }
        const remainingTime = this.getTimeToExpiry().rawDifference / 1000;
        if (remainingTime <= 0) {
          text = this.localize(`promobar_${this.currentNotification}_expired_header`);
        } else if (remainingTime < 60 * 60) {
          text = this.localize(`promobar_${this.currentNotification}_less_than_one_hour_header`);
        } else if (remainingTime < 24 * 60 * 60) {
          text = this.localize(`promobar_${this.currentNotification}_hours_header`).replace('[hours]', `${Math.ceil(remainingTime / (60 * 60))}`);
        } else {
          text = this.localize(`promobar_${this.currentNotification}_days_header`).replace('[days]', `${Math.ceil(remainingTime / (24 * 60 * 60))}`);
        }
      }
      return text;
    },
    imageSuffix() {
      return this.$store.state.imageSuffix;
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
              url += '?utm_campaign=renew_subscription&utm_content=promobar_expired&utm_medium=apps&utm_source=browser_extension';
            } else {
              url += '?utm_campaign=renew_subscription&utm_content=promobar_renew_now_now&utm_medium=apps&utm_source=browser_extension';
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
          url = this.currentInfo.website_url + '/order?source=free-trial&utm_campaign=free_trial&utm_content=promobar_free_trial_upgrade_now&utm_medium=apps&utm_source=browser_extension';
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
  height: 64px;
  width: 350px;
  background-color: rgba(0, 0, 0, 0);
  padding: 20px;
  display: flex;
  align-items: center;
  position: absolute;

  .menu-holder {
    width: 24px;
    height: 24px;
    margin-right: 20px;
  }

  &.promobar {
    box-shadow: 0px 0px 17px 0px rgba(0, 0, 0, 0.1);
    background-color: rgba($eds-color-midnight, 0.55);
    justify-content: center;

    .promobar-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      //font-family: Inter-Medium;

      &-text {
        color: $eds-color-white;
        letter-spacing: 0px;
        text-align: right;
        //width: 170px;
      }
      &-button {
        border-radius: 15px;
        padding: 5px 12px;
        text-align: center;
        margin-left: 15px;
        white-space: nowrap;

        &-warning {
          background: $eds-color-white;
          color: $eds-color-midnight;
          border: 2px solid transparent;

          &:hover {
            border: 2px solid $eds-color-white;
            background: transparent;
            color: $eds-color-white;
          }
          &:active {
            background: $eds-color-white;
            color: $eds-color-midnight;
          }
        }
        &-info {
          border: 2px solid $eds-color-white;
          background: transparent;
          color: $eds-color-white;

          &:hover {
            background: $eds-color-white;
            color: $eds-color-midnight;
          }
          &:active {
            background: transparent;
            color: $eds-color-white;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.header {
  .menu-holder {
    &-icon path {
      fill: var(--main-header-menu-icon-default);
    }
    &:hover {
      .menu-holder-icon path { // ToDo: can this be improved?
        fill: var(--main-header-menu-icon-hover);
      }
    }
    &:active {
      .menu-holder-icon path {
        fill: var(--main-header-menu-icon-active);
      }
    }
  }
}
@media (prefers-color-scheme: light) {
  .header {
    --main-header-menu-icon-default: #{$eds-color-midnight};
    --main-header-menu-icon-hover: #{$eds-color-grey-20};
    --main-header-menu-icon-active: #{$eds-color-midnight};

    &.promobar {
      --main-header-menu-icon-default: #{$eds-color-white};
      --main-header-menu-icon-hover: #{$eds-color-grey-30};
      --main-header-menu-icon-active: #{$eds-color-white};
    }
  }
}
@media (prefers-color-scheme: dark) {
  .header {
    --main-header-menu-icon-default: #{$eds-color-grey-40};
    --main-header-menu-icon-hover: #{$eds-color-grey-30};
    --main-header-menu-icon-active: #{$eds-color-grey-40};

    &.promobar {
      --main-header-menu-icon-default: #{$eds-color-white};
      --main-header-menu-icon-hover: #{$eds-color-grey-30};
      --main-header-menu-icon-active: #{$eds-color-white};
    }
  }
}
</style>
