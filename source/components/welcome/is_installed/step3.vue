<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <div class="image-container">
      <img :src="`/images/welcome_step3.svg`" />
    </div>
    <div class="text-container">
      <p>{{ localize('welcome_screen3_p1_text') }} <a @click="createTab({ url: currentInfo.website_url + '/support/vpn-setup/expressvpn-browser-extension?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=welcome' })">{{ localize('welcome_screen3_learn_more_text') }}</a></p>
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'step3',
};
</script>

<style lang="scss" scoped>
.image-container {
  display: flex;
  justify-content: center;

  img {
    width: 320px;
    height: 205px;
  }
}

.text-container {
  margin-top: 61px;
  text-align: center;
  font-size: 20px;
}
a {
  margin-top: 20px;
}
</style>