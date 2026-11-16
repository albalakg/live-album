<template>
  <div ref="stage" class="polaroid" :class="{ 'polaroid--reduced': !allowMotion }">
    <div
      v-for="card in cards"
      :key="card.key"
      class="polaroid-card"
      :class="{ 'is-new': card.fresh }"
      :style="card.style"
    >
      <EventGalleryMediaFrame>
        <img
          v-if="!isVideo(card.asset) || playingKey !== card.key"
          :src="thumb(card.asset)"
          class="polaroid-asset"
          alt=""
        />
        <video
          v-else
          :src="src(card.asset)"
          class="polaroid-asset"
          autoplay
          muted
          loop
          playsinline
        />
      </EventGalleryMediaFrame>
    </div>
    <p v-if="!cards.length" class="polaroid-empty">ממתינים לתמונות…</p>
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

interface Card {
  key: number;
  asset: IEventAsset;
  style: Record<string, string>;
  fresh: boolean;
}

export default defineComponent({
  name: "EventGalleryPolaroid",
  components: { EventGalleryMediaFrame },
  data() {
    return {
      cards: [] as Card[],
      counter: 0,
      playingKey: -1,
      spawnId: null as ReturnType<typeof setInterval> | null,
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
    maxCards(): number {
      const count = readLiveScreenOptions(this.event).polaroid_count || 10;
      return Math.min(12, Math.max(8, count));
    },
  },
  watch: {
    assets: {
      immediate: true,
      handler(list: IEventAsset[]) {
        if (!list.length) return;
        if (!this.cards.length) {
          this.seed();
        }
        if (!this.seenReady) {
          list.forEach((a) => this.seenIds.add(a.id));
          this.seenReady = true;
          return;
        }
        const fresh = list.filter((a) => !this.seenIds.has(a.id));
        list.forEach((a) => this.seenIds.add(a.id));
        fresh.slice(-3).forEach((asset) => this.addCard(asset, true));
      },
    },
    maxCards() {
      this.cards = this.cards.slice(0, this.maxCards);
    },
  },
  mounted() {
    this.allowMotion = motionAllowed();
    this.spawnId = setInterval(() => {
      const asset = pickRandomAsset(this.assets);
      if (asset) this.addCard(asset, false);
    }, 2800);
  },
  beforeUnmount() {
    if (this.spawnId) clearInterval(this.spawnId);
  },
  methods: {
    isVideo: isVideoAsset,
    thumb: assetThumb,
    src: assetSrc,
    seed() {
      const start = this.assets.slice(0, Math.min(this.maxCards, this.assets.length));
      start.forEach((asset) => this.addCard(asset, false));
    },
    addCard(asset: IEventAsset, fresh: boolean) {
      const style = this.safeStyle();
      const card: Card = {
        key: ++this.counter,
        asset,
        style,
        fresh,
      };
      this.cards = [...this.cards, card].slice(-this.maxCards);
      this.pickPlaying();
      if (fresh) {
        setTimeout(() => {
          const found = this.cards.find((c) => c.key === card.key);
          if (found) found.fresh = false;
        }, 1600);
      }
    },
    pickPlaying() {
      const video = this.cards.find((card) => isVideoAsset(card.asset));
      this.playingKey = video ? video.key : -1;
    },
    safeStyle(): Record<string, string> {
      const el = this.$refs.stage as HTMLElement | undefined;
      const W = el?.clientWidth || window.innerWidth;
      const H = el?.clientHeight || window.innerHeight;
      // Keep cards out of QR quiet zone (all corners padded)
      const pad = 24;
      const qr = 200;
      const size = Math.min(W, H) * 0.2;
      const cols = 4;
      const rows = 3;
      const col = this.counter % cols;
      const row = Math.floor(this.counter / cols) % rows;
      const cellW = (W - pad * 2) / cols;
      const cellH = (H - pad * 2 - 40) / rows;
      let x = pad + col * cellW + Math.random() * Math.max(8, cellW - size - 8);
      let y = pad + row * cellH + Math.random() * Math.max(8, cellH - size - 8);
      const overlapsQr =
        (x < qr && y > H - qr - 40) ||
        (x > W - qr - size && y > H - qr - 40) ||
        (x < qr && y < qr) ||
        (x > W - qr - size && y < qr);
      if (overlapsQr) {
        x = W / 2 - size / 2 + (Math.random() * 80 - 40);
        y = H / 2 - size / 2 + (Math.random() * 80 - 40);
      }
      const rotate = Math.floor(Math.random() * 16 - 8);
      return {
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        transform: `rotate(${rotate}deg)`,
        zIndex: String(this.counter),
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.polaroid {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #070605;
}
.polaroid-card {
  position: absolute;
  padding: 10px 10px 28px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  border-radius: 4px;
  box-sizing: border-box;
}
.polaroid-card.is-new {
  animation: polaroid-in 0.7s ease both;
}
.polaroid-asset {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  background: #111;
}
.polaroid-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: rgba(247, 242, 235, 0.7);
  font-weight: 700;
}
@keyframes polaroid-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.92);
  }
  to {
    opacity: 1;
  }
}
.polaroid--reduced .polaroid-card.is-new {
  animation: none;
}
@media (prefers-reduced-motion: reduce) {
  .polaroid-card.is-new {
    animation: none;
  }
}
</style>
