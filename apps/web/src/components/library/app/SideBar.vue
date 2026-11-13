<template>
  <div class="sidebar">
    <div class="sidebar-title">
      <p class="sidebar-kicker">האירוע של</p>
      <h2>{{ eventName || "—" }}</h2>
    </div>

    <nav class="sidebar-nav" aria-label="תפריט האירוע">
      <router-link
        v-for="(item, index) in items"
        :key="index"
        :to="item.path"
        class="side-bar-link"
      >
        <SideBarItem :item="item" />
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
  },

  computed: {
    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
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

.side-bar-link {
  text-decoration: none;
  color: inherit;
}
</style>
