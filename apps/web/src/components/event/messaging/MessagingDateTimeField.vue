<template>
  <div class="msg-dt">
    <input :id="id" class="gs-input msg-dt-date" type="date" :value="datePart" :min="min ? min.slice(0, 10) : undefined" :aria-label="label + ' — תאריך'" @change="setDate" />
    <MessagingTimeSelect :model-value="timePart" :label="label + ' — שעה'" @change="setTime" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MessagingTimeSelect from "./MessagingTimeSelect.vue";

/** v-model "YYYY-MM-DDTHH:mm" (Israel local time), date input + 24h time select. */
export default defineComponent({
  name: "MessagingDateTimeField",
  components: { MessagingTimeSelect },
  props: {
    modelValue: { type: String, default: "" },
    id: { type: String, default: undefined },
    label: { type: String, default: "מועד" },
    min: { type: String, default: "" },
  },
  emits: ["update:modelValue", "change"],
  computed: {
    datePart(): string {
      return (this.modelValue || "").slice(0, 10);
    },
    timePart(): string {
      return (this.modelValue || "").slice(11, 16) || "20:00";
    },
  },
  methods: {
    emit(v: string) {
      this.$emit("update:modelValue", v);
      this.$emit("change", v);
    },
    setDate(e: Event) {
      const d = (e.target as HTMLInputElement).value;
      if (d) this.emit(`${d}T${this.timePart}`);
    },
    setTime(t: string) {
      if (this.datePart) this.emit(`${this.datePart}T${t}`);
    },
  },
});
</script>

<style scoped>
.msg-dt {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.msg-dt-date {
  flex: 1 1 150px;
  min-width: 0;
}
.msg-dt :deep(.msg-time-select) {
  flex: 0 0 104px;
}
</style>
