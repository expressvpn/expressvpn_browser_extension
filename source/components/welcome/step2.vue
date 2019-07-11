<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div>
    <div class="image-container">
      <img :src="`/images/welcome_step2.svg`" />
    </div>
    <p>{{ localize('welcome_screen2_p1_text') }}</p>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'step2',
};
</script>

<style lang="scss" scoped>
.image-container {
  display: flex;
  justify-content: center;

  img {
    width: 320px;
    height: 300px;
  }
}

p {
  margin: 11px 0 28px 0;
}
</style>