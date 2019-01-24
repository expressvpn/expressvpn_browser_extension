<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div id="noAppContainer">
    <div :class="['devicesImg', `devicesImg_${browserInfo.name}`]"></div>
    <p id="p1">{{ localize(`error_app_not_found_require_${currentInfo.os}_text`) }}</p>
    <p v-html="getConvertedText(localize(`error_app_not_found_contact_support_text`))" @click="checkForLinks"></p>
    <div class="errorBtnsHolder">
      <button  @click="createTab({ url: currentInfo.website_url + '/setup?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_sign_in_to_set_up' }, $event)">{{ localize('error_app_not_found_install_desktop_app_button_label') }}</button>
      <p v-html="getConvertedHtmlContent(localize(`error_app_not_found_get_started_text`))" @click="checkForLinks"></p>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'currentInfo',
    ]),
  },
  methods: {
    checkForLinks: function (ev) {
      if (ev.target.nodeName === 'A') {
        this.createTab({ url: ev.target.dataset.href }, ev);
      }
    },
    getConvertedText: function (text) {
      let prefix = "<a style='font-size: 13.6px;' data-href='" + this.currentInfo.website_url +
        "/support/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_contact_support'>";
      let suffix = '</a>';
      return text.replace('[', prefix).replace(']', suffix);
    },
    getConvertedHtmlContent: function (text) {
      let prefix = "<a style='font-size: 15px;color: #c8252c;' data-href='" + this.currentInfo.website_url +
        "/order/?utm_source=extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=app_not_found_get_started'>";
      let suffix = '</a>';
      return text.replace('[', prefix).replace(']', suffix);
    },
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
$xvpn_red: #c8252c;
#noAppContainer {

  .devicesImg {
    width: 260px;
    height: 94px;
    margin-left: -10px;
    background-size: 100% auto;
    background-repeat: no-repeat;
    margin-bottom: 20px;
  }

  p {
    margin-top: 15px;
    font-size: 13.6px;
    line-height: 19px;
  }

  .devicesImg_Chrome {
    background-image:url('/images/devices_chrome.png');
  }
  .devicesImg_Firefox {
    background-image:url('/images/devices_Firefox.png');
  }
  
  height: 330px;
  width: 240px;
  background-color: #ffffff;
  box-shadow: 0px 1.5px 4px 2px rgba(0,0,0,0.1);
  padding: 20px 10px;
  border-radius: 4px;
  margin-left: 10px;

  .errorBtnsHolder {
    position: absolute;
    bottom: 30px;
    text-align: center;
    width: 80%;
    button {
      width: 240px;
      height: 39px;
      border-radius: 4px;
      background-color: $xvpn_red;
      text-align: center;
      border: 0;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
      font-size: 15px;
      font-weight: 600;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #f7f7f7;
      &:hover {
        opacity: 0.8;
      }
    }
    p {
      font-size: 15px;
      width: 240px;
    }
  }
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .devicesImg_Chrome {
    background-image:url('/images/devices_chrome@2x.png');
  }
  .devicesImg_Firefox {
    background-image:url('/images/devices_Firefox@2x.png');
  }
}

@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi) {
  .devicesImg_Chrome {
    background-image:url('/images/devices_chrome@3x.png');
  }
  .devicesImg_Firefox {
    background-image:url('/images/devices_Firefox@3x.png');
  }
}
</style>