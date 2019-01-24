<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="errorContainer" :class="currentInfo.state">
    <component :is="currentErrorComponent"></component>
  </div>
</template>

<script>
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
  components: getAllErrorComponents(),
  computed: {
    currentErrorComponent() {
      let allErrorComponents = getAllErrorComponents();
      let importName = this.currentInfo.state;

      // if (allErrorComponents.hasOwnProperty(importName) === false) {
      if (Object.prototype.hasOwnProperty.call(allErrorComponents, importName) === false) {
        importName = 'defaultError';
      }
      return importName;
    },
  },
  mixins: [],
  methods: {},
  mounted() {},
};
</script>

<style lang="scss">
$xvpn_red: #c8252c;
#errorContainer {
  height: 330px;
  width: 240px;
  background-color: #ffffff;
  box-shadow: 0px 1.5px 4px 2px rgba(0,0,0,0.1);
  padding: 20px 10px;
  border-radius: 4px;
  margin-left: 10px;

  &.fraudster {
  }

  .errorMessage {
    margin-top: 10px;
    font-size: 13.6px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.28;
    letter-spacing: normal;
    text-align: left;
    color: #1a1c21;
  }

  #errorHeader {
    font-size: 13.5px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    text-align: left;
    color: #fefefe;
  }

  .errorBtnsHolder {
    position: absolute;
    bottom: 30px;
    text-align: center;
    width: 80%;
    button {
      width: 240px;
      height: 39px;
      border-radius: 4px;
      background-color: $xvpn_red;
      text-align: center;
      border: 0;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
      font-size: 15px;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #f7f7f7;
      font-family: ProximaNova-Semibold;
      &:hover {
        opacity: 0.8;
      }
    }
    .linkButton {
      display: block;
      margin-top: 18px;
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 0.74;
      letter-spacing: 0.4px;
    }
  }
}
</style>