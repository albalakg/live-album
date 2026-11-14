<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">{{ data.kicker || 'לו״ז' }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <ol class="tl">
        <li v-for="(it, i) in (data.items || [])" :key="i">
          <span class="dot" aria-hidden="true"></span>
          <div class="time">{{ it.time }}</div>
          <div>
            <div class="label">{{ it.label }}</div>
            <div v-if="it.description" class="desc">{{ it.description }}</div>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "EventTimeline",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
