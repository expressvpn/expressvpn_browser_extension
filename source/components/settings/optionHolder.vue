<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div
    class="optionHolder"
    :ref="keyValue"
    @mouseover="mouseOver"
    @mouseout="mouseOut"
    @mousemove="isInitial=false"
  >
    <label :for='keyValue'>{{ text }}</label>
    <toggle-switch :id="keyValue" v-model="vmodel[keyValue]"></toggle-switch>
    <hgroup class="speech-bubble" ref="speech-bubble" v-show="isHover && !isInitial && tooltip !== ''" >
      <label>{{ tooltip }}</label>
    </hgroup>
    <transition name="slide-fade" >
      <hint type="success" icon="CheckWhite" message="hint_saved_text" v-if="isSaving"></hint>
    </transition>
  </div>
</template>
<script>
import toggleSwitch from '../EDS/ToggleSwitch.vue';
import hint from '../EDS/Hint.vue';

export default {
  computed: {
  },
  watch: {
    vmodel: {
      // watch vmodel's change.  Here, vmodel = prefs.
      handler: function (newVal, oldVal) {
        if (this.isMounting === true) {
          return;
        }
        let self = this;
        this.triggerSaveAnimation();
        chrome.storage.local.set({ 'prefs': Object.assign({}, newVal) }, function () {
          chrome.runtime.sendMessage({ updateExtensionSettings: true });
          window.currentLanguageCode = newVal.language;
          self.setLanguage();
        });
      },
      deep: true,
    },
  },
  methods: {
    mouseOver: function () {
      //  When mouse is over "optionHolder", it shows tooltip. Tooltip's position is absolute.
      this.isHover = true;
      // Tooltip's top position is the bottom of the optionHolder.
      let topPos = this.$refs[this.keyValue].getBoundingClientRect().bottom + 11;
      let speechEl = this.$refs['speech-bubble'];
      speechEl.style.top = topPos + 'px';
    },
    mouseOut: function () {
      this.isHover = false;
    },
    triggerSaveAnimation: function () {
      this.isSaving = true;
      let self = this;
      setTimeout(function () {
        self.isSaving = false;
      }, 500);
    },
  },
  data: function () {
    return {
      isInitial: true,
      isHover: false,
      isMounting: false,
      isSaving: false,
    };
  },
  mounted() {
    this.isMounting = true;
  },
  updated: function () {
    let self = this;
    this.$nextTick(function () {
      self.isMounting = false;
    });
  },
  props: {
    text: String,
    keyValue: String,
    vmodel: Object,
    tooltip: String,
  },
  components: {
    hint,
    toggleSwitch,
  },
};
</script>

<style lang="scss">
  .optionHolder{
    height: 18px;
    left: 0px;
    display:flex;
    flex: 1 1 100px;
    align-items:center;
    margin-top: 10px;

    input[type="checkbox"] {
      float: right;
    }
  }
  .optionHolder label {
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #4a4a4a;
  }
  .speech-bubble label {
    font-weight: normal;
    width: 220px;
    display: inline-block;
    padding: 10px;
    font-family: ProximaNova;
    line-height: 1.25;
    text-align: left;
    color: #fefefe!important;
  }
  .toggle {
    transform: scale(0.5);
    margin-left: auto;
    order: 2;
  }
</style>
