<template>
  <section :id="'sec-' + sectionId" :class="['block', 'block-cta', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">SnapShare</p>
      <h2 class="sec-title">{{ data.button_text }}</h2>
      <div class="cta-row">
        <button type="button" class="btn btn-primary" @click="onUpload">{{ data.button_text }}</button>
        <button type="button" class="btn btn-ghost" @click="onAlbum">{{ data.album_text || 'צפו באלבום' }}</button>
      </div>
      <p class="cta-note">{{ data.subtitle || 'בלי אפליקציה' }}<span v-if="preview" class="preview-note">בתצוגה מקדימה</span></p>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "SnapshareCta",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function onUpload() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openUpload();
    }
    function onAlbum() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openAlbum();
    }
    return { preview, onUpload, onAlbum };
  },
});
</script>
