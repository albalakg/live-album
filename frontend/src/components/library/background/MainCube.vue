<template>
    <div class="main-cube" :class="`bg--light-${color} cube-width-${width} cube-height-${height} ${rounded ? 'brs--large' : ''}`" :style="`
    ${left ? `left: ${left};` : ''} ${top ? `top: ${top};` : ''} ${right ? `right: ${right};` : ''} ${bottom ? `bottom: ${bottom};` : ''}
    `">

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MainCube',

    props: {
        color: {
            type: String,
            default: 'green'
        },

        width: {
            type: String,
            default: 'medium'
        },

        height: {
            type: String,
            default: 'medium'
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

        rounded: {
            type: Boolean,
            default: false
        }
    },
});
</script>

<style lang="scss" scoped>
.main-cube {
    opacity: .4;
    position: absolute;
}

.cube-width-small {
    width: 20px;
}

.cube-width-medium {
    width: 40px;
}

.cube-width-large {
    width: 80px;
}

.cube-width-x-large {
    width: 120px;
}

.cube-width-xx-large {
    width: 180px;
}

.cube-width-xxx-large {
    width: 240px;
}

.cube-width-xxxx-large {
    width: 400px;
}

.cube-width-xxxxx-large {
    width: 450px;
}

.cube-height-small {
    height: 20px;
}

.cube-height-medium {
    height: 40px;
}

.cube-height-large {
    height: 80px;
}

.cube-height-x-large {
    height: 120px;
}

.cube-height-xx-large {
    height: 180px;
}

.cube-height-xxx-large {
    height: 240px;
}

.cube-height-xxxx-large {
    height: 400px;
}

.cube-height-xxxxx-large {
    height: 450px;
}

</style>