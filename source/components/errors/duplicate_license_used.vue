<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <div class="errorHeader">
      <div id="errorHeader">{{ localize(`error_simultaneous_connection_title`) }}</div>
      <span class="promobar-icon"></span>
    </div>
    <div class='errorMessage'>
      <p id='p1' v-html="localize('error_simultaneous_connection_p1_text')"></p>
      <p id='p2'>{{ localize('error_simultaneous_connection_p2_text') }}</p>
    </div>
    <div class="errorBtnsHolder">
      <button @click="createTab({ url: `${currentInfo.website_url}/features/simultaneous-device-policy/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=deviceusagelimit` })" id="btnReturnHome">{{ localize('error_simultaneous_connection_learn_more_button_label') }}</button>
      <button id="cancelButton" @click="resetState"> {{ localize('error_simultaneous_connection_cancel_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';
  
  export default {
    name: 'duplicate_license_used',
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
    mounted() {
    },
};
</script>

<style lang="scss" scoped>
.duplicate_license_used {
  #p2 {
    margin-top: 20px;
  }
  .errorBtnsHolder {
    button#cancelButton {
      background-color: #ffffff;
      border: 1px solid #c8252c !important;
      text-align: center;
      color: #c8252c;
      border: 0;
      margin-top: 10px;
      transition: all .2s;
    }
    button#cancelButton:hover {
      color: #ffffff;
      background-color: #c8252c;
      opacity: 1;
    }
  }
}
</style>