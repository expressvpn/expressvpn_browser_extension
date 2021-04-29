<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div class="duplicate_license_used">
    <hint stringKey="error_simultaneous_connection_hint" iconName="error" type="error"></hint>
    <p >{{ localize('error_simultaneous_connection_p1_text') }}</p>
    <p v-html="$parent.addAnchor(`error_simultaneous_connection_iap_${(isPaymentMethodIAP() || isBusinessUser()).toString()}_p2_text`, '/subscriptions?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=deviceusagelimit')" @click="requestUnblock($event, 'LINK')"></p>
    <p>{{ localize(`error_connection_error_lock_${lockStatus}_text`) }}</p>
    <div class="button-container" v-if="isBusinessUser() || isPaymentMethodIAP()">
      <button class="primary button-top" @click="resetState">{{ localize('error_simultaneous_connection_ok_button_label') }}</button>
    </div>
    <div class="button-container" v-else>
      <button class="primary" @click="requestUnblock($event, 'BUTTON')">{{ localize('error_simultaneous_connection_learn_more_button_label') }}</button>
      <button class="secondary" @click="resetState">{{ localize(`error_connection_error_return_home_button_label_network_lock_${lockStatus}`) }}</button>
    </div>
    <popup :options="popupOptions"></popup>
  </div>
</template>

<script type="text/javascript">
import mixinSubscription from '@/scripts/mixins/subscription';
import hint from '../partials/hint.vue';
import popup from '../partials/popup.vue';

export default {
  name: 'duplicate_license_used',
  // share common functionality with component mixins
  mixins: [mixinSubscription],
  // component properties/variables
  props: {
  },
  // variables
  data: function () {
    return {
      popupOptions: {},
    };
  },
  computed: {
    lockStatus() {
      let appPrefs = this.currentInfo.preferences || {};
      let status = appPrefs.traffic_guard_level ? 'on' : 'off';
      return status;
    },
  },
  // when component uses other components
  components: {
    hint,
    popup,
  },
  // methods
  watch: {},
  methods: {
    handleClick(ev, caller) {
      this.resetState();
      switch (caller) {
        case 'BUTTON':
          this.createTab({ url: `${this.currentInfo.website_url}/features/simultaneous-device-policy?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=deviceusagelimit` });
          break;
        case 'LINK':
          this.$parent.checkForLinks(ev);
          break;
        default:
          break;
      }
    },
    requestUnblock(ev, caller) {
      if (ev.target.tagName !== 'A' && caller === 'LINK') return;

      if (this.lockStatus === 'on') {
        this.popupOptions = {
          id: 'error_simultaneous_connection_popup',
          buttons: [
            {
              callback: () => { this.popupOptions = {}; },
            },
            {
              highlightIt: true,
              callback: () => {
                this.handleClick(ev, caller);
                this.popupOptions = {};
              },
            },
          ],
          isVisible: true,
          style: 'vertical',
        };
      } else {
        this.handleClick(ev, caller);
      }
    },
  },
  // component Lifecycle hooks
  beforeCreate() {},
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
.duplicate_license_used {
  p {
    margin-top: 30px;
  }
}
</style>
