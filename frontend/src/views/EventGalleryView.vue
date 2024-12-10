<template>
  <div class="event-gallery height--full">
    <div class="gallery-top display--flex justify--space-between align--center">
      <div class="width--sixth">
        <router-link to="/event/gallery/full-screen">
          <MainButton text="צפה בגלרייה" class="gallery-button" />
        </router-link>
      </div>
      <span class="title--small">סה"כ {{ totalAssets }} קבצים</span>
    </div>
    <div class="gallery-content brs--medium width--full bg--dark"></div>
  </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EventGalleryView',

  components: {
    MainButton,
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
.event-gallery {}

.gallery-top {
  height: 50px;
  margin-bottom: 20px;
}

.gallery-content {
  height: calc(100% - 70px);
}
</style>
