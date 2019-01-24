<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="okContainer">
      <div class="shieldHolder">
        <div :class="[currentInfo.state, 'shield', 'centerFlex']" id="shield">
          <div id="loader" :class="{ invisible: !['reconnecting', 'connecting'].includes(currentInfo.state) }"></div>
          <div :class="[{ disabled: ((parseInt(currentInfo.progress, 10) >= 75) && (parseInt(currentInfo.progress, 10) < 100)) || (currentInfo.state === 'speedtesting') }, 'button', 'centerFlex', currentInfo.state]" id="powerBtn" @click="powerBtnClick">
            <div :class="[{ on: ['reconnecting', 'connecting', 'connected'].includes(currentInfo.state) }, 'power']" id="power"></div>
          </div>
        </div>
      </div>
      <div class="stateHolder">
        <p id="state" @click="onCancel">{{ localize(`main_screen_status_vpn_${currentInfo.state}_text`) }}</p>
        <button id="cancelAction" :class="{ hidden: (!['reconnecting', 'connecting', 'speedtesting'].includes(currentInfo.state) || parseInt(currentInfo.progress, 10) >= 75 ) }" @click="onCancel" />
      </div>
      <div class="centerFlex">
        <div id="progressBar">
          <div id="bar" :style="progressBarStyle"></div>
        </div>
      </div>
      <div class="centerFlex">
        <p id="locationType">{{ localize((currentInfo.selectedLocation.is_smart_location ? 'main_screen_smart_location_text': 'main_screen_selected_location_text')) }}</p>
      </div>
      <div class="centerFlex currentLocationHolder">
        <img id="currentLocationFlag" :src="flagStyle" @error="this.setPlaceholder"/>
        <p id="currentLocationText">{{ currentInfo.selectedLocation.name }}</p>
      </div>
      <div :class="[{ visible: (currentInfo.state === 'ready') }, 'connectBtnHolder', 'centerFlex']">
        <button :disabled="currentInfo.selectedLocation.is_smart_location" id="smartLocation" @click="smartLocationClick">{{ localize('main_screen_smart_location_button_label') }}</button>
        <button id="customLocation" @click="customLocationClick">{{ localize('main_screen_choose_location_text') }}</button>
      </div>
      <div class="footer" id="messageHolder">
        <message-item :latestMessage='latestMessage' v-if='ratingMessageType === rating.ratingContainer.GENERAL_MESSAGE'></message-item>
        <rating-message-item v-else></rating-message-item>
      </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import ratingMessageItem from './ratingMessageItem.vue';
import messageItem from './messageItem.vue';

export default {
  name: 'okContainer',
  computed: {
    ...mapGetters([
      'currentInfo',
      'latestMessage',
      'ratingMessageType',
    ]),
    progressBarStyle() {
      let retStyle = '';

      if (this.currentInfo.state === 'connecting' || this.currentInfo.state === 'reconnecting') {
        retStyle = 'width: ' + parseInt(this.currentInfo.progress, 10) + '%';
      } else if (this.currentInfo.state === 'connected') {
        retStyle = 'width: 100%';
      } else {
        retStyle = 'width: 0%';
      }

      return retStyle;
    },
    flagStyle() {
      let country_code = this.currentInfo.selectedLocation.country_code;
      if (!country_code) {
        country_code = 'placeholder';
      }
      if (window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches) {
        country_code += '@2x';
      }
      return chrome.extension.getURL('/images/flags/' + country_code + '.png');
    },
  },
  methods: {
    onCancel: function (event) {
      if (this.currentInfo.state === 'speedtesting') {
        chrome.runtime.sendMessage({ cancelSpeedTest: true });
      } else if (this.currentInfo.state === 'connecting' || this.currentInfo.state === 'reconnecting') {
        if (parseInt(this.currentInfo.progress, 10) < 75) {
          chrome.runtime.sendMessage({ cancelConnection: true });
        }
      } else if (this.currentInfo.state === 'connected') {
        chrome.runtime.sendMessage({ disconnect: true });
      }
    },
    setPlaceholder() {
      let iconName = this.currentInfo.selectedLocation.is_smart_location ? 'smartLocation' : 'placeholder';
      if (window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)').matches) {
        iconName += '@2x';
      }
      document.getElementById('currentLocationFlag').src = chrome.extension.getURL('/images/flags/' + iconName + '.png');
    },
    powerBtnClick: function (event) {
      if (this.currentInfo.state === 'ready') {
        chrome.runtime.sendMessage({ connectToSelectedLocation: true });
      } else if (this.currentInfo.state === 'connecting' || this.currentInfo.state === 'reconnecting') {
        if (parseInt(this.currentInfo.progress, 10) < 75) {
          chrome.runtime.sendMessage({ cancelConnection: true });
        }
      } else if (this.currentInfo.state === 'connected') {
        chrome.runtime.sendMessage({ disconnect: true });
      }
    },
    smartLocationClick: function () {
      this.currentInfo.selectedLocation = this.currentInfo.smartLocation;
      this.$store.dispatch('updateCurrentInfo', this.currentInfo);

      chrome.runtime.sendMessage({ updateSelectedLocation: true, selectedLocation: this.currentInfo.selectedLocation });
    },
    customLocationClick: function (event) {
      this.$store.dispatch('setCurrentView', 'locationsScreen');
    },
  },
  components: {
    'rating-message-item': ratingMessageItem,
    'message-item': messageItem,
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
#okContainer {
  #currentLocationText {
    font-size: 14px;
  }
  #locationType {
    font-size: 10px;
  }
  .connectBtnHolder {
    margin-top: 18px;
    visibility: hidden;
    opacity: 0;

    button {
      width: 127px;
      height: 30px;
      background-image: linear-gradient(to bottom, #f1f1f1, #d8d8d8);
      text-transform: uppercase;
      font-size: 11px;
      line-height: 31px;
      color: #606060;
      box-shadow: 0px 1px 1px 0px rgba(10, 10, 10, 0.25);
      border: 0;
      transition: opacity 600ms, visibility 600ms;
      visibility: hidden;
      opacity: 1;
      border-radius: 2px;
    }
    &.visible button {
      visibility: visible;
    }

    button:disabled {
      opacity: 0.5;
    }

    button + button {
      margin-left: 8px;
    }

    button:enabled:hover {
      background-image: linear-gradient(to bottom, #f1f1f1, #eaeaea);
    }
    button:active {
      background-image: linear-gradient(to bottom, #f1f1f1, #c4c4c4);
    }
  }
  .visible {
    visibility: visible;
    opacity: 1;
    transition:opacity 0.2s linear;
  }
  .messageItem {
    width: 100%;
    height: 100%;
  }
}
</style>
