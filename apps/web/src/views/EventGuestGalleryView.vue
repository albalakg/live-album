<template>
  <div v-if="event" class="guest-gallery" :class="{ 'has-select-bar': selectMode }">
    <header class="guest-gallery-head">
      <div class="guest-gallery-head__row">
        <p class="live-pill"><i></i> LIVE</p>
        <button
          type="button"
          class="select-toggle"
          :aria-pressed="selectMode"
          @click="toggleSelectMode"
        >
          {{ selectMode ? "ביטול" : "בחירה" }}
        </button>
      </div>
      <h1>{{ event.name }}</h1>
      <p>{{ assets.length }} תמונות באלבום</p>
    </header>
    <div class="guest-masonry">
      <div
        v-for="(asset, index) in assets"
        :key="asset.id || index"
        class="tile-wrap"
        :class="{
          'is-fresh': freshIds.includes(asset.id),
          'is-selected': selectMode && selectedIds.includes(asset.id),
          'select-mode': selectMode,
        }"
      >
        <button
          type="button"
          class="tile"
          @click="onTileClick(index)"
        >
          <img v-if="asset.type !== 'video'" :src="asset.fullPath" alt="" />
          <video v-else :src="asset.fullPath" muted></video>
          <span v-if="selectMode" class="tile-check" aria-hidden="true">
            <span class="tile-check__mark" />
          </span>
        </button>
        <button
          v-if="!selectMode"
          type="button"
          class="tile-download"
          aria-label="הורדת תמונה"
          :disabled="busy"
          @click.stop="downloadOne(index)"
          @keydown.enter.stop.prevent="downloadOne(index)"
          @keydown.space.stop.prevent="downloadOne(index)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">download</span>
        </button>
      </div>
    </div>
    <p v-if="!loading && assets.length === 0" class="empty">עוד אין תמונות באלבום.</p>
      <GuestAlbumCta />

    <div
      v-if="selectMode"
      class="select-bar"
      role="toolbar"
      aria-label="הורדת תמונות"
    >
      <button
        type="button"
        class="select-bar__btn select-bar__btn--primary"
        :disabled="busy || selectedIds.length === 0"
        @click="downloadSelected"
      >
        הורדת {{ selectedIds.length }} נבחרות
      </button>
      <button
        type="button"
        class="select-bar__btn"
        :disabled="busy || assets.length === 0"
        @click="downloadAll"
      >
        הורדת הכל
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="progressOpen"
      class="dl-progress"
      role="dialog"
      aria-modal="true"
      aria-label="התקדמות הורדה"
      @click.self="onProgressBackdrop"
    >
      <div class="dl-progress__card">
        <h2>{{ progressTitle }}</h2>
        <p v-if="!progressError" class="dl-progress__status">
          {{ progressCurrent }} / {{ progressTotal }} קבצים · {{ progressPercent }}%
        </p>
        <div v-if="!progressError" class="dl-progress__track" aria-hidden="true">
          <div class="dl-progress__fill" :style="{ width: progressPercent + '%' }" />
        </div>
        <p v-if="progressError" class="dl-progress__error" role="alert">
          {{ progressError }}
        </p>
        <div class="dl-progress__actions">
          <button
            v-if="progressError"
            type="button"
            class="select-bar__btn select-bar__btn--primary"
            @click="retryProgress"
          >
            נסו שוב
          </button>
          <button
            type="button"
            class="select-bar__btn"
            @click="closeProgress"
          >
            {{ progressError ? "סגירה" : "ביטול" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

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
      <div class="lightbox-content lightbox-content--with-actions" @click.stop>
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
        <div class="lightbox-actions" role="group" aria-label="פעולות קובץ">
          <button
            type="button"
            class="lb-btn lb-btn--download"
            :disabled="busy"
            @click="downloadOne(currentAssetIndex)"
          >
            <span class="material-symbols-outlined" aria-hidden="true">download</span>
            הורדה
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import GuestAlbumCta from "@/components/event/GuestAlbumCta.vue";
import {
  downloadSingleAsset,
  eventSlugFrom,
  zipAndDownloadAssets,
  type DownloadProgress,
} from "@/helpers/guestGalleryDownload";

type PendingJob =
  | { kind: "single"; index: number }
  | { kind: "many"; ids: number[] };

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
      selectMode: false as boolean,
      selectedIds: [] as number[],
      busy: false as boolean,
      progressOpen: false as boolean,
      progressCurrent: 0 as number,
      progressTotal: 0 as number,
      progressPercent: 0 as number,
      progressTitle: "מוריד…" as string,
      progressError: "" as string,
      progressAbort: null as AbortController | null,
      pendingJob: null as PendingJob | null,
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
    eventSlug(): string {
      return eventSlugFrom(this.event);
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
    this.progressAbort?.abort();
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
    toggleSelectMode() {
      this.selectMode = !this.selectMode;
      if (!this.selectMode) this.selectedIds = [];
      if (this.selectMode && this.isModalOpened) this.closeModal();
    },
    onTileClick(index: number) {
      if (this.selectMode) {
        this.toggleSelected(this.assets[index]?.id);
        return;
      }
      this.openModal(index);
    },
    toggleSelected(id: number | undefined) {
      if (id == null) return;
      const i = this.selectedIds.indexOf(id);
      if (i >= 0) this.selectedIds.splice(i, 1);
      else this.selectedIds.push(id);
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
      if (this.progressOpen) {
        if (e.key === "Escape") this.closeProgress();
        return;
      }
      if (!this.isModalOpened) return;
      if (e.key === "ArrowRight") this.changeAsset(this.currentAssetIndex - 1);
      else if (e.key === "ArrowLeft") this.changeAsset(this.currentAssetIndex + 1);
      else if (e.key === "Escape") this.closeModal();
    },
    corsHint(err: unknown): string {
      const msg = String((err as Error)?.message || err || "");
      if (
        /Failed to fetch|NetworkError|CORS|TypeError/i.test(msg) ||
        msg === "missing_url"
      ) {
        return "לא ניתן להוריד את הקובץ (ייתכן חסימת CORS). נסו שוב או פנו למארחים.";
      }
      return "ההורדה נכשלה. נסו שוב.";
    },
    beginProgress(title: string, total: number) {
      this.progressAbort?.abort();
      this.progressAbort = new AbortController();
      this.progressOpen = true;
      this.progressError = "";
      this.progressTitle = title;
      this.progressCurrent = 0;
      this.progressTotal = total;
      this.progressPercent = 0;
      this.busy = true;
    },
    onZipProgress(p: DownloadProgress) {
      this.progressCurrent = p.current;
      this.progressTotal = p.total;
      this.progressPercent = p.percent;
      if (p.phase === "pack") this.progressTitle = "אורז קבצים…";
      else if (p.phase === "save") this.progressTitle = "שומר…";
      else this.progressTitle = "מוריד…";
    },
    closeProgress() {
      this.progressAbort?.abort();
      this.progressAbort = null;
      this.progressOpen = false;
      this.progressError = "";
      this.busy = false;
      this.pendingJob = null;
    },
    onProgressBackdrop() {
      if (this.progressError) this.closeProgress();
    },
    async retryProgress() {
      const job = this.pendingJob;
      if (!job) {
        this.closeProgress();
        return;
      }
      this.progressError = "";
      if (job.kind === "single") await this.runSingleDownload(job.index);
      else await this.runZipDownload(job.ids);
    },
    async downloadOne(index: number) {
      this.pendingJob = { kind: "single", index };
      await this.runSingleDownload(index);
    },
    async runSingleDownload(index: number) {
      const asset = this.assets[index];
      if (!asset) return;
      this.beginProgress("מוריד…", 1);
      this.progressCurrent = 1;
      this.progressPercent = 30;
      try {
        await downloadSingleAsset({
          asset,
          slug: this.eventSlug,
          index1Based: index + 1,
          signal: this.progressAbort?.signal,
        });
        this.progressPercent = 100;
        this.closeProgress();
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          this.closeProgress();
          return;
        }
        this.progressError = this.corsHint(err);
        this.busy = false;
      }
    },
    async downloadSelected() {
      const ids = [...this.selectedIds];
      if (!ids.length) return;
      this.pendingJob = { kind: "many", ids };
      await this.runZipDownload(ids);
    },
    async downloadAll() {
      const ids = this.assets.map((a) => a.id);
      if (!ids.length) return;
      this.pendingJob = { kind: "many", ids };
      await this.runZipDownload(ids);
    },
    async runZipDownload(ids: number[]) {
      const pairs = this.assets
        .map((asset, index) => ({ asset, index1Based: index + 1 }))
        .filter((p) => ids.includes(p.asset.id));
      if (!pairs.length) return;
      this.beginProgress(
        pairs.length === 1 ? "מוריד…" : "מוריד קבצים…",
        pairs.length
      );
      try {
        if (pairs.length === 1) {
          await downloadSingleAsset({
            asset: pairs[0].asset,
            slug: this.eventSlug,
            index1Based: pairs[0].index1Based,
            signal: this.progressAbort?.signal,
          });
          this.closeProgress();
          return;
        }
        await zipAndDownloadAssets({
          assets: pairs.map((p) => p.asset),
          indices1Based: pairs.map((p) => p.index1Based),
          slug: this.eventSlug,
          zipName: `${this.eventSlug}-album.zip`,
          signal: this.progressAbort?.signal,
          onProgress: this.onZipProgress,
        });
        this.closeProgress();
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          this.closeProgress();
          return;
        }
        this.progressError = this.corsHint(err);
        this.busy = false;
      }
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
  direction: rtl;
}
.guest-gallery.has-select-bar {
  padding-bottom: 160px;
}
.guest-gallery-head {
  width: min(1100px, 100%);
  margin: 0 auto 16px;
}
.guest-gallery-head__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.guest-gallery-head h1 {
  font-weight: 900;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
}
.select-toggle {
  appearance: none;
  border: 1.5px solid rgba(22, 19, 16, 0.18);
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink, #161310);
  font-family: inherit;
  font-weight: 800;
  font-size: 0.9rem;
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
}
.select-toggle[aria-pressed="true"] {
  background: #12100e;
  color: #fff;
  border-color: #12100e;
}
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
  .guest-masonry {
    columns: 4;
  }
}
.tile-wrap {
  position: relative;
  display: block;
  width: 100%;
  margin: 0 0 10px;
  break-inside: avoid;
  border-radius: 16px;
  overflow: hidden;
}
.tile {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}
.tile img,
.tile video {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transform: scale(1.08);
}
.tile-wrap.is-selected .tile::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 3px solid #1f7a45;
  border-radius: 16px;
  pointer-events: none;
  box-sizing: border-box;
}
.tile-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(18, 16, 14, 0.45);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.tile-wrap.is-selected .tile-check {
  background: #1f7a45;
  border-color: #1f7a45;
}
.tile-check__mark {
  width: 10px;
  height: 6px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg) translate(1px, -1px);
  opacity: 0;
}
.tile-wrap.is-selected .tile-check__mark {
  opacity: 1;
}
.tile-download {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #161310;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 4px 14px rgba(18, 16, 14, 0.18);
  /* Always visible on narrow / touch viewports */
  opacity: 1;
  transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.tile-download .material-symbols-outlined {
  font-size: 1.25rem;
  line-height: 1;
}
.tile-download:disabled {
  opacity: 0.5;
  cursor: progress;
}
.tile-download:focus {
  outline: none;
  opacity: 1 !important;
}
.tile-download:focus-visible {
  outline: 2px solid #161310;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9), 0 4px 14px rgba(18, 16, 14, 0.18);
  opacity: 1 !important;
}
.tile-wrap:focus-within .tile-download {
  opacity: 1 !important;
}
/* Desktop: hide until hover/focus so the grid stays clean */
@media (min-width: 800px) {
  .tile-download {
    opacity: 0;
  }
  .tile-wrap:hover .tile-download {
    opacity: 1;
  }
}
.is-fresh {
  animation: snapshare-live-in 0.65s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes snapshare-live-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-fresh {
    animation: none;
  }
}
.empty {
  text-align: center;
  color: var(--muted, #5e564e);
}

.select-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom, 0px));
  background: rgba(18, 16, 14, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.2);
  direction: rtl;
}
.select-bar__btn {
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.92);
  color: #161310;
}
.select-bar__btn--primary {
  background: #1f7a45;
  color: #fff;
}
.select-bar__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.dl-progress {
  position: fixed;
  inset: 0;
  z-index: 30000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(18, 16, 14, 0.55);
  direction: rtl;
}
.dl-progress__card {
  width: min(380px, 100%);
  background: #f3eee6;
  color: #161310;
  border-radius: 20px;
  padding: 22px 20px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
}
.dl-progress__card h2 {
  margin: 0 0 8px;
  font-size: 1.15rem;
  font-weight: 900;
}
.dl-progress__status {
  margin: 0 0 12px;
  color: #5e564e;
  font-weight: 600;
}
.dl-progress__track {
  height: 8px;
  border-radius: 999px;
  background: rgba(22, 19, 16, 0.12);
  overflow: hidden;
  margin-bottom: 16px;
}
.dl-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #1f7a45, #2fbe6a);
  border-radius: inherit;
  transition: width 0.2s ease;
}
.dl-progress__error {
  margin: 0 0 14px;
  color: #a33;
  font-weight: 700;
  line-height: 1.45;
}
.dl-progress__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

.lightbox .lb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 999px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
}
.lightbox .lb-btn .material-symbols-outlined {
  font-size: 1.15rem;
  line-height: 1;
}
.lightbox .lb-btn--download {
  background: #1f7a45;
  color: #fff;
  box-shadow: 0 4px 14px rgba(31, 122, 69, 0.28);
}
.lightbox .lb-btn--download:disabled {
  opacity: 0.65;
  cursor: progress;
}
</style>

<style lang="scss">
/* Unscoped: pierce GuestAlbumCta sticky bar while select mode is on (desktop) */
@media (min-width: 800px) {
  .guest-gallery.has-select-bar .guest-cta {
    display: none !important;
  }
}
</style>
