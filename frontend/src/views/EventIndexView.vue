<template>
  <template v-if="$store.getters['event/getEvent']">
    <router-view v-if="isFullScreen"></router-view>
    <div class="event-main display--flex padding--medium" v-else>
      <div class="event-sidebar">
        <Sidebar />
      </div>
      <div class="event-content bg--gray padding--large brs--medium">
        <router-view></router-view>
      </div>
    </div>
  </template>
</template>

<script lang="ts">
import Sidebar from '@/components/library/app/SideBar.vue';
import { IEvent } from '@/helpers/interfaces';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EventIndexView',

  components: {
    Sidebar,
  },

  computed: {
    isFullScreen(): boolean {
      return this.$route.path.includes('uploads') || this.$route.path.includes('full-screen');
    }
  },

  methods: {
    getEventDetails() {
      if(this.$store.getters["event/getEvent"]) {
        return;
      }

      this.$store.dispatch("event/getEventBaseInfo")
    }
  }
});
</script>

<style lang="scss" scoped>
.event-main {
  height: calc(100vh - 124px);
  width: calc(100% - 24px);

  .event-sidebar {
    width: 20%;
    min-width: 250px;
  }

  .event-content {
    width: 78%;
    margin-inline-start: 40px;
  }
}
</style>
