<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <div class="welcome-container" v-if="['NOT_INSTALLED', 'not_activated'].includes(currentInfo.state) && !showImproveExpressVPN">
      <not-installed />
    </div>
    <div class="welcome-container" v-else>
      <is-installed v-if="!showImproveExpressVPN" />
      <improve-expressvpn v-else />
    </div>
  </div>
</template>

<script>
import improveExpressvpn from './welcome/improveExpressVPN.vue';
import isInstalled from './welcome/isInstalled.vue';
import notInstalled from './welcome/notInstalled.vue';

export default {
  name: 'welcome',
  data() {
    return {
      showImproveExpressVPN: false,
    };
  },
  components: {
    notInstalled,
    isInstalled,
    improveExpressvpn,
  },
  methods: {
  },
  mounted() {
    this.$store.dispatch('setIgnoreStateUpdates', true);
    if (this.currentInfo.forceShowHelpImproveScreen === true) {
      this.showImproveExpressVPN = true;
    }
    this.$on('showImproveExpressVPN', ev => {
      this.showImproveExpressVPN = true;
    });
  },
};
</script>

<style lang="scss" scoped>
.welcome-container {
  height: 100vh;
  padding: 25px 15px;
  position: relative;
}
</style>
