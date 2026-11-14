<template>
  <footer class="efoot" :id="'sec-' + sectionId">
    <div class="logo">
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="#DC5B66"/><path d="M16.8 7.2l1.4-1.4" stroke="#C9A36A" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      SnapShare
    </div>
    <p>{{ data.note || 'העמוד הזה נוצר ב־SnapShare. האורחים מעלים בלי אפליקציה, והתמונות מופיעות באלבום החי.' }}</p>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "FooterSection",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, default: "footer" },
    alt: { type: Boolean, default: false },
  },
});
</script>
