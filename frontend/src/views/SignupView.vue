<template>
  <div class="signup">
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

    <div class="signup-content margin--auto shadow--small brs--x-large display--flex bg--white">
      <div class="signup-form">
        <h3 class="text--dark title--x-large text--center">
          שמחים שמצטרפים אלינו
        </h3>
        <div class="display--flex width--full justify--space-between">
          <div class="signup-form-content-side padding--large">
            <MainInput type="email" title="כתובת מייל" />
            <br>
            <MainInput type="password" title="סיסמה" />

            <div class="signup-form-bottom">
              <MainButton text="הרשמה" />
            </div>
          </div>
          <div class="signup-form-content-side padding--large">
            <MainInput title="שם פרטי" />
            <br>
            <MainInput title="שם משפחה" />

            <div class="signup-form-bottom">
              <p class="title--small text--dark text--center">
                כבר יש חשבון?
                <br>
                <router-link to="/login">לחץ כאן</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainCube from '@/components/library/background/MainCube.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SignupView',

  components: {
    MainInput,
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
.signup {
  height: 100vh;
}

.signup-content {
  position: relative;
  z-index: 2;
  width: 55%;
  min-height: fit-content;
  height: 65%;
  margin-top: 5%;
  background: linear-gradient(to right, var(--pink) 50%, white 50%);


  .signup-form {
    padding: 5% 4%;
    height: 80%;
    width: 92%;

    h3 {
      margin-bottom: 2%;
    }

    p a {
      font-weight: 700;
      text-decoration: underline;
    }

    .signup-form-content-side {
      width: 40%;
    }
    
    .signup-form-bottom {
      margin-top: 20%;
    }
  }
}
</style>
