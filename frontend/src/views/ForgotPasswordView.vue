<template>
  <div class="forgot-password">
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

    <div
      class="forgot-password-content margin--auto shadow--small brs--x-large display--flex direction--column justify--space-between bg--green">
      <MainLine top="60%" left="0" color="light-green" height="xxx-large" width="full" />
      <MainLine top="0" left="30px" color="light-green" height="full" width="large" />
      <MainLine top="0" left="55px" color="light-green" height="full" width="medium" />
      <MainLine top="0" left="70px" color="light-green" height="full" width="large" />
      <MainLine top="0" left="95px" color="light-green" height="full" width="x-large" />
      <MainLine top="0" left="140px" color="light-green" height="full" width="medium" />
      <MainLine top="0" left="155px" color="light-green" height="full" width="small" />
      <div class="text--center top layer--one">
        <h3 class="text--white title--x-large">
          שכחת סיסמה?
        </h3>
        <p class="title--small text--dark">
          אל תדאג, נעזור לך ליצור סיסמה חדש דרך המייל
        </p>
      </div>
      <form @submit.prevent="submit()" class="center width--half width--full-mobile margin--auto layer--one">
        <MainInput 
          autocomplete="email"
          v-model="form.email" 
          type="email" 
          title="כתובת מייל"
          :error="errors.email"
        />
        <br>
        <MainButton :loading="isLoading" color="pink" text="שלח בקשה" />
        <p class="text--center">
          נזכרת בסיסמה?
          <router-link to="/login">התחבר כאן</router-link>
        </p>
      </form>
      <div class="width--half margin--auto">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainCube from '@/components/library/background/MainCube.vue';
import MainLine from '@/components/library/background/MainLine.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import { defineComponent } from 'vue';
import { IForgotPasswordRequest } from '@/helpers/interfaces';

export default defineComponent({
  name: 'ForgotPasswordView',

  components: {
    MainInput,
    MainCube,
    MainLine,
    MainButton,
  },

  data() {
    return {
      form: {
        email: ''
      } as IForgotPasswordRequest,
      errors: {
        email: ''
      },
      isLoading: false as boolean
    };
  },

  methods: {
    async submit() {
      const errors = this.validateForm();   
      if(Object.values(errors).some(error => error !== '')) {
        Object.values(errors).forEach(error => {
          if(error) {
            this.$notify({
              text: error,
              type: "error",
              duration: 5000
            });
          }
        })
        return;
      }
      
      this.isLoading = true;
      const isSuccess = await this.$store.dispatch('user/forgotPassword', this.form);
      this.isLoading = false;

      if(!isSuccess) {
        return;
      }

      this.$router.push('/login');
    },

    validateForm() {
      this.errors = {
        email: ''
      };

      // Email validation
      if (!this.form.email) {
        this.errors.email = 'מייל הינו שדה חובה';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = 'כתובת אימייל לא תקינה';
      }

      return this.errors;
    }
  }
});
</script>

<style lang="scss" scoped>
.forgot-password {
  height: 100vh;
  min-height: fit-content;
  
  @media only screen and (max-width: 600px) {
    height: fit-content;
    padding: 15% 0;   
  }
}

.forgot-password-content {
  position: relative;
  z-index: 2;
  width: 35%;
  height: 40%;
  min-height: fit-content;
  margin-top: 5%;
  padding: 2% 5%;

  @media only screen and (max-width: 600px) {
    width: 80%;   
  }

  .top {
    p {
      letter-spacing: 2px;
    }
  }

  .center {
    margin-top: 15px;

    @media only screen and (max-width: 600px) {
      margin-top: 20px;
      margin-bottom: 20px;
    }

    p {
      margin-top: 15px;
    }
  }

  a {
    font-weight: 700;
    text-decoration: underline;
  }
}
</style>
