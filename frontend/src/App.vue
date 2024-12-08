<template>
  <div class="app-wrapper">
    <DesktopBar />
    <div class="app-content">
      <router-view />
    </div>
    <Footer v-if="!isFullScreen" />
  </div>
</template>
<script lang="ts">
import DesktopBar from '@/components/library/app/DesktopBar.vue';
import Footer from '@/components/library/app/Footer.vue';
import { defineComponent } from 'vue';
import Auth from '@/helpers/Auth';

export default defineComponent({
  name: 'App',

  components: {
    DesktopBar,
    Footer,
  },

  created() {
    this.setInitialSettings();
  },

  computed: {
    isFullScreen(): boolean {
      return this.$route.path.includes('uploads') || this.$route.path.includes('full-screen');
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

<style>
.app-content {
  padding-top: 99px;
}
</style>
