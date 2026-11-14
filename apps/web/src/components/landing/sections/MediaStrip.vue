<template>
  <section :id="'sec-' + sectionId" :class="['block', 'wide', alt && 'alt']">
    <div class="wrap">
      <div class="media-head">
        <div>
          <p class="sec-kicker">אלבום</p>
          <h2 class="sec-title">{{ data.heading || 'האלבום החי' }}</h2>
        </div>
        <span class="media-live"><i /> חי</span>
      </div>
      <div class="media-grid">
        <div v-for="n in 6" :key="n" class="tile ph" aria-hidden="true" />
      </div>
      <p class="media-note">{{ data.note || 'התמונות יופיעו כאן בשידור חי, אחרי שהאורחים מעלים.' }}</p>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "MediaStrip",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
