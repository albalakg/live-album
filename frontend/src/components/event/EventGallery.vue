<template>
    <div class="gallery">
        <div class="album-wrapper" :class="{
            'brs--medium': rounded
        }">
            <div class="album" :class="{
                'brs--medium': rounded,
                'hide-menu': hideMenu
            }" v-for="(asset, index) in sessionAsset" :key="index">
                <template v-if="asset.type === 'image'">
                    <img :src="asset.fullPath" alt="image" class="album-asset" />
                </template>
                <template v-else-if="asset.type === 'video'">
                    <video :src="asset.fullPath" class="album-asset" autoplay muted @loadedmetadata="handleVideoDuration"
                        @ended="nextAsset"></video>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IEventAsset } from '@/helpers/interfaces';

export default defineComponent({
    name: 'GalleryView',

    props: {
        rounded: {
            type: Boolean,
            default: false
        },

        hideMenu: {
            type: Boolean,
            default: false
        },
    },

    data() {
        return {
            displayedIndexes: new Set<number>(),
            sessionAsset: [] as IEventAsset[],
            currentIndex: 0,
            timeoutId: null as ReturnType<typeof setTimeout> | null,
            intervalId: null as ReturnType<typeof setInterval> | null,
            interval: undefined as undefined | any
        };
    },

    created() {
        this.$store.dispatch("event/getEventAssets");
        this.interval = setInterval(() => {
            this.$store.dispatch("event/getEventAssets");
        }, 10000);
    },

    mounted() {
        this.updateSessionAsset();
    },

    beforeUnmount() {
        clearInterval(this.interval);
    },

    watch: {
        sessionAsset: {
            handler(newSessionAsset) {
                if (newSessionAsset.length && newSessionAsset[0].type === 'video') {
                    if (this.intervalId) {
                        clearInterval(this.intervalId);
                        this.intervalId = null;
                    }
                } else {
                    this.resetInterval();
                }
            },
            immediate: true,
        },
    },

    computed: {
        assets(): IEventAsset[] {
            return this.$store.getters['event/getAssets'] as IEventAsset[];
        },
    },

    methods: {
        getRandomAssetIndexes(): number {
            const availableIndexes = this.assets
                .map((_, index) => index)
                .filter((index) => !this.displayedIndexes.has(index));

            if (availableIndexes.length === 0) {
                this.displayedIndexes.clear();
                return this.getRandomAssetIndexes();
            }

            const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
            this.displayedIndexes.add(randomIndex);

            return randomIndex;
        },
        updateSessionAsset(): void {
            if (this.assets.length === 0) return;
            const index = this.getRandomAssetIndexes();
            this.sessionAsset = [this.assets[index]];
            
            this.currentIndex = index;
        },
        nextAsset(): void {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            this.currentIndex = (this.currentIndex + 1) % this.assets.length;
            this.sessionAsset = [this.assets[this.currentIndex]];
            this.resetInterval();
        },
        previousAsset(): void {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            this.currentIndex = (this.currentIndex - 1 + this.assets.length) % this.assets.length;
            this.sessionAsset = [this.assets[this.currentIndex]];
            this.resetInterval();
        },
        handleVideoDuration(event: Event): void {
            const videoElement = event.target as HTMLVideoElement;
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.timeoutId = setTimeout(() => {
                if (!videoElement.ended) {
                    this.nextAsset();
                }
            }, 8000); // Move to next asset after 8 seconds if the video has not ended
        },
        resetInterval(): void {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            this.intervalId = setInterval(this.updateSessionAsset, 3000); // Updates the displayed asset every 3 seconds
        },
    },
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Great+Vibes&display=swap');

.gallery {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #f8f9fa;
    height: 100%;
    position: relative;
}

.album-wrapper {
    width: 100%;
    height: 100%;
    background-color: #222;
}

.title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.8);
    z-index: 10;
    padding: 10px;
}

.gallery-title {
    font-family: 'Great Vibes', cursive;
    font-size: 3rem;
    color: #333;
}

.arrow-button {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    padding: 0 20px;
    transition: transform 0.2s;
}

.arrow-button:hover {
    transform: scale(1.2);
}

.album {
    position: relative;
    width: 100%;
    height: calc(100% - 70px);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: #000;
    top: 70px;
}

.hide-menu {
    height: 100%;
    top: 0;
}

.album-asset {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>