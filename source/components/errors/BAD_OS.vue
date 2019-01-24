<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <div class="errorHeader">
        <div id="errorHeader">{{ localize(`error_BAD_OS_title`) }}</div>
        <span class="promobar-icon"></span>
    </div>
    <div class='errorMessage' :class="currentInfo.state">
      <p v-html="localize('error_BAD_OS_p1_text')"></p>
      <p>{{ localize('error_BAD_OS_p2_text') }}</p>
      <p>{{ localize('error_BAD_OS_p3_text') }}</p>
    </div>
    <div class="errorBtnsHolder">
      <button  @click="createTab({ url: `${currentInfo.website_url}/beta/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=incompatible_os_learn_more` })" id="notifyMe">{{ localize('error_BAD_OS_learn_more_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';
  
  export default {
    name: 'BAD_OS',
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
.BAD_OS {
  p:nth-of-type(n+2) {
    margin-top: 20px;
  }
  .errorBtnsHolder {
      bottom: 75px !important;
  }
}
</style>