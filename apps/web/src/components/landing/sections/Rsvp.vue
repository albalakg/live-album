<template>
  <section :id="'sec-' + sectionId" :class="['block', 'rsvp-sec', alt && 'alt']">
    <div class="wrap narrow">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p class="body" style="margin-bottom:22px">{{ data.body }}</p>
      <form class="rsvp-form" @submit.prevent="onSubmit">
        <input v-model="name" type="text" maxlength="40" placeholder="השם שלכם" required :disabled="preview" />
        <div class="rsvp-opts" role="radiogroup" aria-label="הגעה">
          <label><input v-model="coming" type="radio" value="yes" required :disabled="preview" /> מגיעים</label>
          <label><input v-model="coming" type="radio" value="no" :disabled="preview" /> לא יוכלו</label>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="preview">שלחו אישור</button>
        <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
      </form>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref } from "vue";
import { LANDING_CTX } from "../landingContext";

export default defineComponent({
  name: "LandingRsvp",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    const name = ref("");
    const coming = ref("yes");
    function onSubmit() {
      if (preview.value) {
        ctx?.toast("בתצוגה מקדימה");
        return;
      }
      ctx?.toast("אישור הגעה נשמר מקומית (תצוגה)");
      name.value = "";
    }
    return { preview, name, coming, onSubmit };
  },
});
</script>
