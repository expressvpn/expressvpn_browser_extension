<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <error-icon iconName="AppNotOpen" />
    <h1>{{ localize(currentInfo.os === 'LINUX' ? 'error_activate_app_LINUX_title' : 'error_open_app_title') }}</h1>
    <p v-html="localize(currentInfo.os === 'LINUX' ? 'error_activate_app_LINUX_text' : 'error_open_app_text')"></p>
    <div class="button-container">
      <button :class="['primary', { invisible: (currentInfo.os === 'LINUX') }]" @click="openApp">{{ localize('error_open_app_open_app_button_label') }}</button>
      <button class="secondary" @click="contactSupport">{{ localize('error_open_app_contact_support_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
import errorIcon from '../partials/errorIcon.vue';

export default {
  name: 'internal_error',
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
    contactSupport: function (event) {
      let targetUrl = this.currentInfo.website_url;
      if (this.currentInfo.os === 'LINUX') {
        targetUrl += '/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_activated_linux';
      } else {
        targetUrl += '/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_activated_contact_support';
      }
      this.createTab({ url: targetUrl });
    },
  },
  // component Lifecycle hooks
  beforeCreate() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
</style>