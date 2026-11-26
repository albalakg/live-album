<template>
  <div class="msg-grid">
    <section class="msg-hero" aria-label="מכסת הודעות">
      <div>
        <h2>מכסת הודעות לאורח — {{ quota.package.label }}{{ quota.pro_addon ? " + Pro" : "" }}</h2>
        <p>
          כל אורח יכול לקבל עד <b>{{ quota.per_guest }}</b> הודעות WhatsApp מתבנית לאירוע הזה{{ quota.max_guests ? ` (עד ${quota.max_guests} אורחים)` : "" }}.
          תשובות האורחים ובוט אישור ההגעה בתוך 24 שעות לא נספרים במכסה.
        </p>
        <div class="msg-pkgs">
          <span v-for="p in quota.pricing.packages" :key="p.id" class="msg-pkg" :class="{ on: p.id === quota.package.id && !quota.pro_addon }">{{ p.label }} · {{ p.per_guest }}/אורח</span>
          <span class="msg-pkg" :class="{ on: quota.pro_addon }">Pro · {{ quota.pricing.pro_addon.per_guest }}/אורח</span>
        </div>
      </div>
      <div class="msg-hero-box">
        <div class="msg-row"><span style="color: #cfc6b8; font-size: 12px">יתרה באירוע</span><span class="msg-spacer"></span><span class="msg-hero-num">{{ freePct }}% פנוי</span></div>
        <div class="msg-bar" style="margin-top: 8px" role="progressbar" :aria-valuenow="usedPct" aria-valuemin="0" aria-valuemax="100" aria-label="ניצול המכסה"><i :style="{ width: usedPct + '%' }"></i></div>
        <div class="msg-hero-meta">
          <span>נוצלו {{ quota.used }} · שמורות בתור {{ quota.reserved }}</span>
          <span>מתוך {{ quota.capacity }} ({{ quota.guests_with_phone }} אורחים עם טלפון)</span>
        </div>
      </div>
    </section>

    <section class="msg-grid cols-5" aria-label="מדדים">
      <div class="gs-card msg-card msg-kpi"><strong>{{ overview.funnel.sent }}</strong><span>הודעות נשלחו</span></div>
      <div class="gs-card msg-card msg-kpi"><strong class="ok">{{ pct(overview.funnel.delivered, overview.funnel.sent) }}%</strong><span>נמסרו ({{ overview.funnel.delivered }})</span></div>
      <div class="gs-card msg-card msg-kpi"><strong>{{ pct(overview.funnel.read, overview.funnel.sent) }}%</strong><span>נקראו ({{ overview.funnel.read }})</span></div>
      <div class="gs-card msg-card msg-kpi"><strong class="ok">{{ responded }}/{{ overview.guests.total }}</strong><span>ענו לאישור הגעה</span></div>
      <div class="gs-card msg-card msg-kpi"><strong class="warn">{{ overview.inbox.unread }}</strong><span>תגובות שממתינות לך</span></div>
    </section>

    <div class="msg-grid cols-2">
      <section class="gs-card msg-card">
        <div class="msg-card-head">
          <div>
            <h2>הבא בתור</h2>
            <p class="msg-sub">{{ overview.queue.upcoming }} הודעות פתוחות · {{ overview.queue.pending_messages }} נמענים ממתינים</p>
          </div>
          <button class="gs-btn gs-btn-sm" type="button" @click="$emit('go', 'queue')">לתור השליחה</button>
        </div>
        <div v-if="overview.queue.next" class="msg-note gold">
          <b>{{ overview.queue.next.title }}</b> · {{ fmtWhen(overview.queue.next.scheduled_at) }} · {{ overview.queue.next.counts.pending }} נמענים
        </div>
        <p v-else class="msg-muted">אין הודעות מתוזמנות. אפשר להפעיל אוטומציות או ליצור הודעה.</p>
        <div v-if="overview.queue.review" class="msg-note violet">{{ overview.queue.review }} הודעות ממתינות לאישור נוסח מ-Meta.</div>
        <div class="msg-row" style="margin-top: 10px">
          <button class="gs-btn msg-btn-green" type="button" @click="$emit('compose', 'rsvp_invite')">שליחת אישור הגעה</button>
          <button class="gs-btn" type="button" @click="$emit('go', 'automations')">אוטומציות</button>
        </div>
      </section>

      <section class="gs-card msg-card">
        <h2>אישורי הגעה (מהרשימה)</h2>
        <p class="msg-sub">מתעדכן אוטומטית מהבוט, מהקישור האישי ומדף האירוע</p>
        <div v-for="row in rsvpRows" :key="row.key" class="msg-funnel-row">
          <span>{{ row.label }}</span>
          <div class="msg-bar light"><i :style="{ width: pct(row.value, overview.guests.total) + '%' }"></i></div>
          <b>{{ row.value }}</b>
        </div>
        <p class="msg-muted">ענו בוואטסאפ: {{ overview.guests.responded_whatsapp }} · באתר: {{ overview.guests.responded_web }} · בלי טלפון: {{ overview.guests.no_phone }} · הוסרו: {{ overview.guests.opted_out }}</p>
      </section>
    </div>

    <div class="msg-note grey">
      שולח: מספר SnapShare רשמי מאומת ({{ overview.provider === "mock" ? "מצב בדיקה מקומי — לא נשלחות הודעות אמיתיות" : "Meta Cloud API" }}).
      שעות שקט: {{ overview.settings.quiet_hours_enabled ? "פעיל" : "כבוי" }} · שמירת שבת: {{ overview.settings.shabbat_guard_enabled ? "פעיל" : "כבוי" }} · גיבוי SMS: {{ overview.settings.sms_fallback_enabled ? "פעיל" : "כבוי" }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Overview, QuotaSummary } from "@/helpers/messaging/types";
import { fmtWhen } from "@/helpers/messaging/labels";

export default defineComponent({
  name: "MessagingDashboardPanel",
  props: { overview: { type: Object as PropType<Overview>, required: true } },
  emits: ["go", "compose"],
  computed: {
    quota(): QuotaSummary {
      return this.overview.quota;
    },
    usedPct(): number {
      const q = this.quota;
      return q.capacity ? Math.min(100, Math.round(((q.used + q.reserved) / q.capacity) * 100)) : 0;
    },
    freePct(): number {
      return 100 - this.usedPct;
    },
    responded(): number {
      const b = this.overview.guests.by_status;
      return (b["1"] || 0) + (b["2"] || 0);
    },
    rsvpRows(): { key: string; label: string; value: number }[] {
      const b = this.overview.guests.by_status;
      return [
        { key: "1", label: "מגיעים", value: b["1"] || 0 },
        { key: "3", label: "אולי", value: b["3"] || 0 },
        { key: "0", label: "ממתינים", value: b["0"] || 0 },
        { key: "2", label: "לא מגיעים", value: b["2"] || 0 },
      ];
    },
  },
  methods: {
    fmtWhen,
    pct(a: number, b: number): number {
      return b ? Math.round((a / b) * 100) : 0;
    },
  },
});
</script>
