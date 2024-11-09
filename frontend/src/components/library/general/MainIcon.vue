<template>
    <div class="main-icon" @click="clicked()" :class="{ disabled }">
        <span class="material-symbols-outlined">
            {{ icon }}
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "MainIcon",

    props: {
        icon: {
            type: String,
            required: true
        },

        disabled: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        clicked() {
            this.$emit('onClick')
        }
    },
});
</script>

<style scoped lang="scss">
.main-icon {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #fff8;

    span {
        position: relative;
        top: 3px;
        left: -3px;
    }
}
</style>