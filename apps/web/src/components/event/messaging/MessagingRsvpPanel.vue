<template>
  <div class="msg-composer">
    <div class="msg-grid">
      <section class="gs-card msg-card">
        <h2>שאלון אישור הגעה (בוט WhatsApp + קישור אישי)</h2>
        <p class="msg-sub">אחרי לחיצה על "מגיע/ה" הבוט שואל את השאלות האלה בחינם (חלון 24 שעות). אותו שאלון מופיע בקישור האישי ובדף האירוע.</p>
        <label class="msg-toggle"><input v-model="cfg.ask_party_size" type="checkbox" /><span>כמה מגיעים</span></label>
        <div v-if="cfg.ask_party_size" class="gs-field" style="max-width: 200px; margin-top: 8px">
          <label class="gs-label" for="rs-max">מקסימום לאורח</label>
          <input id="rs-max" v-model.number="cfg.max_party_size" class="gs-input" type="number" min="1" max="30" />
        </div>
        <label class="msg-toggle"><input v-model="cfg.ask_meal" type="checkbox" /><span>בחירת מנה</span></label>
        <div v-if="cfg.ask_meal" class="gs-field" style="margin-top: 8px">
          <label class="gs-label" for="rs-meals">אפשרויות מנה (שורה לכל מנה, עד 8)</label>
          <textarea id="rs-meals" v-model="mealsText" class="gs-textarea" rows="4"></textarea>
        </div>
        <label class="msg-toggle"><input v-model="cfg.ask_allergies" type="checkbox" /><span>אלרגיות / רגישויות</span></label>
        <label class="msg-toggle"><input v-model="cfg.ask_shuttle" type="checkbox" /><span>הסעה (בקישור האישי)</span></label>
        <div class="gs-field" style="margin-top: 10px">
          <label class="gs-label" for="rs-yes">הודעת תודה למגיעים</label>
          <input id="rs-yes" v-model="cfg.thank_you_yes" class="gs-input" maxlength="300" />
        </div>
        <div class="msg-two">
          <div class="gs-field">
            <label class="gs-label" for="rs-no">תודה למי שלא מגיע</label>
            <input id="rs-no" v-model="cfg.thank_you_no" class="gs-input" maxlength="300" />
          </div>
          <div class="gs-field">
            <label class="gs-label" for="rs-maybe">תודה ל"אולי"</label>
            <input id="rs-maybe" v-model="cfg.thank_you_maybe" class="gs-input" maxlength="300" />
          </div>
        </div>
      </section>

      <section class="gs-card msg-card">
        <h2>פרטי האירוע בהודעות</h2>
        <p class="msg-sub">ריק = נלקח אוטומטית מפרטי האירוע ומ-Save the Date. שינוי כאן לא דורש אישור Meta.</p>
        <div class="msg-two">
          <div v-for="f in varFields" :key="f.key" class="gs-field">
            <label class="gs-label" :for="'v-' + f.key">{{ f.label }}</label>
            <input :id="'v-' + f.key" v-model="vars[f.key]" class="gs-input" :placeholder="auto[f.key] || ''" :type="f.key.endsWith('_link') ? 'url' : 'text'" />
          </div>
        </div>
      </section>

      <section class="gs-card msg-card">
        <h2>הגנות ושליחה</h2>
        <label class="msg-toggle"><input v-model="guards.quiet_hours_enabled" type="checkbox" /><span>שעות שקט 21:30–08:30<small>הודעה מתוזמנת לשעות האלה תצא ב-08:30</small></span></label>
        <label class="msg-toggle"><input v-model="guards.shabbat_guard_enabled" type="checkbox" /><span>שמירת שבת (שישי 15:00 – מוצ״ש 20:30)<small>הודעות יידחו לצאת השבת</small></span></label>
        <label class="msg-toggle"><input v-model="guards.sms_fallback_enabled" type="checkbox" /><span>SMS לאורחים בלי וואטסאפ<small>נשלח SMS קצר עם קישור אישי לאישור הגעה (נספר כהודעה)<template v-if="settings.sms_available === false"> · יתחיל לפעול כשיחובר ספק SMS</template></small></span></label>
      </section>

      <div class="msg-row">
        <button class="gs-btn msg-btn-green" type="button" :disabled="busy" @click="save">שמירת השאלון וההגדרות</button>
        <span v-if="saved" class="b b-green" role="status">נשמר</span>
      </div>
    </div>

    <MessagingPhonePreview :header="''" :body="botIntro" :buttons="[]" guest-name="נועה">
      <div class="msg-chat-row"><div class="msg-bubble out">מגיע/ה ✅</div></div>
      <div v-if="cfg.ask_party_size" class="msg-chat-row"><div class="msg-bubble in">מעולה! 🎉 כמה תגיעו בסך הכול? (השיבו במספר, למשל 2)</div></div>
      <div v-if="cfg.ask_party_size" class="msg-chat-row"><div class="msg-bubble out">2</div></div>
      <div v-if="cfg.ask_meal && meals.length" class="msg-chat-row"><div class="msg-bubble in">איזו מנה תעדיפו?<br /><span v-for="(m, i) in meals" :key="m">{{ i + 1 }}. {{ m }}<br /></span>(השיבו במספר)</div></div>
      <div v-if="cfg.ask_meal && meals.length" class="msg-chat-row"><div class="msg-bubble out">2</div></div>
      <div v-if="cfg.ask_allergies" class="msg-chat-row"><div class="msg-bubble in">יש אלרגיות או רגישויות שכדאי שנדע? (אם לא, השיבו "אין")</div></div>
      <div v-if="cfg.ask_allergies" class="msg-chat-row"><div class="msg-bubble out">אין</div></div>
      <div class="msg-chat-row"><div class="msg-bubble in">{{ cfg.thank_you_yes }}</div></div>
    </MessagingPhonePreview>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import MessagingPhonePreview from "./MessagingPhonePreview.vue";
import { messagingApi } from "@/helpers/messaging/api";
import { MessagingSettings, RsvpConfig } from "@/helpers/messaging/types";
import { msgError } from "@/helpers/messaging/labels";
import { notify } from "@/helpers/notify";

export default defineComponent({
  name: "MessagingRsvpPanel",
  components: { MessagingPhonePreview },
  props: {
    eventId: { type: Number, required: true },
    settings: { type: Object as PropType<MessagingSettings>, required: true },
    auto: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  },
  emits: ["saved"],
  data() {
    const s = this.settings;
    return {
      cfg: { ...s.rsvp_config } as RsvpConfig,
      mealsText: (s.rsvp_config.meals || []).join("\n"),
      vars: { ...(s.variables || {}) } as Record<string, string>,
      guards: { quiet_hours_enabled: s.quiet_hours_enabled, shabbat_guard_enabled: s.shabbat_guard_enabled, sms_fallback_enabled: s.sms_fallback_enabled },
      busy: false,
      saved: false,
      varFields: [
        { key: "couple_names", label: "שמות הזוג / בעלי השמחה" },
        { key: "event_title", label: "שם האירוע" },
        { key: "event_time", label: "שעת קבלת פנים" },
        { key: "venue_name", label: "שם המקום" },
        { key: "venue_address", label: "כתובת" },
        { key: "waze_link", label: "קישור Waze" },
        { key: "gift_link", label: "קישור למתנה (Bit / PayBox)" },
      ],
    };
  },
  computed: {
    meals(): string[] {
      return this.mealsText.split("\n").map((m) => m.trim()).filter(Boolean).slice(0, 8);
    },
    botIntro(): string {
      return "היי נועה! מתרגשים להזמין אותך… נודה לאישור הגעה קצר בלחיצה:";
    },
  },
  methods: {
    async save() {
      this.busy = true;
      this.saved = false;
      try {
        const s = await messagingApi.saveSettings(this.eventId, {
          ...this.guards,
          variables: this.vars,
          rsvp_config: { ...this.cfg, meals: this.meals },
        });
        this.saved = true;
        this.$emit("saved", s);
      } catch (e) {
        notify({ type: "error", text: msgError(e, "השמירה נכשלה") });
      } finally {
        this.busy = false;
      }
    },
  },
});
</script>
