<!--
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <div class="scene" v-if="scene <= 3">
      <div class="scene-text">{{ localize(`welcome_not_installed_scene_${scene}_text`) }}</div>
      <div class="animation-container">
        <div class="animation"></div>
      </div>
    </div>
    <div class="scene" v-else>
      <div @click="resetAnimations()" v-if="scene === 4">
        <span> <!-- v-svg-inline cannot have parent with @click (?) -->
          <img v-svg-inline class="svg-icon replay" src="/images/icons/replay.svg"/>
        </span>
      </div>
      <div class="scene-header">{{ localize('welcome_not_installed_buy_header') }}</div>
      <div class="scene-header-secondary">{{ localize('welcome_not_installed_buy_text') }}</div>
      <div class="animation-container list">
        <ul class="check-list check-list-rounded">
          <li v-for="index in 4" :key="index">{{ localize(`welcome_not_installed_reasons_li_${index}_text`) }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import lottie from 'lottie-web';

export default {
  name: 'animations',
  data() {
    return {
      scene: 1,
    };
  },
  computed: {

  },
  methods: {
    resetAnimations() {
      this.scene = 1;
      setTimeout(() => {
        this.loadAnimation();
      }, 10); // Give time for DOM to re-render
    },
    loadAnimation() {
      let self = this;
      let animParams = {
        container: document.querySelector('.animation'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: chrome.extension.getURL(`/images/welcome_scene_${this.scene}.json`),
      };
      lottie.setQuality(1);

      let animation = lottie.loadAnimation(animParams);
      animation.onComplete = function () {
        this.destroy();
        self.onAnimationComplete();
      };
      animation.play();
    },
    onAnimationComplete() {
      this.scene++;
      if (this.scene <= 3) {
        this.loadAnimation();
      }
    },
  },
  mounted() {
    if (process.env.NODE_ENV === 'development' && this.currentInfo.scene) {
      this.scene = this.currentInfo.scene;
      this.loadAnimation();
    } else if (localStorage.getItem('alreadySawWelcomeAnimation')) {
      this.scene = 4;
    } else {
      localStorage.setItem('alreadySawWelcomeAnimation', true);
      this.loadAnimation();
    }
  },
};
</script>

<style lang="scss" scoped>
.replay {
  cursor: pointer;
  position: fixed;
  top: 18px;
  right: 18px;
}

.scene {
  margin-top: 25px;
  &-header {
    font-size: 20px;
    text-align: center;
    font-family: ProximaNova-Semibold;
    &-secondary {
      font-family: ProximaNova-Semibold;
      color: $gray-20;
      font-size: 16px;
      margin-top: 15px;
      text-align: center;
    }
  }
  &-text {
    font-size: 20px;
    text-align: center;
  }
}
.animation {
  &-container {
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    background-color: var(--gray40);
    width: 100%;
    position: absolute;
    left: 0;
    top: 172px;
    height: 176px;

    &.list {
      padding: 25px 15px;
      justify-content: center !important;
    }
  }
}
</style>
<style lang="scss">
[data-theme="dark"] {
  .replay path {
    fill: var(--gray20);
  }
}
</style>
