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
    <div :class="['location-expand', `${expanded ? 'up' : 'down'}`]">
      <img class="icon" v-svg-inline src='/images/icons/chevron-right.svg' width="24" height="24" />
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

  &:nth-child(n + 2):before {
    content: '';
    border-top: 1px solid var(--location-item-border-color);
    top: 0;
    width: 100%;
    opacity: 0.4;
    position: absolute;
  }
  &.expanded .location-item-content {
    font-weight: bold;
  }

  .location-expand {
    &.up {
      transform: rotate(-90deg);

      .icon path {
        fill: var(--font-color-highlight);
      }
    }
    &.down {
      transform: rotate(90deg);
    }
  }

  &:hover {
    .icon path {
      fill: var(--font-color-highlight);
    }
  }
  &:active {
    .icon path {
      fill: var(--font-color);
    }
  }
}
</style>
<style lang="scss">
</style>
