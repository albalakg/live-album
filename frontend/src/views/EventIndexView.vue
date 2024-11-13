<template>
  <div class="event-main display--flex padding--medium">
    <div class="event-sidebar">
      <Sidebar />
    </div>
    <div class="event-content bg--gray padding--large brs--medium">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import Sidebar from '@/components/library/app/SideBar.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EventIndexView',

  components: {
    Sidebar,
  },

  data() {
    return {
    };
  },

  methods: {

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
