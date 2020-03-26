<template>
  <div class="nl">
    <div class="nl-content">
      <img class="logo" :src="logoPath" />
      <div v-if="['connecting', 'reconnecting', 'connection_error', 'connected'].includes(currentInfo.state)">
        <h1>{{ localize(`networkLock_header_${currentInfo.state}_text`) }}</h1>
        <hint :stringKey="`networkLock_hint_${currentInfo.state}_text`" :iconName="icons[currentInfo.state]" />
        <div class="status" v-html="localize(`networkLock_status_${currentInfo.state}_text`).replace('%LOCATION%', currentInfo.selectedLocation.name)"></div>
        <div class="button-container" v-if="currentInfo.state !== 'connected'">
          <button v-if="currentInfo.state === 'connection_error'" class="button-primary" @click="reconnect()">{{ localize('networkLock_try_again_button_label') }}</button>
          <button v-if="currentInfo.state === 'connection_error'" class="button-secondary" @click="unblock()">{{ localize('networkLock_unblock_internet_button_label') }}</button>
          <button v-if="['connecting', 'reconnecting'].includes(currentInfo.state)" class="button-secondary" @click="onCancel()">{{ localize('networkLock_cancel_button_label') }}</button>
        </div>
      </div>
      <div v-else>
        <hint stringKey="networkLock_hint_connected_text" iconName="icon-64-link" />
      </div>
    </div>
  </div>
</template>
<script>
import Hint from './partials/hint.vue';

export default {
  name: 'networkLock',
  components: {
    Hint,
  },
  watch:{
    'currentInfo.state': function (newVal, oldVal) {
      if (['connected', 'ready'].includes(this.currentInfo.state)) {
        this.openWebsite();
      }
    },
  },
  data: function () {
    return {
      urlParams: new URLSearchParams(window.location.search),
      icons: {
        'connected': 'icon-64-link',
        'connecting': 'icon-89-reconnect',
        'reconnecting': 'icon-89-reconnect',
        'connection_error': 'icon-56-information',
      }
    };
  },
  computed: {
    extensionPreferences() {
      return this.$store.getters.extensionPreferences;
    },
    imageSuffix() {
      return this.$store.state.imageSuffix;
    },
    logoPath() {
      return `/images/logo-header${this.imageSuffix}.png`;
    },
  },
  methods: {
    openWebsite() {
      const self = this;
      window.setTimeout(() => {
        window.location.replace(this.urlParams.get('url'));
      }, 500); // give it enough time for the lock to disengage if needed
    },
    onCancel() {
      chrome.runtime.sendMessage({ cancelConnection: true });
    },
    reconnect: function (event) {
      chrome.runtime.sendMessage({ reconnect: true });
    },
    unblock() {
      this.resetState();
      this.openWebsite();
    },
    setTheme: function () {
      this.$store.state.imageSuffix = (this.extensionPreferences.displayMode === 'dark' || this.extensionPreferences.displayMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '_dark' : '';
      switch (this.extensionPreferences.displayMode) {
          case 'light':
          case 'dark':
            document.documentElement.setAttribute('data-theme', this.extensionPreferences.displayMode);
            break;
          case 'auto':
            document.documentElement.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            break;
          default:
            break;
        }
    },
  },
  created() {
    let self = this;
    chrome.storage.local.get('prefs', function (storage) {
      if (typeof storage.prefs === 'object') {
        self.$store.dispatch('setExtensionPreferences', Object.assign({}, self.utils.defaultPreferences, storage.prefs));
        self.setTheme();
      }
    });
    window.matchMedia("(prefers-color-scheme: dark)").addListener((ev) => {
      self.setTheme();
    });
  },
};
</script>

<style lang="scss">
@import '@/styles/global.scss';

.nl {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--gray40);
  display: flex;
  align-items: center;
  justify-content: center;

  &-content {
    width: 370px;
    background: var(--gray50);
    box-shadow: 0px 2px 4px 2px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 25px 30px;
    position: relative;

    h1 {
      color: var(--black20);
      font-size: 28px;
      font-family: ProximaNova-Semibold;
      line-height: 35px;
      margin: 30px 0 25px 0;
    }

    .status {
      color: var(--black20);
      font-size: 18px;
      font-family: ProximaNova;
      line-height: 23px;
      margin-top: 15px;
    }

    .logo {
      width: 170px;
      height: 35px;
    }

    .button-container {
      position: relative;
      bottom: 0;
      margin-top: 30px;
      
      button {
        width: 100%;
      }
    }
  }
}
</style>