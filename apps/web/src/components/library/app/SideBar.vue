<template>
  <div
    class="sidebar"
    :class="{
      'sidebar--collapsed': collapsed,
      'sidebar--expanded': !collapsed,
    }"
  >
    <button
      type="button"
      class="sidebar-toggle"
      :title="toggleLabel"
      :aria-label="toggleLabel"
      :aria-expanded="!collapsed"
      aria-controls="event-sidebar-nav"
      @click="$emit('toggle')"
    >
      <svg
        class="sidebar-toggle-ico"
        :class="{ 'sidebar-toggle-ico--collapsed': collapsed }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <!-- Expanded: points into the rail / right (close). Collapsed: flips left (open). -->
        <path fill="none" d="M9.5 7.5 14 12l-4.5 4.5" />
      </svg>
    </button>

    <p v-if="!collapsed && eventName" class="sidebar-event-name">{{ eventName }}</p>

    <nav
      id="event-sidebar-nav"
      class="sidebar-nav"
      aria-label="תפריט האירוע"
    >
      <router-link
        v-for="(item, index) in items"
        :key="index"
        :to="item.path"
        class="side-bar-link"
        :class="{
          'rail-link': collapsed,
          'expanded-link': !collapsed,
          on: item.isActive,
        }"
        :aria-current="item.isActive ? 'page' : undefined"
        :aria-label="collapsed ? item.text : undefined"
        @mouseenter="collapsed && showRailTip($event, item.text)"
        @mouseleave="hideRailTip"
        @focus="collapsed && showRailTip($event, item.text)"
        @blur="hideRailTip"
      >
        <SideBarItem :item="item" :collapsed="collapsed" />
      </router-link>
    </nav>

    <Teleport to="body">
      <div
        v-if="collapsed && tip.visible"
        class="rail-tip-portal"
        :style="tipStyle"
        role="tooltip"
      >
        {{ tip.text }}
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SideBarItem from "./SideBarItem.vue";

const TIP_GAP_PX = 8;

export default defineComponent({
  name: "SideBar",

  components: {
    SideBarItem,
  },

  props: {
    items: {
      type: Array,
      required: true,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["toggle"],

  data() {
    return {
      tip: {
        visible: false,
        text: "",
        top: 0,
        left: 0,
        isRtl: true,
        overRail: true,
      },
    };
  },

  computed: {
    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
    },
    toggleLabel(): string {
      return this.collapsed ? "פתיחת תפריט" : "סגירת תפריט";
    },
    tipStyle(): Record<string, string> {
      // Default: tip toward content. overRail flips it into the rail column
      // (outside page text) while keeping an ~8px gap from the item.
      const towardContent = this.tip.isRtl
        ? "translate(-100%, -50%)"
        : "translate(0, -50%)";
      const towardRail = this.tip.isRtl
        ? "translate(0, -50%)"
        : "translate(-100%, -50%)";
      return {
        top: `${this.tip.top}px`,
        left: `${this.tip.left}px`,
        transform: this.tip.overRail ? towardRail : towardContent,
      };
    },
  },

  watch: {
    collapsed(value: boolean) {
      if (!value) this.hideRailTip();
    },
  },

  beforeUnmount() {
    this.hideRailTip();
  },

  methods: {
    showRailTip(event: Event, text: string) {
      const el = event.currentTarget as HTMLElement | null;
      if (!el || !text) return;
      const rect = el.getBoundingClientRect();
      const isRtl =
        typeof document !== "undefined" &&
        (document.documentElement.dir === "rtl" ||
          getComputedStyle(document.documentElement).direction === "rtl");

      // Side tip with ~8px gap, kept inside the sidebar/gutter (not over page text).
      // RTL: tip to the left of the item but shifted to stay over the rail column.
      const left = isRtl ? rect.left - TIP_GAP_PX : rect.right + TIP_GAP_PX;

      this.tip = {
        visible: true,
        text,
        top: rect.top + rect.height / 2,
        left,
        isRtl,
        overRail: false,
      };
    },

    hideRailTip() {
      this.tip.visible = false;
      this.tip.text = "";
    },
  },
});
</script>

<style lang="scss" scoped>
.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  background: var(--paper, #fffcfa);
  border: 0;
  border-inline-end: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 0;
  padding: 14px 10px 18px;
  box-shadow: none;
  overflow: visible;
}

.sidebar--collapsed {
  align-items: center;
  padding: 14px 0 18px;
  gap: 6px;
  background: transparent;
}

/* Floating circular control on the content-facing edge (inline-end).
   Half over the border; never consumes a rail row. Below rail tips (10050)
   and WhatsApp assist (80) via stacking context of .event-sidebar (20). */
.sidebar-toggle {
  position: absolute;
  inset-inline-end: -14px;
  top: 32%;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 1px solid rgba(22, 19, 16, 0.12);
  border-radius: 50%;
  background: #fff;
  color: var(--ink, #161310);
  cursor: pointer;
  flex: none;
  box-shadow: 0 2px 8px rgba(18, 16, 14, 0.12);
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease,
    color 0.15s ease, background 0.15s ease;
}

.sidebar-toggle:hover {
  transform: scale(1.08);
  border-color: rgba(22, 19, 16, 0.28);
  box-shadow: 0 3px 10px rgba(18, 16, 14, 0.16);
  color: #0c0b09;
}

.sidebar-toggle:focus-visible {
  outline: 2px solid var(--ink, #161310);
  outline-offset: 2px;
}

.sidebar-toggle-ico {
  width: 14px;
  height: 14px;
  display: block;
  transition: transform 0.18s ease;
}

/* Expanded chevron points into the rail (inline-start). Collapsed flips toward content. */
.sidebar-toggle-ico--collapsed {
  transform: scaleX(-1);
}

.sidebar-event-name {
  margin: 0 0 12px;
  padding: 0 4px;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--ink, #161310);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  overflow: auto;
  overflow-x: visible;
  flex: 1 1 auto;
  padding: 0;
  margin: 0;
}

.sidebar--collapsed .sidebar-nav {
  align-items: center;
  overflow: visible;
}

.side-bar-link {
  text-decoration: none;
  color: inherit;
}

.expanded-link {
  display: block;
  width: 100%;
  border-radius: 14px;
  color: inherit;
}

.expanded-link.on {
  color: #fff;
}

.expanded-link.on :deep(.item-label),
.expanded-link.on :deep(.rail-ico) {
  color: #fff;
}

.expanded-link:focus-visible {
  outline: 2px solid var(--ink, #161310);
  outline-offset: 2px;
}

.rail-link {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: var(--muted, #5e564e);
  transition: background 0.15s, color 0.15s;
  flex: none;
  overflow: visible;
}

.rail-link:hover {
  background: rgba(22, 19, 16, 0.06);
  color: var(--ink, #161310);
}

.rail-link:focus-visible {
  outline: 2px solid var(--ink, #161310);
  outline-offset: 2px;
}

.rail-link.on {
  background: var(--deep, #12100e);
  color: #fff;

  :deep(.rail-ico),
  :deep(.rail-ico svg),
  :deep(.rail-ico svg *) {
    color: #fff;
  }

  :deep(.rail-ico svg) {
    stroke: #fff;
  }

  :deep(.rail-ico svg [fill="currentColor"]) {
    fill: #fff;
    stroke: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-toggle,
  .sidebar-toggle-ico {
    transition: none;
  }
}
</style>

<style lang="scss">
/* Teleported to body — above page content, not clipped by overflow */
.rail-tip-portal {
  position: fixed;
  z-index: 10050;
  background: var(--deep, #12100e);
  color: #fff;
  font-family: var(--font, Heebo, sans-serif);
  font-size: 0.78rem;
  font-weight: 750;
  padding: 5px 10px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 8px 20px rgba(18, 16, 14, 0.18);
}
</style>
