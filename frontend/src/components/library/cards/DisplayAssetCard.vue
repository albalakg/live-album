<template>
    <div class="display-asset-card"
        :style="`${left ? `left: ${left};` : ''} ${top ? `top: ${top};` : ''} ${right ? `right: ${right};` : ''} ${bottom ? `bottom: ${bottom};` : ''}`">
        <p v-if="title">
            {{ title }}
        </p>
        <div class="asset-wrapper bg--dark brs--large shadow--small"
            :class="`display-asset-card-width-${width} display-asset-card-height-${height}`">
            <!-- <img src="" alt=""> -->
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "DisplayAssetCard",

    props: {
        width: {
            type: String,
            default: 'medium'
        },

        height: {
            type: String,
            default: 'medium'
        },

        title: {
            type: String,
            default: ''
        },

        left: {
            type: String,
            default: ''
        },

        top: {
            type: String,
            default: ''
        },

        right: {
            type: String,
            default: ''
        },

        bottom: {
            type: String,
            default: ''
        },
    },

    methods: {
        clicked() {
            this.$emit('onClick')
        }
    },
});
</script>

<style scoped lang="scss">
.display-asset-card {
    position: absolute;

    p {
        font-weight: 700;
        margin-bottom: 4px;
    }

    .display-asset-card-width-small {
        width: 10vw;
    }

    .display-asset-card-width-medium {
        width: 20vw;
    }

    .display-asset-card-width-large {
        width: 30vw;
    }

    .display-asset-card-width-x-large {
        width: 40vw;
    }

    .display-asset-card-height-small {
        height: 10vh;
    }

    .display-asset-card-height-medium {
        height: 20vh;
    }

    .display-asset-card-height-large {
        height: 30vh;
    }

    .display-asset-card-height-x-large {
        height: 40vh;
    }
}
</style>