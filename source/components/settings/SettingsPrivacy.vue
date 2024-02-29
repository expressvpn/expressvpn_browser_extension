<!-- 
ExpressVPN Browser Extension:
Copyright 2017-2024 Express VPN International Ltd
Licensed GPL v2
-->
<template>
    <div>
        <secondary-header
            stringkey="menu_settings_privacy_security_name"
            :onBackClick="sideBackBtnClick"
            :showSearchOption="false"
        />
        <div class="setting-container">
            <div class="setting-group">
                <div class="setting-option-container">
                    <label for="hideLocation">{{
                        localize('menu_privacy_hide_location_text')
                    }}</label>
                    <toggle-switch
                        id="hideLocation"
                        v-model="prefs['hideLocation']"
                    ></toggle-switch>
                </div>
                <div class="setting-description">
                    {{
                        localize(
                            'menu_settings_privacy_hide_location_description_text'
                        )
                    }}
                </div>
            </div>

            <div class="divider" />

            <div class="setting-group">
                <div class="setting-option-container">
                    <label for="webrtc_opt">{{
                        localize('menu_privacy_block_webrtc_text')
                    }}</label>
                    <toggle-switch
                        id="webrtc_opt"
                        v-model="prefs['chrome.prevent_webrtc_leaks']"
                    ></toggle-switch>
                </div>
                <div class="setting-description">
                    {{
                        localize(
                            'menu_settings_privacy_block_webrtc_description_text'
                        )
                    }}
                </div>
            </div>

            <div class="button-container">
                <button
                    class="secondary"
                    @click="
                        createTab({
                            url: `${currentInfo.website_url}/support/vpn-setup/expressvpn-browser-extension?utm_source=browser_extension&utm_medium=apps`,
                        })
                    "
                >
                    {{
                        localize(
                            'menu_settings_privacy_learn_more_button_label'
                        )
                    }}
                </button>
            </div>
        </div>

        <transition name="slide-fade">
            <toast message="hint_saved_text" v-if="isSaving"></toast>
        </transition>
        <popup :options="popupOptions"></popup>
    </div>
</template>
<script>
import secondaryHeader from '../partials/secondaryHeader';
import popup from '../partials/popup';
import toggleSwitch from './ToggleSwitch';
import toast from './toast';

export default {
    name: 'SettingsPrivacy',
    data: function () {
        return {
            prefs: {},
            previousPrefs: null,
            isSaving: false,
            isMounting: false,
            popupOptions: {},
            hasAllUrlsPermission: false,
            isFirefox: false,
        };
    },
    watch: {
        prefs: {
            handler: function (newVal, oldVal) {
                if (this.isMounting === true) {
                    this.previousPrefs = {...newVal};
                    // skip the semi-initial assignment
                    return;
                }
                if (this.isFirefox && !this.hasAllUrlsPermission && newVal.hideLocation === true && this.previousPrefs.hideLocation === false) {
                    document.getElementById('hideLocation').click(); // Trigger ui change
                    this.popupOptions = {
                        id: 'firefox_location_spoofing_popup',
                        buttons: [
                            {
                                highlightIt: true,
                                callback: async () => {
                                    this.popupOptions = {};
                                    const permissionResponse = await browser.permissions.request({origins: ['<all_urls>']});
                                    if (permissionResponse === true) {
                                        this.hasAllUrlsPermission = true;
                                        document.getElementById('hideLocation').click();
                                    }
                                },
                            },
                        ],
                        isVisible: true,
                        style: 'vertical',
                    };
                } else if (JSON.stringify(newVal) != JSON.stringify(this.previousPrefs)) {
                    this.triggerSaveAnimation();
                    chrome.storage.local.set(
                        { prefs: Object.assign({}, newVal) },
                        function () {
                            chrome.runtime.sendMessage({
                                updateExtensionSettings: true,
                            });
                        }
                    );
                    this.previousPrefs = {...newVal};
                }
                
            },
            deep: true,
        },
    },
    components: {
        secondaryHeader,
        toggleSwitch,
        toast,
        popup,
    },
    methods: {
        triggerSaveAnimation: function () {
            this.isSaving = true;
            let self = this;
            setTimeout(function () {
                self.isSaving = false;
            }, 500);
        },
        sideBackBtnClick: function (event) {
            this.$store.dispatch('setCurrentView', 'menuScreen');
        },
    },
    updated: function () {
        let self = this;
        this.$nextTick(function () {
            // Code that will run only after the
            // entire view has been re-rendered
            self.isMounting = false;
        });
    },
    async mounted() {
        this.isMounting = true;
        const storage = await chrome.storage.local.get('prefs');
        this.prefs = this.utils.defaultPreferences;
        this.isFirefox = this.browserInfo.name === 'Firefox';

        if (typeof storage.prefs === 'object') {
            this.prefs = { ...this.prefs, ...storage.prefs };
        }

        if (this.isFirefox) {
            const permissions = await browser.permissions.getAll();
            this.hasAllUrlsPermission = permissions.origins.includes('<all_urls>');
        }
    },
};
</script>
<style lang="scss">
button.primary:only-child {
  margin-bottom: inherit !important;
}
</style>
<style lang="scss" scoped>
.setting {
    &-description {
        margin-top: 10px;
        font-size: 12px;
        font-weight: normal;
        letter-spacing: 0px;
        line-height: 22px;
    }

    &-container {
        padding: 0px 20px 20px 20px;
        height: calc(100vh - 60px - 20px);
        position: relative;

        .toggle {
            right: 0;
            position: absolute;
        }
    }

    &-header {
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 0px;
        line-height: 26px;
    }

    &-option-container {
        margin-top: 15px;
        display: flex;
        align-items: center;
        position: relative;
        justify-content: space-between;

        & > label {
            max-width: 85%;
        }
        label {
            //width: calc(100% - 32px);
            font-size: 16px;
            font-weight: normal;
            letter-spacing: 0px;
            line-height: 28px;
        }
    }
}
.button-container {
    bottom: 20px;
    width: 100%;
    position: absolute;
    padding-left: inherit;
    padding-right: inherit;
    right: 0;
    left: 0;
}
</style>
