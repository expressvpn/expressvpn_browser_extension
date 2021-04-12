<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div class="connection_error">
    <hint :text="localize('error_connection_error_to_location_text').replace('%LOCATION%', currentInfo.selectedLocation.name)" iconName="error" type="error"></hint>
    <ol>
      <li>{{ localize('error_connection_error_check_l1_text') }}</li>
      <li @click="checkForAction" v-html="addActionLink('error_connection_error_check_l2_text')"></li>
      <li v-html="$parent.addAnchor('error_connection_error_check_l3_text', '/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=connection_failed_contact_support')"  @click="requestUnblock($event, 'LINK')"></li>
    </ol>
    <p v-if="$parent.lockStatus === 'on'">{{ localize('error_connection_error_lock_on_text') }}</p>
    <div class="button-container">
      <button class="primary" @click="reconnect">{{ localize('error_connection_error_try_again_button_label') }}</button>
      <button class="secondary" @click="resetState">{{ localize(`error_connection_error_return_home_button_label_network_lock_${$parent.lockStatus}`) }}</button>
    </div>
    <popup :options="popupOptions"></popup>
  </div>
</template>

<script type="text/javascript">
import hint from '../partials/hint.vue';
import popup from '../partials/popup.vue';

export default {
  name: 'connection_error',
  // share common functionality with component mixins
  mixins: [],
  // component properties/variables
  props: {
  },
  // variables
  data: function () {
    return {
      popupOptions: {},
    };
  },
  components: {
    hint,
    popup,
  },
  methods: {
    reconnect: function (event) {
      chrome.runtime.sendMessage({ reconnect: true });
    },
    addActionLink(stringKey) {
      let prefix = '<a href="#">';
      let suffix = '</a>';
      return this.localize(stringKey).replace('[', prefix).replace(']', suffix);
    },
    checkForAction(ev) {
      if (ev.target.nodeName === 'A') {
        // this.resetState();
        this.openLocationPicker();
      }
    },
    requestUnblock(ev, caller) {
      if (ev.target.tagName !== 'A' && caller === 'LINK') return;
      if (this.$parent.lockStatus === 'on') {
        this.popupOptions = {
          id: 'error_simultaneous_connection_popup',
          buttons: [
            {
              callback: () => { this.popupOptions = {}; },
            },
            {
              highlightIt: true,
              callback: () => {
                this.resetState();
                this.$parent.checkForLinks(ev);
                this.popupOptions = {};
              },
            },
          ],
          isVisible: true,
          style: 'vertical',
        };
      } else {
        this.$parent.checkForLinks(ev);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.connection_error {
  .ol, p {
    margin-top: 30px;
  }
}
</style>
