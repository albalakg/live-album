<template>
  <ol class="stepper" aria-label="שלבים">
    <li
      v-for="(s, i) in steps"
      :key="i"
      :class="{ cur: i + 1 === step, done: isDone(i + 1) }"
    >
      <button
        type="button"
        class="step-btn"
        :disabled="!canGo(i + 1)"
        :aria-current="i + 1 === step ? 'step' : undefined"
        @click="$emit('go', i + 1)"
      >
        <span class="n">
          <BuilderIcon v-if="isDone(i + 1) && i + 1 !== step" name="check" style="width: 18px; height: 18px" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="t">{{ s.title }}<span class="sub">{{ s.sub }}</span></span>
      </button>
    </li>
  </ol>
  <div class="stepper-m">
    <div class="bars">
      <button
        v-for="(s, i) in steps"
        :key="i"
        type="button"
        :class="barClass(i + 1)"
        :disabled="!canGo(i + 1)"
        :aria-label="`שלב ${i + 1}: ${s.title}`"
        @click="$emit('go', i + 1)"
      />
    </div>
    <p>שלב {{ step }} מתוך 3 · <b>{{ steps[step - 1].title }}</b></p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BuilderIcon from "./BuilderIcon.vue";

const STEPS = [
  { title: "בוחרים עיצוב", sub: "איך העמוד ייראה" },
  { title: "ממלאים פרטים", sub: "מה כתוב בעמוד" },
  { title: "מפרסמים", sub: "כתובת ושליחה לאורחים" },
];

export default defineComponent({
  name: "BuilderStepper",
  components: { BuilderIcon },
  props: {
    step: { type: Number, required: true },
    maxStep: { type: Number, required: true },
  },
  emits: ["go"],
  setup(props) {
    function isDone(n: number): boolean {
      return n < props.step || (n <= props.maxStep && n !== props.step);
    }
    function canGo(n: number): boolean {
      return n <= props.maxStep && n !== props.step;
    }
    function barClass(n: number): string {
      if (n === props.step) return "cur";
      return n <= props.maxStep ? "done" : "";
    }
    return { steps: STEPS, isDone, canGo, barClass };
  },
});
</script>
