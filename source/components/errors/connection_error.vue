<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <hint :text="localize('error_connection_error_to_location_text').replace('%LOCATION%', currentInfo.selectedLocation.name)" iconName="icon-41-error" type="error"></hint>
    <ol>
      <li>{{ localize('error_connection_error_check_l1_text') }}</li>
      <li @click="checkForAction" v-html="addActionLink('error_connection_error_check_l2_text')"></li>
      <li @click="$parent.checkForLinks" v-html="$parent.addAnchor('error_connection_error_check_l3_text', '/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=connection_failed_contact_support')"></li>
    </ol>
    <p v-if="$parent.lockStatus === 'on'">{{ localize('error_connection_error_lock_on_text') }}</p>
    <div class="button-container">
      <button class="button-primary" @click="reconnect">{{ localize('error_connection_error_try_again_button_label') }}</button>
      <button class="button-secondary" @click="resetState">{{ localize(`error_connection_error_return_home_button_label_network_lock_${$parent.lockStatus}`) }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
import hint from '../partials/hint.vue';

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
    };
  },
  computed: {
  },
  // when component uses other components
  components: {
    hint,
  },
  // methods
  watch: {},
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
  },
  // component Lifecycle hooks
  beforeCreate() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
ol {
  counter-reset: item; 
  margin: 15px 0 0 0; 
  padding-left: 33px;
  
  &>li {
    list-style: none inside; 
    counter-increment: item; 
    margin-bottom: 10px;
    
    &:before {
      content: counter(item);
      margin: 0 10px 0 -35px;
      padding: 1px;
      display: inline-block;
      border-radius: 50%;
      width: 24px;
      background: var(--accent20);
      color: var(--gray50);
      text-align: center; 
      font-size: 16px;
    }
  }
}
</style>