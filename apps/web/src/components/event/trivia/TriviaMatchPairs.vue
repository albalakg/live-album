<template>
  <div class="match-pairs">
    <p class="match-hint">{{ hint }}</p>
    <div class="match-cols">
      <div class="match-col">
        <button
          v-for="item in left"
          :key="item.id"
          type="button"
          class="match-item left"
          :class="{
            active: activeLeft === item.id,
            paired: rightOf(item.id) != null,
          }"
          :style="pairStyle(item.id)"
          :disabled="disabled"
          @click="selectLeft(item.id)"
        >
          <span class="match-label">{{ item.label }}</span>
          <span v-if="rightOf(item.id) != null" class="match-badge">{{ left.indexOf(item) + 1 }}</span>
        </button>
      </div>
      <div class="match-col">
        <button
          v-for="item in right"
          :key="item.id"
          type="button"
          class="match-item right"
          :class="{ paired: leftOf(item.id) != null }"
          :style="rightStyle(item.id)"
          :disabled="disabled || activeLeft == null && leftOf(item.id) == null"
          @click="selectRight(item.id)"
        >
          <span class="match-label">{{ item.label }}</span>
          <span v-if="leftOf(item.id) != null" class="match-badge">{{ leftNumber(item.id) }}</span>
        </button>
      </div>
    </div>
    <button
      type="button"
      class="match-reset"
      :disabled="disabled || !modelValue.length"
      @click="$emit('update:modelValue', [])"
    >
      התחלה מחדש
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

interface Item {
  id: number;
  label: string;
}
interface Pair {
  left_id: number;
  right_id: number;
}

const PAIR_COLORS = ["#1F6F6A", "#DC5B66", "#6E4A8A", "#E8893A", "#C9A36A", "#8B4CCF"];

export default defineComponent({
  name: "TriviaMatchPairs",

  props: {
    left: { type: Array as PropType<Item[]>, default: () => [] },
    right: { type: Array as PropType<Item[]>, default: () => [] },
    modelValue: { type: Array as PropType<Pair[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  data() {
    return { activeLeft: null as number | null };
  },

  computed: {
    hint(): string {
      if (this.activeLeft != null) return "עכשיו בחרו את הפריט המתאים מהצד השני";
      if (this.modelValue.length >= this.left.length && this.left.length) {
        return "כל הזוגות מחוברים. אפשר לשנות או לשלוח";
      }
      return "בחרו פריט מימין, ואז את הזוג שלו משמאל";
    },
  },

  methods: {
    rightOf(leftId: number): number | null {
      const row = this.modelValue.find((p) => p.left_id === leftId);
      return row ? row.right_id : null;
    },

    leftOf(rightId: number): number | null {
      const row = this.modelValue.find((p) => p.right_id === rightId);
      return row ? row.left_id : null;
    },

    leftNumber(rightId: number): number {
      const leftId = this.leftOf(rightId);
      return this.left.findIndex((l) => l.id === leftId) + 1;
    },

    colorFor(leftId: number): string {
      const idx = Math.max(0, this.left.findIndex((l) => l.id === leftId));
      return PAIR_COLORS[idx % PAIR_COLORS.length];
    },

    pairStyle(leftId: number): Record<string, string> {
      if (this.rightOf(leftId) == null) return {};
      return { borderColor: this.colorFor(leftId) };
    },

    rightStyle(rightId: number): Record<string, string> {
      const leftId = this.leftOf(rightId);
      if (leftId == null) return {};
      return { borderColor: this.colorFor(leftId) };
    },

    selectLeft(id: number) {
      if (this.disabled) return;
      this.activeLeft = this.activeLeft === id ? null : id;
    },

    selectRight(rightId: number) {
      if (this.disabled) return;
      // Tapping a paired right item with nothing selected releases the pair.
      if (this.activeLeft == null) {
        const owner = this.leftOf(rightId);
        if (owner != null) {
          this.$emit(
            "update:modelValue",
            this.modelValue.filter((p) => p.left_id !== owner)
          );
        }
        return;
      }
      const left = this.activeLeft;
      const next = this.modelValue.filter(
        (p) => p.left_id !== left && p.right_id !== rightId
      );
      next.push({ left_id: left, right_id: rightId });
      this.activeLeft = null;
      this.$emit("update:modelValue", next);
    },
  },
});
</script>

<style lang="scss" scoped>
.match-pairs {
  margin-top: 14px;
}

.match-hint {
  color: var(--g-muted, #5e564e);
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.match-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.match-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.match-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 56px;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--g-paper, #fff);
  border: 2px solid var(--g-line, rgba(22, 19, 16, 0.12));
  color: inherit;
  font-weight: 800;
  font-size: 0.98rem;
  text-align: right;
  cursor: pointer;
  min-width: 0;
}

.match-item.active {
  border-color: var(--g-gold, #c9a36a);
  box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.32);
}

.match-item:disabled {
  opacity: 0.55;
  cursor: default;
}

.match-label {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.match-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex: none;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  font-weight: 900;
  background: var(--g-ink, #161310);
  color: var(--g-paper, #fff);
}

.match-reset {
  margin-top: 10px;
  background: none;
  border: 0;
  color: var(--g-rose, #dc5b66);
  font-weight: 800;
  cursor: pointer;
  padding: 6px 4px;
}

.match-reset:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
