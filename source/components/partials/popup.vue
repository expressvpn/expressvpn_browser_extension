<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="popup-container" v-if="options.isVisible">
    <div class="popup" :class='options.style'>
        <div class="popup-header">{{ localize(options.id + '_title') }}</div>
        <div class="popup-text">{{ localize(options.id + '_text') }}</div>
        <div :class="['popup-button-container', options.style]">
          <button v-for="(buttonEl, key) in options.buttons" :class="buttonEl.highlightIt ? 'highlight' : ''" @click="buttonEl.callback" :key="key" >
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
  background: var(--gray50);
  width: 320px;
  height: auto;
  padding: 12px 14px 15px 14px;
  border-radius: 4px;

  &-header {
    color: var(--black20);
    font-size: 20px;
  }
  &-text {
    color: var(--gray10);
    font-family: ProximaNova-Semibold;
    font-size: 16px;
    border-top: 1px solid #DDDDDD;
    margin: 13px 0;
    padding-top: 13px;
  }
  &-container {
    position: absolute;
    background: rgba(27, 29, 34, 0.4);
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &-button-container {

    &.horizontal {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;

      button {
        width: 138px;
        margin: 0 !important;
      }
    }

    button {
      background: var(--gray50);
      border-radius: 4px;
      border: 1px solid #D0D6DA;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
      height: 34px;
      color: var(--accent20);
      font-family: ProximaNova-Semibold;
      font-size: 16px;
      display: block;
      width: 100%;

      &.highlight {
        background: var(--accent20);
        color: #FFFFFF;

        &:hover {
          background: var(--accent30);
          color: #FFF;
        }
        &:active {
          background: var(--accent10);
          color: #FFF;
        }
      }

      &:not(.highlight) {
        &:hover {
          color: var(--accent30);
        }
        &:active {
          color: var(--accent20);
        }
      }

      &:nth-of-type(n+2) {
        margin-top: 10px;
      }
    }
  }
}
</style>
<style lang="scss">
[data-theme="dark"] {
  button {
    &.highlight {
      border: none;
      color: var(--gray10);
      &:hover {
        background: var(--accent10);
      }
    }
    &:not(.highlight) {
      color: var(--gray10);
    }
  }
}
</style>