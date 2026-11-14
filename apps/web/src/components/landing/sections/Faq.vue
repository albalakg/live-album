<template>
  <section :id="'sec-' + sectionId" :class="['block', 'faq-sec', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <div class="faq">
        <div v-for="(it, n) in (data.items || [])" :key="n" class="faq-item">
          <button
            type="button"
            class="faq-q"
            :aria-expanded="open === n ? 'true' : 'false'"
            :aria-controls="'faq-a-' + sectionId + '-' + n"
            @click="toggle(n)"
          >
            <span>{{ it.q }}</span>
            <span class="faq-plus" aria-hidden="true" />
          </button>
          <div
            :id="'faq-a-' + sectionId + '-' + n"
            class="faq-a"
            role="region"
            :hidden="open !== n"
          >
            <p>{{ it.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "LandingFaq",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const open = ref<number | null>(null);
    function toggle(n: number) {
      open.value = open.value === n ? null : n;
    }
    return { open, toggle };
  },
});
</script>
