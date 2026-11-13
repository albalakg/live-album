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
    <div class="event-main" :class="{ 'focus-mode': isTriviaFocus }" v-else>
      <aside class="event-sidebar" :class="{ 'is-rail': isTriviaFocus }">
        <Sidebar :items="items" :rail="isTriviaFocus" />
      </aside>
      <nav class="event-mobile-nav" aria-label="ניווט האירוע">
        <MobileScrollBar :items="items" />
      </nav>
      <div class="event-content" :class="{ 'focus-content': isTriviaFocus }">
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

export default defineComponent({
  name: "EventIndexView",

  components: {
    Sidebar,
    MobileScrollBar,
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
    isTriviaFocus(): boolean {
      return this.$route.path === "/event/trivia";
    },

    items(): IMobileScrollBarItem[] {
      const items = [
        {
          text: "פרטי האירוע",
          path: "/event",
          isActive: false,
        },
        {
          text: "אלבום חי",
          path: "/event/gallery",
          isActive: false,
        },
        {
          text: "עמוד העלאה",
          path: "/event/upload",
          isActive: false,
        },
        {
          text: "QR",
          path: "/event/qr",
          isActive: false,
        },
        {
          text: "האלבום",
          path: "/event/album",
          isActive: false,
        },
        {
          text: "כל הקבצים",
          path: "/event/assets",
          isActive: false,
        },
        {
          text: "חבילה",
          path: "/event/plan",
          isActive: false,
        },
        {
          text: "טריוויה",
          path: "/event/trivia",
          isActive: false,
        },
        ...(isWhatsAppEnabled()
          ? [
              {
                text: "WhatsApp",
                path: "/event/whatsapp",
                isActive: false,
              },
            ]
          : []),
      ];

      return items.map((item) => {
        item.isActive = item.path === this.$route.path;
        return item;
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.event-main {
  --host-sidebar: 260px;
  --host-nav: 72px;
  min-height: calc(100vh - 99px);
  width: 100%;
  max-width: none;
  margin: 0;
  position: relative;
  z-index: 11;
  display: block;
  padding-block: 24px 40px;
  padding-inline-start: calc(var(--host-sidebar) + 20px);
  padding-inline-end: 24px;
  box-sizing: border-box;
}

.event-main.focus-mode {
  --host-sidebar: 72px;
  padding-inline-start: calc(var(--host-sidebar) + 12px);
  padding-block: 12px 20px;
  background: #f3eee6;
}

.event-sidebar {
  position: fixed;
  top: var(--host-nav);
  inset-inline-start: 0;
  width: var(--host-sidebar);
  height: calc(100vh - var(--host-nav));
  z-index: 20;
  overflow: hidden;
}

.event-sidebar.is-rail {
  overflow: visible;
}

.event-mobile-nav {
  display: none;
}

.event-content {
  min-width: 0;
  width: 100%;
  background: var(--paper, #fffcfa);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 22px;
  padding: 24px;
  box-shadow: var(--shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
  box-sizing: border-box;
}

.event-content.focus-content {
  background: transparent;
  border: 0;
  box-shadow: none;
  padding: 0;
  border-radius: 0;
}

@media (max-width: 1440px) {
  .event-main:not(.focus-mode) {
    --host-sidebar: 240px;
    padding-inline-end: 20px;
  }
}

@media (max-width: 1100px) {
  .event-main:not(.focus-mode) {
    --host-sidebar: 210px;
    padding-inline-start: calc(var(--host-sidebar) + 16px);
    padding-inline-end: 16px;
  }

  .event-content:not(.focus-content) {
    padding: 20px;
  }
}

/* Focus-mode rail hides under ~820px (SPEC §6) */
@media (max-width: 820px) {
  .event-main.focus-mode {
    --host-sidebar: 0px;
    padding: 8px 12px 40px;
  }

  .event-main.focus-mode .event-sidebar {
    display: none;
  }

  .event-main.focus-mode .event-mobile-nav {
    display: block;
  }
}

@media (max-width: 900px) {
  .event-main:not(.focus-mode) {
    width: 100%;
    padding: 8px 12px 40px;
  }

  .event-main:not(.focus-mode) .event-sidebar {
    display: none;
  }

  .event-main:not(.focus-mode) .event-mobile-nav {
    display: block;
    position: sticky;
    top: calc(var(--nav, 72px) - 4px);
    z-index: 40;
    margin: 0 -4px 4px;
  }

  .event-content:not(.focus-content) {
    padding: 16px;
    border-radius: 18px;
  }
}

@media (max-width: 820px) {
  .event-main.focus-mode .event-mobile-nav {
    position: sticky;
    top: calc(var(--nav, 72px) - 4px);
    z-index: 40;
    margin: 0 -4px 4px;
  }
}

@media (max-width: 600px) {
  .event-main {
    width: 100%;
    padding: 0 0 88px;
  }

  .event-content:not(.focus-content) {
    border-radius: 0;
    border-inline: 0;
    box-shadow: none;
    padding: 14px 14px 28px;
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
