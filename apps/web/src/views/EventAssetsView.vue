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

    <div class="type-filters" role="tablist" aria-label="סינון סוג">
      <button type="button" class="chip" :class="{ on: typeFilter === 'all' }" @click="setTypeFilter('all')">הכל</button>
      <button type="button" class="chip" :class="{ on: typeFilter === 'photo' }" @click="setTypeFilter('photo')">תמונות</button>
      <button type="button" class="chip" :class="{ on: typeFilter === 'video' }" @click="setTypeFilter('video')">סרטונים</button>
      <button type="button" class="chip" :class="{ on: typeFilter === 'fav' }" @click="setTypeFilter('fav')">מועדפים</button>
      <button
        type="button"
        class="chip chip--pending"
        :class="{ on: typeFilter === 'pending' }"
        @click="setTypeFilter('pending')"
      >
        ממתינים לבדיקה
        <span v-if="pendingCount" class="chip-badge">{{ pendingCount }}</span>
      </button>
      <button
        type="button"
        class="chip"
        :class="{ on: typeFilter === 'blocked' }"
        @click="setTypeFilter('blocked')"
      >
        חסומות
        <span v-if="blockedCount" class="chip-badge chip-badge--blocked">{{ blockedCount }}</span>
      </button>
    </div>

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
              class="tb-btn tb-btn--approve"
              :disabled="!canAct || !selectionHasPending"
              @click="bulkApprove"
            >
              אישור
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
        <p v-if="typeFilter === 'pending'">אין תמונות ממתינות לבדיקה.</p>
        <p v-else-if="typeFilter === 'blocked'">אין תמונות חסומות.</p>
        <p v-else>עדיין אין קבצים להצגה.</p>
        <p v-if="typeFilter === 'all'" class="assets-empty-hint">העלו תמונות או סרטונים למעלה.</p>
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
          :allow-moderation-actions="true"
          :allow-unblock="typeFilter === 'blocked'"
          :approve-loading="approvingAssetId === asset.id"
          :block-loading="blockingAssetId === asset.id"
          :unblock-loading="unblockingAssetId === asset.id"
          @onClick="openModal"
          @onApprove="approveAsset"
          @onBlock="blockAssets"
          @onUnblock="unblockAsset"
        />
      </div>
    </section>

    <section class="approval-shell" aria-label="אישור ידני">
      <EventSwitchPanel
        title="אישור ידני"
        :items="approvalSwitches"
        :values="approvalConfig"
        @toggle="toggleApproval"
      />
      <div class="approval-actions">
        <MainButton :loading="approvalLoading" text="שמור הגדרה" @onClick="saveManualApproval" />
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="isModalOpened && currentAsset"
        ref="lightboxRoot"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="תצוגת מדיה"
        tabindex="-1"
        @click="closeModal"
        @keydown="onLightboxKeydown"
        @touchstart.passive="onLightboxTouchStart"
        @touchend.passive="onLightboxTouchEnd"
      >
        <button
          type="button"
          class="lightbox-close lightbox-icon"
          aria-label="סגירה"
          @click.stop="closeModal"
        >
          &times;
        </button>
        <button
          type="button"
          class="lightbox-next lightbox-icon"
          aria-label="הקודם"
          @click.stop="changeAsset(currentAssetIndex + 1)"
        >
          &#10094;
        </button>
        <button
          type="button"
          class="lightbox-prev lightbox-icon"
          aria-label="הבא"
          @click.stop="changeAsset(currentAssetIndex - 1)"
        >
          &#10095;
        </button>
        <div class="lightbox-content lightbox-content--with-actions" @click.stop>
          <div class="lightbox-stage">
            <div
              v-if="lightboxMediaLoading"
              class="lightbox-spinner"
              aria-hidden="true"
            />
            <p
              v-if="lightboxMediaFailed"
              class="lightbox-error"
              role="status"
            >
              לא ניתן לטעון את הקובץ
            </p>
            <img
              v-if="!isCurrentAssetVideo"
              :key="'lb-img-' + currentAsset.id + '-' + lightboxMediaSrc"
              class="lightbox-asset"
              :class="{ 'is-loading': lightboxMediaLoading }"
              :src="lightboxMediaSrc"
              alt=""
              @load="onLightboxMediaLoad"
              @error="onLightboxMediaError"
            />
            <video
              v-else
              :key="'lb-vid-' + currentAsset.id + '-' + lightboxMediaSrc"
              ref="lightboxVideo"
              class="lightbox-asset"
              :class="{ 'is-loading': lightboxMediaLoading }"
              :src="lightboxMediaSrc"
              controls
              playsinline
              webkit-playsinline
              autoplay
              @loadeddata="onLightboxMediaLoad"
              @error="onLightboxMediaError"
            />
          </div>
          <div class="lightbox-actions" role="group" aria-label="פעולות קובץ">
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
            <button
              v-if="isCurrentAssetPending"
              type="button"
              class="lb-btn lb-btn--approve"
              :disabled="approvingAssetId === currentAsset.id"
              @click="approveAsset(currentAsset.id)"
            >
              {{ approvingAssetId === currentAsset.id ? "טוען..." : "אישור" }}
            </button>
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
    </Teleport>
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
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import Time from "@/helpers/time";
import MainCheckbox from "@/components/library/inputs/MainCheckbox.vue";
import EventAssetCard from "@/components/event/EventAssetCard.vue";
import { EventAssetsManagementModesType } from "@/helpers/types";
import MainIcon from "@/components/library/general/MainIcon.vue";
import UploadMedia from "@/components/library/inputs/UploadMedia.vue";
import MainButton from "@/components/library/buttons/MainButton.vue";
import EventSwitchPanel, {
  SwitchItem,
} from "@/components/event/EventSwitchPanel.vue";

export default defineComponent({
  name: "EventAssetsView",

  components: {
    MainCheckbox,
    EventAssetCard,
    MainIcon,
    UploadMedia,
    MainButton,
    EventSwitchPanel,
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
      approvingAssetId: null as number | null,
      assetsPollIntervalId: null as ReturnType<typeof setInterval> | null,
      selectMode: false as boolean,
      typeFilter: "all" as "all" | "photo" | "video" | "fav" | "pending" | "blocked",
      approvalLoading: false as boolean,
      approvalConfig: {
        manual_photo_approval: false,
      } as Record<string, boolean>,
      savedApproval: false as boolean,
      approvalSwitches: [
        {
          key: "manual_photo_approval",
          title: "אישור ידני לתמונות",
          hint: "מרגע ההפעלה, תמונות חדשות מחכות לאישור לפני האלבום והמסך",
        },
      ] as SwitchItem[],
      keydownHandler: null as ((e: KeyboardEvent) => void) | null,
      lightboxMediaSrc: "" as string,
      lightboxMediaLoading: false as boolean,
      lightboxMediaFailed: false as boolean,
      lightboxUsedThumbFallback: false as boolean,
      lightboxFocusBefore: null as HTMLElement | null,
      lightboxTouchX: null as number | null,
    };
  },

  created() {
    this.syncFilterFromRoute();
    this.loadAssets();
  },

  beforeRouteLeave(
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const dirty =
      this.approvalConfig.manual_photo_approval !== this.savedApproval;
    if (dirty && !window.confirm("יש שינויים שלא נשמרו. לעזוב בלי לשמור?")) {
      next(false);
      return;
    }
    next();
  },

  watch: {
    "$route.fullPath"() {
      if (this.$route.path === "/event/assets" || this.$route.path.startsWith("/event/assets")) {
        this.syncFilterFromRoute();
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

    event: {
      immediate: true,
      handler() {
        const value = Boolean(this.event?.config?.manual_photo_approval);
        this.approvalConfig.manual_photo_approval = value;
        this.savedApproval = value;
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

    isModalOpened(open: boolean) {
      if (typeof document !== "undefined") {
        document.body.classList.toggle("lightbox-open", open);
      }
      if (open) {
        this.$nextTick(() => this.activateLightboxFocus());
      } else {
        this.pauseLightboxVideo();
        this.restoreLightboxFocus();
      }
    },

    currentAssetIndex() {
      if (!this.isModalOpened) return;
      this.pauseLightboxVideo();
      this.resetLightboxMediaSrc();
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
      let assets: IEventAsset[];
      if (this.typeFilter === "blocked") {
        assets = this.$store.getters["event/getBlockedAssets"] || [];
      } else if (this.typeFilter === "pending") {
        assets = this.$store.getters["event/getPendingAssets"] || [];
      } else {
        assets = this.$store.getters["event/getOwnerVisibleAssets"] || [];
        if (this.typeFilter === "photo") {
          assets = assets.filter(
            (a: IEventAsset) => a.type === "image" || a.type === "photo"
          );
        } else if (this.typeFilter === "video") {
          assets = assets.filter((a: IEventAsset) => a.type === "video");
        } else if (this.typeFilter === "fav") {
          assets = assets.filter((a: IEventAsset) => Boolean(a.is_favorite));
        }
      }
      return assets;
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

    selectionHasPending(): boolean {
      const ids = new Set(this.managedAssetsIds);
      const pending = this.$store.getters["event/getPendingAssets"] || [];
      return pending.some((a: IEventAsset) => ids.has(a.id));
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

    isCurrentAssetVideo(): boolean {
      return this.currentAsset?.type === "video";
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

    isCurrentAssetPending(): boolean {
      if (!this.currentAsset) return false;
      return (
        getAssetModerationStatus(this.currentAsset) ===
        AssetModerationStatusEnum.PENDING
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
    syncFilterFromRoute() {
      const raw = String(this.$route.query.filter || "");
      if (raw === "pending" || raw === "blocked") {
        this.typeFilter = raw;
      }
    },

    setTypeFilter(filter: "all" | "photo" | "video" | "fav" | "pending" | "blocked") {
      this.typeFilter = filter;
      const query = { ...this.$route.query } as Record<string, string>;
      if (filter === "pending" || filter === "blocked") {
        query.filter = filter;
      } else {
        delete query.filter;
      }
      this.$router.replace({ query }).catch(() => undefined);
    },

    loadAssets() {
      return this.$store.dispatch("event/getEventAssets");
    },

    toggleCollapse() {
      this.isOpen = !this.isOpen;
    },

    toggleApproval(key: string) {
      this.approvalConfig[key] = !this.approvalConfig[key];
    },

    async saveManualApproval() {
      this.approvalLoading = true;
      const result = await this.$store.dispatch("event/update", {
        config: {
          manual_photo_approval: this.approvalConfig.manual_photo_approval
            ? "true"
            : "false",
        },
      });
      this.approvalLoading = false;
      if (result) {
        this.savedApproval = this.approvalConfig.manual_photo_approval;
      }
    },

    async approveAsset(assetId: number) {
      if (this.approvingAssetId) return;
      this.approvingAssetId = assetId;
      await this.$store.dispatch("event/approveAssets", [assetId]);
      this.approvingAssetId = null;
      if (this.isModalOpened && this.currentAsset?.id === assetId) {
        this.closeModal();
      }
    },

    async bulkApprove() {
      if (!this.canAct || !this.selectionHasPending) return;
      const pendingIds = new Set(
        (this.$store.getters["event/getPendingAssets"] || []).map(
          (a: IEventAsset) => a.id
        )
      );
      const ids = this.managedAssetsIds.filter((id: number) => pendingIds.has(id));
      if (!ids.length) return;
      this.loading = true;
      await this.$store.dispatch("event/approveAssets", ids);
      this.loading = false;
      this.exitSelectMode();
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
        this.closeModal();
      }
    },

    resetPolling() {
      this.stopPollingProcessStatus();
      this.pollingCounter = 0;
      this.startPollingProcessStatus();
    },

    openModal(assetIndex: number) {
      this.currentAssetIndex = assetIndex;
      this.resetLightboxMediaSrc();
      this.isModalOpened = true;
    },

    closeModal() {
      this.pauseLightboxVideo();
      this.isModalOpened = false;
    },

    assetThumbUrl(asset: IEventAsset | null | undefined): string {
      if (!asset) return "";
      return (
        asset.thumbPath ||
        asset.thumbnail ||
        asset.thumb_url ||
        asset.thumbnail_url ||
        ""
      );
    },

    resetLightboxMediaSrc() {
      const asset = this.currentAsset;
      this.lightboxUsedThumbFallback = false;
      this.lightboxMediaFailed = false;
      this.lightboxMediaLoading = Boolean(asset?.fullPath);
      this.lightboxMediaSrc = asset?.fullPath || this.assetThumbUrl(asset) || "";
      if (!this.lightboxMediaSrc) {
        this.lightboxMediaLoading = false;
        this.lightboxMediaFailed = true;
      }
    },

    onLightboxMediaLoad() {
      this.lightboxMediaLoading = false;
      this.lightboxMediaFailed = false;
    },

    onLightboxMediaError() {
      const thumb = this.assetThumbUrl(this.currentAsset);
      if (
        !this.lightboxUsedThumbFallback &&
        thumb &&
        thumb !== this.lightboxMediaSrc
      ) {
        this.lightboxUsedThumbFallback = true;
        this.lightboxMediaLoading = true;
        this.lightboxMediaFailed = false;
        this.lightboxMediaSrc = thumb;
        return;
      }
      this.lightboxMediaLoading = false;
      this.lightboxMediaFailed = true;
    },

    pauseLightboxVideo() {
      const video = this.$refs.lightboxVideo as HTMLVideoElement | undefined;
      if (video) {
        try {
          video.pause();
        } catch {
          /* ignore */
        }
      }
    },

    lightboxFocusables(): HTMLElement[] {
      const root = this.$refs.lightboxRoot as HTMLElement | undefined;
      if (!root) return [];
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], video, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        if (el.hasAttribute("disabled")) return false;
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });
    },

    activateLightboxFocus() {
      const active = document.activeElement;
      this.lightboxFocusBefore =
        active instanceof HTMLElement ? active : null;
      const root = this.$refs.lightboxRoot as HTMLElement | undefined;
      root?.focus({ preventScroll: true });
    },

    restoreLightboxFocus() {
      const prev = this.lightboxFocusBefore;
      this.lightboxFocusBefore = null;
      if (prev && typeof prev.focus === "function") {
        try {
          prev.focus({ preventScroll: true });
        } catch {
          /* ignore */
        }
      }
    },

    trapLightboxFocus(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusables = this.lightboxFocusables();
      if (!focusables.length) {
        e.preventDefault();
        (this.$refs.lightboxRoot as HTMLElement | undefined)?.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || active === this.$refs.lightboxRoot)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },

    onLightboxKeydown(e: KeyboardEvent) {
      if (!this.isModalOpened) return;
      if (e.key === "Tab") {
        this.trapLightboxFocus(e);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        this.changeAsset(this.currentAssetIndex - 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.changeAsset(this.currentAssetIndex + 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.closeModal();
      }
    },

    onLightboxTouchStart(e: TouchEvent) {
      this.lightboxTouchX = e.changedTouches[0]?.clientX ?? null;
    },

    onLightboxTouchEnd(e: TouchEvent) {
      if (this.lightboxTouchX == null) return;
      const endX = e.changedTouches[0]?.clientX ?? this.lightboxTouchX;
      const delta = endX - this.lightboxTouchX;
      this.lightboxTouchX = null;
      if (Math.abs(delta) < 50) return;
      // RTL: swipe right → previous, swipe left → next
      if (delta > 0) this.changeAsset(this.currentAssetIndex - 1);
      else this.changeAsset(this.currentAssetIndex + 1);
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
      // Dialog handles its own keys while open (focus is inside Teleport).
      if (e.key === "Escape") {
        this.closeModal();
      } else if (e.key === "ArrowRight") {
        this.changeAsset(this.currentAssetIndex - 1);
      } else if (e.key === "ArrowLeft") {
        this.changeAsset(this.currentAssetIndex + 1);
      }
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
    if (typeof document !== "undefined") {
      document.body.classList.remove("lightbox-open");
    }
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

.type-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 14px;
}
.type-filters .chip {
  appearance: none;
  border: 1.5px solid rgba(22, 19, 16, 0.11);
  background: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}
.type-filters .chip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  margin-inline-start: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #e6a817;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
}
.type-filters .chip-badge--blocked {
  background: #c62828;
}
.type-filters .chip--pending.on .chip-badge {
  background: #fff;
  color: #b8860b;
}
.type-filters .chip.on {
  background: #12100e;
  color: #fff;
  border-color: #12100e;
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

.lb-btn--approve,
.tb-btn--approve {
  background: #12100e;
  color: #fff;
  box-shadow: 0 4px 14px rgba(18, 16, 14, 0.22);

  &:hover:not(:disabled) {
    background: #2a2622;
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

.approval-shell {
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 720px;
}

.approval-actions {
  max-width: 280px;
  margin-inline-start: auto;
  width: 100%;
}

.moderation-shell {
  display: none;
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
  .lb-btn {
    min-height: 36px;
    min-width: 0;
    padding: 0 14px;
    font-size: 0.82rem;
  }

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
