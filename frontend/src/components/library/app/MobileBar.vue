<template>
    <div class="mobile-bar bg--pink" :style="mobileBarStyle">
        <div v-for="(link, index) in links" :key="index" class="mobile-bar-icon display--flex align--center justify--center" @click="iconAction(link)">
            <MainIcon size="1.9em" :background="false" :icon="link.icon" color="#222" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IMobileBarItem } from '@/helpers/interfaces'
import MainIcon from '../general/MainIcon.vue';

export default defineComponent({
    name: 'MobileBar',

    components: {
        MainIcon,
    },

    data() {
        return {
            links: [] as IMobileBarItem[],
            viewportTop: null as number | null,
            positionFrame: 0,
        }
    },

    created() {
        this.createLinks();
    },

    mounted() {
        this.scheduleMobileBarPositionUpdate();
        window.addEventListener('resize', this.scheduleMobileBarPositionUpdate);
        window.addEventListener('scroll', this.scheduleMobileBarPositionUpdate, { passive: true });
        window.visualViewport?.addEventListener('resize', this.scheduleMobileBarPositionUpdate);
        window.visualViewport?.addEventListener('scroll', this.scheduleMobileBarPositionUpdate);
    },

    beforeUnmount() {
        window.removeEventListener('resize', this.scheduleMobileBarPositionUpdate);
        window.removeEventListener('scroll', this.scheduleMobileBarPositionUpdate);
        window.visualViewport?.removeEventListener('resize', this.scheduleMobileBarPositionUpdate);
        window.visualViewport?.removeEventListener('scroll', this.scheduleMobileBarPositionUpdate);

        if (this.positionFrame) {
            cancelAnimationFrame(this.positionFrame);
        }
    },

    watch: {
        user() {
            this.createLinks();
        },
        
        isMenuOpen() {
            this.createLinks();
        },

        hasActiveEvent() {
            this.createLinks();
        },
    },

    computed: {
        user(): boolean {
            return this.$store.getters['user/getUser'];
        },

        hasActiveEvent(): boolean {
            return this.$store.getters['event/hasActiveEvent'];
        },
        
        isMenuOpen(): boolean {
            return this.$store.getters['app/getMenuState'];
        },
        
        menuIcon(): string {
            return this.isMenuOpen ? "close" : "menu";
        },

        mobileBarStyle(): Record<string, string> {
            if (this.viewportTop === null) {
                return {
                    bottom: '0',
                };
            }

            return {
                top: `${this.viewportTop}px`,
                bottom: 'auto',
            };
        },
    },

    methods: {
        scheduleMobileBarPositionUpdate() {
            if (this.positionFrame) {
                cancelAnimationFrame(this.positionFrame);
            }

            this.positionFrame = requestAnimationFrame(this.updateMobileBarPosition);
        },

        updateMobileBarPosition() {
            this.positionFrame = 0;

            const viewport = window.visualViewport;
            if (!viewport) {
                this.viewportTop = null;
                return;
            }

            const barHeight = (this.$el as HTMLElement)?.offsetHeight || 60;
            this.viewportTop = Math.max(0, viewport.offsetTop + viewport.height - barHeight);
        },

        iconAction(link: IMobileBarItem) {
            if(link.url.includes('menu')) {
                this.$store.dispatch("app/toggleMenu");
                return;
            }

            this.$router.push(link.url);            
        },

        createLinks() {
            this.hasActiveEvent ? this.createSubscribedLinks() : this.createBaseLinks();
        },

        createSubscribedLinks() {
            this.links = [
                {
                    url: '?menu',
                    icon: this.menuIcon,
                    color: 'dark',
                },
                {
                    url: '/contact-us',
                    icon: 'contact_support',
                    color: 'dark',
                },
                {
                    url: '/event',
                    icon: 'event',
                    color: 'dark',
                },
                {
                    url: '/',
                    icon: 'house',
                    color: 'dark',
                },
                {
                    url: '/profile',
                    icon: 'account_circle',
                    color: 'dark',
                },
               
            ];
        },

        createBaseLinks() {
            this.links = [
            {
                    url: '?menu',
                    icon: 'menu',
                    color: 'dark',
                },
                {
                    url: '/order',
                    icon: 'storefront',
                    color: 'dark',
                },
                {
                    url: '/',
                    icon: 'house',
                    color: 'dark',
                },
                {
                    url: '/contact-us',
                    icon: 'contact_support',
                    color: 'dark',
                },
            ];

            if (this.user) {
                this.links.push({
                    url: '/profile',
                    icon: 'account_circle',
                    color: 'dark',
                })
            } else {
                this.links.push({
                    url: '/login',
                    icon: 'account_circle',
                    color: 'pink',
                })
            }
        }
    }
});
</script>

<style lang="scss" scoped>
.mobile-bar {
    box-sizing: border-box;
    height: calc(60px + env(safe-area-inset-bottom, 0px));
    width: 100%;
    padding: 0 20px env(safe-area-inset-bottom, 0px);
    position: fixed;
    bottom: 0;
    left: 0;
    background-color: var(--pink);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10000;
    border-top: 2px solid var(--lightPink);
    transform: translateZ(0);
    will-change: top;

    .mobile-bar-icon {
        width: 31px;
        height: 31px;
        text-align: center;
        position: relative;
        top: -3px;
    }
}
</style>