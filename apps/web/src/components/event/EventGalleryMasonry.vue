<template>
  <div
    class="masonry"
    :class="[`masonry-${density}`, { 'masonry--reduced': !allowMotion }]"
  >
    <div
      v-for="tile in tiles"
      :key="tile.key"
      class="masonry-tile"
      :class="{ 'is-new': tile.fresh }"
      :style="{ height: tile.height }"
    >
      <EventGalleryMediaFrame>
        <img
          v-if="!isVideo(tile.asset) || playingKey !== tile.key"
          :src="thumb(tile.asset)"
          class="masonry-asset"
          alt=""
        />
        <video
          v-else
          :src="src(tile.asset)"
          class="masonry-asset"
          autoplay
          muted
          loop
          playsinline
        />
      </EventGalleryMediaFrame>
    </div>
    <p v-if="!tiles.length" class="masonry-empty">ממתינים לתמונות…</p>
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
  newestAssets,
  readLiveScreenOptions,
} from "@/helpers/liveScreenRuntime";

interface Tile {
  key: number;
  asset: IEventAsset;
  height: string;
  fresh: boolean;
}

export default defineComponent({
  name: "EventGalleryMasonry",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      tiles: [] as Tile[],
      counter: 0,
      playingKey: -1,
      seenIds: new Set<number>(),
      seenReady: false,
      clearFreshTimer: null as ReturnType<typeof setTimeout> | null,
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
    density(): string {
      return readLiveScreenOptions(this.event).masonry_density || "cozy";
    },
    cap(): number {
      return this.density === "dense" ? 24 : 18;
    },
  },
  watch: {
    assets: {
      immediate: true,
      handler(list: IEventAsset[]) {
        if (!list.length) {
          this.tiles = [];
          return;
        }
        if (!this.tiles.length) {
          this.rebuild(list);
        }
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id));
        list.forEach((a) => this.seenIds.add(a.id));
        fresh.forEach((asset) => this.pushTile(asset, true));
      },
    },
    density() {
      this.rebuild(this.assets);
    },
  },
  mounted() {
    this.allowMotion = motionAllowed();
  },
  beforeUnmount() {
    if (this.clearFreshTimer) clearTimeout(this.clearFreshTimer);
  },
  methods: {
    isVideo: isVideoAsset,
    thumb: assetThumb,
    src: assetSrc,
    rebuild(list: IEventAsset[]) {
      this.tiles = newestAssets(list, this.cap).map((asset) => this.makeTile(asset, false));
      this.pickPlaying();
    },
    makeTile(asset: IEventAsset, fresh: boolean): Tile {
      const heights = ["140px", "180px", "210px", "160px", "230px"];
      return {
        key: ++this.counter,
        asset,
        height: heights[this.counter % heights.length],
        fresh,
      };
    },
    pushTile(asset: IEventAsset, fresh: boolean) {
      this.tiles = [this.makeTile(asset, fresh), ...this.tiles].slice(0, this.cap);
      this.pickPlaying();
      if (this.clearFreshTimer) clearTimeout(this.clearFreshTimer);
      this.clearFreshTimer = setTimeout(() => {
        this.tiles = this.tiles.map((tile) => ({ ...tile, fresh: false }));
      }, 1800);
    },
    pickPlaying() {
      const video = this.tiles.find((tile) => isVideoAsset(tile.asset));
      this.playingKey = video ? video.key : -1;
    },
  },
});
</script>

<style lang="scss" scoped>
.masonry {
  position: absolute;
  inset: 0;
  overflow: hidden;
  padding: 10px;
  box-sizing: border-box;
  background: #070605;
  column-gap: 10px;
}
.masonry-cozy {
  column-count: 4;
}
.masonry-dense {
  column-count: 5;
}
.masonry-tile {
  break-inside: avoid;
  margin: 0 0 10px;
  border-radius: 12px;
  overflow: hidden;
  background: #111;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.masonry-tile.is-new {
  opacity: 0.2;
  animation: masonry-pop 0.55s ease forwards;
}
.masonry-asset {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  min-height: inherit;
}
.masonry-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: rgba(247, 242, 235, 0.7);
  font-weight: 700;
}
@keyframes masonry-pop {
  to {
    opacity: 1;
    transform: translateY(0);
  }
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
.masonry--reduced .masonry-tile.is-new {
  animation: none;
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .masonry-tile.is-new {
    animation: none;
    opacity: 1;
  }
}
@media (max-width: 1100px) {
  .masonry-cozy {
    column-count: 3;
  }
  .masonry-dense {
    column-count: 4;
  }
}
</style>
