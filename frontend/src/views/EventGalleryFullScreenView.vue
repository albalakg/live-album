<template>
  <div class="gallery bg--dark" v-if="event">
    <div class="gallery-header bg--white display--flex justify--space-between align--center">
      <div>
        <strong class="pointer" @click="toggleFullScreen()">
          {{ screenText }}
        </strong>
      </div>
      <div>
        <h1 class="title--large text--pink">
          {{ event.name }}
        </h1>
      </div>
      <div>
        <router-link to="/event/gallery">
          <strong class="pointer">
            יציאה
          </strong>
        </router-link>
      </div>
    </div>
    <div class="gallery-content"></div>
  </div>
</template>

<script lang="ts">
import { IEvent, IEventAsset } from '@/helpers/interfaces';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GalleryView',

  components: {

  },

  data() {
    return {
      isFullScreen: false as boolean,
    };
  },

  computed: {
    event(): IEvent | null {
      return this.$store.getters["event/getEvent"];
    },

    screenText(): string {
      return this.isFullScreen ? 'הורד מסך מלא' : 'מסך מלא';
    }
  },

  methods: {
    toggleFullScreen() {
      const elem = document.getElementsByTagName('body')[0];
      this.isFullScreen = !this.isFullScreen;
      if (this.isFullScreen) {
        (elem as any).requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  },

  beforeUnmount() {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error exiting fullscreen mode:", err);
    }
  }
});
</script>

<style lang="scss" scoped>
.gallery {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100vw;

  .gallery-header {
    position: absolute;
    width: calc(100% - 60px);
    top: 0;
    height: 70px;
    padding: 0 30px;
  }
}
</style>
