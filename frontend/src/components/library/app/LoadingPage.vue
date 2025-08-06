<template>
  <div class="loading-screen">
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
      class="loading-screen-box text--center text margin--auto shadow--small brs--x-large display--flex justify--center align--center bg--green">
    <h1 class="text--white title--x-large">טוען... כבר מסיים</h1>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainCube from '@/components/library/background/MainCube.vue';
 
export default defineComponent({
  name: 'LoadingPage',

  components: {
    MainCube,
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
.loading-screen {
  height: 100vh;
  min-height: fit-content;

  @media only screen and (max-width: 600px) {
    height: fit-content;
    padding: 15% 0;   
  }
}

.loading-screen-box {
  position: relative;
  z-index: 2;
  width: 35%;
  height: 25%;
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
