<template>
  <div class="event-assets">
    <header class="page-head">
      <p class="kicker">ניהול מדיה</p>
      <h1>כל הקבצים</h1>
      <p class="lede">
        בחירה, הורדה, הסתרה וחסימה של קבצי האירוע. מומלץ להוריד ישר אחרי האירוע.
      </p>
      <p v-if="isEventActive" class="meta-note">
        בעוד <strong>{{ counter }}</strong> כל קבצי האירוע יימחקו ולא יהיה ניתן להוריד או לשחזר.
      </p>
      <button type="button" class="how-toggle" @click="toggleCollapse">
        איך מורידים
        <MainIcon icon="info" size="1.05em" />
      </button>
      <transition name="collapse">
        <div v-if="isOpen" class="how-body">
          <p>
            מסמנים קבצים (או לוחצים "בחר"), לוחצים "הורדה", וממתינים לארכיון —
            כשיהיה מוכן יופיע כאן כפתור להורדה.
          </p>
        </div>
      </transition>
    </header>

    <section class="upload-strip" aria-label="העלאת קבצים">
      <UploadMedia />
    </section>

    <div
      class="assets-toolbar"
      :class="{ 'assets-toolbar--active': selectionActive }"
      role="toolbar"
      :aria-label="selectionActive ? 'פעולות בחירה' : 'ניהול קבצים'"
    >
      <div class="toolbar-main">
        <div class="selection-meta" aria-live="polite">
          <span class="selection-count">{{ assetsCountLabel }}</span>
          <span
            v-if="selectionActive && totalManagedAssetsIds"
            class="selection-picked"
          >
            נבחרו {{ totalManagedAssetsIds }}
          </span>
          <span
            v-else-if="selectionActive"
            class="selection-hint"
          >
            סמנו קבצים לפעולה
          </span>
        </div>

        <label
          v-if="selectionActive"
          class="select-all"
          :class="{ disabled: loading }"
        >
          <span>הכל</span>
          <MainCheckbox
            :disabled="loading"
            ref="downloadCheckbox"
            @onClick="toggleAllAssets()"
            title="לחצו בשביל לבחור את כולם"
            :value="pickedAll"
          />
        </label>
      </div>

      <div class="toolbar-actions">
        <template v-if="!selectionActive">
          <button
            type="button"
            class="tb-btn tb-btn--select"
            :disabled="loading || !totalAssets"
            @click="enterSelectMode"
          >
            בחר
          </button>
          <a
            v-if="isDownloadProcessFinished"
            class="tb-btn tb-btn--download zip-download"
            :href="downloadProcess.fullPath"
            :download="processFileName"
          >
            הורדת הארכיון
          </a>
        </template>

        <template v-else>
          <div class="toolbar-action-group" :class="{ 'is-ready': canAct }">
            <button
              type="button"
              class="tb-btn tb-btn--download"
              :disabled="!canAct"
              @click="runAction('download')"
            >
              {{ loading ? "טוען..." : "הורדה" }}
            </button>
            <button
              type="button"
              class="tb-btn tb-btn--neutral"
              :disabled="!canAct"
              @click="runAction('hide')"
            >
              הסתרה
            </button>
            <button
              type="button"
              class="tb-btn tb-btn--warn"
              :disabled="!canAct"
              @click="runAction('block')"
            >
              חסימה
            </button>
            <button
              type="button"
              class="tb-btn tb-btn--danger"
              :disabled="!canAct"
              @click="runAction('delete')"
            >
              מחיקה
            </button>
          </div>
          <button
            type="button"
            class="tb-btn tb-btn--ghost"
            :disabled="loading"
            @click="exitSelectMode"
          >
            ביטול
          </button>
          <a
            v-if="isDownloadProcessFinished"
            class="tb-btn tb-btn--download zip-download"
            :href="downloadProcess.fullPath"
            :download="processFileName"
          >
            הורדת הארכיון
          </a>
        </template>
      </div>
    </div>

    <section class="assets-body" aria-label="ספריית מדיה">
      <div v-if="!ownerVisibleAssets.length" class="assets-empty">
        <p>עדיין אין קבצים להצגה.</p>
        <p class="assets-empty-hint">העלו תמונות או סרטונים למעלה.</p>
      </div>
      <div v-else class="assets-grid">
        <EventAssetCard
          v-for="(asset, index) in ownerVisibleAssets"
          :key="'asset-' + asset.id"
          class="pointer"
          :loading="loading"
          :assetIndex="index"
          :asset="asset"
          :selectionActive="selectionActive"
          :selectOnTileClick="selectionActive"
          @onClick="openModal"
        />
      </div>
    </section>

    <section class="moderation-shell">
      <button
        type="button"
        class="moderation-toggle"
        :aria-expanded="moderationOpen"
        @click="toggleModeration"
      >
        <div class="moderation-toggle-text">
          <p class="kicker">בדיקת תוכן</p>
          <strong>תור בדיקה</strong>
        </div>
        <div class="moderation-badges">
          <span v-if="pendingCount" class="badge badge--pending">
            {{ pendingCount }} ממתינות
          </span>
          <span v-if="blockedCount" class="badge badge--blocked">
            {{ blockedCount }} חסומות
          </span>
          <span v-if="!pendingCount && !blockedCount" class="badge badge--idle">
            ריק
          </span>
          <MainIcon
            :icon="moderationOpen ? 'expand_less' : 'expand_more'"
            size="1.35em"
          />
        </div>
      </button>
      <div v-show="moderationOpen" class="moderation-panel">
        <EventModerationSection class="moderation-section" />
      </div>
    </section>

    <div v-if="isModalOpened" class="lightbox" @click="isModalOpened = false">
      <span class="lightbox-close lightbox-icon">&times;</span>
      <button
        @click.stop="changeAsset(currentAssetIndex + 1)"
        class="lightbox-next lightbox-icon"
      >
        &#10094;
      </button>
      <button
        @click.stop="changeAsset(currentAssetIndex - 1)"
        class="lightbox-prev lightbox-icon"
      >
        &#10095;
      </button>
      <div class="lightbox-content lightbox-content--with-actions" @click.stop>
        <EventAssetCard
          class="lightbox-asset"
          modalView
          :bulkSelectable="false"
          :loading="loading"
          :assetIndex="0"
          :asset="currentAsset"
          @onClick="doNone"
          controls
          autoplay
        />
        <div class="lightbox-actions" role="group" aria-label="פעולות קובץ">
          <template v-if="currentAsset">
            <a
              class="lb-btn lb-btn--download"
              :href="currentAsset.fullPath"
              :download="currentAssetFileName"
            >
              הורדה
            </a>
            <a
              class="lb-btn lb-btn--ghost"
              :href="currentAsset.fullPath"
              target="_blank"
              rel="noopener"
            >
              פתיחה
            </a>
          </template>
          <button
            v-if="isCurrentAssetBlocked"
            type="button"
            class="lb-btn lb-btn--restore"
            :disabled="unblockingAssetId === currentAsset.id"
            @click="unblockAsset(currentAsset.id)"
          >
            {{ unblockingAssetId === currentAsset.id ? "טוען..." : "בטל חסימה" }}
          </button>
          <button
            v-else-if="canBlockCurrentAsset"
            type="button"
            class="lb-btn lb-btn--block"
            :disabled="blockingAssetId === currentAsset.id"
            @click="blockAssets(currentAsset.id)"
          >
            {{ blockingAssetId === currentAsset.id ? "טוען..." : "חסום" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  EventAssetsManagementModesEnum,
  StatusEnum,
  AssetModerationStatusEnum,
  getAssetModerationStatus,
} from "@/helpers/enums";
import { IEventAsset, IEventDownloadAssetsProcess } from "@/helpers/interfaces";
import { defineComponent } from "vue";
import Time from "@/helpers/time";
import MainCheckbox from "@/components/library/inputs/MainCheckbox.vue";
import EventAssetCard from "@/components/event/EventAssetCard.vue";
import { EventAssetsManagementModesType } from "@/helpers/types";
import MainIcon from "@/components/library/general/MainIcon.vue";
import UploadMedia from "@/components/library/inputs/UploadMedia.vue";
import EventModerationSection from "@/components/event/EventModerationSection.vue";

export default defineComponent({
  name: "EventAssetsView",

  components: {
    MainCheckbox,
    EventAssetCard,
    MainIcon,
    UploadMedia,
    EventModerationSection,
  },

  data() {
    return {
      counter: "" as string,
      intervalId: null as ReturnType<typeof setInterval> | null,
      processPollingId: undefined as ReturnType<typeof setInterval> | undefined,
      pickedAll: false as boolean,
      loading: false as boolean,
      isOpen: false as boolean,
      pollingCounter: 0 as number,
      isModalOpened: false as boolean,
      currentAssetIndex: 0 as number,
      unblockingAssetId: null as number | null,
      blockingAssetId: null as number | null,
      assetsPollIntervalId: null as ReturnType<typeof setInterval> | null,
      moderationOpen: false as boolean,
      moderationTouched: false as boolean,
      selectMode: false as boolean,
      keydownHandler: null as ((e: KeyboardEvent) => void) | null,
    };
  },

  created() {
    this.loadAssets();
  },

  watch: {
    "$route.path"(path: string) {
      if (path === "/event/assets") {
        this.loadAssets();
      }
    },

    hasPendingAssets: {
      immediate: true,
      handler(hasPending: boolean) {
        if (hasPending) {
          this.startAssetsPolling();
        } else {
          this.stopAssetsPolling();
        }
      },
    },

    moderationQueueCount: {
      immediate: true,
      handler(count: number) {
        if (!this.moderationTouched) {
          this.moderationOpen = count > 0;
        }
      },
    },

    totalManagedAssetsIds() {
      this.pickedAll =
        this.totalAssets > 0 &&
        this.totalManagedAssetsIds === this.totalAssets;
      if (this.totalManagedAssetsIds > 0) {
        this.selectMode = true;
      }
    },

    isDownloadProcessFinished() {
      if (this.isDownloadProcessFinished && this.processPollingId) {
        this.stopPollingProcessStatus();
      }
    },
  },

  computed: {
    totalAssets(): number {
      return this.$store.getters["event/getTotalAssets"];
    },

    assetsCountLabel(): string {
      const n = this.totalAssets;
      if (n === 1) return "קובץ אחד";
      if (n === 2) return "2 קבצים";
      return `${n} קבצים`;
    },

    ownerVisibleAssets(): IEventAsset[] {
      return this.$store.getters["event/getOwnerVisibleAssets"];
    },

    hasPendingAssets(): boolean {
      return this.$store.getters["event/hasPendingAssets"];
    },

    pendingCount(): number {
      return this.$store.getters["event/getPendingAssets"]?.length || 0;
    },

    blockedCount(): number {
      return this.$store.getters["event/getBlockedAssets"]?.length || 0;
    },

    moderationQueueCount(): number {
      return this.pendingCount + this.blockedCount;
    },

    assets(): IEventAsset[] {
      return this.ownerVisibleAssets;
    },

    isEventActive(): boolean {
      return this.$store.getters["event/isEventActive"];
    },

    selectionActive(): boolean {
      return this.selectMode || this.totalManagedAssetsIds > 0;
    },

    canAct(): boolean {
      return this.totalManagedAssetsIds > 0 && !this.loading;
    },

    totalManagedAssetsIds(): number {
      return this.$store.getters["event/getTotalManagedAssetsIds"];
    },

    managedAssetsIds(): number[] {
      return this.$store.getters["event/getManagedAssetsIds"];
    },

    downloadProcess(): IEventDownloadAssetsProcess {
      return this.$store.getters["event/getDownloadAssetsProcess"];
    },

    isDownloadProcessFinished(): boolean {
      return (
        this.downloadProcess?.status === StatusEnum.ACTIVE &&
        !!this.downloadProcess?.fullPath
      );
    },

    isDownloadProcessPreparing(): boolean {
      return (
        this.downloadProcess &&
        [StatusEnum.PENDING, StatusEnum.IN_PROGRESS].includes(
          this.downloadProcess.status
        )
      );
    },

    processFileName(): string {
      return this.$store.getters["event/getEventProcessFileName"];
    },

    disabledTime(): string {
      return this.$store.getters["event/getEventFinishTime"]
        ? Time.addHours(
            this.$store.getters["event/getEventFinishTime"],
            this.$store.getters["user/getSubscriptionFilesStorageTime"]
          )
        : "";
    },

    event(): any {
      return this.$store.getters["event/getEvent"];
    },

    currentAsset(): IEventAsset {
      return this.assets[this.currentAssetIndex];
    },

    currentAssetFileName(): string {
      if (!this.currentAsset || !this.event) return "file";
      const extension = this.currentAsset.type === "image" ? "jpg" : "mp4";
      return `${this.event.name}-${this.currentAssetIndex + 1}.${extension}`;
    },

    isCurrentAssetBlocked(): boolean {
      if (!this.currentAsset) {
        return false;
      }

      return (
        getAssetModerationStatus(this.currentAsset) ===
        AssetModerationStatusEnum.BLOCKED
      );
    },

    canBlockCurrentAsset(): boolean {
      if (!this.currentAsset || this.isCurrentAssetBlocked) {
        return false;
      }

      const status = getAssetModerationStatus(this.currentAsset);
      return (
        status === AssetModerationStatusEnum.ACTIVE ||
        status === AssetModerationStatusEnum.PENDING
      );
    },
  },

  methods: {
    loadAssets() {
      return this.$store.dispatch("event/getEventAssets");
    },

    toggleCollapse() {
      this.isOpen = !this.isOpen;
    },

    toggleModeration() {
      this.moderationTouched = true;
      this.moderationOpen = !this.moderationOpen;
    },

    enterSelectMode() {
      this.selectMode = true;
    },

    exitSelectMode() {
      this.selectMode = false;
      this.pickedAll = false;
      this.$store.dispatch("event/toggleAllAssetsInAssetsManagement", false);
      this.$store.dispatch("event/setModeForAssetsManagement", null);
    },

    updateCounter() {
      this.counter = Time.countdownTimer(this.disabledTime);
      if (this.counter === "00:00:00:00" && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    async runAction(action: EventAssetsManagementModesType) {
      if (!this.canAct) return;

      if (action === EventAssetsManagementModesEnum.DELETE) {
        if (!window.confirm("למחוק את הקבצים שנבחרו? לא ניתן לשחזר.")) {
          return;
        }
      }

      if (action === EventAssetsManagementModesEnum.BLOCK) {
        if (!window.confirm("לחסום את הקבצים שנבחרו מהאלבום החי?")) {
          return;
        }
      }

      await this.$store.dispatch("event/setModeForAssetsManagement", action);

      switch (action) {
        case EventAssetsManagementModesEnum.DOWNLOAD:
          await this.startDownloadFilesProcess();
          break;
        case EventAssetsManagementModesEnum.DELETE:
          await this.deleteAssets();
          break;
        case EventAssetsManagementModesEnum.HIDE:
          await this.hideAssets();
          break;
        case EventAssetsManagementModesEnum.BLOCK:
          await this.blockAssets();
          break;
        default:
          break;
      }

      this.selectMode = false;
      this.pickedAll = false;
      await this.$store.dispatch("event/setModeForAssetsManagement", null);
    },

    toggleAllAssets(val = null as boolean | null) {
      this.pickedAll = val !== null ? val : !this.pickedAll;
      this.$store.dispatch(
        "event/toggleAllAssetsInAssetsManagement",
        this.pickedAll
      );
    },

    startPollingProcessStatus() {
      if (this.processPollingId) {
        return;
      }
      this.processPollingId = setInterval(async () => {
        if (this.pollingCounter >= 30) {
          this.stopPollingProcessStatus();
          return;
        }
        await this.$store.dispatch("event/getDownloadAssetsProcess");
        this.pollingCounter++;
      }, 15000);
    },

    stopPollingProcessStatus() {
      if (this.processPollingId) {
        clearInterval(this.processPollingId);
        this.processPollingId = undefined;
      }
    },

    async startDownloadFilesProcess() {
      this.loading = true;
      const success = await this.$store.dispatch("event/downloadAssets");
      if (success) {
        this.resetPolling();
      }
      this.loading = false;
    },

    async deleteAssets() {
      this.loading = true;
      await this.$store.dispatch("event/deleteAssets");
      this.loading = false;
    },

    async hideAssets() {
      this.loading = true;
      await this.$store.dispatch("event/hideAssets");
      this.loading = false;
    },

    async blockAssets(assetId?: number) {
      if (this.blockingAssetId) {
        return;
      }

      this.loading = !assetId;
      this.blockingAssetId = assetId ?? null;
      const success = await this.$store.dispatch(
        "event/blockAssets",
        assetId ? [assetId] : undefined
      );
      this.blockingAssetId = null;
      this.loading = false;

      if (success && assetId) {
        this.isModalOpened = false;
      }
    },

    resetPolling() {
      this.stopPollingProcessStatus();
      this.pollingCounter = 0;
      this.startPollingProcessStatus();
    },

    openModal(assetIndex: number) {
      this.isModalOpened = true;
      this.currentAssetIndex = assetIndex;
    },

    async unblockAsset(assetId: number) {
      if (this.unblockingAssetId) {
        return;
      }

      this.unblockingAssetId = assetId;
      await this.$store.dispatch("event/unblockAssets", [assetId]);
      this.unblockingAssetId = null;
    },

    startAssetsPolling() {
      if (this.assetsPollIntervalId) return;
      this.assetsPollIntervalId = setInterval(() => {
        this.$store.dispatch("event/getEventAssets");
      }, 8000);
    },

    stopAssetsPolling() {
      if (this.assetsPollIntervalId) {
        clearInterval(this.assetsPollIntervalId);
        this.assetsPollIntervalId = null;
      }
    },

    changeAsset(newIndex: number) {
      if (newIndex < 0) {
        this.currentAssetIndex = this.assets.length - 1;
      } else if (newIndex >= this.assets.length) {
        this.currentAssetIndex = 0;
      } else {
        this.currentAssetIndex = newIndex;
      }
    },

    onKeydown(e: KeyboardEvent) {
      if (!this.isModalOpened) {
        if (e.key === "Escape" && this.selectionActive) {
          this.exitSelectMode();
        }
        return;
      }

      if (e.key === "ArrowRight") {
        this.changeAsset(this.currentAssetIndex - 1);
      } else if (e.key === "ArrowLeft") {
        this.changeAsset(this.currentAssetIndex + 1);
      } else if (e.key === "Escape") {
        this.isModalOpened = false;
      }
    },

    doNone() {
      // do nothing
    },
  },

  mounted() {
    this.updateCounter();
    this.intervalId = setInterval(this.updateCounter, 1000);
    if (this.isDownloadProcessPreparing) {
      this.startPollingProcessStatus();
    }

    this.keydownHandler = this.onKeydown.bind(this);
    window.addEventListener("keydown", this.keydownHandler);
  },

  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.stopPollingProcessStatus();
    this.stopAssetsPolling();
    if (this.keydownHandler) {
      window.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }
  },
});
</script>

<style lang="scss" scoped>
.event-assets {
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: var(--font, Heebo, sans-serif);
  color: var(--ink, #161310);
  min-height: 0;
}

.page-head .kicker,
.moderation-toggle .kicker {
  color: var(--rose, #dc5b66);
  font-weight: 800;
  margin: 0;
}

.page-head h1 {
  margin: 4px 0 0;
  font-weight: 900;
  font-size: clamp(1.55rem, 2.4vw, 2rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.lede {
  margin: 8px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.95rem;
  line-height: 1.45;
  max-width: 52ch;
}

.meta-note {
  margin: 10px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.85rem;
  line-height: 1.4;
}

.meta-note strong {
  color: #8a7040;
  font-variant-numeric: tabular-nums;
}

.how-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink, #161310);
  font: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.how-body {
  margin-top: 8px;
  max-width: 48ch;
}

.how-body p {
  margin: 0;
  color: var(--muted, #5e564e);
  font-size: 0.88rem;
  line-height: 1.5;
}

.upload-strip {
  background: rgba(22, 19, 16, 0.02);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 14px 16px;

  :deep(.upload-media) {
    max-width: none;
    margin-top: 0;
  }

  :deep(.upload-label) {
    margin-bottom: 8px;
    font-size: 0.88rem;
  }

  :deep(.dropzone) {
    min-height: 72px;
    padding: 12px 14px;
    gap: 2px;
  }

  :deep(.dropzone input[type="file"]) {
    display: none !important;
  }

  :deep(.dropzone-icon) {
    margin-bottom: 0;
  }
}

.assets-toolbar {
  position: sticky;
  top: calc(var(--nav, 72px) + 8px);
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--line, rgba(22, 19, 16, 0.14));
  border-radius: 14px;
  box-shadow: var(--shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.assets-toolbar--active {
  border-color: rgba(220, 91, 102, 0.4);
  box-shadow:
    0 0 0 1px rgba(220, 91, 102, 0.12),
    var(--shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
}

.toolbar-main {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  min-width: 0;
}

.selection-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.selection-count {
  color: var(--ink, #161310);
  font-size: 0.92rem;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.selection-picked {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(220, 91, 102, 0.12);
  color: #b13c48;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.selection-hint {
  color: var(--muted, #5e564e);
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.select-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 6px;
  border-radius: 999px;
  background: rgba(22, 19, 16, 0.04);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ink, #161310);
  cursor: pointer;
  white-space: nowrap;

  &.disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-inline-start: auto;
}

.toolbar-action-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 4px;
  border-radius: 12px;
  background: rgba(22, 19, 16, 0.035);
  transition: opacity 0.2s ease;

  &:not(.is-ready) {
    opacity: 0.55;
  }
}

.tb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--ink, #161310);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    transform: none;
  }
}

.tb-btn--select {
  background: var(--rose, #dc5b66);
  color: #fff;
  box-shadow: 0 6px 16px rgba(220, 91, 102, 0.28);

  &:hover:not(:disabled) {
    filter: brightness(1.04);
  }

  &:disabled {
    background: rgba(22, 19, 16, 0.12);
    color: var(--muted, #5e564e);
    box-shadow: none;
    filter: none;
  }
}

.tb-btn--download {
  background: #1f7a45;
  color: #fff;

  &:hover:not(:disabled) {
    background: #19663a;
  }

  &:disabled {
    background: rgba(31, 122, 69, 0.22);
    color: rgba(31, 122, 69, 0.7);
  }
}

.tb-btn--neutral {
  background: #fff;
  border-color: rgba(22, 19, 16, 0.14);
  color: var(--ink, #161310);

  &:hover:not(:disabled) {
    border-color: rgba(22, 19, 16, 0.28);
    background: rgba(22, 19, 16, 0.03);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.55);
    color: rgba(22, 19, 16, 0.38);
    border-color: rgba(22, 19, 16, 0.08);
  }
}

.tb-btn--warn {
  background: rgba(220, 91, 102, 0.12);
  color: #b13c48;

  &:hover:not(:disabled) {
    background: rgba(220, 91, 102, 0.18);
  }

  &:disabled {
    background: rgba(220, 91, 102, 0.08);
    color: rgba(177, 60, 72, 0.45);
  }
}

.tb-btn--danger {
  background: #9b1c1c;
  color: #fff;

  &:hover:not(:disabled) {
    background: #861818;
  }

  &:disabled {
    background: rgba(155, 28, 28, 0.18);
    color: rgba(155, 28, 28, 0.55);
  }
}

.tb-btn--ghost {
  color: var(--muted, #5e564e);
  padding-inline: 10px;

  &:hover:not(:disabled) {
    color: var(--ink, #161310);
    background: rgba(22, 19, 16, 0.05);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.zip-download {
  text-decoration: none;
}

.lb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 84px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: progress;
    transform: none;
  }
}

.lb-btn--download {
  background: #1f7a45;
  color: #fff;
  box-shadow: 0 4px 14px rgba(31, 122, 69, 0.28);

  &:hover:not(:disabled) {
    background: #19663a;
  }
}

.lb-btn--ghost {
  background: rgba(255, 255, 255, 0.92);
  color: var(--ink, #161310);
  border-color: rgba(255, 255, 255, 0.2);

  &:hover:not(:disabled) {
    background: #fff;
  }
}

.lb-btn--block {
  background: rgba(220, 91, 102, 0.95);
  color: #fff;
  box-shadow: 0 4px 14px rgba(220, 91, 102, 0.3);

  &:hover:not(:disabled) {
    background: #c94d58;
  }
}

.lb-btn--restore {
  background: #1f7a45;
  color: #fff;

  &:hover:not(:disabled) {
    background: #19663a;
  }
}

.assets-body {
  min-height: 220px;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 200px));
  gap: 12px;
  align-content: start;
  justify-content: start;
}

.assets-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 220px;
  padding: 28px 16px;
  text-align: center;
  border: 1px dashed var(--line, rgba(22, 19, 16, 0.18));
  border-radius: 18px;
  background: rgba(22, 19, 16, 0.02);
  color: var(--ink, #161310);
  font-weight: 700;
}

.assets-empty-hint {
  margin: 0;
  color: var(--muted, #5e564e);
  font-weight: 500;
  font-size: 0.9rem;
}

.moderation-shell {
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  background: #fffcfa;
  overflow: hidden;
}

.moderation-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: start;
}

.moderation-toggle-text strong {
  display: block;
  margin-top: 2px;
  font-size: 1.05rem;
  font-weight: 900;
}

.moderation-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge--pending {
  background: rgba(230, 168, 23, 0.18);
  color: #8a5a00;
}

.badge--blocked {
  background: rgba(198, 40, 40, 0.14);
  color: #9b1c1c;
}

.badge--idle {
  background: rgba(22, 19, 16, 0.06);
  color: var(--muted, #5e564e);
}

.moderation-panel {
  border-top: 1px solid var(--line, rgba(22, 19, 16, 0.11));
}

.moderation-section {
  margin: 0;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 120px;
  opacity: 1;
}

@media (max-width: 900px) {
  .assets-toolbar {
    top: calc(var(--nav, 72px) + 44px);
  }

  .assets-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 180px));
  }
}

@media (max-width: 600px) {
  .event-assets {
    gap: 14px;
  }

  .assets-toolbar {
    top: calc(var(--nav, 72px) + 40px);
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 10px;
  }

  .toolbar-main {
    width: 100%;
    justify-content: space-between;
  }

  .toolbar-actions {
    width: 100%;
    margin-inline-start: 0;
  }

  .toolbar-action-group {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .tb-btn {
    min-height: 40px;
  }

  .tb-btn--select,
  .tb-btn--ghost,
  .zip-download {
    flex: 1 1 auto;
  }

  .zip-download {
    width: 100%;
    text-align: center;
  }

  .assets-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    justify-content: stretch;
  }

  .upload-strip {
    padding: 12px;
  }

  .upload-strip :deep(.dropzone) {
    flex-direction: column;
    min-height: 96px;
  }
}
</style>

<style lang="scss">
@import "@/styles/lightbox.scss";
</style>
