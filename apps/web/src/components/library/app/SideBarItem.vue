<template>
  <div class="side-bar-item" :class="{ 'is-active': item.isActive }">
    <span>{{ item.text }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SideBarItem",

  props: {
    item: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.side-bar-item {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 10px 14px;
  border-radius: 999px;
  color: var(--muted, #5e564e);
  transition: background 0.15s ease, color 0.15s ease;

  span {
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
  }

  &:hover {
    color: var(--ink, #161310);
    background: rgba(22, 19, 16, 0.05);
  }

  &.is-active {
    color: var(--ink, #161310);
    background: rgba(220, 91, 102, 0.14);
    font-weight: 800;

    span {
      font-weight: 800;
    }
  }
}
</style>
