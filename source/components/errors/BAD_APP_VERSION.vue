<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <error-icon iconName="AppUpdate" />
    <h1>{{ localize('error_upgrade_app_header_title') }}</h1>
    <p>{{ localize(`error_upgrade_app_text`) }}</p>
    <div class="button-container">
      <button class="primary" @click="createTab({ url: `${currentInfo.website_url}/setup?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=desktop_app_too_old` })">{{ localize('error_upgrade_app_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
import errorIcon from '../partials/errorIcon.vue';

export default {
  name: 'BAD_APP_VERSION',
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
