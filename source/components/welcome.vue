<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <main-header :hideIcon="true"></main-header>
    <div class="welcome-container" v-if="['NOT_INSTALLED', 'not_activated'].includes(currentInfo.state) && !showImproveExpressVPN">
      <animations />
      <div class="button-container">
        <button class="button-primary" @click="createTab({ url: `${currentInfo.website_url}/order?utm_content=welcome_screen_not_installed&utm_medium=apps&utm_source=browser_extension` })">{{ localize('welcome_not_installed_get_button_label') }}</button>
        <button class="button-secondary" @click="showImproveExpressVPN = true">{{ localize('welcome_not_installed_existing_button_label') }}</button>
      </div>
    </div>
    <div class="welcome-container" v-else>
      <div v-if="!showImproveExpressVPN">
        <component :is="currentStep"></component>
        <div class="dots" v-html="dots"></div>
        <div class="button-container horizontal">
          <button class="button-secondary" @click="showImproveExpressVPN = true">{{ localize('welcome_skip_button_label') }}</button>
          <button class="button-primary" @click="nextStep">{{ localize('welcome_continue_button_label') }}</button>
        </div>
      </div>
      <improveExpressVPN v-else />
    </div>
  </div>
</template>

<script>
import mainHeader from './partials/mainHeader.vue';
import step1 from './welcome/is_installed/step1.vue';
import step2 from './welcome/is_installed/step2.vue';
import step3 from './welcome/is_installed/step3.vue';
import improveExpressVPN from './welcome/is_installed/improveExpressVPN.vue';
import animations from './welcome/not_installed/animations.vue';

export default {
  name: 'welcome',
  data() {
    return {
      showImproveExpressVPN: false,
      step: 1,
      MAX_STEPS: 3,
    };
  },
  components: {
    mainHeader,
    animations,
    step1,
    step2,
    step3,
    improveExpressVPN,
  },
  computed: {
    dots() {
      let html = '';
      for (let i = 1; i <= this.MAX_STEPS; i++) {
        html += `<span class="dot ${this.step === i ? 'active' : ''}"></span>`;
      }
      return html;
    },
    currentStep() {
      return 'step' + this.step;
    },
  },
  methods: {
    nextStep() {
      this.step += 1;
      if (this.step > this.MAX_STEPS) {
        this.showImproveExpressVPN = true;
      }
    },
    previousStep() {
      this.step -= 1;
    },
  },
  mounted() {
    this.$store.dispatch('setIgnoreStateUpdates', true);
    if (this.currentInfo.forceShowHelpImproveScreen === true) {
      this.showImproveExpressVPN = true;
    }
  },
};
</script>

<style lang="scss">
.welcome-container {
  background-color: var(--gray50);
  border-top: 1px solid #DEDEDE;
  height: calc(600px - 60px); // total height - header
  padding: 25px 15px;
  position: relative;

  p {
    font-size: 20px;    
    color: var(--black20);
    text-align: center;
  }

  .button-container.horizontal {
    display: inline-block;

    button {
      width: 150px;

      &:first-of-type {
        margin-right: 20px;
      }
    }
  }

  .dots {
    position: absolute;
    left: 50%;
    bottom: 105px;
    transform: translateX(-50%);

    .dot {
      height: 8px;
      width: 8px;
      background-color: var(--gray30);
      border-radius: 50%;
      display: inline-block;
      margin-right: 8px;

      &.active {
        background-color: var(--accent20);
      }
    }
  }
}
</style>