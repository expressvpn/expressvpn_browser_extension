<template>
  <div class="power-button-container">
    <div :class="['power-button', `power-button-${currentInfo.state}`]" @click="onPowerButtonClick">
      <img v-svg-inline class="power-button-icon" src='/images/icons/connect.svg' width="72" height="72" viewbox="0 0 24 24" />
      <circle-progress-bar :value="currentInfo.progress" />
    </div>
  </div>
</template>
<script>
import circleProgressBar from './circleProgressBar.vue';

export default {
  name: 'powerButton',
  components: {
    circleProgressBar,
  },
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {
    onPowerButtonClick: function () {
      switch (this.currentInfo.state) {
        case 'ready':
          chrome.runtime.sendMessage({ connectToSelectedLocation: true });
          break;
        case 'connecting':
        case 'reconnecting':
          if ((parseInt(this.currentInfo.progress, 10) || 0) < 75 || this.currentInfo.state === 'reconnecting') {
            chrome.runtime.sendMessage({ cancelConnection: true });
          }
          break;
        case 'connected':
          chrome.runtime.sendMessage({ disconnect: true });
          break;
        case 'speedtesting':
          chrome.runtime.sendMessage({ cancelSpeedTest: true });
          break;
        default:
          break;
      }
    },
  },
  mounted() {
  },
};
</script>
<style lang="scss" scoped>
.power-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 110px;
  width: 110px;
  border-radius: 50%;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.1);
  background: var(--obi--background);

  &-container {
    position: relative;
    /*
    text-align: center;
    height: 55px;
    */
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: -55px;
  }

  &-icon {
    position: absolute;
    z-index: 1;
  }
}

@media (prefers-color-scheme: light) {
  .power-button {
    --obi--default-default: #{$eds-color-berry};
    --obi--default-hover: #{$eds-color-error-20};
    --obi--default-active: #{$eds-color-error-10};

    --obi--connecting-default: #{$eds-color-grey-40};
    --obi--connecting-hover: #{$eds-color-grey-30};
    --obi--connecting-active: #{$eds-color-grey-40};

    --obi--connected-default: #{$eds-color-mint-20};
    --obi--connected-hover: #{$eds-color-success-40};
    --obi--connected-active: #{$eds-color-mint-20};

    --obi--background: #{$eds-color-white};
  }
}
@media (prefers-color-scheme: dark) {
  .power-button {
    --obi--default-default: #{$eds-color-peach};
    --obi--default-hover: #{$eds-color-error-50};
    --obi--default-active: #{$eds-color-peach};

    --obi--connecting-default: #{$eds-color-grey-40};
    --obi--connecting-hover: #{$eds-color-grey-30};
    --obi--connecting-active: #{$eds-color-grey-40};

    --obi--connected-default: #{$eds-color-neon};
    --obi--connected-hover: #{$eds-color-warning-50};
    --obi--connected-active: #{$eds-color-neon};

    --obi--background: #{$eds-color-grey-10};
  }
}
</style>
<style lang="scss">
// inline svs style cannot be scoped(?)
.power-button {
  &-icon path {
    fill: var(--obi--default-default);
  }
  &:hover {
    .power-button-icon path {
      fill: var(--obi--default-hover);
    }
  }
  &:active {
    .power-button-icon path {
      fill: var(--obi--default-active);
    }
  }

  &-connecting, &-disconnecting { // v-svg-inline makes its props non reactive
    .power-button-icon path {
      fill: var(--obi--connecting-default);
    }
    &:hover {
      .power-button-icon path {
        fill: var(--obi--connecting-hover);
      }
    }
    &:active {
      .power-button-icon path {
        fill: var(--obi--connecting-active);
      }
    }
  }
  &-connected {
    .power-button-icon path {
      fill: var(--obi--connected-default);
    }
    &:hover {
      .power-button-icon path {
        fill: var(--obi--connected-hover);
      }
    }
    &:active {
      .power-button-icon path {
        fill: var(--obi--connected-active);
      }
    }
  }
}
</style>
