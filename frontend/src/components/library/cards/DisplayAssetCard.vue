<template>
    <div class="display-asset-card width--90-mobile"
        :class="`${left || right || top || bottom ? 'position--absolute' : 'position--relative'} ${$bp.isMobile ? 'display-asset-card-mobile' : ''}`"
        :style="`${left ? `left: ${left};` : ''} ${top ? `top: ${top};` : ''} ${right ? `right: ${right};` : ''} ${bottom ? `bottom: ${bottom};` : ''}`">
        <p v-if="title">
            {{ title }}
        </p>
        <div class="asset-wrapper bg--dark brs--large shadow--small"
            :class="`display-asset-card-width-${width} display-asset-card-height-${height}`">
            <img class="width--full height--full brs--large" :src="src" alt="">
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
        },

        height: {
            type: String,
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

        src: {
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
.display-asset-card-mobile {
    margin-top: 20px;
}

.display-asset-card {
    z-index: 3;

    img {
        object-fit: cover;
    }

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

    .display-asset-card-height-xxx-large {
        height: 80vh;
    }
}
</style>