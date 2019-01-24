<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
-->
<template>
  <div class="popup" v-if="options.condition">
    <div id="popupScreen" :class='getStyle'>
      <div id="contentArea">
        <div id="headerText">{{ localize(options.id + '_title') }}</div>
        <div id="p1">{{ localize(options.id + '_text') }}</div>
        <div id="btntnHolder">
          <button id="button1" @click="options.cbBtn1">{{ localize(options.id + '_btn1') }}</button>
          <button id="button2" @click="options.cbBtn2">{{ localize(options.id + '_btn2') }}</button>
          <button id="button2" @click='options.condition = false'>{{ localize(options.id + '_btn3') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  computed: {
    getStyle() {
      if (this.options.style === 'VERTICAL') {
        return 'vertical';
      }
      return 'horizontal';
    },
  },
  methods: {
  },
  mounted() {
  },
  props: {
    options: Object,
  },
};
</script>

<style lang="scss">
.popup {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  background-color: rgba(0,0,0,0.4);
  .vertical {
    height: 200px;
    #btntnHolder {
      button {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
  .horizontal {
    height: 120px;
    #btntnHolder {
      button {
        width: 98px;
      }
      #button1 {
        float: left;
      }
      #button2 {
        float: right;
      }
    }
  }
  #popupScreen {
    position: relative;
    width: 260px;
    text-align: center;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 5px;
    top: 28%;
    #contentArea {
      height: 100%;
      width: 90%;
      margin-left: 5%;
      #headerText {
        height: 36px;
        line-height: 36px;
        text-align: left;
        font-size: 16px;
        border-bottom: 1px solid #d3d3d3;
      }
      #p1 {
        font-size: 12px;
        text-align: left;
        padding-top: 6px;
        line-height: 14px;
      }
      #btntnHolder {
        position: absolute;
        bottom: 10px;
        width: 90%;
        button {
          height: 28px;
          border-radius: 4px;
          transition: all .2s;
        }
        #button1 {
          color: #fefefe;
          background: #1f475a;
          border-width: 0px;
        }
        #button1:hover {
          background: #2c6580;
        }
        #button1:focus, #button1:active {
          background: #122934;
        }
        #button2 {
          color: #1f475a;
          border: 1px solid #1f475a;
          background: #fefefe;
        }
        #button2:hover {
          color: #2c6580;
          border-color: #2c6580;
        }
        #button2:focus, #button2:active {
          color: #122934;
          border-color: #122934;
        }
      }
    }
  }
}
</style>
