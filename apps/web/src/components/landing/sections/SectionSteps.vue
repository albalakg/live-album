<template>
  <section :id="'sec-' + sectionId" :class="['block', 'steps-sec', alt && 'alt']">
    <div class="wrap wide">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <ol class="steps">
        <li v-for="(s, i) in (data.steps || [])" :key="i">
          <span class="sn">{{ s.n }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.body }}</p>
        </li>
      </ol>
      <div class="cta-row" style="margin-top:36px">
        <button v-if="canUpload" type="button" class="btn btn-primary" @click="onUpload">
          {{ data.button_text || 'העלו תמונות' }}
        </button>
        <button v-if="canAlbum" type="button" class="btn btn-ghost" @click="onAlbum">
          {{ data.album_text || 'צפו באלבום החי' }}
        </button>
      </div>
      <p class="cta-note">בלי אפליקציה, ישר מהטלפון.<span v-if="preview" class="preview-note">בתצוגה מקדימה</span></p>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";

export default defineComponent({
  name: "LandingSteps",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    const canUpload = computed(() => preview.value || Boolean(ctx?.eventMeta?.upload_url));
    const canAlbum = computed(() => preview.value || Boolean(ctx?.eventMeta?.album_url));
    function onUpload() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openUpload();
    }
    function onAlbum() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openAlbum();
    }
    return { preview, canUpload, canAlbum, onUpload, onAlbum };
  },
});
</script>
