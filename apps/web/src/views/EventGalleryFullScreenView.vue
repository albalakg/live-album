<template>
  <div
    class="stage"
    :class="{ 'has-guest-cta': showGuestCta }"
    v-if="event"
  >
    <header class="stage-bar">
      <p class="stage-live"><i></i> LIVE</p>
      <h1>{{ event.name }}</h1>
      <router-link v-if="showGuestCta" class="stage-link" :to="`/event/open-gallery/${event.path}`">גלריה</router-link>
      <button
        v-else
        class="stage-gear"
        type="button"
        aria-label="הגדרות מסך"
        :aria-expanded="settingsOpen"
        @click="settingsOpen = !settingsOpen"
      >
        הגדרות
      </button>
    </header>
    <div class="stage-screen">
      <EventTriviaPodium
        v-if="showTriviaPodium && triviaScreen"
        :screen="triviaScreen"
        :event-name="event?.name || ''"
      />
      <EventTriviaLiveStage
        v-else-if="showTriviaLive && triviaScreen"
        :screen="triviaScreen"
        :event-name="event?.name || ''"
      />
      <div v-else-if="stageMode === 'mosaic'" class="mosaic">
        <figure v-for="asset in mosaicAssets" :key="asset.id">
          <img v-if="asset.type !== 'video'" :src="asset.fullPath" alt="" />
          <video v-else :src="asset.fullPath" autoplay muted loop></video>
        </figure>
      </div>
      <component v-else class="slideshow" :is="selectedAlbum"></component>
    </div>

    <p v-if="arrival" class="stage-new">תמונה חדשה</p>

    <aside v-if="triviaPhase === 'photos'" class="stage-card" aria-label="כרטיס QR">
      <div class="stage-card-qr">
        <EventQR
          background="#ffffff"
          :size="128"
          :margin="4"
          keep-quiet-zone
        />
      </div>
      <p>סרקו והעלו</p>
    </aside>

    <aside v-if="settingsOpen && !showGuestCta" class="stage-panel">
      <p>תצוגה</p>
      <button
        type="button"
        class="stage-panel-btn"
        :class="{ on: stageMode === 'slideshow' }"
        @click="stageMode = 'slideshow'"
      >
        מצגת
      </button>
      <button
        type="button"
        class="stage-panel-btn"
        :class="{ on: stageMode === 'mosaic' }"
        @click="stageMode = 'mosaic'"
      >
        פסיפס
      </button>
      <label v-if="hasBlockedAssets">
        <input type="checkbox" :checked="showBlockedGalleryAssets" @change="toggleBlockedGalleryAssets" />
        הצג חסומות
      </label>
      <button type="button" class="stage-panel-btn" @click="toggleFullScreen">
        {{ isFullScreen ? "יציאה ממסך מלא" : "מסך מלא" }}
      </button>
      <div class="stage-panel-sep" aria-hidden="true"></div>
      <router-link class="stage-panel-btn" to="/event/gallery">חזרה לניהול</router-link>
    </aside>

    <GuestAlbumCta v-if="showGuestCta" />
  </div>
</template>

<script lang="ts">
import { IEvent } from "@/helpers/interfaces";
import { defineComponent } from "vue";
import axios from "axios";
import EventGallerySingle from "@/components/event/EventGallerySingle.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import EventQR from "@/components/event/EventQR.vue";
import EventGallerySplitScreen from "@/components/event/EventGallerySplitScreen.vue";
import EventGalleryRandom from "@/components/event/EventGalleryRandom.vue";
import EventGalleryGrid3X3 from "@/components/event/EventGalleryGrid3X3.vue";
import EventTriviaLiveStage from "@/components/event/EventTriviaLiveStage.vue";
import EventTriviaPodium from "@/components/event/EventTriviaPodium.vue";
import GuestAlbumCta from "@/components/event/GuestAlbumCta.vue";

const HEADER_HIDE_DELAY_MS = 3000;

export default defineComponent({
  name: "EventGalleryFullScreenView",

  components: {
    EventGallerySingle,
    MainIcon,
    EventQR,
    EventGalleryRandom,
    EventGalleryGrid3X3,
    EventGallerySplitScreen,
    EventTriviaLiveStage,
    EventTriviaPodium,
    GuestAlbumCta,
  },

  data() {
    return {
      isFullScreen: false as boolean,
      background: "#fff" as string,
      galleryPollIntervalId: null as ReturnType<typeof setInterval> | null,
      showHeader: true as boolean,
      isHoveringHeader: false as boolean,
      hideHeaderTimeoutId: null as ReturnType<typeof setTimeout> | null,
      triviaScreen: null as any,
      triviaPollIntervalId: null as ReturnType<typeof setInterval> | null,
      arrival: false,
      seenIds: new Set<number>(),
      seenReady: false,
      arrivalTimer: null as ReturnType<typeof setTimeout> | null,
      stageMode: "slideshow" as "slideshow" | "mosaic",
      settingsOpen: false,
    };
  },

  async created() {
    if (this.$route.name === "previewHost") {
      await this.$store.dispatch("event/loadSampleAlbum", "owner");
      this.scheduleHideHeader();
      return;
    }
    if (this.$store.getters["event/isPreview"]) {
      this.scheduleHideHeader();
      return;
    }
    this.$store.dispatch("event/getEventGalleryAssets");
    this.$store.dispatch("event/getEventAssets");
    this.galleryPollIntervalId = setInterval(() => {
      this.$store.dispatch("event/getEventGalleryAssets");
    }, 10000);
    this.refreshTriviaScreen();
    this.triviaPollIntervalId = setInterval(() => {
      this.refreshTriviaScreen();
    }, 2000);
    this.scheduleHideHeader();
  },

  computed: {
    event(): IEvent | null {
      return this.$store.getters["event/getEvent"];
    },

    screenIcon(): string {
      return this.isFullScreen ? "fullscreen_exit" : "fullscreen";
    },

    selectedAlbum(): string {
      return (
        this.$store.getters["event/getEvent"].config.displayed_gallery ||
        "EventGallerySingle"
      );
    },

    hasBlockedAssets(): boolean {
      return this.$store.getters["event/hasBlockedAssets"];
    },

    showBlockedGalleryAssets(): boolean {
      return this.$store.getters["event/showBlockedGalleryAssets"];
    },

    triviaEventPath(): string {
      const fromRoute = this.$route.params.event_path;
      if (typeof fromRoute === "string" && fromRoute) {
        return fromRoute;
      }
      return this.$store.getters["event/getEventPath"] || "";
    },

    triviaPhase(): string {
      return this.triviaScreen?.phase || "photos";
    },

    triviaCurrentPhase(): string {
      return this.triviaScreen?.current_phase || this.triviaPhase || "photos";
    },

    showTriviaPodium(): boolean {
      if (!this.triviaScreen) return false;
      return (
        this.triviaPhase === "results" || this.triviaCurrentPhase === "podium"
      );
    },

    showTriviaLive(): boolean {
      if (!this.triviaScreen) return false;
      if (this.triviaPhase !== "live") return false;
      return this.triviaCurrentPhase !== "photos";
    },

    showGuestCta(): boolean {
      return this.$route.name === "guestAlbum";
    },

    mosaicAssets(): { id: number; fullPath: string; type?: string }[] {
      const assets = this.$store.getters["event/getDisplayGalleryAssets"] || [];
      return assets.slice(0, 9);
    },

    liveAssetIds(): number[] {
      const assets = this.$store.getters["event/getDisplayGalleryAssets"] || [];
      return assets.map((asset: { id: number }) => asset.id);
    },
  },

  watch: {
    liveAssetIds: {
      immediate: true,
      handler(ids: number[]) {
        if (!this.seenReady) {
          ids.forEach((id) => this.seenIds.add(id));
          this.seenReady = true;
          return;
        }
        const fresh = ids.filter((id) => !this.seenIds.has(id));
        ids.forEach((id) => this.seenIds.add(id));
        if (!fresh.length) return;
        this.arrival = true;
        if (this.arrivalTimer) clearTimeout(this.arrivalTimer);
        this.arrivalTimer = setTimeout(() => {
          this.arrival = false;
        }, 2400);
      },
    },
  },

  methods: {
    onMouseMove() {
      this.showHeader = true;
      if (!this.isHoveringHeader) {
        this.scheduleHideHeader();
      }
    },

    onHeaderMouseEnter() {
      this.isHoveringHeader = true;
      this.showHeader = true;
      this.clearHideHeaderTimeout();
    },

    onHeaderMouseLeave() {
      this.isHoveringHeader = false;
      this.scheduleHideHeader();
    },

    scheduleHideHeader() {
      this.clearHideHeaderTimeout();
      this.hideHeaderTimeoutId = setTimeout(() => {
        if (!this.isHoveringHeader) {
          this.showHeader = false;
        }
      }, HEADER_HIDE_DELAY_MS);
    },

    clearHideHeaderTimeout() {
      if (this.hideHeaderTimeoutId) {
        clearTimeout(this.hideHeaderTimeoutId);
        this.hideHeaderTimeoutId = null;
      }
    },

    toggleFullScreen() {
      const elem = document.getElementsByTagName("body")[0];
      this.isFullScreen = !this.isFullScreen;
      if (this.isFullScreen) {
        (elem as any).requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },

    toggleBlockedGalleryAssets(event: Event) {
      const target = event.target as HTMLInputElement;
      this.$store.dispatch(
        "event/setShowBlockedGalleryAssets",
        target.checked
      );
    },

    async refreshTriviaScreen() {
      const path = this.triviaEventPath;
      if (!path) return;

      try {
        const res = await axios.get(`events/${path}/trivia/screen`);
        this.triviaScreen = res.data?.data || null;
      } catch (error) {
        this.triviaScreen = null;
      }
    },
  },

  beforeUnmount() {
    this.clearHideHeaderTimeout();
    if (this.galleryPollIntervalId) {
      clearInterval(this.galleryPollIntervalId);
      this.galleryPollIntervalId = null;
    }
    if (this.triviaPollIntervalId) {
      clearInterval(this.triviaPollIntervalId);
      this.triviaPollIntervalId = null;
    }
    if (this.arrivalTimer) clearTimeout(this.arrivalTimer);
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error exiting fullscreen mode:", err);
    }
  },
});
</script>

<style lang="scss" scoped>
.stage {
  position: fixed;
  z-index: 1000;
  inset: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  background: #070605;
  color: #f7f2eb;
  font-family: var(--font, Heebo, sans-serif);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.stage-bar {
  flex: none;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 22px;
  background: #12100e;
  z-index: 6;
}
.stage-bar h1 {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 1.35rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #f7f2eb;
}
.stage-brand { color: #c9a36a; font-family: Outfit, Heebo, sans-serif; font-weight: 800; }
.stage-screen { position: relative; flex: 1; min-height: 0; }
.slideshow, .mosaic { position: absolute; inset: 0; }
.slideshow, .stage-screen :deep(.gallery), .stage-screen :deep(.album-wrapper), .stage-screen :deep(.album) {
  width: 100%;
  height: 100%;
}
.stage-screen :deep(.album-asset) {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: cover;
  animation: stage-in 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes stage-in { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .stage-screen :deep(.album-asset) { animation: none; }
}
.mosaic {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  gap: 6px;
  padding: 6px;
}
.mosaic figure { margin: 0; overflow: hidden; border-radius: 10px; }
.mosaic img, .mosaic video { width: 100%; height: 100%; object-fit: cover; display: block; }
.stage-title { display: none; }
.stage-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  color: #5ee392;
  font-family: var(--brand, Outfit, sans-serif);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.stage-live i { width: 7px; height: 7px; border-radius: 50%; background: #2fbe6a; }
.stage-title h1 { margin: 0; font-size: clamp(1.4rem, 3vw, 2.4rem); font-weight: 900; color: #f7f2eb; text-shadow: 0 8px 24px rgba(0,0,0,.45); }
.stage-link { color: var(--gold, #c9a36a); font-weight: 800; }
.stage-new {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  margin: 0;
  background: rgba(18,16,14,.72);
  color: #fff;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 800;
}
.stage-card {
  position: absolute;
  left: max(24px, env(safe-area-inset-left, 0px));
  bottom: max(24px, env(safe-area-inset-bottom, 0px));
  z-index: 8;
  width: 168px;
  padding: 16px 16px 12px;
  border-radius: 18px;
  background: #fff;
  color: #161310;
  text-align: center;
  box-shadow: 0 16px 40px rgba(0,0,0,.35);
  overflow: visible;
  box-sizing: border-box;
}
.stage-card-qr {
  width: 100%;
  display: grid;
  place-items: center;
  overflow: visible;
  background: #fff;
  border-radius: 8px;
}
.stage-card-qr :deep(.qr-code),
.stage-card-qr :deep(svg) {
  width: 100%;
  max-width: 100%;
  height: auto;
  display: block;
}
.stage-card p { margin: 10px 0 0; font-weight: 900; font-size: 0.95rem; }
.stage.has-guest-cta .stage-card {
  bottom: max(108px, calc(84px + env(safe-area-inset-bottom, 0px)));
}
.stage-gear {
  position: static;
  border: 1px solid rgba(255,255,255,.2);
  background: rgba(18,16,14,.55);
  color: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}
.stage-panel {
  position: absolute;
  top: 84px;
  left: 22px;
  z-index: 6;
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(18,16,14,.88);
  color: #fff;
}
.stage-panel-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-height: 40px;
  max-height: 40px;
  margin: 0;
  border: 1px solid rgba(255,255,255,.16);
  background: transparent;
  color: #fff;
  border-radius: 999px;
  padding: 0 12px;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
}
.stage-panel-btn.on { background: #fff; color: #12100e; }
.stage-panel-sep {
  height: 1px;
  margin: 2px 0;
  background: rgba(255,255,255,.14);
}
.stage-panel label { display: flex; gap: 8px; align-items: center; font-weight: 700; }
</style>

