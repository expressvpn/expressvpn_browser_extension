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
  //min-height: 44px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  // box-sizing: content-box;

  &.information {
    background-color: var(--blue40);
    color: var(--blue10);
    .icon { // cleanup
      color: var(--blue10);
    }
  }
  &.error {
    background-color: var(--red40);
    color: var(--red10);
    .icon {
      color: var(--red10);
    }
  }

  &.green {
    background-color: var(--green40);
    color: var(--green10);
    .icon {
      color: var(--green10);
    }
  }

  &-text {
    font-family: ProximaNova-Semibold;
    font-size: 16px;
    margin-left: 15px;
    line-height: 20px;
  }

  &-container {
    margin-top: 10px;
  }
}
</style>