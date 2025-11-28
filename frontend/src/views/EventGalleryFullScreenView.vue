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
      <EventGallery />
    </div>
  </div>
</template>

<script lang="ts">
import { IEvent, IEventAsset } from "@/helpers/interfaces";
import { defineComponent } from "vue";
import EventGallery from "@/components/event/EventGallery.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";

export default defineComponent({
  name: "GalleryView",

  components: {
    EventGallery,
    MainIcon,
  },

  data() {
    return {
      isFullScreen: false as boolean,
      interval: undefined as undefined | any,
    };
  },

  created() {
    this.$store.dispatch("event/getEventGalleryAssets");
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.$store.dispatch("event/getEventGalleryAssets");
      }, 10000);
    }
  },
  computed: {
    event(): IEvent | null {
      return this.$store.getters["event/getEvent"];
    },

    screenIcon(): string {
      return this.isFullScreen ? "fullscreen_exit" : "fullscreen";
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
    clearInterval(this.interval);

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
}
</style>
