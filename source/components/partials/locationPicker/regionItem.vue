<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div :class="['location-item', 'region-item', { expanded }]">
    <div class="location-item-content">
      {{ name }}
    </div>
    <div class="location-expand">
      <div :class="['icon', 'icon-medium', (expanded ? 'icon-120-up' : 'icon-36-down')]"></div>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
  },
  mounted() {
  },
  props: {
    name: String,
    expanded: Boolean,
  },
};
</script>

<style lang="scss">
.region-item {

  &.expanded {
    background: $accent-20;
    .location-item-content, .location-expand .icon {
      color: $gray-50;
    }

    &:hover {
      background: $accent-10;
    }
    &:active {
      background: $accent-20;
      box-shadow: none;
    }
  }
  
}
</style>
