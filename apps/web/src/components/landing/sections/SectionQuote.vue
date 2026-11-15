<template>
  <section :id="'sec-' + sectionId" :class="['block', 'quote-band', alt && 'alt']">
    <div class="wrap">
      <blockquote>
        <p>{{ data.text }}</p>
        <cite v-if="data.credit">{{ data.credit }}</cite>
      </blockquote>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "LandingQuote",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
