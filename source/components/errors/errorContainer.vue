<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div :class="currentInfo.state">
    <div class="error-container">
      <component :is="currentErrorComponent"></component>
    </div>
  </div>
</template>

<script>
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
  components: getAllErrorComponents(),
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
  height: 600px;
  padding: 30px 20px 20px 20px;

  &>div {
    position: relative;
    height: 100%;
  }

  h1 {
    // font-family: Inter-Bold;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0px;
    line-height: 26px;
  }

  p {
    margin-top: 10px;
  }

  a, p, span, li {
    //font-family: Inter-Regular;
    font-size: 16px;
    font-weight: normal;
    //height: 56px;
    letter-spacing: 0px;
    line-height: 28px;
  }

  .hint-container {
    padding: 0 !important;
  }

  .code {
    background: #5e5e5e;
    border-radius: 4px;
    height: 44px;
    color: #fcfcfc;
    font-family: CourierNewPS-BoldMT;
    font-size: 16px;
    display: flex;
    align-items: center;
    padding-left: 15px;
    user-select: text;
  }

  .button-container {
    width: 100%;
    position: absolute;
    bottom: 0;

    button:nth-of-type(n+2) {
      margin-top: 15px;
    }
  }
}
ol {
  counter-reset: item;
  margin: 30px 0 0 0;
  padding-left: 33px;

  &>li {
    list-style: none inside;
    counter-increment: item;
    margin-bottom: 10px;

    &:before {
      content: counter(item);
      font-family: FSKimText-Medium;
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 0px;
      line-height: 25px;
      margin: 0 10px 0 -35px;
      padding: 1px;
      display: inline-block;
      border-radius: 50%;
      width: 28px;
      background: var(--ol-bullet-bg);
      color: var(--ol-bullet-font);
      text-align: center;
    }
  }
}
.fraudster {
  overflow: auto;
}

@media (prefers-color-scheme: light) {
  .error-container {
    --ol-bullet-bg: #{$eds-color-midnight};
    --ol-bullet-font: #{$eds-color-white};
  }
}
@media (prefers-color-scheme: dark) {
  .error-container {
    --ol-bullet-bg: #{$eds-color-grey-10};
    --ol-bullet-font: #{$eds-color-white};
  }
}
</style>
