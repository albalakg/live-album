<template>
  <div class="sidebar" :class="{ 'sidebar--rail': rail }">
    <div v-if="!rail" class="sidebar-title">
      <p class="sidebar-kicker">האירוע של</p>
      <h2>{{ eventName || "—" }}</h2>
    </div>

    <div
      v-else
      class="rail-cover"
      :style="coverStyle"
      :title="eventName || ''"
      aria-hidden="true"
    ></div>

    <nav class="sidebar-nav" :aria-label="rail ? 'תפריט האירוע' : 'תפריט האירוע'">
      <router-link
        v-for="(item, index) in items"
        :key="index"
        :to="item.path"
        class="side-bar-link"
        :class="{ 'rail-link': rail, on: item.isActive }"
        :aria-current="item.isActive ? 'page' : undefined"
        :aria-label="rail ? item.text : undefined"
      >
        <SideBarItem :item="item" :rail="rail" />
        <span v-if="rail" class="rail-tip">{{ item.text }}</span>
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
    rail: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
    },
    coverStyle(): Record<string, string> {
      const img = this.$store.getters["event/getEventImage"] || "";
      if (!img) {
        return { background: "var(--deep, #12100e)" };
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
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  background: var(--paper, #fffcfa);
  border: 0;
  border-inline-end: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 0;
  padding: 20px 16px;
  box-shadow: none;
  overflow: hidden;
}

.sidebar--rail {
  align-items: center;
  padding: 16px 0 18px;
  gap: 6px;
  background: transparent;
  border-inline-end: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  overflow: visible;
}

.rail-cover {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--deep, #12100e) center / cover no-repeat;
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
  flex: none;
}

.sidebar-title {
  flex: none;
  text-align: center;
  margin: 0 0 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line, rgba(22, 19, 16, 0.11));
}

.sidebar-kicker {
  color: var(--muted, #5e564e);
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
}

.sidebar-title h2 {
  margin: 4px 0 0;
  font-family: var(--brand, Outfit, Heebo, sans-serif);
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.03em;
  color: var(--ink, #161310);
  line-height: 1.25;
  word-break: break-word;
}

.sidebar-nav {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar--rail .sidebar-nav {
  overflow: visible;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.side-bar-link {
  text-decoration: none;
  color: inherit;
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

.rail-link.on {
  background: var(--deep, #12100e);
  color: #fff;
}

.rail-tip {
  position: absolute;
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
  z-index: 30;
}

.rail-link:hover .rail-tip,
.rail-link:focus-visible .rail-tip {
  opacity: 1;
}
</style>
