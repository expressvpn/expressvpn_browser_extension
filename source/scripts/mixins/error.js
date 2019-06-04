/*
ExpressVPN Browser Extension:
Copyright 2017-2019 Express VPN International Ltd
Licensed GPL v2
*/
export default {
  data: function () {
    return {
    };
  },
  methods: {
    checkForLinks(ev) {
      if (ev.target.nodeName === 'A') {
        this.createTab({ url: ev.target.dataset.href }, ev);
      }
    },
    addAnchor(stringKey, urlPath) {
      let prefix = `<a data-href='${this.currentInfo.website_url}${urlPath}'>`;
      let suffix = '</a>';
      return this.localize(stringKey).replace('[', prefix).replace(']', suffix);
    },
  },
  computed: {
    lockStatus() {
      return this.currentInfo.preferences.traffic_guard_level ? 'on' : 'off';
    },
  },
  mounted() {
  },
  created: function () {
  },
  updated: function () {
  },
};

