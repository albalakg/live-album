<template>
  <div class="kb" :class="{ 'kb--reduced': !allowMotion }">
    <div
      v-for="layer in layers"
      :key="layer.key"
      class="kb-layer"
      :class="[
        layer.active ? 'is-active' : '',
        layer.kind === 'video' ? 'is-video' : `kb-${intensity}`,
      ]"
    >
      <EventGalleryMediaFrame>
        <img
          v-if="layer.kind === 'image'"
          :src="layer.src"
          class="kb-asset album-asset kb-contain"
          alt=""
        />
        <video
          v-else
          :src="layer.src"
          class="kb-asset album-asset kb-contain"
          autoplay
          muted
          playsinline
          @ended="advance"
          @loadedmetadata="onVideoMeta"
        />
      </EventGalleryMediaFrame>
    </div>
    <p v-if="!assets.length" class="kb-empty">ממתינים לתמונות…</p>
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

interface Layer {
  key: number;
  src: string;
  kind: "image" | "video";
  active: boolean;
  assetId: number;
}

export default defineComponent({
  name: "EventGalleryKenBurns",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      layers: [] as Layer[],
      layerKey: 0,
      timerId: null as ReturnType<typeof setTimeout> | null,
      videoTimerId: null as ReturnType<typeof setTimeout> | null,
      seenIds: new Set<number>(),
      seenReady: false,
      pendingNewIds: [] as number[],
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
    intensity(): string {
      return readLiveScreenOptions(this.event).ken_burns_intensity || "subtle";
    },
    imageMs(): number {
      return imageDisplayMs(this.event);
    },
    videoMs(): number {
      return videoDisplayMs(this.event);
    },
  },
  watch: {
    assets: {
      immediate: true,
      handler(list: IEventAsset[]) {
        if (!list.length) return;
        if (!this.layers.some((l) => l.active)) {
          this.showAsset(pickRandomAsset(list));
        }
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id)).map((a) => a.id);
        list.forEach((a) => this.seenIds.add(a.id));
        if (fresh.length) {
          this.pendingNewIds.push(...fresh);
        }
      },
    },
  },
  mounted() {
    this.allowMotion = motionAllowed();
  },
  beforeUnmount() {
    this.clearTimers();
  },
  methods: {
    clearTimers() {
      if (this.timerId) clearTimeout(this.timerId);
      if (this.videoTimerId) clearTimeout(this.videoTimerId);
      this.timerId = null;
      this.videoTimerId = null;
    },
    showAsset(asset: IEventAsset | null) {
      if (!asset) return;
      this.clearTimers();
      const kind = isVideoAsset(asset) ? "video" : "image";
      const next: Layer = {
        key: ++this.layerKey,
        src: assetSrc(asset),
        kind,
        active: true,
        assetId: asset.id,
      };
      this.layers = this.layers
        .map((layer) => ({ ...layer, active: false }))
        .concat(next)
        .slice(-2);

      if (kind === "image") {
        this.timerId = setTimeout(() => this.advance(), this.imageMs);
      }
    },
    onVideoMeta() {
      this.videoTimerId = setTimeout(() => this.advance(), this.videoMs);
    },
    advance() {
      if (!this.assets.length) return;
      let next: IEventAsset | null = null;
      while (this.pendingNewIds.length && !next) {
        const id = this.pendingNewIds.shift();
        next = this.assets.find((a) => a.id === id) || null;
      }
      if (!next) {
        const currentId = this.layers.find((l) => l.active)?.assetId;
        next = pickRandomAsset(this.assets, currentId);
      }
      this.showAsset(next);
    },
  },
});
</script>

<style lang="scss" scoped>
.kb {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #070605;
}
.kb-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.1s ease;
  z-index: 1;
}
.kb-layer.is-active {
  opacity: 1;
  z-index: 2;
}
.kb-asset {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.kb-contain {
  object-fit: contain !important;
}
.kb-subtle .kb-asset {
  animation: kb-subtle 12s ease-in-out both;
}
.kb-medium .kb-asset {
  animation: kb-medium 10s ease-in-out both;
}
.kb-layer.is-video .kb-asset {
  animation: none;
}
.kb--reduced .kb-asset {
  animation: none !important;
}
.kb-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: rgba(247, 242, 235, 0.7);
  font-weight: 700;
}
@keyframes kb-subtle {
  from {
    transform: scale(1) translate(0, 0);
  }
  to {
    transform: scale(1.06) translate(-1.2%, 0.8%);
  }
}
@keyframes kb-medium {
  from {
    transform: scale(1) translate(0, 0);
  }
  to {
    transform: scale(1.12) translate(1.8%, -1.2%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .kb-asset {
    animation: none !important;
  }
  .kb-layer {
    transition: opacity 0.2s linear;
  }
}
</style>
