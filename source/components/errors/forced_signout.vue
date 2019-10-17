<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
<div>
  <error-icon iconName="icon-2-account" />
  <h1>{{ localize(`error_forced_signout_title`) }}</h1>
  <p>{{ localize('error_forced_signout_p1_text') }}</p>
  <p>{{ localize(`error_forced_signout_p2${currentInfo.os === 'LINUX' ? '_linux' : ''}_text`) }}</p>
  <div v-if="currentInfo.os === 'LINUX'" class="code">expressvpn activate</div>
  <div class="button-container" v-else>
    <button class="button-primary" @click="signIn">{{ localize('error_forced_signout_signin_button_label') }}</button>
  </div>
</div>
</template>

<script type="text/javascript">
import errorIcon from '../partials/errorIcon.vue';
import notInstalled from './NOT_INSTALLED.vue';

export default {
  name: 'forced_signout',
  components: { 
    errorIcon,
    notInstalled,
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
