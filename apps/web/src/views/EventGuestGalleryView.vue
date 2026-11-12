<template>
  <div v-if="event" class="guest-gallery">
    <header class="guest-gallery-head">
      <p class="live-pill"><i></i> LIVE</p>
      <h1>{{ event.name }}</h1>
      <p>{{ assets.length }} תמונות באלבום</p>
    </header>
    <div class="guest-masonry">
      <button
        v-for="(asset, index) in assets"
        :key="asset.id || index"
        type="button"
        class="tile"
        :class="{ 'is-fresh': freshIds.includes(asset.id) }"
        @click="openModal(index)"
      >
        <img v-if="asset.type !== 'video'" :src="asset.fullPath" alt="" />
        <video v-else :src="asset.fullPath" muted></video>
      </button>
    </div>
    <p v-if="!loading && assets.length === 0" class="empty">עוד אין תמונות באלבום.</p>
    <GuestAlbumCta />
  </div>
  <div v-if="isModalOpened" class="lightbox" @click="isModalOpened = false">
    <span class="lightbox-close lightbox-icon">&times;</span>
    <button @click.stop="changeAsset(currentAssetIndex + 1)" class="lightbox-next lightbox-icon">&#10094;</button>
    <button @click.stop="changeAsset(currentAssetIndex - 1)" class="lightbox-prev lightbox-icon">&#10095;</button>
    <div class="lightbox-content" @click.stop>
      <img v-if="currentAsset && currentAsset.type !== 'video'" class="lightbox-asset" :src="currentAsset.fullPath" alt="" />
      <video v-else-if="currentAsset" class="lightbox-asset" :src="currentAsset.fullPath" controls autoplay></video>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import GuestAlbumCta from "@/components/event/GuestAlbumCta.vue";

export default defineComponent({
  name: "EventGuestGalleryView",
  components: { GuestAlbumCta },
  data() {
    return {
      loading: true as boolean,
      isModalOpened: false as boolean,
      currentAssetIndex: 0 as number,
      freshIds: [] as number[],
      seenIds: new Set<number>(),
      seenReady: false,
      pollId: null as ReturnType<typeof setInterval> | null,
    };
  },
  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getActiveGuestAssets"];
    },
    event(): any {
      return this.$store.getters["event/getEvent"];
    },
    currentAsset(): IEventAsset {
      return this.assets[this.currentAssetIndex];
    },
  },
  async created() {
    await this.getEventDetails();
    if (this.$route.params.event_path === "preview") return;
    this.pollId = setInterval(() => this.getEventDetails(), 10000);
  },
  mounted() {
    window.addEventListener("keydown", this.onKey);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKey);
    if (this.pollId) clearInterval(this.pollId);
  },
  methods: {
    async getEventDetails() {
      const eventPath = this.$route.params.event_path;
      if (eventPath === "preview") {
        await this.$store.dispatch("event/loadSampleAlbum", "guest");
      } else {
        await this.$store.dispatch("event/getEventGuestGallery", eventPath);
      }
      this.markFresh();
      this.loading = false;
    },
    markFresh() {
      const fresh: number[] = [];
      this.assets.forEach((asset) => {
        if (this.seenReady && !this.seenIds.has(asset.id)) fresh.push(asset.id);
        this.seenIds.add(asset.id);
      });
      this.seenReady = true;
      this.freshIds = fresh;
    },
    openModal(assetIndex: number) {
      this.isModalOpened = true;
      this.currentAssetIndex = assetIndex;
    },
    changeAsset(newIndex: number) {
      if (newIndex < 0) this.currentAssetIndex = this.assets.length - 1;
      else if (newIndex >= this.assets.length) this.currentAssetIndex = 0;
      else this.currentAssetIndex = newIndex;
    },
    onKey(e: KeyboardEvent) {
      if (!this.isModalOpened) return;
      if (e.key === "ArrowRight") this.changeAsset(this.currentAssetIndex - 1);
      else if (e.key === "ArrowLeft") this.changeAsset(this.currentAssetIndex + 1);
      else if (e.key === "Escape") this.isModalOpened = false;
    },
    doNone() {
      return undefined;
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/lightbox.scss";

.guest-gallery {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background: var(--ivory, #f3eee6);
  color: var(--ink, #161310);
  font-family: var(--font, Heebo, sans-serif);
  padding: 28px 20px 120px;
}
.guest-gallery-head { width: min(1100px, 100%); margin: 0 auto 16px; }
.guest-gallery-head h1 { font-weight: 900; font-size: clamp(1.6rem, 4vw, 2.4rem); }
.live-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  background: #111;
  color: #5ee392;
  border-radius: 999px;
  padding: 3px 10px;
  font-family: var(--brand, Outfit, sans-serif);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.live-pill i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--live, #2fbe6a);
}
.guest-masonry {
  width: min(1100px, 100%);
  margin: 0 auto;
  columns: 2;
  column-gap: 12px;
}
@media (min-width: 800px) {
  .guest-masonry { columns: 4; }
}
.tile {
  display: block;
  width: 100%;
  margin: 0 0 10px;
  padding: 0;
  border: 0;
  background: transparent;
  break-inside: avoid;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
}
.tile img, .tile video {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transform: scale(1.08);
}
.lightbox-asset {
  max-width: min(92vw, 1100px);
  max-height: 86vh;
  object-fit: contain;
}
.is-fresh { animation: snapshare-live-in 0.65s cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes snapshare-live-in {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .is-fresh { animation: none; }
}
.empty { text-align: center; color: var(--muted, #5e564e); }
</style>
