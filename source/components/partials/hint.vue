<template>
  <div class="hint-container">
    <div :class="['hint', type]">
      <div class="icon-container">
        <inlineSvg class="icon" :src="`/images/icons/${iconName}.svg`" width="24" height="24" viewbox="0 0 24 24" />
      </div>
      <div class="hint-text" v-html="hintText()"></div>
    </div>
  </div>
</template>
<script>
import InlineSvg from 'vue-inline-svg';

export default {
  name: 'hint',
  components: {
    InlineSvg,
  },
  props: {
    iconName: {
      type: String,
      required: false,
      default: 'error',
    },
    text: {
      type: String,
      required: false,
    },
    stringKey: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
      default: 'information',
    },
  },
  methods: {
    hintText() {
      return this.stringKey ? this.localize(this.stringKey) : this.text;
    },
  },
};
</script>
<style lang="scss" scoped>
.hint {
  border-radius: 5px;
  display: flex;
  padding: 10px 15px;

  &.information {
    background-color: var(--hint-info-bg);
    color: var(--hint-info-font-color);
  }
  &.green {
    background-color: $eds-color-success-50;
    color: $eds-color-success-20;
  }
  &.error {
    background-color: $eds-color-error-50;
    color: $eds-color-error-20;
  }
  &.warning {
    background-color: $eds-color-warning-50;
    color: $eds-color-warning-20;
  }

  &-text {
    font-size: 14px;
    font-weight: normal;
    letter-spacing: 0px;
    line-height: 22px;
    margin-left: 10px;
  }

  &-container {
    margin-top: 10px;
  }

  .icon-container {
    width: 24px;
    height: 24px;
  }
}
</style>
<style lang="scss">
.hint {
  &.information {
    .icon path {
      fill: var(--hint-info-font-color);
    }
  }
  &.green {
    .icon path {
      fill: $eds-color-success-20;
    }
  }
  &.error {
    .icon path {
      fill: $eds-color-error-20;
    }
  }
  &.warning {
    .icon path {
      fill: $eds-color-warning-20;
    }
  }
}
</style>
<style lang="scss">
@media (prefers-color-scheme: light) {
  .hint {
    --hint-info-bg: #{$eds-color-info-50};
    --hint-info-font-color: #{$eds-color-info-20};
  }
}
@media (prefers-color-scheme: dark) {
  .hint {
    --hint-info-bg: #{$eds-color-info-10};
    --hint-info-font-color: #{$eds-color-info-50};
  }
}
</style>
