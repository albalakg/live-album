<template>
  <div class="gallery-grid" :class="{ 'gallery-grid--reduced': !allowMotion }">
    <div v-for="(cell, i) in gridCells" :key="i" class="grid-cell">
      <transition :name="allowMotion ? cell.animation : 'fade'">
        <div v-if="cell.asset" class="asset-wrapper">
          <EventGalleryMediaFrame>
            <img
              v-if="cell.asset.type === 'image' || playingIndex !== i"
              :src="cell.asset.fullPath"
              class="cell-asset"
              alt=""
            />
            <video
              v-else-if="cell.asset.type === 'video'"
              :src="cell.asset.fullPath"
              autoplay
              muted
              loop
              playsinline
              class="cell-asset"
            ></video>
          </EventGalleryMediaFrame>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import EventGalleryMediaFrame from "@/components/event/EventGalleryMediaFrame.vue";
import { motionAllowed } from "@/helpers/liveScreenRuntime";

export default defineComponent({
  name: "EventGalleryGrid3X3",

  components: {
    EventGalleryMediaFrame,
  },

  props: {
    interval: { type: Number, default: 3000 },
  },

  data() {
    return {
      gridCells: [] as { asset: IEventAsset | null; animation: string }[],
      intervalId: null as ReturnType<typeof setInterval> | null,
      playingIndex: -1,
      allowMotion: true,
    };
  },

  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getDisplayGalleryAssets"] as IEventAsset[];
    },
  },

  watch: {
    assets: {
      immediate: true,
      handler(list: IEventAsset[]) {
        if (!list.length) return;
        if (!this.gridCells.length) this.initGrid();
      },
    },
  },

  methods: {
    initGrid() {
      this.gridCells = Array.from({ length: 9 }, () => ({
        asset: this.getRandomAsset(),
        animation: "fade",
      }));
      this.pickPlaying();
    },
    getRandomAsset(): IEventAsset | null {
      if (!this.assets.length) return null;
      const index = Math.floor(Math.random() * this.assets.length);
      return this.assets[index];
    },
    pickPlaying() {
      const videoIndexes = this.gridCells
        .map((cell, index) => (cell.asset?.type === "video" ? index : -1))
        .filter((index) => index >= 0);
      this.playingIndex = videoIndexes.length
        ? videoIndexes[Math.floor(Math.random() * videoIndexes.length)]
        : -1;
    },
    shuffleCell() {
      if (!this.assets.length || !this.gridCells.length) return;
      const randomIndex = Math.floor(Math.random() * this.gridCells.length);
      const animations = this.allowMotion ? ["fade", "zoom", "slide"] : ["fade"];
      const randomAnim =
        animations[Math.floor(Math.random() * animations.length)];

      this.gridCells.splice(randomIndex, 1, {
        asset: this.getRandomAsset(),
        animation: randomAnim,
      });
      this.pickPlaying();
    },
  },

  mounted() {
    this.allowMotion = motionAllowed();
    this.initGrid();
    this.intervalId = setInterval(this.shuffleCell, this.interval);
  },

  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  },
});
</script>

<style scoped>
.gallery-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  width: 100%;
  height: 100%;
  gap: 6px;
  padding: 6px;
  box-sizing: border-box;
  background: #070605;
}

.grid-cell {
  background: #000;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border-radius: 10px;
}

.asset-wrapper {
  width: 100%;
  height: 100%;
}

.cell-asset {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}
.zoom-enter-from {
  transform: scale(1.2);
  opacity: 0;
}
.zoom-leave-to {
  transform: scale(0.8);
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}
.slide-enter-from {
  transform: translateY(20px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .zoom-enter-active,
  .zoom-leave-active,
  .slide-enter-active,
  .slide-leave-active {
    transition: none;
  }
}
</style>
