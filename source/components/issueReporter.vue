<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <secondary-header stringkey="issue_reporter_title" :onBackClick="sideBackBtnClick" />
    <div class="reporter-container">
      <hint stringKey="issue_reporter_hint_not_sent_text" iconName="error" type="error" v-if="reportStatus === 'ERROR'" style="margin: 0 0 15px 0;" />
      <span class="reporter-header">{{ localize(reportStatus === 'SENT' ? 'issue_reporter_report_sent_header' : 'issue_reporter_header') }}</span>
      <div class="issue-list" v-if="!issueType">
        <div class="issue" v-for="i in 8" :key="i" @click="setIssueType(i)">
          <img v-svg-inline class="icon" :src="`/images/icons/${issueIcons[i]}.svg`" viewbox="0 0 24 24" width="24" height="24" />
          <span class="issue-category">{{ localize('issue_reporter_opt' + i) }}</span>
          <img v-svg-inline class="icon chevron" :src="`/images/icons/chevron-right.svg`" viewbox="0 0 24 24" width="24" height="24" />
        </div>
      </div>
      <div v-else>
        <div class="final-container" v-if="reportStatus === 'SENT'">
          <p>{{ localize('issue_reporter_thank_you_message') }}</p>
          <div v-if="supportHint" style="margin-top:15px;">
            <div class="separator"></div>
            <span class="reporter-header">{{ localize('issue_reporter_need_help_header') }}</span>
            <hint :stringKey="supportHint" iconName="tips" />
          </div>
          <div :class="['button-container', { 'button-container-bottom': ['SENT', 'ERROR'].includes(reportStatus) }]">
            <button class="primary" @click="sideBackBtnClick">{{ localize('issue_reporter_home_button_label') }}</button>
            <button class="secondary" @click="createTab({ url: `${currentInfo.website_url}/support/?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=issue-reporter`})">{{ localize('issue_reporter_support_button_label') }}</button>
          </div>
        </div>
        <div v-else>
          <div class="issue-holder">
            <div :class="['icon-back-container', { 'disabled': reportStatus === 'SENDING'}]" @click="returnToIssueType()">
              <img v-svg-inline class="icon back" :src="`/images/icons/chevron-left.svg`" viewbox="0 0 24 24" width="24" height="24" />
            </div>
            <span>{{ localize('issue_reporter_opt' + issueType) }}</span>
          </div>
          <div :class="['issue-description', { 'disabled': reportStatus === 'SENDING'}]">
            <label>{{ localize('issue_reporter_describe_textarea_label') }}</label>
            <textarea maxlength="500" autofocus="true" v-model="issueUserDescription" :disabled="reportStatus === 'SENDING'"></textarea>
          </div>
          <div class="issue-website-input">
            <label>{{ localize('issue_reporter_website_label') }}</label>
            <input type="text" v-model="website" :disabled="reportStatus === 'SENDING'" />
          </div>
          <div :class="['issue-location-holder', , { 'disabled': reportStatus === 'SENDING'}]">
            <select v-model="userLocation" class="issue-location" required :disabled="reportStatus === 'SENDING'">
              <option value="" disabled selected>{{ localize('issue_reporter_location_placeholder') }}</option>
              <option value="AF">Afghanistan</option>
              <option value="AX">Åland Islands</option>
              <option value="AL">Albania</option>
              <option value="DZ">Algeria</option>
              <option value="AS">American Samoa</option>
              <option value="AD">Andorra</option>
              <option value="AO">Angola</option>
              <option value="AI">Anguilla</option>
              <option value="AQ">Antarctica</option>
              <option value="AG">Antigua and Barbuda</option>
              <option value="AR">Argentina</option>
              <option value="AM">Armenia</option>
              <option value="AW">Aruba</option>
              <option value="AU">Australia</option>
              <option value="AT">Austria</option>
              <option value="AZ">Azerbaijan</option>
              <option value="BS">Bahamas</option>
              <option value="BH">Bahrain</option>
              <option value="BD">Bangladesh</option>
              <option value="BB">Barbados</option>
              <option value="BY">Belarus</option>
              <option value="BE">Belgium</option>
              <option value="BZ">Belize</option>
              <option value="BJ">Benin</option>
              <option value="BM">Bermuda</option>
              <option value="BT">Bhutan</option>
              <option value="BO">Bolivia</option>
              <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
              <option value="BA">Bosnia and Herzegovina</option>
              <option value="BW">Botswana</option>
              <option value="BV">Bouvet Island</option>
              <option value="BR">Brazil</option>
              <option value="IO">British Indian Ocean Territory</option>
              <option value="BN">Brunei Darussalam</option>
              <option value="BG">Bulgaria</option>
              <option value="BF">Burkina Faso</option>
              <option value="BI">Burundi</option>
              <option value="CV">Cabo Verde</option>
              <option value="KH">Cambodia</option>
              <option value="CM">Cameroon</option>
              <option value="CA">Canada</option>
              <option value="KY">Cayman Islands</option>
              <option value="CF">Central African Republic</option>
              <option value="TD">Chad</option>
              <option value="CL">Chile</option>
              <option value="CN">China</option>
              <option value="CX">Christmas Island</option>
              <option value="CC">Cocos (Keeling) Islands</option>
              <option value="CO">Colombia</option>
              <option value="KM">Comoros</option>
              <option value="CG">Congo</option>
              <option value="CD">Congo, Democratic Republic of</option>
              <option value="CK">Cook Islands</option>
              <option value="CR">Costa Rica</option>
              <option value="HR">Croatia</option>
              <option value="CU">Cuba</option>
              <option value="CW">Curaçao</option>
              <option value="CY">Cyprus</option>
              <option value="CZ">Czechia</option>
              <option value="CI">Côte d'Ivoire</option>
              <option value="DK">Denmark</option>
              <option value="DJ">Djibouti</option>
              <option value="DM">Dominica</option>
              <option value="DO">Dominican Republic</option>
              <option value="EC">Ecuador</option>
              <option value="EG">Egypt</option>
              <option value="SV">El Salvador</option>
              <option value="GQ">Equatorial Guinea</option>
              <option value="ER">Eritrea</option>
              <option value="EE">Estonia</option>
              <option value="SZ">Eswatini</option>
              <option value="ET">Ethiopia</option>
              <option value="FK">Falkland Islands (Malvinas)</option>
              <option value="FO">Faroe Islands</option>
              <option value="FJ">Fiji</option>
              <option value="FI">Finland</option>
              <option value="FR">France</option>
              <option value="GF">French Guiana</option>
              <option value="PF">French Polynesia</option>
              <option value="TF">French Southern Territories</option>
              <option value="GA">Gabon</option>
              <option value="GM">Gambia</option>
              <option value="GE">Georgia</option>
              <option value="DE">Germany</option>
              <option value="GH">Ghana</option>
              <option value="GI">Gibraltar</option>
              <option value="GR">Greece</option>
              <option value="GL">Greenland</option>
              <option value="GD">Grenada</option>
              <option value="GP">Guadeloupe</option>
              <option value="GU">Guam</option>
              <option value="GT">Guatemala</option>
              <option value="GG">Guernsey</option>
              <option value="GN">Guinea</option>
              <option value="GW">Guinea-Bissau</option>
              <option value="GY">Guyana</option>
              <option value="HT">Haiti</option>
              <option value="HM">Heard Island and McDonald Islands</option>
              <option value="HN">Honduras</option>
              <option value="HK">Hong Kong</option>
              <option value="HU">Hungary</option>
              <option value="IS">Iceland</option>
              <option value="IN">India</option>
              <option value="ID">Indonesia</option>
              <option value="IR">Iran</option>
              <option value="IQ">Iraq</option>
              <option value="IE">Ireland</option>
              <option value="IM">Isle of Man</option>
              <option value="IL">Israel</option>
              <option value="IT">Italy</option>
              <option value="JM">Jamaica</option>
              <option value="JP">Japan</option>
              <option value="JE">Jersey</option>
              <option value="JO">Jordan</option>
              <option value="KZ">Kazakhstan</option>
              <option value="KE">Kenya</option>
              <option value="KI">Kiribati</option>
              <option value="KW">Kuwait</option>
              <option value="KG">Kyrgyzstan</option>
              <option value="LA">Laos</option>
              <option value="LV">Latvia</option>
              <option value="LB">Lebanon</option>
              <option value="LS">Lesotho</option>
              <option value="LR">Liberia</option>
              <option value="LY">Libya</option>
              <option value="LI">Liechtenstein</option>
              <option value="LT">Lithuania</option>
              <option value="LU">Luxembourg</option>
              <option value="MO">Macao</option>
              <option value="MG">Madagascar</option>
              <option value="MW">Malawi</option>
              <option value="MY">Malaysia</option>
              <option value="MV">Maldives</option>
              <option value="ML">Mali</option>
              <option value="MT">Malta</option>
              <option value="MH">Marshall Islands</option>
              <option value="MQ">Martinique</option>
              <option value="MR">Mauritania</option>
              <option value="MU">Mauritius</option>
              <option value="YT">Mayotte</option>
              <option value="MX">Mexico</option>
              <option value="FM">Micronesia</option>
              <option value="MD">Moldova</option>
              <option value="MC">Monaco</option>
              <option value="MN">Mongolia</option>
              <option value="ME">Montenegro</option>
              <option value="MS">Montserrat</option>
              <option value="MA">Morocco</option>
              <option value="MZ">Mozambique</option>
              <option value="MM">Myanmar</option>
              <option value="NA">Namibia</option>
              <option value="NR">Nauru</option>
              <option value="NP">Nepal</option>
              <option value="NL">Netherlands</option>
              <option value="NC">New Caledonia</option>
              <option value="NZ">New Zealand</option>
              <option value="NI">Nicaragua</option>
              <option value="NE">Niger</option>
              <option value="NG">Nigeria</option>
              <option value="NU">Niue</option>
              <option value="NF">Norfolk Island</option>
              <option value="MK">North Macedonia</option>
              <option value="MP">Northern Mariana Islands</option>
              <option value="KP">North Korea</option>
              <option value="NO">Norway</option>
              <option value="OM">Oman</option>
              <option value="PK">Pakistan</option>
              <option value="PW">Palau</option>
              <option value="PS">Palestine, State of</option>
              <option value="PA">Panama</option>
              <option value="PG">Papua New Guinea</option>
              <option value="PY">Paraguay</option>
              <option value="PE">Peru</option>
              <option value="PH">Philippines</option>
              <option value="PN">Pitcairn</option>
              <option value="PL">Poland</option>
              <option value="PT">Portugal</option>
              <option value="PR">Puerto Rico</option>
              <option value="QA">Qatar</option>
              <option value="RE">Réunion</option>
              <option value="RO">Romania</option>
              <option value="RU">Russia</option>
              <option value="RW">Rwanda</option>
              <option value="BL">Saint Barthélemy</option>
              <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
              <option value="KN">Saint Kitts and Nevis</option>
              <option value="LC">Saint Lucia</option>
              <option value="MF">Saint Martin (French part)</option>
              <option value="PM">Saint Pierre and Miquelon</option>
              <option value="VC">Saint Vincent and the Grenadines</option>
              <option value="WS">Samoa</option>
              <option value="SM">San Marino</option>
              <option value="ST">Sao Tome and Principe</option>
              <option value="SA">Saudi Arabia</option>
              <option value="SN">Senegal</option>
              <option value="RS">Serbia</option>
              <option value="SC">Seychelles</option>
              <option value="SL">Sierra Leone</option>
              <option value="SG">Singapore</option>
              <option value="SX">Sint Maarten (Dutch part)</option>
              <option value="SK">Slovakia</option>
              <option value="SI">Slovenia</option>
              <option value="SB">Solomon Islands</option>
              <option value="SO">Somalia</option>
              <option value="ZA">South Africa</option>
              <option value="GS">South Georgia and the South Sandwich Islands</option>
              <option value="KR">South Korea</option>
              <option value="SS">South Sudan</option>
              <option value="ES">Spain</option>
              <option value="LK">Sri Lanka</option>
              <option value="SD">Sudan</option>
              <option value="SR">Suriname</option>
              <option value="SJ">Svalbard and Jan Mayen</option>
              <option value="SE">Sweden</option>
              <option value="CH">Switzerland</option>
              <option value="SY">Syria</option>
              <option value="TW">Taiwan</option>
              <option value="TJ">Tajikistan</option>
              <option value="TZ">Tanzania</option>
              <option value="TH">Thailand</option>
              <option value="TL">Timor-Leste</option>
              <option value="TG">Togo</option>
              <option value="TK">Tokelau</option>
              <option value="TO">Tonga</option>
              <option value="TT">Trinidad and Tobago</option>
              <option value="TN">Tunisia</option>
              <option value="TR">Turkey</option>
              <option value="TM">Turkmenistan</option>
              <option value="TC">Turks and Caicos Islands</option>
              <option value="TV">Tuvalu</option>
              <option value="UG">Uganda</option>
              <option value="UA">Ukraine</option>
              <option value="AE">United Arab Emirates</option>
              <option value="GB">United Kingdom</option>
              <option value="UM">United States Minor Outlying Islands</option>
              <option value="US">United States</option>
              <option value="UY">Uruguay</option>
              <option value="UZ">Uzbekistan</option>
              <option value="VU">Vanuatu</option>
              <option value="VA">Vatican City</option>
              <option value="VE">Venezuela</option>
              <option value="VN">Vietnam</option>
              <option value="VG">Virgin Islands (British)</option>
              <option value="VI">Virgin Islands (U.S.)</option>
              <option value="WF">Wallis and Futuna</option>
              <option value="EH">Western Sahara</option>
              <option value="YE">Yemen</option>
              <option value="ZM">Zambia</option>
              <option value="ZW">Zimbabwe</option>
            </select>
          </div>
        </div>
        <div class="button-container">
          <button v-if="reportStatus !== 'SENT'" :disabled="!issueType || reportStatus === 'SENDING'" class="primary" @click="sendReport()">{{ localize(`issue_reporter_send${reportStatus === 'SENDING' ? 'ing': ''}_button_label`) }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import mixinLocation from '@/scripts/mixins/location';
import secondaryHeader from './partials/secondaryHeader';
import hint from './partials/hint';

export default {
  name: 'issueReporter',
  mixins: [mixinLocation],
  components: {
    secondaryHeader,
    hint,
  },
  data() {
    return {
      hasError: false,
      reportStatus: 'STANDBY',
      issueType: 0,
      website: '',
      issueUserDescription: '',
      userLocation: '',
      issueIcons: ['', 'buffer', 'safari', 'block', 'language', 'captcha', 'speed-test', 'connect', 'edit'],
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
    },
  },
  methods: {
    setIssueType: function (i) {
      this.issueType = i;
      chrome.runtime.sendMessage({ telemetry: true, category: `issue_reporter_category_${i}_selected` });
    },
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
        cluster_id: parseInt(this.recentLocations[0] ? this.recentLocations[0].id : 0, 10),
        protocol: ci.previousConnection.protocol,
        client_version: ci.app.version,
        os_name: ci.system.os.name,
        os_version: ci.system.os.version,
        browser_name: ci.system.browser.name,
        browser_version: ci.system.browser.version,
        extension_version: chrome.runtime.getManifest().version,
        domain: this.website,
        location: this.userLocation,
        comment: this.issueUserDescription,
      };

      const timeout = function (ms, promise) {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('promise timeout'));
          }, ms);
          promise.then(
            (res) => {
              clearTimeout(timeoutId);
              resolve(res);
            },
            (err) => {
              clearTimeout(timeoutId);
              reject(err);
            },
          );
        });
      };

      const fetchIt = fetch('https://report.expressapisv2.net/issue_report', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      timeout(15000, fetchIt).then(response => {
        self.reportStatus = response.status === 204 ? 'SENT' : 'ERROR';
      }).catch(function (error) {
        console.error(error);
        self.reportStatus = 'ERROR';
      });
      chrome.runtime.sendMessage({ telemetry: true, category: `issue_reporter_category_${this.issueType}_sent` });
    },
    returnToIssueType() {
      if (this.reportStatus === 'STANDBY') {
        this.issueType = 0;
      }
    },
  },
  mounted() {
    const self = this;
    this.$store.dispatch('setIgnoreStateUpdates', true); // Prevent state updates from overwriting this screen
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let activeTabUrl = tabs[0].url;
      try {
        self.website = (new URL(activeTabUrl)).host.replace('www.', '');
      } catch (ex) {
        console.error(ex);
        self.website = '';
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.separator {
  border-bottom: 1px solid #DEDEDE;
  margin: 15px 0px;
}
p {
  //font-family: Inter-Regular;
  font-size: 16px;
  font-weight: normal;
  letter-spacing: 0px;
  line-height: 28px;
}

.reporter {
  &-container {
    padding: 15px 20px;
    height: 100vh;

    .button-container {
      width: 100%;
      margin-top: 35px;

      &-bottom {
        position: absolute;
        bottom: 15px;
      }

      button:nth-of-type(n+2) {
        margin-top: 15px;
      }
    }

    .issue {
      display: flex;
      align-items: center;
      padding: 10px 0;
      position: relative;
      color: var(--issue-default-color);

      .chevron {
        position: absolute;
        right: 0;
      }

      &:hover {
        color: var(--issue-hover-color)
      }

      &-category {
        margin-left: 15px;
        //font-family: Inter-Regular;
        font-size: 14px;
        font-weight: normal;
        letter-spacing: 0px;
        line-height: 24px;
        width: 240px;
      }

      &-location {
        height: 100%;
        width: 100%;
        background: var(--input-bg);
        border: 0;
        font-size: 16px;
        font-weight: normal;
        letter-spacing: 0px;
        line-height: 28px;

        &:invalid {
          //font-family: Inter-Regular;
          font-size: 16px;
          font-weight: normal;
          color: var(--label-color);
          letter-spacing: 0px;
          line-height: 28px;
        }

        &:disabled {
          background: var(--input-bg-disabled);
        }

        &-holder {
          margin-top: 15px;
          height: 50px;
          width: 100%;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          border-radius: 5px;
          padding: 0px 20px 0px 13px;

          &.disabled {
            border-color: #ddd;
            background: var(--input-bg-disabled);
          }
        }
      }

      &-website {
        &-input {
          margin-top: 15px;
          position: relative;

          label {
            color: var(--label-color);
            font-size: 12px;
            position: absolute;
            top: 8px;
            left: 15px;
          }
          input[type='text'] {
            height: 50px;
            width: 100%;
            padding: 22px 15px 5px 15px;
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            border-radius: 5px;
            font-size: 16px;
            font-weight: normal;
            letter-spacing: 0px;
            line-height: 28px;

            &:disabled {
              background: var(--input-bg-disabled);
              border-color: #dddddd;
            }
          }
        }
      }

      &-description {
        position: relative;
        border: 1px solid var(--input-border);
        background: var(--input-bg);
        height: 100px;
        width: 100%;
        margin-top: 15px;
        border-radius: 5px;
        padding: 6px 15px 5px 15px;

        &.disabled {
          background: var(--input-bg-disabled);
          border-color: #dddddd;
        }


        textarea {
          resize: none;
          font-size: 18px;
          width: 100%;
          border: none;
          background: var(--input-bg);
          margin-top: 2px;
          height: calc(100% - 20px);
          padding: 0;
          //font-family: Inter-Regular;
          font-size: 16px;
          font-weight: normal;
          letter-spacing: 0px;
          line-height: 28px;

          &:disabled {
            background: var(--input-bg-disabled);
          }
        }
        label {
          color: var(--label-color);
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
        display: flex;
        align-items: center;
        margin-top: 15px;
        //font-family: Inter-Regular;
        font-size: 14px;
        font-weight: normal;
        letter-spacing: 0px;
        line-height: 24px;

        .icon-back-container {
          width: 24px;
          height: 24px;
          margin-right: 15px;
        }
      }

      &-list {
        margin-top: 16px;
      }
    }
  }

  &-header {
    //font-family: Inter-Bold;
    font-size: 18px;
    font-weight: bold;
    height: 26px;
    letter-spacing: 0px;
    line-height: 26px;
  }
}
.final-container {
  position: relative;
  height: calc(100vh - 120px);
}
</style>
<style lang="scss">
.reporter-container {
  .issue {
    .icon path {
      fill: var(--issue-default-color);
    }
    &:hover {
      .icon path {
        fill: var(--issue-hover-color);
      }
    }
  }
  .icon-back-container {
    .icon path {
      fill: $eds-color-mint-20;
    }
    &:hover {
      .icon path {
        fill: $eds-color-mint-10;
      }
    }
  }
}

@media (prefers-color-scheme: light) {
  .reporter-container {
    --issue-default-color: #{$eds-color-midnight};
    --issue-hover-color: #{$eds-color-mint-20};
  }
}
@media (prefers-color-scheme: dark) {
  .reporter-container {
    --issue-default-color: #{$eds-color-grey-40};
    --issue-hover-color: #{$eds-color-neon};

    .logo path {
      fill: $eds-color-grey-40;
    }
  }
}
</style>
