<template>
    <div class="main-input" :class="{
        'input-error': hasError
    }">
        <p class="title--small">
            {{ title }} <small class="subtitle" v-if="subtitle">({{ subtitle }})</small>
        </p>
        <div class="inner-input padding--x-small"
            :class="`brs--${borderRadius} ${readonly ? 'disabled' : ''} ${isFile ? 'pointer' : ''}`" @click="uploadFile()">
            <template v-if="isFile">
                <input v-model="localValue" ref="fileInput" :type="type" :readonly="readonly" :placeholder="placeholder"
                    class="width--full" :hidden="isFile" @change="filePicked()" :accept="allowedFileTypes"
                    :tabindex="tabIndex">
                <div class="input-filler" :class="`input-size-${size}`">
                    <span class="cut-text">
                        {{ uploadedFileName }}
                    </span>
                </div>
            </template>
            <template v-else>
                <input :autocomplete="autocomplete" :maxlength="maxLength" v-model="localValue" ref="input" :type="type" :readonly="readonly"
                    :placeholder="placeholder" class="width--full" :class="`input-size-${size}`"
                    :tabindex="tabIndex"
                    @input="updateValue($event?.target?.value)">
            </template>
            <div class="input-icon-wrapper pointer">
                <MainIcon v-if="icon" :icon="icon"/>
                <MainIcon clickable v-if="deleteable" icon="close" @onClick="deleteValue" />
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

        autocomplete: {
            type: String,
            default: ""
        },

        tabIndex: {
            type: Number,
            default: undefined
        },

        hasError: {
            type: Boolean,
            default: false
        },

        fileExists: {
            type: Boolean,
            default: false
        },

        deleteable: {
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
            type: [String, Number, File, null],
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
        },

        deleteValue(event: MouseEvent) {
            event.stopPropagation();
            this.file = null;
            this.localValue = '';
            this.$emit('onDelete');
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
        background-color: #fffcfa;
        border: 1px solid rgba(22, 19, 16, 0.16);
        border-radius: 14px;
        box-shadow: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;

        &:focus-within {
            border-color: #8a7040;
            box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.35);
        }

        input {
            font-size: 1em;
            background-color: transparent;
            border: 0;
            outline: none;
            box-shadow: none;

            /* Chrome autofill paints a light-blue box on the inner <input>;
               stretch an inset shadow in the field background so the control
               still reads as one clean box. */
            &:-webkit-autofill,
            &:-webkit-autofill:hover,
            &:-webkit-autofill:focus,
            &:-webkit-autofill:active,
            &:autofill {
                -webkit-box-shadow: 0 0 0 1000px #fffcfa inset !important;
                box-shadow: 0 0 0 1000px #fffcfa inset !important;
                -webkit-text-fill-color: #161310 !important;
                caret-color: #161310;
                background-color: transparent !important;
                background-image: none !important;
                transition: background-color 99999s ease-in-out 0s;
            }
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

    &.input-error .inner-input {
        border-color: #c94a56;
        box-shadow: 0 0 0 3px rgba(220, 91, 102, 0.22);
        background: rgba(220, 91, 102, 0.06);
    }
}
</style>