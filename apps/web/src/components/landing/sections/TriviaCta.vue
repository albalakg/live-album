<template>
  <section :id="'sec-' + sectionId" :class="['block', 'trivia-card', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">טריוויה</p>
      <h2 class="sec-title">{{ data.title }}</h2>
      <p class="body">{{ data.body }}</p>
      <button v-if="canTrivia" type="button" class="btn btn-primary" @click="onTrivia">הצטרפו למשחק</button>
      <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "TriviaCta",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    const canTrivia = computed(() => preview.value || Boolean(ctx?.eventMeta?.trivia_url));
    function onTrivia() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openTrivia(String(props.data.title || "טריוויה"));
    }
    return { preview, canTrivia, onTrivia };
  },
});
</script>
