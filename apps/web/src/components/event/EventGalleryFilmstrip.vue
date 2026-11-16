<template>
  <div class="film" :class="{ 'film--reduced': !allowMotion || shortHeight }">
    <div class="film-hero">
      <EventGalleryMediaFrame v-if="current">
        <img
          v-if="!isVideo(current)"
          :src="src(current)"
          class="film-hero-asset album-asset film-contain"
          alt=""
        />
        <video
          v-else
          :src="src(current)"
          class="film-hero-asset album-asset film-contain"
          autoplay
          muted
          playsinline
          @ended="advance"
          @loadedmetadata="onVideoMeta"
        />
      </EventGalleryMediaFrame>
      <p v-else class="film-empty">ממתינים לתמונות…</p>
    </div>
    <div v-if="showStrip" class="film-strip" dir="rtl">
      <button
        v-for="asset in strip"
        :key="asset.id"
        type="button"
        class="film-thumb"
        :class="{ on: current?.id === asset.id }"
        @click="select(asset)"
      >
        <img :src="thumb(asset)" alt="" />
      </button>
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
  imageDisplayMs,
  isVideoAsset,
  motionAllowed,
  newestAssets,
  videoDisplayMs,
} from "@/helpers/liveScreenRuntime";

export default defineComponent({
  name: "EventGalleryFilmstrip",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      current: null as IEventAsset | null,
      timerId: null as ReturnType<typeof setTimeout> | null,
      shortHeight: false,
      allowMotion: true,
      seenIds: new Set<number>(),
      seenReady: false,
      resizeObserver: null as ResizeObserver | null,
    };
  },
  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getDisplayGalleryAssets"] as IEventAsset[];
    },
    event(): any {
      return this.$store.getters["event/getEvent"];
    },
    strip(): IEventAsset[] {
      return newestAssets(this.assets, 12);
    },
    showStrip(): boolean {
      return this.allowMotion && !this.shortHeight && this.strip.length > 1;
    },
  },
  watch: {
    assets: {
      immediate: true,
      handler(list: IEventAsset[]) {
        if (!list.length) return;
        if (!this.current) this.select(newestAssets(list, 1)[0]);
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id));
        list.forEach((a) => this.seenIds.add(a.id));
        if (fresh.length) this.select(fresh[fresh.length - 1]);
      },
    },
  },
  mounted() {
    this.allowMotion = motionAllowed();
    this.measure();
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.$el as Element);
  },
  beforeUnmount() {
    if (this.timerId) clearTimeout(this.timerId);
    this.resizeObserver?.disconnect();
  },
  methods: {
    isVideo: isVideoAsset,
    src: assetSrc,
    thumb: assetThumb,
    measure() {
      const el = this.$el as HTMLElement | undefined;
      this.shortHeight = (el?.clientHeight || window.innerHeight) < 560;
    },
    clearTimer() {
      if (this.timerId) clearTimeout(this.timerId);
      this.timerId = null;
    },
    select(asset: IEventAsset | null) {
      if (!asset) return;
      this.clearTimer();
      this.current = asset;
      if (!isVideoAsset(asset)) {
        this.timerId = setTimeout(() => this.advance(), imageDisplayMs(this.event));
      }
    },
    onVideoMeta() {
      this.clearTimer();
      this.timerId = setTimeout(() => this.advance(), videoDisplayMs(this.event));
    },
    advance() {
      if (!this.assets.length) return;
      const idx = this.assets.findIndex((a) => a.id === this.current?.id);
      const next = this.assets[(idx + 1) % this.assets.length];
      this.select(next);
    },
  },
});
</script>

<style lang="scss" scoped>
.film {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #070605;
  overflow: hidden;
}
.film-hero {
  position: relative;
  flex: 1;
  min-height: 0;
}
.film-hero-asset {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.film-contain {
  object-fit: contain !important;
}
.film-strip {
  flex: none;
  display: flex;
  gap: 8px;
  padding: 10px 12px 14px;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.55);
}
.film-thumb {
  flex: none;
  width: 92px;
  height: 64px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  background: #111;
  cursor: pointer;
}
.film-thumb.on {
  border-color: #c9a36a;
}
.film-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.film-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: rgba(247, 242, 235, 0.7);
  font-weight: 700;
}
.film--reduced .film-strip {
  display: none;
}
</style>
