<template>
  <div>
    <div v-if="!eventDate" class="msg-note red">לאירוע אין תאריך עדיין — הגדירו תאריך בפרטי האירוע כדי שהאוטומציות יתוזמנו.</div>
    <p class="msg-note grey">כל אוטומציה פעילה נכנסת לתור השליחה כהודעה רגילה — אפשר לערוך, להזיז או להשהות אותה שם. לפני השליחה בודקים שוב מי מתאים, כך שמי שכבר אישר לא יקבל תזכורת.</p>
    <article v-for="a in automations" :key="a.id" class="gs-card msg-auto" style="margin-bottom: 10px">
      <div class="msg-auto-when" aria-hidden="true">
        <strong>{{ a.offset_days === 0 ? "היום" : (a.offset_days > 0 ? "+" : "") + a.offset_days }}</strong>
        <span>{{ a.offset_days === 0 ? "יום האירוע" : "ימים" }} · {{ a.send_time }}</span>
      </div>
      <div>
        <div class="msg-q-top">
          <span class="b">{{ categoryLabel[a.category] }}</span>
          <span :class="'b ' + stateOf(a).cls">{{ stateOf(a).label }}</span>
        </div>
        <h3 class="msg-q-title">{{ a.title }}</h3>
        <p class="msg-muted" style="margin: 0">{{ ruleText(a) }} · הבא: {{ fmtWhen(a.next_run_at) }}</p>
        <div class="msg-auto-edit">
          <label class="gs-sr" :for="'off-' + a.id">ימים ביחס לאירוע</label>
          <input :id="'off-' + a.id" v-model.number="edits[a.id].offset_days" class="gs-input" type="number" min="-365" max="60" />
          <span class="msg-muted">ימים</span>
          <label class="gs-sr" :for="'tm-' + a.id">שעה</label>
          <input :id="'tm-' + a.id" v-model="edits[a.id].send_time" class="gs-input" type="time" />
          <button class="gs-btn gs-btn-sm" type="button" :disabled="busy === a.id || !dirty(a)" @click="save(a, {})">שמירה</button>
          <button v-if="a.send_id" class="gs-btn gs-btn-sm gs-btn-ghost" type="button" @click="$emit('go', 'queue')">בתור ←</button>
        </div>
      </div>
      <label class="msg-switch" :title="a.enabled ? 'כיבוי' : 'הפעלה'">
        <input type="checkbox" :checked="a.enabled" :aria-label="(a.enabled ? 'כיבוי ' : 'הפעלת ') + a.title" :disabled="busy === a.id" @change="save(a, { enabled: !a.enabled })" />
        <span></span>
      </label>
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { messagingApi } from "@/helpers/messaging/api";
import { Automation } from "@/helpers/messaging/types";
import { CATEGORY_LABEL, fmtWhen, msgError, SEND_STATUS } from "@/helpers/messaging/labels";
import { STATUS_LABELS } from "@/helpers/seating/labels";
import { notify } from "@/helpers/notify";

export default defineComponent({
  name: "MessagingAutomationsPanel",
  props: {
    eventId: { type: Number, required: true },
    automations: { type: Array as PropType<Automation[]>, required: true },
    eventDate: { type: String, default: null },
  },
  emits: ["changed", "go"],
  data() {
    return { busy: 0, categoryLabel: CATEGORY_LABEL, edits: {} as Record<number, { offset_days: number; send_time: string }> };
  },
  watch: {
    automations: {
      immediate: true,
      handler(list: Automation[]) {
        const e: Record<number, { offset_days: number; send_time: string }> = {};
        list.forEach((a) => (e[a.id] = { offset_days: a.offset_days, send_time: a.send_time }));
        this.edits = e;
      },
    },
  },
  methods: {
    fmtWhen,
    dirty(a: Automation): boolean {
      const e = this.edits[a.id];
      return !!e && (e.offset_days !== a.offset_days || e.send_time !== a.send_time);
    },
    stateOf(a: Automation) {
      const map: Record<string, { label: string; cls: string }> = {
        off: { label: "כבוי", cls: "b-grey" },
        missed: { label: "המועד עבר", cls: "b-grey" },
        needs_event_date: { label: "חסר תאריך אירוע", cls: "b-red" },
        pending: { label: "יתוזמן", cls: "b-gold" },
      };
      return map[a.state] || SEND_STATUS[a.state as keyof typeof SEND_STATUS] || { label: a.state, cls: "b-grey" };
    },
    ruleText(a: Automation): string {
      const st = (a.segment.statuses || []).map((s) => (STATUS_LABELS as Record<number, string>)[s]).join(" / ");
      return (st ? "סטטוס: " + st : "כל המוזמנים") + (a.segment.has_table ? " + שובצו לשולחן" : "");
    },
    async save(a: Automation, extra: Partial<Automation>) {
      this.busy = a.id;
      try {
        await messagingApi.saveAutomation(this.eventId, a.id, { ...this.edits[a.id], ...extra });
        notify({ type: "success", text: extra.enabled === false ? "האוטומציה כובתה וההודעה הממתינה בוטלה" : "נשמר" });
        this.$emit("changed");
      } catch (e) {
        notify({ type: "error", text: msgError(e, "השמירה נכשלה") });
      } finally {
        this.busy = 0;
      }
    },
  },
});
</script>
