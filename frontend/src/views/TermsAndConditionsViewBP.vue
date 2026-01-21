<template>
  <div class="terms-and-conditions">
    <MainCube color="pink" left="25%" top="12%" width="large" height="xx-large" />
    <MainCube color="green" left="20%" top="15%" width="xxxx-large" height="large" />
    <MainCube color="pink" left="16%" top="72%" width="large" height="large" />
    <MainCube color="pink" left="13%" top="75%" width="large" height="large" />
    <MainCube color="green" left="15%" top="73%" width="medium" height="medium" />
    <MainCube color="green" left="75%" top="43%" width="large" height="large" />
    <MainCube color="green" left="78%" top="45%" width="medium" height="medium" />
    <MainCube color="green" right="0%" top="25%" width="small" height="xx-large" />
    <MainCube color="pink" right="0%" top="28%" width="xxx-large" height="medium" />
    <MainCube color="pink" right="12%" top="84%" width="large" height="xxx-large" />

    <div class="terms-and-conditions-content width--page-size margin--auto">
      <h2 class="text--dark title--large">
        תנאי שימוש האתר
      </h2>
      <br>
      <p class="text--dark">
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import MainCube from '@/components/library/background/MainCube.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TermsAndConditionsViewBP',

  components: {
    MainCube,
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
.terms-and-conditions {
  height: 100vh;
  min-height: fit-content;
}

.terms-and-conditions-content {
  position: relative;
  z-index: 2;
  margin-top: 5%;
}
</style>
