<template>
  <div class="mobile-scroll-bar" role="tablist">
    <router-link
      v-for="(item, index) in items"
      :key="index"
      :to="item.path"
      class="mobile-scroll-bar-item"
      :class="{ 'is-active': item.isActive }"
      role="tab"
      :aria-selected="item.isActive"
    >
      <span>{{ item.text }}</span>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { IMobileScrollBarItem } from "@/helpers/interfaces";

export default defineComponent({
  name: "MobileScrollBar",

  props: {
    items: {
      type: Array as PropType<IMobileScrollBarItem[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.mobile-scroll-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 100vw;
  overflow-x: auto;
  padding: 10px 12px;
  background: rgba(243, 238, 230, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.mobile-scroll-bar-item {
  flex: 0 0 auto;
  text-decoration: none;
  color: var(--muted, #5e564e);
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    color: var(--ink, #161310);
    background: rgba(22, 19, 16, 0.05);
  }

  &.is-active {
    color: var(--ink, #161310);
    background: rgba(220, 91, 102, 0.16);
    font-weight: 800;
  }
}
</style>
