<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <label class="toggle">
    <input type="checkbox" :id="id" :checked="value" @change="$emit('input', $event.target.checked)">
    <div class="handler"></div>
  </label>
</template>

<script type="text/javascript">
  export default {
    name: 'ToggleSwitch',
    // share common functionality with component mixins
    mixins: [],
    // component properties/variables
    props: ['id', 'value'],
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
    methods: {},
    // component Lifecycle hooks
    beforeCreate() {},
    mounted() {
    },
};
</script>

<style lang="scss" scoped>
.toggle {
  width: 32px;
  height: 14px;
  
  input {
    opacity: 0;
    
    &:checked + .handler {
      background-color: rgba(81, 158, 93, 0.5);
    }
    &:checked + .handler:before { /*handler - checked*/
      background-color: $green-20;
      left: 15px;
    }
  }
  .handler {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(109, 109, 109, 0.5);
    border-radius: 50px;
    
    &:before {
      position: absolute;
      content: "";
      width: 20px;
      height: 20px;
      top: 50%;
      transform: translateY(-50%);
      background-color: $gray-40;
      border-radius: 50%;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      transition: all cubic-bezier(0.3, 1.5, 0.7, 1) 0.2s;
      right: 15px;
    }
  }
}
</style>