<template>
  <template v-if="$store.getters['event/getEvent']">
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
      <div class="event-content bg--gray padding--large padding--none-mobile brs--medium">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </div>
  </template>
</template>

<script lang="ts">
import Sidebar from '@/components/library/app/SideBar.vue';
import MobileScrollBar from '@/components/library/app/MobileScrollBar.vue';
import { defineComponent } from 'vue';
import { IMobileScrollBarItem } from '@/helpers/interfaces';

export default defineComponent({
  name: 'EventIndexView',

  components: {
    Sidebar,
    MobileScrollBar,
  },

  mounted() {
    if(!this.$store.getters['event/hasActiveEvent']) {
      this.$router.push({ name: 'home' });
    }
  },

  computed: {
    isFullScreen(): boolean {
      return this.$route.path.includes('uploads') || this.$route.path.includes('full-screen');
    },

    items(): IMobileScrollBarItem[] {
      const items = [
        {
            text: 'פרטי האירוע',
            path: '/event',
            isActive: false,
        },
        {
            text: 'האלבום',
            path: '/event/gallery',
            isActive: false,
        },
        {
            text: 'כל הקבצים',
            path: '/event/assets',
            isActive: false,
        },
        {
            text: 'כרטיס QR',
            path: '/event/qr',
            isActive: false,
        },
      ];

      return items.map(item => {
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
  width: calc(100% - 24px);
  position: relative;
  z-index: 11;

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

    @media only screen and (max-width: 600px) { 
      width: 100%;
      margin: 0 auto;
      min-height: fit-content;
    }
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
