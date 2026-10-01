<template>
  <div
    class="gallery-media-frame"
    :class="{ 'gallery-media-frame--watermarked': showWatermark }"
  >
    <slot />
    <div v-if="showWatermark" class="gallery-trial-watermark" aria-hidden="true">
      <span class="gallery-trial-watermark__text">SnapShare</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EventGalleryMediaFrame",

  computed: {
    showWatermark(): boolean {
      return Boolean(
        this.$store.getters["event/showTrialGalleryWatermark"]
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.gallery-media-frame {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gallery-trial-watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

.gallery-trial-watermark__text {
  color: rgba(255, 255, 255, 0.42);
  font-size: clamp(1.5rem, 8vw, 4.5rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transform: rotate(-24deg);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  user-select: none;
}
</style>
