<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="header-secondary">
    <div class="icon icon-medium icon-12-back" @click="onBackClick"></div>
    <div>{{ localize(stringkey) }}</div>
    <div v-if="showSearchOption" class="icon icon-medium icon-96-search" @click="onSearchClick"></div>
  </div>
</template>
<script>
export default {
  name: 'secondaryHeader',
  mixins: [],
  props: {
    stringkey: {
      type: String,
      required: true,
    },
    onBackClick: {
      type: Function,
      required: true,
    },
    showSearchOption: {
      type: Boolean,
      required: false,
      default: false,
    },
    onSearchClick: {
      type: Function,
      required: false,
    },
  },
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {
  },
  components: {
  },
  mounted() {
  },
};
</script>
<style lang="scss" scoped>
.header-secondary {
  height: 60px;
  background-color: $gray-40;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  .icon {
    position: absolute;
    color: #000;

    &:first-of-type {
      left: 15px;
    }
    &:last-of-type {
      right: 15px;
    }

    &:hover {
      color: $gray-20;
    }
    &:active {
      color: $black-30;
    }
  }

}
</style>