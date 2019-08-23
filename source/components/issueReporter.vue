<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <secondary-header stringkey="issue_reporter_title" :onBackClick="sideBackBtnClick" :showSearchOption="false" />
    <div class="reporter-container">
      <hint stringKey="issue_reporter_hint_not_sent_text" iconName="icon-41-error" type="error" v-if="reportStatus === 'ERROR'" style="margin: 0 0 15px 0;" />
      <span class="reporter-header">{{ localize(reportStatus === 'SENT' ? 'issue_reporter_report_sent_header' : 'issue_reporter_header') }}</span>
      <div class="issue-list" v-if="!issueType">
        <div class="issue" v-for="i in 8" :key="i">
          <input type="radio" v-model="issueType" :value="i" :id="`issue_reporter_opt${i}`" />
          <label :for="`issue_reporter_opt${i}`">{{ localize('issue_reporter_opt' + i) }}</label>
        </div>
      </div>
      <div v-else>
        <div v-if="reportStatus === 'SENT'">
          <p>{{ localize('issue_reporter_thank_you_message') }}</p>
          <div v-if="supportHint" style="margin-top:15px;">
            <div class="separator"></div>
            <span class="reporter-header">{{ localize('issue_reporter_need_help_header') }}</span>
            <hint :stringKey="supportHint" iconName="icon-113-tips" />
          </div>
          <div class="button-container">
            <button class="button-primary" @click="sideBackBtnClick">{{ localize('issue_reporter_home_button_label') }}</button>
            <button class="button-secondary" @click="createTab({ url: `${currentInfo.website_url}/support/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=issue-reporter`})">{{ localize('issue_reporter_support_button_label') }}</button>
          </div>
        </div>
        <div v-else>
          <div class="issue-holder">
            <span :class="['icon', 'icon-medium', 'icon-12-back', { 'disabled': reportStatus === 'SENDING'}]" @click="returnToIssueType()"></span>
            <span>{{ localize('issue_reporter_opt' + issueType) }}</span>
          </div>
          <div :class="['issue-description', { 'disabled': reportStatus === 'SENDING'}]">
            <label>{{ localize('issue_reporter_describe_textarea_label') }}</label>
            <textarea maxlength="500" autofocus="true" v-model="issueUserDescription" :disabled="reportStatus === 'SENDING'"></textarea>
          </div>
          <div class="separator"></div>
          <div class="issue-website-share">
            <input type="checkbox" id="issue_reporter_share_website_label" v-model="shareWebsite" :disabled="reportStatus === 'SENDING'" />
            <label for="issue_reporter_share_website_label">{{ localize('issue_reporter_share_website_label') }}</label>
          </div>
          <div class="issue-website-input" v-if="shareWebsite">
            <label>{{ localize('issue_reporter_website_label') }}</label>
            <input type="text" v-model="website" :disabled="reportStatus === 'SENDING'" />
          </div>
        </div>
      </div>
      <div class="button-container">
        <button v-if="reportStatus !== 'SENT'" :disabled="!issueType || reportStatus === 'SENDING'" class="button-primary" @click="sendReport()">{{ localize(`issue_reporter_send${reportStatus === 'SENDING' ? 'ing': ''}_button_label`) }}</button>
      </div>
    </div>
  </div>
</template>
<script>
import secondaryHeader from './partials/secondaryHeader.vue';
import hint from './partials/hint.vue';

export default {
  name: 'issueReporter',
  components: {
    secondaryHeader,
    hint,
  },
  data() {
    return {
      hasError: false,
      reportStatus: 'STANDBY',
      issueType: 0,
      shareWebsite: true,
      website: '',
      issueUserDescription: '',
    };
  },
  computed: {
    supportHint() {
      let localeKey = '';

      switch (this.issueType) {
        case 1:
        case 8:
          break;
        case 3:
        case 6:
          localeKey = 'issue_reporter_hint_opt' + this.issueType;
          break;
        default:
          localeKey = 'issue_reporter_hint_default_text';
          break;
      }
      return localeKey;
    }
  },
  methods: {
    sideBackBtnClick: function (event) {
      this.$store.dispatch('setIgnoreStateUpdates', false);
      this.$store.dispatch('setCurrentView', 'mainScreen');
    },
    sendReport() { // ToDo: Rewrite with AbortController
      const self = this;
      const ci = this.currentInfo;

      this.reportStatus = 'SENDING';
      let body = {
        category: this.issueType,
        cluster_id: parseInt(ci.previousConnection.id, 10) || 0,
        protocol: ci.previousConnection.protocol,
        client_version: ci.app.version,
        os_name: ci.system.os.name,
        os_version: ci.system.os.version,
        browser_name: ci.system.browser.name,
        browser_version: ci.system.browser.version,
        extension_version: chrome.runtime.getManifest().version,
        comment: this.issueUserDescription,
      };

      if (this.shareWebsite === true) {
        body.domain = this.website;
      }

      const timeout = function (ms, promise) {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("promise timeout"))
          }, ms);
          promise.then(
            (res) => {
              clearTimeout(timeoutId);
              resolve(res);
            },
            (err) => {
              clearTimeout(timeoutId);
              reject(err);
            }
          );
        })
      };

      const fetchIt = fetch('https://report.expressapisv2.net/issue_report', { 
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      timeout(15000, fetchIt).then(response => {
        self.reportStatus = response.status === 204 ? 'SENT' : 'ERROR';
      }).catch(function(error) {
        console.error(error);
        self.reportStatus = 'ERROR';
      });
    },
    returnToIssueType() {
      if (this.reportStatus === 'STANDBY') {
        this.issueType = 0
      }
    }
  },
  mounted() {
    const self = this;
    this.$store.dispatch('setIgnoreStateUpdates', true); // Prevent state updates from overwriting this screen
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      let activeTabUrl = tabs[0].url;
      try {
        self.website = (new URL(activeTabUrl)).host.replace('www.', '');
      } catch (ex) {
        console.error(ex);
        self.website = '';
      }
    })
  },
};
</script>

<style lang="scss" scoped>
.separator {
  border-bottom: 1px solid #DEDEDE;
  margin: 15px 0px;
}
p {
  font-size: 18px;
  line-height: 23px;
}

input[type="radio"], input[type="checkbox"] {
  display:none; 
}
    
input[type="radio"] ~ label:before, input[type="checkbox"] ~ label:before {
  font-family: "xv-fonticon";
  letter-spacing: 12px;
  color: #000;
  font-size: 20px;
  position: relative;
  top: -5px;
}
input[type="radio"] ~ label:before {
  content: "\5b";
}
input[type="checkbox"] ~ label:before {
  content: "\70";
}
input[type="checkbox"]:disabled ~ label:before {
  color: $gray-20 !important;
}

input[type="checkbox"]:checked ~ label:before {
  content: "\6e";
  font-size: 20px;
  color: $primary-20;
  letter-spacing: 12px;
}

input[type="radio"]:checked ~ label:before {
  content: "\40";
  font-size: 20px;
  color: $primary-20;
  letter-spacing: 5px;
}




.reporter {
  &-container {
    background: $gray-50;
    padding: 25px 15px;
    height: 100vh;
    border-top: 1px solid $gray-30;

    button:disabled {
      background: $gray-30;
      color: $gray-10;
      box-shadow: none;
      border: 0;
    }

    .issue {
      margin-bottom: 11px;
      display: flex;

      &-website {
        &-input {
          margin-top: 10px;
          position: relative;

          label {
            color: $gray-20;
            font-size: 12px;
            position: absolute;
            top: 8px;
            left: 15px;
          }
          input[type='text'] {
            height: 50px;
            width: 100%;
            padding: 22px 15px 5px 15px;
            font-size: 18px;
            background: $gray-50;
            color: $black-20;
            border: 1px solid $black-20;
            border-radius: 4px;

            &:disabled {
              background: $gray-40;
              border-color: #dddddd;
            }
          }
        }

        &-share {
          font-size: 18px;
          display: flex;
          line-height: 20px;

          label {
            display: flex;
          }
        }
      }

      &-description {
        position: relative;
        border: 1px solid $black-20;
        height: 100px;
        width: 100%;
        margin-top: 10px;
        border-radius: 4px;
        padding: 6px 15px 5px 15px;

        &.disabled {
          background: $gray-40;
          border-color: #dddddd;
        }


        textarea {
          resize: none;
          font-size: 18px;
          width: 100%;
          border: none;
          background: $gray-50;
          color: $black-20;
          margin-top: 2px;
          height: calc(100% - 20px);
          padding: 0;

          &:disabled {
            background: $gray-40;
          }
        }
        label {
          color: $gray-20;
          font-size: 12px;
        }
      }

      label {
        font-family: ProximaNova;
        font-size: 20px;
        line-height: 25px;
        display: flex;
      }

      &-holder {
        font-family: ProximaNova;
        font-size: 20px;
        margin-top: 16px;
        display: flex;

        span {
          line-height: 25px;
        }

        .icon {
          margin-top: -6px;
          color: $primary-20;
          margin-right: 10px;

          &:hover {
            color: $primary-30;
          }
          &:active {
            color: $primary-10;
          }
          &.disabled {
            color: $gray-20;
          }
        }
      }

      &-list {
        margin-top: 16px;
      }
    }
  }

  &-header {
    font-family: ProximaNova-Light;
    font-size: 24px;
  }
}
</style>
