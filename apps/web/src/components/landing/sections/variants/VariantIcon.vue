<template>
  <svg
    class="vx-ic"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="paths[name] || paths.dot"
  ></svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/** Static, trusted SVG paths (from the approved mock). Never user content. */
const PATHS: Record<string, string> = {
  pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  glass: '<path d="M8 3h8l-1 7a3 3 0 0 1-6 0z"/><path d="M12 13v7M8.5 20.5h7"/>',
  ring: '<circle cx="12" cy="14" r="6"/><path d="m9.5 4 2.5 3 2.5-3"/>',
  dish: '<path d="M3 16h18"/><path d="M5 16a7 7 0 0 1 14 0"/><path d="M12 7V5.5"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
};

export default defineComponent({
  name: "VariantIcon",
  props: { name: { type: String, required: true } },
  setup() {
    return { paths: PATHS };
  },
});
</script>
