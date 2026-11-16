<template>
  <div
    class="mosaic-wall"
    :class="[`mosaic-${size}`, { 'mosaic--reduced': !allowMotion }]"
  >
    <div
      v-for="(cell, index) in cells"
      :key="index"
      class="mosaic-cell"
      :class="{ 'is-new': cell.highlight }"
    >
      <EventGalleryMediaFrame v-if="cell.asset">
        <img
          v-if="!isVideo(cell.asset) || playingIndex !== index"
          :src="mediaSrc(cell.asset)"
          class="mosaic-asset"
          alt=""
        />
        <video
          v-else
          :src="mediaSrc(cell.asset)"
          class="mosaic-asset"
          autoplay
          muted
          loop
          playsinline
        />
      </EventGalleryMediaFrame>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import EventGalleryMediaFrame from "@/components/event/EventGalleryMediaFrame.vue";
import {
  assetSrc,
  assetThumb,
  isVideoAsset,
  motionAllowed,
  pickRandomAsset,
  readLiveScreenOptions,
} from "@/helpers/liveScreenRuntime";

interface Cell {
  asset: IEventAsset | null;
  highlight: boolean;
}

export default defineComponent({
  name: "EventGalleryMosaic",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      cells: [] as Cell[],
      intervalId: null as ReturnType<typeof setInterval> | null,
      highlightTimer: null as ReturnType<typeof setTimeout> | null,
      playingIndex: -1,
      seenIds: new Set<number>(),
      seenReady: false,
      allowMotion: true,
    };
  },
  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getDisplayGalleryAssets"] as IEventAsset[];
    },
    event(): any {
      return this.$store.getters["event/getEvent"];
    },
    size(): string {
      return readLiveScreenOptions(this.event).mosaic_size || "3x3";
    },
    cellCount(): number {
      return this.size === "4x4" ? 16 : 9;
    },
  },
  watch: {
    assets: {
      immediate: true,
      handler(list: IEventAsset[]) {
        if (!list.length) {
          this.cells = Array.from({ length: this.cellCount }, () => ({
            asset: null,
            highlight: false,
          }));
          return;
        }
        const empty =
          !this.cells.length || this.cells.every((cell) => !cell.asset);
        if (empty) {
          this.initCells();
        }
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id));
        list.forEach((a) => this.seenIds.add(a.id));
        if (fresh.length) {
          this.landNew(fresh[fresh.length - 1]);
        }
      },
    },
    cellCount() {
      this.initCells();
    },
  },
  mounted() {
    this.allowMotion = motionAllowed();
    this.initCells();
    this.intervalId = setInterval(this.refreshOne, 3200);
  },
  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.highlightTimer) clearTimeout(this.highlightTimer);
  },
  methods: {
    isVideo: isVideoAsset,
    mediaSrc(asset: IEventAsset) {
      return isVideoAsset(asset) ? assetSrc(asset) : assetThumb(asset) || assetSrc(asset);
    },
    initCells() {
      this.cells = Array.from({ length: this.cellCount }, () => ({
        asset: pickRandomAsset(this.assets),
        highlight: false,
      }));
      this.pickPlayingVideo();
    },
    pickPlayingVideo() {
      const videoIndexes = this.cells
        .map((cell, index) => (isVideoAsset(cell.asset) ? index : -1))
        .filter((index) => index >= 0);
      this.playingIndex = videoIndexes.length
        ? videoIndexes[Math.floor(Math.random() * videoIndexes.length)]
        : -1;
    },
    refreshOne() {
      if (!this.assets.length || !this.cells.length) return;
      const index = Math.floor(Math.random() * this.cells.length);
      this.cells.splice(index, 1, {
        asset: pickRandomAsset(this.assets, this.cells[index]?.asset?.id),
        highlight: false,
      });
      this.pickPlayingVideo();
    },
    landNew(asset: IEventAsset) {
      if (!this.cells.length) this.initCells();
      const index = Math.floor(Math.random() * this.cells.length);
      this.cells.splice(index, 1, { asset, highlight: true });
      this.pickPlayingVideo();
      if (this.highlightTimer) clearTimeout(this.highlightTimer);
      this.highlightTimer = setTimeout(() => {
        if (this.cells[index]) this.cells[index].highlight = false;
      }, 2200);
    },
  },
});
</script>

<style lang="scss" scoped>
.mosaic-wall {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: grid;
  gap: 6px;
  padding: 6px;
  box-sizing: border-box;
  background: #070605;
}
.mosaic-3x3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
}
.mosaic-4x4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(4, minmax(0, 1fr));
}
.mosaic-cell {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: #111;
  outline: 0 solid rgba(201, 163, 106, 0);
  transition: outline-color 0.3s ease, outline-width 0.3s ease;
}
.mosaic-cell.is-new {
  outline: 3px solid rgba(201, 163, 106, 0.95);
  z-index: 2;
}
.mosaic-asset {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mosaic--reduced .mosaic-cell {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .mosaic-cell {
    transition: none;
  }
}
</style>
