<template>
    <div class="main-textarea">
        <p class="title--small">
            {{ title }}
        </p>
        <div class="inner-textarea padding--x-small shadow--small"
            :class="`brs--${borderRadius} ${readonly ? 'disabled' : ''}`">
            <textarea :maxLength="maxLength" :rows="rows" v-model="value" ref="textarea" :readonly="readonly" :placeholder="placeholder"
                    class="width--full" @input="updateValue($event?.target?.value)" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'MainTextArea',

    components: {
    },

    props: {
        borderRadius: {
            type: String,
            default: 'small'
        },

        title: {
            type: String
        },

        maxLength: {
            type: Number,
            default: 1000
        },

        rows: {
            type: Number,
            default: 5
        },

        placeholder: {
            type: String
        },

        readonly: {
            type: Boolean,
            default: false
        },
        
        modelValue: {
            type: String,
        },
    },

    data() {
        return {
        };
    },

    computed: {
        localValue: {
            get(): any {
                return this.modelValue;
            },

            set(value: any) {
                this.$emit('update:modelValue', value);
            },
        },
    },

    methods: {
        updateValue(value: any) {
            this.localValue = value;
        },
    }
});
</script>

<style lang="scss" scoped>
.main-textarea {
    p {
        margin-bottom: 5px;
    }

    .inner-textarea {
        padding: 10px 15px;
        position: relative;
        background-color: white;

        textarea {
            font-size: .9em;
            background-color: white;
            outline: none;
            border: none;
            resize: none;
        }

        .textarea-icon-wrapper {
            position: absolute;
            top: 7px;
            left: 10px;
        }

        .textarea-filler {
            min-height: 22px;
        }
    }
}
</style>