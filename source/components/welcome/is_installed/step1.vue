<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <div class="image-container">
      <img :src="`/images/welcome_step1_${currentInfo.os}.svg`" />
    </div>
    <p>{{ localize('welcome_screen1_p1_text') }}</p>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'step1',
};
</script>

<style lang="scss" scoped>
.image-container {
  position: relative;
  height: 286px;

  img {
    height: 100%;
    right: 20px;
    position: absolute;
  }
}

p {
  margin-bottom: 52px;
}
</style>