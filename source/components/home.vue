<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <main-header :canShowPromobar="true" />
    <div class="content">

      <visual-state />

      <power-button />

      <div class="engine-state">{{ localize(`main_screen_status_vpn_${currentInfo.state}_text`) }}</div>


      <div class="locations-container">
        <div :class="['current-location', 'location-box', `location-box-${currentInfo.state}`]" @click="openLocationPicker()">
          <img class="current-location-flag" :src="flagStyle" @error="this.setPlaceholder"/>
          <div class="current-location-text">
            <div class="location-box-text-type">{{ currentLocationTypeText }}</div>
            <div class="location-box-text-name">{{ selectedLocation.name }}</div>
          </div>
          <img v-if="['ready', 'connected'].includes(currentInfo.state)" v-svg-inline class="current-location-more-icon" src='/images/icons/more.svg' />
          <div v-else class="icon icon-73-more icon-disabled"></div>
        </div>
        <transition mode="out-in">
          <hint v-if="!utils.isNullOrEmpty(hintText)" :stringKey="hintText" :iconName="hintIcon" :type="hintType" />

          <div v-else-if="isIssueReporterPromptVisible" class="location-box report-issue">
            <div class="report-issue-left">
              <div class="report-issue-label">{{ localize('home_report_issue_label') }}</div>
              <div class="report-issue-text">{{ localize('home_report_issue_text') }}</div>
            </div>
            <div class="report-issue-right">
              <div class="report-issue-button" @click="feedback(false)">
                <img v-svg-inline class="rate-icon" src='/images/icons/rate.svg' width="40" height="40" viewbox="0 0 24 24" />
              </div>
              <div class="report-issue-button" @click="feedback(true)">
                <img v-svg-inline class="rate-icon" src='/images/icons/rate.svg' width="40" height="40" viewbox="0 0 24 24" />
              </div>
            </div>
          </div>

          <div v-else-if="['ready', 'connected'].includes(currentInfo.state)" class="location-buttons">
            <div class="location-box" v-for="location in visibleLocations" v-bind:key="location.id" @click="connectToLocation(location)">
                <div class="location-box-text-type">{{ localize(`main_screen_${location.type}_location_text`) }}</div>
                <div class="location-box-text-name">
                  <span>{{ location.name }}</span>
                </div>
                <img v-svg-inline class="recent-icon" :src="`/images/icons/${location.type === 'smart' ? 'smart-location' : 'recent'}.svg`" width="24" height="24" viewbox="0 0 24 24" />
            </div>
          </div>
        </transition>
      </div>

      <transition name="fade" mode="out-in" :duration="{ enter: 500, leave: 0 }">
        <ratingPrompt v-if="showRatingPrompt" :discardPrompt="onDiscardRatingPrompt" :style="{ transitionDelay: transitionDelay }" />
      </transition>

      <popup :options="popupOptions"></popup>

      <message-item />
    </div>
  </div>
</template>
<script>
import mixinLocation from '@/scripts/mixins/location';
import Hint from './partials/hint.vue';
import messageItem from './partials/messageItem.vue';
import popup from './partials/popup.vue';
import ratingPrompt from './partials/ratingPrompt.vue';
import mainHeader from './partials/mainHeader.vue';
import visualState from './partials/visualState.vue';
import powerButton from './partials/powerButton.vue';

export default {
  name: 'home',
  mixins: [mixinLocation],
  components: {
    Hint,
    messageItem,
    popup,
    mainHeader,
    ratingPrompt,
    visualState,
    powerButton,
  },
  data() {
    return {
      transitionDelay: '2s',
      discardPrompt: false,
      discardHint: false,
      popupOptions: {},
      hintIcon: null,
      hintType: '',
      show4starHint: false,
      forceRatingPrompt: false,
      forceIssueReporterPrompt: false,
      NOW: Date.now(),
      hideFeedbackPrompt: false,
      timesShownToday: 0,
    };
  },
  watch: {
    showIssueReporterPrompt: function(newVal, oldVal) {
      if (newVal === true && oldVal === false) {
        const today = (new Date()).getDate();
        let timesShown = JSON.parse(localStorage.getItem('timesShown') || '{}');
        this.timesShownToday = (parseInt(timesShown[today], 10) || 0) + 1;
        timesShown[today] = this.timesShownToday;
        localStorage.setItem('timesShown', JSON.stringify(timesShown));
      }
    },
    showRatingPrompt: function(newVal, oldVal) {
      if (newVal === true && oldVal === false) {
        chrome.storage.sync.get('rating', (storage) => {
          if (typeof storage.rating === 'object' && Object.keys(storage.rating).length > 0) {
            let ratingData = storage.rating;
            ratingData.lastFailedRateDate = (new Date()).getTime();
            chrome.storage.sync.set({ 'rating': ratingData });
            this.forceRatingPrompt = true;
          }
        });
      }
    },
  },
  computed: {
    isIssueReporterPromptVisible() {
      const shouldBeVisible = (this.showIssueReporterPrompt && this.timesShownToday <= 2);
      if (shouldBeVisible === true) {
        chrome.runtime.sendMessage({ telemetry: true, category: 'issue_reporter_prompt_shown' });
      }
      return shouldBeVisible;
    },
    showIssueReporterPrompt() {
      let diffTime = this.NOW - this.currentInfo.hasCurrentStateSince;
      return (
        this.currentInfo.state === 'ready'
        && this.currentInfo.ratingData.previousConnectionTime > 0
        && this.currentInfo.ratingData.previousConnectionTime < 10 * 60
        && diffTime > 0 && diffTime < 10 * 1000
        && this.hideFeedbackPrompt === false
      ) || (this.forceIssueReporterPrompt === true);
    },
    showRatingPrompt() {
      const requiredConnectionTime = (__IS_ALPHA__ || process.env.NODE_ENV === 'development') ? 0 : 15 * 60;
      const rating = this.currentInfo.ratingData;

      if (!rating) {
        return false;
      }

      const lastDiscardDate = parseInt(localStorage.getItem('lastDiscardDate'), 10) || rating.lastDiscardDate;
      const lastFailedRateDate = parseInt(localStorage.getItem('lastFailedRateDate'), 10) || rating.lastFailedRateDate;

      return (
        ['Chrome', 'Firefox'].includes(this.browserInfo.name)
        && rating.isSubscriber === true
        && rating.isSuccessfulConnection === true
        && rating.previousConnectionTime >= requiredConnectionTime
        && rating.everClickedMaxRating === false
        && this.discardPrompt === false
        && this.daysBetween(this.NOW, lastDiscardDate) > 30
        && this.daysBetween(this.NOW, lastFailedRateDate) > 10
        && this.currentInfo.os !== 'LINUX'
        && this.currentInfo.state === 'connected'
      ) || (this.forceRatingPrompt === true);
    },
    selectedLocation() {
      return this.currentInfo.selectedLocation || {};
    },
    currentLocationTypeText() {
      let stringKey = `main_screen_${this.selectedLocation.is_smart_location ? 'smart' : 'selected'}_location_text`;
      if (this.currentInfo.state === 'connected') {
        stringKey = 'main_screen_current_location_text';
      }
      return this.localize(stringKey);
    },
    flagStyle() {
      let filename = (this.selectedLocation.country_code ? this.selectedLocation.country_code.toUpperCase() : 'XV') + '.svg';
      return chrome.extension.getURL('/images/flags/' + filename);
    },
    visibleLocations() {
      let locationList = [];
      if (this.currentInfo.smartLocation.id !== this.selectedLocation.id) {
        locationList.push(Object.assign({}, this.currentInfo.smartLocation, { type: 'smart' }));
      }

      for (let location of this.locationPicker.getRecentLocations(this.currentInfo.allLocationsList, this.currentInfo.recent_locations_ids)) {
        if (location && location.id !== this.selectedLocation.id && location.id !== this.currentInfo.smartLocation.id) {
          locationList.push(Object.assign({}, location, { type: 'recent' }));
        }
      }
      return locationList.slice(0, 2);
    },
    hintText() {
      let text = '';
      let connectingTimes = this.currentInfo.connectingTimes;
      let nConnections = this.currentInfo.connectingTimes.length;
      this.hintType = 'information';
      this.hintIcon = 'error';

      // Check for delayed connection
      if (
        nConnections === 5 // Make sure there 4 connections in the history + the current connection
        && this.currentInfo.state === 'connecting' // It's still connecting
        && this.utils.getTimeDelta(connectingTimes[nConnections - 1].startTime) > 10 // it’s been more than 10 seconds
        && this.utils.getTimeDelta(connectingTimes[nConnections - 1].startTime) > this.getAverageTopConnectionTime(2) * 1.25
        && this.discardHint === false// If the user already discarded the hint
      ) {
        text = 'hint_connection_delay_text';
        this.hintIcon = 'timer';
      } else if (['ready', 'reconnecting', 'connecting'].includes(this.currentInfo.state) && this.currentInfo.networkStatus !== 'has internet') { // GIVEN the user is NOT connected to the VPN and their internet connection is not clear
        switch (this.currentInfo.networkStatus) {
          case 'no internet':
            text = `hint_network_state_no_internet_${this.currentInfo.state}_text`;
            break;
          case 'captive portal':
            text = 'hint_network_state_captive_portal_text';
            break;
          case 'not sure':
            text = `hint_network_state_not_sure_${this.currentInfo.state}_text`;
            break;
          case 'not ready':
            text = 'hint_network_state_not_ready_text';
            break;
          default:
            break;
        }
      } else if (this.currentInfo.state === 'reconnecting') {
        let networkLockStatus = this.currentInfo.preferences.traffic_guard_level ? 'on' : 'off';
        text = `hint_reconnecting_network_lock_${networkLockStatus}_text`;
      } else if (this.show4starHint === true) {
        text = 'rating_thanks4_text';
        this.hintType = 'green';
        this.hintIcon = 'favourite';
      }
      return text;
    },
  },
  methods: {
    feedback(hasFeedback) {
      if (hasFeedback === false) {
        this.hideFeedbackPrompt = true;
      } else {
        this.$store.dispatch('setCurrentContainer', 'issueReporter');
      }
      chrome.runtime.sendMessage({ telemetry: true, category: `issue_reporter_prompt_thumb_${hasFeedback ? 'down' : 'up'}` });
    },
    onDiscardRatingPrompt() {
      this.discardPrompt = true; // trigger computed
      this.forceRatingPrompt = false;
    },
    daysBetween(ts1, ts2) { // ToDo: Replace with moment.js
      return Math.round(Math.abs((+ts1) - (+ts2)) / 8.64e7);
    },
    getAverageTopConnectionTime: function (nLastConnections) {
      let sortedConnectingTimes = this.currentInfo.connectingTimes.sort((a, b) => b.delta - a.delta);
      let topNConnections = sortedConnectingTimes.slice(0, nLastConnections);

      return topNConnections.reduce((total, el) => total.delta + el.delta) / nLastConnections;
    },
    onSelectedLocationClick: function (ev) {
      if (!ev.target.classList.contains('current-location-more-icon')) {
        chrome.runtime.sendMessage({ connectToSelectedLocation: true });
      }
    },
    connectToLocation: function (location) {
      if (this.currentInfo.state === 'ready' || localStorage.getItem('hasCWCbefore')) {
        this.updateLocationAndConnect(location);
      } else {
        this.popupOptions = {
          id: 'home_change_location_popup',
          buttons: [
            {
              callback: () => { this.popupOptions = {}; },
            },
            {
              highlightIt: true,
              callback: () => {
                localStorage.setItem('hasCWCbefore', true);
                this.updateLocationAndConnect(location);
                this.popupOptions = {};
              },
            },
          ],
          isVisible: true,
          style: 'vertical',
        };
      }
    },
    setPlaceholder() {
      let iconEl = document.querySelector('.current-location-flag');
      if (iconEl) {
        iconEl.src = chrome.extension.getURL('/images/flags/XV.svg');
      }
    },
  },
  created() {
    let self = this;
    // ToDo: Improve this
    this.$parent.$parent.$on('discard-hint', function () {
      self.discardHint = true;
    });

    this.$root.$on('show-rating-prompt', () => {
      self.transitionDelay = '0s';
      self.forceRatingPrompt = true;
    });

    this.$on('show-4star-hint', () => {
      self.show4starHint = true;
      self.onDiscardRatingPrompt();
      setTimeout(() => {
        self.show4starHint = false;
      }, 4000);
    });

    window.setInterval(function () {
      self.NOW = Date.now();
    }, 1000);

    // Delete old issue reporter localStorage
    let timesShown = JSON.parse(localStorage.getItem('timesShown') || '{}');
    Object.keys(timesShown).forEach(day => parseInt(day, 10) === (new Date()).getDate() || delete timesShown[day]);
    localStorage.setItem('timesShown', JSON.stringify(timesShown));

    if (process.env.NODE_ENV === 'development') {
      if (this.currentInfo.forceRatingPrompt) {
        this.$root.$emit('show-rating-prompt');
      } else if (this.currentInfo.forceIssueReporterPrompt) {
        localStorage.removeItem('timesShown');
        this.forceIssueReporterPrompt = true;
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.no-highlight:hover, .no-highlight:active {
  color: inherit !important;
}

.report-issue {
  margin-top: 10px;
  height: 72px;
  padding: 6px 16px 12px 14px;
  display: flex;
  justify-content: space-between;

  &-left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 192px;
    padding-top: 2px;
  }
  &-right {
    display: flex;
    justify-content: space-between;
    align-items: center;

    div:first-of-type {
      margin-right: 8px;
    }
  }

  &-label {
    font-size: 12px;
  }
  &-text {
    //font-family: Inter-Medium;
    font-size: 12px;
    width: 105px;
    font-weight: 500;
    letter-spacing: 0px;
  }

  &-button:last-of-type {
    transform: scaleX(-1) scaleY(-1);
  }
}

.content {

  .engine-state {
    margin-top: 10px;
    text-align: center;
    font-size: 18px;
    letter-spacing: 0px;
    font-family: Inter;
  }

  .locations-container {
    margin-top: 30px;
    padding: 0 15px;

    .location-box {
      position: relative;
      background: var(--location-box-bg);
      border-radius: 10px;
      box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.1);

      &-text-type {
        font-size: 12px;
      }

      &-text-name {
        font-size: 12px;
        font-weight: 500;
        width: 96px;

        span {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          width: 100px;
        }
      }
      .recent-icon {
        position: absolute;
        right: 14px;
        bottom: 13px;
      }

      &:hover:not(.report-issue):not(.location-box-connecting) {
        background: var(--location-box-bg-hover);
        box-shadow: 0 3px 8px 1px rgba(0, 0, 0, 0.1);
      }
      &:active {
        background: var(--location-box-bg);
      }
    }

    .current-location {
      height: 50px;
      padding: 6px 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 25px;

      img {
        width: 24px;
        height: 24px;
      }

      .icon {
        font-size: 20px;

        &-disabled, &-disabled:hover {
          color: var(--gray30);
        }
      }

      &-text {
        display: flex;
        flex-direction: column;
        height: 35px;
        margin-right: auto;
        margin-left: 10px;
        justify-content: space-evenly;

        .location-box-text-name {
          width: auto;
          font-size: 14px;
        }
      }
    }

    .location-buttons {
      margin-top: 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .location-box {
        width: 155px;
        height: 72px;
        padding: 8px 17px 12px 14px;
        display: flex;
        justify-content: space-between;
        flex-direction: column;

        &:last-of-type {
          margin-left: 10px; // Prevents the location box from moving during the transition
        }

        &-text-name { // do check for -webkit-line-clamp in the future
          max-height: 40px;
          margin: 0;
          height: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.current-location {
  .current-location-more-icon path {
    fill: var(--more-icon-color);
  }
}

.recent-icon path {
  fill: $eds-color-grey-30;
}

.report-issue {
  &-button {
    .rate-icon path {
      fill: $eds-color-success-30;
    }
    &:hover {
      .rate-icon path {
        fill: $eds-color-success-40;
      }
    }

    &:last-of-type {
      .rate-icon path {
        fill: $eds-color-error-30;
      }
      &:hover {
        .rate-icon path {
          fill: $eds-color-error-40;
        }
      }
    }
  }
}
@media (prefers-color-scheme: light) {
  .content {
    --location-box-bg: #{$eds-color-white};
    --location-box-bg-hover: #{$eds-color-grey-50};
    --more-icon-color: #{$eds-color-grey-10};
  }
}
@media (prefers-color-scheme: dark) {
  .content {
    --location-box-bg: #{$eds-color-grey-10};
    --location-box-bg-hover: #{$eds-color-grey-20};
    --more-icon-color: #{$eds-color-grey-40};
  }
}

</style>
