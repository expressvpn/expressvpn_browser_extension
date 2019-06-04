<template>
  <div class="icon-container">
    <div class="icon-bubble">
      <span :class="['icon', 'icon-xxl', iconName]"></span>
    </div>
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
    data() {
      return {
      };
    },
    computed: {
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
.icon {
    color: $gray-50;

    &:before {
      line-height: 75px !important;
    }
  
    &-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 25px;
    }

    &-bubble {
      background: $accent-10;
      height: 100px;
      width: 100px;
      border-radius: 50%;
      text-align: center;
    }

    &-xxl {
      font-size: 60px;
    }
  }
</style>