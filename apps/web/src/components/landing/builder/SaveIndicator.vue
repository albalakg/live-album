<template>
  <div class="save" role="status" aria-live="polite" :data-s="status">
    <span class="dot" />
    <template v-if="status === 'saving'">שומר…</template>
    <template v-else-if="status === 'error'">
      לא נשמר.
      <button type="button" @click="$emit('retry')">לנסות שוב</button>
    </template>
    <template v-else>{{ published ? "נשמר ועודכן בעמוד ✓" : "נשמר ✓" }}</template>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { SaveStatus } from "./builderTypes";

export default defineComponent({
  name: "SaveIndicator",
  props: {
    status: { type: String as PropType<SaveStatus>, default: "saved" },
    published: { type: Boolean, default: false },
  },
  emits: ["retry"],
});
</script>
