<template>
    <div class="main-icon" @click="clicked()" :class="{ disabled, 'pointer': clickable }" :style="` ${background ? 'background-color: #fff8;' : ''}`">
        <span class="material-symbols-outlined" :style="`${size ? 'font-size: ' + size + ';' : ''} color: ${color};`">
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
        
        color: {
            type: String,
            default: 'black'
        },

        disabled: {
            type: Boolean,
            default: false
        },

        clickable: {
            type: Boolean,
            default: false
        },

        background: {
            type: Boolean,
            default: true
        },

        size: {
            type: String,
            default: ''
        }
    },

    methods: {
        clicked() {
            if(this.clickable) {
                this.$emit('onClick')
            }
        }
    },
});
</script>

<style scoped lang="scss">
.main-icon {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: inline;
    padding: 1px;

    span {
        position: relative;
        top: 4px;
    }
}
</style>