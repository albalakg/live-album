<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:22px">{{ data.note }}</p>
      <svg class="grounds-svg" viewBox="0 0 640 360" role="img" aria-label="תרשים שטח לדוגמה">
        <rect width="640" height="360" rx="18" fill="var(--stage, #EDE4D4)" stroke="var(--line-strong)" />
        <rect x="40" y="40" width="120" height="80" rx="10" class="z-gate" fill="var(--accent)" opacity="0.35" />
        <rect x="220" y="60" width="200" height="120" rx="12" class="z-main" fill="var(--accent)" opacity="0.5" />
        <rect x="460" y="50" width="140" height="90" rx="10" class="z-small" fill="var(--accent-2, var(--accent))" opacity="0.35" />
        <rect x="60" y="200" width="160" height="100" rx="10" class="z-food" fill="var(--accent)" opacity="0.28" />
        <rect x="260" y="220" width="140" height="90" rx="10" class="z-camp" fill="var(--accent-2, var(--accent))" opacity="0.28" />
        <rect x="450" y="210" width="140" height="100" rx="10" class="z-park" fill="var(--muted)" opacity="0.25" />
        <text x="320" y="340" text-anchor="middle" fill="var(--muted)" font-size="14">מפה לדוגמה</text>
      </svg>
      <ul class="zone-legend">
        <li v-for="(z, i) in (data.zones || [])" :key="i">
          <i :class="'z-' + z.id" /><span>{{ z.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "LandingGrounds",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
