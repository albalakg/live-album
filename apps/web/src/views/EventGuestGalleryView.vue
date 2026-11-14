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
  <Teleport to="body">
    <div
      v-if="isModalOpened && currentAsset"
      ref="lightboxRoot"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="תצוגת מדיה"
      tabindex="-1"
      @click="closeModal"
      @keydown="onLightboxKeydown"
      @touchstart.passive="onLightboxTouchStart"
      @touchend.passive="onLightboxTouchEnd"
    >
      <button
        type="button"
        class="lightbox-close lightbox-icon"
        aria-label="סגירה"
        @click.stop="closeModal"
      >
        &times;
      </button>
      <button
        type="button"
        class="lightbox-next lightbox-icon"
        aria-label="הקודם"
        @click.stop="changeAsset(currentAssetIndex + 1)"
      >
        &#10094;
      </button>
      <button
        type="button"
        class="lightbox-prev lightbox-icon"
        aria-label="הבא"
        @click.stop="changeAsset(currentAssetIndex - 1)"
      >
        &#10095;
      </button>
      <div class="lightbox-content" @click.stop>
        <div class="lightbox-stage">
          <div
            v-if="lightboxMediaLoading"
            class="lightbox-spinner"
            aria-hidden="true"
          />
          <p v-if="lightboxMediaFailed" class="lightbox-error" role="status">
            לא ניתן לטעון את הקובץ
          </p>
          <img
            v-if="currentAsset.type !== 'video'"
            :key="'lb-img-' + currentAsset.id + '-' + lightboxMediaSrc"
            class="lightbox-asset"
            :class="{ 'is-loading': lightboxMediaLoading }"
            :src="lightboxMediaSrc"
            alt=""
            @load="onLightboxMediaLoad"
            @error="onLightboxMediaError"
          />
          <video
            v-else
            :key="'lb-vid-' + currentAsset.id + '-' + lightboxMediaSrc"
            ref="lightboxVideo"
            class="lightbox-asset"
            :class="{ 'is-loading': lightboxMediaLoading }"
            :src="lightboxMediaSrc"
            controls
            playsinline
            webkit-playsinline
            autoplay
            @loadeddata="onLightboxMediaLoad"
            @error="onLightboxMediaError"
          />
        </div>
      </div>
    </div>
  </Teleport>
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
      lightboxMediaSrc: "" as string,
      lightboxMediaLoading: false as boolean,
      lightboxMediaFailed: false as boolean,
      lightboxUsedThumbFallback: false as boolean,
      lightboxFocusBefore: null as HTMLElement | null,
      lightboxTouchX: null as number | null,
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
  watch: {
    isModalOpened(open: boolean) {
      if (typeof document !== "undefined") {
        document.body.classList.toggle("lightbox-open", open);
      }
      if (open) {
        this.$nextTick(() => this.activateLightboxFocus());
      } else {
        this.pauseLightboxVideo();
        this.restoreLightboxFocus();
      }
    },
    currentAssetIndex() {
      if (!this.isModalOpened) return;
      this.pauseLightboxVideo();
      this.resetLightboxMediaSrc();
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
    if (typeof document !== "undefined") {
      document.body.classList.remove("lightbox-open");
    }
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
      this.currentAssetIndex = assetIndex;
      this.resetLightboxMediaSrc();
      this.isModalOpened = true;
    },
    closeModal() {
      this.pauseLightboxVideo();
      this.isModalOpened = false;
    },
    assetThumbUrl(asset: IEventAsset | null | undefined): string {
      if (!asset) return "";
      return (
        asset.thumbPath ||
        asset.thumbnail ||
        asset.thumb_url ||
        asset.thumbnail_url ||
        ""
      );
    },
    resetLightboxMediaSrc() {
      const asset = this.currentAsset;
      this.lightboxUsedThumbFallback = false;
      this.lightboxMediaFailed = false;
      this.lightboxMediaLoading = Boolean(asset?.fullPath);
      this.lightboxMediaSrc = asset?.fullPath || this.assetThumbUrl(asset) || "";
      if (!this.lightboxMediaSrc) {
        this.lightboxMediaLoading = false;
        this.lightboxMediaFailed = true;
      }
    },
    onLightboxMediaLoad() {
      this.lightboxMediaLoading = false;
      this.lightboxMediaFailed = false;
    },
    onLightboxMediaError() {
      const thumb = this.assetThumbUrl(this.currentAsset);
      if (
        !this.lightboxUsedThumbFallback &&
        thumb &&
        thumb !== this.lightboxMediaSrc
      ) {
        this.lightboxUsedThumbFallback = true;
        this.lightboxMediaLoading = true;
        this.lightboxMediaFailed = false;
        this.lightboxMediaSrc = thumb;
        return;
      }
      this.lightboxMediaLoading = false;
      this.lightboxMediaFailed = true;
    },
    pauseLightboxVideo() {
      const video = this.$refs.lightboxVideo as HTMLVideoElement | undefined;
      if (video) {
        try {
          video.pause();
        } catch {
          /* ignore */
        }
      }
    },
    lightboxFocusables(): HTMLElement[] {
      const root = this.$refs.lightboxRoot as HTMLElement | undefined;
      if (!root) return [];
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], video, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        if (el.hasAttribute("disabled")) return false;
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });
    },
    activateLightboxFocus() {
      const active = document.activeElement;
      this.lightboxFocusBefore =
        active instanceof HTMLElement ? active : null;
      const root = this.$refs.lightboxRoot as HTMLElement | undefined;
      root?.focus({ preventScroll: true });
    },
    restoreLightboxFocus() {
      const prev = this.lightboxFocusBefore;
      this.lightboxFocusBefore = null;
      if (prev && typeof prev.focus === "function") {
        try {
          prev.focus({ preventScroll: true });
        } catch {
          /* ignore */
        }
      }
    },
    trapLightboxFocus(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusables = this.lightboxFocusables();
      if (!focusables.length) {
        e.preventDefault();
        (this.$refs.lightboxRoot as HTMLElement | undefined)?.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || active === this.$refs.lightboxRoot)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    onLightboxKeydown(e: KeyboardEvent) {
      if (!this.isModalOpened) return;
      if (e.key === "Tab") {
        this.trapLightboxFocus(e);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        this.changeAsset(this.currentAssetIndex - 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.changeAsset(this.currentAssetIndex + 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.closeModal();
      }
    },
    onLightboxTouchStart(e: TouchEvent) {
      this.lightboxTouchX = e.changedTouches[0]?.clientX ?? null;
    },
    onLightboxTouchEnd(e: TouchEvent) {
      if (this.lightboxTouchX == null) return;
      const endX = e.changedTouches[0]?.clientX ?? this.lightboxTouchX;
      const delta = endX - this.lightboxTouchX;
      this.lightboxTouchX = null;
      if (Math.abs(delta) < 50) return;
      if (delta > 0) this.changeAsset(this.currentAssetIndex - 1);
      else this.changeAsset(this.currentAssetIndex + 1);
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
      else if (e.key === "Escape") this.closeModal();
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
