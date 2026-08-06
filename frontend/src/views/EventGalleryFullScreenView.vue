<template>
  <div
    class="full-screen-gallery bg--dark"
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
          v-if="hasBlockedAssets"
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
        <h1 class="title--large text--pink text--center">
          {{ event.name }}
        </h1>
      </div>
      <div>
        <router-link to="/event/gallery">
          <MainIcon icon="close" />
        </router-link>
      </div>
    </div>
    <div class="gallery-content">
      <component :is="selectedAlbum"></component>
      <EventQR
        class="qr-code"
        :background="background"
      />
      <strong class="logo text--pink">SnapShare</strong>
    </div>
  </div>
</template>

<script lang="ts">
import { IEvent } from "@/helpers/interfaces";
import { defineComponent } from "vue";
import EventGallerySingle from "@/components/event/EventGallerySingle.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import EventQR from "@/components/event/EventQR.vue";
import EventGallerySplitScreen from "@/components/event/EventGallerySplitScreen.vue";
import EventGalleryRandom from "@/components/event/EventGalleryRandom.vue";
import EventGalleryGrid3X3 from "@/components/event/EventGalleryGrid3X3.vue";

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
  },

  data() {
    return {
      isFullScreen: false as boolean,
      background: "#fff" as string,
      galleryPollIntervalId: null as ReturnType<typeof setInterval> | null,
      showHeader: true as boolean,
      isHoveringHeader: false as boolean,
      hideHeaderTimeoutId: null as ReturnType<typeof setTimeout> | null,
    };
  },

  created() {
    this.$store.dispatch("event/getEventGalleryAssets");
    this.$store.dispatch("event/getEventAssets");
    this.galleryPollIntervalId = setInterval(() => {
      this.$store.dispatch("event/getEventGalleryAssets");
    }, 10000);
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
  },

  beforeUnmount() {
    this.clearHideHeaderTimeout();
    if (this.galleryPollIntervalId) {
      clearInterval(this.galleryPollIntervalId);
      this.galleryPollIntervalId = null;
    }
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
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  height: 100vh;
  min-height: fit-content;
  width: 100vw;

  .gallery-content {
    height: 100vh;
    width: 100%;
    margin: auto;
    display: flex;
    position: relative;
  }

  .gallery-header {
    position: absolute;
    width: calc(100% - 60px);
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
    bottom: 10px;
    margin: auto;
    text-align: center;
  }
}

.blocked-toggle input {
  margin-left: 8px;
}
</style>

