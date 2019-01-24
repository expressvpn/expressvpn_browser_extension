<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <div class="errorHeader">
        <div id="errorHeader">{{ localize(`error_upgrade_app_header_title`) }}</div>
        <span class="promobar-icon"></span>
    </div>
    <div class='errorMessage' :class="currentInfo.state">
      <p id='p1'>{{ localize(`error_upgrade_app_text`) }}</p>
    </div>
    <div :class="[currentInfo.state, 'errorBtnsHolder']">
      <button @click="createTab({ url: `${currentInfo.website_url}/setup/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=desktop_app_too_old` })">{{ localize(`error_upgrade_app_button_label`) }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';
  
  export default {
    name: 'BAD_APP_VERSION',
    // share common functionality with component mixins
    mixins: [],
    // compose new components
    extends: errorContainer,
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
    components: {},
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
.BAD_APP_VERSION {
    .errorBtnsHolder {
        bottom: 75px !important;
    }
}
</style>