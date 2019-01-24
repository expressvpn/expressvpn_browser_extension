<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div
    class="ratingMessageItem"
  >
    <label :id='getId'>{{ localize('message_item_rating' + ratingMessageType + '_title') }}</label>
    <div v-if='ratingMessageType===rating.ratingContainer.FACES_SCREEN'>
        <div class="faces-screen">
            <img id="sad" :src='chromePath("/images/sad@2x.png")' @click="onSad"/>
            <img id="happy" :src='chromePath("/images/happy@2x.png")' @click="onHappy" />
        </div>
    </div>
    <div v-if='ratingMessageType===rating.ratingContainer.NOT_HAPPY_SCREEN'>
        <div class="not-happy-screen">
            <button id="secondary" @click="onNotHappyCancel">{{ localize('message_item_rating_cancel_button_title') }}</button>
            <button id="primary" @click="onNotHappy">{{ localize('message_item_rating_primary_button_title') }}</button>
        </div>
    </div>
    <div v-if='ratingMessageType===rating.ratingContainer.HAPPY_SCREEN'>
        <div class="happy-screen">
            <button id="secondary" @click="onIsHappyCancel">{{ localize('message_item_rating_cancel_button_title') }}</button>
            <button id="primary" @click="onIsHappy">{{ localize('message_item_rating_primary_button_title') }}</button>
        </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ratingMessageItem',
  computed: {
    ...mapGetters([
      'ratingMessageType',
    ]),
    getId: function () {
      return this.ratingMessageType === this.rating.ratingContainer.HAPPY_SCREEN ? 'label1' : 'label';
    },
  },
  methods: {
    onNotHappy: function () {
      let url = this.currentInfo.website_url +
        '/support?utm_source=extension&utm_medium=browser_extension&utm_campaign=contact_support&utm_content=not_enjoying_expressvpn_contact_support';
      this.createTab({ url: url });
      this.$store.dispatch('setRatingMessageType', this.rating.ratingContainer.GENERAL_MESSAGE);
    },
    onIsHappy: function () {
      let currentBrowser = this.browserInfo.name;
      let url = '';
      if (currentBrowser === 'Chrome') {
        url = 'https://chrome.google.com/webstore/detail/expressvpn-for-chrome/fgddmllnllkalaagkghckoinaemmogpe/reviews';
      } else if (currentBrowser === 'Firefox') {
        url = 'https://addons.mozilla.org/en-US/firefox/addon/expressvpn/';
      }
      this.createTab({ url: url });
      this.$store.dispatch('setRatingMessageType', this.rating.ratingContainer.GENERAL_MESSAGE);
    },
    onNotHappyCancel: function () {
      this.$store.dispatch('setRatingMessageType', this.rating.ratingContainer.GENERAL_MESSAGE);
    },
    onIsHappyCancel: function () {
      this.$store.dispatch('setRatingMessageType', this.rating.ratingContainer.GENERAL_MESSAGE);
    },
    onSad: function () {
      this.$store.dispatch('setRatingMessageType', this.rating.ratingContainer.NOT_HAPPY_SCREEN);
    },
    onHappy: function () {
      this.$store.dispatch('setRatingMessageType', this.rating.ratingContainer.HAPPY_SCREEN);
    },
  },
  mounted() {
  },
};
</script>

<style lang="scss">
    .ratingMessageItem {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0px;
      background-color: rgba(247, 247, 247, 1);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.12);
      top: 0px;
      #label {
        margin-top: 15px;
        width: 100%;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        align-items: center;
        display: inline-block;
      }
      #label1 {
        margin-top: 20px;
        width: 100%;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        align-items: center;
        display: inline-block;
      }
    }
    .faces-screen {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      #sad {
        cursor: pointer;
        width: 40px;
        height: 40px;
      }
      #happy {
        cursor: pointer;
        width: 40px;
        height: 40px;
        margin-left: 20px;
      }
    }
    .not-happy-screen {
      margin-top: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .happy-screen {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
      #secondary {
        cursor: pointer;
        width: calc(40% - 5px);
        height: 25px;
        border-radius: 3px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
        font-size: 14px;
        font-style: normal;
        font-stretch: normal;
        line-height: 25px;
        letter-spacing: normal;
        background-color: #ffffff;
        border: 1px solid #c8252c !important;
        text-align: center;
        color: #c8252c;
        font-family: ProximaNova-Semibold;
      }
      #primary {
        cursor: pointer;
        width: calc(40% - 5px);
        height: 25px;
        border-radius: 3px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
        font-size: 14px;
        font-style: normal;
        font-stretch: normal;
        margin-left: 10px;
        line-height: 25px;
        letter-spacing: normal;
        background-color: #c8252c;
        border: 1px solid #c8252c !important;
        text-align: center;
        color: #ffffff;
        font-family: ProximaNova-Semibold;
      }
</style>
