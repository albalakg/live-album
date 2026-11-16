<template>
  <div class="hero-grid">
    <div class="hero-main">
      <EventGalleryMediaFrame v-if="hero">
        <img
          v-if="!isVideo(hero)"
          :src="src(hero)"
          class="hero-asset album-asset hero-contain"
          alt=""
        />
        <video
          v-else
          :src="src(hero)"
          class="hero-asset album-asset hero-contain"
          autoplay
          muted
          playsinline
          @ended="rotateHero"
          @loadedmetadata="onVideoMeta"
        />
      </EventGalleryMediaFrame>
      <p v-else class="hero-empty">ממתינים לתמונות…</p>
    </div>
    <div class="hero-side">
      <div v-for="(asset, index) in side" :key="asset?.id || index" class="hero-cell">
        <EventGalleryMediaFrame v-if="asset">
          <img :src="thumb(asset)" class="hero-cell-asset" alt="" />
        </EventGalleryMediaFrame>
      </div>
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
  newestAssets,
  videoDisplayMs,
} from "@/helpers/liveScreenRuntime";

export default defineComponent({
  name: "EventGalleryHeroGrid",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      hero: null as IEventAsset | null,
      side: [] as Array<IEventAsset | null>,
      timerId: null as ReturnType<typeof setTimeout> | null,
      seenIds: new Set<number>(),
      seenReady: false,
    };
  },
  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getDisplayGalleryAssets"] as IEventAsset[];
    },
    event(): any {
      return this.$store.getters["event/getEvent"];
    },
  },
  watch: {
    assets: {
      immediate: true,
      handler(list: IEventAsset[]) {
        if (!list.length) return;
        this.rebuild(list);
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id));
        list.forEach((a) => this.seenIds.add(a.id));
        if (fresh.length) {
          this.hero = fresh[fresh.length - 1];
          this.schedule();
        }
      },
    },
  },
  beforeUnmount() {
    if (this.timerId) clearTimeout(this.timerId);
  },
  methods: {
    isVideo: isVideoAsset,
    src: assetSrc,
    thumb: assetThumb,
    rebuild(list: IEventAsset[]) {
      const ordered = newestAssets(list, 5);
      this.hero = ordered[0] || null;
      this.side = ordered.slice(1, 5);
      while (this.side.length < 4) this.side.push(null);
      this.schedule();
    },
    clearTimer() {
      if (this.timerId) clearTimeout(this.timerId);
      this.timerId = null;
    },
    schedule() {
      this.clearTimer();
      if (!this.hero) return;
      if (isVideoAsset(this.hero)) return;
      this.timerId = setTimeout(() => this.rotateHero(), imageDisplayMs(this.event));
    },
    onVideoMeta() {
      this.clearTimer();
      this.timerId = setTimeout(() => this.rotateHero(), videoDisplayMs(this.event));
    },
    rotateHero() {
      if (!this.assets.length) return;
      const idx = this.assets.findIndex((a) => a.id === this.hero?.id);
      this.hero = this.assets[(idx + 1) % this.assets.length];
      this.side = newestAssets(
        this.assets.filter((a) => a.id !== this.hero?.id),
        4
      );
      while (this.side.length < 4) this.side.push(null);
      this.schedule();
    },
  },
});
</script>

<style lang="scss" scoped>
.hero-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1.45fr 0.9fr;
  gap: 8px;
  padding: 8px;
  box-sizing: border-box;
  background: #070605;
  overflow: hidden;
}
.hero-main,
.hero-cell {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: #111;
}
.hero-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  min-height: 0;
}
.hero-asset,
.hero-cell-asset {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.hero-contain {
  object-fit: contain !important;
}
.hero-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: rgba(247, 242, 235, 0.7);
  font-weight: 700;
}
@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 1.3fr 0.9fr;
  }
}
</style>
