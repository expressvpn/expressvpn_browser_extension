<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div
    id="notification"
    :class="[{ showNotification: !!currentClassName }, currentClassName || '']"
    :data-action="currentNotification"
    @click="actionButtonClick"
  >
    <p id="notificationText">{{ getNotificationText() }}</p>
    <div id="notificationActionButton">{{ localize(`promo_bar_${currentNotification}_${currentNotificationButtonType}_button_label`) }}</div>
    <button id="notificationDismissButton" :class="{ invisible: currentNotification && currentNotification.includes('expiring') }" @click="dismissButtonClick"></button>
  </div>
</template>
<script>
export default {
  computed: {
    currentNotificationButtonType() {
      switch (this.currentNotification) {
        case 'subscription_expiring_soon':
          return this.isTimeElapsed ? 'get_new_subscription' : 'renew_now';
        case 'free_trial_expiring_soon':
          return 'upgrade_now';
        case 'update_available':
          return 'update';
        default:
          return 'settings';
      }
    },
    currentNotification() {
      let notification = '';

      if (this.errorStates.includes(this.currentInfo.state) || this.currentInfo.state === 'NOT_INSTALLED') {
        return;
      }

      let subscriptionObj = this.currentInfo.subscription;
      if (subscriptionObj && subscriptionObj.status === 'ACTIVE' && subscriptionObj.plan_type === 'full' && !subscriptionObj.auto_bill &&
          (subscriptionObj.expiration_time - Date.now() / 1000) < 10 * 24 * 60 * 60) {
        notification = 'subscription_expiring_soon';
      } else if (subscriptionObj && subscriptionObj.status === 'FREE_TRIAL_ACTIVE') {
        notification = 'free_trial_expiring_soon';
      } else if (
        (this.currentInfo.app.version && this.utils.versionCompare(this.currentInfo.app.version, this.currentInfo.app.latest_version) < 0) &&
        (!this.dismissalTimes.update_available || (Date.now() - this.dismissalTimes.update_available) >= 24 * 60 * 60 * 1000)) {
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

        if (showSplitTunnelNotification === true && (!this.dismissalTimes.splittunneling || (Date.now() -
          this.dismissalTimes.splittunneling) >= 24 * 60 * 60 * 1000)) {
          notification = 'splittunneling';
        }
      }
      return notification;
    },
    currentClassName() {
      if (this.currentNotification === 'subscription_expiring_soon' && this.isTimeElapsed()) {
        return 'subscription_expired';
      }
      return this.currentNotification;
    },
  },
  data: function () {
    return {
      dismissalTimes: {},
      updateTick: 0,
    };
  },
  methods: {
    getNotificationText() {
      if (this.currentNotification) {
        if (!this.currentNotification.includes('_expiring_soon')) {
          return this.localize(`promo_bar_${this.currentNotification}_text`);
        }
        const remainingTime = this.currentInfo.subscription.expiration_time - (Date.now() / 1000);
        if (remainingTime <= 0) {
          return this.localize(`promo_bar_${this.currentNotification}_expired_text`);
        } else if (remainingTime < 60 * 60) {
          return this.localize(`promo_bar_${this.currentNotification}_less_than_one_hour_text`);
        } else if (remainingTime < 24 * 60 * 60) {
          return this.localize(`promo_bar_${this.currentNotification}_hours_text`).replace('[hours]', `${Math.ceil(remainingTime / (60 * 60))}`);
        }
        return this.localize(`promo_bar_${this.currentNotification}_days_text`).replace('[days]', `${Math.ceil(remainingTime / (24 * 60 * 60))}`);
      }
      return '';
    },
    actionButtonClick(e) {
      let url = '';
      switch (this.currentNotification) {
        case 'subscription_expiring_soon':
          if (this.isTimeElapsed()) {
            url = this.currentInfo.website_url + '/users/sign_in?utm_campaign=renew_subscription&utm_content=promobar_expired&utm_medium=apps&utm_source=extension';
          } else {
            url = this.currentInfo.website_url + '/users/sign_in?utm_campaign=renew_subscription&utm_content=promobar_renew_now_now&utm_medium=apps&utm_source=extension';
          }
          break;
        case 'free_trial_expiring_soon':
          url = this.currentInfo.website_url + '/order?source=free-trial&utm_campaign=free_trial&utm_content=promobar_free_trial_upgrade_now&utm_medium=apps&utm_source=extension';
          break;
        case 'update_available':
          url = this.currentInfo.app.latest_version_url;
          break;
        case 'splittunneling':
          chrome.runtime.sendMessage({ openPreferences: true });
          break;
        default:
          break;
      }
      if (url !== '') {
        this.createTab({ url: url }, e);
      }
    },
    dismissButtonClick(e) {
      // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
      this.dismissalTimes = Object.assign({}, this.dismissalTimes, { [this.currentNotification]: Date.now() });
      localStorage.dismissalTimes = JSON.stringify(this.dismissalTimes);
    },
    isTimeElapsed() {
      return (this.currentInfo.subscription.expiration_time - (Date.now() / 1000)) <= 0;
    },
  },
  mounted() {
    this.dismissalTimes = (localStorage.dismissalTimes) ? JSON.parse(localStorage.dismissalTimes) : {};
    if (this.currentNotification && this.currentNotification.includes('_expiring_soon')) {
      this.notificationTimer = setInterval(() => { this.updateTick += 1; }, 5 * 60 * 1000);
    } else {
      this.notificationTimer = null;
    }
  },
  updated() {
    if (this.currentNotification && this.currentNotification.includes('_expiring_soon') && !this.notificationTimer) {
      this.notificationTimer = setInterval(() => { this.updateTick += 1; }, 5 * 60 * 1000);
    } else if (this.notificationTimer && (!this.currentNotification || !this.currentNotification.includes('_expiring_soon'))) {
      clearInterval(this.notificationTimer);
      this.notificationTimer = null;
    }
  },
  beforeDestroy() {
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer);
      this.notificationTimer = null;
    }
  },
  props: {
  },
};
</script>

<style lang="scss">
  #notification {
    height: 44px;
    margin-bottom: 5px;
    display: none;
    color: #fff;
    position: relative;
    font-size: 12px;
    padding: 7px 10px;
    text-align: center;
    box-sizing: border-box;
    
    &:hover {
      opacity: 0.85;
    }

    &.subscription_expiring_soon, &.free_trial_expiring_soon, &.splittunneling {
      background-color: #FBBC00;
    }

    &.subscription_expired {
      background-color: #F44336;
    }

    &.update_available {
      background-color: #2196F3;
    }

    &.showNotification {
      display: block;
    }

    &.showNotification + .header {
      height: 0px;
    }

    &.showNotification + .header #logo {
      display: none;
    }

    * {
      cursor: pointer;
    }

    #notificationActionButton {
      color: #fff;
      background-color: transparent;
      padding: 4px 12px 4px 12px;
      font-size: 10px;
      border: none;
    }

    #notificationDismissButton {
      position: absolute;
      content: ' ';
      height: 15px;
      width: 15px;
      background-color: transparent;
      background-size: contain;
      border: none;
      right: 10px;
      top: 16px;
      transition: opacity 600ms, visibility 600ms;
      visibility: visible;
      opacity: 1;
    }
  }
  
</style>