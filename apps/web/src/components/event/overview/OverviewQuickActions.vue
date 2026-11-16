<template>
  <section class="ov-actions" aria-labelledby="ov-actions-title">
    <div class="ov-actions__head">
      <h2 id="ov-actions-title">פעולות מהירות</h2>
    </div>
    <div class="ov-actions__grid">
      <component
        :is="item.disabled ? 'div' : 'router-link'"
        v-for="item in visible"
        :key="item.to + item.title"
        class="ov-action"
        :class="{ 'ov-action--disabled': item.disabled }"
        v-bind="item.disabled ? { role: 'link', 'aria-disabled': 'true' } : { to: item.to }"
      >
        <span class="ov-action__ico" aria-hidden="true" v-html="item.icon" />
        <strong class="ov-action__title">{{ item.title }}</strong>
        <small class="ov-action__hint">{{ item.hint }}</small>
      </component>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { OverviewQuickActionItem } from "@/helpers/overviewUiTypes";

export default defineComponent({
  name: "OverviewQuickActions",

  props: {
    items: {
      type: Array as PropType<OverviewQuickActionItem[]>,
      required: true,
    },
  },

  computed: {
    visible(): OverviewQuickActionItem[] {
      return this.items.filter((i) => !i.hidden);
    },
  },
});
</script>

<style lang="scss" scoped>
.ov-actions__head {
  margin-bottom: 12px;
}

.ov-actions__head h2 {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
}

.ov-actions__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.ov-action {
  display: block;
  min-width: 0;
  background: #fff;
  border-radius: 20px;
  padding: 18px 16px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 6px 20px rgba(18, 16, 14, 0.06);
  border: 1px solid rgba(22, 19, 16, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.ov-action:focus-visible {
  outline: 2px solid #c9a36a;
  outline-offset: 2px;
}

.ov-action__ico {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(201, 163, 106, 0.16);
  color: #161310;
  margin-bottom: 8px;
}

.ov-action__ico :deep(svg) {
  width: 20px;
  height: 20px;
  display: block;
  fill: none;
  stroke: currentColor;
}

.ov-action__ico :deep(svg [fill="currentColor"]) {
  fill: currentColor;
  stroke: none;
}

.ov-action__title {
  display: block;
  font-weight: 800;
  font-size: 0.98rem;
}

.ov-action__hint {
  display: block;
  margin-top: 4px;
  color: #5e564e;
  line-height: 1.35;
}

.ov-action--disabled {
  opacity: 0.48;
  cursor: not-allowed;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .ov-action:not(.ov-action--disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(18, 16, 14, 0.09);
  }
}

@media (max-width: 1024px) {
  .ov-actions__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .ov-actions__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .ov-action {
    padding: 14px 12px;
  }
}
</style>
