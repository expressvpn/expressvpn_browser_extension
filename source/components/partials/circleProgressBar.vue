<template>
  <div class="circleProgressBar">
    <svg class="progress" :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle :class="['progress-background', `progress-background-${currentInfo.state}`]" :cx="size/2" :cy="size/2" :r="radius" :stroke-width="strokeWidth" />
      <circle :class="['progress-bar', `progress-bar-${currentInfo.state}`]" :cx="size/2" :cy="size/2" :r="radius" :stroke-width="strokeWidth" :stroke-dasharray="circumference" :stroke-dashoffset="dashoffset" />
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
        size: 114,
        strokeWidth: 6,
      };
    },
    computed: {
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

    &-background {
      stroke: $gray-30;
      fill: $gray-50;

      &-ready {
        stroke: $red-20;
      }
    }
    
    &-bar {
      fill: none;

      &-connecting {
        stroke: $green-30;
        transition: stroke-dashoffset 1s linear;
      }
      &-connected {
        stroke: $green-30;
        stroke-dashoffset: 0;
      }
    }
  }
</style>