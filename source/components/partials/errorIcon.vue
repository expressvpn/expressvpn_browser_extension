<template>
  <div class="icon-container">
    <img v-svg-inline class="error-icon" :src="`/images/illustrations/${iconName}.svg`" />
  </div>
</template>
<script>
export default {
  name: 'errorIcon',
  props: {
    iconName: {
      type: String,
      required: true,
    },
  },
};
</script>
<style lang="scss" scoped>
.error-icon {
    &-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 25px;
    }
  }
</style>
<style lang="scss">
@media (prefers-color-scheme: light) {
  .popup {
    --popup-bk: #{$eds-color-white};
    --icon-close-default: #{$eds-color-grey-20};
  }
}
@media (prefers-color-scheme: dark) {
  .popup {
    --popup-bk: #{$eds-color-grey-10};
    --icon-close-default: #{$eds-color-grey-40};
  }
}
</style>
