<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">מוזיקה</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:12px">{{ data.note }}</p>
      <ol class="tracks">
        <li v-for="(tr, i) in (data.tracks || [])" :key="i">
          <span class="no">{{ String(i + 1).padStart(2, '0') }}</span>
          <div>
            <div class="song">{{ tr.song }}</div>
            <div class="art">{{ tr.art }}</div>
          </div>
          <span class="dur">{{ tr.dur }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "LandingPlaylist",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
