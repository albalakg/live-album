<template>
  <div class="split-gallery" :class="layout">
    <div
      v-for="(cell, i) in cells"
      :key="i"
      class="split-cell"
    >
      <transition :name="cell.animation" mode="out-in">
        <div :key="cell.asset?.fullPath" class="asset-wrapper">
          <img
            v-if="cell.asset?.type === 'image'"
            :src="cell.asset.fullPath"
            class="cell-asset"
          />
          <video
            v-else-if="cell.asset?.type === 'video'"
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
  name: "GallerySplitRotation",

  props: {
    interval: { type: Number, default: 4000 }, // ms between swaps
    panels: { type: Number, default: 2 }, // how many splits (2 or 3)
    direction: { type: String, default: "horizontal" }, // "horizontal" | "vertical"
  },

  data() {
    return {
      cells: [] as { asset: IEventAsset | null; animation: string }[],
      intervalId: null as ReturnType<typeof setInterval> | null,
    };
  },

  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getGalleryAssets"] as IEventAsset[];
    },
    layout(): string {
      return this.direction === "horizontal"
        ? `split-${this.panels}-horizontal`
        : `split-${this.panels}-vertical`;
    },
  },

  methods: {
    getRandomAsset(): IEventAsset | null {
      if (!this.assets.length) return null;
      const index = Math.floor(Math.random() * this.assets.length);
      return this.assets[index];
    },
    initCells() {
      this.cells = Array.from({ length: this.panels }, () => ({
        asset: this.getRandomAsset(),
        animation: "fade",
      }));
    },
    shuffleCell() {
      if (!this.assets.length) return;
      const randomIndex = Math.floor(Math.random() * this.cells.length);

      const animations = ["fade", "slide", "flip"];
      const randomAnim =
        animations[Math.floor(Math.random() * animations.length)];

      this.cells.splice(randomIndex, 1, {
        asset: this.getRandomAsset(),
        animation: randomAnim,
      });
    },
  },

  mounted() {
    this.initCells();
    this.intervalId = setInterval(this.shuffleCell, this.interval);
  },

  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  },
});
</script>

<style scoped>
.split-gallery {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.split-2-horizontal {
  flex-direction: row;
}
.split-2-vertical {
  flex-direction: column;
}
.split-3-horizontal {
  flex-direction: row;
}
.split-3-vertical {
  flex-direction: column;
}

.split-cell {
  flex: 1;
  position: relative;
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
  transition: opacity 0.7s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.7s ease, opacity 0.7s ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.flip-enter-active,
.flip-leave-active {
  transition: transform 0.8s ease;
  transform-style: preserve-3d;
}
.flip-enter-from {
  transform: rotateY(90deg);
}
.flip-leave-to {
  transform: rotateY(-90deg);
}
</style>
