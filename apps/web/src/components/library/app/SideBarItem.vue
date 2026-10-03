<template>
    <div class="side-bar-item brs--small padding--medium pointer" :class="{
        'bg--pink': item.isActive,
        'bg--white': !item.isActive
    }">
        <span :class="{
            'text--white title--small': item.isActive
        }">
            {{ item.text }}
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'SideBarItem',

    props: {
        item: {
            type: Object,
            required: true
        }
    },
});
</script>

<style lang="scss" scoped>
.side-bar-item {
    width: calc(100% - 16px);

    span {
        font-weight: 500;
    }
}
</style>