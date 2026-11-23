<template>
  <label class="tb-approval" data-testid="trivia-editor-approval">
    <input type="checkbox" :checked="checked" :disabled="disabled" @change="onChange" />
    <span>
      <b>אישור לפני הצגה על המסך</b>
      <small>התשובות מחכות אצלכם בניהול החי, ועולות למסך רק אחרי אישור. מילים לא ראויות מסוננות תמיד.</small>
    </span>
  </label>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TriviaApprovalToggle",

  props: {
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },

  emits: ["toggle"],

  methods: {
    onChange(event: Event) {
      this.$emit("toggle", (event.target as HTMLInputElement).checked);
    },
  },
});
</script>

<style scoped>
.tb-approval {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid rgba(22, 19, 16, 0.11);
  background: #fffcfa;
  cursor: pointer;
}
.tb-approval input {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  accent-color: #dc5b66;
}
.tb-approval b {
  display: block;
  font-weight: 800;
}
.tb-approval small {
  color: #5e564e;
}
</style>
