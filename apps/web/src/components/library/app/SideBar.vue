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
      :aria-label="collapsed ? 'פתיחת תפריט' : 'סגירת תפריט'"
      :aria-expanded="!collapsed"
      aria-controls="event-sidebar-nav"
      @click="$emit('toggle')"
    >
      <svg
        class="sidebar-toggle-ico"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <!-- panel + chevron: collapsed → points left (open); expanded → points right (close) -->
        <rect fill="none" x="3.5" y="4" width="17" height="16" rx="2.2" />
        <path fill="none" d="M9.5 4v16" />
        <path
          v-if="collapsed"
          fill="none"
          d="M15.2 9.2 12.5 12l2.7 2.8"
        />
        <path
          v-else
          fill="none"
          d="M14.8 9.2 17.5 12l-2.7 2.8"
        />
      </svg>
    </button>

    <div
      class="rail-cover"
      :class="{ 'is-empty': !hasCoverImage, 'rail-cover--sm': collapsed }"
      :style="coverStyle"
      :title="eventName || ''"
      aria-hidden="true"
    >
      <svg
        v-if="!hasCoverImage"
        class="rail-cover-ph"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      >
        <rect fill="none" x="3" y="5" width="18" height="14" rx="2" />
        <circle fill="none" cx="9" cy="10.5" r="1.6" />
        <path fill="none" d="m6.5 17 3.2-3.4 2.3 2.2 3-3.3L17.5 17" />
      </svg>
    </div>

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
      >
        <SideBarItem :item="item" :collapsed="collapsed" />
        <span v-if="collapsed" class="rail-tip">{{ item.text }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SideBarItem from "./SideBarItem.vue";

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

  computed: {
    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
    },
    hasCoverImage(): boolean {
      return Boolean(this.$store.getters["event/getEventImage"]);
    },
    coverStyle(): Record<string, string> {
      const img = this.$store.getters["event/getEventImage"] || "";
      if (!img) {
        return {};
      }
      return {
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.sidebar {
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
  padding: 12px 10px 18px;
  box-shadow: none;
  overflow: visible;
}

.sidebar--collapsed {
  align-items: center;
  padding: 12px 0 18px;
  gap: 6px;
  background: transparent;
}

.sidebar-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin: 0 auto 4px;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--muted, #5e564e);
  cursor: pointer;
  flex: none;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(22, 19, 16, 0.06);
    color: var(--ink, #161310);
  }

  &:focus-visible {
    outline: 2px solid var(--ink, #161310);
    outline-offset: 2px;
  }
}

.sidebar--expanded .sidebar-toggle {
  margin-inline-start: 0;
  margin-inline-end: auto;
}

.sidebar-toggle-ico {
  width: 22px;
  height: 22px;
  display: block;
}

.rail-cover {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--deep, #12100e) center / cover no-repeat;
  margin: 0 auto 8px;
  box-shadow: var(--shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
  flex: none;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.sidebar--expanded .rail-cover {
  width: 56px;
  height: 56px;
}

.rail-cover.is-empty {
  background: linear-gradient(145deg, #ebe4da, #f7f1e8);
  color: #8a8278;
  border: 1px solid rgba(22, 19, 16, 0.1);
  box-shadow: none;
}

.rail-cover-ph {
  width: 22px;
  height: 22px;
  display: block;
}

.sidebar-event-name {
  margin: 0 4px 10px;
  padding: 0 4px 10px;
  border-bottom: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  font-family: var(--brand, Outfit, Heebo, sans-serif);
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
  color: var(--ink, #161310);
  line-height: 1.3;
  text-align: center;
  word-break: break-word;
}

.sidebar-nav {
  flex: 1;
  min-height: 0;
  overflow-x: visible;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.sidebar--collapsed .sidebar-nav {
  overflow: visible;
  align-items: center;
  gap: 6px;
}

.side-bar-link {
  text-decoration: none;
  color: inherit;
}

.expanded-link {
  display: block;
  width: 100%;
  border-radius: 14px;
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

.rail-tip {
  position: absolute;
  /* In RTL, inline-start is the right edge; 100%+ places tip to the left of the rail */
  inset-inline-start: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: var(--deep, #12100e);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 750;
  padding: 5px 10px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 80;
  box-shadow: 0 8px 20px rgba(18, 16, 14, 0.18);
}

.rail-link:hover .rail-tip,
.rail-link:focus-visible .rail-tip,
.rail-link:focus .rail-tip {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .rail-tip {
    transition: none;
  }
}
</style>
