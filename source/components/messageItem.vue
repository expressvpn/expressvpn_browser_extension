<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div
    class="messageItem" @click="createTab({ url: latestMessage.button_link }, $event)"
  >
    <p id="message">{{ latestMessage.message }}</p>
    <a  id="messageLink" tabindex="-1" @click="createTab({ url: latestMessage.button_link }, $event)">{{ latestMessage.button }}</a>
  </div>
</template>
<script>

export default {
  computed: {
  },
  methods: {
  },
  mounted() {
  },
  props: {
    latestMessage: {},
  },
};
</script>

<style lang="scss">
    .messageItem {
        cursor: pointer;
    }
</style>
