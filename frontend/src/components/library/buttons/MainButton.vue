<template>
    <button class="main-button pointer shadow--small" :class="`padding--${size} bg--light-${color} brs--${borderRadius} ${animation ? 'main-button-animation' : ''} ${disabled ? 'disabled' : ''} ${loading ? 'main-button-loading' : ''}`" @click="onClick()">
        <div class="inner-button text--center" :class="`bg--${color} padding--${getInnerSize} brs--${getInnerBorderRadius}`">
            <span class="title--medium text--white" v-if="loading">
                טוען...
            </span>
            <span class="title--medium text--white" v-else>
                {{ text }}
            </span>
        </div>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MainButton',

    props: {
        disabled: {
            type: Boolean,
            default: false
        },

        color: {
            type: String,
            default: 'green'
        },

        borderRadius: {
            type: String,
            default: 'medium'
        },

        text: {
            type: String,
            required: true
        },

        animation: {
            type: Boolean,
            default: false
        },

        loading: {
            type: Boolean,
            default: false
        },

        size: {
            type: String,
            default: 'x-small'
        },
    },

    data() {
        return {

        };
    },

    computed: {
        getInnerBorderRadius(): string {
            if (this.borderRadius === 'x-large') {
                return 'large';
            }

            if (this.borderRadius === 'large') {
                return 'medium';
            }

            return 'small';
        },

        getInnerSize(): string {
            return this.size;
        },
    },

    methods: {
        onClick() {
            this.$emit('onClick');
        }
    }
});
</script>

<style lang="scss" scoped>
.main-button {
    width: 100%;
    transition: .3s scale linear;
    z-index: 2;
    position: relative;
}

.main-button:focus {
    scale: 1.03;
}

.main-button-loading {
    pointer-events: none;
    opacity: .6;
}

.main-button-animation {
    transition: .3s transform linear, .3s scale linear;

    &:hover {
        transform: translateY(3px);
        scale: 1.02;
    }
}
</style>