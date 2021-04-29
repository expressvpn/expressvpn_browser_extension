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
          <toggle-switch id="chrome.auto_connect" v-model="extensionPreferences['chrome.auto_connect']"></toggle-switch>
        </div>
        <div class="setting-option-container">
          <label for="chrome.desktop_notification">{{ localize('menu_desktop_notification_text') }}</label>
          <toggle-switch id="chrome.desktop_notification" v-model="extensionPreferences['chrome.desktop_notification']"></toggle-switch>
        </div>
        <div class="setting-option-container" style="flex-direction: column;">
          <label for="helpImprove" style="width: 100%;max-width: none;">{{ localize('settings_general_help_improve_label') }}</label>
          <toggle-switch id="helpImprove" v-model="extensionPreferences['helpImprove']"></toggle-switch>
          <div class="setting-description">{{ localize('settings_general_help_improve_description') }}</div>
        </div>
        <div class="setting-option-container">
          <label>{{ localize('menu_keyboard_shortcut_text') }}</label>
          <a v-if="!showShortcutInput" @click="openShortcutSettings" class="linkOption">{{ browserActionShortcut !== '' ? browserActionShortcut : '⌨️' }}</a>
          <input v-else type="text" @keydown="saveKeys" v-model="newShortcut" ref="shortcutInput" />
        </div>
      </div>

      <button v-if="currentInfo.os !== 'LINUX'" @click="openAppSettings" id="openAppSettings" class="secondary">{{ localize('menu_settings_general_open_app_settings_button_label') }}</button>

      <div class="divider"></div>

      <div class='setting-group'>
        <span class="setting-header">{{ localize('menu_settings_general_display_header') }}</span>
        <div class="setting-option-container">
          <div class="select-container">
            <label for="language">{{ localize('menu_settings_general_language_label') }}</label>
            <select id="language" v-model="extensionPreferences.language">
              <option :id="'lang_'+lang.code" v-for="lang in langList" :value="lang.code" :key="lang.code">
                {{ lang.label }}
              </option>
            </select>
            <img v-svg-inline src='/images/icons/chevron-down.svg' width="24" height="24" class="icon" />
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
      newShortcut: '',
      showShortcutInput: false,
      prefs: {},
      isSaving: false,
      isMounting: false,
      successfulConnections: 0,
      activatedDate: '',
      isSuccessfulConnection: '',
      previousConnectionTime: 0,
      lastReviewDate: 'Never',
      browserActionShortcut: '',
    };
  },
  components: {
    toggleSwitch,
    toast,
    secondaryHeader,
  },
  computed: {
    extensionPreferences() {
      return this.$store.getters.extensionPreferences;
    },
  },
  watch: {
    showShortcutInput: function(val) {
      if (val === true) {
        const shortcutInputEl = this.$refs.shortcutInput;
        setTimeout(() => {
          this.$refs.shortcutInput.focus();
        }, 25);
      }
    },
    extensionPreferences: {
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
    saveKeys(event) {
      event.preventDefault();
      if (['Delete', 'Backspace'].includes(event.key)) {
        this.newShortcut = '';
      } else if(event.key === 'Enter' && (this.newShortcut.match(/-/g) || []).length === 2) {
        browser.commands.update({ name: '_execute_browser_action', shortcut: this.newShortcut.replace(/CONTROL/i, 'Ctrl').replace(/⇧/i, 'Shift').replace(/⌘/i, 'Command').replace(/-/g, '+') });
        this.browserActionShortcut = this.beautifyCommand(this.newShortcut.replace(/-/g, '+'));
        this.showShortcutInput = false;
        this.triggerSaveAnimation();
      } else if ((this.newShortcut.match(/-/g) || []).length < 2) {
        this.newShortcut += (this.newShortcut !== '' ? '-' : '') + event.key.replace(/shift/i, '⇧').replace(/meta/i, '⌘').toUpperCase();
      }
    },
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
    openShortcutSettings() {
      switch (this.browserInfo.name) {
        case 'Firefox':
          this.showShortcutInput = true;
          break;
        default:
          this.createTab({ url: 'chrome://extensions/shortcuts' });
          break;
      }
    },
    beautifyCommand(command) {
      return command.replace(/shift/i, '⇧').replace(/command/i, '⌘').replace(/CONTROL/i,'Ctrl').replace(/\+/g, '');
    },
  },
  created() {
    this.isMounting = true;
    let self = this;

    chrome.commands.getAll(commands => {
      self.browserActionShortcut = self.beautifyCommand(commands.find(cmd => cmd.name === '_execute_browser_action').shortcut);
    });
    chrome.storage.local.get(null, function (storage) {
      if (typeof storage.prefs === 'object') {
        self.$store.dispatch('setExtensionPreferences', Object.assign({}, self.utils.defaultPreferences, storage.prefs));
        if (!storage.prefs.language) {
          let langCode = navigator.language.toLowerCase();
          for (let i in self.langList) {
            let langRx = new RegExp(`^${self.langList[i].code}`, 'i');
            if (langRx.test(langCode)) {
              let langCodeSplit = langCode.split('-')[0];
              self.extensionPreferences.language = langCodeSplit;
              break;
            }
          }
        }
      }

      self.$nextTick(function () {
        self.isMounting = false;
      });
    });
  },
};
</script>
<style lang="scss" scoped>
#openAppSettings {
  margin-top: 15px;
  margin-bottom: 30px;
}
.linkOption {
  position: absolute;
  right: 0;
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 0px;
  line-height: 28px;
  text-align: center;
  color: $eds-color-info-20;
}

input[type="text"] {
  background: #fff;
  border-radius: 4px;
  border: 1px solid var(--gray20);
  height: 28px;
  width: 82px;
  color: var(--black20);
  font-size: 12px;
  padding: 6px 5px;
}
.setting {

  &-description {
    margin-top: 10px;
    font-size: 12px;
    font-weight: normal;
    letter-spacing: 0px;
    line-height: 22px;
  }

  &-container {
    padding: 0px 20px;
    height: 100vh;

    .toggle {
      right: 0;
      position: absolute;
    }
  }

  &-header {
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0px;
    line-height: 26px;
  }


  &-option-container {
    margin-top: 15px;
    display: flex;
    align-items: center;
    position: relative;
    justify-content: space-between;

    &>label {
      max-width: 85%;
    }
    label {
      //width: calc(100% - 32px);
      font-size: 16px;
      font-weight: normal;
      letter-spacing: 0px;
      line-height: 28px;
    }

    .select-container {
      border: 1px solid var(--input-border);
      background: var(--input-bg);
      border-radius: 5px;
      position: relative;
      padding: 6px 15px;
      height: 60px;
      width: 100%;

      .icon {
        position: absolute;
        right: 20px;
        top: 50%;
        pointer-events: none;
        transform: translateY(-50%);

        path {
          fill: var(--font-color)
        }
      }

      label {
        font-size: 12px;
        color: var(--label-color);
        position: absolute;
        pointer-events: none;
      }
      select {
        background: var(--input-bg);
        border: 0;
        color: var(--font-color);
        font-size: 16px;
        width: 100%;
        height: 100%;
        appearance: none;
        padding-top: 20px;
      }
    }
  }
}
</style>
