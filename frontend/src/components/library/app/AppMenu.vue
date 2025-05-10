<template>
  <transition name="slide-menu">
    <div v-if="isMenuOpen" class="mobile-menu bg--pink">
      <div class="text--left menu-header">
        <router-link to="/#header" @click="toggleMenu()">
          <span class="title--large text--white"> SnapShare </span>
        </router-link>
      </div>
      <ul class="menu-links">
        <li v-for="link in links" :key="link.url" class="menu-item">
          <router-link :to="link.url" class="menu-link" @click="toggleMenu()">
            <span>{{ link.text }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IDesktopBarItem } from "@/helpers/interfaces";

export default defineComponent({
  name: "AppMenu",

  data() {
    return {
      links: [] as IDesktopBarItem[],
    };
  },

  created() {
    this.createLinks();
  },

  watch: {
    user() {
      this.createLinks();
    },
  },

  computed: {
    isMenuOpen(): boolean {
      return this.$store.getters["app/getMenuState"];
    },

    user(): boolean {
      return this.$store.getters["user/getUser"];
    },

    hasActiveEvent(): boolean {
      return this.$store.getters["event/hasActiveEvent"];
    },
  },

  methods: {
    toggleMenu() {
      this.$store.dispatch("app/toggleMenu");
    },

    createLinks() {
      this.hasActiveEvent
        ? this.createSubscribedLinks()
        : this.createBaseLinks();
    },

    createSubscribedLinks() {
      this.links = [
        {
          text: "התנתק",
          url: "/logout",
          color: "white",
          weight: "800",
        },
        {
          text: "האירוע",
          url: "/event",
          color: "dark",
          weight: "500",
        },
        {
          text: "פרופיל",
          url: "/profile",
          color: "dark",
          weight: "500",
        },
        {
          text: "צור קשר",
          url: "/contact-us",
          color: "dark",
          weight: "500",
        },
      ];
    },

    createBaseLinks() {
      this.links = [
        {
          text: "מה מקבלים",
          url: "/#features",
          color: "dark",
          weight: "500",
        },
        {
          text: "איך זה עובד",
          url: "/#how-it-works",
          color: "dark",
          weight: "500",
        },
        {
          text: "איך זה נראה",
          url: "/#how-it-looks",
          color: "dark",
          weight: "500",
        },
        {
          text: "המסלולים",
          url: "/#pricing",
          color: "dark",
          weight: "500",
        },
        {
          text: "צור קשר",
          url: "/contact-us",
          color: "dark",
          weight: "500",
        },
        {
          text: "הזמנה",
          url: "/order",
          color: "dark",
          weight: "500",
        },
      ];

      if (this.user) {
        this.links.push({
          text: "התנתק",
          url: "/logout",
          color: "pink",
          weight: "800",
        });
        this.links.unshift({
          text: "פרופיל",
          url: "/profile",
          color: "dark",
          weight: "500",
        });
      } else {
        this.links.unshift({
          text: "התחבר",
          url: "/login",
          color: "pink",
          weight: "800",
        });
      }
    },

    formatText(icon: string): string {
      return icon.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    },
  },
});
</script>

<style lang="scss" scoped>
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 4rem);
  height: 100vh;
  min-height: fit-content;
  // background-color: white;
  z-index: 1000;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.menu-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin-bottom: 2.5rem;
}

.menu-link {
  display: flex;
  font-size: 1.3rem;
  text-decoration: none;
  color: #222;

  span {
    font-weight: bold;
    // margin: auto;
  }

  .material-symbols-outlined {
    margin-right: 0.75rem;
    font-size: 1.8rem;
  }
}

.menu-header {
    margin-bottom: 30px;
}

/* Slide-in transition */
.slide-menu-enter-active,
.slide-menu-leave-active {
  transition: transform 0.3s ease;
}
.slide-menu-enter-from,
.slide-menu-leave-to {
  transform: translateX(-100%);
}
</style>
