<template>
  <div class="home-page">
    <div v-if="shotError" class="banner error">לא הצלחנו לטעון את הנתונים</div>
    <div v-else-if="shotLoading" class="skeleton-grid" aria-busy="true">
      <div class="skel" v-for="n in 4" :key="n"></div>
    </div>
    <template v-else-if="shotEmpty || isSetupEmpty">
      <header class="page-head">
        <h1>סקירה</h1>
      </header>
      <div class="card empty">
        <h2>האירוע עדיין בהקמה</h2>
        <p>הוסיפו שם ותמונת כיסוי כדי להתחיל.</p>
        <router-link class="btn btn-dark" to="/event/details">פרטי האירוע</router-link>
      </div>
    </template>
    <template v-else>
      <header class="page-head">
        <div>
          <h1>סקירה</h1>
        </div>
        <router-link class="btn btn-dark" to="/event/gallery/full-screen">
          פתיחת המסך החי
        </router-link>
      </header>

      <section class="card status-card">
        <div class="status-main">
          <div>
            <h2>{{ eventName }}</h2>
            <p>{{ dateLabel }}</p>
            <p class="muted">{{ planLabel }} · אחסון עד {{ storageLabel }}</p>
          </div>
          <span class="live-pill" v-if="isLive"><i></i> חי</span>
          <span class="status-pill" v-else>{{ statusLabel }}</span>
        </div>
      </section>

      <section class="stats">
        <article class="stat">
          <strong>{{ totalAssets }}</strong>
          <span>קבצים באלבום</span>
          <small>מתוך {{ filesCap }}</small>
        </article>
        <article class="stat">
          <strong>{{ uploadersCount }}</strong>
          <span>אורחים שהעלו</span>
        </article>
        <article class="stat">
          <strong>{{ pendingDisplay }}</strong>
          <span>ממתינים לבדיקה</span>
          <small v-if="pendingDisplay">יש תמונות בתור</small>
        </article>
        <article class="stat">
          <strong>{{ daysLeft }}</strong>
          <span>ימים לאחסון</span>
        </article>
      </section>

      <section class="stats-block">
        <div class="stats-block__head">
          <h2>משפך אורחים</h2>
          <span v-if="analyticsLoading" class="muted">טוען…</span>
          <span v-else-if="analyticsError" class="muted error-text">לא נטען</span>
          <span v-else class="live-mini">
            {{ activeVisitors }} פעילים ב־15 דק׳
          </span>
        </div>
        <div class="stats">
          <article class="stat">
            <strong>{{ landingVisitors }}</strong>
            <span>נכנסו לדף האירוע</span>
          </article>
          <article class="stat">
            <strong>{{ uploadPageVisitors }}</strong>
            <span>נכנסו לעמוד העלאה</span>
            <small>{{ formatRate(rates.landing_to_upload_page) }} מדף האירוע</small>
          </article>
          <article class="stat">
            <strong>{{ uploadersCount }}</strong>
            <span>העלו קבצים</span>
            <small>{{ formatRate(rates.upload_page_to_upload) }} מעמוד העלאה</small>
          </article>
          <article class="stat">
            <strong>{{ galleryVisitors }}</strong>
            <span>נכנסו לגלריה</span>
            <small>{{ formatRate(rates.upload_to_gallery) }} ממעלים</small>
          </article>
        </div>
      </section>

      <section class="stats-block">
        <div class="stats-block__head">
          <h2>העלאות ומדיה</h2>
        </div>
        <div class="stats">
          <article class="stat">
            <strong>{{ totalGuestUploads }}</strong>
            <span>העלאות אורחים</span>
          </article>
          <article class="stat">
            <strong>{{ avgUploads }}</strong>
            <span>ממוצע העלאות לאורח</span>
          </article>
          <article class="stat">
            <strong>{{ photosCount }}</strong>
            <span>תמונות</span>
          </article>
          <article class="stat">
            <strong>{{ videosCount }}</strong>
            <span>סרטונים</span>
          </article>
        </div>
      </section>

      <section class="stats-block">
        <div class="stats-block__head">
          <h2>בדיקה ומעורבות</h2>
        </div>
        <div class="stats">
          <article class="stat">
            <strong>{{ approvedCount }}</strong>
            <span>מאושרים</span>
          </article>
          <article class="stat">
            <strong>{{ blockedCount }}</strong>
            <span>חסומים</span>
          </article>
          <article class="stat">
            <strong>{{ peakHourLabel }}</strong>
            <span>שעת שיא להעלאות</span>
          </article>
          <article class="stat">
            <strong>{{ galleryDownloadItems }}</strong>
            <span>הורדות מהגלריה</span>
            <small>{{ galleryDownloadEvents }} פעולות הורדה</small>
          </article>
        </div>
      </section>

      <section class="quick">
        <router-link class="qcard" to="/event/gallery/full-screen">
          <span class="ico" aria-hidden="true" v-html="actionIcons.live"></span>
          <strong>פתיחת המסך החי</strong>
          <small>על מסך האולם או המחשב</small>
        </router-link>
        <router-link class="qcard" to="/event/upload">
          <span class="ico" aria-hidden="true" v-html="actionIcons.upload"></span>
          <strong>עמוד העלאה</strong>
          <small>איך האורחים רואים את העמוד</small>
        </router-link>
        <router-link class="qcard" to="/event/qr">
          <span class="ico" aria-hidden="true" v-html="actionIcons.qr"></span>
          <strong>כרטיס QR</strong>
          <small>הורדה והדפסה לשולחנות</small>
        </router-link>
        <router-link class="qcard" to="/event/assets?filter=pending">
          <span class="ico" aria-hidden="true" v-html="actionIcons.mod"></span>
          <strong>ממתינים לבדיקה</strong>
          <small>{{ pendingDisplay }} ממתינים</small>
        </router-link>
      </section>

      <section class="card links">
        <h2>קישורי שיתוף</h2>
        <div class="link-row" v-for="link in shareLinks" :key="link.path">
          <div class="link-meta">
            <strong>{{ link.label }}</strong>
            <small dir="ltr">{{ origin }}{{ link.path }}</small>
          </div>
          <CopyLinkButton :text="`${origin}${link.path}`" />
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CopyLinkButton from "@/components/ui/CopyLinkButton.vue";
import { StatusEnum } from "@/helpers/enums";
import Time from "@/helpers/time";
import {
  fetchEventAnalyticsOverview,
  type EventAnalyticsOverview,
} from "@/api/eventAnalytics";

const ACTION_ICONS = {
  live: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="3" y="5" width="18" height="12" rx="2"/><path fill="none" d="M8 21h8M12 17v4"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="7" y="2.5" width="10" height="19" rx="2.5"/><path fill="none" d="M11 18.5h2"/></svg>`,
  qr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect fill="none" x="4" y="4" width="7" height="7" rx="1.2"/><rect fill="none" x="13" y="4" width="7" height="7" rx="1.2"/><rect fill="none" x="4" y="13" width="7" height="7" rx="1.2"/><path d="M14 14h2v2h-2zm3 0h3v3h-2v2h-3v-3h2z" fill="currentColor" stroke="none"/></svg>`,
  mod: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path fill="none" d="M12 3 5 6v5c0 5 3.2 8.6 7 10 3.8-1.4 7-5 7-10V6z"/><path fill="none" d="M9.5 12.2 11.2 14l3.5-4"/></svg>`,
};

const EMPTY_RATES = {
  landing_to_upload_page: 0,
  upload_page_to_upload: 0,
  upload_to_gallery: 0,
};

export default defineComponent({
  name: "EventHomeView",

  components: { CopyLinkButton },

  data(): {
    actionIcons: typeof ACTION_ICONS;
    analytics: EventAnalyticsOverview | null;
    analyticsLoading: boolean;
    analyticsError: boolean;
  } {
    return {
      actionIcons: ACTION_ICONS,
      analytics: null,
      analyticsLoading: false,
      analyticsError: false,
    };
  },

  computed: {
    shotEmpty(): boolean {
      return this.$route.query.empty === "1";
    },
    shotLoading(): boolean {
      return this.$route.query.loading === "1";
    },
    shotError(): boolean {
      return this.$route.query.error === "1";
    },
    event(): any {
      return this.$store.getters["event/getEvent"];
    },
    eventId(): number {
      return Number(this.event?.id || 0);
    },
    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
    },
    eventPath(): string {
      return this.$store.getters["event/getEventPath"] || "";
    },
    isSetupEmpty(): boolean {
      return !String(this.eventName || "").trim();
    },
    isLive(): boolean {
      return this.$store.getters["event/isEventInProgress"];
    },
    statusLabel(): string {
      const s = this.$store.getters["event/getEventStatus"];
      if (s === StatusEnum.PENDING) return "ממתין";
      if (s === StatusEnum.READY) return "מוכן";
      if (s === StatusEnum.ACTIVE) return "פעיל";
      if (s === StatusEnum.INACTIVE) return "לא פעיל";
      return "סטטוס";
    },
    dateLabel(): string {
      return this.$store.getters["event/getEventDate"] || "";
    },
    planLabel(): string {
      const name = this.$store.getters["user/getSubscriptionName"] || "";
      return name || "נסיון";
    },
    storageLabel(): string {
      const finish = this.$store.getters["event/getEventFinishTime"];
      const hours =
        Number(this.$store.getters["user/getSubscriptionFilesStorageTime"]) || 0;
      if (!finish || !hours) return "—";
      return Time.addHours(finish, hours) || "—";
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
    uploadersCount(): number {
      return this.analytics?.uploaders ?? 0;
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
    totalGuestUploads(): number {
      return this.analytics?.total_guest_uploads ?? 0;
    },
    avgUploads(): string {
      const v = this.analytics?.avg_uploads_per_uploader;
      if (v == null) return "0";
      return Number.isInteger(v) ? String(v) : v.toFixed(1);
    },
    photosCount(): number {
      return this.analytics?.photos ?? 0;
    },
    videosCount(): number {
      return this.analytics?.videos ?? 0;
    },
    approvedCount(): number {
      return this.analytics?.approved ?? 0;
    },
    blockedCount(): number {
      return this.analytics?.blocked ?? 0;
    },
    peakHourLabel(): string {
      const hour = this.analytics?.peak_upload_hour;
      if (hour == null) return "—";
      return `${String(hour).padStart(2, "0")}:00`;
    },
    galleryDownloadItems(): number {
      return this.analytics?.gallery_download_items ?? 0;
    },
    galleryDownloadEvents(): number {
      return this.analytics?.gallery_download_events ?? 0;
    },
    activeVisitors(): number {
      return this.analytics?.active_visitors_15m ?? 0;
    },
    daysLeft(): number {
      const finish = this.$store.getters["event/getEventFinishTime"];
      const hours =
        Number(this.$store.getters["user/getSubscriptionFilesStorageTime"]) || 0;
      if (!finish || !hours) return 0;
      const end = new Date(Time.addHours(finish, hours) || finish).getTime();
      const diff = Math.ceil((end - Date.now()) / 86400000);
      return Math.max(0, diff);
    },
    origin(): string {
      return typeof window !== "undefined" ? window.location.origin : "";
    },
    shareLinks(): Array<{ label: string; path: string }> {
      const p = String(this.$store.getters["event/getEventPath"] || "");
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
        }
      },
    },
  },

  methods: {
    formatRate(value: number): string {
      if (!value) return "0% המרה";
      return `${value}% המרה`;
    },
    async loadAnalytics(eventId: number) {
      this.analyticsLoading = true;
      this.analyticsError = false;
      try {
        this.analytics = await fetchEventAnalyticsOverview(eventId);
      } catch {
        this.analyticsError = true;
        this.analytics = null;
      } finally {
        this.analyticsLoading = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.page-head h1 {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 12px 22px;
  font-weight: 800;
  text-decoration: none;
  border: 0;
  cursor: pointer;
  font-family: inherit;
}
.btn-dark {
  background: #12100e;
  color: #fff;
}
.card {
  background: #fff;
  border-radius: 26px;
  padding: 28px 32px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.status-main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.status-main h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 900;
}
.muted {
  color: #5e564e;
}
.error-text {
  color: #9a3036;
}
.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff4f4;
  color: #9a3036;
  font-weight: 800;
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 999px;
}
.live-pill i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #dc5b66;
}
.live-mini {
  font-size: 0.85rem;
  font-weight: 700;
  color: #5e564e;
}
.stats-block {
  margin: 8px 0 18px;
}
.stats-block__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.stats-block__head h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin: 18px 0;
}
.stats-block .stats {
  margin: 0;
}
.stat {
  background: #fff;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.stat strong {
  display: block;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}
.stat span {
  display: block;
  font-weight: 700;
}
.stat small {
  color: #8a8278;
}
.quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}
.qcard {
  background: #fff;
  border-radius: 22px;
  padding: 22px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.qcard .ico {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(201, 163, 106, 0.16);
  color: #161310;
  margin-bottom: 4px;
}
.qcard .ico :deep(svg) {
  width: 22px;
  height: 22px;
  display: block;
  fill: none;
  stroke: currentColor;
}
.qcard .ico :deep(svg [fill="currentColor"]) {
  fill: currentColor;
  stroke: none;
}
.qcard strong {
  display: block;
  margin-top: 10px;
  font-weight: 800;
}
.qcard small {
  color: #5e564e;
}
.links h2 {
  margin: 0 0 14px;
  font-size: 1.22rem;
  font-weight: 800;
}
.link-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-top: 1px solid rgba(22, 19, 16, 0.08);
}
.link-row:first-of-type {
  border-top: 0;
}
.link-meta {
  flex: 1;
  min-width: 0;
  text-align: start;
}
.link-row strong {
  display: block;
}
.link-row small {
  display: block;
  color: #8a8278;
  direction: ltr;
  unicode-bidi: isolate;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.banner.error {
  background: #fff4f4;
  color: #9a3036;
  border-radius: 16px;
  padding: 14px 18px;
  font-weight: 800;
  margin-bottom: 16px;
}
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.skel {
  height: 110px;
  border-radius: 22px;
  background: linear-gradient(90deg, #ebe4da, #f7f2ea, #ebe4da);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
.empty {
  text-align: center;
}
.empty h2 {
  margin: 0 0 8px;
}
.empty p {
  color: #5e564e;
  margin-bottom: 18px;
}
@media (max-width: 1024px) {
  .stats,
  .quick {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .stats,
  .quick,
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
