<template>
  <div class="display-asset-card width--90-mobile">
    <div class="asset-wrapper bg--dark brs--large">
      <img lazy-loading class="width--full height--full brs--large" :src="currentImage" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "DisplayAssetCard",

  props: {
    src: {
      type: String,
      default: "",
    },

    multipleSrc: {
      type: Array as PropType<string[]> | null,
      default: null,
    },

    imageSwitchTime: {
      type: Number,
      default: 3000,
    },
  },

  data() {
    return {
      interval: undefined as ReturnType<typeof setInterval> | undefined,
      newImageIndex: 0 as number,
    };
  },

  mounted() {
    if (this.multipleSrc) {
      this.switchImages();
    }
  },

  computed: {
    currentImage() {
      return this.multipleSrc ? this.multipleSrc[this.newImageIndex] : this.src;
    },
  },

  methods: {
    clicked() {
      this.$emit("onClick");
    },

    switchImages() {
      this.interval = setInterval(() => {
        this.newImageIndex = this.newImageIndex + 1;
        if (this.newImageIndex > this.multipleSrc.length - 1) {
          this.newImageIndex = 0;
        }
      }, this.imageSwitchTime);
    },
  },
});
</script>

<style scoped lang="scss">
img {
  object-fit: cover;
  height: 100%;
  width: 100%;
}
</style>
