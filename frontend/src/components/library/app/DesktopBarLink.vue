<template>
    <div class="desktop-link">
        <router-link :to="link.url" :class="`text--${link.color} ${isActive ? 'text--shadow text--bold' : ''}`"
            :style="`${!isActive ? 'font-weight: ' + getFontWeight : ''}`">
            {{ link.text }}
        </router-link>

    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IDesktopBarItem } from '@/helpers/interfaces'

export default defineComponent({
    name: 'MobileBar',

    props: {
        link: {
            type: Object as PropType<IDesktopBarItem>,
            required: true
        }
    },

    computed: {
        getFontWeight(): string {
            return this.link.weight ?? '500';
        },

        isActive(): boolean {
            return this.$route.fullPath.includes(this.link.url)
        },
    }
});
</script>

<style lang="scss" scoped>
.desktop-link {
    margin-inline-end: 60px;
}
</style>