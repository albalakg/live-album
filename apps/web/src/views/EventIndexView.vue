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
    <div class="event-main" v-else>
      <aside class="event-sidebar">
        <Sidebar :items="items" />
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

    items(): IMobileScrollBarItem[] {
      const items = [
        {
          text: "פרטי האירוע",
          path: "/event",
          isActive: false,
        },
        {
          text: "האלבום",
          path: "/event/gallery",
          isActive: false,
        },
        {
          text: "כל הקבצים",
          path: "/event/assets",
          isActive: false,
        },
        {
          text: "בדיקת תוכן",
          path: "/event/moderation",
          isActive: false,
        },
        {
          text: "כרטיס QR",
          path: "/event/qr",
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
  --host-sidebar: 240px;
  min-height: calc(100vh - 124px);
  width: min(1160px, calc(100% - 32px));
  margin: 0 auto;
  position: relative;
  z-index: 11;
  display: grid;
  grid-template-columns: var(--host-sidebar) minmax(0, 1fr);
  gap: 20px;
  padding: 16px 0 40px;
  align-items: start;
}

.event-sidebar {
  position: sticky;
  top: calc(var(--nav, 72px) + 12px);
}

.event-mobile-nav {
  display: none;
}

.event-content {
  min-width: 0;
  background: var(--paper, #fffcfa);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 22px;
  padding: 24px;
  box-shadow: var(--shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
}

@media (max-width: 1100px) {
  .event-main {
    --host-sidebar: 210px;
    gap: 16px;
  }

  .event-content {
    padding: 20px;
  }
}

@media (max-width: 900px) {
  .event-main {
    grid-template-columns: 1fr;
    width: min(1160px, calc(100% - 24px));
    padding-top: 8px;
  }

  .event-sidebar {
    display: none;
  }

  .event-mobile-nav {
    display: block;
    position: sticky;
    top: calc(var(--nav, 72px) - 4px);
    z-index: 40;
    margin: 0 -4px 4px;
  }

  .event-content {
    padding: 16px;
    border-radius: 18px;
  }
}

@media (max-width: 600px) {
  .event-main {
    width: 100%;
    padding: 0 0 88px;
  }

  .event-content {
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
