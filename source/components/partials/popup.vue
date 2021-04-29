<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="popup-container" v-if="options.isVisible">
    <div class="popup" :class='options.style'>
      <!--
        <div class="icon-close-holder" @click="options = {}">
          <img v-svg-inline class="icon-close" src='/images/icons/close.svg' width="20" height="20" viewbox="0 0 24 24" />
        </div>
        -->
        <div class="popup-header">{{ localize(options.id + '_title') }}</div>
        <div class="popup-text">{{ localize(options.id + '_text') }}</div>
        <div :class="['popup-button-container', options.style]">
          <button v-for="(buttonEl, key) in options.buttons" :class="buttonEl.highlightIt ? 'primary' : 'secondary'" @click="buttonEl.callback" :key="key" >
            {{ localize(options.id + '_btn' + key) }}
          </button>
        </div>
    </div>
  </div>
</template>
<script>
export default {
  computed: {
  },
  methods: {
  },
  mounted() {
  },
  props: {
    options: Object,
  },
};
</script>

<style lang="scss" scoped>
.popup {
  background: var(--popup-bk);
  width: 310px;
  height: auto;
  padding: 40px 15px 30px 15px;
  border-radius: 10px;
  box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.1);
  position: relative;

  .icon-close-holder {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  &-header {
    //font-family: Inter-Bold;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 0px;
    line-height: 32px;
    text-align: center;
    margin-bottom: 15px;
  }
  &-text {
    //font-family: Inter-Regular;
    font-size: 16px;
    font-weight: normal;
    letter-spacing: 0px;
    line-height: 28px;
    text-align: center;
  }
  &-container {
    position: fixed;
    z-index: 2;
    background: rgba(27, 29, 34, 0.4);
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &-button-container {
    display: flex;
    flex-direction: column;

    &.horizontal {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    button {
      margin-top: 15px;

      &.primary {
        order: 1;
      }
      &.secondary {
        order: 2;
      }
    }
  }
}
</style>
<style lang="scss">
.icon-close {
  path {
    fill: var(--icon-close-default)
  }
}
@media (prefers-color-scheme: light) {
  .popup {
    --popup-bk: #{$eds-color-white};
    --icon-close-default: #{$eds-color-grey-20};
  }
}
@media (prefers-color-scheme: dark) {
  .popup {
    --popup-bk: #{$eds-color-grey-10};
    --icon-close-default: #{$eds-color-grey-40};
  }
}
</style>
