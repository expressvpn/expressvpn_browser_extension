<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div class="toast">
     <img v-svg-inline src='/images/icons/check.svg' width="24" height="24" class="icon" />
    <span>{{ localize(message) }}</span>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'toast',
  props: ['message'],
};
</script>

<style lang="scss" scoped>
.toast {
  width: fit-content;
  width: -moz-fit-content;
  height: 44px;
  border-radius: 5px;
  padding: 15px 10px;
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  bottom: 30px;
  background-color: $eds-color-success-50;
  color: $eds-color-success-10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 0px;
  line-height: 22px;

  .icon {
    margin-right: 15px;
  }
}
</style>
<style lang="scss">
.toast .icon path {
  fill: $eds-color-success-20;
}
</style>
