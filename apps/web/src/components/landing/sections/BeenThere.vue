<template>
  <section :id="'sec-' + sectionId" :class="['block', 'been-card', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">חיבור</p>
      <h2 class="sec-title">{{ data.heading }}</h2>
      <p class="body">{{ data.body }}</p>
      <button type="button" class="btn btn-ghost" @click="onAlbum">לאלבום החי</button>
      <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "BeenThere",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function onAlbum() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openAlbum();
    }
    return { preview, onAlbum };
  },
});
</script>
