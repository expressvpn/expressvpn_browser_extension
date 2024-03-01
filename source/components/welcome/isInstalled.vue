<!--
ExpressVPN Browser Extension:
Copyright 2017-2024 Express VPN International Ltd
Licensed GPL v2
-->
<template lang="html">
    <div class="isInstalled">
        <img
            v-svg-inline
            class="logo"
            src="/images/logo.svg"
            height="32"
            width="40"
            viewbox="0 0 128 128"
        />
        <transition name="fade" mode="out-in">
            <div
                class="isInstalled-content"
                :key="scene"
                style="transition-duration: 0.9s"
            >
                <img class="illustration" :src="currentImgSrc" />
                <p v-html="currentText"></p>
            </div>
        </transition>

        <div class="button-container">
            <div class="dots" v-if="!(scene === 3 && isFirefox)">
                <div
                    v-for="index in 3"
                    :key="index"
                    :class="['dot', `${scene === index ? 'active' : ''}`]"
                />
            </div>
            <button class="primary" @click="onContinue">
                {{ primaryButtonLabel }}
            </button>
            <button
                class="secondary"
                @click="onSecondaryClick"
            >
                {{ secondaryButtonLabel }}
            </button>
        </div>
    </div>
</template>

<script type="text/javascript">
export default {
    name: 'isInstalled',
    data() {
        return {
            hasAllUrlsPermission: false,
            isFirefox: false,
            scene: 1,
        };
    },
    methods: {
        async onSecondaryClick() {
            // User clicked NO thanks on the location spoofing permission page
            if (this.isFirefox && this.scene === 3) {
                const storage = await chrome.storage.local.get('prefs');
                let prefs = this.utils.defaultPreferences;

                if (typeof storage.prefs === 'object') {
                    prefs = { ...prefs, ...storage.prefs };
                }
                prefs.hideLocation = false;
                chrome.storage.local.set({ prefs });
            }
            this.$parent.$emit('showImproveExpressVPN');
        },
        async onContinue() {
            if (this.isFirefox && this.scene === 3) {
                // We're in the location spoofing onboarding screen -> Do a permission prompt
                const permissionResponse = await browser.permissions.request({origins: ['<all_urls>']});
                if (permissionResponse === true) {
                    this.incScene();
                }
            } else {
                this.incScene();
            }
        },
        incScene() {
            // If the Firefox user has already permissions for all_urls, then skip the screen 3
            if (this.scene === 3 || this.isFirefox && this.scene === 2 && this.hasAllUrlsPermission) {
                this.$parent.$emit('showImproveExpressVPN');
            } else {
                this.scene += 1;
            }
        },
    },
    computed: {
        primaryButtonLabel() {
            return this.localize(this.isFirefox && this.scene === 3 ? 'welcome_screen3_firefox_ok_button' : 'welcome_continue_button_label');
        },
        secondaryButtonLabel() {
            return this.localize(this.isFirefox && this.scene === 3 ? 'welcome_screen3_firefox_no_thanks_button' : 'welcome_skip_button_label');
        },
        currentImgSrc() {
            let imgSrc = `/images/illustrations/welcome_isInstalled_${this.scene}.svg`;
            if (this.scene === 1 && this.currentInfo.os === 'LINUX') {
                imgSrc =
                    '/images/illustrations/welcome_isInstalled_linux_1.svg';
            }
            return imgSrc;
        },
        currentText() {
            let text = this.localize(`welcome_screen${this.scene}_p1_text`);
            if (this.scene === 3) {
                text += `<br><a target="_blank" href="${
                    this.currentInfo.website_url
                }/support/vpn-setup/expressvpn-browser-extension?utm_source=browser_extension&utm_medium=apps&utm_campaign=browser_extension_links&utm_content=welcome">
            ${this.localize('welcome_screen3_learn_more_text')}
          </a>`;
                if (this.isFirefox) {
                    text = `<div style='text-align: left;'>
                        <h4>${this.localize('welcome_screen3_firefox_title_text')}</h4>
                        <p>${this.localize('welcome_screen3_firefox_p1_text')}</p>
                        <p>${this.localize('welcome_screen3_firefox_p2_text')}</p>
                    </div>`;
                }
            }
            return text;
        },
    },
    async mounted() {
        this.isFirefox = this.browserInfo.name === 'Firefox';
        if (this.isFirefox) {
            const permissions = await browser.permissions.getAll();
            this.hasAllUrlsPermission = permissions.origins.includes('<all_urls>');
        }
    },
};
</script>

<style lang="scss" scoped>
.isInstalled {
    position: relative;
    height: 100%;

    &-content {
        text-align: center;

        p {
            //font-family: Inter-Regular;
            font-size: 16px;
            letter-spacing: 0px;
            line-height: 28px;
        }
    }

    .dots {
        margin: 22px 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .dot {
            height: 8px;
            width: 8px;
            background-color: var(--dot-bg);
            border-radius: 50%;
            display: inline-block;

            &.active {
                background-color: $eds-color-brand;
            }
            &:not(:nth-child(5)) {
                margin-right: 10px;
            }
        }
    }
}

.logo {
    margin-bottom: 30px;
}

.button-container {
    width: 100%;
    position: absolute;
    bottom: 0px;

    button:nth-of-type(n + 2) {
        margin-top: 15px;
    }
}
</style>
<style lang="scss">
@media (prefers-color-scheme: light) {
    .isInstalled {
        --dot-bg: #{$eds-color-sand-20};
    }
}
@media (prefers-color-scheme: dark) {
    .isInstalled {
        --dot-bg: #{$eds-color-sand-20};

        .logo path {
            fill: $eds-color-grey-40;
        }
    }
}
</style>
