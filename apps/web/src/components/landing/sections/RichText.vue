<template>
  <section :id="'sec-' + sectionId" :class="['block', 'welcome', alt && 'alt']">
    <div class="wrap" :style="alignStyle">
      <p class="sec-kicker">ברכה</p>
      <h2 class="sec-title">{{ data.heading }}</h2>
      <p class="body">{{ data.body }}</p>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
export default defineComponent({
  name: "RichText",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const alignStyle = computed(() => {
      const a = String(props.data.alignment || "RIGHT").toUpperCase();
      const map: Record<string, string> = {
        LEFT: "left",
        CENTER: "center",
        RIGHT: "right",
      };
      return { textAlign: map[a] || "right" };
    });
    return { alignStyle };
  },
});
</script>
