<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="SettingsGeneral">
    <div class='sideHeader'>
      <div id='settingsBackBtn' class="sideBackBtn" @click="sideBackBtnClick"></div>
      <span>{{ localize('menu_settings_settings_general_title') }}</span>
    </div>
    <div class="settings">
      <div class='setting'>
        <span>{{ localize('menu_settings_general_header') }}</span>
        <div class="opt-holder">
          <label for="chrome.auto_connect">{{ localize('menu_connection_startup_text') }}</label>
          <toggle-switch id="chrome.auto_connect" v-model="prefs['chrome.auto_connect']"></toggle-switch>
        </div>
        <div class="opt-holder">
          <label for="chrome.desktop_notification">{{ localize('menu_desktop_notification_text') }}</label>
          <toggle-switch id="chrome.desktop_notification" v-model="prefs['chrome.desktop_notification']"></toggle-switch>
        </div>
      </div>
      <button @click="allVPNsettingsClick" id="allVPNsettings">{{ localize('menu_settings_general_open_app_settings_button_label') }}</button>
      <div class="separator"></div>
      <div class='setting'>
        <span>{{ localize('menu_settings_general_language_header') }}</span>
        <div id="languageSetting">
          <select id="language" v-model="prefs.language" :options="langList" label="label">
            <option :id="'lang_'+lang.code" v-for="lang in langList" v-bind:value="lang.code">
              {{ lang.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="setting only-for-alpha-builds">
        <div class="opt-holder">
          <label for="ratingPeriodicity">Periodicity</label>
          <select name="ratingPeriodicity" id="ratingPeriodicity" v-model="prefs.ratingPeriodicity"><!-- Value is in seconds -->          
            <option v-bind:value="300">5 minutes</option>
            <option v-bind:value="86400">Every day</option>
          </select>
        </div>
        <div class="opt-description">Successful Connections: <b>{{ successfulConnections }}</b></div>
        <div class="opt-description">Activated: <b>{{ activatedDate }}</b></div>
        <div class="opt-description">successfulConnection: <b>{{ isSuccessfulConnection }}</b></div>
        <div class="opt-description">PreviousConnectionTime: <b>{{ previousConnectionTime }}</b> minutes</div>
        <div class="opt-description">Last Review: <b>{{ lastReviewDate }}</b></div>
      </div>
      <transition name="slide-fade" >
        <hint type="success" icon="CheckWhite" message="hint_saved_text" v-if="isSaving"></hint>
      </transition>
    </div>
  </div>
</template>
<script>
import toggleSwitch from '../EDS/ToggleSwitch.vue';
import hint from '../EDS/Hint.vue';

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
    hint,
  },
  watch: {
    prefs: {
      handler: function (newVal, oldVal) {
        if (this.isMounting === true) { // skip the semi-initial assignment
          return;
        }
        let self = this;
        this.triggerSaveAnimation();
        self.rating.updateRatingMessageConditions(newVal.ratingPeriodicity);
        chrome.storage.local.set({ 'prefs': Object.assign({}, newVal) }, function () {
          chrome.runtime.sendMessage({ updateExtensionSettings: true });
          window.currentLanguageCode = newVal.language;
          self.setLanguage();
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
    allVPNsettingsClick: (event) => {
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
  mounted() {
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
      let ratingValue = storage.rating;
      self.successfulConnections = ratingValue.successfulConnections;
      self.activatedDate = new Date(ratingValue.activatedDate * 1000);
      self.isSuccessfulConnection = ratingValue.isSuccessfulConnection;
      self.previousConnectionTime = Math.round(ratingValue.previousConnectionTime / 60);
      if (ratingValue.lastReviewDate > ratingValue.activatedDate) {
        self.lastReviewDate = new Date(ratingValue.lastReviewDate * 1000);
      }
    });

    // Hide All settings button in Linux since it has no UI
    if (this.currentInfo.os === 'LINUX') {
      document.getElementById('allVPNsettings').style.display = 'none';
    }
  },
};
</script>
<style lang="scss" scoped>
$xvpn_red: #c8252c;
#SettingsGeneral {
  background-color: #fafafa;
  width: 100vw;
  height: 100vh;
  z-index: 4;
  float: left;
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;

  a {
    color: $xvpn_red;
    font-size: 14px;
  }

  .separator {
    width: calc(100% - 15px);
    border-bottom: 1px solid #ccc;
    margin: 20px 0px 20px 0px;
  }

  button#allVPNsettings {
      width: calc(100% - 15px);
      height: 30px;
      border-radius: 4px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
      font-size: 14px;
      font-style: normal;
      font-stretch: normal;
      line-height: 31px;
      letter-spacing: normal;
      background-color: #ffffff;
      border: 1px solid $xvpn_red !important;
      text-align: center;
      color: $xvpn_red;
      margin-top: 5px;
      transition: all .2s;
      font-family: ProximaNova-Semibold;
    }
    button#allVPNsettings:hover {
      color: #ffffff;
      background-color: $xvpn_red;
      opacity: 1;
    }

.sideHeader {
  height: 80px;
  border-bottom: none;
  background-color: #fafafa;
}

.sideHeader span {
  font-size: 24px;
}

.sideBackBtn {
    top: 31px;
}

  .opt-holder {
    height: 20px;
    left: 0px;
    display:flex;
    align-items:center;
    margin-top: 10px;
    margin-bottom: 10px;

    input[type="checkbox"] {
      float: right;
    }

  }

  .toggle {
    transform: scale(0.5);
    margin-left: auto;
    order: 2;
  }


  .settings {
    padding: 5px 0px 0px 14px;
    margin: 0px 10px 0px 10px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.15);
    flex: 1;
    margin-bottom: 10px;
  }

  .opt-description {
    color: #606060;
    font-size: 14px;
  }

  .setting {
    margin-top: 10px;
  }

  .setting span {
    font-size: 20px;
    color: #4a4a4a;
    display: block;
    font-family: ProximaNova-Light;
  }

  .setting label {
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #4a4a4a;
  }

  #languageSetting span {
    padding-left: 0px;
  }

  #languageSetting {
    border: 1px solid #000;
    border-radius: 4px;
    margin-right: 15px;
    position: relative;
    margin-bottom: 10px;
    margin-top: 15px;
    
    select {
      font-size: 13px;
      width: 100%;
      background-color: #fff;
      border: 0px;
      height: 35px;
    }
  }
}
</style>