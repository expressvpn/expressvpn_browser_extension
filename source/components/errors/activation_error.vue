<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <not-activated />
  </div>
</template>

<script type="text/javascript">
import notActivated from './not_activated.vue';

export default {
  name: 'activation_error',
  components: { notActivated },
};
</script>

<style lang="scss" scoped>
</style>