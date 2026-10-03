<template>
  <div
    @click.stop="$emit('onClick', assetIndex)"
    class="gallery-asset-wrapper"
    :class="{
      'padding--small': !modalView,
      'padding--no-right': !modalView && isFirstOfLine && !$bp.isMobile,
      'gallery-asset-wrapper--modal': modalView,
      assetIndex: true,
    }"
  >
    <div
      class="gallery-asset position--relative bg--dark height--full width--full brs--medium"
      :class="{ 'gallery-asset--blocked': isBlocked }"
    >
      <div
        v-if="bulkSelectable"
        class="gallery-asset-chip padding--x-small brs--large"
        @click.stop
      >
        <MainCheckbox
          :disabled="loading || !mode"
          :ref="`asset-checkbox-${asset.id}`"
          @onClick="togglePickedAssets(asset.id)"
          title="לחצו בשביל לבחור"
          :value="isPicked"
        />
      </div>
      <a
        :href="asset.fullPath"
        :download="fileName"
        class="gallery-download-icon"
      >
        <MainIcon bgColor="#fff8" icon="download" animation size="1.3em" />
      </a>
      <a :href="asset.fullPath" target="_blank" class="gallery-view-icon">
        <MainIcon
          animation
          icon="open_in_new"
          size="1.3em"
          title="פתיחה במסך מלא"
          bgColor="#fff8"
        />
      </a>
      <span v-if="showVisibilityIcon" class="gallery-visible-icon">
        <MainIcon
          animation
          :bgColor="asset.is_displayed ? '#fff8' : '#f68589cc'"
          :icon="asset.is_displayed ? 'visibility' : 'visibility_off'"
          :title="asset.is_displayed ? 'מוצג בגלריה' : 'מוסתר מהגלריה'"
          size="1.3em"
        />
      </span>
      <span
        v-if="moderationBadgeText && !showBlockedFooter"
        class="gallery-moderation-badge"
        :class="moderationBadgeClass"
        :title="moderationBadgeTitle"
      >
        {{ moderationBadgeText }}
      </span>
      <div
        v-if="isBlocked"
        class="gallery-blocked-overlay"
        :class="{ 'gallery-blocked-overlay--with-footer': showBlockedFooter }"
      >
        <MainIcon icon="block" size="2.2em" color="#fff" :background="false" />
      </div>
      <div v-if="showBlockedFooter" class="gallery-blocked-footer">
        <span
          class="gallery-blocked-label"
          :title="moderationBadgeTitle"
        >
          חסום
        </span>
        <button
          class="gallery-unblock-button"
          :disabled="unblockLoading"
          @click.stop="$emit('onUnblock', asset.id)"
        >
          {{ unblockLoading ? "מבטל..." : "בטל חסימה" }}
        </button>
      </div>

      <EventAssetModal />

      <!-- Image -->
      <div class="height--full width--full" @click="openAssetModal()">
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
            :controls="controls"
            :autoplay="autoplay"
          ></video>
          <div v-if="!isPlaying && !controls" class="video-overlay">
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
  </div>
</template>

<script lang="ts">
import {
  AssetModerationStatusEnum,
  getAssetModerationStatus,
} from "@/helpers/enums";
import { IEvent, IEventAsset } from "@/helpers/interfaces";
import { defineComponent, PropType } from "vue";
import MainCheckbox from "@/components/library/inputs/MainCheckbox.vue";
import MainIcon from "../library/general/MainIcon.vue";
import { EventAssetsManagementModesType } from "@/helpers/types";
import EventAssetModal from "./EventAssetModal.vue";

export default defineComponent({
  name: "EventAssetCard",

  components: {
    MainCheckbox,
    MainIcon,
    EventAssetModal,
  },

  emits: ["onClick", "open-asset-modal", "onUnblock"],

  props: {
    loading: {
      type: Boolean,
      required: true,
    },

    assetIndex: {
      type: Number,
      default: 1,
    },

    asset: {
      type: Object as PropType<IEventAsset>,
      required: true,
    },

    controls: {
      type: Boolean,
      required: false,
    },

    autoplay: {
      type: Boolean,
      required: false,
    },

    bulkSelectable: {
      type: Boolean,
      default: true,
    },

    allowUnblock: {
      type: Boolean,
      default: false,
    },

    unblockLoading: {
      type: Boolean,
      default: false,
    },

    modalView: {
      type: Boolean,
      default: false,
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

    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },

    fileName(): string {
      const extension = this.asset.type === "image" ? "jpg" : "mp4";
      return `${this.event.name}-${this.assetIndex}.${extension}`;
    },

    normalizedModerationStatus(): AssetModerationStatusEnum {
      return getAssetModerationStatus(this.asset);
    },

    isBlocked(): boolean {
      return this.normalizedModerationStatus === AssetModerationStatusEnum.BLOCKED;
    },

    isPending(): boolean {
      return this.normalizedModerationStatus === AssetModerationStatusEnum.PENDING;
    },

    showVisibilityIcon(): boolean {
      return (
        this.bulkSelectable &&
        this.normalizedModerationStatus === AssetModerationStatusEnum.ACTIVE
      );
    },

    moderationBadgeText(): string {
      if (this.isPending) return "בבדיקה";
      if (this.isBlocked) return "חסום";
      return "";
    },

    moderationBadgeClass(): string {
      if (this.isPending) return "gallery-moderation-badge--pending";
      if (this.isBlocked) return "gallery-moderation-badge--blocked";
      return "";
    },

    moderationBadgeTitle(): string {
      if (this.isBlocked && this.asset.moderation_labels?.length) {
        return this.asset.moderation_labels.join(", ");
      }
      if (this.isBlocked && this.asset.moderation_source === "manual") {
        return "התמונה נחסמה ידנית על ידי בעל האירוע";
      }
      if (this.isBlocked) {
        return "התמונה נחסמה אוטומטית ואינה מוצגת באלבום החי";
      }
      if (this.isPending) {
        return "התמונה בבדיקת תוכן לפני הצגה באלבום";
      }
      return "";
    },

    showBlockedFooter(): boolean {
      return this.allowUnblock && this.isBlocked;
    },
  },

  watch: {
    controls: {
      immediate: true,
      handler(newVal: boolean) {
        this.isPlaying = newVal || false;
      },
    },
  },

  methods: {
    togglePickedAssets(assetId: number) {
      if (this.isPicked) {
        this.$store.dispatch("event/removeAssetFromAssetsManagement", assetId);
      } else {
        this.$store.dispatch("event/addAssetForAssetsManagement", assetId);
      }
    },

    async playVideo() {
      if (this.controls) return;

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
      if (this.controls) return;

      const video = this.$refs.videoEl as HTMLVideoElement;
      if (video && this.isPlaying) {
        video.pause();
        video.currentTime = 0;
        this.isPlaying = false;
      }
    },

    openAssetModal() {
      if (this.modalView) return;
      this.$emit("open-asset-modal", this.asset);
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
  .gallery-view-icon,
  .gallery-visible-icon {
    position: absolute;
    left: 10px;
    top: 10px;
    z-index: 2;
    text-align: center;
  }

  .gallery-view-icon {
    left: 40px;
  }

  .gallery-visible-icon {
    left: 70px;
  }

  .gallery-moderation-badge {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 3;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 999px;
    color: #fff;
  }

  .gallery-moderation-badge--pending {
    background-color: #e6a817cc;
  }

  .gallery-moderation-badge--blocked {
    background-color: #c62828cc;
  }

  .gallery-asset--blocked .album-asset {
    filter: grayscale(0.45) brightness(0.85);
  }

  .gallery-blocked-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.45) 100%
    );
    pointer-events: none;

    &--with-footer {
      align-items: flex-start;
      padding-top: 28%;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.15) 0%,
        rgba(0, 0, 0, 0.35) 55%,
        rgba(0, 0, 0, 0.7) 100%
      );
    }
  }

  .gallery-blocked-footer {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    background: rgba(18, 18, 18, 0.82);
    backdrop-filter: blur(4px);
  }

  .gallery-blocked-label {
    flex-shrink: 0;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    color: #fff;
    background-color: #c62828;
    white-space: nowrap;
  }

  .gallery-unblock-button {
    flex-shrink: 0;
    border: none;
    border-radius: 999px;
    padding: 5px 12px;
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1.2;
    color: #fff;
    background-color: #2e7d32;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: background-color 0.15s ease, transform 0.15s ease;

    &:hover:not(:disabled) {
      background-color: #388e3c;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
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

.gallery-asset-wrapper--modal {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  padding: 0;

  .gallery-asset {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
  }

  .album-asset {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .video-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
</style>
