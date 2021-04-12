<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <h1>{{ localize(`error_fraudster_title`) }}</h1>
    <hint stringKey="error_fraudster_hint" iconName="error" type="error"></hint>
    <span v-html="localize('error_fraudster_p1_text')"></span>
    <a href="mailto:support@expressvpn.zendesk.com?subject=Billing Verification" target="_blank">support@expressvpn.zendesk.com</a>
    <span v-html="localize('error_fraudster_p2_text')"></span>
    <span class="bold spaceIt">{{ localize('error_fraudster_question1_text') }}</span>
    <span>{{ localize('error_fraudster_p3_text') }}</span>
    <span class="bold spaceIt">{{ localize('error_fraudster_question2_text') }}</span>
    <span>{{ localize('error_fraudster_p4_text') }}</span>
    <span class="spaceIt">{{ localize('error_fraudster_p5_text') }}</span>
  </div>
</template>

<script type="text/javascript">
import hint from '../partials/hint.vue';

export default {
  name: 'fraudster',
  components: {
    hint,
  },
};
</script>

<style lang="scss" scoped>
span {
  display: block;
  margin-top: 3px;
  &:first-of-type {
    margin-top: 20px;
  }
  &.spaceIt {
    margin-top: 28px;
  }
}
a {
  margin-top: 3px;
}
.bold {
  font-weight: bold;
}
</style>
