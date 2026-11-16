<template>
  <div class="spot" :class="{ 'spot--hold': holding, 'spot--reduced': !allowMotion }">
    <div class="spot-stage">
      <EventGalleryMediaFrame v-if="current">
        <img
          v-if="!isVideo"
          :src="currentSrc"
          class="spot-asset album-asset spot-contain"
          alt=""
        />
        <video
          v-else
          :src="currentSrc"
          class="spot-asset album-asset spot-contain"
          autoplay
          muted
          playsinline
          @ended="onBeatEnd"
          @loadedmetadata="onVideoMeta"
        />
      </EventGalleryMediaFrame>
      <p v-else class="spot-empty">ממתינים לתמונות…</p>
    </div>
    <p v-if="holding" class="spot-badge">תמונה חדשה</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import EventGalleryMediaFrame from "@/components/event/EventGalleryMediaFrame.vue";
import {
  assetSrc,
  imageDisplayMs,
  isVideoAsset,
  motionAllowed,
  pickRandomAsset,
  readLiveScreenOptions,
  videoDisplayMs,
} from "@/helpers/liveScreenRuntime";

export default defineComponent({
  name: "EventGallerySpotlight",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      current: null as IEventAsset | null,
      queue: [] as number[],
      holding: false,
      seenIds: new Set<number>(),
      seenReady: false,
      timerId: null as ReturnType<typeof setTimeout> | null,
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
    holdMs(): number {
      const seconds = readLiveScreenOptions(this.event).spotlight_hold_seconds || 5;
      return Math.max(2, seconds) * 1000;
    },
    currentSrc(): string {
      return assetSrc(this.current);
    },
    isVideo(): boolean {
      return isVideoAsset(this.current);
    },
  },
  watch: {
    assets: {
      immediate: true,
      handler(list: IEventAsset[]) {
        if (!list.length) return;
        if (!this.current) {
          this.showAsset(pickRandomAsset(list), false);
        }
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id));
        list.forEach((a) => this.seenIds.add(a.id));
        if (!fresh.length) return;
        // Cap queued arrivals
        const ids = fresh.map((a) => a.id).slice(0, 8);
        this.queue.push(...ids);
        if (!this.holding) {
          this.pullSpotlight();
        }
      },
    },
  },
  mounted() {
    this.allowMotion = motionAllowed();
  },
  beforeUnmount() {
    if (this.timerId) clearTimeout(this.timerId);
  },
  methods: {
    clearTimer() {
      if (this.timerId) clearTimeout(this.timerId);
      this.timerId = null;
    },
    showAsset(asset: IEventAsset | null, hold: boolean) {
      if (!asset) return;
      this.clearTimer();
      this.current = asset;
      this.holding = hold;
      if (hold) {
        this.timerId = setTimeout(() => this.onBeatEnd(), this.holdMs);
        return;
      }
      if (!isVideoAsset(asset)) {
        this.timerId = setTimeout(() => this.onBeatEnd(), imageDisplayMs(this.event));
      }
    },
    onVideoMeta() {
      if (this.holding) return;
      this.clearTimer();
      this.timerId = setTimeout(() => this.onBeatEnd(), videoDisplayMs(this.event));
    },
    pullSpotlight() {
      while (this.queue.length) {
        const id = this.queue.shift();
        const asset = this.assets.find((a) => a.id === id);
        if (asset) {
          this.showAsset(asset, true);
          return;
        }
      }
    },
    onBeatEnd() {
      if (this.queue.length) {
        this.pullSpotlight();
        return;
      }
      this.showAsset(pickRandomAsset(this.assets, this.current?.id), false);
    },
  },
});
</script>

<style lang="scss" scoped>
.spot {
  position: relative;
  width: 100%;
  height: 100%;
  background: #070605;
  overflow: hidden;
}
.spot-stage {
  position: absolute;
  inset: 0;
}
.spot-asset {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.7s ease;
}
.spot-contain {
  object-fit: contain !important;
}
.spot--hold:not(.spot--reduced) .spot-asset {
  transform: scale(1.04);
}
.spot-badge {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  margin: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(18, 16, 14, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 800;
}
.spot-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: rgba(247, 242, 235, 0.7);
  font-weight: 700;
}
@media (prefers-reduced-motion: reduce) {
  .spot-asset {
    transition: none;
    transform: none !important;
  }
}
</style>
