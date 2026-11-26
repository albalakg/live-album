<template>
  <div class="msg-composer-wrap">
    <div v-if="editSend" class="msg-note gold" role="status">
      <b>עריכת הודעה בתור · גרסה {{ editSend.version }}</b> —
      השינויים יחולו רק על <b>{{ editSend.counts.pending }}</b> הודעות שעוד לא יצאו.
      <span v-if="editSend.counts.sent">{{ editSend.counts.sent }} כבר נשלחו ונעולות — הן לא ישתנו.</span>
    </div>
    <div v-if="conflict" ref="conflictNote" class="msg-note red" role="alert">
      ההודעה עודכנה בינתיים ממקום אחר (חלון או מכשיר נוסף).
      <button class="gs-btn gs-btn-sm" type="button" @click="$emit('reload')">לטעון את הגרסה העדכנית</button>
    </div>

    <nav class="msg-steps" aria-label="שלבים">
      <button v-for="(s, i) in steps" :key="s.key" type="button" class="msg-step" :class="{ on: step === s.key, done: !editSend && stepIndex > i }" :aria-current="step === s.key ? 'step' : undefined" @click="goStep(s.key)">
        {{ i + 1 }}. {{ s.label }}
      </button>
    </nav>

    <!-- 1. content -->
    <div v-show="step === 'content'" class="msg-composer">
      <section class="gs-card msg-card">
        <div class="msg-card-head">
          <div>
            <h2>{{ title || "הודעה חדשה" }}</h2>
            <p class="msg-sub">{{ categoryLabel }} · משתנים מתמלאים לכל אורח בזמן השליחה</p>
          </div>
          <span :class="'b ' + metaBadge.cls">{{ metaBadge.label }}</span>
        </div>
        <div v-if="!editSend" class="gs-field">
          <label class="gs-label" for="cmp-tpl">תבנית בסיס</label>
          <select id="cmp-tpl" v-model="templateKey" class="gs-select" @change="applyTemplate">
            <option v-for="t in baseTemplates" :key="t.key" :value="t.key">{{ t.title }} ({{ categoryName(t.category) }})</option>
          </select>
        </div>
        <div class="gs-field">
          <label class="gs-label" for="cmp-title">שם פנימי (לא נשלח לאורחים)</label>
          <input id="cmp-title" v-model="title" class="gs-input" maxlength="160" />
        </div>
        <div class="gs-field">
          <label class="gs-label" for="cmp-header">כותרת (אופציונלי, עד 60 תווים)</label>
          <input id="cmp-header" ref="header" v-model="content.header" class="gs-input" maxlength="60" @focus="focusField = 'header'" />
        </div>
        <div class="gs-field">
          <label class="gs-label" for="cmp-body">תוכן ההודעה ({{ content.body.length }} / 1024)</label>
          <textarea id="cmp-body" ref="body" v-model="content.body" class="gs-textarea" rows="8" maxlength="1024" @focus="focusField = 'body'"></textarea>
          <div class="msg-var-row" aria-label="הוספת משתנה">
            <button v-for="v in variables" :key="v.key" type="button" class="msg-var" @click="insertVar(v.key)">+ {{ v.label }}</button>
          </div>
        </div>
        <div class="msg-two">
          <div class="gs-field">
            <label class="gs-label" for="cmp-footer">שורת סיום</label>
            <input id="cmp-footer" v-model="content.footer" class="gs-input" maxlength="60" />
          </div>
          <div class="gs-field">
            <label class="gs-label" for="cmp-cat">קטגוריית Meta</label>
            <select id="cmp-cat" v-model="category" class="gs-select" :disabled="!isCustomized">
              <option value="marketing">Marketing (הזמנות, תזכורות)</option>
              <option value="utility">Utility (עדכון לוגיסטי)</option>
            </select>
          </div>
        </div>
        <div class="gs-field">
          <span class="gs-label">כפתורים (עד 3)</span>
          <div v-for="(b, i) in content.buttons" :key="i" class="msg-row" style="margin-bottom: 6px">
            <span class="b" :class="b.type === 'url' ? 'b-blue' : 'b-green'">{{ b.type === "url" ? "קישור" : "תשובה מהירה" }}</span>
            <input v-model="b.text" class="gs-input" maxlength="25" :aria-label="'טקסט כפתור ' + (i + 1)" style="flex: 1; width: auto" />
            <button class="gs-btn gs-btn-sm gs-btn-danger" type="button" :aria-label="'הסרת כפתור ' + (i + 1)" @click="content.buttons.splice(i, 1)">הסרה</button>
          </div>
          <button v-if="content.buttons.length < 3" class="gs-btn gs-btn-sm" type="button" @click="content.buttons.push({ type: 'quick_reply', text: 'הסרה מדיוור', payload: 'opt_out' })">+ כפתור הסרה</button>
        </div>
        <div v-if="isCustomized" class="msg-note violet">
          שיניתם את נוסח התבנית — Meta צריכה לאשר את הנוסח החדש (בדרך כלל דקות ספורות). ההודעה תמתין בתור ותצא אוטומטית אחרי האישור.
          שינוי ערכים של משתנים (שעה, מקום, שמות) לא דורש אישור.
        </div>
        <div v-if="editSend" class="msg-row" style="margin-top: 10px">
          <button class="gs-btn msg-btn-green" type="button" :disabled="busy" @click="saveEdit('content')">שמירת שינויים לתור הממתין</button>
        </div>
        <div v-else class="msg-row" style="margin-top: 10px">
          <button class="gs-btn gs-btn-gold" type="button" @click="goStep('audience')">המשך לבחירת נמענים ←</button>
        </div>
        <div class="msg-row" style="margin-top: 12px">
          <input v-model="testPhone" class="gs-input" type="tel" inputmode="tel" placeholder="050-0000000" aria-label="טלפון לשליחת בדיקה" style="max-width: 180px" />
          <button class="gs-btn gs-btn-sm" type="button" :disabled="busy || !testPhone" @click="testSend">שליחת בדיקה לעצמי ({{ testLeft }} נותרו)</button>
        </div>
      </section>
      <div>
        <MessagingPhonePreview :header="preview.header" :body="preview.body" :footer="preview.footer" :buttons="content.buttons" :guest-name="sampleGuest ? sampleGuest.full_name : ''" />
        <div class="gs-field" style="margin-top: 10px; max-width: 340px; margin-inline: auto">
          <label class="gs-label" for="cmp-sample">אורח לדוגמה בתצוגה</label>
          <select id="cmp-sample" v-model="sampleGuestId" class="gs-select">
            <option :value="0">אורח לדוגמה</option>
            <option v-for="g in sampleGuests" :key="g.id" :value="g.id">{{ g.full_name }}{{ g.table_label ? " (שולחן " + g.table_label + ")" : "" }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 2. audience -->
    <section v-if="step === 'audience'" class="gs-card msg-card">
      <h2>למי לשלוח?</h2>
      <p class="msg-sub">אורחים בלי טלפון או שביקשו להסיר לא יקבלו הודעות. אורח שנגמרה לו המכסה ידולג.</p>
      <MessagingAudiencePicker v-model="segment" :guests="audience.guests" :groups="audience.groups" :per-guest="audience.per_guest" @open-guest="$emit('open-guest', $event)" />
      <div class="msg-row" style="margin-top: 12px">
        <button v-if="editSend" class="gs-btn msg-btn-green" type="button" :disabled="busy" @click="saveEdit('audience')">שמירת קהל (רק לממתינים)</button>
        <template v-else>
          <button class="gs-btn" type="button" @click="goStep('content')">→ חזרה לתוכן</button>
          <button class="gs-btn gs-btn-gold" type="button" @click="goStep('schedule')">המשך לתזמון ←</button>
        </template>
      </div>
    </section>

    <!-- 3. schedule + confirm -->
    <section v-if="step === 'schedule'" class="gs-card msg-card">
      <h2>{{ editSend ? "שינוי מועד" : "תזמון ואישור" }}</h2>
      <p class="msg-sub">שעות שקט ושבת מוגנות אוטומטית (אפשר לכבות בהגדרות). כל עוד ההודעה לא יצאה — אפשר לשנות הכול מתור השליחה.</p>
      <div v-if="!editSend" class="msg-filters" role="radiogroup" aria-label="מתי לשלוח">
        <button type="button" class="msg-chip-btn" :class="{ on: when === 'later' }" role="radio" :aria-checked="when === 'later'" @click="when = 'later'">לתזמן</button>
        <button type="button" class="msg-chip-btn" :class="{ on: when === 'now' }" role="radio" :aria-checked="when === 'now'" @click="when = 'now'">לשלוח עכשיו</button>
      </div>
      <div v-if="when === 'later' || editSend" class="gs-field" style="margin-top: 10px; max-width: 280px">
        <label class="gs-label" for="cmp-when">מועד (שעון ישראל)</label>
        <MessagingDateTimeField id="cmp-when" v-model="scheduledAt" label="מועד שליחה" @change="refreshPreview" />
      </div>
      <label class="msg-toggle">
        <input v-model="overrideQuiet" type="checkbox" @change="refreshPreview" />
        <span>לעקוף שעות שקט / שבת להודעה הזו<small>לשימוש בעדכון דחוף בלבד</small></span>
      </label>

      <div v-if="serverPreview" class="msg-summary">
        <div><strong>{{ serverPreview.audience.will_send }}</strong><span>יקבלו</span></div>
        <div><strong>{{ serverPreview.audience.over_quota + serverPreview.audience.guest_cap }}</strong><span>ידולגו (מכסה)</span></div>
        <div><strong>{{ serverPreview.audience.no_phone + serverPreview.audience.opted_out }}</strong><span>בלי טלפון / הוסרו</span></div>
        <div><strong>₪{{ serverPreview.cost.ils }}</strong><span>עלות Meta משוערת</span></div>
      </div>
      <div v-if="conflicts.length && !overrideQuiet" class="msg-note gold">
        המועד נופל על {{ conflicts.map((c) => conflictLabel[c]).join(" + ") }}.
        ההודעה תצא במועד המותר הבא: <b>{{ fmtWhen(serverPreview && serverPreview.schedule.next_allowed) }}</b>.
      </div>
      <div v-if="serverPreview && Object.keys(serverPreview.missing_variables).length" class="msg-note red">
        חסרים פרטים למשתנים: {{ Object.keys(serverPreview.missing_variables).join(", ") }} — אפשר להשלים בלשונית "שאלון ופרטים".
      </div>
      <div v-if="serverPreview && serverPreview.needs_review && !editSend" class="msg-note violet">הנוסח ייבדק ע״י Meta לפני השליחה.</div>

      <div class="msg-row" style="margin-top: 12px">
        <template v-if="editSend">
          <button class="gs-btn msg-btn-green" type="button" :disabled="busy" @click="saveEdit('schedule')">שמירת מועד חדש</button>
        </template>
        <template v-else>
          <button class="gs-btn" type="button" @click="goStep('audience')">→ חזרה לנמענים</button>
          <button class="gs-btn msg-btn-green" type="button" :disabled="busy || !serverPreview || !serverPreview.audience.will_send" @click="create">
            {{ when === "now" ? "שליחה עכשיו" : "הוספה לתור השליחה" }}
          </button>
        </template>
      </div>
      <p v-if="error" class="gs-error" role="alert">{{ error }}</p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import MessagingPhonePreview from "./MessagingPhonePreview.vue";
import MessagingAudiencePicker from "./MessagingAudiencePicker.vue";
import MessagingDateTimeField from "./MessagingDateTimeField.vue";
import { messagingApi, SendDraft, SendPatch } from "@/helpers/messaging/api";
import { AudienceGuest, AudienceResponse, Category, MessageContent, MessagingSend, MessagingTemplate, Overview, PreviewResponse, Segment } from "@/helpers/messaging/types";
import { CATEGORY_LABEL, CONFLICT_LABEL, errData, errStatus, fmtWhen, META_STATUS, msgError, renderVars, toLocalInput, VARIABLES } from "@/helpers/messaging/labels";
import { notify } from "@/helpers/notify";

type StepKey = "content" | "audience" | "schedule";

function cloneContent(c: Partial<MessageContent>): MessageContent {
  return {
    header: c.header || "",
    body: c.body || "",
    footer: c.footer || "",
    buttons: (c.buttons || []).map((b) => ({ ...b })),
  };
}

export default defineComponent({
  name: "MessagingComposerPanel",
  components: { MessagingPhonePreview, MessagingAudiencePicker, MessagingDateTimeField },
  props: {
    eventId: { type: Number, required: true },
    templates: { type: Array as PropType<MessagingTemplate[]>, required: true },
    audience: { type: Object as PropType<AudienceResponse>, required: true },
    overview: { type: Object as PropType<Overview>, required: true },
    initialTemplateKey: { type: String, default: "rsvp_invite" },
    initialStep: { type: String as PropType<StepKey>, default: "content" },
    editSend: { type: Object as PropType<MessagingSend | null>, default: null },
  },
  emits: ["done", "reload", "open-guest"],
  data() {
    const src = this.editSend;
    const tpl = this.templates.find((t) => t.key === (src?.template_key || this.initialTemplateKey));
    return {
      step: (this.initialStep || "content") as StepKey,
      templateKey: src?.template_key || this.initialTemplateKey,
      title: src?.title || tpl?.title || "",
      category: (src?.category || tpl?.category || "marketing") as Category,
      content: cloneContent(src || tpl || {}),
      segment: (src?.segment && Object.keys(src.segment).length ? { ...src.segment } : { statuses: [0, 3] }) as Segment,
      when: "later" as "later" | "now",
      scheduledAt: toLocalInput(src?.scheduled_at),
      overrideQuiet: src?.override_quiet || false,
      serverPreview: null as PreviewResponse | null,
      sampleGuestId: 0,
      testPhone: "",
      busy: false,
      error: "",
      conflict: false,
      focusField: "body" as "body" | "header",
      variables: VARIABLES,
      conflictLabel: CONFLICT_LABEL,
      testUsed: this.overview.settings.test_sends_used,
    };
  },
  computed: {
    steps(): { key: StepKey; label: string }[] {
      return [
        { key: "content", label: "תוכן ותצוגה" },
        { key: "audience", label: "נמענים" },
        { key: "schedule", label: this.editSend ? "מועד" : "תזמון ואישור" },
      ];
    },
    stepIndex(): number {
      return this.steps.findIndex((s) => s.key === this.step);
    },
    baseTemplates(): MessagingTemplate[] {
      return this.templates.filter((t) => t.is_system);
    },
    baseTemplate(): MessagingTemplate | undefined {
      return this.templates.find((t) => t.key === this.templateKey && t.is_system);
    },
    isCustomized(): boolean {
      const b = this.baseTemplate;
      if (!b || b.custom_only) return true;
      const norm = (c: Partial<MessageContent>) =>
        JSON.stringify([(c.header || "").trim(), (c.body || "").trim(), (c.footer || "").trim(), (c.buttons || []).map((x) => [x.type, x.text.trim()])]);
      return norm(b) !== norm(this.content);
    },
    metaBadge(): { label: string; cls: string } {
      if (this.editSend?.template_status && !this.isCustomized) return META_STATUS[this.editSend.template_status] || META_STATUS.draft;
      return this.isCustomized ? META_STATUS.needs_review : META_STATUS.approved;
    },
    categoryLabel(): string {
      return CATEGORY_LABEL[this.category] || this.category;
    },
    sampleGuests(): AudienceGuest[] {
      return this.audience.guests.filter((g) => g.has_phone).slice(0, 80);
    },
    sampleGuest(): AudienceGuest | undefined {
      return this.audience.guests.find((g) => g.id === this.sampleGuestId);
    },
    vars(): Record<string, string> {
      const v: Record<string, string> = { ...this.overview.event.vars };
      const g = this.sampleGuest;
      v.first_name = g ? g.full_name.split(/\s+/)[0] : "נועה";
      v.full_name = g ? g.full_name : "נועה כהן";
      v.party_size = String(g ? g.party_size : 2);
      v.table_label = g ? g.table_label || "—" : "7";
      v.rsvp_link = v.rsvp_link || "https://snapshare-live.com/rsvp/…";
      v.table_link = v.table_link || "https://snapshare-live.com/t/…";
      return v;
    },
    preview(): { header: string; body: string; footer: string } {
      return {
        header: renderVars(this.content.header, this.vars),
        body: renderVars(this.content.body, this.vars),
        footer: renderVars(this.content.footer, this.vars),
      };
    },
    conflicts(): string[] {
      return this.serverPreview?.schedule.conflicts || [];
    },
    testLeft(): number {
      return Math.max(0, this.overview.settings.test_sends_limit - this.testUsed);
    },
  },
  watch: {
    segment: {
      deep: true,
      handler() {
        if (this.step === "schedule") this.refreshPreview();
      },
    },
  },
  methods: {
    fmtWhen,
    categoryName(c: string): string {
      return CATEGORY_LABEL[c] || c;
    },
    applyTemplate() {
      const t = this.baseTemplate;
      if (!t) return;
      this.title = t.title;
      this.category = t.category;
      this.content = cloneContent(t);
      const seg: Record<string, Segment> = {
        rsvp_invite: { statuses: [0] },
        rsvp_nudge: { statuses: [0, 3] },
        reminder_pre_event: { statuses: [1] },
        table_assignment: { statuses: [1], has_table: true },
        live_album_cta: { statuses: [1] },
        thank_you_gallery: { statuses: [1] },
        schedule_change: { statuses: [1, 3] },
        save_the_date: { statuses: [0, 1, 3] },
      };
      this.segment = seg[t.key] || { statuses: [0, 3] };
    },
    insertVar(key: string) {
      const field = this.focusField;
      const el = this.$refs[field] as HTMLInputElement | HTMLTextAreaElement | undefined;
      const token = `{{${key}}}`;
      const cur = (field === "header" ? this.content.header : this.content.body) || "";
      const pos = el && typeof el.selectionStart === "number" ? el.selectionStart : cur.length;
      const next = cur.slice(0, pos) + token + cur.slice(pos);
      if (field === "header") this.content.header = next.slice(0, 60);
      else this.content.body = next.slice(0, 1024);
      this.$nextTick(() => {
        el?.focus();
        el?.setSelectionRange?.(pos + token.length, pos + token.length);
      });
    },
    goStep(s: StepKey) {
      this.step = s;
      this.error = "";
      this.$nextTick(() => {
        const top = (this.$el as HTMLElement).getBoundingClientRect().top;
        if (top < 0) window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
      });
      if (s === "schedule") this.refreshPreview();
    },
    payloadContent(): Partial<MessageContent> & { category: string } {
      return {
        header: this.content.header || null,
        body: this.content.body,
        footer: this.content.footer || null,
        buttons: this.content.buttons.filter((b) => b.text.trim()),
        category: this.category,
      };
    },
    whenValue(): string | null {
      return this.when === "now" && !this.editSend ? null : this.scheduledAt;
    },
    async refreshPreview() {
      try {
        this.serverPreview = await messagingApi.preview(this.eventId, {
          template_key: this.templateKey,
          ...this.payloadContent(),
          segment: this.segment,
          scheduled_at: this.whenValue(),
          send_id: this.editSend?.id,
        });
        if (this.overrideQuiet && this.serverPreview) this.serverPreview.schedule.conflicts = [];
      } catch (e) {
        this.error = msgError(e, "לא הצלחנו לחשב תצוגה מקדימה");
      }
    },
    async create() {
      this.busy = true;
      this.error = "";
      const draft: SendDraft = {
        template_key: this.templateKey,
        title: this.title,
        ...this.payloadContent(),
        segment: this.segment,
        override_quiet: this.overrideQuiet,
      };
      if (this.when === "now") draft.send_now = true;
      else draft.scheduled_at = this.scheduledAt;
      try {
        const send = await messagingApi.create(this.eventId, draft);
        notify({ type: "success", text: this.when === "now" ? "ההודעה נשלחה" : "ההודעה נוספה לתור השליחה" });
        this.$emit("done", send);
      } catch (e) {
        const d = errData<{ conflicts?: string[] }>(e);
        this.error = d?.conflicts ? "עכשיו שעות שקט / שבת. סמנו עקיפה כדי לשלוח בכל זאת, או תזמנו." : msgError(e, "השמירה נכשלה");
      } finally {
        this.busy = false;
      }
    },
    async saveEdit(part: StepKey) {
      if (!this.editSend) return;
      this.busy = true;
      this.error = "";
      this.conflict = false;
      const patch: SendPatch = { expected_version: this.editSend.version };
      if (part === "content") Object.assign(patch, this.payloadContent(), { title: this.title });
      if (part === "audience") patch.segment = this.segment;
      if (part === "schedule") {
        patch.scheduled_at = this.scheduledAt;
        patch.override_quiet = this.overrideQuiet;
      }
      try {
        const send = await messagingApi.patch(this.eventId, this.editSend.id, patch);
        const txt = `נשמר · ${send.pending_updated ?? 0} ממתינים עודכנו` + (send.locked_unchanged ? ` · ${send.locked_unchanged} שכבר נשלחו לא השתנו` : "");
        notify({ type: "success", text: txt });
        this.$emit("done", send);
      } catch (e) {
        if (errStatus(e) === 409) {
          this.conflict = true;
          this.$nextTick(() => (this.$refs.conflictNote as HTMLElement | undefined)?.scrollIntoView({ block: "center", behavior: "smooth" }));
        } else this.error = msgError(e, "השמירה נכשלה");
        if (part !== "schedule") notify({ type: "error", text: this.conflict ? "ההודעה עודכנה ממקום אחר" : this.error });
      } finally {
        this.busy = false;
      }
    },
    async testSend() {
      this.busy = true;
      try {
        const r = await messagingApi.testSend(this.eventId, { phone: this.testPhone, template_key: this.templateKey, ...this.payloadContent() });
        this.testUsed = r.used;
        notify({ type: "success", text: r.provider === "mock" ? "נשלח לספק הבדיקה (מצב מקומי, לא נשלחה הודעה אמיתית)" : "הודעת בדיקה נשלחה" });
      } catch (e) {
        notify({ type: "error", text: msgError(e, "שליחת הבדיקה נכשלה") });
      } finally {
        this.busy = false;
      }
    },
  },
});
</script>
