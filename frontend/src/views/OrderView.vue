<template>
  <div class="order">
    <MainCube color="pink" left="20%" top="12%" width="large" height="xx-large" />
    <MainCube color="green" left="10%" top="15%" width="xxxx-large" height="large" />
    <MainCube color="green" left="14%" top="83%" width="medium" height="medium" />
    <MainCube color="green" left="15%" top="85%" width="large" height="large" />
    <MainCube color="green" left="75%" top="43%" width="large" height="large" />
    <MainCube color="green" left="78%" top="45%" width="medium" height="medium" />
    <MainCube color="green" right="0%" top="25%" width="small" height="xx-large" />
    <MainCube color="pink" right="0%" top="28%" width="xxx-large" height="medium" />
    <MainCube color="pink" right="12%" top="84%" width="xxx-large" height="large" />
    <MainCube color="green" right="10%" top="88%" width="large" height="xxx-large" />

    <MainLine color="light-green" left="600px" width="xx-large" height="full" />
    <MainLine color="light-green" left="665px" width="small" height="full" />
    <MainLine color="light-green" left="675px" width="medium" height="full" />
    <MainLine color="light-green" left="690px" width="small" height="full" />
    <MainLine color="light-green" left="700px" width="xxx-large" height="full" />
    <MainLine color="light-green" left="795px" width="small" height="full" />
    <MainLine color="light-green" left="805px" width="medium" height="full" />
    <MainLine color="light-green" left="820px" width="small" height="full" />
    <MainLine color="light-green" left="830px" width="xx-large" height="full" />

    <div class="order-content height--full display--flex justify--space-around margin--auto">
      <div class="order-info shadow--small brs--medium bg--pink padding--small">
        <div
          class="order-info-content bg--light-pink brs--small display--flex direction--column justify--space-between">
          <div>
            <h2 class="title--large text--white">
              הזמנת אלבום לאירוע
            </h2>
            <MainLine color="white" right="15px" width="xxx-large" height="x-small" />
            <p class="text--dark">
              אלבום דיגיטלי חי בזמן האירוע
              <br>
              כל קבצי האלבום להורדה 
              <br>
              כרטיס הזמנה עם QR המוביל לעמוד ייחודי להעלאת הקבצים
            </p>
          </div>
          <div class="display--flex justify--space-between order-info-actions">
            <div class="width--half padding--medium">
              <BaseButton text="בסיסי" color="white" text-color="dark" />
            </div>
            <div class="width--half padding--medium">
              <BaseButton text="פרימיום" />
            </div>
          </div>
        </div>
      </div>
      <div class="order-details shadow--small brs--medium bg--white width--corner padding--large position--relative display--flex direction--column justify--space-between">
        <div>
          <h3 class="text--center title--large">
            סיכום הזמנה
          </h3>
          <br>
          <div class="display--flex justify--space-between">
            <span class="title--small text--dark">מחיר ההזמנה</span>
            <span class="title--small text--dark">₪170</span>
          </div>
          <br>
          <div class="separator bg--dark"></div>
        </div>
        <div>
          <MainButton text="לתשלום" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BaseButton from '@/components/library/buttons/BaseButton.vue';
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainCube from '@/components/library/background/MainCube.vue';
import MainLine from '@/components/library/background/MainLine.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'OrderView',

  components: {
    MainCube,
    MainLine,
    BaseButton,
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
.order {
  height: 100vh;

  .line-height-full {
    height: 130vh;
  }
}

.order-content {
  position: relative;
  z-index: 2;
  top: 15%;
  width: 75%;

  .order-info {
    width: 40%;
    height: calc(40% - 16px);

    .order-info-content {
      width: calc(97% - 30px);
      height: calc(96% - 30px);
      padding: 15px;
      position: relative;
      top: 2%;
      margin: auto;

      .title--large {
        font-size: 2.6em;
        margin-bottom: 10px;
      }

      p {
        margin-top: 30px;
      }

      .order-info-actions {
        margin-top: 10px;
      }
    }
  }

  .order-details {
    height: calc(40% - 40px);
    width: 20%;

    .separator {
      height: 2px;
      width: 100%;
      margin: auto;
      margin-top: 10px;
      opacity: .7;
    }
  }
}
</style>
