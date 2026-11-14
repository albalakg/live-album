<template>
  <div
    @click.stop="onTileClick"
    class="gallery-asset-wrapper"
    :class="{
      'gallery-asset-wrapper--modal': modalView,
      'gallery-asset-wrapper--selected': isPicked,
      'gallery-asset-wrapper--selecting': selectionActive && bulkSelectable,
      'gallery-asset-wrapper--blocked': isBlocked,
    }"
  >
    <div
      class="gallery-asset"
      :class="{ 'gallery-asset--blocked': isBlocked }"
    >
      <button
        v-if="bulkSelectable"
        type="button"
        class="tile-check"
        :class="{
          'tile-check--visible': showSelectionChrome,
          'tile-check--on': isPicked,
        }"
        :disabled="loading"
        :aria-pressed="isPicked"
        :title="isPicked ? 'הסרה מהבחירה' : 'בחירת קובץ'"
        @click.stop="togglePickedAssets(asset.id)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">check</span>
      </button>

      <button
        v-if="!modalView"
        type="button"
        class="tile-fav"
        :class="{ on: asset.is_favorite }"
        :title="asset.is_favorite ? 'הסרה ממועדפים' : 'הוספה למועדפים'"
        @click.stop="toggleFavorite"
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          {{ asset.is_favorite ? "favorite" : "favorite_border" }}
        </span>
      </button>

      <span
        v-if="showVisibilityIcon"
        class="tile-status"
        :class="{ 'tile-status--hidden': !asset.is_displayed }"
        :title="asset.is_displayed ? 'מוצג בגלריה' : 'מוסתר מהגלריה'"
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          {{ asset.is_displayed ? "visibility" : "visibility_off" }}
        </span>
      </span>

      <span
        v-else-if="moderationBadgeText && !showBlockedFooter"
        class="tile-badge"
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
        <span class="material-symbols-outlined blocked-glyph" aria-hidden="true">
          block
        </span>
      </div>

      <div v-if="showBlockedFooter" class="gallery-blocked-footer">
        <span class="gallery-blocked-label" :title="moderationBadgeTitle">
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

      <div class="media-surface">
        <img
          v-if="asset.type === 'image'"
          :src="asset.fullPath"
          alt="event image"
          class="album-asset"
          loading="lazy"
        />

        <div
          v-else-if="asset.type === 'video'"
          class="video-wrapper"
          @mouseenter="playVideo"
          @mouseleave="pauseVideo"
        >
          <video
            ref="videoEl"
            :src="asset.fullPath"
            class="album-asset"
            muted
            :controls="controls"
            :autoplay="autoplay"
          ></video>
          <div v-if="!isPlaying && !controls" class="video-overlay">
            <span class="material-symbols-outlined" aria-hidden="true">
              play_circle
            </span>
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
import { IEventAsset } from "@/helpers/interfaces";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "EventAssetCard",

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

    selectionActive: {
      type: Boolean,
      default: false,
    },

    selectOnTileClick: {
      type: Boolean,
      default: false,
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
        !this.modalView &&
        this.normalizedModerationStatus === AssetModerationStatusEnum.ACTIVE &&
        !this.asset.is_displayed
      );
    },

    showSelectionChrome(): boolean {
      return this.selectionActive || this.isPicked;
    },

    moderationBadgeText(): string {
      if (this.isPending) return "בבדיקה";
      if (this.isBlocked) return "חסום";
      return "";
    },

    moderationBadgeClass(): string {
      if (this.isPending) return "tile-badge--pending";
      if (this.isBlocked) return "tile-badge--blocked";
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
    onTileClick() {
      if (this.selectOnTileClick && this.bulkSelectable && !this.modalView) {
        this.togglePickedAssets(this.asset.id);
        return;
      }
      this.$emit("onClick", this.assetIndex);
    },

    togglePickedAssets(assetId: number) {
      if (this.loading) return;
      if (this.isPicked) {
        this.$store.dispatch("event/removeAssetFromAssetsManagement", assetId);
      } else {
        this.$store.dispatch("event/addAssetForAssetsManagement", assetId);
      }
    },

    async toggleFavorite() {
      await this.$store.dispatch("event/favoriteAssets", {
        assets: [this.asset.id],
        is_favorite: !this.asset.is_favorite,
      });
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
  },
});
</script>

<style lang="scss" scoped>
.gallery-asset-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  min-width: 0;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  background: #161310;
  border: 1px solid transparent;
  box-shadow: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(22, 19, 16, 0.22) 0%,
      transparent 32%,
      transparent 70%,
      rgba(22, 19, 16, 0.18) 100%
    );
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  &:hover,
  &:focus-within,
  &.gallery-asset-wrapper--selecting,
  &.gallery-asset-wrapper--selected {
    &::after {
      opacity: 1;
    }
  }

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-within .tile-check,
  &:hover .tile-check,
  .tile-check--visible {
    opacity: 1;
    pointer-events: auto;
  }
}

.gallery-asset-wrapper--selected {
  border-color: rgba(220, 91, 102, 0.7);
  box-shadow: 0 0 0 2px rgba(220, 91, 102, 0.28);
}

.gallery-asset {
  position: absolute !important;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #161310;
}

.tile-check {
  position: absolute;
  inset-inline-end: 10px;
  top: 10px;
  z-index: 4;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 252, 250, 0.75);
  background: rgba(255, 252, 250, 0.82);
  color: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, background 0.15s ease, border-color 0.15s ease,
    transform 0.15s ease;
  box-shadow: 0 2px 8px rgba(18, 16, 14, 0.16);

  .material-symbols-outlined {
    font-size: 1rem;
    font-variation-settings: "FILL" 1, "wght" 600, "GRAD" 0, "opsz" 20;
    line-height: 1;
  }

  &:hover:not(:disabled) {
    transform: scale(1.04);
    background: #fffcfa;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.tile-check--on {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  border-color: transparent;
  color: #fff;
}

.tile-check--visible {
  opacity: 1;
  pointer-events: auto;
}

.tile-fav {
  position: absolute;
  inset-inline-start: 10px;
  top: 10px;
  z-index: 4;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 252, 250, 0.82);
  color: #8a8278;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(18, 16, 14, 0.16);
}
.tile-fav.on {
  color: #dc5b66;
}
.tile-fav .material-symbols-outlined {
  font-size: 1.05rem;
  font-variation-settings: "FILL" 1, "wght" 600, "GRAD" 0, "opsz" 20;
}

.tile-status {
  position: absolute;
  inset-inline-start: 10px;
  bottom: 10px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(220, 91, 102, 0.92);
  border: 1px solid transparent;
  color: #fff;
  box-shadow: 0 2px 8px rgba(18, 16, 14, 0.1);

  .material-symbols-outlined {
    font-size: 0.95rem;
    line-height: 1;
  }
}

.tile-status--hidden {
  background: rgba(220, 91, 102, 0.92);
  border-color: transparent;
  color: #fff;
}

.tile-badge {
  position: absolute;
  inset-inline-end: 10px;
  bottom: 10px;
  z-index: 3;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 999px;
  letter-spacing: 0.01em;
  box-shadow: 0 2px 8px rgba(18, 16, 14, 0.1);
}

.tile-badge--pending {
  background: rgba(230, 168, 23, 0.92);
  color: #fff;
}

.tile-badge--blocked {
  background: rgba(198, 40, 40, 0.92);
  color: #fff;
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

.blocked-glyph {
  font-size: 2.2rem;
  color: #fff;
  opacity: 0.92;
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
  background: rgba(22, 19, 16, 0.82);
  backdrop-filter: blur(6px);
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

.media-surface {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  overflow: hidden;
}

.album-asset {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 14px;
}

.video-wrapper {
  position: absolute;
  inset: 0;
}

.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  pointer-events: none;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(22, 19, 16, 0.55);
  color: #fffcfa;
  box-shadow: 0 4px 16px rgba(18, 16, 14, 0.25);

  .material-symbols-outlined {
    font-size: 1.85rem;
    line-height: 1;
  }
}

.gallery-asset-wrapper--modal {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: auto;
  border-radius: 0;
  overflow: visible;
  background: transparent;
  border: 0;
  box-shadow: none;

  &::after {
    display: none;
  }

  &:hover {
    transform: none;
    box-shadow: none;
  }

  .gallery-asset {
    position: relative !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
    border-radius: 0;
    overflow: visible;
  }

  .media-surface {
    position: relative;
    inset: auto;
    width: 100%;
    height: 100%;
    border-radius: 0;
    overflow: visible;
  }

  .album-asset {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 4px;
  }

  .video-wrapper {
    position: relative;
    inset: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .tile-check,
  .tile-status,
  .tile-badge {
    display: none;
  }
}

@media (hover: none) {
  .gallery-asset-wrapper:not(.gallery-asset-wrapper--modal) {
    &::after {
      opacity: 0.4;
    }

    .tile-check {
      opacity: 1;
      pointer-events: auto;
    }
  }
}
</style>
