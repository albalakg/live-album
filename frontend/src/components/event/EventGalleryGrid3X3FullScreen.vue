<template>
  <div class="gallery-grid">
    <div v-for="(cell, i) in gridCells" :key="i" class="grid-cell">
      <transition :name="cell.animation">
        <div v-if="cell.asset" class="asset-wrapper">
          <img
            v-if="cell.asset.type === 'image'"
            :src="cell.asset.fullPath"
            class="cell-asset"
          />
          <video
            v-else-if="cell.asset.type === 'video'"
            :src="cell.asset.fullPath"
            autoplay
            muted
            loop
            class="cell-asset"
          ></video>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";

export default defineComponent({
  name: "GalleryGridShuffle",

  props: {
    interval: { type: Number, default: 3000 }, // ms between shuffles
  },

  data() {
    return {
      gridCells: [] as { asset: IEventAsset | null; animation: string }[],
      intervalId: null as ReturnType<typeof setInterval> | null,
    };
  },

  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getGalleryAssets"] as IEventAsset[];
    },
  },

  methods: {
    initGrid() {
      this.gridCells = Array.from({ length: 9 }, () => ({
        asset: this.getRandomAsset(),
        animation: "fade",
      }));
    },
    getRandomAsset(): IEventAsset | null {
      if (!this.assets.length) return null;
      const index = Math.floor(Math.random() * this.assets.length);
      return this.assets[index];
    },
    shuffleCell() {
      if (!this.assets.length) return;
      const randomIndex = Math.floor(Math.random() * this.gridCells.length);

      const animations = ["fade", "zoom", "slide"];
      const randomAnim =
        animations[Math.floor(Math.random() * animations.length)];

      this.gridCells.splice(randomIndex, 1, {
        asset: this.getRandomAsset(),
        animation: randomAnim,
      });
    },
  },

  mounted() {
    this.initGrid();
    this.intervalId = setInterval(this.shuffleCell, this.interval);
  },

  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  },
});
</script>

<style scoped>
/* Fullscreen 3x3 grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.grid-cell {
  position: relative;
  background: #000;
  overflow: hidden;
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

/* Animations */
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
</style>
