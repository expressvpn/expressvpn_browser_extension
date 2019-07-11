<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <main-header :hideIcon="true"></main-header>
    <div class="welcome-container">
      <component :is="currentStep"></component>
      <div v-if="step < 3">
        <div class="dots" v-html="dots"></div>
        <div class="button-container horizontal">
          <button class="button-secondary" @click="showHome">{{ localize('welcome_skip_button_label') }}</button>
          <button class="button-primary" @click="nextStep">{{ localize('welcome_continue_button_label') }}</button>
        </div>
      </div>
      <div v-else>
        <div class="button-container">
          <button class="button-primary" @click="showHome">{{ localize('welcome_get_started_button_label') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mainHeader from './partials/mainHeader.vue';
import step1 from './welcome/step1.vue';
import step2 from './welcome/step2.vue';
import step3 from './welcome/step3.vue';

export default {
  name: 'welcome',
  data() {
    return {
      step: 1,
    };
  },
  components: {
    step1,
    step2,
    step3,
    mainHeader,
  },
  computed: {
    dots() {
      const MAX_STEPS = 3;
      let html = '';
      for (let i = 1; i <= MAX_STEPS; i++) {
        html += `<span class="dot ${this.step === i ? 'active' : ''}"></span>`;
      }
      return html;
    },
    currentStep() {
      return 'step' + this.step;
    },
  },
  methods: {
    showHome() {
      this.$store.dispatch('setIgnoreStateUpdates', false);
      chrome.runtime.sendMessage({ finishedWelcome: true });
    },
    nextStep() {
      this.step += 1;
    },
    previousStep() {
      this.step -= 1;
    },
  },
  mounted() {
    this.$store.dispatch('setIgnoreStateUpdates', true);
  },
};
</script>

<style lang="scss">
.welcome-container {
  background-color: $gray-50;
  border-top: 1px solid #DEDEDE;
  height: calc(600px - 60px); // total height - header
  padding: 25px 15px;
  position: relative;

  p {
    font-size: 20px;    
    color: $black-20;
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
    text-align: center;

    .dot {
      height: 8px;
      width: 8px;
      background-color: $gray-30;
      border-radius: 50%;
      display: inline-block;
      margin-right: 8px;

      &.active {
        background-color: $accent-20;
      }
    }
  }
}
</style>