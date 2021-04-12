<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <error-icon iconName="OsUpdate" />
    <h1>{{ localize('error_compatibility_error_title') }}</h1>
    <p v-html="localize('error_compatibility_error_os_version_p1_text')"></p>
    <p>{{ localize(`error_compatibility_error_os_version_p2_text`) }}</p>
    <div class="button-container">
      <button class="primary" @click="updateOS">{{ localize('error_compatibility_error_os_version_update_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
import errorIcon from '../partials/errorIcon.vue';

export default {
  name: 'BAD_OS_VERSION',
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
    updateOS: function (event) {
      let osUpdateUrl = '';
      switch (this.currentInfo.os) {
        case 'WINDOWS':
          osUpdateUrl = 'https://www.microsoft.com/windows';
          break;
        case 'MAC':
          osUpdateUrl = 'https://www.apple.com/macos/how-to-upgrade/';
          break;
        default:
          break;
      }
      this.createTab({ url: osUpdateUrl });
    },
  },
  // component Lifecycle hooks
  beforeCreate() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
</style>