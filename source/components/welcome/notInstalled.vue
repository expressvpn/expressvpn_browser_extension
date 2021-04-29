<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div class="scenes">
    <img v-svg-inline class="logo" src='/images/logo/expressvpn-logo-red.svg' width="167" height="32" />
    <div class="scene" v-if="scene <= 3">
      <div class="scene-text">{{ localize(`welcome_not_installed_scene_${scene}_text`) }}</div>
      <img class="scene-image" :src="`/images/illustrations/welcome_not_activated_${scene}.png`" />
    </div>
    <div class="scene" v-else>
      <div class="scene-header">{{ localize('welcome_not_installed_buy_header') }}</div>
      <div class="scene-header-secondary">{{ localize('welcome_not_installed_buy_text') }}</div>
      <div class="animation-container list">
        <ul class="check-list">
          <li v-for="index in 4" :key="index">{{ localize(`welcome_not_installed_reasons_li_${index}_text`) }}</li>
        </ul>
      </div>
    </div>
    <div class="button-container">
      <div class="dots">
        <div class="chevron" @click="decScene" v-visible="scene > 1">
          <img v-svg-inline src='/images/icons/chevron-left.svg' width="24" height="24" />
        </div>
        <div v-for="index in 4" :key="index" :class="['dot', `${scene === index ? 'active' : ''}`]"></div>
        <div class="chevron" @click="incScene" v-visible="scene < 4">
          <img v-svg-inline src='/images/icons/chevron-right.svg' width="24" height="24" />
        </div>
      </div>
      <button class="primary" @click="createTab({ url: `${currentInfo.website_url}/order?utm_content=welcome_screen_not_installed&utm_medium=apps&utm_source=browser_extension` })">{{ localize('welcome_not_installed_get_button_label') }}</button>
      <button class="secondary" @click="$parent.$emit('showImproveExpressVPN')">{{ localize('welcome_not_installed_existing_button_label') }}</button>
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'notInstalled',
  data() {
    return {
      scene: 1,
    };
  },
  computed: {
  },
  methods: {
    incScene() {
      if (this.scene < 4) {
        this.scene += 1;
      }
    },
    decScene() {
      if (this.scene > 1) {
        this.scene -= 1;
      }
    },
  },
  mounted() {
    if (process.env.NODE_ENV === 'development' && this.currentInfo.scene) {
      this.scene = this.currentInfo.scene;
    } else if (localStorage.getItem('alreadySawWelcomeAnimation')) {
      this.scene = 4;
    } else {
      localStorage.setItem('alreadySawWelcomeAnimation', true);
    }
  },
};
</script>

<style lang="scss" scoped>
.scenes {
  position: relative;
  height: 100%;

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

    .chevron {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }
}

.logo {
  margin-bottom: 30px;
}
.scene {
  &-text, .scene-header {
    font-family: FSKimText-Medium;
    font-size: 28px;
    font-weight: 500;
    letter-spacing: 0px;
    line-height: 39px;
  }

  &-image {
    width: 100%;
    margin-top: 20px;
  }

  &-header-secondary {
    margin-top: 10px;
    margin-bottom: 30px;
    //font-family: Inter-Regular;
    font-family: Inter;
    font-size: 16px;
    font-weight: normal;
    letter-spacing: 0px;
    line-height: 28px;
  }
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
.dots .chevron path {
  fill: var(--chevron-bg);
}
@media (prefers-color-scheme: light) {
  .scenes {
    --location-box-bg: #{$eds-color-white};
    --dot-bg: #{$eds-color-sand-20};
    --chevron-bg: #{$eds-color-grey-20};
  }
}
@media (prefers-color-scheme: dark) {
  .scenes {
    --location-box-bg: #{$eds-color-white};
    --dot-bg: #{$eds-color-grey-20};
    --chevron-bg: #{$eds-color-grey-40};
  }
  .scenes .logo path {
    fill: $eds-color-grey-40;
  }
}
</style>
