<template>
  <div
    class="side-bar-item"
    :class="{
      'is-active': item.isActive,
      'is-rail': collapsed,
      'is-expanded': !collapsed,
    }"
  >
    <span class="rail-ico" aria-hidden="true" v-html="iconSvg"></span>
    <span v-if="!collapsed" class="item-label">{{ item.text }}</span>
    <span v-if="item.badge" class="rail-badge">{{ item.badge }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/** Stroke-only rail icons (match event-tabs mock). Explicit fill="none" on shapes. */
const ICONS: Record<string, string> = {
  "/event": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path fill="none" d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>`,
  "/event/details": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="5" y="3.5" width="14" height="17" rx="2.5"/><path fill="none" d="M8 8h8M8 12h8M8 16h5"/></svg>`,
  "/event/gallery": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="3" y="5" width="18" height="12" rx="2"/><path fill="none" d="M8 21h8M12 17v4"/></svg>`,
  "/event/upload": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect fill="none" x="7" y="2.5" width="10" height="19" rx="2.5"/><path fill="none" d="M11 18.5h2"/></svg>`,
  "/event/moderation": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path fill="none" d="M12 3 5 6v5c0 5 3.2 8.6 7 10 3.8-1.4 7-5 7-10V6z"/><path fill="none" d="M9.5 12.2 11.2 14l3.5-4"/></svg>`,
  "/event/qr": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect fill="none" x="4" y="4" width="7" height="7" rx="1.2"/><rect fill="none" x="13" y="4" width="7" height="7" rx="1.2"/><rect fill="none" x="4" y="13" width="7" height="7" rx="1.2"/><path d="M14 14h2v2h-2zm3 0h3v3h-2v2h-3v-3h2z" fill="currentColor" stroke="none"/></svg>`,
  "/event/album": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect fill="none" x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect fill="none" x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect fill="none" x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect fill="none" x="13.5" y="13.5" width="7" height="7" rx="1.4"/></svg>`,
  "/event/assets": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect fill="none" x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect fill="none" x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect fill="none" x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect fill="none" x="13.5" y="13.5" width="7" height="7" rx="1.4"/></svg>`,
  "/event/plan": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path fill="none" d="M4 9.5h16v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5z"/><path fill="none" d="M8 9.5V6.8A4 4 0 0 1 12 3a4 4 0 0 1 4 3.8v2.7"/></svg>`,
  /* Lucide message-circle-question style */
  "/event/trivia": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path fill="none" d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path fill="none" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path fill="none" d="M12 17h.01"/></svg>`,
  "/event/whatsapp": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path fill="none" d="M5 19l1.5-4A7.5 7.5 0 1 1 12 19.5H7z"/><path fill="none" d="M9 11c.5 2 2 3.5 4 4"/></svg>`,
};

export default defineComponent({
  name: "SideBarItem",

  props: {
    item: {
      type: Object,
      required: true,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    iconSvg(): string {
      const path = (this.item as { path?: string }).path || "";
      return (
        ICONS[path] ||
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle fill="none" cx="12" cy="12" r="7"/></svg>`
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.side-bar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 10px 14px;
  border-radius: 999px;
  color: var(--muted, #5e564e);
  transition: background 0.15s ease, color 0.15s ease;
  position: relative;

  .item-label {
    font-weight: 600;
    font-size: 0.92rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    color: var(--ink, #161310);
    background: rgba(22, 19, 16, 0.05);
  }

  &.is-active {
    color: var(--ink, #161310);
    background: rgba(220, 91, 102, 0.14);
    font-weight: 800;

    .item-label {
      font-weight: 800;
    }
  }

  &.is-rail {
    min-height: 0;
    padding: 0;
    gap: 0;
    border-radius: 0;
    background: transparent !important;
    color: inherit;

    &:hover,
    &.is-active {
      background: transparent !important;
      color: inherit;
    }
  }

  &.is-expanded {
    width: 100%;
    box-sizing: border-box;
    border-radius: 14px;
    padding: 10px 12px;
    min-height: 44px;
  }

  &.is-expanded.is-active {
    background: var(--deep, #12100e);
    color: #fff;

    .rail-ico,
    .rail-ico :deep(svg),
    .rail-ico :deep(svg *) {
      color: #fff;
    }

    .rail-ico :deep(svg) {
      stroke: #fff;
    }

    .rail-ico :deep(svg [fill="currentColor"]) {
      fill: #fff;
      stroke: none;
    }
  }
}

.rail-ico {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: none;
  color: inherit;

  :deep(svg) {
    width: 22px;
    height: 22px;
    display: block;
    color: inherit;
    fill: none;
    stroke: currentColor;
  }

  :deep(svg *) {
    color: inherit;
  }

  :deep(svg [fill="none"]) {
    fill: none;
  }

  :deep(svg [fill="currentColor"]) {
    fill: currentColor;
    stroke: none;
  }
}

.rail-badge {
  position: absolute;
  top: -2px;
  inset-inline-end: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc5b66;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.is-expanded .rail-badge {
  top: 6px;
  inset-inline-end: 8px;
}
</style>
