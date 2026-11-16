<template>
  <div class="fill-tiles">
    <div class="fill-answer" :class="{ 'is-done': value.length > 0 }" aria-live="polite">
      <template v-if="value.length">
        <button
          v-for="(entry, i) in chosen"
          :key="`c-${i}`"
          type="button"
          class="fill-tile placed"
          :disabled="disabled"
          :aria-label="`הסרת האות ${entry.char}`"
          @click="removeAt(i)"
        >{{ entry.char }}</button>
      </template>
      <span v-else class="fill-placeholder">הקישו על אותיות כדי להרכיב את המילה</span>
    </div>

    <div class="fill-pool">
      <button
        v-for="tile in tiles"
        :key="tile.index"
        type="button"
        class="fill-tile"
        :class="{ used: used.includes(tile.index) }"
        :disabled="disabled || used.includes(tile.index)"
        @click="add(tile.index)"
      >{{ tile.char }}</button>
    </div>

    <div class="fill-actions">
      <button type="button" class="fill-link" :disabled="disabled || !used.length" @click="backspace">
        מחיקת אות
      </button>
      <button type="button" class="fill-link" :disabled="disabled || !used.length" @click="clear">
        ניקוי
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "TriviaFillBlankTiles",

  props: {
    /** Letters from config.letters: a string ("אהבה") or an array. */
    letters: {
      type: [String, Array] as PropType<string | string[]>,
      default: "",
    },
    /** Assembled answer (kept in sync with placed tiles). */
    modelValue: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      /** Indices into `tiles`, in placement order. */
      used: [] as number[],
    };
  },

  computed: {
    tiles(): { index: number; char: string }[] {
      const raw = Array.isArray(this.letters)
        ? this.letters.join("")
        : String(this.letters || "");
      return Array.from(raw.replace(/\s+/g, "")).map((char, index) => ({ index, char }));
    },

    chosen(): { index: number; char: string }[] {
      return this.used
        .map((i) => this.tiles[i])
        .filter((t): t is { index: number; char: string } => !!t);
    },

    value(): string {
      return this.chosen.map((t) => t.char).join("");
    },
  },

  watch: {
    letters() {
      this.used = [];
      this.$emit("update:modelValue", "");
    },
    modelValue(next: string) {
      // Parent reset (new question).
      if (!next && this.used.length) this.used = [];
    },
  },

  methods: {
    sync() {
      this.$emit("update:modelValue", this.value);
    },
    add(index: number) {
      if (this.disabled || this.used.includes(index)) return;
      this.used = [...this.used, index];
      this.sync();
    },
    removeAt(position: number) {
      if (this.disabled) return;
      this.used = this.used.filter((_, i) => i !== position);
      this.sync();
    },
    backspace() {
      if (this.disabled) return;
      this.used = this.used.slice(0, -1);
      this.sync();
    },
    clear() {
      if (this.disabled) return;
      this.used = [];
      this.sync();
    },
  },
});
</script>

<style lang="scss" scoped>
.fill-tiles {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.fill-answer {
  min-height: 74px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 18px;
  border: 2px dashed var(--g-line, rgba(22, 19, 16, 0.2));
  background: var(--g-paper, #fff);
}

.fill-answer.is-done {
  border-style: solid;
  border-color: var(--g-gold, #c9a36a);
}

.fill-placeholder {
  color: var(--g-faint, #8a8278);
  font-weight: 700;
  font-size: 0.92rem;
  text-align: center;
}

.fill-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.fill-tile {
  width: 52px;
  height: 56px;
  border-radius: 14px;
  border: 0;
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, var(--g-rose, #dc5b66), var(--g-gold, #c9a36a));
  box-shadow: 0 6px 14px rgba(220, 91, 102, 0.2);
  cursor: pointer;
  transition: transform 0.1s, opacity 0.15s;
}

.fill-tile:active:not(:disabled) {
  transform: scale(0.94);
}

.fill-tile.used {
  opacity: 0.25;
  box-shadow: none;
}

.fill-tile.placed {
  background: var(--g-ink, #161310);
  color: var(--g-paper, #fff);
  box-shadow: none;
}

.fill-tile:disabled {
  cursor: default;
}

.fill-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
}

.fill-link {
  background: none;
  border: 0;
  color: var(--g-rose, #dc5b66);
  font-weight: 800;
  cursor: pointer;
  padding: 6px 4px;
}

.fill-link:disabled {
  opacity: 0.4;
  cursor: default;
}

@media (prefers-reduced-motion: reduce) {
  .fill-tile {
    transition: none;
  }
}
</style>
