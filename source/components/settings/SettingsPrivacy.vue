<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="SettingsPrivacy">
    <div class='sideHeader'>
      <div id='settingsBackBtn' class="sideBackBtn" @click="sideBackBtnClick"></div>
      <span>{{ localize('menu_settings_privacy_security_name') }}</span>
    </div>
    <div class="settings">
      <div class='setting'>
        <option-holder :text="localize('menu_privacy_hide_location_text')" keyValue="hideLocation" :vmodel='prefs' :tooltip="localize('menu_settings_privacy_hide_location_description_text')"/>
      </div>
      <div class='setting'>
        <option-holder :text="localize('menu_privacy_block_webrtc_text')" keyValue="chrome.prevent_webrtc_leaks" :vmodel='prefs' :tooltip="localize('menu_settings_privacy_block_webrtc_description_text')"/>
      </div>
      <div class='setting' id="webrtc_opt">
        <div id="upgradeFirefox">
          <span>Requires Firefox 54 or newer.</span>
          <a href="https://www.mozilla.org/en-US/firefox/new/">Update Firefox</a>
        </div>
      </div>
      <div class='setting'>
        <option-holder :text="localize('menu_privacy_enable_https_everywhere_text')" keyValue="httpsEverywhere" :vmodel='prefs' :tooltip="localize('menu_settings_privacy_https_everywhere_description_text')"/>
      </div>
      <!--
      <div class='setting'>
        <option-holder :text="localize('menu_privacy_block_malwarephishing_text')" keyValue="blockMalwarePhishing" :vmodel='prefs' :tooltip="localize('menu_settings_privacy_block_malwarephishing_description_text')"/>
      </div>
      -->
      <div class="setting only-for-alpha-builds">
        <div class="opt-holder">
          <label for="httpsPeriodicity">Periodicity</label>
          <select name="httpsPeriodicity" id="httpsPeriodicity" v-model="prefs.httpsPeriodicity"><!-- Value is in seconds -->
            <option v-bind:value="60">Every minute (CPU intensive!)</option>
            <option v-bind:value="300">Every 5 minutes</option>
            <option v-bind:value="86400">Every 24 hours</option>
          </select>
        </div>
        <div class="opt-description">Last checked: <b>{{ lastHttpsCheck }}</b></div>
      </div>
      <div class='setting'>
        <a class="openExternal" @click="createTab({ url: `${currentInfo.website_url}/blog/https-everywhere-browser-extension/?utm_source=extension&utm_medium=browser_extension&utm_campaign=https_everywhere&utm_content=learnmore`})">{{ localize('menu_settings_privacy_learn_more_button_label') }}</a>
      </div>
      <transition name="slide-fade" >
        <hint type="success" icon="CheckWhite" message="hint_saved_text" v-if="isSaving"></hint>
      </transition>
    </div>
  </div>
</template>
<script>
import timeago from 'timeago.js';
import optionHolder from '../settings/optionHolder.vue';

export default {
  name: 'SettingsPrivacy',
  data: function () {
    return {
      lastHttpsCheck: 'Never',
      prefs: {},
    };
  },
  components: {
    optionHolder,
  },
  methods: {
    sideBackBtnClick: function (event) {
      this.$store.dispatch('setCurrentView', 'menuScreen');
    },
    allVPNsettingsClick: (event) => {
      chrome.runtime.sendMessage({ openPreferences: true });
    },
  },
  mounted() {
    let self = this;
    chrome.storage.local.get(null, function (storage) {
      if (typeof storage.prefs === 'object') {
        self.prefs = Object.assign({}, self.utils.defaultPreferences, storage.prefs);
      }
      if (storage['last-checked']) {
        self.lastHttpsCheck = timeago().format(parseInt(storage['last-checked'], 10) * 1000, self.selectedLanguage);
      }
    });

    // Hide WebRTC option if browser does not support it
    for (let i = 0; i < this.webrtcMinimumVersion.length; i += 1) {
      let minBrowser = this.webrtcMinimumVersion[i];
      if (minBrowser.name === this.browserInfo.name) {
        if (this.utils.versionCompare(this.browserInfo.version, minBrowser.minimumVersion) < 0) {
          if (this.browserInfo.name === 'Firefox') {
            document.getElementById('chrome.prevent_webrtc_leaks').disabled = true;
            document.querySelector('label[for="chrome.prevent_webrtc_leaks"]').classList.add('disabledText');
            document.getElementById('upgradeFirefox').style.display = 'block';
          } else {
            document.getElementById('webrtc_opt').classList.add('hide');
          }
          break;
        }
      }
    }
  },
};
</script>
<style lang="scss" scoped>
$xvpn_red: #c8252c;
#SettingsPrivacy {
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
    color: #C8252C;
    font-size: 14px;
    letter-spacing: 0.8px;
  }

  #upgradeFirefox * {
    font-size: 12px !important;
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

  .settings {
    padding: 10px 0px 0px 10px;
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
    margin-right: 10px;
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

  .openExternal {
    margin-top: 20px;
    display: inline-block;
  }

  #languageSetting span {
    padding-left: 0px;
  }

  #languageSetting {
    border: 1px solid #000;
    border-radius: 4px;
    padding: 6px 5px 0px;
    margin-right: 15px;
    position: relative;
    margin-bottom: 10px;
    
    label {
      font-size: 9px;
      text-transform: uppercase;
      color: #6D6D6D;
      padding: 0px 8px 0;
      position: absolute;
    }
    
    select {
      font-size: 13px;
      width: 100%;
      background-color: #fff;
      border: 0px;
      height: 30px;
      margin-top: 6px;
      margin-bottom: 7px;
    }
  }
}
</style>