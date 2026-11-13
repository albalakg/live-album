<template>
  <div class="guest-q" :data-type="questionType">
    <div class="g-top">
      <span>שאלה {{ question.index }} מתוך {{ question.total }}</span>
      <div class="g-timer" :style="{ '--p': timerProgress }" :aria-label="`${secondsLeft} שניות`">
        <strong>{{ secondsLeft }}</strong>
      </div>
    </div>

    <h1>{{ question.prompt }}</h1>

    <p v-if="hintText" class="hint">{{ hintText }}</p>

    <!-- photo thumbnail -->
    <div v-if="questionType === 'photo' && photoUrl" class="g-photo-thumb">
      <img :src="photoUrl" alt="" />
    </div>

    <!-- who / whosaid -->
    <div v-if="isWhoFamily" class="g-who">
      <button
        v-for="card in sideCards"
        :key="card.id"
        type="button"
        :class="{ on: selectedIds.includes(card.id) }"
        :disabled="disabled"
        @click="pick(card.id)"
      >
        <div class="av-lg" :style="{ background: card.color, color: '#fff' }">{{ card.initial }}</div>
        {{ card.name }}
      </button>
    </div>

    <!-- thisorthat -->
    <div v-else-if="questionType === 'thisorthat'" class="g-tot">
      <button
        v-for="card in sideCards"
        :key="card.id"
        type="button"
        :class="{ on: selectedIds.includes(card.id) }"
        :style="totStyle(card, i)"
        :disabled="disabled"
        @click="pick(card.id)"
      >
        <span class="tot-init">{{ card.initial }}</span>
        {{ card.name }}
      </button>
    </div>

    <!-- twothruths -->
    <div v-else-if="questionType === 'twothruths'" class="g-answers">
      <button
        v-for="(opt, i) in options"
        :key="opt.id"
        type="button"
        class="g-ans"
        :class="{ on: selectedIds.includes(opt.id) }"
        :disabled="disabled"
        @click="pick(opt.id)"
      >
        <span class="gl" :style="{ background: letterColor(i) }">{{ i + 1 }}</span>
        {{ opt.label }}
      </button>
    </div>

    <!-- number: LTR slider -->
    <div v-else-if="questionType === 'number'" class="g-slider">
      <div class="val">{{ numberValue }}</div>
      <input
        type="range"
        :min="numberMin"
        :max="numberMax"
        :step="numberStep"
        :value="numberValue"
        :disabled="disabled"
        @input="onNumberInput"
      />
      <div class="bounds">
        <span>{{ numberMin }}</span>
        <span>{{ numberMax }}</span>
      </div>
      <p v-if="numberUnit" class="hint unit">{{ numberUnit }}</p>
      <button class="g-go" type="button" :disabled="disabled" @click="emitNumber">שליחה</button>
    </div>

    <!-- choice / multi / truefalse / poll / photo -->
    <template v-else>
      <div class="g-answers" :class="{ tf: options.length <= 2 }">
        <button
          v-for="(opt, i) in options"
          :key="opt.id"
          type="button"
          class="g-ans"
          :class="{ on: selectedIds.includes(opt.id) }"
          :disabled="disabled"
          @click="pick(opt.id)"
        >
          <span class="gl" :style="{ background: letterColor(i) }">{{ letter(i) }}</span>
          {{ opt.label }}
        </button>
      </div>
      <button
        v-if="isMulti"
        class="g-go"
        type="button"
        :disabled="disabled || !selectedIds.length"
        @click="emitConfirm"
      >
        אישור
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
  TRIVIA_LETTERS,
  TRIVIA_LETTER_COLORS,
  TriviaQuestionDto,
} from "@/helpers/triviaTypes";

const SIDE_COLORS = ["#1F6F6A", "#DC5B66", "#6E4A8A", "#C9A36A"];

export default defineComponent({
  name: "TriviaGuestQuestion",

  props: {
    question: {
      type: Object as PropType<TriviaQuestionDto & { id: number }>,
      required: true,
    },
    selectedIds: {
      type: Array as PropType<number[]>,
      default: () => [],
    },
    numberValue: {
      type: Number,
      default: 0,
    },
    secondsLeft: {
      type: Number,
      default: 0,
    },
    timerProgress: {
      type: Number,
      default: 1,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:selectedIds", "update:numberValue", "submit", "submit-number"],

  computed: {
    questionType(): string {
      return this.question.type || "choice";
    },

    isWhoFamily(): boolean {
      return this.questionType === "who" || this.questionType === "whosaid";
    },

    isMulti(): boolean {
      return (
        this.questionType === "multi" || this.question.selection_mode === "multiple"
      );
    },

    options(): { id: number; label: string }[] {
      return (this.question.options || []).filter(
        (o: { id?: number; label: string }): o is { id: number; label: string } =>
          o.id != null
      );
    },

    photoUrl(): string {
      return this.question.media?.url || "";
    },

    hintText(): string {
      if (this.questionType === "multi" || this.question.selection_mode === "multiple") {
        return "סמנו את כל התשובות הנכונות";
      }
      if (this.questionType === "twothruths") {
        return "בחרו את המשפט שהוא השקר";
      }
      if (this.questionType === "poll" || this.questionType === "thisorthat") {
        return "בלי תשובה נכונה — רק מה שהקהל בוחר";
      }
      if (this.questionType === "photo" && this.photoUrl) {
        return "התמונה על המסך הגדול";
      }
      return "";
    },

    numberConfig(): { min?: number; max?: number; unit?: string } {
      return (this.question.config || {}) as {
        min?: number;
        max?: number;
        unit?: string;
      };
    },

    numberMin(): number {
      return Number(this.numberConfig.min ?? 0);
    },

    numberMax(): number {
      return Number(this.numberConfig.max ?? 100);
    },

    numberUnit(): string {
      return String(this.numberConfig.unit || "");
    },

    numberStep(): number {
      const span = this.numberMax - this.numberMin;
      if (span > 200) return 1;
      if (span <= 20 && !Number.isInteger(this.numberMin)) return 0.1;
      return 1;
    },

    sideCards() {
      const config = (this.question.config || {}) as {
        sides?: { name?: string; color?: string; initial?: string }[];
      };
      const sides = config.sides || [];
      const options = this.options;
      const count = Math.min(2, Math.max(sides.length, options.length, 2));
      const cards: {
        id: number;
        name: string;
        color: string;
        initial: string;
      }[] = [];
      for (let i = 0; i < count; i++) {
        const side = sides[i] || {};
        const opt = options[i];
        if (!opt) continue;
        const name = side.name || opt.label || `צד ${i + 1}`;
        cards.push({
          id: opt.id,
          name,
          color: side.color || SIDE_COLORS[i % SIDE_COLORS.length],
          initial: side.initial || name.trim().charAt(0) || "?",
        });
      }
      return cards;
    },
  },

  methods: {
    letter(i: number): string {
      return TRIVIA_LETTERS[i] || String(i + 1);
    },

    letterColor(i: number): string {
      return TRIVIA_LETTER_COLORS[i % TRIVIA_LETTER_COLORS.length];
    },

    totStyle(card: { color: string }, i: number): Record<string, string> {
      if (!this.selectedIds.includes(this.sideCards[i]?.id)) {
        return { background: card.color, color: "#fff" };
      }
      return {
        background: card.color,
        color: "#fff",
        boxShadow: "0 0 0 3px #C9A36A",
      };
    },

    pick(optionId: number) {
      if (this.disabled) return;
      if (this.questionType === "number") return;

      if (this.isMulti) {
        const next = this.selectedIds.includes(optionId)
          ? this.selectedIds.filter((id) => id !== optionId)
          : [...this.selectedIds, optionId];
        this.$emit("update:selectedIds", next);
        return;
      }

      this.$emit("update:selectedIds", [optionId]);
      this.$emit("submit", [optionId]);
    },

    emitConfirm() {
      if (this.disabled || !this.selectedIds.length) return;
      this.$emit("submit", [...this.selectedIds]);
    },

    onNumberInput(event: Event) {
      const input = event.target as HTMLInputElement;
      this.$emit("update:numberValue", Number(input.value));
    },

    emitNumber() {
      if (this.disabled) return;
      this.$emit("submit-number", this.numberValue);
    },
  },
});
</script>

<style lang="scss" scoped>
.guest-q {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

h1 {
  font-size: 1.85rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 8px;
}

.hint {
  color: var(--g-muted, #5e564e);
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.hint.unit {
  text-align: center;
  margin-top: 4px;
}

.g-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-weight: 700;
  font-size: 0.95rem;
}

.g-timer {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(
    var(--g-rose, #dc5b66) calc(var(--p, 0.7) * 360deg),
    var(--g-timer-track, #efe8df) 0
  );
}

.g-timer strong {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--g-paper, #fff);
  color: var(--g-ink, #161310);
  display: grid;
  place-items: center;
  font-size: 1.05rem;
  font-weight: 900;
}

.g-answers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.g-ans {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: var(--g-paper, #fff);
  border: 1.5px solid var(--g-line, rgba(22, 19, 16, 0.12));
  font-weight: 800;
  font-size: 1.05rem;
  text-align: right;
  width: 100%;
  cursor: pointer;
  color: inherit;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
}

.g-ans:active:not(:disabled) {
  transform: scale(0.98);
}

.g-ans.on {
  border-color: var(--g-rose, #dc5b66);
  background: var(--g-ans-on, #fff5f5);
}

.g-ans:disabled {
  opacity: 0.7;
  cursor: default;
}

.g-ans .gl {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex: none;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 900;
}

.g-who {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

.g-who button {
  background: var(--g-paper, #fff);
  border-radius: 22px;
  padding: 22px 10px;
  border: 2px solid var(--g-line, rgba(22, 19, 16, 0.12));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 1.2rem;
  cursor: pointer;
  color: inherit;
}

.g-who button.on {
  border-color: var(--g-gold, #c9a36a);
  box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.3);
}

.g-who .av-lg {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 2rem;
  font-weight: 900;
}

.g-tot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.g-tot button {
  min-height: 180px;
  border-radius: 28px;
  border: 0;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
  font-weight: 900;
  font-size: 1.45rem;
  padding: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.g-tot .tot-init {
  font-size: 2.4rem;
  line-height: 1;
}

.g-slider {
  margin-top: 28px;
  direction: ltr;
  text-align: left;
}

.g-slider .val {
  font-size: 3.4rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  text-align: center;
  line-height: 1;
  background: linear-gradient(135deg, var(--g-rose, #dc5b66), var(--g-gold, #c9a36a));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  direction: ltr;
}

.g-slider input[type="range"] {
  width: 100%;
  accent-color: var(--g-rose, #dc5b66);
  height: 32px;
  margin-top: 12px;
}

.g-slider .bounds {
  display: flex;
  justify-content: space-between;
  color: var(--g-faint, #8a8278);
  font-weight: 700;
  margin-top: 4px;
}

.g-photo-thumb {
  margin: 12px 0 4px;
  border-radius: 18px;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: rgba(22, 19, 16, 0.06);
}

.g-photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.g-go {
  margin-top: 16px;
  width: 100%;
  background: linear-gradient(135deg, var(--g-rose, #dc5b66), var(--g-gold, #c9a36a));
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  padding: 16px;
  border-radius: 16px;
  border: 0;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(220, 91, 102, 0.22);
}

.g-go:disabled {
  opacity: 0.55;
  cursor: default;
}
</style>
