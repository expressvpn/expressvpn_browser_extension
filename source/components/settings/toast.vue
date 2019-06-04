<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div class="toast">
    <i class="icon icon-20-check" />
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
  width: 115px;
  height: 44px;
  border-radius: 4px;
  padding: 15px 10px;
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  bottom: 82px;
  background-color: $green-40;
  color: $green-10;
  font-size: 16px;
  font-family: ProximaNova-Semibold;
  display: flex;
  align-items: center;
  justify-content: center;

  .icon {
    color: $green-10;
    margin-right: 15px;
    font-size: 24px;
  }
}
</style>