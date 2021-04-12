<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="header-secondary">
    <div class="icon-back-container icon-container" @click="onBackClick">
      <img v-svg-inline class="icon icon-back" :src="`/images/icons/back.svg`" width="24" height="24" viewbox="0 0 24 24" />
    </div>
    <div>{{ localize(stringkey) }}</div>
    <div v-if="showSearchOption" class="icon-search-container icon-container" @click="onSearchClick">
      <img v-svg-inline class="icon icon-search" :src="`/images/icons/search.svg`" width="24" height="24" viewbox="0 0 24 24" />
    </div>
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
  height: 64px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: left;
  //font-family: Inter-Bold;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0px;
  line-height: 22px;
  padding: 20px;

  .icon-search-container, .icon-back-container {
    width: 24px;
    height: 24px;
  }
  .icon-back-container {
    margin-right: 15px;
  }
  .icon-search-container {
    margin-left: auto;
  }
}
</style>
<style lang="scss">
.header-secondary {
  .icon {
    path {
      fill: var(--icon-back-default);
    }
    &-container:hover {
      .icon path {
        fill: var(--icon-back-hover);
      }
    }
  }
}

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
