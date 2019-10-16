<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <secondary-header stringkey="menu_settings_settings_general_title" :onBackClick="sideBackBtnClick" :showSearchOption="false" />
    <div class="setting-container">
      <div class='setting-group'>
        <span class="setting-header">{{ localize('menu_settings_general_header') }}</span>
        <div class="setting-option-container">
          <label for="chrome.auto_connect">{{ localize('menu_connection_startup_text') }}</label>
          <toggle-switch id="chrome.auto_connect" v-model="prefs['chrome.auto_connect']"></toggle-switch>
        </div>
        <div class="setting-option-container">
          <label for="chrome.desktop_notification">{{ localize('menu_desktop_notification_text') }}</label>
          <toggle-switch id="chrome.desktop_notification" v-model="prefs['chrome.desktop_notification']"></toggle-switch>
        </div>
      </div>

      <button v-if="currentInfo.os !== 'LINUX'" @click="openAppSettings" id="openAppSettings">{{ localize('menu_settings_general_open_app_settings_button_label') }}</button>

      <div class="divider"></div>

      <div class='setting-group'>
        <span class="setting-header">{{ localize('menu_settings_general_language_header') }}</span>
        <div class="setting-option-container">
          <div class="select-container">
            <label for="language">{{ localize('menu_settings_general_language_label') }}</label>
            <select id="language" v-model="prefs.language">
              <option :id="'lang_'+lang.code" v-for="lang in langList" :value="lang.code" :key="lang.code">
                {{ lang.label }}
              </option>
            </select>
            <i class="icon icon-38-dropdown" />
          </div>
        </div>
      </div>
      <transition name="slide-fade" >
        <toast message="hint_saved_text" v-if="isSaving"></toast>
      </transition>
    </div>
  </div>
</template>
<script>
import secondaryHeader from '../partials/secondaryHeader.vue';
import toggleSwitch from './ToggleSwitch.vue';
import toast from './toast.vue';

export default {
  name: 'SettingsGeneral',
  data: function () {
    return {
      prefs: {},
      isSaving: false,
      isMounting: false,
      successfulConnections: 0,
      activatedDate: '',
      isSuccessfulConnection: '',
      previousConnectionTime: 0,
      lastReviewDate: 'Never',
    };
  },
  components: {
    toggleSwitch,
    toast,
    secondaryHeader,
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
    openAppSettings: (event) => {
      chrome.runtime.sendMessage({ openPreferences: true });
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
  created() {
    this.isMounting = true;
    let self = this;
    chrome.storage.local.get(null, function (storage) {
      if (typeof storage.prefs === 'object') {
        self.prefs = Object.assign({}, self.utils.defaultPreferences, storage.prefs);
        if (!storage.prefs.language) {
          let langCode = navigator.language.toLowerCase();
          for (let i in self.langList) {
            let langRx = new RegExp(`^${self.langList[i].code}`, 'i');
            if (langRx.test(langCode)) {
              let langCodeSplit = langCode.split('-')[0];
              self.prefs.language = langCodeSplit;
              break;
            }
          }
        }
      }
    });
  },
};
</script>
<style lang="scss">
#openAppSettings {
  height: 34px;
  background: $gray-50;
  border: 1px solid #D0D6DA;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  width: 100%;
  margin-top: 15px;
  color: $primary-20;
  font-family: ProximaNova-Semibold;
  font-size: 16px;

  &:hover {
    color: $primary-30;
  }
  &:active {
    color: $primary-10;
  }
}
.divider {
  border-bottom: 1px solid #DEDEDE;
  margin: 25px 0;
}
.setting {

  &-container {
    background: $gray-50;
    padding: 25px 15px;
    height: 100vh;
    border-top: 1px solid #DEDEDE;

    .toggle {
      right: 0;
      position: absolute;
    }
  }

  &-header {
    color: $black-20;
    font-family: ProximaNova-Light;
    font-size: 24px;
  }

  &-group {

  }

  &-option-container {
    margin-top: 16px;
    display: flex;
    align-items: center;
    position: relative;

    label {
      color: $black-20;
      font-size: 18px;
      width: calc(100% - 32px);
    }

    .select-container {
      border: 1px solid $black-20;
      border-radius: 4px;
      position: relative;
      padding: 6px 15px;
      height: 52px;
      width: 100%;

      label {
        font-size: 12px;
        color: $gray-20;
        position: absolute;
      }
      select {
        background: $gray-50;
        border: 0;
        color: $black-20;
        font-size: 18px;
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