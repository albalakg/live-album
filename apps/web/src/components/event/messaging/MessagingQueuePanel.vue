<template>
  <div>
    <section class="gs-card msg-card" style="margin-bottom: 14px">
      <div class="msg-card-head">
        <div>
          <h2>ניהול תור השליחה — כל עוד לא נשלח, אפשר לשנות</h2>
          <p class="msg-sub">אפשר לשנות מועד, תוכן וקהל, להשהות, לבטל או לשלוח עכשיו. הודעה שכבר יצאה לאורח נעולה.</p>
        </div>
        <span class="b b-dark">{{ upcoming.length }} ממתינים לטיפול</span>
      </div>
      <div class="msg-filters" role="group" aria-label="סינון התור">
        <button v-for="f in filters" :key="f.key" type="button" class="msg-chip-btn" :class="{ on: filter === f.key }" :aria-pressed="filter === f.key" @click="filter = f.key">
          {{ f.label }} ({{ countFor(f.key) }})
        </button>
      </div>
    </section>

    <p v-if="!shown.length" class="msg-empty gs-card">אין כאן הודעות. אפשר ליצור הודעה חדשה או להפעיל אוטומציה.</p>

    <article v-for="s in shown" :key="s.id" class="gs-card msg-q-card" :class="{ 'is-review': s.status === 'review', 'is-paused': s.status === 'paused' }" style="margin-bottom: 12px">
      <div class="msg-q-top">
        <span class="b b-dark">{{ s.source === "automation" ? "אוטומציה" : "ידני" }}</span>
        <span :class="'b ' + statusOf(s).cls">{{ statusOf(s).label }}</span>
        <span class="b">{{ categoryLabel[s.category] }}</span>
        <span v-if="s.override_quiet" class="b b-amber">עוקף שעות שקט</span>
        <span v-if="s.counts.sms" class="b b-blue">{{ s.counts.sms }} ב-SMS</span>
      </div>
      <h3 class="msg-q-title">{{ s.title }}</h3>
      <div class="msg-q-meta">
        <span>מועד: <b>{{ fmtWhen(s.scheduled_at) }}</b></span>
        <span>ממתינים: <b>{{ s.counts.pending }}</b></span>
        <span>נשלחו: <b>{{ s.counts.sent }}</b></span>
        <span v-if="s.counts.failed">נכשלו: <b>{{ s.counts.failed }}</b></span>
        <span v-if="s.counts.skipped">דולגו: <b>{{ s.counts.skipped }}</b></span>
        <span>גרסה: <b>{{ s.version }}</b></span>
      </div>
      <div v-if="s.status === 'review'" class="msg-note violet">
        <template v-if="s.template_status === 'rejected'">Meta דחתה את הנוסח{{ s.template_reason ? ": " + s.template_reason : "" }}. ערכו את התוכן כדי לשלוח לבדיקה מחדש.</template>
        <template v-else>הנוסח נמצא בבדיקת Meta. ההודעה תצא אוטומטית מיד אחרי האישור.</template>
        <button v-if="devTools && s.template_status === 'pending'" class="gs-btn gs-btn-sm" type="button" style="margin-inline-start: 8px" @click="$emit('dev-approve', s)">אישור מדומה (מקומי)</button>
      </div>
      <div v-if="s.counts.sent && s.counts.pending" class="msg-note gold">
        נשלחו כבר {{ s.counts.sent }} הודעות (נעולות). עריכת מועד, תוכן או קהל תחול רק על {{ s.counts.pending }} האורחים שטרם נשלח אליהם.
      </div>
      <div v-if="s.audience_mode === 'dynamic' && s.editable" class="msg-note grey">קהל חכם: לפני השליחה בודקים שוב מי מתאים (למשל מי שכבר אישר לא יקבל תזכורת).</div>

      <div v-if="expanded[s.id]" style="margin-top: 8px">
        <div class="msg-guest-chips" aria-label="נמענים">
          <button v-for="r in recipients[s.id] || []" :key="r.id" type="button" class="msg-guest-chip" :class="{ locked: r.locked }" :title="recipientTitle(r)" @click="$emit('open-guest', { id: r.guest_id, full_name: r.full_name })">
            <span class="gs-ava" aria-hidden="true">{{ initials(r.full_name) }}</span>{{ r.locked ? "🔒 " : "" }}{{ r.full_name }} · {{ recipientStatus[r.status] }}
          </button>
        </div>
        <div v-if="audit[s.id] && audit[s.id].length" class="msg-scroll" style="margin-top: 10px">
          <table class="msg-table">
            <thead><tr><th>מתי</th><th>פעולה</th><th>ממתינים שהושפעו</th><th>נעולים</th></tr></thead>
            <tbody>
              <tr v-for="a in audit[s.id]" :key="a.id">
                <td>{{ fmtShort(a.created_at) }}</td>
                <td>{{ actionLabel[a.action] || a.action }}</td>
                <td>{{ a.affected_pending }}</td>
                <td>{{ a.locked_unchanged }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="resched === s.id" class="msg-resched">
        <div>
          <label class="gs-label" :for="'rs-' + s.id">מועד חדש (שעון ישראל)</label>
          <input :id="'rs-' + s.id" v-model="reschedAt" class="gs-input" type="datetime-local" />
        </div>
        <button class="gs-btn msg-btn-green" type="button" :disabled="busy" @click="saveResched(s)">שמירה</button>
        <button class="gs-btn" type="button" @click="resched = 0">ביטול</button>
        <p class="msg-muted" style="width: 100%; margin: 0">מועד בשעות שקט / שבת יוזז אוטומטית למועד המותר הבא (אלא אם כיביתם את ההגנה).</p>
      </div>

      <div class="msg-q-actions">
        <template v-if="s.editable">
          <button class="gs-btn gs-btn-sm" type="button" @click="openResched(s)">שינוי מועד</button>
          <button class="gs-btn gs-btn-sm" type="button" @click="$emit('edit', s, 'content')">עריכת תוכן</button>
          <button class="gs-btn gs-btn-sm" type="button" @click="$emit('edit', s, 'audience')">שינוי קהל</button>
          <button v-if="s.status !== 'paused'" class="gs-btn gs-btn-sm" type="button" :disabled="busy" @click="act(s, 'pause')">השהיה</button>
          <button v-else class="gs-btn gs-btn-sm" type="button" :disabled="busy" @click="act(s, 'resume')">המשך</button>
          <button class="gs-btn gs-btn-sm msg-btn-green" type="button" :disabled="busy || s.status === 'review'" @click="sendNow(s)">שליחה עכשיו</button>
          <button class="gs-btn gs-btn-sm msg-btn-rose" type="button" :disabled="busy" @click="cancel(s)">ביטול שליחה ממתינה</button>
        </template>
        <button class="gs-btn gs-btn-sm gs-btn-ghost" type="button" :aria-expanded="!!expanded[s.id]" @click="toggle(s)">{{ expanded[s.id] ? "הסתרת פרטים" : "נמענים והיסטוריה" }}</button>
        <button v-if="devTools && s.counts.sent" class="gs-btn gs-btn-sm gs-btn-ghost" type="button" @click="$emit('dev-delivery', s)">סימולציית מסירה+קריאה</button>
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { messagingApi, SendPatch } from "@/helpers/messaging/api";
import { AuditRow, MessagingSend, RecipientRow } from "@/helpers/messaging/types";
import { CATEGORY_LABEL, CONFLICT_LABEL, errData, errStatus, fmtShort, fmtWhen, msgError, RECIPIENT_STATUS, SEND_STATUS, SKIP_REASONS, toLocalInput } from "@/helpers/messaging/labels";
import { initials } from "@/helpers/seating/labels";
import { notify } from "@/helpers/notify";

type FilterKey = "open" | "all" | "scheduled" | "review" | "paused" | "sending" | "done";

export default defineComponent({
  name: "MessagingQueuePanel",
  props: {
    eventId: { type: Number, required: true },
    sends: { type: Array as PropType<MessagingSend[]>, required: true },
    devTools: { type: Boolean, default: false },
  },
  emits: ["changed", "edit", "open-guest", "dev-approve", "dev-delivery"],
  data() {
    return {
      filter: "open" as FilterKey,
      filters: [
        { key: "open", label: "פתוחים" },
        { key: "all", label: "הכל" },
        { key: "scheduled", label: "מתוזמן" },
        { key: "review", label: "בבדיקת Meta" },
        { key: "paused", label: "מושהה" },
        { key: "sending", label: "בשליחה חלקית" },
        { key: "done", label: "נשלח / בוטל" },
      ] as { key: FilterKey; label: string }[],
      resched: 0,
      reschedAt: "",
      busy: false,
      expanded: {} as Record<number, boolean>,
      recipients: {} as Record<number, RecipientRow[]>,
      audit: {} as Record<number, AuditRow[]>,
      categoryLabel: CATEGORY_LABEL,
      recipientStatus: RECIPIENT_STATUS,
      actionLabel: { create: "נוצרה", update: "עודכנה", pause: "הושהתה", resume: "חודשה", cancel: "בוטלה", send_now: "נשלחה עכשיו", automation_resync: "סונכרנה לתאריך האירוע" } as Record<string, string>,
    };
  },
  computed: {
    upcoming(): MessagingSend[] {
      return this.sends.filter((s) => s.editable);
    },
    shown(): MessagingSend[] {
      return this.sends.filter((s) => this.match(s, this.filter));
    },
  },
  methods: {
    fmtWhen,
    fmtShort,
    initials,
    match(s: MessagingSend, f: FilterKey): boolean {
      if (f === "all") return true;
      if (f === "open") return s.editable;
      if (f === "done") return !s.editable;
      return s.status === f;
    },
    countFor(f: FilterKey): number {
      return this.sends.filter((s) => this.match(s, f)).length;
    },
    statusOf(s: MessagingSend) {
      if (s.status === "sending" && s.counts.sent) return { label: "בשליחה חלקית", cls: "b-amber" };
      return SEND_STATUS[s.status] || { label: s.status, cls: "b-grey" };
    },
    recipientTitle(r: RecipientRow): string {
      return r.skip_reason ? SKIP_REASONS[r.skip_reason] || r.skip_reason : r.error || "";
    },
    openResched(s: MessagingSend) {
      this.resched = s.id;
      this.reschedAt = toLocalInput(s.scheduled_at);
    },
    async toggle(s: MessagingSend) {
      this.expanded = { ...this.expanded, [s.id]: !this.expanded[s.id] };
      if (this.expanded[s.id]) {
        const [rec, aud] = await Promise.all([messagingApi.recipients(this.eventId, s.id), messagingApi.audit(this.eventId, s.id)]);
        this.recipients = { ...this.recipients, [s.id]: rec };
        this.audit = { ...this.audit, [s.id]: aud };
      }
    },
    async patch(s: MessagingSend, patch: Omit<SendPatch, "expected_version">, ok: string): Promise<boolean> {
      this.busy = true;
      try {
        const res = await messagingApi.patch(this.eventId, s.id, { expected_version: s.version, ...patch });
        const moved = res.changes && (res.changes as Record<string, unknown>).adjusted_from;
        notify({ type: "success", text: moved ? `${ok} · הוזז ל${fmtWhen(res.scheduled_at)} בגלל שעות שקט/שבת` : ok });
        this.$emit("changed", res);
        return true;
      } catch (e) {
        if (errStatus(e) === 409) {
          notify({ type: "error", text: "ההודעה עודכנה בינתיים ממקום אחר — טענו מחדש את התור" });
          this.$emit("changed");
        } else {
          const d = errData<{ conflicts?: string[] }>(e);
          if (d?.conflicts && patch.action === "send_now") {
            const names = d.conflicts.map((c) => CONFLICT_LABEL[c] || c).join(" + ");
            if (window.confirm(`עכשיו ${names}. לשלוח בכל זאת?`)) {
              this.busy = false;
              return this.patch(s, { action: "send_now", override_quiet: true }, ok);
            }
          } else {
            notify({ type: "error", text: msgError(e, "הפעולה נכשלה") });
          }
        }
        return false;
      } finally {
        this.busy = false;
      }
    },
    async saveResched(s: MessagingSend) {
      if (await this.patch(s, { scheduled_at: this.reschedAt }, "המועד עודכן")) this.resched = 0;
    },
    act(s: MessagingSend, action: "pause" | "resume") {
      this.patch(s, { action }, action === "pause" ? "השליחה הושהתה" : "השליחה חודשה");
    },
    sendNow(s: MessagingSend) {
      if (!window.confirm(`לשלוח עכשיו ל-${s.counts.pending} אורחים?`)) return;
      this.patch(s, { action: "send_now" }, "נשלח");
    },
    cancel(s: MessagingSend) {
      if (!window.confirm(`לבטל את ${s.counts.pending} ההודעות שטרם נשלחו? המכסה תשוחרר.`)) return;
      this.patch(s, { action: "cancel" }, "השליחות הממתינות בוטלו");
    },
  },
});
</script>
