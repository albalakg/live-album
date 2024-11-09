<template>
    <div class="main-input">
        <p class="title--small">
            {{ title }}
        </p>
        <div class="inner-input padding--x-small shadow--small"
            :class="`brs--${borderRadius} ${readonly ? 'disabled' : ''}`">
            <template v-if="isFile">
                <input v-model="value" ref="input" :type="type" :readonly="readonly" :placeholder="placeholder"
                    class="width--full" :hidden="isFile"  @change="filePicked()" :accept="allowedFileTypes">
                <div class="input-filler">
                </div>
            </template>
            <template v-else>
                <input v-model="value" ref="input" :type="type" :readonly="readonly" :placeholder="placeholder"
                    class="width--full">
            </template>
            <div class="input-icon-wrapper pointer">
                <MainIcon v-if="icon" :icon="icon" @onClick="iconClicked()" />
            </div>
        </div>
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

        readonly: {
            type: Boolean,
            default: false
        },

        allowedAssets: {
            type: Array
        },
    },

    watch: {
        value() {
            this.$emit('onChange', this.value);
        }
    },

    data() {
        return {
            value: '' as string,
            file: null
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

            if(this.allowedAssets?.includes('image')) {
                allowed = 'image/jpeg,image/png,image/webp,image/gif'
            }

            if(this.allowedAssets?.includes('video')) {
                allowed += '/video/mp4,video/quicktime,video/x-msvideo'
            }

            return allowed ? allowed : '*';
        }
    },

    methods: {
        setValue(value: string) {
            this.value = value;
        },

        iconClicked() {
            if (this.isFile) {
                (this.$refs as any).input.click();
                return;
            }

            this.$emit('iconClicked')
        },
        
        filePicked() {
            if(!(this.$refs as any).input.files[0]) {
                return;
            }

            this.file = (this.$refs as any).input.files[0];
            // TODO: add validations
            this.$emit('onChange', this.file);
        }
    }
});
</script>

<style lang="scss">
.main-input {
    p {
        margin-bottom: 5px;
    }

    .inner-input {
        padding: 10px 15px;
        position: relative;
        background-color: white;

        input {
            font-size: .9em;
            background-color: white;
        }

        .input-icon-wrapper {
            position: absolute;
            top: 7px;
            left: 10px;
        }

        .input-filler {
            min-height: 22px;
        }
    }
}
</style>