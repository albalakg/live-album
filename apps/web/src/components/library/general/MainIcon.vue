<template>
    <div class="main-icon" @click="clicked" :class="{ disabled, 'pointer': clickable, 'animate': animation, 'colored': background }" :style="`background-color: ${bgColor};`">
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
        
        bgColor: {
            type: String,
            default: 'transparent'
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

        animation: {
            type: Boolean,
            default: false
        },

        size: {
            type: String,
            default: ''
        }
    },

    methods: {
        clicked(event: MouseEvent) {
            if(this.clickable) {
                this.$emit('onClick', event)
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

.colored {
    background-color: #fff8;
}

.animate {
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #fff !important;
    }
}
</style>