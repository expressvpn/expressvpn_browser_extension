<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div class="isInstalled">
    <img v-svg-inline class="logo" src='/images/logo.svg' height="32" width="40" viewbox="0 0 128 128" />
    <transition name="fade" mode="out-in">
    <div class="isInstalled-content" :key="scene" style="transition-duration: 0.9s;">
      <img class="illustration" :src="currentImgSrc" />
      <p v-html="currentText"></p>
    </div>
    </transition>

    <div class="button-container">
      <div class="dots">
        <div v-for="index in 3" :key="index" :class="['dot', `${scene === index ? 'active' : ''}`]" />
      </div>
      <button class="primary" @click="incScene">{{ localize('welcome_continue_button_label') }}</button>
      <button class="secondary" @click="$parent.$emit('showImproveExpressVPN')">{{ localize('welcome_skip_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'isInstalled',
  data() {
    return {
      scene: 1,
    };
  },
  methods: {
    incScene() {
      if (this.scene === 3) {
        this.$parent.$emit('showImproveExpressVPN');
      } else {
        this.scene += 1;
      }
    },
  },
  computed: {
    currentImgSrc() {
      let imgSrc = `/images/illustrations/welcome_isInstalled_${this.scene}.svg`;
      if (this.scene === 1 && this.currentInfo.os === 'LINUX') {
        imgSrc = '/images/illustrations/welcome_isInstalled_linux_1.svg';
      }
      return imgSrc;
    },
    currentText() {
      let text = this.localize(`welcome_screen${this.scene}_p1_text`);
      if (this.scene === 3) {
        text += ` <a target="_blank" href="${this.currentInfo.website_url}/support/vpn-setup/expressvpn-browser-extension?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=welcome">
            ${this.localize('welcome_screen3_learn_more_text')}
          </a>`;
      }
      return text;
    },
  },
};
</script>

<style lang="scss" scoped>
.isInstalled {
  position: relative;
  height: 100%;

  &-content {
    text-align: center;

    p {
      //font-family: Inter-Regular;
      font-size: 16px;
      letter-spacing: 0px;
      line-height: 28px;
    }
  }

  .dots {
    margin: 22px 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .dot {
      height: 8px;
      width: 8px;
      background-color: var(--dot-bg);
      border-radius: 50%;
      display: inline-block;

      &.active {
        background-color: $eds-color-brand;
      }
      &:not(:nth-child(5)) {
        margin-right: 10px;
      }
    }
  }
}

.logo {
  margin-bottom: 30px;
}

.button-container {
  width: 100%;
  position: absolute;
  bottom: 0px;

  button:nth-of-type(n+2) {
    margin-top: 15px;
  }
}
</style>
<style lang="scss">
@media (prefers-color-scheme: light) {
  .isInstalled {
    --dot-bg: #{$eds-color-sand-20};
  }
}
@media (prefers-color-scheme: dark) {
  .isInstalled {
    --dot-bg: #{$eds-color-sand-20};

    .logo path {
      fill: $eds-color-grey-40;
    }
  }
}
</style>
