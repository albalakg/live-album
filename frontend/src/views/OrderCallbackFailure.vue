<template>
  <div class="order-callback">
    <MainCube color="pink" left="10%" top="15%" width="large" height="xx-large" />
    <MainCube left="12%" top="12%" width="xx-large" height="large" />
    <MainCube right="12%" top="12%" width="large" height="large" />
    <MainCube right="15%" top="15%" width="medium" height="medium" />
    <MainCube right="15%" top="55%" width="xx-large" height="medium" />
    <MainCube color="pink" left="24%" top="85%" width="large" height="xx-large" />
    <MainCube color="pink" left="13%" top="88%" width="xxxx-large" height="medium" />
    <MainCube left="12%" top="85%" width="medium" height="medium" />
    <MainCube left="22%" top="82%" width="large" height="large" />
    <MainCube right="0%" top="67%" width="small" height="large" />

    <div class="order-callback-content margin--auto shadow--small brs--x-large display--flex justify--center flex--wrap bg--white">
      <div class="order-callback-details width--two-thirds height--full bg--pink display--flex align--center justify--center width--full-mobile">
        <div class="text--center">
          <h3 class="text--white title--x-large">
            ההזמנה נכשלה
          </h3>
          <h4 class="title--large text--dark">
            מצטערים, על אי הנוחות
          </h4>
          <br>
          <p class="title--small text--dark">
            אפשר לפנות אלינו 
            <router-link to="/contact-us">כאן</router-link>,
            או לנסות שוב מאוחר יותר
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainCube from '@/components/library/background/MainCube.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'OrderCallbackFailure',

  components: {
    MainCube,
  },

  data() {
    return {
      
      isLoading: false as boolean
    };
  },

  computed: {
  
  },

  methods: {
  }
});
</script>

<style lang="scss" scoped>
.order-callback {
  height: 100vh;
  min-height: fit-content;
}

.order-callback-content {
  min-height: fit-content;
  position: relative;
  z-index: 2;
  width: 55%;
  height: 65%;
  margin-top: 5%;

  @media only screen and (max-width: 600px) {
    width: 90%;   
  }

  .order-callback-form {
    padding: 5% 8%;
    width: 34%;
    height: 80%;
    min-height: fit-content;

    @media only screen and (max-width: 600px) {
      height: 350px;
      width: 90%;   
      padding-bottom: 15%;
    }
  }
  
  .order-callback-details {
    height: auto;

    @media only screen and (max-width: 600px) {
      height: 330px;
    }
  }

  a {
    font-weight: 700;
    text-decoration: underline;
  }
}
</style>
