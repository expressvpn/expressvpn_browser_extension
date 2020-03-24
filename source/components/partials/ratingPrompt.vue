
<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="popup-container">
    <div class="popup">
      <span class="icon icon-23-close" @click="closeIt"></span>
      <div v-if="ratingState === 'start'">
        <img class="logo" src="/images/logo.svg" />
        <span class="popup-header">{{ localize('rating_prompt_header') }}</span>
        <div class="rating">
          <span v-for="value in 5" :key="value" class="icon icon-47-favourite" @click="handleRating(6 - value)" />
        </div>
      </div>
      <div v-else-if="ratingState === '3star'">
        <div class="logo icon icon-113-tips"></div>
        <span class="popup-header">{{ localize('rating_improve_header') }}</span>
        <div class="star3-links">
          <a @click="improve('report')">{{ localize('rating_improve_report_button') }}</a>
          <a @click="improve('suggest')">{{ localize('rating_improve_suggest_button') }}</a>
        </div>
      </div>
      <div v-else-if="ratingState === '5star'">
        <div class="logo icon icon-110-thanks"></div>
        <span class="popup-header">{{ localize('rating_thanks_text') }}</span>
        <div class="star5-links">
          <a @click="discardPrompt">{{ localize('rating_no_thanks_text') }}</a>
          <button @click="openWebStore">{{ localize('rating_prompt_ok_button') }}</button>
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
    }
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
  background: var(--gray50);
  width: 320px;
  min-height: 267px;
  padding: 15px 15px 30px 15px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;

  &>div {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  

  .icon-23-close {
    margin-left: auto;

    &:hover {
      color: var(--gray20);
    }
  }

  &-header {
    margin-top: 25px;
    font-family: ProximaNova-Light;
    color: var(--black20);
    font-size: 24px;
    text-align: center;
  }
  &-container {
    position: absolute;
    background: rgba(27, 29, 34, 0.4);
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rating {
    margin-top: 25px;
    unicode-bidi: bidi-override;
    direction: rtl;

  }
  .rating > span {
    display: inline-block;
    position: relative;
    width: 1.1em;
    color: var(--yellow40);
    font-size: 35px;
  }

  .rating > span:hover:before,
  .rating > span:hover ~ span:before {
    font-family: "xv-fonticon";
    content: "\54";
    color: var(--yellow20);
  }

  .logo {
    width: 60px;
    height: 60px;
    margin-top: -10px;

    &.icon-113-tips {
      color: var(--green30);
      font-size: 55px;
    }

    &.icon-110-thanks {
      margin-top: -25px;
      color: var(--primary30);
      font-size: 55px;
      animation: pulse 1s ease infinite;
    }
  }
  .star3-links {
    margin-top: 31px;
    text-align: center;
  }
  .star5-links {
    margin-top: 33px;
    display: flex;
    align-items: center;

    button {
      margin-left: 25px;
      border-radius: 4px;
      border: 1px solid var(--gray30);
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.2);
      height: 30px;
      min-width: 50px;
      font-family: ProximaNova-Semibold;
      font-size: 16px;
      line-height: 28px;
      color: #C8252C;
    }
  }

  a {
      font-family: ProximaNova-Semibold;
      font-size: 16px;
      color: var(--primary20);
      display: block;

      &:hover {
        color: var(--primary30);
      }

      &:nth-of-type(n+2) {
        margin-top: 25px;
      }
    }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
