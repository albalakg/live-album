<template>
    <div class="main-input" :class="{
        'input-error': hasError
    }">
        <p class="title--small">
            {{ title }} <small class="subtitle" v-if="subtitle">({{ subtitle }})</small>
        </p>
        <div class="inner-input padding--x-small shadow--small"
            :class="`brs--${borderRadius} ${readonly ? 'disabled' : ''} ${isFile ? 'pointer' : ''}`" @click="uploadFile()">
            <template v-if="isFile">
                <input v-model="localValue" ref="fileInput" :type="type" :readonly="readonly" :placeholder="placeholder"
                    class="width--full" :hidden="isFile" @change="filePicked()" :accept="allowedFileTypes">
                <div class="input-filler" :class="`input-size-${size}`">
                    <span class="cut-text">
                        {{ uploadedFileName }}
                    </span>
                </div>
            </template>
            <template v-else>
                <input :maxlength="maxLength" v-model="localValue" ref="input" :type="type" :readonly="readonly"
                    :placeholder="placeholder" class="width--full" :class="`input-size-${size}`"
                    @input="updateValue($event?.target?.value)">
            </template>
            <div class="input-icon-wrapper pointer">
                <MainIcon v-if="icon" :icon="icon"/>
            </div>
        </div>
        <small v-if="hint">
            {{ hint }}
        </small>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainIcon from '../general/MainIcon.vue';

export default defineComponent({
    name: 'MainInput',

    components: {
        MainIcon,
    },

    props: {
        icon: {
            type: String
        },

        borderRadius: {
            type: String,
            default: 'small'
        },

        title: {
            type: String
        },

        subtitle: {
            type: String
        },

        hint: {
            type: String
        },

        size: {
            type: String,
            default: 'medium'
        },

        type: {
            type: String,
            default: 'text'
        },

        maxLength: {
            type: Number,
            default: 1000
        },

        placeholder: {
            type: String
        },

        hasError: {
            type: Boolean,
            default: false
        },

        fileExists: {
            type: Boolean,
            default: false
        },

        readonly: {
            type: Boolean,
            default: false
        },

        allowedAssets: {
            type: Array
        },

        modelValue: {
            type: String,
        },
    },

    data() {
        return {
            file: null as null | File
        };
    },

    computed: {
        isFile(): boolean {
            return this.type === 'file';
        },

        isHidden(): boolean {
            return this.type === 'file' || this.readonly;
        },

        allowedFileTypes(): string {
            let allowed = '';

            if (this.allowedAssets?.includes('image')) {
                allowed = 'image/jpeg,image/png,image/webp,image/gif'
            }

            if (this.allowedAssets?.includes('video')) {
                allowed += '/video/mp4,video/quicktime,video/x-msvideo'
            }

            return allowed ? allowed : '*';
        },

        localValue: {
            get(): any {
                return this.modelValue;
            },

            set(value: any) {
                this.$emit('update:modelValue', value);
            },
        },

        uploadedFileName(): string {
            return (this.file)?.name ?? (this.fileExists ? 'קיים קובץ באירוע' : '')
        }
    },

    methods: {
        filePicked() {
            if (!(this.$refs as any).fileInput.files[0]) {
                return;
            }

            this.file = (this.$refs as any).fileInput.files[0];
            // TODO: add validations
            this.$emit('onChange', this.file);
        },

        updateValue(value: any) {
            this.localValue = value;
        },

        uploadFile() {
            if(!this.isFile) {
                return;
            }

            (this.$refs as any).fileInput.click();
        }
    }
});
</script>

<style lang="scss" scoped>
.main-input {
    p {
        margin-bottom: 5px;
    }

    small {
        font-size: 0.7em;
    }

    .subtitle {
        position: relative;
        top: -2px;
        margin-inline-start: 3px;
    }

    .inner-input {
        padding: 10px 15px;
        position: relative;
        background-color: white;

        input {
            font-size: .9em;
            background-color: transparent
        }

        .input-size-small {
            height: 15px;
        }

        .input-size-medium {
            height: 20px;
        }

        .input-size-large {
            height: 25px;
        }

        .input-size-x-large {
            height: 30px;
        }

        .input-icon-wrapper {
            position: absolute;
            top: 7px;
            left: 10px;
        }

        .input-filler {
            min-height: 22px;
            padding-inline-end: 20px;
        }
    }

    .input-error {
        border: 2px solid #f68589;
        background: #f6858988;
    }
}
</style>