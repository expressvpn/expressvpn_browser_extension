<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div :class="currentInfo.state">
    <main-header :hideIcon="true"></main-header>
    <div class="error-container">
      <component :is="currentErrorComponent"></component>
    </div>
  </div>
</template>

<script>
import mainHeader from '../partials/mainHeader.vue';
import mixinError from '../../scripts/mixins/error';
import mixinSubscription from '../../scripts/mixins/subscription';

// Loads all vue components "semi-dynamically"
const getAllErrorComponents = () => {
  const vueFiles = require.context('./', false, /\.vue$/);
  const components = {};
  vueFiles.keys().forEach(key => {
    if (key === './errorContainer.vue') {
      return;
    }
    components[key.replace(/(\.\/|\.vue)/g, '')] = vueFiles(key).default;
  });
  return components;
};

export default {
  name: 'errorContainer',
  mixins: [mixinError, mixinSubscription],
  components: Object.assign({}, getAllErrorComponents(), { 'mainHeader': mainHeader }),
  computed: {
    currentErrorComponent() {
      let allErrorComponents = getAllErrorComponents();
      let importName = this.currentInfo.state;

      if (!this.isTrialUser() && this.isPaymentMethodIAP() && this.isLastInAppPurchasesFailure() && importName !== 'not_activated') {
        importName = 'iapError';
      } else if (Object.prototype.hasOwnProperty.call(allErrorComponents, importName) === false) {
        importName = 'defaultError';
      }
      return importName;
    },
  },
};
</script>

<style lang="scss">
.error-container {
  background-color: $gray-50;
  height: calc(600px - 60px); // total height - header
  padding: 25px 15px;
  overflow-y: auto;

  h1 {
    font-family: ProximaNova-Light;
    font-size: 24px;
    color: $black-20;
    text-align: center;
    font-weight: normal;
    margin: 0;
  }

  p {
    margin-top: 25px;    
    color: $black-20;
  }

  a, p, span, li {
    font-size: 18px;
    line-height: 23px;
  }

  .hint-container {
    padding: 0 !important;
  }

  .bold {
    font-family: proximaNova-Semibold;
  }

  .code {
    background: $gray-10;
    border-radius: 4px;
    height: 44px;
    color: $gray-50;
    font-family: CourierNewPS-BoldMT;
    font-size: 16px;
    display: flex;
    align-items: center;
    padding-left: 15px;
    user-select: text;
  }
}

</style>