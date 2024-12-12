<template>
  <router-view v-if="isFullScreen"/>
  <div class="app-wrapper" v-else>
    <DesktopBar />
    <div class="app-content">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script lang="ts">
import DesktopBar from './components/library/app/DesktopBar.vue';
import Footer from './components/library/app/Footer.vue';
import { defineComponent } from 'vue';
import Auth from './helpers/Auth';

export default defineComponent({
  name: 'App',

  components: {
    DesktopBar,
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
        if(this.$route.path.includes(this.links[index])) {
          return true;
        }
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

<style>
.app-wrapper {
  direction: inherit;
}

.app-content {
  padding-top: 99px;
  direction: inherit;
}
</style>
