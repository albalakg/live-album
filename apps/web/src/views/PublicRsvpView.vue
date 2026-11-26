<template>
  <main class="rsvp-page" dir="rtl">
    <div class="rsvp-card">
      <p v-if="loading" class="rsvp-muted">טוען…</p>
      <template v-else-if="error && !data">
        <h1>הקישור לא נמצא</h1>
        <p class="rsvp-muted">{{ error }}</p>
      </template>
      <template v-else-if="data">
        <p class="rsvp-kicker">אישור הגעה</p>
        <h1>{{ data.event.couple_names || data.event.title }}</h1>
        <p class="rsvp-when">
          <span v-if="data.event.date">יום {{ data.event.day }}, {{ data.event.date }}</span>
          <span v-if="data.event.time"> · {{ data.event.time }}</span>
        </p>
        <p v-if="data.event.venue_name" class="rsvp-muted">
          {{ data.event.venue_name }}<span v-if="data.event.venue_address">, {{ data.event.venue_address }}</span>
          <a v-if="data.event.waze_link" :href="data.event.waze_link" target="_blank" rel="noopener" class="rsvp-link">ניווט ב-Waze</a>
        </p>

        <div v-if="done" class="rsvp-done" role="status">
          <h2>{{ doneTitle }}</h2>
          <p>אפשר לחזור לקישור הזה ולעדכן בכל רגע.</p>
          <button class="rsvp-btn rsvp-btn-ghost" type="button" @click="done = false">עדכון התשובה</button>
        </div>

        <form v-else class="prsvp-form" @submit.prevent="submit">
          <p class="rsvp-hello">היי {{ data.guest.first_name }}, נשמח לדעת אם תגיעו</p>
          <div class="rsvp-choice" role="radiogroup" aria-label="הגעה">
            <button v-for="o in options" :key="o.value" type="button" role="radio" :aria-checked="status === o.value" :class="['rsvp-opt', { on: status === o.value }]" @click="status = o.value">{{ o.label }}</button>
          </div>
          <template v-if="status === 'yes'">
            <label v-if="data.config.ask_party_size" class="rsvp-field">
              <span>כמה תגיעו (כולל אתכם)?</span>
              <input v-model.number="partySize" type="number" min="1" :max="data.config.max_party_size" required />
            </label>
            <label v-if="data.config.ask_meal && data.config.meals.length" class="rsvp-field">
              <span>מנה</span>
              <select v-model="meal">
                <option value="">בחרו מנה</option>
                <option v-for="m in data.config.meals" :key="m" :value="m">{{ m }}</option>
              </select>
            </label>
            <label v-if="data.config.ask_allergies" class="rsvp-field">
              <span>אלרגיות / רגישויות</span>
              <input v-model="allergies" type="text" maxlength="200" placeholder="אין" />
            </label>
            <label v-if="data.config.ask_shuttle" class="rsvp-check"><input v-model="shuttle" type="checkbox" /> נשמח להסעה</label>
          </template>
          <label class="rsvp-field">
            <span>הערה לזוג (אופציונלי)</span>
            <input v-model="note" type="text" maxlength="500" />
          </label>
          <p v-if="error" class="rsvp-error" role="alert">{{ error }}</p>
          <button class="rsvp-btn" type="submit" :disabled="!status || busy">שליחת אישור</button>
        </form>
        <a v-if="data.event.hub_link" :href="data.event.hub_link" class="rsvp-link">לדף האירוע</a>
      </template>
    </div>
    <p class="rsvp-foot">SnapShare</p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PublicRsvp, publicRsvpApi } from "@/helpers/messaging/api";
import { msgError } from "@/helpers/messaging/labels";

export default defineComponent({
  name: "PublicRsvpView",
  data() {
    return {
      data: null as PublicRsvp | null,
      loading: true,
      error: "",
      busy: false,
      done: false,
      status: "" as "" | "yes" | "no" | "maybe",
      partySize: 1,
      meal: "",
      allergies: "",
      shuttle: false,
      note: "",
      options: [
        { value: "yes", label: "מגיע/ה ✅" },
        { value: "maybe", label: "אולי 🤔" },
        { value: "no", label: "לא אוכל להגיע" },
      ] as { value: "yes" | "no" | "maybe"; label: string }[],
    };
  },
  computed: {
    token(): string {
      return String(this.$route.params.token || "");
    },
    doneTitle(): string {
      return this.status === "yes" ? "תודה! שמרנו לכם מקום 💛" : this.status === "no" ? "תודה שעדכנתם, נתגעגע 💛" : "תודה, נחזור אליכם בהמשך";
    },
  },
  async mounted() {
    try {
      this.apply(await publicRsvpApi.show(this.token));
    } catch (e) {
      this.error = msgError(e, "הקישור לא תקין או שפג תוקפו.");
    } finally {
      this.loading = false;
    }
  },
  methods: {
    apply(d: PublicRsvp) {
      this.data = d;
      this.partySize = d.guest.party_size || 1;
      this.meal = d.guest.answers?.meal || "";
      this.allergies = d.guest.answers?.allergies || "";
      this.note = d.guest.answers?.note || "";
      const map: Record<number, "yes" | "no" | "maybe"> = { 1: "yes", 2: "no", 3: "maybe" };
      this.status = map[d.guest.status] || "";
    },
    async submit() {
      if (!this.status) return;
      this.busy = true;
      this.error = "";
      try {
        const payload = { status: this.status, note: this.note || null } as Record<string, unknown>;
        if (this.status === "yes") Object.assign(payload, { party_size: this.partySize, meal: this.meal || null, allergies: this.allergies || null, shuttle: this.shuttle });
        this.apply(await publicRsvpApi.submit(this.token, payload as never));
        this.done = true;
      } catch (e) {
        this.error = msgError(e, "השליחה נכשלה, נסו שוב");
      } finally {
        this.busy = false;
      }
    },
  },
});
</script>

<style scoped lang="scss">
.rsvp-page {
  min-height: 100dvh;
  background: #f3eee6;
  color: #161310;
  font-family: Heebo, "Segoe UI", Tahoma, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
}
.rsvp-card {
  width: min(480px, 100%);
  background: #fffcfa;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(18, 16, 14, 0.12);
  padding: 26px 22px;
  text-align: center;
}
h1 { margin: 4px 0 6px; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
h2 { margin: 0 0 6px; font-size: 20px; }
.rsvp-kicker { margin: 0; color: #6e5228; font-weight: 800; font-size: 13px; letter-spacing: 0.04em; }
.rsvp-when { margin: 0 0 4px; font-weight: 700; }
.rsvp-muted { color: #5e564e; margin: 0 0 14px; font-size: 14px; }
.rsvp-hello { font-weight: 700; margin: 16px 0 10px; }
.prsvp-form { text-align: start; }
.rsvp-choice { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
.rsvp-opt { height: 48px; border-radius: 14px; border: 1px solid rgba(22, 19, 16, 0.18); background: #fffcfa; color: #161310; font: inherit; font-weight: 800; font-size: 14px; cursor: pointer; }
.rsvp-opt.on { background: #12100e; border-color: #12100e; color: #f3eee6; }
.rsvp-opt:focus-visible, .rsvp-btn:focus-visible { outline: 2px solid #c9a36a; outline-offset: 2px; }
.rsvp-field { display: block; margin-bottom: 12px; font-size: 13px; font-weight: 700; color: #5e564e; }
.rsvp-field span { display: block; margin-bottom: 6px; }
.rsvp-field input, .rsvp-field select { width: 100%; height: 44px; border-radius: 12px; border: 1px solid rgba(22, 19, 16, 0.18); background: #fffcfa; color: #161310; font: inherit; font-size: 15px; padding: 0 12px; box-sizing: border-box; }
.rsvp-check { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; font-size: 14px; }
.rsvp-btn { width: 100%; height: 50px; border-radius: 999px; border: 0; background: #0f5a35; color: #f3eee6; font: inherit; font-weight: 800; font-size: 16px; cursor: pointer; margin-top: 4px; }
.rsvp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.rsvp-btn-ghost { background: #fffcfa; color: #161310; border: 1px solid rgba(22, 19, 16, 0.18); width: auto; padding: 0 22px; height: 42px; }
.rsvp-done { background: #dff1e5; color: #11432a; border-radius: 16px; padding: 18px; margin: 16px 0; }
.rsvp-error { color: #8a1c28; font-weight: 700; font-size: 13px; }
.rsvp-link { display: inline-block; margin-top: 12px; color: #6e5228; font-weight: 800; margin-inline-start: 8px; }
.rsvp-foot { margin-top: 16px; color: #5e564e; font-size: 12px; }
</style>
