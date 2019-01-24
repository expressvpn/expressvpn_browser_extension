<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :id="currentInfo.state" :class="currentInfo.state">
    <div class="errorHeader">
      <div id="errorHeader">{{ localize(`error_fraudster_title`) }}</div>
      <span class="promobar-icon"></span>
    </div>
    <div class='errorMessage'>
      <p id='p1' v-html="localize('error_fraudster_p1_text')"></p>
      <p id='p2'style='height: 20px;'></p>
    </div>
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';

  export default {
    name: 'fraudster',
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
      let browserName = '';
      browserName = this.browserInfo.name;
      if (browserName === 'Firefox') {
        document.getElementById('errorContainer').style.overflowY = 'scroll'; // Using scrollview in case 'Firefox' browser.
      } else {
        this.$root.$el.style.height = '525px';
        this.$parent.$el.style.height = '404px';
      }
      /* eslint no-underscore-dangle: 0 */
      this.$el.querySelector('#fraudster-text-1').setAttribute(this.$options._scopeId, '');
      this.$el.querySelector('#email').setAttribute(this.$options._scopeId, '');
    },
};
</script>

<style lang="scss" scoped>
#fraudster {
  .errorMessage {
  }
  #p1 {
    user-select: text;
  }
  #fraudster-text-1 {
    font-size: 14px !important;
    font-weight: 600 !important;
  }
  #email {
    color: #2196f3;
  }
}
</style>