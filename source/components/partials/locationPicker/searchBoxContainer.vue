<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="search-input-container">
    <div class="icon icon-medium icon-96-search"></div>
    <input v-model="searchText" v-on:input="updateInput()" :placeholder="localize('location_picker_search_placeholder_text')" class="search-input" :style="isTyping ? 'padding-right: 35px;' : ''" autofocus>
    <div class="icon icon-medium icon-18-cancel" @click="cancelSearch()"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchText: this.initialText || '',
    };
  },
  props: {
    initialText: String,
  },
  computed: {
    isTyping() {
      return this.searchText !== '';
    },
  },
  methods: {
    cancelSearch(event) {
      // Hide search box
      this.searchText = '';
      this.$parent.$emit('cancelSearch', event);
    },
    updateInput() {
      this.$emit('input', this.searchText);
    },
  },
  mounted() {
    if (process.env.NODE_ENV === 'development') {
      let self = this;
      document.querySelector('.search-input-container').insertAdjacentHTML('afterend', '<button class="mock-button" id="mockSearch"></button>');
      document.getElementById('mockSearch').addEventListener('click', () => { self.searchText = 'q'; self.updateInput(); });
    }
  },
};
</script>

<style lang="scss" scoped>
.search-input {
  width: 100%;
  background-color: $gray-50;
  color: $black-20;
  font-size: 18px;
  line-height: 23px;
  border: 0;
  padding: 0 0 0 0;

  &::placeholder {
    color: $gray-20;
  }

  &-container {
    height: 52px;
    background-color: $gray-50;
    box-shadow: 0 1.5px 4px 2px rgba(0, 0, 0, 0.1);
    margin: 15px 0;
    padding: 14px 16px 13px 54px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    position: relative;

    .icon {
      position: absolute;
      font-size: 29px;

      &.icon-96-search {
        left: 15px;
        color: #000;
      }
      &.icon-18-cancel {
        color: $gray-30;
        right: 16px;

        &:hover {
          color: $black-20;
        }
      }
    }
  }
}
</style>
