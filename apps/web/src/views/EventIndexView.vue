<template>
  <div v-if="!hasEvent" class="host-empty">
    <p class="kicker">האירועים שלי</p>
    <h1>עוד אין אירוע.</h1>
    <p>הרשימה ריקה. פותחים ניסיון חינם, בלי כרטיס אשראי, או בוחרים מסלול בתשלום אחד.</p>
    <router-link class="host-empty-cta" to="/order">נסו בחינם</router-link>
  </div>
  <template v-else-if="$store.getters['event/getEvent']">
    <template v-if="isFullScreen">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </template>
    <div
      class="event-main"
      v-else
      :class="{ 'is-sidebar-collapsed': sidebarCollapsed }"
      :style="mainStyle"
    >
      <aside class="event-sidebar">
        <Sidebar
          :items="items"
          :collapsed="sidebarCollapsed"
          @toggle="toggleSidebar"
        />
      </aside>
      <nav class="event-mobile-nav" aria-label="ניווט האירוע">
        <MobileScrollBar :items="items" />
      </nav>
      <div class="event-content">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </div>
  </template>
</template>

<script lang="ts">
import Sidebar from "@/components/library/app/SideBar.vue";
import MobileScrollBar from "@/components/library/app/MobileScrollBar.vue";
import { defineComponent } from "vue";
import { isWhatsAppEnabled } from "@/helpers/features";
import { IMobileScrollBarItem } from "@/helpers/interfaces";

const SIDEBAR_STORAGE_KEY = "snapshare.sidebarCollapsed";
const SIDEBAR_EXPANDED_PX = 236;
const SIDEBAR_COLLAPSED_PX = 72;

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage?.getItem(SIDEBAR_STORAGE_KEY);
    if (raw === null || raw === undefined) return false;
    return raw === "true";
  } catch {
    return false;
  }
}

function writeSidebarCollapsed(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem(SIDEBAR_STORAGE_KEY, value ? "true" : "false");
  } catch {
    /* ignore quota / private mode */
  }
}

export default defineComponent({
  name: "EventIndexView",

  components: {
    Sidebar,
    MobileScrollBar,
  },

  data() {
    return {
      sidebarCollapsed: false as boolean,
    };
  },

  created() {
    this.sidebarCollapsed = readSidebarCollapsed();
  },

  computed: {
    hasEvent(): boolean {
      return Boolean(this.$store.getters["event/getEvent"]);
    },
    isFullScreen(): boolean {
      return (
        this.$route.path.includes("uploads") ||
        this.$route.path.includes("full-screen")
      );
    },
    pendingCount(): number {
      return (this.$store.getters["event/getPendingAssets"] || []).length;
    },
    sidebarWidthPx(): number {
      return this.sidebarCollapsed ? SIDEBAR_COLLAPSED_PX : SIDEBAR_EXPANDED_PX;
    },
    mainStyle(): Record<string, string> {
      return {
        "--host-sidebar": `${this.sidebarWidthPx}px`,
      };
    },

    items(): IMobileScrollBarItem[] {
      const pending = this.pendingCount;
      const items = [
        { text: "סקירה", path: "/event", isActive: false },
        { text: "פרטי האירוע", path: "/event/details", isActive: false },
        { text: "אלבום חי", path: "/event/gallery", isActive: false },
        { text: "עמוד העלאה", path: "/event/upload", isActive: false },
        { text: "כרטיס QR", path: "/event/qr", isActive: false },
        {
          text: "כל הקבצים",
          path: "/event/assets",
          isActive: false,
          badge: pending > 0 ? pending : undefined,
        },
        { text: "טריוויה", path: "/event/trivia", isActive: false },
        { text: "חבילה", path: "/event/plan", isActive: false },
        ...(isWhatsAppEnabled()
          ? [{ text: "WhatsApp", path: "/event/whatsapp", isActive: false }]
          : []),
      ];

      return items.map((item) => {
        if (item.path === "/event") {
          item.isActive =
            this.$route.path === "/event" || this.$route.path === "/event/";
        } else {
          item.isActive =
            this.$route.path === item.path ||
            this.$route.path.startsWith(item.path + "/");
        }
        return item;
      });
    },
  },

  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      writeSidebarCollapsed(this.sidebarCollapsed);
    },
  },
});
</script>

<style lang="scss" scoped>
.event-main {
  --host-sidebar: 236px;
  --host-nav: 72px;
  min-height: calc(100vh - 72px);
  width: 100%;
  max-width: none;
  margin: 0;
  position: relative;
  z-index: 11;
  display: block;
  padding-block: 12px 28px;
  padding-inline-start: calc(var(--host-sidebar) + 16px);
  padding-inline-end: 24px;
  box-sizing: border-box;
  background: #f3eee6;
  transition: padding-inline-start 0.2s ease;
}

.event-sidebar {
  position: fixed;
  top: var(--host-nav);
  inset-inline-start: 0;
  width: var(--host-sidebar);
  height: calc(100vh - var(--host-nav));
  z-index: 20;
  overflow: visible;
  transition: width 0.2s ease;
}

.event-mobile-nav {
  display: none;
}

.event-content {
  min-width: 0;
  width: 100%;
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 8px 16px 32px;
  box-shadow: none;
  box-sizing: border-box;
  overflow-x: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .event-main,
  .event-sidebar {
    transition: none;
  }
}

/* Mobile: keep current bottom nav; hide desktop sidebar + collapse toggle */
@media (max-width: 900px) {
  .event-main {
    width: 100%;
    padding: 8px 12px 88px;
    transition: none;
  }

  .event-sidebar {
    display: none;
  }

  .event-mobile-nav {
    display: block;
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 40;
    background: rgba(243, 238, 230, 0.94);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(22, 19, 16, 0.11);
    padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
  }
}

.host-empty {
  width: min(640px, calc(100% - 32px));
  margin: 48px auto;
  background: #fffcfa;
  border-radius: 28px;
  padding: 36px 28px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
  text-align: center;
}
.host-empty .kicker {
  color: #dc5b66;
  font-weight: 800;
}
.host-empty h1 {
  font-weight: 900;
  margin: 8px 0;
}
.host-empty p {
  color: #5e564e;
}
.host-empty-cta {
  display: inline-flex;
  margin-top: 16px;
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  color: #fff !important;
  font-weight: 800;
  text-decoration: none;
  border-radius: 999px;
  padding: 12px 22px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
