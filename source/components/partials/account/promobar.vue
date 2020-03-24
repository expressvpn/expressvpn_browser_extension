<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div>
    <div :class="['promobar', `promobar-${customClass}`]">
      <i class="icon icon-41-error" />
      <span>{{ text }}</span>
    </div>
  </div>
</template>
<script>
import subscriptionMixin from '@/scripts/mixins/subscription';

export default {
  name: 'promobar',
  props: {
    text: {
      type: String,
      required: true,
    },
    customClass: {
      type: String,
      required: true,
    },
  },
  computed: {
  },
  mixins: [subscriptionMixin],
  methods: {
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
.promobar {
  border-radius: 4px;
  height: 44px;
  font-family: ProximaNova-Semibold;
  font-size: 16px;
  margin-bottom: 25px;
  padding: 10px 15px;
  display: flex;
  align-items: center;

  &-warning {
    background: var(--yellow40);

    i, span {
      color: var(--yellow10);
    }
  }
  &-error {
    background: var(--red40);

    i, span {
      color: var(--red10);
    }
  }

  .icon {
    margin-right: 15px;
  }
}
</style>
