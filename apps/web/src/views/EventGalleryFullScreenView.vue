<template>
  <div
    class="full-screen-gallery bg--dark"
    :class="{ 'has-guest-cta': showGuestCta }"
    v-if="event"
    @mousemove="onMouseMove"
  >
    <div
      class="gallery-header bg--white display--flex justify--space-between align--center"
      :class="{ 'is-visible': showHeader }"
      @mouseenter="onHeaderMouseEnter"
      @mouseleave="onHeaderMouseLeave"
    >
      <div>
        <label
          v-if="hasBlockedAssets && !showGuestCta"
          class="blocked-toggle pointer display--flex align--center"
        >
          <input
            type="checkbox"
            :checked="showBlockedGalleryAssets"
            @change="toggleBlockedGalleryAssets"
          />
          <small class="margin--right-small">הצג חסומות</small>
        </label>
        <strong class="pointer" @click="toggleFullScreen()">
          <MainIcon :icon="screenIcon" />
        </strong>
      </div>
      <div>
        <h1 class="title--large screen-name text--center">
          {{ event.name }}
        </h1>
      </div>
      <div>
        <router-link v-if="showGuestCta" :to="`/event/open-gallery/${event.path}`">
          <MainIcon icon="grid_view" />
        </router-link>
        <router-link v-else to="/event/gallery">
          <MainIcon icon="close" />
        </router-link>
      </div>
    </div>
    <div class="gallery-content">
      <EventTriviaLiveStage v-if="triviaPhase === 'live' && triviaScreen" :screen="triviaScreen" />
      <EventTriviaPodium v-else-if="triviaPhase === 'results' && triviaScreen" :screen="triviaScreen" />
      <component v-else :is="selectedAlbum"></component>
      <EventQR
        v-if="triviaPhase === 'photos'"
        class="qr-code"
        :background="background"
      />
      <strong class="logo">SnapShare</strong>
      <p v-if="arrival" class="live-arrival">תמונה חדשה עלתה</p>
    </div>
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
    }, 4000);
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

    showGuestCta(): boolean {
      return this.$route.name === "guestAlbum";
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
.full-screen-gallery {
  position: fixed;
  z-index: 1000;
  inset: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;

  .gallery-content {
    height: 100%;
    width: 100%;
    margin: auto;
    display: flex;
    position: relative;
  }

  .gallery-header {
    position: absolute;
    left: 0;
    right: 0;
    width: auto;
    top: 0;
    height: 70px;
    padding: 0 30px;
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.35s ease;

    &.is-visible {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .qr-code {
    position: absolute;
    left: 30px;
    bottom: 30px;
    margin: auto;
    text-align: center;
  }

  .logo {
    position: absolute;
    left: 35px;
    bottom: 18px;
    margin: auto;
    text-align: center;
    color: var(--gold, #c9a36a);
    font-family: var(--brand, Outfit, sans-serif);
    letter-spacing: -0.04em;
  }

  .gallery-header {
    background: rgba(18, 16, 14, 0.88);
    color: #f7f2eb;
  }

  .screen-name { color: var(--gold, #c9a36a); font-family: var(--font, Heebo, sans-serif); }
  .live-arrival {
    position: absolute;
    top: 86px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    background: var(--rose, #dc5b66);
    color: #fff;
    font-weight: 800;
    border-radius: 999px;
    padding: 6px 14px;
    font-family: var(--font, Heebo, sans-serif);
  }
}

.full-screen-gallery {
  background: var(--espresso, #12100e);
}
.full-screen-gallery.has-guest-cta .qr-code {
  bottom: 108px;
}
.full-screen-gallery.has-guest-cta .logo {
  bottom: 108px;
}

.blocked-toggle input {
  margin-left: 8px;
}
</style>

