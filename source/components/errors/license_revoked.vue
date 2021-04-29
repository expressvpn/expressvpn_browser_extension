<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <error-icon iconName="Desktop" />
    <h1>{{ localize(`error_business_subscription_expired_title`) }}</h1>
    <p>{{ localize('error_business_subscription_expired_text') }}</p>
    <p v-html="$parent.addAnchor('error_business_subscription_expired_contact_support_text', '/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=license_revoked_contact_support')" @click="$parent.checkForLinks"></p>
    <div class="button-container">
      <button class="primary" @click="resetState">{{ localize('error_business_subscription_expired_signout_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
import errorIcon from '../partials/errorIcon.vue';

export default {
  name: 'license_revoked',
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
  components: { errorIcon },
  // methods
  watch: {},
  methods: {
  },
  // component Lifecycle hooks
  beforeCreate() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
</style>