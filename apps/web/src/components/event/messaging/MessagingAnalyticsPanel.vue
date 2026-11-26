<template>
  <div class="msg-grid">
    <div class="msg-grid cols-2">
      <section class="gs-card msg-card">
        <h2>משפך מסירה</h2>
        <p class="msg-sub">מבוסס על אישורי המסירה של WhatsApp</p>
        <div v-for="row in funnelRows" :key="row.label" class="msg-funnel-row">
          <span>{{ row.label }}</span>
          <div class="msg-bar light"><i :class="{ full: row.bad }" :style="{ width: pct(row.value) + '%' }"></i></div>
          <b>{{ row.value }}</b>
        </div>
      </section>
      <section class="gs-card msg-card">
        <h2>תגובות ועלות</h2>
        <p class="msg-sub">סוגי התשובות שהתקבלו והערכת עלות Meta (לפי מחירון ישראל)</p>
        <div class="msg-row" style="margin-bottom: 10px">
          <span v-for="(c, k) in data.replies_by_intent" :key="k" class="b b-gold">{{ intentLabel[k] || k }}: {{ c }}</span>
          <span v-if="!Object.keys(data.replies_by_intent).length" class="msg-muted">עוד אין תגובות</span>
        </div>
        <div class="msg-kpi"><strong>₪{{ data.cost.ils }}</strong><span>עלות Meta משוערת עד עכשיו (${{ data.cost.usd }})</span></div>
      </section>
    </div>
    <section class="gs-card msg-card">
      <h2>שליחות שהסתיימו או בתהליך</h2>
      <div class="msg-scroll">
        <table class="msg-table">
          <thead>
            <tr><th>הודעה</th><th>קטגוריה</th><th>התחלה</th><th>סטטוס</th><th>נשלחו</th><th>נמסרו</th><th>נקראו</th><th>השיבו</th><th>נכשלו</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in data.sends" :key="s.id">
              <td><b>{{ s.title }}</b></td>
              <td><span class="b">{{ categoryLabel[s.category] }}</span></td>
              <td>{{ fmtShort(s.started_at || s.scheduled_at) }}</td>
              <td><span :class="'b ' + (sendStatus[s.status] ? sendStatus[s.status].cls : 'b-grey')">{{ sendStatus[s.status] ? sendStatus[s.status].label : s.status }}</span></td>
              <td>{{ s.counts.sent }}</td>
              <td>{{ s.counts.delivered }}</td>
              <td>{{ s.counts.read }}</td>
              <td>{{ s.counts.replied }}</td>
              <td>{{ s.counts.failed }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!data.sends.length" class="msg-empty">עוד לא נשלחו הודעות</p>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { AnalyticsResponse } from "@/helpers/messaging/types";
import { CATEGORY_LABEL, fmtShort, SEND_STATUS } from "@/helpers/messaging/labels";

export default defineComponent({
  name: "MessagingAnalyticsPanel",
  props: { data: { type: Object as PropType<AnalyticsResponse>, required: true } },
  data() {
    return {
      categoryLabel: CATEGORY_LABEL,
      sendStatus: SEND_STATUS as Record<string, { label: string; cls: string }>,
      intentLabel: { rsvp_update: "עדכון הגעה", question: "שאלה", opt_out: "הסרה", other: "אחר" } as Record<string, string>,
    };
  },
  computed: {
    funnelRows(): { label: string; value: number; bad?: boolean }[] {
      const f = this.data.funnel;
      return [
        { label: "נשלחו", value: f.sent },
        { label: "נמסרו", value: f.delivered },
        { label: "נקראו", value: f.read },
        { label: "השיבו", value: f.replied },
        { label: "נכשלו", value: f.failed, bad: true },
        { label: "ב-SMS", value: f.sms },
      ];
    },
  },
  methods: {
    fmtShort,
    pct(v: number): number {
      const max = this.data.funnel.sent || 1;
      return Math.min(100, Math.round((v / max) * 100));
    },
  },
});
</script>
