<template>
  <div class="ov-page" dir="rtl">
    <template v-if="isSetupEmpty">
      <header class="ov-setup">
        <p class="ov-setup__eyebrow">סקירה</p>
        <h1>האירוע עדיין בהקמה</h1>
        <p>הוסיפו שם ותמונת כיסוי כדי להתחיל.</p>
        <router-link class="ov-setup__cta" to="/event/details">
          פרטי האירוע
        </router-link>
      </header>
    </template>

    <template v-else>
      <OverviewStatusHeader
        :name="displayName"
        :status-label="statusLabel"
        :date-label="dateLabel"
        :venue="venueLabel"
        :timing-label="timing.timingLabel"
        :phase="timing.phase"
      />

      <OverviewKeyNumbers :items="keyNumberItems" />

      <OverviewNextStepCard :step="nextStep" />

      <OverviewQuickActions :items="quickActionItems" />

      <OverviewAnalyticsBlock
        :loading="analyticsLoading"
        :available="analyticsAvailable"
        :landing-visitors="landingVisitors"
        :upload-page-visitors="uploadPageVisitors"
        :uploaders="uploadersCount"
        :gallery-visitors="galleryVisitors"
        :active-visitors="activeVisitors"
        :rate-landing="formatRate(rates.landing_to_upload_page)"
        :rate-upload="formatRate(rates.upload_page_to_upload)"
        :rate-gallery="formatRate(rates.upload_to_gallery)"
        :photos="analyticsPhotos"
        :videos="analyticsVideos"
        :downloads="analyticsDownloads"
        :peak-hour="peakHourLabel"
      />

      <OverviewRecentUploads :items="recentUploads" />

      <OverviewShareLinks :origin="origin" :links="shareLinks" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewStatusHeader from "@/components/event/overview/OverviewStatusHeader.vue";
import OverviewKeyNumbers from "@/components/event/overview/OverviewKeyNumbers.vue";
import OverviewNextStepCard from "@/components/event/overview/OverviewNextStepCard.vue";
import OverviewQuickActions from "@/components/event/overview/OverviewQuickActions.vue";
import type {
  OverviewKeyNumberItem,
  OverviewQuickActionItem,
} from "@/helpers/overviewUiTypes";
import OverviewAnalyticsBlock from "@/components/event/overview/OverviewAnalyticsBlock.vue";
import OverviewRecentUploads from "@/components/event/overview/OverviewRecentUploads.vue";
import OverviewShareLinks from "@/components/event/overview/OverviewShareLinks.vue";
import { StatusEnum } from "@/helpers/enums";
import Time from "@/helpers/time";
import { isWhatsAppEnabled } from "@/helpers/features";
import {
  fetchEventAnalyticsOverview,
  type EventAnalyticsOverview,
} from "@/api/eventAnalytics";
import { getAdminHub } from "@/api/eventHub";
import {
  resolveOverviewTiming,
  type OverviewTimingResult,
} from "@/helpers/overviewTiming";
import {
  resolveOverviewNextStep,
  type OverviewNextStep,
} from "@/helpers/overviewNextStep";
import {
  pickOverviewRecentUploads,
  type OverviewUploadThumb,
} from "@/helpers/overviewRecentUploads";
import { resolveOverviewVenue } from "@/helpers/overviewVenue";

const ACTION_ICONS = {
  live: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="3" y="5" width="18" height="12" rx="2"/><path fill="none" d="M8 21h8M12 17v4"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="7" y="2.5" width="10" height="19" rx="2.5"/><path fill="none" d="M11 18.5h2"/></svg>`,
  qr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect fill="none" x="4" y="4" width="7" height="7" rx="1.2"/><rect fill="none" x="13" y="4" width="7" height="7" rx="1.2"/><rect fill="none" x="4" y="13" width="7" height="7" rx="1.2"/><path d="M14 14h2v2h-2zm3 0h3v3h-2v2h-3v-3h2z" fill="currentColor" stroke="none"/></svg>`,
  page: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="4" y="3" width="16" height="18" rx="2"/><path fill="none" d="M8 8h8M8 12h8M8 16h5"/></svg>`,
  gallery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="1.6" fill="currentColor" stroke="none"/><path fill="none" d="m7 17 3.5-4 2.5 3 2-2.5L17 17"/></svg>`,
  trivia: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8" fill="none"/><path fill="none" d="M9.5 10a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17h.01"/></svg>`,
  mod: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path fill="none" d="M12 3 5 6v5c0 5 3.2 8.6 7 10 3.8-1.4 7-5 7-10V6z"/><path fill="none" d="M9.5 12.2 11.2 14l3.5-4"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path fill="none" d="M12 4a8 8 0 0 0-6.9 12l-1 3.5 3.6-.9A8 8 0 1 0 12 4z"/><path fill="none" d="M9.5 10.2c.3-.4.7-.4 1 0l.7.9c.2.3.2.6 0 .8l-.4.4c.5 1 1.4 1.8 2.4 2.3l.5-.5c.2-.2.5-.2.8 0l.9.7c.4.3.4.7 0 1-.6.5-1.5.8-2.4.5-2.3-.8-4.2-2.7-5-5-.3-.9 0-1.8.5-2.4z"/></svg>`,
};

const EMPTY_RATES = {
  landing_to_upload_page: 0,
  upload_page_to_upload: 0,
  upload_to_gallery: 0,
};

export default defineComponent({
  name: "EventHomeView",

  components: {
    OverviewStatusHeader,
    OverviewKeyNumbers,
    OverviewNextStepCard,
    OverviewQuickActions,
    OverviewAnalyticsBlock,
    OverviewRecentUploads,
    OverviewShareLinks,
  },

  data() {
    return {
      analytics: null as EventAnalyticsOverview | null,
      analyticsLoading: false,
      analyticsUnavailable: false,
      hubPublished: null as boolean | null,
      hubConfig: null as Record<string, unknown> | null,
      timingTick: 0,
      timingTimer: null as ReturnType<typeof setInterval> | null,
    };
  },

  computed: {
    event(): Record<string, unknown> | null {
      return this.$store.getters["event/getEvent"] || null;
    },
    eventId(): number {
      return Number(this.event?.id || 0);
    },
    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
    },
    displayName(): string {
      return this.eventName;
    },
    eventPath(): string {
      return this.$store.getters["event/getEventPath"] || "";
    },
    isSetupEmpty(): boolean {
      return !String(this.eventName || "").trim();
    },
    storeStatus(): number | null {
      return this.$store.getters["event/getEventStatus"];
    },
    effectiveStatus(): number | null {
      return this.storeStatus;
    },
    statusLabel(): string {
      if (this.timing.phase === "live") return "חי";
      const s = this.effectiveStatus;
      if (s === StatusEnum.PENDING) return "ממתין";
      if (s === StatusEnum.READY) return "מוכן";
      if (s === StatusEnum.ACTIVE) return "הסתיים";
      if (s === StatusEnum.INACTIVE) return "לא פעיל";
      if (s === StatusEnum.IN_PROGRESS) return "חי";
      return "סטטוס";
    },
    startsAt(): string {
      return this.$store.getters["event/getEventStartTime"] || "";
    },
    finishedAt(): string {
      return this.$store.getters["event/getEventFinishTime"] || "";
    },
    dateLabel(): string {
      if (this.startsAt) {
        return Time.extractDate(this.startsAt) || this.$store.getters["event/getEventDate"] || "";
      }
      return this.$store.getters["event/getEventDate"] || "";
    },
    venueLabel(): string {
      return resolveOverviewVenue({
        event: this.event,
        hubConfig: this.hubConfig,
      });
    },
    timing(): OverviewTimingResult {
      // Depend on timingTick so countdown refreshes.
      void this.timingTick;
      return resolveOverviewTiming({
        hasName: Boolean(this.displayName),
        status: this.effectiveStatus,
        startsAt: this.startsAt,
        finishedAt: this.finishedAt,
      });
    },
    totalAssets(): number {
      return Number(this.$store.getters["event/getTotalAssets"] || 0);
    },
    filesCap(): string {
      const allowed = this.$store.getters["user/getSubscriptionFilesAllowed"];
      return allowed == null ? "—" : String(allowed);
    },
    pendingFallback(): number {
      return (this.$store.getters["event/getPendingAssets"] || []).length;
    },
    pendingDisplay(): number {
      return this.analytics ? this.analytics.pending : this.pendingFallback;
    },
    guestCountFallback(): number {
      const guests = this.event?.guests;
      if (Array.isArray(guests)) return guests.length;
      return Number(this.event?.guests_count || 0);
    },
    uploadersCount(): number {
      if (this.analyticsUnavailable || !this.analytics) {
        return this.guestCountFallback;
      }
      return this.analytics.uploaders ?? 0;
    },
    landingVisitors(): number {
      return this.analytics?.landing_visitors ?? 0;
    },
    uploadPageVisitors(): number {
      return this.analytics?.upload_page_visitors ?? 0;
    },
    galleryVisitors(): number {
      return this.analytics?.gallery_visitors ?? 0;
    },
    rates(): EventAnalyticsOverview["rates"] {
      return this.analytics?.rates ?? EMPTY_RATES;
    },
    activeVisitors(): number {
      return this.analytics?.active_visitors_15m ?? 0;
    },
    analyticsAvailable(): boolean {
      return Boolean(this.analytics) && !this.analyticsUnavailable;
    },
    analyticsPhotos(): number | null {
      if (!this.analyticsAvailable) return null;
      return this.analytics?.photos ?? 0;
    },
    analyticsVideos(): number | null {
      if (!this.analyticsAvailable) return null;
      return this.analytics?.videos ?? 0;
    },
    analyticsDownloads(): number | null {
      if (!this.analyticsAvailable) return null;
      return this.analytics?.gallery_download_items ?? 0;
    },
    peakHourLabel(): string {
      if (!this.analyticsAvailable) return "";
      const hour = this.analytics?.peak_upload_hour;
      if (hour == null) return "";
      return `${String(hour).padStart(2, "0")}:00`;
    },
    viewsDisplay(): number | string {
      if (!this.analyticsAvailable) return "—";
      return this.landingVisitors;
    },
    daysLeft(): number {
      const finish = this.$store.getters["event/getEventFinishTime"];
      const hours =
        Number(this.$store.getters["user/getSubscriptionFilesStorageTime"]) || 0;
      if (!finish || !hours) return 0;
      const end = new Date(Time.addHours(finish, hours) || finish).getTime();
      if (Number.isNaN(end)) return 0;
      const diff = Math.ceil((end - Date.now()) / 86400000);
      return Math.max(0, diff);
    },
    daysUntilStart(): number | null {
      const start = this.startsAt;
      if (!start) return null;
      const ms = Date.parse(start.includes("T") ? start : start.replace(" ", "T"));
      if (Number.isNaN(ms)) return null;
      const diff = Math.ceil((ms - Date.now()) / 86400000);
      return diff > 0 ? diff : null;
    },
    keyNumberItems(): OverviewKeyNumberItem[] {
      const items: OverviewKeyNumberItem[] = [
        {
          label: "קבצים באלבום",
          value: this.totalAssets,
          hint: this.filesCap !== "—" ? `מתוך ${this.filesCap}` : undefined,
        },
        {
          label: this.analyticsAvailable ? "אורחים שהעלו" : "אורחים",
          value: this.uploadersCount,
        },
        {
          label: "ממתינים לבדיקה",
          value: this.pendingDisplay,
          hint: this.pendingDisplay ? "יש קבצים בתור" : undefined,
        },
      ];
      if (this.analyticsAvailable) {
        items.push({
          label: "כניסות לדף",
          value: this.viewsDisplay,
        });
      } else if (this.timing.phase === "upcoming" && this.daysUntilStart != null) {
        items.push({
          label: "ימים לאירוע",
          value: this.daysUntilStart,
        });
      } else {
        items.push({
          label: "ימים לאחסון",
          value: this.daysLeft > 0 ? this.daysLeft : "—",
        });
      }
      return items;
    },
    effectiveHubPublished(): boolean | null {
      return this.hubPublished;
    },
    storeAssets(): unknown[] {
      const owned = this.$store.getters["event/getOwnerVisibleAssets"];
      if (Array.isArray(owned) && owned.length) return owned;
      const all = this.$store.getters["event/getAssets"];
      return Array.isArray(all) ? all : [];
    },
    nextStep(): OverviewNextStep {
      return resolveOverviewNextStep({
        hasName: Boolean(this.displayName),
        hasDate: Boolean(this.dateLabel || this.startsAt),
        statusPending: this.effectiveStatus === StatusEnum.PENDING,
        phase: this.timing.phase,
        totalAssets: this.totalAssets,
        pendingCount: this.pendingDisplay,
        hubPublished: this.effectiveHubPublished,
      });
    },
    recentUploads(): OverviewUploadThumb[] {
      return pickOverviewRecentUploads(this.storeAssets, 8);
    },
    quickActionItems(): OverviewQuickActionItem[] {
      return [
        {
          title: "המסך החי",
          hint: "הצגה באולם או במחשב",
          to: "/event/gallery/full-screen",
          icon: ACTION_ICONS.live,
        },
        {
          title: "דף האירוע",
          hint: "העמוד שתשלחו לאורחים",
          to: "/event/page",
          icon: ACTION_ICONS.page,
        },
        {
          title: "כרטיס QR",
          hint: "הורדה והדפסה לשולחנות",
          to: "/event/qr",
          icon: ACTION_ICONS.qr,
        },
        {
          title: "עמוד העלאה",
          hint: "איך האורחים מעלים",
          to: "/event/upload",
          icon: ACTION_ICONS.upload,
        },
        {
          title: "אלבום חי",
          hint: "גלריה והגדרות תצוגה",
          to: "/event/gallery",
          icon: ACTION_ICONS.gallery,
        },
        {
          title: "טריוויה",
          hint: "משחק אינטראקטיבי לאורחים",
          to: "/event/trivia",
          icon: ACTION_ICONS.trivia,
        },
        {
          title: "ממתינים לבדיקה",
          hint: `${this.pendingDisplay} ממתינים`,
          to: "/event/assets?filter=pending",
          icon: ACTION_ICONS.mod,
          hidden: this.pendingDisplay <= 0,
        },
        {
          title: "WhatsApp",
          hint: "הזמנות וקמפיינים",
          to: "/event/whatsapp",
          icon: ACTION_ICONS.whatsapp,
          hidden: !isWhatsAppEnabled(),
        },
      ];
    },
    origin(): string {
      return typeof window !== "undefined" ? window.location.origin : "";
    },
    shareLinks(): Array<{ label: string; path: string }> {
      const p = String(this.eventPath || "");
      return [
        { label: "עמוד העלאה לאורחים", path: `/event/uploads/${p}` },
        { label: "האלבום החי למסך", path: `/event/open-album/${p}` },
        { label: "הגלריה לאורחים", path: `/event/open-gallery/${p}` },
      ];
    },
  },

  watch: {
    eventId: {
      immediate: true,
      handler(id: number) {
        if (id && !this.isSetupEmpty) {
          this.loadAnalytics(id);
          this.loadHubMeta(id);
        }
      },
    },
    "timing.phase": {
      immediate: true,
      handler() {
        this.syncTimingTimer();
      },
    },
  },

  mounted() {
    this.syncTimingTimer();
  },

  beforeUnmount() {
    this.clearTimingTimer();
  },

  methods: {
    formatRate(value: number): string {
      if (!this.analyticsAvailable || !value) return "";
      return `${value}% מהשלב הקודם`;
    },
    syncTimingTimer() {
      this.clearTimingTimer();
      if (this.timing.phase !== "upcoming") return;
      this.timingTimer = setInterval(() => {
        this.timingTick += 1;
      }, 30000);
    },
    clearTimingTimer() {
      if (this.timingTimer) {
        clearInterval(this.timingTimer);
        this.timingTimer = null;
      }
    },
    async loadAnalytics(eventId: number) {
      this.analyticsLoading = true;
      this.analyticsUnavailable = false;
      try {
        // Keep calling Gal's endpoint; 404 → quiet empty, no toast.
        this.analytics = await fetchEventAnalyticsOverview(eventId);
        if (!this.analytics) {
          this.analyticsUnavailable = true;
        }
      } catch {
        this.analyticsUnavailable = true;
        this.analytics = null;
      } finally {
        this.analyticsLoading = false;
      }
    },
    async loadHubMeta(eventId: number) {
      try {
        const hub = await getAdminHub(eventId);
        this.hubPublished = Boolean(hub?.is_published);
        this.hubConfig =
          hub?.hub_config && typeof hub.hub_config === "object"
            ? (hub.hub_config as Record<string, unknown>)
            : null;
      } catch {
        // Hub optional for overview; venue/next-step degrade gracefully.
        this.hubPublished = null;
        this.hubConfig = null;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.ov-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Fill the content column beside the sidebar, like the other dashboard views. */
  min-width: 0;
  width: 100%;
  padding-bottom: 28px;
  overflow-x: hidden;
}

.ov-setup {
  background: #fff;
  border-radius: 22px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(18, 16, 14, 0.06);
  border: 1px solid rgba(22, 19, 16, 0.05);
}

.ov-setup__eyebrow {
  margin: 0 0 6px;
  color: #8a8278;
  font-weight: 700;
}

.ov-setup h1 {
  margin: 0 0 8px;
  font-size: clamp(1.4rem, 3vw, 1.8rem);
  font-weight: 900;
}

.ov-setup p {
  margin: 0 0 18px;
  color: #5e564e;
}

.ov-setup__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 12px 22px;
  border-radius: 999px;
  background: #12100e;
  color: #fff;
  text-decoration: none;
  font-weight: 800;
}

@media (max-width: 600px) {
  .ov-page {
    gap: 14px;
  }
}
</style>
