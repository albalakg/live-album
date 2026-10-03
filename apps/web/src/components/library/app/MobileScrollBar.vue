<template>
    <div class="mobile-scroll-bar bg--pink">
        <div v-for="(item, index) in items" :key="index" class="mobile-scroll-bar-item display--flex align--center justify--center">
            <router-link :to="item.path">
                <span :class="{
                    'title--small': item.isActive
                }">{{ item.text }}</span>
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IMobileScrollBarItem } from '@/helpers/interfaces'

export default defineComponent({
    name: 'MobileScrollBar',

    props: {
        items: {
            type: Array as PropType<IMobileScrollBarItem[]>,
            required: true
        }
    },
  
});
</script>

<style lang="scss" scoped>
.mobile-scroll-bar {
    height: 60px;
    width: 100%;
    max-width: 100vw;
    overflow-x: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    z-index: 10000;
    padding: 0 5px;
    border-top: 2px solid var(--lightPink);
    position: relative;
    z-index: 100;

    .mobile-scroll-bar-item {
        flex: 0 0 auto;
        padding: 0 10px;

        span {
            font-size: .9em;
            white-space: nowrap;
        }
    }
}
</style>