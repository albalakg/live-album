<template>
    <div class="mobile-bar bg--pink">
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
            links: [] as IMobileBarItem[]
        }
    },

    created() {
        this.createLinks();
    },

    watch: {
        user() {
            this.createLinks();
        },
        
        isMenuOpen() {
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
    },

    methods: {
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
    height: 60px;
    width: calc(100% - 40px);
    padding: 0 20px;
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10000;
    border-top: 2px solid var(--lightPink);

    .mobile-bar-icon {
        width: 31px;
        height: 31px;
        text-align: center;
        position: relative;
        top: -3px;
    }
}
</style>