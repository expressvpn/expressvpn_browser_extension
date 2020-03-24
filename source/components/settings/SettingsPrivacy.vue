<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <secondary-header stringkey="menu_settings_privacy_security_name" :onBackClick="sideBackBtnClick" :showSearchOption="false" />
    <div class="setting-container">
      <div class='setting-group'>
        <div class="setting-option-container">
          <label for="hideLocation">{{ localize('menu_privacy_hide_location_text') }}</label>
          <toggle-switch id="hideLocation" v-model="prefs['hideLocation']"></toggle-switch>
        </div>
        <div class="setting-description">{{ localize('menu_settings_privacy_hide_location_description_text') }}</div>
      </div>

      <div class="divider" />

      <div class='setting-group'>
        <div class="setting-option-container">
          <label for="webrtc_opt">{{ localize('menu_privacy_block_webrtc_text') }}</label>
          <toggle-switch id="webrtc_opt" v-model="prefs['chrome.prevent_webrtc_leaks']"></toggle-switch>
        </div>
        <div class="setting-description">{{ localize('menu_settings_privacy_block_webrtc_description_text') }}</div>
      </div>

      <div class="divider" />

      <div class='setting-group'>
        <div class="setting-option-container">
          <label for="httpsEverywhere">{{ localize('menu_privacy_enable_https_everywhere_text') }}</label>
          <toggle-switch id="httpsEverywhere" v-model="prefs['httpsEverywhere']"></toggle-switch>
        </div>
        <div class="setting-description">{{ localize('menu_settings_privacy_https_everywhere_description_text') }}</div>
      </div>

      <div class="button-container">
        <button class="button-secondary" @click="createTab({ url: `${currentInfo.website_url}/support/vpn-setup/expressvpn-browser-extension?utm_source=browser_extension&utm_medium=apps` })">{{ localize('menu_settings_privacy_learn_more_button_label') }}</button>
      </div>
    </div>
    
    <transition name="slide-fade" >
      <toast message="hint_saved_text" v-if="isSaving"></toast>
    </transition>
  </div>
</template>
<script>
import secondaryHeader from '../partials/secondaryHeader.vue';
import toggleSwitch from './ToggleSwitch.vue';
import toast from './toast.vue';

export default {
  name: 'SettingsPrivacy',
  data: function () {
    return {
      lastHttpsCheck: 'Never',
      prefs: {},
      isSaving: false,
      isMounting: false,
    };
  },
  watch: {
    prefs: {
      handler: function (newVal, oldVal) {
        if (this.isMounting === true) { // skip the semi-initial assignment
          return;
        }
        this.triggerSaveAnimation();
        chrome.storage.local.set({ 'prefs': Object.assign({}, newVal) }, function () {
          chrome.runtime.sendMessage({ updateExtensionSettings: true });
        });
      },
      deep: true,
    },
  },
  components: {
    secondaryHeader,
    toggleSwitch,
    toast,
  },
  methods: {
    triggerSaveAnimation: function () {
      this.isSaving = true;
      let self = this;
      setTimeout(function () {
        self.isSaving = false;
      }, 500);
    },
    sideBackBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
  },
  updated: function () {
    let self = this;
    this.$nextTick(function () {
    // Code that will run only after the
    // entire view has been re-rendered
      self.isMounting = false;
    });
  },
  mounted() {
    this.isMounting = true;
    let self = this;
    chrome.storage.local.get(null, function (storage) {
      if (typeof storage.prefs === 'object') {
        self.prefs = Object.assign({}, self.utils.defaultPreferences, storage.prefs);
      }
    });
  },
};
</script>
<style lang="scss" scoped>
.divider {
  border-bottom: 1px solid #DEDEDE;
  margin: 25px 0;
}
.setting {

  &-description {
    font-size: 12px;
    line-height: 15px;
    color: var(--black20);
    margin-top: 5px;
    width: 275px;
  }

  &-container {
    background: var(--gray50);
    padding: 25px 15px;
    height: 100vh;
    border-top: 1px solid #DEDEDE;
    

    .toggle {
      right: 0;
      position: absolute;
    }
  }

  &-header {
    color: var(--black20);
    font-family: ProximaNova-Light;
    font-size: 24px;
  }

  &-group {

  }

  &-option-container {
    height: 23px;
    display: flex;
    align-items: center;
    position: relative;

    &:nth-child(n+2) {

    }

    label {
      color: var(--black20);
      font-size: 18px;
    }

    .select-container {
      border: 1px solid var(--black20);
      border-radius: 4px;
      position: relative;
      padding: 6px 15px;
      height: 52px;
      width: 100%;

      label {
        font-size: 12px;
        color: var(--gray20);
        position: absolute;
      }
      select {
        background: var(--gray50);
        border: 0;
        color: var(--black20);
        font-size: 20px;
        width: 100%;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin-top: calc(22px - 6px); // - 6px from padding in the container
      }
      .icon {
        position: absolute;
        right: 15px;
        top: 50%;
        pointer-events: none;
        transform: translateY(-50%);
      }
    }
  }
}
</style>
