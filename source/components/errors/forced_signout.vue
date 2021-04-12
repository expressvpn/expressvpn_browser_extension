<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
<div>
  <error-icon iconName="Desktop" />
  <h1>{{ localize(`error_forced_signout_title`) }}</h1>
  <p>{{ localize('error_forced_signout_p1_text') }}</p>
  <p>{{ localize(`error_forced_signout_p2${currentInfo.os === 'LINUX' ? '_linux' : ''}_text`) }}</p>
  <div v-if="currentInfo.os === 'LINUX'" class="code">expressvpn activate</div>
  <div class="button-container" v-else>
    <button class="primary" @click="signIn">{{ localize('error_forced_signout_signin_button_label') }}</button>
  </div>
</div>
</template>

<script type="text/javascript">
import errorIcon from '../partials/errorIcon.vue';

export default {
  name: 'forced_signout',
  components: { 
    errorIcon,
  },
  methods: {
    signIn: function () {
      this.resetState();
      this.openApp();
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
