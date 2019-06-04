<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
  <div :class="currentInfo.state">
    <internal-error />
  </div>
</template>

<script type="text/javascript">
import internalError from './internal_error.vue';

export default {
  name: 'network_error',
  components: { internalError },
};
</script>

<style lang="scss" scoped>
</style>