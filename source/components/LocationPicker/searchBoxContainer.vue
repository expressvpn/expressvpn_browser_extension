<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="searchBoxContainer">
    <div class="search-box-inner">
      <div class="search-icon"></div>
      <div class="search-box-area">
        <input ref="searchInput" v-model="searchText" v-on:input="updateInput()" v-bind:placeholder="localize('location_picker_search_placeholder_text')" class="search-input" v-bind:style="[searchText !='' ? { opacity:'1.0'} : { opacity:'0.5'} ]" autofocus>
      </div>
      <div id="cancelSearchBtn" class="cancelSearchBtn" @click="cancelSearch"></div>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      searchText: '',
      searchFlag: true,
    };
  },
  components: {
  },
  methods: {
    cancelSearch(event) {
      // Hide search box
      this.searchFlag = false;
      this.searchText = '';
      this.$parent.$emit('cancelSearch', event);
    },
    updateInput() {
      this.$emit('input', this.searchText);
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.$refs.searchInput.focus();
    });
  },
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="css" scoped>
.searchBoxContainer {
  width: 260px;
  height: 36px;
  border-radius: 4px;
  background-color: #fefefe;
  box-shadow: 0 1.5px 4px 2px rgba(0, 0, 0, 0.1);
  margin-left: 10px;
  margin-bottom: 10px;
}
.search-box-inner {
  margin-left: 10px;
}
.search-icon {
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  right: 23px;
  float: left;
  margin-top: 10px;
}
#cancelSearchBtn {
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  float: left;
  margin-top: 11px;
  margin-left: 8px;
  cursor: pointer;
}
.search-box-area {
  float: left;
  margin-top: 5px;
  margin-left: 10px;
}
.search-input {
  width: 185.5px;
  height: 24px;
  opacity: 1.0;
  font-size: 15px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  letter-spacing: normal;
  text-align: left;
  color: #1d1d1d;
  float: left;
  border: none;
}
</style>
