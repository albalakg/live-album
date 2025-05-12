<template>
  <div class="event-gallery">
    <div class="gallery-top display--flex justify--space-between align--center">
      <div class="width--sixth width--full-mobile">
        <router-link to="/event/gallery/full-screen">
          <MainButton text="צפה בגלרייה" class="gallery-button" />
        </router-link>
      </div>
      <span v-if="$bp.isMediumAndUp" class="title--small">סה"כ {{ totalAssets }} קבצים</span>
    </div>
    <div class="gallery-content brs--medium width--full bg--dark">
      <EventGallery rounded hideMenu />
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import EventGallery from '@/components/event/EventGallery.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EventGalleryView',

  components: {
    MainButton,
    EventGallery,
  },

  data() {
    return {
    };
  },

  computed: {
    totalAssets(): number {
      return this.$store.getters['event/getTotalAssets']
    }
  },

  methods: {
   
  }
});
</script>

<style lang="scss" scoped>
.event-gallery {
  height: 60vh;

  @media only screen and (max-width: 600px) { 
    // height: 100%;
    margin: 10px;
    min-height: fit-content;
  }
}

.gallery-top {
  height: 50px;
  margin-bottom: 20px;
}

.gallery-content {
  height: 100%;
  min-height: fit-content;
}
</style>
