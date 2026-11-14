<template>
  <section :id="'sec-' + sectionId" :class="['block', 'hashtag-sec', alt && 'alt']">
    <div class="wrap">
      <p class="hash">{{ data.tag }}</p>
      <p class="body">{{ data.body }}</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "LandingHashtag",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
