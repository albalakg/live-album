<template>
    <div class="desktop-bar display--flex justify--center width--full" :class="{
        'bg--pink': isLoggedIn,
        'bg--white': !isLoggedIn
    }">
        <div class="desktop-content display--flex justify--space-between align--center width--page-size">
            <div class="display--flex justify--space-between">
                <DesktopBarLink :link="link" v-for="(link, index) in links" :key="index" />
            </div>
            <div>
                <router-link to="/#header">
                    <span class="title--large" :class="{
                        'text--white': isLoggedIn
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
import { IDesktopBarItem } from '@/helpers/interfaces'

export default defineComponent({
    name: 'DesktopBar',

    components: {
        DesktopBarLink,
    },

    props: {

    },

    data() {
        return {
            links: [] as IDesktopBarItem[]
        }
    },

    created() {
        this.createLinks();
    },

    computed: {
        isLoggedIn(): boolean {
            return false;
        }
    },

    methods: {
        createLinks() {
            this.isLoggedIn ? this.createLoggedLinks() : this.createGuestLinks();
        },

        createLoggedLinks() {
            this.links = [
                {
                    text: 'התנתק',
                    url: '/logout',
                    color: 'white',
                    weight: '800'
                },
                {
                    text: 'מה מקבלים',
                    url: '/#features',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'איך זה עובד',
                    url: '/#how-it-works',
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
            ];
        },

        createGuestLinks() {
            this.links = [
                {
                    text: 'התחבר',
                    url: '/login',
                    color: 'pink',
                    weight: '800'
                },
                {
                    text: 'מה מקבלים',
                    url: '/#features',
                    color: 'dark',
                    weight: '500'
                },
                {
                    text: 'איך זה עובד',
                    url: '/#how-it-works',
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
            ];
        }
    }
});
</script>

<style lang="scss">
.desktop-bar {
    padding: 30px 0;
    position: fixed;
    z-index: 100;
}
</style>