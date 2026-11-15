<template>
  <div class="lbl" dir="rtl">
    <h3 class="lbl-title">סעיפים</h3>
    <ul class="lbl-list">
      <li
        v-for="b in sorted"
        :key="b.id"
        class="lbl-row"
        :class="{ on: b.id === selectedId, off: !b.enabled }"
      >
        <button
          type="button"
          class="lbl-main"
          :aria-current="b.id === selectedId ? 'true' : undefined"
          @click="$emit('select', b.id)"
        >
          <span class="lbl-name">{{ labelFor(b) }}</span>
          <span v-if="isLocked(b.type)" class="lbl-lock" :title="lockTip" aria-label="נעול">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4V7z"
              />
            </svg>
          </span>
        </button>

        <div class="lbl-actions">
          <button
            type="button"
            class="lbl-ico"
            :disabled="isLocked(b.type) || !canMove(b, -1)"
            aria-label="העלאה למעלה"
            @click="$emit('move', b.id, -1)"
          >↑</button>
          <button
            type="button"
            class="lbl-ico"
            :disabled="isLocked(b.type) || !canMove(b, 1)"
            aria-label="הורדה למטה"
            @click="$emit('move', b.id, 1)"
          >↓</button>
          <label class="lbl-switch" :title="isLocked(b.type) ? lockTip : ''">
            <input
              type="checkbox"
              :checked="b.enabled"
              :disabled="isLocked(b.type)"
              :aria-label="`הפעלת ${labelFor(b)}`"
              @change="$emit('toggle', b.id, ($event.target as HTMLInputElement).checked)"
            />
            <span />
          </label>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import type { HubBlock } from "../types";
import { blockTypeLabel, LOCKED_BLOCK_TYPES } from "./blockLabels";
import { navLabelsForTemplate } from "../templates/registry";

export default defineComponent({
  name: "LandingBlockList",
  props: {
    blocks: { type: Array as PropType<HubBlock[]>, required: true },
    selectedId: { type: String, default: "" },
    templateId: { type: String, required: true },
  },
  emits: ["select", "toggle", "move"],
  setup(props) {
    const lockTip = "סעיף זה תמיד פעיל";
    const sorted = computed(() =>
      [...props.blocks].sort((a, b) => a.order - b.order)
    );
    const navMap = computed(() => {
      const map = new Map<string, string>();
      for (const n of navLabelsForTemplate(props.templateId)) {
        map.set(n.id, n.label);
      }
      return map;
    });

    function isLocked(type: string) {
      return LOCKED_BLOCK_TYPES.has(type);
    }

    function labelFor(b: HubBlock) {
      return navMap.value.get(b.id) || blockTypeLabel(b.type);
    }

    function canMove(b: HubBlock, dir: -1 | 1) {
      const list = sorted.value;
      const idx = list.findIndex((x) => x.id === b.id);
      const target = idx + dir;
      if (target < 0 || target >= list.length) return false;
      if (isLocked(list[target].type)) return false;
      if (list[0]?.type === "HERO_COUNTDOWN" && (idx === 0 || target === 0)) return false;
      const last = list.length - 1;
      if (list[last]?.type === "FOOTER" && (idx === last || target === last)) return false;
      return true;
    }

    return { sorted, lockTip, isLocked, labelFor, canMove };
  },
});
</script>

<style lang="scss" scoped>
.lbl-title {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 900;
}
.lbl-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}
.lbl-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(22, 19, 16, 0.08);
  padding: 4px 6px 4px 8px;
}
.lbl-row.on {
  border-color: rgba(220, 91, 102, 0.45);
  box-shadow: 0 0 0 2px rgba(220, 91, 102, 0.12);
}
.lbl-row.off .lbl-name {
  opacity: 0.55;
}
.lbl-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  text-align: start;
  cursor: pointer;
  font-family: inherit;
  padding: 8px 6px;
}
.lbl-name {
  font-weight: 700;
  font-size: 0.92rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lbl-lock {
  color: #8a8278;
  display: inline-flex;
}
.lbl-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.lbl-ico {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: rgba(22, 19, 16, 0.05);
  cursor: pointer;
  font-family: inherit;
}
.lbl-ico:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.lbl-switch {
  position: relative;
  width: 36px;
  height: 22px;
  display: inline-block;
  margin-inline-start: 4px;
}
.lbl-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.lbl-switch span {
  position: absolute;
  inset: 0;
  background: rgba(22, 19, 16, 0.18);
  border-radius: 999px;
  transition: 0.15s ease;
  cursor: pointer;
}
.lbl-switch span::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  top: 3px;
  inset-inline-start: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.15s ease;
}
.lbl-switch input:checked + span {
  background: #c9a36a;
}
.lbl-switch input:checked + span::after {
  inset-inline-start: 17px;
}
.lbl-switch input:disabled + span {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
