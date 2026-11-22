<template>
  <div v-if="ended" class="vh-cd vh-cd--ended" aria-label="האירוע התחיל"><p>האירוע התחיל</p></div>
  <div v-else class="vh-cd" aria-label="ספירה לאחור">
    <div><b>{{ parts.days }}</b><span>ימים</span></div>
    <div><b>{{ parts.hours }}</b><span>שעות</span></div>
    <div><b>{{ parts.mins }}</b><span>דקות</span></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "VariantCountdown",
  props: {
    parts: { type: Object as PropType<{ days: number; hours: number; mins: number }>, required: true },
    ended: { type: Boolean, default: false },
  },
});
</script>
