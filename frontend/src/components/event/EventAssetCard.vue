<template>
    <div class="gallery-asset-wrapper" :class="{
        'padding--small': true,
        'padding--no-right': isFirstOfLine && !$bp.isMobile,
        assetIndex: true
    }">
        <div class="gallery-asset position--relative bg--dark height--full width--full brs--medium">
            <div class="gallery-asset-chip padding--x-small brs--large" v-show="isToggleShown">
                <MainCheckbox :disabled="loading" :ref="`asset-checkbox-${asset.id}`" :color="assetToggleColor"
                    @onClick="togglePickedAssets(asset.id)" title="לחצו בשביל לסמן למחיקה" :value="isPicked" />
            </div>
            <a :href="asset.fullPath" target="_blank" class="gallery-view-icon">
                <MainIcon icon="open_in_new" size="1.3em" />
            </a>
            <!-- <div class="gallery-download-icon pointer" @click="downloadAsset()">
                <MainIcon icon="download" />
            </div> -->
            <template v-if="asset.type === 'image'">
                <img :src="asset.fullPath" alt="image" class="album-asset brs--medium" />
            </template>
            <template v-else-if="asset.type === 'video'">
                <video :src="asset.fullPath" class="album-asset" autoplay muted loop></video>
            </template>
        </div>
    </div>
</template>


<script lang="ts">
import { IEventAsset } from '@/helpers/interfaces';
import { EventAssetsManagementModesType } from '@/helpers/types';
import { defineComponent, PropType } from 'vue';
import MainCheckbox from '@/components/library/inputs/MainCheckbox.vue';
import MainIcon from '../library/general/MainIcon.vue';

export default defineComponent({
    name: 'EventAssetsView',

    components: {
        MainCheckbox,
        MainIcon,
    },

    props: {
        loading: {
            type: Boolean,
            required: true
        },

        assetIndex: {
            type: Number,
            default: 1
        },

        asset: {
            type: Object as PropType<IEventAsset>,
            required: true
        },
    },

    data() {
        return {
            counter: '' as string,
            intervalId: null as ReturnType<typeof setInterval> | null,
            canDelete: false as boolean,
            canDownload: false as boolean,
            pickedAll: false as boolean,
            pickedAssets: [] as number[],
        };
    },

    computed: {
        mode(): EventAssetsManagementModesType | null {
            return this.$store.getters['event/getManagedAssetsMode'];
        },

        isToggleShown(): boolean {
            return !!this.mode;
        },

        assetToggleColor(): string {
            return this.mode === 'מחיקה' ? 'pink' : 'green';
        },

        assetsIds(): number[] {
            return this.$store.getters['event/getManagedAssetsIds'];
        },

        isPicked(): boolean {
            return this.assetsIds.includes(this.asset.id);
        },

        isFirstOfLine(): boolean {
            return this.assetIndex % 5 == 0;
        },
    },

    methods: {
        togglePickedAssets(assetId: number) {
            if (this.isPicked) {
                this.$store.dispatch("event/removeAssetFromAssetsManagement", assetId)
            } else {
                this.$store.dispatch("event/addAssetForAssetsManagement", assetId)
            }
        },

        downloadAsset() {
            // const url = this.asset.fullPath;
            // const link = document.createElement('a');
            // link.href = 'https://s3.us-east-1.amazonaws.com/snapshare-live.com/events/1/gallery/Dk6CK1ueUsvj1KK9BYcEG0JISh0SDwCYQeBbQZyE.png';
            // link.download = 'your-file.zip'; // Suggested filename
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
        }
    },
});
</script>

<style lang="scss" scoped>
.gallery-asset-wrapper {
    text-align: center;
    height: calc((70vw - 64px) / 5);
    width: calc(20% - 32px);

    @media only screen and (max-width: 600px) { 
        width: calc(50% - 12px);     
        height: 150px;
        padding: 6px;   
    }

    .gallery-asset-chip {
        background-color: #222d;
        position: absolute;
        right: 10px;
        top: 10px;
        z-index: 1;
    }

    .album-asset {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .gallery-view-icon {
        position: absolute;
        left: 10px;
        top: 10px;
        z-index: 1;
        text-align: center;
    }

    // .gallery-download-icon {
    //     position: absolute;
    //     left: 10px;
    //     top: 10px;
    //     z-index: 1;
    //     width: 30px;
    //     text-align: center;
    // }
}

.padding--no-right {
    padding-right: 0;
}
</style>
