<template>
  <div class="sidebar">
    <div
      class="event-image"
      :class="{ 'event-image--empty': !eventImage }"
      :style="coverStyle"
      role="img"
      :aria-label="eventImage ? 'תמונת האירוע' : 'אין תמונת אירוע'"
    >
      <div v-if="!eventImage" class="event-image__placeholder">
        <span class="material-symbols-outlined" aria-hidden="true">photo_camera</span>
        <span>תמונת אירוע</span>
      </div>
    </div>

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
    eventImage(): string {
      return this.$store.getters["event/getEventImage"] || "";
    },

    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
    },

    coverStyle(): Record<string, string> {
      if (!this.eventImage) return {};
      return { backgroundImage: `url(${this.eventImage})` };
    },
  },
});
</script>

<style lang="scss" scoped>
.sidebar {
  background: var(--paper, #fffcfa);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 22px;
  padding: 16px;
  box-shadow: var(--shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
}

.event-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  background-position: center;
  background-size: cover;
  background-color: #1c1814;
  overflow: hidden;
}

.event-image--empty {
  background:
    radial-gradient(circle at 28% 18%, rgba(220, 91, 102, 0.42), transparent 52%),
    radial-gradient(circle at 82% 78%, rgba(201, 163, 106, 0.48), transparent 48%),
    linear-gradient(155deg, #2a221c 0%, #3a2f28 48%, #1c1814 100%);
  border: 1px solid rgba(201, 163, 106, 0.28);
}

.event-image__placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 252, 250, 0.88);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 8px rgba(18, 16, 14, 0.35);
}

.event-image__placeholder .material-symbols-outlined {
  font-size: 1.75rem;
  opacity: 0.9;
}

.sidebar-title {
  text-align: center;
  margin: 16px 0 14px;
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
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-bar-link {
  text-decoration: none;
  color: inherit;
}
</style>
