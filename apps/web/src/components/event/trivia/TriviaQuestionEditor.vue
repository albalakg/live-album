<template>
  <section class="tb-editor-panel" :class="{ 'mob-on': mobOn }">
    <div v-if="!question" class="tb-empty">
      <h3>בחרו שאלה</h3>
      <p>או הוסיפו שאלה חדשה מהרשימה.</p>
    </div>

    <template v-else>
      <div class="tb-editor-tools-wrap">
        <div class="tb-editor-tools">
          <button
            type="button"
            class="tb-type-badge"
            :disabled="locked"
            @click="$emit('change-type')"
          >
            <span class="gal-ico" :style="{ background: typeMeta?.bg || '#eee' }">
              {{ typeMeta?.ico || "?" }}
            </span>
            {{ typeMeta?.label || question.type }}
            <span class="chg">שינוי</span>
          </button>
          <button
            type="button"
            class="tb-icon-btn"
            title="שכפול"
            aria-label="שכפול שאלה"
            :disabled="locked || atCap"
            @click="$emit('duplicate')"
          >
            <span class="material-symbols-outlined" style="font-size: 18px">content_copy</span>
          </button>
          <button
            type="button"
            class="tb-icon-btn danger"
            title="מחיקה"
            aria-label="מחיקת שאלה"
            :disabled="locked"
            @click="$emit('delete')"
          >
            <span class="material-symbols-outlined" style="font-size: 18px">delete</span>
          </button>
        </div>
      </div>

      <div class="tb-editor">
        <label class="tb-field">
          <span>השאלה</span>
          <textarea
            class="tb-prompt"
            :value="question.prompt"
            :disabled="locked"
            maxlength="500"
            rows="3"
            placeholder="לדוגמה: איפה נפגשו עמית וגל לראשונה?"
            @input="patch({ prompt: ($event.target as HTMLTextAreaElement).value })"
          ></textarea>
        </label>

        <!-- who / whosaid / thisorthat -->
        <div v-if="isTwoCard" class="tb-who-grid">
          <div
            v-for="(side, i) in sideCards"
            :key="i"
            class="tb-who-side"
            :class="{ correct: !unscored && question.options[i]?.is_correct }"
          >
            <div
              class="tb-who-avatar"
              :style="{ background: side.color }"
            >{{ side.initial }}</div>
            <input
              type="text"
              :value="question.options[i]?.label || side.name"
              :disabled="locked"
              maxlength="80"
              @input="updateSideLabel(i, ($event.target as HTMLInputElement).value)"
            />
            <button
              v-if="!unscored"
              type="button"
              class="tb-mark"
              :class="{ on: question.options[i]?.is_correct }"
              :disabled="locked"
              @click="markCorrect(i)"
            >
              {{ question.options[i]?.is_correct ? "התשובה" : "סמן כתשובה" }}
            </button>
            <span v-else class="tb-hint-row">בלי תשובה נכונה</span>
          </div>
        </div>

        <!-- twothruths -->
        <div v-else-if="question.type === 'twothruths'" class="tb-opts">
          <div
            v-for="(opt, i) in question.options"
            :key="opt.key"
            class="tb-opt"
            :class="{ correct: opt.is_correct }"
          >
            <span class="tb-opt-letter" :style="{ background: letterColor(i) }">{{ i + 1 }}</span>
            <input
              type="text"
              :value="opt.label"
              :disabled="locked"
              maxlength="200"
              placeholder="משפט"
              @input="updateOption(i, { label: ($event.target as HTMLInputElement).value })"
            />
            <button
              type="button"
              class="tb-mark"
              :class="{ on: opt.is_correct }"
              :disabled="locked"
              @click="markLie(i)"
            >
              {{ opt.is_correct ? "זה השקר" : "סמן כשקר" }}
            </button>
            <span></span>
          </div>
        </div>

        <!-- number -->
        <template v-else-if="question.type === 'number'">
          <div class="tb-num-range">
            <label class="tb-field">
              <span>מ־</span>
              <input
                type="number"
                :value="numConfig.min"
                :disabled="locked"
                @input="patchNum('min', Number(($event.target as HTMLInputElement).value))"
              />
            </label>
            <label class="tb-field">
              <span>עד</span>
              <input
                type="number"
                :value="numConfig.max"
                :disabled="locked"
                @input="patchNum('max', Number(($event.target as HTMLInputElement).value))"
              />
            </label>
            <label class="tb-field">
              <span>התשובה</span>
              <input
                type="number"
                :value="numConfig.correct"
                :disabled="locked"
                @input="patchNum('correct', Number(($event.target as HTMLInputElement).value))"
              />
            </label>
          </div>
          <label class="tb-field">
            <span>יחידה (אופציונלי)</span>
            <input
              type="text"
              :value="numConfig.unit || ''"
              :disabled="locked"
              maxlength="40"
              @input="patchNum('unit', ($event.target as HTMLInputElement).value)"
            />
          </label>
          <p class="tb-hint-row">
            מי שהכי קרוב מקבל את מלוא הנקודות, והשאר לפי המרחק.
          </p>
        </template>

        <!-- photo + options -->
        <template v-else-if="question.type === 'photo'">
          <div class="tb-field">
            <span>בחרו תמונה מהאלבום החי</span>
            <div v-if="albumPhotos.length" class="tb-photo-pick">
              <button
                v-for="photo in albumPhotos"
                :key="photo.id"
                type="button"
                :class="{ on: question.media_asset_id === photo.id }"
                :disabled="locked"
                @click="pickPhoto(photo)"
              >
                <img :src="photo.url" alt="" />
              </button>
            </div>
            <p v-else class="tb-hint-row">
              אין עדיין תמונות באלבום — אפשר לשמור את השאלה ולהוסיף תמונה אחר כך.
            </p>
          </div>
          <div class="tb-field">
            <span>תשובות</span>
            <div class="tb-opts">
              <div
                v-for="(opt, i) in question.options"
                :key="opt.key"
                class="tb-opt"
                :class="{ correct: opt.is_correct }"
              >
                <span class="tb-opt-letter" :style="{ background: letterColor(i) }">{{ letter(i) }}</span>
                <input
                  type="text"
                  :value="opt.label"
                  :disabled="locked"
                  maxlength="200"
                  placeholder="תשובה"
                  @input="updateOption(i, { label: ($event.target as HTMLInputElement).value })"
                />
                <button
                  type="button"
                  class="tb-mark"
                  :class="{ on: opt.is_correct }"
                  :disabled="locked"
                  @click="markCorrect(i)"
                >
                  {{ opt.is_correct ? "נכונה" : "סמן כנכונה" }}
                </button>
                <button
                  type="button"
                  class="tb-icon-btn"
                  aria-label="מחיקת תשובה"
                  :disabled="locked || question.options.length <= 2"
                  @click="removeOption(i)"
                >×</button>
              </div>
            </div>
            <button
              v-if="question.options.length < 6"
              type="button"
              class="tb-linkish"
              :disabled="locked"
              @click="addOption"
            >+ תשובה נוספת</button>
          </div>
        </template>

        <!-- choice / multi / truefalse / poll -->
        <div v-else class="tb-field">
          <span>תשובות</span>
          <div class="tb-opts">
            <div
              v-for="(opt, i) in question.options"
              :key="opt.key"
              class="tb-opt"
              :class="{ correct: !unscored && opt.is_correct }"
            >
              <span class="tb-opt-letter" :style="{ background: letterColor(i) }">{{ letter(i) }}</span>
              <input
                type="text"
                :value="opt.label"
                :disabled="locked || question.type === 'truefalse'"
                maxlength="200"
                placeholder="תשובה"
                @input="updateOption(i, { label: ($event.target as HTMLInputElement).value })"
              />
              <button
                v-if="!unscored"
                type="button"
                class="tb-mark"
                :class="{ on: opt.is_correct }"
                :disabled="locked"
                @click="question.type === 'multi' ? toggleCorrect(i) : markCorrect(i)"
              >
                {{ opt.is_correct ? "נכונה" : "סמן כנכונה" }}
              </button>
              <span v-else></span>
              <button
                v-if="question.type !== 'truefalse'"
                type="button"
                class="tb-icon-btn"
                aria-label="מחיקת תשובה"
                :disabled="locked || question.options.length <= 2"
                @click="removeOption(i)"
              >×</button>
              <span v-else></span>
            </div>
          </div>
          <button
            v-if="question.type !== 'truefalse' && question.options.length < 6"
            type="button"
            class="tb-linkish"
            :disabled="locked"
            @click="addOption"
          >+ תשובה נוספת</button>
        </div>

        <div class="tb-advanced" :class="{ open: advancedOpen }">
          <button type="button" class="tb-advanced-tog" @click="advancedOpen = !advancedOpen">
            הגדרות נוספות
            <span class="chev">▾</span>
          </button>
          <div class="tb-advanced-body">
            <div class="tb-meta-row">
              <label class="tb-field">
                <span>שניות</span>
                <input
                  type="number"
                  min="5"
                  max="120"
                  :value="question.time_limit_seconds"
                  :disabled="locked"
                  @input="patch({ time_limit_seconds: Number(($event.target as HTMLInputElement).value) })"
                />
              </label>
              <label class="tb-field">
                <span>{{ unscored ? "בלי ניקוד" : "נקודות" }}</span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  :value="question.max_points"
                  :disabled="locked || unscored"
                  @input="patch({ max_points: Number(($event.target as HTMLInputElement).value) })"
                />
              </label>
            </div>
            <label class="tb-field">
              <span>רמז למנחה, לא מוצג לאורחים</span>
              <input
                type="text"
                :value="question.host_hint"
                :disabled="locked"
                maxlength="200"
                placeholder="למשל: להזכיר את הטיול לצפון"
                @input="patch({ host_hint: ($event.target as HTMLInputElement).value })"
              />
            </label>
            <label class="tb-field">
              <span>רקע קצר, אחרי החשיפה</span>
              <textarea
                rows="2"
                :value="question.fun_fact"
                :disabled="locked"
                maxlength="500"
                @input="patch({ fun_fact: ($event.target as HTMLTextAreaElement).value })"
              ></textarea>
            </label>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
  TriviaBuilderQuestion,
  nextBuilderKey,
} from "@/helpers/triviaBuilder";
import {
  TRIVIA_LETTERS,
  TRIVIA_LETTER_COLORS,
  isTwoCardType,
  isUnscoredType,
  triviaTypeMeta,
} from "@/helpers/triviaTypes";

export default defineComponent({
  name: "TriviaQuestionEditor",

  props: {
    question: {
      type: Object as PropType<TriviaBuilderQuestion | null>,
      default: null,
    },
    locked: { type: Boolean, default: false },
    atCap: { type: Boolean, default: false },
    mobOn: { type: Boolean, default: false },
    albumPhotos: {
      type: Array as PropType<{ id: number; url: string }[]>,
      default: () => [],
    },
  },

  emits: ["update", "change-type", "duplicate", "delete"],

  data() {
    return {
      advancedOpen: false,
    };
  },

  computed: {
    typeMeta(): ReturnType<typeof triviaTypeMeta> | null {
      return this.question ? triviaTypeMeta(this.question.type) : null;
    },
    unscored(): boolean {
      return this.question ? isUnscoredType(this.question.type) : false;
    },
    isTwoCard(): boolean {
      return this.question ? isTwoCardType(this.question.type) : false;
    },
    numConfig(): { min: number; max: number; correct: number; unit: string } {
      const c = (this.question?.config || {}) as Record<string, unknown>;
      return {
        min: Number(c.min ?? 0),
        max: Number(c.max ?? 100),
        correct: Number(c.correct ?? 50),
        unit: String(c.unit ?? ""),
      };
    },
    sideCards(): { name: string; color: string; initial: string }[] {
      const sides = (this.question?.config as any)?.sides;
      if (Array.isArray(sides) && sides.length >= 2) {
        return sides.slice(0, 2).map((s: any, i: number) => ({
          name: s.name || this.question?.options[i]?.label || "",
          color: s.color || (i === 0 ? "#1F6F6A" : "#DC5B66"),
          initial: s.initial || (s.name || "?").slice(0, 1),
        }));
      }
      return [
        { name: "עמית", color: "#1F6F6A", initial: "ע" },
        { name: "גל", color: "#DC5B66", initial: "ג" },
      ];
    },
  },

  methods: {
    letter(i: number) {
      return TRIVIA_LETTERS[i] || String(i + 1);
    },
    letterColor(i: number) {
      return TRIVIA_LETTER_COLORS[i % TRIVIA_LETTER_COLORS.length];
    },
    patch(partial: Partial<TriviaBuilderQuestion>) {
      if (!this.question) return;
      this.$emit("update", { ...this.question, ...partial });
    },
    updateOption(index: number, partial: { label?: string; is_correct?: boolean }) {
      if (!this.question) return;
      const options = this.question.options.map((o, i) =>
        i === index ? { ...o, ...partial } : o
      );
      this.patch({ options });
    },
    markCorrect(index: number) {
      if (!this.question) return;
      const options = this.question.options.map((o, i) => ({
        ...o,
        is_correct: i === index,
      }));
      this.patch({ options });
    },
    toggleCorrect(index: number) {
      if (!this.question) return;
      const options = this.question.options.map((o, i) =>
        i === index ? { ...o, is_correct: !o.is_correct } : o
      );
      this.patch({ options });
    },
    markLie(index: number) {
      this.markCorrect(index);
    },
    addOption() {
      if (!this.question || this.question.options.length >= 6) return;
      this.patch({
        options: [
          ...this.question.options,
          { key: nextBuilderKey("o"), label: "", is_correct: false },
        ],
      });
    },
    removeOption(index: number) {
      if (!this.question || this.question.options.length <= 2) return;
      const options = this.question.options.filter((_, i) => i !== index);
      this.patch({ options });
    },
    updateSideLabel(index: number, label: string) {
      if (!this.question) return;
      const options = this.question.options.map((o, i) =>
        i === index ? { ...o, label } : o
      );
      const sides = [...(this.sideCards as any[])];
      sides[index] = {
        ...sides[index],
        name: label,
        initial: label.slice(0, 1) || sides[index].initial,
      };
      this.patch({
        options,
        config: { ...(this.question.config || {}), sides },
      });
    },
    patchNum(key: string, value: number | string) {
      if (!this.question) return;
      this.patch({
        config: { ...this.numConfig, ...(this.question.config || {}), [key]: value },
      });
    },
    pickPhoto(photo: { id: number; url: string }) {
      this.patch({
        media_asset_id: photo.id,
        media: { id: photo.id, url: photo.url },
      });
    },
  },
});
</script>
