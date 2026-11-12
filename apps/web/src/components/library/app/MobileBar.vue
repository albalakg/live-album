<template>
  <header class="mobile-bar">
    <a class="logo" :href="homeHref">SnapShare</a>
    <div class="actions">
      <router-link class="cta" to="/order">נסו בחינם</router-link>
      <button type="button" class="menu" @click="toggleMenu" :aria-label="isMenuOpen ? 'סגירה' : 'תפריט'">
        <MainIcon size="1.6em" :background="false" :icon="menuIcon" color="#161310" />
      </button>
    </div>
  </header>
</template>

<script lang="ts">
import { marketingHref } from "@/helpers/marketingUrl";
import { defineComponent } from "vue";
import MainIcon from "../general/MainIcon.vue";

export default defineComponent({
  name: "MobileBar",

  components: {
    MainIcon,
  },

  computed: {
    isMenuOpen(): boolean {
      return this.$store.getters["app/getMenuState"];
    },

    menuIcon(): string {
      return this.isMenuOpen ? "close" : "menu";
    },

    homeHref(): string {
      return marketingHref("/");
    },
  },

  methods: {
    toggleMenu() {
      this.$store.dispatch("app/toggleMenu");
    },
  },
});
</script>

<style lang="scss" scoped>
.mobile-bar {
  box-sizing: border-box;
  height: 72px;
  width: 100%;
  padding: 0 16px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(243, 238, 230, 0.96);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10000;
  border-bottom: 1px solid rgba(22, 19, 16, 0.08);
}

.logo {
  font-family: Outfit, Heebo, sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.04em;
  color: #161310;
  text-decoration: none;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cta {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  color: #fff;
  font-weight: 800;
  text-decoration: none;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.95rem;
}

.menu {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
