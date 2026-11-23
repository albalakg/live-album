<template>
  <div class="guest-q" :data-type="questionType">
    <div class="g-top">
      <span>שאלה {{ question.index }} מתוך {{ question.total }}</span>
      <div class="g-timer" :style="{ '--p': timerProgress }" :aria-label="`${secondsLeft} שניות`">
        <strong>{{ secondsLeft }}</strong>
      </div>
    </div>

    <h1 :class="{ 'emoji-prompt': questionType === 'emoji' }">{{ question.prompt }}</h1>

    <p v-if="hintText" class="hint">{{ hintText }}</p>

    <!-- media: photo / blur / spotdiff / video / audio -->
    <div v-if="showMedia" class="g-media" :class="`kind-${mediaKind}`">
      <div v-if="mediaKind === 'image'" class="g-photo-thumb" :class="{ 'is-blur': isBlur }">
        <img :src="mediaUrl" alt="" :style="blurStyle" />
      </div>
      <video
        v-else-if="mediaKind === 'video'"
        class="g-video"
        :src="mediaUrl"
        controls
        playsinline
        preload="metadata"
      ></video>
      <audio
        v-else
        class="g-audio"
        :src="mediaUrl"
        controls
        preload="metadata"
      ></audio>
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

    <!-- thisorthat / tugofwar -->
    <div v-else-if="isTwoCardVote" class="g-tot">
      <button
        v-for="(card, i) in sideCards"
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

    <!-- rate: 1..10 slider -->
    <div v-else-if="questionType === 'rate'" class="g-slider g-rate">
      <div class="val">{{ rateValue }}</div>
      <input
        type="range"
        :min="rateMin"
        :max="rateMax"
        step="1"
        :value="rateValue"
        :disabled="disabled"
        @input="onRateInput"
      />
      <div class="bounds">
        <span>{{ rateMin }}</span>
        <span>{{ rateMax }}</span>
      </div>
      <button class="g-go" type="button" :disabled="disabled" @click="emitRate">שליחה</button>
    </div>

    <!-- date -->
    <form v-else-if="questionType === 'date'" class="g-date" @submit.prevent="emitDate">
      <input
        v-model="dateIso"
        type="date"
        class="g-input"
        :min="dateMin"
        :max="dateMax"
        :disabled="disabled"
        required
      />
      <button class="g-go" type="submit" :disabled="disabled || !dateNumber">שליחה</button>
    </form>

    <!-- cloud / finish -->
    <form v-else-if="isTextType" class="g-text" @submit.prevent="emitText">
      <p v-if="finishPrefix" class="finish-prefix">{{ finishPrefix }}</p>
      <input
        v-model.trim="textValue"
        type="text"
        class="g-input"
        maxlength="80"
        :placeholder="questionType === 'cloud' ? 'מילה או שתיים' : 'מה בא לכם להשלים?'"
        :disabled="disabled"
        autocomplete="off"
        enterkeyhint="send"
      />
      <p v-if="textFlagged" class="g-text-hint" role="status" data-testid="trivia-text-hint">
        נראה שיש כאן מילה לא מתאימה. היא תוסתר ולא תופיע על המסך.
      </p>
      <button class="g-go" type="submit" :disabled="disabled || !textValue">שליחה</button>
    </form>

    <!-- fillblank: letter tiles -->
    <div v-else-if="questionType === 'fillblank'" class="g-fill">
      <TriviaFillBlankTiles
        v-model="fillValue"
        :letters="fillLetters"
        :disabled="disabled"
      />
      <button class="g-go" type="button" :disabled="disabled || !fillValue" @click="emitFill">שליחה</button>
    </div>

    <!-- map: tap to drop a pin -->
    <div v-else-if="questionType === 'map'" class="g-map">
      <TriviaMapPin v-model="mapPoint" :disabled="disabled" />
      <button class="g-go" type="button" :disabled="disabled || !mapPoint" @click="emitMap">
        שליחת הנעץ
      </button>
    </div>

    <!-- order: tap to order -->
    <div v-else-if="questionType === 'order'" class="g-order">
      <TriviaOrderList v-model="orderIds" :items="options" :disabled="disabled" />
      <button
        class="g-go"
        type="button"
        :disabled="disabled || orderIds.length !== options.length"
        @click="emitOrder"
      >
        שליחה
      </button>
    </div>

    <!-- match: pair left to right -->
    <div v-else-if="questionType === 'match'" class="g-match">
      <TriviaMatchPairs
        v-model="matchPairs"
        :left="options"
        :right="rightItems"
        :disabled="disabled"
      />
      <button
        class="g-go"
        type="button"
        :disabled="disabled || matchPairs.length !== options.length"
        @click="emitMatch"
      >
        שליחה
      </button>
    </div>

    <!-- choice / multi / truefalse / poll / photo / blur / spotdiff / video / audio / emoji / buzzer -->
    <template v-else>
      <div class="g-answers" :class="{ tf: options.length <= 2, buzzer: questionType === 'buzzer' }">
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
import TriviaFillBlankTiles from "@/components/event/trivia/TriviaFillBlankTiles.vue";
import TriviaMapPin from "@/components/event/trivia/TriviaMapPin.vue";
import TriviaMatchPairs from "@/components/event/trivia/TriviaMatchPairs.vue";
import TriviaOrderList from "@/components/event/trivia/TriviaOrderList.vue";
import { TriviaTextHint } from "@/helpers/triviaModeration";
import {
  TRIVIA_LETTERS,
  TRIVIA_LETTER_COLORS,
  TriviaGuestDraft,
  TriviaQuestionDto,
  dateToIso,
  isMediaType,
  isoToDateNumber,
} from "@/helpers/triviaTypes";

const SIDE_COLORS = ["#1F6F6A", "#DC5B66", "#6E4A8A", "#C9A36A"];
const MAX_BLUR_PX = 28;

export default defineComponent({
  name: "TriviaGuestQuestion",

  components: {
    TriviaFillBlankTiles,
    TriviaMapPin,
    TriviaMatchPairs,
    TriviaOrderList,
  },

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

  emits: [
    "update:selectedIds",
    "update:numberValue",
    "submit",
    "submit-number",
    "submit-text",
    "submit-json",
  ],

  data() {
    return {
      textValue: "",
      fillValue: "",
      dateIso: "",
      rateValue: 5,
      rateTouched: false,
      orderIds: [] as number[],
      mapPoint: null as { x: number; y: number } | null,
      matchPairs: [] as { left_id: number; right_id: number }[],
      textFlagged: false,
      textHint: null as TriviaTextHint | null,
    };
  },

  computed: {
    questionType(): string {
      return this.question.type || "choice";
    },

    config(): Record<string, any> {
      return (this.question.config || {}) as Record<string, any>;
    },

    isWhoFamily(): boolean {
      return this.questionType === "who" || this.questionType === "whosaid";
    },

    isTwoCardVote(): boolean {
      return this.questionType === "thisorthat" || this.questionType === "tugofwar";
    },

    isTextType(): boolean {
      return this.questionType === "cloud" || this.questionType === "finish";
    },

    isMulti(): boolean {
      return (
        this.questionType === "multi" ||
        this.questionType === "spotdiff" ||
        this.question.selection_mode === "multiple"
      );
    },

    isBlur(): boolean {
      return this.questionType === "blur";
    },

    options(): { id: number; label: string }[] {
      return (this.question.options || []).filter(
        (o: { id?: number; label: string }): o is { id: number; label: string } =>
          o.id != null
      );
    },

    mediaUrl(): string {
      return this.question.media?.url || "";
    },

    mediaKind(): "image" | "video" | "audio" {
      const kind = String(this.question.media?.kind || "");
      if (kind === "video" || kind === "audio" || kind === "image") return kind;
      if (this.questionType === "video") return "video";
      if (this.questionType === "audio") return "audio";
      return "image";
    },

    showMedia(): boolean {
      return isMediaType(this.questionType) && !!this.mediaUrl;
    },

    blurStyle(): Record<string, string> {
      if (!this.isBlur) return {};
      const p = Math.max(0, Math.min(1, this.timerProgress));
      return { filter: `blur(${(p * MAX_BLUR_PX).toFixed(1)}px)` };
    },

    hintText(): string {
      switch (this.questionType) {
        case "multi":
          return "סמנו את כל התשובות הנכונות";
        case "spotdiff":
          return "סמנו כמה הבדלים שמצאתם, ואז אישור";
        case "twothruths":
          return "בחרו את המשפט שהוא השקר";
        case "poll":
        case "thisorthat":
          return "בלי תשובה נכונה — רק מה שהקהל בוחר";
        case "tugofwar":
          return "בלי תשובה נכונה — כל הקהל מושך בחבל";
        case "photo":
          return this.showMedia ? "התמונה על המסך הגדול" : "";
        case "blur":
          return "התמונה מתחדדת עם הזמן. ככל שעונים מוקדם יותר, מקבלים יותר נקודות";
        case "video":
          return "צפו בקטע ואז ענו";
        case "audio":
          return "האזינו לקטע ואז ענו";
        case "buzzer":
          return "הראשון שעונה נכון לוקח את כל הנקודות";
        case "cloud":
          return "בלי תשובה נכונה — המילים עולות למסך";
        case "finish":
          return "בלי תשובה נכונה — משלימים את המשפט";
        case "rate":
          return "בלי תשובה נכונה — מדרגים";
        case "date":
          return "בחרו תאריך. הקרוב ביותר מנצח";
        case "map":
          return "הניחו נעץ במקום שנראה לכם נכון. הקרוב ביותר מנצח";
        case "order":
          return "הקישו לפי הסדר, מהראשון ועד האחרון";
        case "fillblank":
          return "הרכיבו את המילה מהאותיות";
        case "emoji":
          return "מה מסתתר מאחורי האימוג׳י?";
        default:
          return this.isMulti ? "סמנו את כל התשובות הנכונות" : "";
      }
    },

    finishPrefix(): string {
      return this.questionType === "finish" ? String(this.config.prefix || "") : "";
    },

    numberMin(): number {
      return Number(this.config.min ?? 0);
    },

    numberMax(): number {
      return Number(this.config.max ?? 100);
    },

    numberUnit(): string {
      return String(this.config.unit || "");
    },

    numberStep(): number {
      const span = this.numberMax - this.numberMin;
      if (span > 200) return 1;
      if (span <= 20 && !Number.isInteger(this.numberMin)) return 0.1;
      return 1;
    },

    rateMin(): number {
      return Number(this.config.min ?? 1);
    },

    rateMax(): number {
      return Number(this.config.max ?? 10);
    },

    dateMin(): string | undefined {
      return dateToIso(this.config.min) || undefined;
    },

    dateMax(): string | undefined {
      return dateToIso(this.config.max) || undefined;
    },

    dateNumber(): number | null {
      return isoToDateNumber(this.dateIso);
    },

    fillLetters(): string | string[] {
      const letters = this.config.letters;
      return Array.isArray(letters) ? (letters as string[]) : String(letters || "");
    },

    rightItems(): { id: number; label: string }[] {
      const items = this.config.right_items;
      if (!Array.isArray(items)) return [];
      return items
        .filter((r: any) => r && r.id != null)
        .map((r: any) => ({ id: Number(r.id), label: String(r.label ?? "") }));
    },

    sideCards() {
      const sides =
        (this.config.sides as { name?: string; color?: string; initial?: string }[]) || [];
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

  watch: {
    "question.id": {
      immediate: true,
      handler() {
        this.resetLocal();
      },
    },
    textValue(value: string) {
      if (!this.isTextType) return;
      if (!this.textHint) {
        this.textHint = new TriviaTextHint(
          () => String(this.$route?.params?.event_path || ""),
          (flagged) => {
            this.textFlagged = flagged;
          }
        );
      }
      this.textHint.check(value);
    },
  },

  beforeUnmount() {
    this.textHint?.dispose();
  },

  methods: {
    resetLocal() {
      this.textValue = "";
      this.textFlagged = false;
      this.fillValue = "";
      this.dateIso = "";
      this.orderIds = [];
      this.mapPoint = null;
      this.matchPairs = [];
      this.rateTouched = false;
      this.rateValue = Math.round((this.rateMin + this.rateMax) / 2);
    },

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

    onRateInput(event: Event) {
      this.rateTouched = true;
      this.rateValue = Number((event.target as HTMLInputElement).value);
    },

    emitRate() {
      if (this.disabled) return;
      this.$emit("submit-number", this.rateValue);
    },

    emitDate() {
      if (this.disabled || !this.dateNumber) return;
      this.$emit("submit-number", this.dateNumber);
    },

    emitText() {
      const text = this.textValue.trim();
      if (this.disabled || !text) return;
      this.$emit("submit-text", text);
    },

    emitFill() {
      const text = this.fillValue.trim();
      if (this.disabled || !text) return;
      this.$emit("submit-text", text);
    },

    emitMap() {
      if (this.disabled || !this.mapPoint) return;
      this.$emit("submit-json", { x: this.mapPoint.x, y: this.mapPoint.y });
    },

    emitOrder() {
      if (this.disabled || this.orderIds.length !== this.options.length) return;
      this.$emit("submit", [...this.orderIds]);
    },

    emitMatch() {
      if (this.disabled || this.matchPairs.length !== this.options.length) return;
      this.$emit("submit-json", { matches: this.matchPairs.map((p) => ({ ...p })) });
    },

    /**
     * What the player has entered so far, for auto-submit when time runs out.
     * Returns null when there is nothing meaningful to send.
     */
    collectDraft(): TriviaGuestDraft | null {
      switch (this.questionType) {
        case "cloud":
        case "finish": {
          const text = this.textValue.trim();
          return text ? { option_ids: [], value_text: text } : null;
        }
        case "fillblank": {
          const text = this.fillValue.trim();
          return text ? { option_ids: [], value_text: text } : null;
        }
        case "rate":
          return this.rateTouched ? { option_ids: [], value_number: this.rateValue } : null;
        case "date":
          return this.dateNumber ? { option_ids: [], value_number: this.dateNumber } : null;
        case "map":
          return this.mapPoint
            ? { option_ids: [], value_json: { x: this.mapPoint.x, y: this.mapPoint.y } }
            : null;
        case "order":
          return this.orderIds.length === this.options.length
            ? { option_ids: [...this.orderIds] }
            : null;
        case "match":
          return this.matchPairs.length === this.options.length
            ? {
                option_ids: [],
                value_json: { matches: this.matchPairs.map((p) => ({ ...p })) },
              }
            : null;
        default:
          return null;
      }
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

/* ===== v4 types ===== */
h1.emoji-prompt {
  font-size: 2.6rem;
  letter-spacing: 0.08em;
  text-align: center;
  line-height: 1.3;
}

.g-media {
  margin: 12px 0 4px;
}

.g-photo-thumb.is-blur {
  position: relative;
}

.g-photo-thumb.is-blur img {
  transform: scale(1.12);
  transition: filter 0.25s linear;
}

.g-video {
  width: 100%;
  max-height: 320px;
  border-radius: 18px;
  background: #000;
  display: block;
}

.g-audio {
  width: 100%;
  display: block;
}

.g-answers.buzzer .g-ans {
  min-height: 72px;
  font-size: 1.2rem;
  border-width: 2.5px;
  border-color: var(--g-rose, #dc5b66);
  background: var(--g-paper, #fff);
}

.g-answers.buzzer .g-ans.on {
  background: var(--g-rose, #dc5b66);
  color: #fff;
}

.g-rate .val {
  font-size: 4.4rem;
}

.g-date,
.g-text,
.g-fill,
.g-map,
.g-order,
.g-match {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.g-date .g-go,
.g-text .g-go,
.g-fill .g-go,
.g-map .g-go,
.g-order .g-go,
.g-match .g-go {
  margin-top: 16px;
}

.g-text-hint {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--g-rose, #dc5b66);
}

.g-input {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid var(--g-line, rgba(22, 19, 16, 0.12));
  border-radius: 16px;
  padding: 16px;
  font-size: 1.2rem;
  font-weight: 700;
  background: var(--g-paper, #fff);
  color: inherit;
  font-family: inherit;
}

.g-input:focus {
  outline: 3px solid rgba(201, 163, 106, 0.4);
  border-color: var(--g-gold, #c9a36a);
}

.finish-prefix {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.4;
  margin-bottom: 10px;
  color: var(--g-ink, #161310);
}

@media (prefers-reduced-motion: reduce) {
  .g-photo-thumb.is-blur img {
    transition: none;
  }
}
</style>
