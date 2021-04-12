<template>
  <div class="circleProgressBar">
    <svg :class="['progress', { 'infinite': showInfiniteAnimation }]" :width="size" :height="size">
      <circle :class="['progress-bar', `progress-bar-${currentInfo.state}`, { 'infinite': showInfiniteAnimation }]" :cx="size/2" :cy="size/2" :r="radius" :stroke-width="strokeWidth" :stroke-dasharray="circumference" :stroke-dashoffset="dashoffset" stroke-linecap="round" />
    </svg>
  </div>
</template>
<script>
export default {
  name: 'circleProgressBar',
  props: {
    value: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  data() {
    return {
      size: 110,
      strokeWidth: 6,
    };
  },
  computed: {
    showInfiniteAnimation() {
      return (['ready', 'reconnecting', 'connecting'].includes(this.currentInfo.state) && ['no internet', 'captive portal', 'not sure', 'not ready'].includes(this.currentInfo.networkStatus));
    },
    radius() {
      return (this.size / 2) - (this.strokeWidth / 2);
    },
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    dashoffset() {
      let progress = this.value / 100;
      return this.circumference * (1 - progress);
    },
  },
  methods: {
  },
  components: {
  },
  mounted() {
  },
};
</script>
<style lang="scss" scoped>
.progress {
  transform: rotate(-90deg);
  position: relative;
  top: 1px; // fix chromium alignment issue

  &.infinite {
    animation: rotate 2s linear infinite;
  }

  &-bar {
    fill: none;

    &-connecting, &-reconnecting {
      stroke: $eds-color-neon;
      transition: stroke-dashoffset 1s linear;
    }

    &.infinite {
      animation: dash 2.5s linear infinite;
    }

  }
}

@keyframes rotate {
  100% {
    transform: rotate(270deg);
  }
}
@keyframes dash {
  0% {
    stroke-dasharray: 1,570;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 254,570;
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dasharray: 254,570;
    stroke-dashoffset: -340;
  }
}
</style>
<style lang="scss">
@media (prefers-color-scheme: light) {
  .power-button {
    --obi--background: #{$eds-color-white};
  }
}
@media (prefers-color-scheme: dark) {
  .power-button {
    --obi--background: #{$eds-color-grey-10};
  }
}
</style>
