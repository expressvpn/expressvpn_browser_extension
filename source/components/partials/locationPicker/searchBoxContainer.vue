<!--
ExpressVPN Browser Extension:
Copyright 2017-2020 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="search-input-container">
    <input v-model="searchText" v-on:input="updateInput()" :placeholder="localize('location_picker_search_placeholder_text')" class="search-input" :style="isTyping ? 'padding-right: 35px;' : ''" autofocus>
    <div class="icon icon-cancel-container" @click="cancelSearch()">
      <img v-svg-inline class="icon-cancel" src='/images/icons/cancel.svg' height="24" width="24" viewbox="0 0 24 24" />
    </div>
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
      console.log("here")
      document.querySelector('.search-input-container').insertAdjacentHTML('afterend', '<button id="mockSearch"></button>');
      document.getElementById('mockSearch').addEventListener('click', () => { self.searchText = 'q'; self.updateInput(); });
    }
  },
};
</script>

<style lang="scss" scoped>
.search-input {
  width: 100%;
  background-color: var(--input-bk);
  font-size: 16px;
  border: 0;
  padding: 0 0 0 0;

  &::placeholder {
    color: var(--placeholder-color);
    //font-family: Inter-Regular;
    font-size: 16px;
    font-weight: normal;
    letter-spacing: 0px;
    line-height: 28px;
  }

  &-container {
    height: 60px;
    background-color: var(--input-bk);
    margin-bottom: 15px;
    padding: 15px 40px 15px 20px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    position: relative;
    border: 1px solid var(--font-color);

    .icon-cancel {
      position: absolute;
      right: 15px;

      &-container {
        width: 24px;
        height: 24px;
      }
    }
  }
}
</style>
<style lang="scss">
#mockSearch {
  position:absolute;
  opacity: 0;
  top: 0;
  width: 1px;
  height: 1px;
}
.search-input-container .icon-cancel path {
  fill: var(--font-color);
}
@media (prefers-color-scheme: light) {
  .search-input-container {
    --input-bk: #{$eds-color-white};
    --placeholder-color: #{$eds-color-grey-20};
    
  }
}
@media (prefers-color-scheme: dark) {
  .search-input-container {
    --input-bk: #{$eds-color-grey-10};
    --placeholder-color: #{$eds-color-grey-40};
  }
}
</style>
