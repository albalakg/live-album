<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">דוברים</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:18px">{{ data.note }}</p>
      <ul class="speakers">
        <li v-for="(s, i) in (data.items || [])" :key="i">
          <div class="mono" aria-hidden="true">{{ s.initials }}</div>
          <div>
            <div class="nm">{{ s.name }}</div>
            <div class="rl">{{ s.role }} <span class="demo-tag">דוגמה</span></div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "LandingSpeakers",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
