<template>
  <div class="ss-root ss-trigger-row">
    <button class="search-trigger" type="button" aria-label="חיפוש (Ctrl/⌘ K)" @click="$emit('open')">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      <span class="st-text">חיפוש אורח, שולחן, תמונה…</span>
      <kbd class="st-kbd">{{ isMac ? "⌘ K" : "Ctrl K" }}</kbd>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SearchTriggerButton",
  emits: ["open"],
  computed: {
    isMac(): boolean {
      return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");
    },
  },
});
</script>
