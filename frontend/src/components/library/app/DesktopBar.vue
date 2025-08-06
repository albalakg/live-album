<template>
    <div class="desktop-bar display--flex justify--center width--full" :class="{
        'bg--pink': hasActiveEvent,
        'bg--white': !hasActiveEvent
    }">
        <div class="desktop-content display--flex justify--space-between align--center width--page-size">
            <div class="display--flex justify--space-between">
                <DesktopBarLink :link="link" v-for="(link, index) in links" :key="index" />
            </div>
            <div>
                <router-link to="/#header">
                    <span class="title--large" :class="{
                        'text--white': hasActiveEvent
                    }">
                        SnapShare
                    </span>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DesktopBarLink from './DesktopBarLink.vue';
import { IDesktopBarItem, IUserInfo } from '@/helpers/interfaces'

export default defineComponent({
    name: 'DesktopBar',

    components: {
        DesktopBarLink,
    },

    data() {
        return {
            links: [] as IDesktopBarItem[]
        }
    },

    created() {
        this.createLinks();
    },
    
    watch: {
        user() {
            this.createLinks();
        }
    },

    computed: {
        user(): IUserInfo | null {
            return this.$store.getters['user/getUser'];
        },
        
        hasActiveEvent(): boolean {
            return this.$store.getters['event/hasActiveEvent'];
        }
    },

    methods: {
        createLinks() {
            this.hasActiveEvent ? this.createSubscribedLinks() : this.createBaseLinks();
        },

        createSubscribedLinks() {
            this.links = [
                {
                    text: 'התנתק',
                    url: '/logout',
                    color: 'white',
                    weight: '800'
                },
                {
                    text: 'האירוע',
                    url: '/event',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'פרופיל',
                    url: '/profile',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'צור קשר',
                    url: '/contact-us',
                    color: 'dark',
                    weight: '500'
                },
            ];
        },

        createBaseLinks() {
            this.links = [
                {
                    text: 'מה מקבלים',
                    url: '/#features',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'למי זה מתאים',
                    url: '/#who-is-it-for',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'איך זה נראה',
                    url: '/#how-it-looks',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'המסלולים',
                    url: '/#pricing',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'צור קשר',
                    url: '/contact-us',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'הזמנה',
                    url: '/order',
                    color: 'dark',
                    weight: '500'
                },
            ];

            if(this.user) {
                this.links.unshift({
                    text: 'התנתק',
                    url: '/logout',
                    color: 'pink',
                    weight: '800'
                })
                this.links.push({
                    text: 'פרופיל',
                    url: '/profile',
                    color: 'dark',
                    weight: '500'
                })
            } else {
                this.links.unshift({
                    text: 'התחבר',
                    url: '/login',
                    color: 'pink',
                    weight: '800'
                })
            }
        }
    }
});
</script>

<style lang="scss" scoped>
.desktop-bar {
    position: fixed;
    z-index: 100;
}
</style>