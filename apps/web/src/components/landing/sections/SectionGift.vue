<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p class="body" style="margin-bottom:22px">{{ data.body }}</p>
      <button v-if="showGift" type="button" class="btn btn-ghost" @click="onGift">{{ data.button || 'לקישור' }}</button>
      <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "LandingGift",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    const showGift = computed(() => preview.value || Boolean(props.data.url));
    function onGift() {
      if (preview.value || !props.data.url) {
        ctx?.toast("קישור לדוגמה בלבד.");
        return;
      }
      window.open(String(props.data.url), "_blank", "noopener");
    }
    return { preview, showGift, onGift };
  },
});
</script>
