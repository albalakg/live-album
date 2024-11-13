<template>
  <div class="event-gallery height--full">
    <div class="gallery-top display--flex justify--space-between align--center">
      <MainButton @clicked="goToGallery()" text="צפה בגלרייה" class="gallery-button width--sixth" />
      <span class="title--small">סה"כ 30 קבצים</span>
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
    // event()
  },

  methods: {
    goToGallery() {
      this.$router.push('/gallery/1')
    }
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
