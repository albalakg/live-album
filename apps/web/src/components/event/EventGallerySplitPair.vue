<template>
  <div class="pair">
    <div v-for="(slot, index) in slots" :key="index" class="pair-cell">
      <EventGalleryMediaFrame v-if="slot">
        <img
          v-if="!isVideo(slot) || playingIndex !== index"
          :src="src(slot)"
          class="pair-asset"
          alt=""
        />
        <video
          v-else
          :src="src(slot)"
          class="pair-asset"
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
  imageDisplayMs,
  isVideoAsset,
  pickRandomAsset,
} from "@/helpers/liveScreenRuntime";

export default defineComponent({
  name: "EventGallerySplitPair",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      slots: [null, null] as Array<IEventAsset | null>,
      timerId: null as ReturnType<typeof setInterval> | null,
      playingIndex: 0,
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
        if (!this.slots[0]) this.fill();
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id));
        list.forEach((a) => this.seenIds.add(a.id));
        if (fresh.length) {
          this.slots.splice(0, 1, fresh[fresh.length - 1]);
          this.pickPlaying();
        }
      },
    },
  },
  mounted() {
    this.timerId = setInterval(() => {
      const index = Math.floor(Math.random() * 2);
      this.slots.splice(index, 1, pickRandomAsset(this.assets, this.slots[index]?.id));
      this.pickPlaying();
    }, Math.max(2500, imageDisplayMs(this.event)));
  },
  beforeUnmount() {
    if (this.timerId) clearInterval(this.timerId);
  },
  methods: {
    isVideo: isVideoAsset,
    src: assetSrc,
    fill() {
      this.slots = [
        pickRandomAsset(this.assets),
        pickRandomAsset(this.assets),
      ];
      this.pickPlaying();
    },
    pickPlaying() {
      const videoIndexes = this.slots
        .map((slot, index) => (isVideoAsset(slot) ? index : -1))
        .filter((index) => index >= 0);
      this.playingIndex = videoIndexes[0] ?? -1;
    },
  },
});
</script>

<style lang="scss" scoped>
.pair {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
  box-sizing: border-box;
  background: #070605;
}
.pair-cell {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: #111;
}
.pair-asset {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
@media (max-width: 700px) {
  .pair {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
</style>
