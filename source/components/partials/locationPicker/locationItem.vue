<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="location-item" @click="locationItemClick">
    <div class="location-item-content">
      <img class="flag-icon" v-bind:src="imgSrc" @error="iconError = true" v-if="showFlag" />
      {{ (type === 'country' ? model.country : model.name) }}
    </div>
    <div v-if="type === 'country'" class="location-expand" @click="countryClick">
      <img class="icon" v-svg-inline src='/images/icons/chevron-right.svg' width="24" height="24" />
    </div>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      iconError: false,
    };
  },
  computed: {
    imgSrc() {
      let iconName = this.model.country_code;
      if (this.iconError === true) {
        iconName = 'XV';
      }
      return chrome.extension.getURL('/images/flags/' + iconName.toUpperCase() + '.svg');
    },
  },
  methods: {
    countryClick(event) {
      event.stopPropagation();
      const { country, region, country_code } = this.model;
      let emitObj = {
        name: country,
        code: country_code,
        scrollTop: document.querySelector('.location-list-container').scrollTop,
      };

      if (this.category === 'all' && region) {
        emitObj = Object.assign({}, emitObj, { region });
      }
      this.$root.$emit('show-country-screen', emitObj);
    },
    locationItemClick(event) {
      let is_smart_location = (this.currentInfo.smartLocation.id === this.model.id);
      let is_country = (this.type === 'country');
      let selectedLocation = Object.assign({}, this.model, { is_smart_location, is_country });
      if (is_country === true) {
        selectedLocation.name = this.model.country;
      }

      this.$root.$emit('connect-to-location', selectedLocation);
    },
  },
  props: {
    model: Object,
    category: String,
    type: String,
    showFlag: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
};
</script>

<style lang="scss">

</style>
