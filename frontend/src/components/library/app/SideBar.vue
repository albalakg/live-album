<template>
    <div class="sidebar bg--gray brs--medium padding--large">
        <div class="event-image bg--dark brs--medium" :style="`background-image: url(${eventImage})`">
            <!-- <img class="width--full height--full brs--medium" :src="eventImage" alt="תמונת האירוע"> -->
        </div>
        <br>
        <div class="text--center">
            <h2 class="text--dark title--medium">
                האירוע של
                <br>
                <span class="text--pink title--medium">
                    {{ eventName }}
                </span>
            </h2>
        </div>
        <br>
        <div>
            <div v-for="(item, index) in items" :key="index" class="side-bar-item-wrapper">
                <router-link :to="item.path">
                    <SideBarItem :item="item" />
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SideBarItem from './SideBarItem.vue';

export default defineComponent({
    name: 'SideBar',
    
    components: {
        SideBarItem,
    },

    props: {
        items: {
            type: Array,
            required: true
        }
    },

    computed: {
        eventImage(): string {
            return this.$store.getters['event/getEventImage'];
        },

        eventName(): string {
            return this.$store.getters['event/getEventName'];
        },
    }
});
</script>

<style lang="scss" scoped>
.sidebar {
    width: calc(100% - 40px);
    height: calc(100% - 40px);

    .event-image {
        width: 100%;
        height: 30%;
        background-position: center;
        background-size: cover;
    }

    .side-bar-item-wrapper {
        margin-bottom: 15px;
    }
}
</style>