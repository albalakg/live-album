<template>
  <div class="order-list">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="order-item"
      :class="{ on: positionOf(item.id) > 0 }"
      :disabled="disabled"
      @click="toggle(item.id)"
    >
      <span class="order-num" aria-hidden="true">{{ positionOf(item.id) || "" }}</span>
      <span class="order-label">{{ item.label }}</span>
    </button>
    <div class="order-foot">
      <span class="order-count">{{ modelValue.length }} מתוך {{ items.length }}</span>
      <button
        type="button"
        class="order-reset"
        :disabled="disabled || !modelValue.length"
        @click="$emit('update:modelValue', [])"
      >
        התחלה מחדש
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "TriviaOrderList",

  props: {
    items: {
      type: Array as PropType<{ id: number; label: string }[]>,
      default: () => [],
    },
    /** Option ids in the order the player picked them. */
    modelValue: {
      type: Array as PropType<number[]>,
      default: () => [],
    },
    disabled: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  methods: {
    positionOf(id: number): number {
      const idx = this.modelValue.indexOf(id);
      return idx === -1 ? 0 : idx + 1;
    },

    toggle(id: number) {
      if (this.disabled) return;
      if (this.modelValue.includes(id)) {
        this.$emit(
          "update:modelValue",
          this.modelValue.filter((x) => x !== id)
        );
        return;
      }
      this.$emit("update:modelValue", [...this.modelValue, id]);
    },
  },
});
</script>

<style lang="scss" scoped>
.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--g-paper, #fff);
  border: 1.5px solid var(--g-line, rgba(22, 19, 16, 0.12));
  color: inherit;
  font-weight: 800;
  font-size: 1.05rem;
  text-align: right;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.order-item.on {
  border-color: var(--g-rose, #dc5b66);
  background: var(--g-ans-on, #fff5f5);
}

.order-item:disabled {
  opacity: 0.7;
  cursor: default;
}

.order-num {
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 900;
  border: 2px dashed var(--g-line, rgba(22, 19, 16, 0.2));
  color: #fff;
}

.order-item.on .order-num {
  border: 0;
  background: var(--g-rose, #dc5b66);
}

.order-label {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.order-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--g-muted, #5e564e);
}

.order-reset {
  background: none;
  border: 0;
  color: var(--g-rose, #dc5b66);
  font-weight: 800;
  cursor: pointer;
  padding: 6px 4px;
}

.order-reset:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
