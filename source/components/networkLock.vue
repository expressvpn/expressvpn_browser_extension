<template>
  <div class="nl">
    <div class="nl-content">
      <img v-svg-inline class="logo" src='/images/logo.svg' height="48" width="38" viewbox="0 0 128 128" />
      <div v-if="!['connecting', 'reconnecting', 'connection_error'].includes(currentInfo.state) && !isNonceValid">
        <p><b>Warning:</b> an unexpected redirect was detected. Only continue if you recognise the link below</p>
        <p>Please <a target="_blank" :href="`${currentInfo.website_url}/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=network-lock-nonce`">contact Support</a> if this issue persists.</p>
        <a :href="urlParams.get('url')">{{ urlParams.get('url') }}</a>
      </div>
      <div v-else>
        <div v-if="['connecting', 'reconnecting', 'connection_error', 'connected'].includes(currentInfo.state)">
          <div class="status-header">{{ localize(`networkLock_header_${currentInfo.state}_text`) }}</div>
          <div class="status" v-html="localize(`networkLock_status_${currentInfo.state}_text`).replace('%LOCATION%', currentInfo.selectedLocation.name)"></div>
          <hint :stringKey="`networkLock_hint_${currentInfo.state}_text`" :iconName="icons[currentInfo.state]" :type="currentInfo.state === 'connected' ? 'green' : 'information'" />
          <div class="button-container" v-if="currentInfo.state !== 'connected'">
            <button v-if="currentInfo.state === 'connection_error'" class="primary" @click="reconnect()">{{ localize('networkLock_try_again_button_label') }}</button>
            <button v-if="currentInfo.state === 'connection_error'" class="secondary" @click="unblock()">{{ localize('networkLock_unblock_internet_button_label') }}</button>
            <button v-if="['connecting', 'reconnecting'].includes(currentInfo.state)" class="secondary" @click="onCancel()">{{ localize('networkLock_cancel_button_label') }}</button>
          </div>
        </div>
        <div v-else>
          <hint stringKey="networkLock_hint_connected_text" iconName="link" type="green" />
        </div>
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
  watch: {
    'currentInfo.state': function (newVal, oldVal) {
      if (['connected', 'ready'].includes(this.currentInfo.state) && this.isNonceValid) {
        this.openWebsite();
      }
    },
  },
  data: function () {
    return {
      urlParams: new URLSearchParams(window.location.search),
      isNonceValid: false,
      icons: {
        'connected': 'link',
        'connecting': 'reconnect',
        'reconnecting': 'reconnect',
        'connection_error': 'error',
      },
    };
  },
  computed: {
    extensionPreferences() {
      return this.$store.getters.extensionPreferences;
    },
  },
  methods: {
    openWebsite() {
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
  },
  created() {
    let self = this; 
    if (this.urlParams.get('nonce') === localStorage['nonce']) {
      this.isNonceValid = true;
    }
    chrome.storage.local.get('prefs', function (storage) {
      if (typeof storage.prefs === 'object') {
        self.$store.dispatch('setExtensionPreferences', Object.assign({}, self.utils.defaultPreferences, storage.prefs));
      }
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
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;

  .logo {
    margin-bottom: 30px;
  }

  &-content {
    width: 480px;
    //height: 424px;
    background: var(--popup-bg);
    box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 40px;
    position: relative;

    .status {
      //font-family: Inter-Regular;
      font-size: 16px;
      //font-weight: normal;
      height: 28px;
      letter-spacing: 0px;
      line-height: 28px;
      margin: 15px 0 30px 0;

      &-header {
        font-family: FSKimText-Medium;
        font-size: 32px;
        font-weight: 500;
        letter-spacing: -0.5px;
        line-height: 40px;
      }
    }

    .button-container {
      position: relative;
      bottom: 0;
      margin-top: 30px;

      button {
        width: 100%;

        &:nth-of-type(n+2) {
          margin-top: 15px;
        }
      }
    }

    .hint {
      padding: 15px 20px;
    }
  }
}
</style>

<style lang="scss">
@media (prefers-color-scheme: light) {
  .nl {
    --bg: #{$eds-color-sand-30};
    --popup-bg: #{$eds-color-white};
  }
}
@media (prefers-color-scheme: dark) {
  .nl {
    --bg: #{$eds-color-midnight};
    --popup-bg: #{$eds-color-grey-10};

    .logo path {
      fill: $eds-color-grey-40;
    }
  }
}
</style>
