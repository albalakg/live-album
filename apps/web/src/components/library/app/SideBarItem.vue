<template>
  <div
    class="side-bar-item"
    :class="{ 'is-active': item.isActive, 'is-rail': rail }"
  >
    <span v-if="rail" class="rail-ico" aria-hidden="true" v-html="iconSvg"></span>
    <span v-else>{{ item.text }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const ICONS: Record<string, string> = {
  "/event": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>`,
  "/event/gallery": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M3 16l5-4 4 3 3-2 6 4"/></svg>`,
  "/event/upload": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V7M8 10l4-4 4 4"/><path d="M5 19h14"/></svg>`,
  "/event/qr": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM16 13h4v4h-4zM13 20h3M20 17v3"/></svg>`,
  "/event/album": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 15l4-3 3 2 3-3 6 5"/></svg>`,
  "/event/assets": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6"/></svg>`,
  "/event/plan": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg>`,
  "/event/trivia": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><path d="M9.5 10a2.5 2.5 0 1 1 4.3 1.7c-.8.8-1.8 1.2-1.8 2.3"/><circle cx="12" cy="17" r=".8" fill="currentColor"/></svg>`,
  "/event/whatsapp": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 19l1.5-4A7.5 7.5 0 1 1 12 19.5H7z"/><path d="M9 11c.5 2 2 3.5 4 4"/></svg>`,
};

export default defineComponent({
  name: "SideBarItem",

  props: {
    item: {
      type: Object,
      required: true,
    },
    rail: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    iconSvg(): string {
      const path = (this.item as { path?: string }).path || "";
      return (
        ICONS[path] ||
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="7"/></svg>`
      );
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

  &.is-rail {
    min-height: 0;
    padding: 0;
    border-radius: 0;
    background: transparent !important;
    color: inherit;

    &:hover,
    &.is-active {
      background: transparent !important;
      color: inherit;
    }
  }
}

.rail-ico {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;

  :deep(svg) {
    width: 22px;
    height: 22px;
  }
}
</style>
