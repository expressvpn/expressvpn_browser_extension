<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
  </div>
</template>

<script type="text/javascript">
  import errorContainer from './errorContainer.vue';
  
  export default {
    // Do not forget this little guy
    name: 'defaultError',
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
        sampleBool: true,
      };
    },
    computed: {
    },
    // when component uses other components
    components: {},
    // methods
    watch: {},
    methods: {},
    // component Lifecycle hooks
    beforeCreate() {},
    mounted() {},
};
</script>

<style lang="scss" scoped>
  .defaultError { /* ... */ }
</style>