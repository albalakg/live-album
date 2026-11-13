<template>
    <button
        type="button"
        class="main-button"
        :class="{
            disabled,
            'main-button-loading': loading,
            'main-button-readonly': readonly,
            'main-button-animation': animation,
        }"
        :tabindex="tabIndex"
        :disabled="disabled || loading"
        @click="onClick()"
    >
        <span>{{ loading ? 'טוען...' : text }}</span>
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
/* Match marketing homepage .btn.btn-primary */
.main-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin: 0;
    border: 0;
    cursor: pointer;
    text-decoration: none;
    font-family: inherit;
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
    line-height: 1.2;
    border-radius: 999px;
    padding: 14px 28px;
    min-height: 52px;
    white-space: nowrap;
    box-sizing: border-box;
    color: #fff;
    background: linear-gradient(
        135deg,
        var(--accent-2, #dc5b66),
        var(--accent, #c9a36a)
    );
    box-shadow: 0 10px 28px var(--glow, rgba(201, 163, 106, 0.45));
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    position: relative;
    z-index: 2;
}

.main-button:hover:not(.disabled):not(.main-button-loading):not(.main-button-readonly) {
    transform: translateY(-2px);
}

.main-button:active:not(.disabled):not(.main-button-loading):not(.main-button-readonly) {
    transform: translateY(0);
}

.main-button:focus-visible {
    outline: 3px solid var(--accent-2, #dc5b66);
    outline-offset: 3px;
}

.main-button-loading {
    pointer-events: none;
    opacity: 0.6;
}

.main-button-readonly {
    cursor: auto;
    pointer-events: none;
}

.main-button.disabled {
    opacity: 1;
    cursor: not-allowed;
    color: #5e564e;
    background: rgba(22, 19, 16, 0.1);
    box-shadow: none;
}

.main-button-animation {
    transition: 0.3s transform linear, 0.3s scale linear;

    &:hover:not(.disabled):not(.main-button-loading):not(.main-button-readonly) {
        transform: translateY(3px);
        scale: 1.02;
    }
}
</style>
