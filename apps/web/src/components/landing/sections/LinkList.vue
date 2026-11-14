<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">קישורים</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <ul class="links">
        <li v-for="(l, i) in (data.links || [])" :key="i">
          <a href="#" @click.prevent="onLink(l)">{{ l.label }}<span class="ic">←</span></a>
        </li>
      </ul>
      <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "LinkList",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function onLink(l: { url?: string; demo?: boolean }) {
      if (preview.value || l.demo || !l.url) return ctx?.toast("קישור לדוגמה בלבד.");
      window.open(String(l.url), "_blank", "noopener");
    }
    return { preview, onLink };
  },
});
</script>
