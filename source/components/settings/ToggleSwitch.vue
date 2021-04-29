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
  width: 40px;
  height: 20px;
  border-radius: 14.5px;

  input {
    opacity: 0;

    &:checked + .handler {
      background-color: $eds-color-success-50;
    }
    &:checked + .handler:before { /*handler - checked*/
      background-color: #3aa48a;
      left: 20px;
    }
  }
  .handler {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $eds-color-grey-30;
    border-radius: 50px;

    &:before {
      position: absolute;
      content: "";
      width: 20px;
      height: 20px;
      top: 50%;
      transform: translateY(-50%);
      background-color: $eds-color-white;
      border-radius: 50%;
      box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25);
      transition: all cubic-bezier(0.3, 1.5, 0.7, 1) 0.2s;
      right: 20px;
    }
  }
}
</style>
<style lang="scss">
@media (prefers-color-scheme: light) {
  .header-secondary {
    --icon-back-default: #{$eds-color-midnight};
    --icon-back-hover: #{$eds-color-mint-20};
  }
}
@media (prefers-color-scheme: dark) {
  .header-secondary {
    --icon-back-default: #{$eds-color-grey-40};
    --icon-back-hover: #{$eds-color-neon};
  }
}
</style>
