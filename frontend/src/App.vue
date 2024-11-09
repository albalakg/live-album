<template>
  <div class="app-wrapper">
    <DesktopBar />
    <div class="app-content">
      <router-view />
    </div>
    <Footer />
  </div>
</template>
<script lang="ts">
import DesktopBar from '@/components/library/app/DesktopBar.vue';
import Footer from '@/components/library/app/Footer.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',

  components: {
    DesktopBar,
    Footer,
  },

});
</script>

<style>
.app-content {
  padding-top: 99px;
}
</style>
