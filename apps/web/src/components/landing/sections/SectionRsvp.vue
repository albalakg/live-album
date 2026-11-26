<template>
  <section :id="'sec-' + sectionId" :class="['block', 'rsvp-sec', alt && 'alt']">
    <div class="wrap narrow">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p class="body" style="margin-bottom:22px">{{ data.body }}</p>
      <div v-if="done" class="rsvp-done" role="status">
        <p>{{ coming === "yes" ? "תודה! האישור נשמר 💛" : "תודה שעדכנתם 💛" }}</p>
        <button type="button" class="btn btn-ghost" @click="done = false">עדכון התשובה</button>
      </div>
      <form v-else class="rsvp-form" @submit.prevent="onSubmit">
        <template v-if="!token">
          <input v-model="name" type="text" maxlength="60" placeholder="השם שלכם" aria-label="השם שלכם" required :disabled="preview" />
          <input v-model="phone" type="tel" inputmode="tel" maxlength="20" placeholder="טלפון נייד" aria-label="טלפון נייד" dir="ltr" :required="remote" :disabled="preview" />
        </template>
        <div class="rsvp-opts" role="radiogroup" aria-label="הגעה">
          <label><input v-model="coming" type="radio" value="yes" required :disabled="preview" /> מגיעים</label>
          <label><input v-model="coming" type="radio" value="no" :disabled="preview" /> לא יוכלו</label>
        </div>
        <div v-if="coming === 'yes' && config && (config.ask_party_size || (config.ask_meal && config.meals.length))" class="rsvp-row">
          <select v-if="config.ask_party_size" v-model.number="partySize" aria-label="כמה תגיעו (כולל אתכם)" :disabled="preview">
            <option v-for="n in Math.max(1, config.max_party_size)" :key="n" :value="n">{{ n === 1 ? "מגיע/ה לבד" : n + " אורחים" }}</option>
          </select>
          <select v-if="config.ask_meal && config.meals.length" v-model="meal" aria-label="מנה" :disabled="preview">
            <option value="">מנה (אופציונלי)</option>
            <option v-for="m in config.meals" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <p v-if="error" class="rsvp-err" role="alert">{{ error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="preview || busy">שלחו אישור</button>
        <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
      </form>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { LANDING_CTX } from "../landingContext";
import { PublicRsvp, publicRsvpApi } from "@/helpers/messaging/api";
import { msgError } from "@/helpers/messaging/labels";

export default defineComponent({
  name: "LandingRsvp",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const route = useRoute();
    const preview = computed(() => ctx?.preview === true);
    const slug = computed(() => (route?.name === "eventHubPublic" ? String(route.params.slug || "") : ""));
    /** Personal link from a WhatsApp message: /h/:slug?g=<rsvp token> */
    const token = computed(() => (slug.value && typeof route.query.g === "string" ? route.query.g : ""));
    const name = ref("");
    const phone = ref("");
    const coming = ref("yes");
    const partySize = ref(1);
    const meal = ref("");
    const config = ref<PublicRsvp["config"] | null>(null);
    /** Hub has guest messaging on: answers go to the guest list (D8). */
    const remote = ref(false);
    const busy = ref(false);
    const done = ref(false);
    const error = ref("");

    onMounted(async () => {
      if (preview.value || !slug.value) return;
      try {
        if (token.value) {
          const d = await publicRsvpApi.show(token.value);
          config.value = d.config;
          partySize.value = d.guest.party_size || 1;
          meal.value = d.guest.answers?.meal || "";
        } else {
          config.value = await publicRsvpApi.hubConfig(slug.value);
        }
        remote.value = true;
      } catch {
        remote.value = false;
      }
    });

    async function onSubmit() {
      if (preview.value) {
        ctx?.toast("בתצוגה מקדימה");
        return;
      }
      if (!remote.value) {
        ctx?.toast("אישור הגעה נשמר מקומית (תצוגה)");
        name.value = "";
        return;
      }
      busy.value = true;
      error.value = "";
      const answers = {
        status: coming.value === "yes" ? ("yes" as const) : ("no" as const),
        ...(coming.value === "yes" && config.value?.ask_party_size ? { party_size: partySize.value || 1 } : {}),
        ...(coming.value === "yes" && meal.value ? { meal: meal.value } : {}),
      };
      try {
        if (token.value) await publicRsvpApi.submit(token.value, answers);
        else await publicRsvpApi.hubSubmit(slug.value, { ...answers, full_name: name.value, phone: phone.value });
        done.value = true;
      } catch (e) {
        error.value = msgError(e, "השליחה נכשלה, נסו שוב");
      } finally {
        busy.value = false;
      }
    }
    return { preview, token, name, phone, coming, partySize, meal, config, remote, busy, done, error, onSubmit };
  },
});
</script>
