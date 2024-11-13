<template>
    <div class="main-button pointer shadow--small" :class="`padding--${size} bg--light-${color} brs--${borderRadius} ${animation ? 'main-button-animation' : ''}`">
        <div class="inner-button text--center" :class="`bg--${color} padding--${getInnerSize} brs--${getInnerBorderRadius}`">
            <span class="title--medium text--white">
                {{ text }}
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MainButton',

    props: {
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

        size: {
            type: String,
            default: 'x-small'
        }
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

    }
});
</script>

<style lang="scss" scoped>
.main-button-animation {
    transition: .3s transform linear, .3s scale linear;

    &:hover {
        transform: translateY(3px);
        scale: 1.02;
    }
}
</style>