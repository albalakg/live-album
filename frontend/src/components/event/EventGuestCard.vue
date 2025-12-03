<template>
  <div
    class="gallery-asset-wrapper"
    :class="{
      'padding--small': true,
      'padding--no-right': isFirstOfLine && !$bp.isMobile,
      assetIndex: true,
    }"
  >
    <div
      class="gallery-asset position--relative bg--dark height--full width--full brs--medium"
    >
      <a
        :href="asset.fullPath"
        :download="fileName"
        class="gallery-download-icon"
      >
        <!-- <MainIcon icon="open_in_new" size="1.3em" /> -->
        <MainIcon icon="download" size="1.3em" />
      </a>
      <span
        @click="shareAsset()"
        class="gallery-share-icon"
      >
        <!-- <MainIcon icon="open_in_new" size="1.3em" /> -->
        <MainIcon icon="share" size="1.3em" />
      </span>

      <!-- Image -->
      <img
        v-if="asset.type === 'image'"
        :src="asset.fullPath"
        alt="event image"
        class="album-asset brs--medium"
        loading="lazy"
      />

      <!-- Video -->
      <div
        v-else-if="asset.type === 'video'"
        class="video-wrapper brs--medium"
        @mouseenter="playVideo"
        @mouseleave="pauseVideo"
      >
        <video
          ref="videoEl"
          :src="asset.fullPath"
          class="album-asset brs--medium"
          muted
          loop
        ></video>
        <div v-if="!isPlaying" class="video-overlay">
          <MainIcon
            icon="play_circle"
            size="3em"
            color="#ddd"
            :background="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IEventAsset } from "@/helpers/interfaces";
import { defineComponent, PropType } from "vue";
import MainIcon from "../library/general/MainIcon.vue";
import { EventAssetsManagementModesType } from "@/helpers/types";

export default defineComponent({
  name: "EventGuestCard",

  components: {
    MainIcon,
  },

  props: {
    loading: {
      type: Boolean,
      required: true,
    },

    assetIndex: {
      type: Number,
      default: 1,
    },

    eventName: {
      type: String,
      required: true,
    },

    asset: {
      type: Object as PropType<IEventAsset>,
      required: true,
    },
  },

  data() {
    return {
      isPlaying: false,
    };
  },

  computed: {
    assetsIds(): number[] {
      return this.$store.getters["event/getManagedAssetsIds"];
    },

    isPicked(): boolean {
      return this.assetsIds.includes(this.asset.id);
    },

    isFirstOfLine(): boolean {
      return this.assetIndex % 5 == 0;
    },

    mode(): EventAssetsManagementModesType | null {
      return this.$store.getters["event/getManagedAssetsMode"];
    },

    fileName(): string {
      const extension = this.asset.type === "image" ? "jpg" : "mp4";
      return `${this.eventName}-${this.assetIndex}.${extension}`;
    },
  },

  methods: {
    async shareAsset() {
      try {
        if (!(navigator as any).share) return;

        await (navigator as any).share({
          title: "Share media",
          url: this.asset.fullPath,
        });
      } catch (e) {
        // user can cancel share; no need to treat as error
        console.warn("Share canceled/failed:", e);
      }
    },

    downloadAsset() {
      this.$store.dispatch("event/downloadAsset", this.asset.id);
    },

    togglePickedAssets(assetId: number) {
      if (this.isPicked) {
        this.$store.dispatch("event/removeAssetFromAssetsManagement", assetId);
      } else {
        this.$store.dispatch("event/addAssetForAssetsManagement", assetId);
      }
    },

    async playVideo() {
      const video = this.$refs.videoEl as HTMLVideoElement;
      if (video && !this.isPlaying) {
        try {
          await video.play();
          this.isPlaying = true;
        } catch (e) {
          console.warn("בעיה בהפעלת וידאו:", e);
        }
      }
    },

    pauseVideo() {
      const video = this.$refs.videoEl as HTMLVideoElement;
      if (video && this.isPlaying) {
        video.pause();
        video.currentTime = 0;
        this.isPlaying = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.gallery-asset-wrapper {
  text-align: center;
  height: calc((70vw - 64px) / 5);
  width: calc(20% - 32px);

  @media only screen and (max-width: 600px) {
    width: calc(50% - 12px);
    height: 150px;
    padding: 6px;
  }

  .gallery-asset-chip {
    background-color: #222d;
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 1;
  }

  .album-asset {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .gallery-download-icon,
  .gallery-share-icon {
    position: absolute;
    left: 10px;
    top: 2px;
    z-index: 2;
    text-align: center;
  }

  .gallery-share-icon {
    left: 40px;
  }

  .video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .video-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    background-color: #0008;
    z-index: 3;
    pointer-events: none;
    opacity: 0.9;
    border-radius: 50%;
    padding: 1px 4px 4px 4px;
  }
}
</style>
