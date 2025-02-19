<template>
  <notifications position="top right" />
  <router-view v-if="isFullScreen"/>
  <div class="app-wrapper" v-else>
    <template v-if="$bp.isMobile">
      <MobileBar />
      <AppMenu />
    </template>
    <DesktopBar v-else />
    <div class="app-content">
      <router-view />
    </div>
    <Footer />
  </div>
</template>
<script lang="ts">
import DesktopBar from '@/components/library/app/DesktopBar.vue';
import MobileBar from '@/components/library/app/MobileBar.vue';
import AppMenu from '@/components/library/app/AppMenu.vue';
import Footer from '@/components/library/app/Footer.vue';
import { defineComponent } from 'vue';
import Auth from '@/helpers/Auth';

export default defineComponent({
  name: 'App',

  components: {
    DesktopBar,
    MobileBar,
    AppMenu,
    Footer,
  },

  created() {
    this.setInitialSettings();
  },
  
  data() {
    return {
      links: ['uploads', 'full-screen']
    }
  },

  computed: {
    isFullScreen(): boolean {
      for(let index = 0; index < this.links.length; index++) {
        if(this.$route.path.includes(this.links[index])) {{
          return true;
        }}
      }
      return false;
    }
  },
  
  methods: {
    async setInitialSettings() {
      if(Auth.isLogged()) {
        this.$store.dispatch('user/setUserAsLoggedIn');
        this.$store.dispatch('user/getProfile');
      }
    },
  }

});
</script>

<style lang="scss" scoped>
.app-content {
  padding-top: 99px;

  @media only screen and (max-width: 600px) { 
    padding-top: 0px;
  }
}
</style>
