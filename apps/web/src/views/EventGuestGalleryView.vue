<template>
  <div v-if="event" class="guest-gallery">
    <header class="guest-gallery-head">
      <p class="live-pill"><i></i> LIVE</p>
      <h1>{{ event.name }}</h1>
      <p>{{ assets.length }} תמונות באלבום</p>
    </header>
    <div class="guest-grid">
      <div
        v-for="(asset, index) in assets"
        :key="asset.id || index"
        :class="{ 'is-fresh': freshIds.includes(asset.id) }"
      >
        <EventGuestCard
          class="pointer"
          :loading="loading"
          :assetIndex="index"
          :asset="asset"
          :eventName="event.name"
          @onClick="openModal"
        />
      </div>
    </div>
    <p v-if="!loading && assets.length === 0" class="empty">עוד אין תמונות באלבום.</p>
    <GuestAlbumCta />
  </div>
  <div v-if="isModalOpened" class="lightbox" @click="isModalOpened = false">
    <span class="lightbox-close lightbox-icon">&times;</span>
    <button @click.stop="changeAsset(currentAssetIndex + 1)" class="lightbox-next lightbox-icon">&#10094;</button>
    <button @click.stop="changeAsset(currentAssetIndex - 1)" class="lightbox-prev lightbox-icon">&#10095;</button>
    <div class="lightbox-content" @click.stop>
      <EventGuestCard
        class="lightbox-asset"
        modalView
        :loading="loading"
        :assetIndex="0"
        :asset="currentAsset"
        :eventName="event.name"
        @onClick="doNone"
        controls
        autoplay
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import EventGuestCard from "@/components/event/EventGuestCard.vue";
import GuestAlbumCta from "@/components/event/GuestAlbumCta.vue";

export default defineComponent({
  name: "EventGuestGalleryView",
  components: { EventGuestCard, GuestAlbumCta },
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
  background: var(--ivory, #f3eee6);
  color: var(--ink, #161310);
  font-family: var(--font, Heebo, sans-serif);
  padding: 28px 16px 110px;
}
.guest-gallery-head { max-width: 1100px; margin: 0 auto 16px; }
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
.guest-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.guest-gallery .guest-grid .gallery-asset-wrapper {
  width: 100% !important;
  height: 180px !important;
  padding: 0 !important;
}
@media (min-width: 800px) {
  .guest-grid { grid-template-columns: repeat(4, 1fr); }
  .guest-gallery .guest-grid .gallery-asset-wrapper { height: 220px !important; }
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
