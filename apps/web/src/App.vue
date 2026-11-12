<template>
  <notifications position="top right" />
  <HostAssist v-if="!isFullScreen" />
  <router-view v-if="isFullScreen" />
  <div class="app-wrapper" v-else>
    <template v-if="$bp.isMobile">
      <MobileBar />
      <AppMenu />
    </template>
    <DesktopBar v-else />
    <div class="app-content">
      <template v-if="loading">
        <LoadingPage />
      </template>
      <template v-else>
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </template>
    </div>
    <Footer />
  </div>
</template>
<script lang="ts">
import DesktopBar from "@/components/library/app/DesktopBar.vue";
import MobileBar from "@/components/library/app/MobileBar.vue";
import AppMenu from "@/components/library/app/AppMenu.vue";
import Footer from "@/components/library/app/Footer.vue";
import LoadingPage from "@/components/library/app/LoadingPage.vue";
import HostAssist from "@/components/library/app/HostAssist.vue";
import { defineComponent } from "vue";
import Auth from "@/helpers/Auth";

export default defineComponent({
  name: "App",

  components: {
    DesktopBar,
    MobileBar,
    AppMenu,
    Footer,
    LoadingPage,
    HostAssist,
  },

  created() {
    this.setInitialSettings();
  },

  data() {
    return {
      links: ["uploads", "full-screen"],
      loading: true,
    };
  },

  computed: {
    isFullScreen(): boolean {
      const path = this.$route.path;
      if (path.includes("/event/trivia/")) return true;
      if (path.includes("open-album") || path.includes("open-gallery")) return true;
      if (path.startsWith("/preview/")) return true;
      for (let index = 0; index < this.links.length; index++) {
        if (path.includes(this.links[index])) return true;
      }
      return false;
    },
  },

  methods: {
    async setInitialSettings() {
      try {
        if (this.$route.name !== "googleAuthCallback" && Auth.isLogged()) {
          await Promise.all([
            this.$store.dispatch("user/setUserAsLoggedIn"),
            this.$store.dispatch("user/getProfile"),
          ]);
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.app-content {
  padding-top: 99px;

  @media only screen and (max-width: 600px) {
    padding-top: 72px;
  }
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
