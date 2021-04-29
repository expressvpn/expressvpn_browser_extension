<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="popup-container">
    <div class="popup">
      <div class="icon-close-holder" @click="closeIt">
        <img v-svg-inline class="icon-close" src='/images/icons/close.svg' width="20" height="20" viewbox="0 0 24 24" />
      </div>
      <div v-show="ratingState === 'start'"> <!-- using v-show because v-svg-inline . Should be removed in the future-->
        <img v-svg-inline class="logo" src='/images/logo.svg' width="48" height="38" viewbox="0 0 128 128" />
        <span class="popup-header">{{ localize('rating_prompt_header') }}</span>
        <div class="rating">
          <div class="star" v-for="value in 5" :key="value" @click="handleRating(6 - value)" />
        </div>
      </div>
      <div v-show="ratingState === '3star'">
        <span class="popup-header">{{ localize('rating_improve_header') }}</span>
        <div class="button-container">
          <button class="primary" @click="improve('report')">{{ localize('rating_improve_report_button') }}</button>
          <button class="secondary" @click="improve('suggest')">{{ localize('rating_improve_suggest_button') }}</button>
        </div>
      </div>
      <div v-show="ratingState === '5star'">
        <span class="popup-header">{{ localize('rating_thanks_text') }}</span>
        <div class="button-container">
          <button class="primary" @click="openWebStore">{{ localize('rating_prompt_ok_button') }}</button>
          <button class="secondary" @click="discardPrompt">{{ localize('rating_no_thanks_text') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import UAParser from 'ua-parser-js';

export default {
  name: 'ratingPrompt',
  data() {
    return {
      ratingState: 'start',
    };
  },
  computed: {
  },
  methods: {
    openWebStore() {
      let currentBrowser = this.browserInfo.name;
      let url = '';
      if (currentBrowser === 'Chrome') {
        url = 'https://chrome.google.com/webstore/detail/expressvpn-for-chrome/fgddmllnllkalaagkghckoinaemmogpe/reviews';
      } else if (currentBrowser === 'Firefox') {
        url = 'https://addons.mozilla.org/en-US/firefox/addon/expressvpn/';
      }

      chrome.storage.sync.get('rating', (storage) => {
        if (typeof storage.rating === 'object' && Object.keys(storage.rating).length > 0) {
          let ratingData = storage.rating;
          ratingData.everClickedMaxRating = true;
          chrome.storage.sync.set({ 'rating': ratingData });
        }
        this.createTab({ url: url });
      });
    },
    closeIt() {
      this.discardPrompt();
    },
    handleRating(value) {
      this.setReviewDates();
      switch (value) {
        case 1:
        case 2:
        case 3:
          this.ratingState = '3star';
          break;
        case 4:
          this.$parent.$emit('show-4star-hint');
          break;
        case 5:
          this.ratingState = '5star';
          break;
        default:
          break;
      }
    },
    improve(type) {
      let url;
      switch (type) {
        case 'report':
          url = `${this.currentInfo.website_url}/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=contact_support&utm_content=rating_report`;
          break;
        case 'suggest':
          const systemInfo = UAParser(window.navigator.userAgent);
          url = `https://expressv.typeform.com/to/Jla85o?browser_name=${systemInfo.browser.name}&browser_ver=${systemInfo.browser.version}&ext_ver=${chrome.runtime.getManifest().version}&os_name=${systemInfo.os.name}&os_ver=${systemInfo.os.version}&app_ver=${this.currentInfo.app.version}&locale=${this.currentInfo.locale}&is_beta=false`;
          break;
        default:
          break;
      }
      this.createTab({ url });
    },
    setReviewDates() {
      chrome.storage.sync.get('rating', (storage) => {
        if (typeof storage.rating === 'object' && Object.keys(storage.rating).length > 0) {
          let ratingData = storage.rating;
          ratingData.lastDiscardDate = (new Date()).getTime();
          ratingData.lastFailedRateDate = 0; // resetting it
          chrome.storage.sync.set({ 'rating': ratingData });
        }
      });
    },
  },
  created() {
    chrome.runtime.sendMessage({ telemetry: true, category: 'prompt_rating' });
  },
  beforeDestroy() {
    this.setReviewDates();
  },
  props: {
    discardPrompt: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.popup {
  background: var(--popup-bg);
  width: 310px;
  height: auto;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;

  .logo {
    margin-top: 25px;
  }

  &>div {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .icon-close {
    &-holder {
      margin-left: auto;
    }
  }

  &-header {
    margin-top: 25px;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 0px;
    line-height: 32px;
    text-align: center;
  }
  &-container {
    position: absolute;
    background: rgba(27, 29, 34, 0.4);
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
  }

  .rating {
    margin-top: 35px;
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    width: 267px;
    unicode-bidi: bidi-override;
    direction: rtl;

  }
  .rating > .star {
    background: url(/images/star_unfilled.png) center / contain no-repeat;
    width: 40px;
    height: 40px;
    content: '';
  }

  .rating > .star:hover,
  .rating > .star:hover ~ .star {
    background: url(/images/star_filled.png) center / contain no-repeat;
    width: 40px;
    height: 40px;
    content: '';
  }

  .button-container {
    margin: 30px 0;
    width: 282px;

    button:nth-of-type(n+2) {
      margin-top: 15px;
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>

<style lang="scss">
.icon-close {
  path {
    fill: var(--icon-close-default)
  }
}
.icon-star {
  path {
    fill: $eds-color-grey-30;
  }

  &:hover {
    path {
      fill: $eds-color-warning-30;
    }
  }
}
@media (prefers-color-scheme: light) {
  .popup-container {
    --popup-bg: #{$eds-color-white};
    --icon-close-default: #{$eds-color-grey-20};
  }
}
@media (prefers-color-scheme: dark) {
  .popup-container {
    --popup-bg: #{$eds-color-grey-10};
    --icon-close-default: #{$eds-color-grey-40};

    .logo path {
      fill: $eds-color-grey-40;
    }
  }
}

</style>
