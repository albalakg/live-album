<template>
    <div class="switch" :class="{disabled}">
        <input ref="input" :id="`switch-${uniqueId}`" type="checkbox" class="switch-input"
            :class="`switch-input-${color}`" @click="submit()" />
        <label :for="`switch-${uniqueId}`" class="switch-label">Switch</label>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MainCheckbox',

    props: {
        text: {
            type: String
        },

        color: {
            type: String,
            default: 'green'
        },

        disabled: {
            type: Boolean,
            default: false
        },
    },

    computed: {
        uniqueId(): number {
            return Math.random()
        }
    },

    methods: {
        submit() {
            this.$emit('onClick');
        },

        toggle() {
            (this.$refs.input as any).click();
        }
    }
});
</script>

<style lang="scss" scoped>
.switch {
    position: relative;
    display: inline-block;
}

.switch-input {
    display: none;
}

.switch-label {
    display: block;
    width: 48px;
    height: 24px;
    text-indent: -150%;
    clip: rect(0 0 0 0);
    color: transparent;
    user-select: none;
}

.switch-label::before,
.switch-label::after {
    content: "";
    display: block;
    position: absolute;
    cursor: pointer;
}

.switch-label::before {
    width: 100%;
    height: 100%;
    background-color: #dedede;
    border-radius: 9999em;
    -webkit-transition: background-color 0.25s ease;
    transition: background-color 0.25s ease;
}

.switch-label::after {
    top: 0;
    left: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.45);
    -webkit-transition: left 0.25s ease;
    transition: left 0.25s ease;
}

.switch-input-green:checked+.switch-label::before {
    background-color: var(--green);
}

.switch-input-pink:checked+.switch-label::before {
    background-color: var(--pink);
}

.switch-input:checked+.switch-label::after {
    left: 24px;
}
</style>