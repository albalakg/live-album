<template>
    <div class="main-button pointer shadow--small text--center"
        :class="`padding--${size} bg--${color} brs--${borderRadius}`">
        <span class="title--small" :class="`text--${textColor}`" >
            {{ text }}
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseButton',

    props: {
        color: {
            type: String,
            default: 'green'
        },

        borderRadius: {
            type: String,
            default: 'small'
        },

        text: {
            type: String,
            required: true
        },

        textColor: {
            type: String,
            default: 'white'
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
.main-button {
    width: 100%;
}

.main-button-animation {
    transition: .3s transform linear, .3s scale linear;

    &:hover {
        transform: translateY(3px);
        scale: 1.02;
    }
}
</style>