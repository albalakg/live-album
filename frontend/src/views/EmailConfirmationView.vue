<template>
  <div class="email-confirmation">
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

    <div class="email-confirmation-content text--center">
      <h2 class="title--x-large text--green">
        ברוכים הבאים ל &nbsp;<strong class="text--pink">SnapShare</strong>
      </h2>
      <br>
      <h3 class="title--medium text--dark">
        תודה שאימתתם את המייל
        <br>
        ועכשיו הגיע הזמן להזמין ולהכין את האירוע
      </h3>
      <br>
      <div class="width--corner margin--auto">
        <router-link to="/order">
          <MainButton text="הזמן עכשיו" animation />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainCube from '@/components/library/background/MainCube.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EmailConfirmation',

  components: {
    MainCube,
    MainButton,
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
.email-confirmation {
  height: 100vh;
}

.email-confirmation-content {
  position: relative;
  z-index: 2;
  top: 30%;
}
</style>
