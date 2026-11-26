<template>
  <select :id="id" class="gs-select msg-time-select" :value="modelValue" :aria-label="label" @change="onChange">
    <option v-for="t in options" :key="t" :value="t">{{ t }}</option>
  </select>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/** 24h time picker (HH:mm, 15-minute steps). Native time inputs follow the OS locale and may show 12h without AM/PM. */
export default defineComponent({
  name: "MessagingTimeSelect",
  props: {
    modelValue: { type: String, default: "" },
    id: { type: String, default: undefined },
    label: { type: String, default: "שעה" },
  },
  emits: ["update:modelValue", "change"],
  computed: {
    options(): string[] {
      const out: string[] = [];
      for (let m = 0; m < 24 * 60; m += 15) out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
      const cur = (this.modelValue || "").slice(0, 5);
      if (cur && !out.includes(cur)) {
        out.push(cur);
        out.sort();
      }
      return out;
    },
  },
  methods: {
    onChange(e: Event) {
      const v = (e.target as HTMLSelectElement).value;
      this.$emit("update:modelValue", v);
      this.$emit("change", v);
    },
  },
});
</script>
