<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="['hint', type]">
      <span>{{ localize(message) }}</span>
      <img :src="iconPath"></img>
  </div>
</template>

<script type="text/javascript">
  export default {
    name: 'Hint',
    // share common functionality with component mixins
    mixins: [],
    // component properties/variables
    props: ['type', 'icon', 'message'],
    // variables
    data: function () {
      return {
        iconPath: chrome.extension.getURL('/images/' + this.icon + '.png'),
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
.hint {
    width: 80px;
    height: 40px;
    border-radius: 5px;
    line-height: 44px;
    width: fit-content; 
    padding: 0px 20px 0px 20px;
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    bottom: 20px;
  
    span {
        color: #fff;
        font-size: 18px;
        font-family: ProximaNova-Semibold;
    }
  
    img {
        margin-left:10px;
        width: 14px;
        height: 14px;
    }

    &.success {
        background-color: #15D075;
    }
}
</style>