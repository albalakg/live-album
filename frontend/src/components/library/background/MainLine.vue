<template>
    <div class="main-line" :class="`bg--${color} line-width-${width} line-height-${height}`" :style="`${left ? `left: ${left};` : ''} ${top ? `top: ${top};` : ''} ${right ? `right: ${right};` : ''} ${opacity ? `opacity: ${opacity};` : ''}`">

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MainLine',

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
            default: 'full'
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

        opacity: {
            type: String,
            default: ''
        },
    },
});
</script>

<style lang="scss" scoped>
.main-line {
    position: absolute;
}

.line-width-x-small {
    width: 2px;
}

.line-width-small {
    width: 6px;
}

.line-width-medium {
    width: 10px;
}

.line-width-large {
    width: 20px;
}

.line-width-x-large {
    width: 40px;
}

.line-width-xx-large {
    width: 60px;
}

.line-width-xxx-large {
    width: 90px;
}

.line-width-xxxx-large {
    width: 130px;
}

.line-width-full {
    width: 100%;
}

.line-height-x-small {
    height: 3px
}

.line-height-small {
    height: 6px
}

.line-height-medium {
    height: 10px;
}

.line-height-large {
    height: 20px;
}

.line-height-x-large {
    height: 40px;
}

.line-height-xx-large {
    height: 75px;
}

.line-height-xxx-large {
    height: 100px;
}

.line-height-full {
    height: 100%;
}
</style>