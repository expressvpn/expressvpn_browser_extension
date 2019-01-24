<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div
    class="locationItem regionItem"
    :class="{ selected: expanded }"
    :data-name="utils.fixedEncodeURIComponent(name)"
  >
    {{ name }}
    <img class="region-state-icon" :src="chromePath(`/images/${expanded ? 'expanded' : 'collapsed'}-item@3x.png`)" />
    <img class="splitbar-icon" :src="chromePath(`/images/${expanded ? 'splitbar-white' : 'splitbar'}@3x.png`)" />
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

<style lang="css" scoped>
  .regionItem img.region-state-icon {
    position: absolute;
    top: 14px;
    right: 10px;
    height: 7.4px;
  }

  .regionItem img.splitbar-icon {
    position: absolute;
    top: 7px;
    right: 28px;
    height: 21px;
  }

  .regionItem.selected {
    background-color: #1f475a;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    color: #fefefe;
  }
</style>
