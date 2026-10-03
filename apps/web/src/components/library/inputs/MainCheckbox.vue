<template>
    <div v-if="$bp.isMediumAndUp" class="switch" :class="{ disabled }">
        <input ref="input" :id="`switch-${uniqueId}`" type="checkbox" class="switch-input"
            :class="`switch-input-${color}`" @click="submit()" />
        <label :for="`switch-${uniqueId}`" class="switch-label">Switch</label>
    </div>
    <div v-else class="switch-mobile" @click="submit()">
        <input ref="input" type="checkbox" class="switch-input-mobile" />
        <div class="switch-light-mobile" :class="{
            'switch-light-on-mobile': value
        }"></div>
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

        value: {
            type: Boolean,
            default: false
        },
    },

    computed: {
        uniqueId(): number {
            return Math.random()
        },
    },

    mounted() {
        (this.$refs.input as any).checked = this.value;
    },

    watch: {
        value() {
            (this.$refs.input as any).checked = this.value;
        }
    },

    methods: {
        submit() {
            this.$emit('onClick');
        },

        toggle() {
            (this.$refs.input as any)?.click();
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
    position: relative;
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
    width: 22px;
    height: 22px;
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

.switch-mobile {
    border-radius: 50%;
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    border: 1px solid var(--green);
    display: block;
    position: relative;
    box-shadow: inset 0 0 5px 1px #0003;
    padding: 2px;
    cursor: pointer;
    
    .switch-input-mobile {
        display: none;
    }
    
    .switch-light-mobile {
        border-radius: 50%;
        height: 100%;
        width: 100%;
        background-color: #fff;
        transition: .2s background-color linear;
    }

    .switch-light-on-mobile {
        background-color: var(--green);
    }
}
</style>