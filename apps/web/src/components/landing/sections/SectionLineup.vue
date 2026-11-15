<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:18px">{{ data.note }}</p>
      <ol class="lineup">
        <li v-for="(it, i) in (data.items || [])" :key="i">
          <div class="lu-time">{{ it.time }}</div>
          <div>
            <div class="lu-title">{{ it.title }}</div>
            <p v-if="it.body">{{ it.body }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "LandingLineup",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
