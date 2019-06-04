<template>
  <div class="hint-container">
    <div :class="['hint', type]">
      <div :class="['icon', iconName]"></div>
      <div class="hint-text" v-html="hintText()"></div>        
    </div>
  </div>
</template>
<script>
  export default {
    name: 'hint',
    props: {
      iconName: {
        type: String,
        required: false,
        default: 'icon-56-information',
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
    data() {
      return {
      };
    },
    computed: {
    },
    methods: {
      hintText() {
        return this.stringKey ? this.localize(this.stringKey) : this.text;
      },
    },
    components: {
    },
    mounted() {
    },
  };
</script>
<style lang="scss" scoped>
.hint {
  min-height: 44px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  box-sizing: content-box;

  &.information {
    background-color: $blue-40;
    color: $blue-10;
    .icon { // cleanup
      color: $blue-10;
    }
  }
  &.error {
    background-color: $red-40;
    color: $red-10;
    .icon {
      color: $red-10;
    }
  }

  &-text {
    font-family: ProximaNova-Semibold;
    font-size: 16px;
    margin-left: 15px;
  }

  &-container {
    margin-top: 10px;
    padding: 0 15px;
  }
}
</style>