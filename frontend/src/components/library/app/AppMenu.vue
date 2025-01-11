<template>
    <div></div>
    <!-- App Menu -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IMobileBarItem } from '@/helpers/interfaces'

export default defineComponent({
    name: 'AppMenu',


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
        }
    },

    computed: {
        isMenuOpen(): boolean {
            return this.$store.getters['app/getMenuState'];
        },

        user(): boolean {
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
                    url: 'menu',
                    icon: 'menu',
                    color: 'dark',
                },
                {
                    url: '/contact-us',
                    icon: 'contact-us',
                    color: 'dark',
                },
                {
                    url: '/',
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
                    icon: 'profile',
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
                    url: '/contact-us',
                    icon: 'contact-us',
                    color: 'dark',
                },
                {
                    url: '/home',
                    icon: 'home',
                    color: 'dark',
                },
                {
                    url: '/order',
                    icon: 'order',
                    color: 'dark',
                },
            ];

            if (this.user) {
                this.links.push({
                    url: '/profile',
                    icon: 'profile',
                    color: 'dark',
                })
            } else {
                this.links.push({
                    url: '/login',
                    icon: 'login',
                    color: 'pink',
                })
            }
        }
    }
});
</script>

<style lang="scss" scoped>

</style>