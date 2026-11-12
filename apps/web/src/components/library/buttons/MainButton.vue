<template>
    <button class="main-button pointer shadow--small" :class="`padding--${size} bg--light-${color} brs--${borderRadius} ${animation ? 'main-button-animation' : ''} ${disabled ? 'disabled' : ''} ${loading ? 'main-button-loading' : ''} ${readonly ? 'main-button-readonly' : ''}`" :tabindex="tabIndex" @click="onClick()">
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

        readonly: {
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

        tabIndex: {
            type: Number,
            default: undefined
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
            if(this.readonly || this.disabled || this.loading) {
                return;
            }

            this.$emit('onClick');
        }
    }
});
</script>

<style lang="scss" scoped>
.main-button {
    width: 100%;
    transition: transform .2s ease;
    z-index: 2;
    position: relative;
    border-radius: 999px;
    background: transparent;
    box-shadow: none;
    /* Match GoogleSignInButton height: neutralize nested utility padding */
    padding: 0 !important;
}
.main-button .inner-button {
    background: linear-gradient(135deg, #dc5b66, #c9a36a) !important;
    border-radius: 999px !important;
    box-shadow: 0 10px 28px rgba(220, 91, 102, 0.28);
    /* Same vertical rhythm as .google-sign-in-button (14px 18px + border) */
    padding: 14px 18px !important;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.main-button:focus {
    scale: 1.03;
}

.main-button-loading {
    pointer-events: none;
    opacity: .6;
}

.main-button-readonly {
    cursor: auto;
    pointer-events: none;
}

.main-button-animation {
    transition: .3s transform linear, .3s scale linear;

    &:hover {
        transform: translateY(3px);
        scale: 1.02;
    }
}
</style>