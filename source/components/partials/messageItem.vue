<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="message" @click="createTab({ url: latestMessage.button_url }, $event)">
    <div class="message-text">{{ latestMessage.simple_message }}</div>
    <a class="message-link" tabindex="-1" @click="createTab({ url: latestMessage.button_url }, $event)">{{ latestMessage.button_text }}</a>
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

<style lang="scss">
.message {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  text-align: center;
  padding: 15px 25px;
  font-size: 12px;
  box-shadow: inset 0px 4px 6px 0px rgba(100, 100, 100, 0.1);

  &-text {
    color: var(--gray10);
  }
}
</style>
