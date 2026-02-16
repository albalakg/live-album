<template>
  <div class="full-screen-gallery bg--dark" v-if="event">
    <div
      class="gallery-header bg--white display--flex justify--space-between align--center"
    >
      <div>
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
        v-if="event.config.preview_qr_in_gallery"
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
    };
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
  },

  methods: {
    toggleFullScreen() {
      const elem = document.getElementsByTagName("body")[0];
      this.isFullScreen = !this.isFullScreen;
      if (this.isFullScreen) {
        (elem as any).requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
  },

  beforeUnmount() {
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
    height: calc(100vh - 70px);
    width: 100%;
    top: 70px;
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
</style>
