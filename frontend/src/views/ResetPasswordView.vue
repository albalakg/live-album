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
          איפוס סיסמה
        </h3>
        <p class="title--small text--dark">
          נאפס את הסיסמה ונעשה דאבל צ'אדק
        </p>
      </div>
      <form class="center width--half width--full-mobile margin--auto layer--one" @submit.prevent="submit()">
        <MainInput 
          v-model="form.password" 
          type="password" 
          title="סיסמה"
          :error="errors.password"
        />
        <br>
        <MainInput 
          v-model="form.password_confirmation" 
          type="password" 
          title="אימות סיסמה"
          :error="errors.password_confirmation"
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

export default defineComponent({
  name: 'ResetPasswordView',

  components: {
    MainInput,
    MainCube,
    MainLine,
    MainButton,
  },

  data() {
    return {
      form: {
        password: '' as string,
        password_confirmation: '' as string,
        email: '' as string,
        token: '' as string,
      },
      errors: {
        password: '',
        password_confirmation: ''
      },
      isLoading: false as boolean
    };
  },

  created() {
    this.form.email = this.$route.query.email?.toString() ?? '';
    this.form.token = this.$route.query.token?.toString() ?? '';
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
      const isSuccess = await this.$store.dispatch('user/resetPassword', this.form);
      this.isLoading = false;

      if(!isSuccess) {
        return;
      }

      this.$router.push('/login');
    },

    validateForm() {
      this.errors = {
        password: '',
        password_confirmation: ''
      };

      // Password validation
      if (!this.form.password) {
        this.errors.password = 'סיסמה הינה שדה חובה';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*^?]{8,40}$/.test(this.form.password)) {
        this.errors.password = 'הסיסמה חייבת להכיל 8-40 תווים, אות גדולה, אות קטנה ומספר';
      }

      // Password confirmation validation
      if (!this.form.password_confirmation) {
        this.errors.password_confirmation = 'אימות סיסמה הינו שדה חובה';
      } else if (this.form.password_confirmation !== this.form.password) {
        this.errors.password_confirmation = 'הסיסמאות אינן תואמות';
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
  height: 45%;
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
