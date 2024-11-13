<template>
  <div class="gallery bg--dark">
    <div class="gallery-header bg--white display--flex justify--space-between align--center">
      <div>
        <strong>
          מסך מלא
        </strong>
      </div>
      <div>
        <h1 class="title--large text--pink" >
          החתונה של עמית וגל
        </h1>
      </div>
      <div>
        <strong class="pointer">
          יציאה
        </strong>
      </div>
    </div>
    <div class="gallery-content"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GalleryView',
  
  components: {
  
  },

  data() {
    return {
    };
  },

  computed: {
   
  },

  methods: {
 
  }
});
</script>

<style lang="scss" scoped>

.gallery {
  position: absolute;
  z-index: 1000;
  top: 0;
  height: 100vh;
  width: 100vw;

  .gallery-header {
    position: absolute;
    width: calc(100% - 60px);
    top: 0;
    height: 70px;
    padding: 0 30px;
  }
}

</style>
