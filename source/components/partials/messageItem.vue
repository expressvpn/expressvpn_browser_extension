<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
<div class="message-container">
  <div class="message" @click="createTab({ url: latestMessage.button_url }, $event)">
    <div class="message-text">{{ latestMessage.simple_message }}</div>
    <a class="message-link" tabindex="-1" @click="createTab({ url: latestMessage.button_url }, $event)">{{ latestMessage.button_text }}</a>
  </div>
</div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'latestMessage',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  letter-spacing: 0px;
  line-height: 22px;
  text-align: center;
  padding: 9px 20px;
  font-size: 12px;
  //box-shadow: inset 0px 4px 6px 0px rgba(100, 100, 100, 0.1);
  box-shadow: 0px 0px 17px 0px rgba(50, 33, 33, 0.1);

  &-container {
    position: absolute;
    height: 85px;
    bottom: 0;
    width: 100%;
    border-top: 0.5px solid var(--message-border-color);
  }
}

@media (prefers-color-scheme: light) {
  .message-container {
    --message-border-color: rgba(0,0,0,0);
  }
}
@media (prefers-color-scheme: dark) {
  .message-container {
    --message-border-color: #{$eds-color-grey-10};
  }
}
</style>
