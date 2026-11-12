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
    <div class="event-main display--flex padding--medium" v-else>
      <div class="event-sidebar" v-if="$bp.isMediumAndUp">
        <Sidebar :items="items" />
      </div>
      <div class="event-mobile-bar" v-else>
        <MobileScrollBar :items="items" />
      </div>
      <div
        class="event-content bg--gray padding--large padding--none-mobile brs--medium"
      >
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

  mounted() {
    return undefined;
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
  min-height: calc(100vh - 124px);
  height: fit-content;
  width: min(1160px, calc(100% - 32px));
  margin: 0 auto;
  position: relative;
  z-index: 11;
  gap: 20px;

  .event-sidebar {
    width: 20%;
    min-width: 250px;
  }

  .event-mobile-bar {
    width: 100%;
    position: fixed;
    bottom: 62px;
    left: 0;
    z-index: 100;
  }

  .event-content {
    width: 78%;
    margin-inline-start: 40px;
    min-width: 0;
    max-width: 100%;

    @media only screen and (max-width: 600px) {
      width: 100%;
      margin: 0 auto;
      min-height: fit-content;
    }
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
.host-empty .kicker { color: #dc5b66; font-weight: 800; }
.host-empty h1 { font-weight: 900; margin: 8px 0; }
.host-empty p { color: #5e564e; }
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
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
