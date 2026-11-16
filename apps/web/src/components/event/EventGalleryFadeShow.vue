<template>
  <div class="fade-show">
    <transition name="fade-cut" mode="out-in">
      <div v-if="current" :key="current.id" class="fade-frame">
        <EventGalleryMediaFrame>
          <img
            v-if="!isVideo(current)"
            :src="src(current)"
            class="fade-asset album-asset fade-contain"
            alt=""
          />
          <video
            v-else
            :src="src(current)"
            class="fade-asset album-asset fade-contain"
            autoplay
            muted
            playsinline
            @ended="next"
            @loadedmetadata="onVideoMeta"
          />
        </EventGalleryMediaFrame>
      </div>
      <p v-else key="empty" class="fade-empty">ממתינים לתמונות…</p>
    </transition>
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
  pickRandomAsset,
  videoDisplayMs,
} from "@/helpers/liveScreenRuntime";

export default defineComponent({
  name: "EventGalleryFadeShow",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      current: null as IEventAsset | null,
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
        if (!this.current) this.show(pickRandomAsset(list));
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id));
        list.forEach((a) => this.seenIds.add(a.id));
        if (fresh.length) this.show(fresh[fresh.length - 1]);
      },
    },
  },
  beforeUnmount() {
    if (this.timerId) clearTimeout(this.timerId);
  },
  methods: {
    isVideo: isVideoAsset,
    src: assetSrc,
    clearTimer() {
      if (this.timerId) clearTimeout(this.timerId);
      this.timerId = null;
    },
    show(asset: IEventAsset | null) {
      if (!asset) return;
      this.clearTimer();
      this.current = asset;
      if (!isVideoAsset(asset)) {
        this.timerId = setTimeout(() => this.next(), imageDisplayMs(this.event));
      }
    },
    onVideoMeta() {
      this.clearTimer();
      this.timerId = setTimeout(() => this.next(), videoDisplayMs(this.event));
    },
    next() {
      this.show(pickRandomAsset(this.assets, this.current?.id));
    },
  },
});
</script>

<style lang="scss" scoped>
.fade-show {
  position: absolute;
  inset: 0;
  background: #070605;
  overflow: hidden;
}
.fade-frame {
  position: absolute;
  inset: 0;
}
.fade-asset {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.fade-contain {
  object-fit: contain !important;
}
.fade-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: rgba(247, 242, 235, 0.7);
  font-weight: 700;
}
.fade-cut-enter-active,
.fade-cut-leave-active {
  transition: opacity 0.45s ease;
}
.fade-cut-enter-from,
.fade-cut-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-cut-enter-active,
  .fade-cut-leave-active {
    transition: none;
  }
}
</style>
