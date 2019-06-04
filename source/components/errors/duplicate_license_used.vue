<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <hint stringKey="error_simultaneous_connection_title" iconName="icon-41-error" type="error"></hint>
    <p >{{ localize('error_simultaneous_connection_p1_text') }}</p>
    <p v-html="$parent.addAnchor('error_simultaneous_connection_p2_text', '/subscriptions?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=deviceusagelimit')" @click="$parent.checkForLinks"></p>
    <p>{{ localize(`error_connection_error_lock_${lockStatus}_text`) }}</p>
    <div class="button-container">
      <button class="button-primary" @click="createTab({ url: `${currentInfo.website_url}/features/simultaneous-device-policy?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=deviceusagelimit` })">{{ localize('error_simultaneous_connection_learn_more_button_label') }}</button>
      <button class="button-secondary" @click="resetState">{{ localize(`error_connection_error_return_home_button_label_network_lock_${lockStatus}`) }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
  import hint from '../partials/hint.vue';
  
  export default {
    name: 'duplicate_license_used',
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
      lockStatus() {
        let appPrefs = this.currentInfo.preferences || {};
        let status = appPrefs.traffic_guard_level ? 'on' : 'off';
        return status;
      },
    },
    // when component uses other components
    components: {
      hint,
    },
    // methods
    watch: {},
    methods: {
    },
    // component Lifecycle hooks
    beforeCreate() {},
    mounted() {
    },
};
</script>

<style lang="scss" scoped>
</style>