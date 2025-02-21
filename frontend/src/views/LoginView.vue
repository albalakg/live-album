<template>
  <div class="login">
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

    <div class="login-content margin--auto shadow--small brs--x-large display--flex flex--wrap bg--white">
      <form class="login-form display--flex direction--column justify--space-between width--full-mobile" @submit.prevent="login()">
        <h3 class="text--dark title--x-large">
          התחברות
        </h3>
        <div>
          <MainInput 
            v-model="form.email" 
            type="email" 
            title="כתובת מייל"
            :error="errors.email" 
          />
          <br>
          <MainInput 
            v-model="form.password" 
            type="password" 
            title="סיסמה"
            :error="errors.password"
          />
        </div>
        <div>
          <MainButton :loading="isLoading" text="כניסה למערכת" />
        </div>
      </form>
      <div class="login-details width--half height--full bg--pink display--flex align--center justify--center width--full-mobile">
        <div class="text--center">
          <h3 class="text--white title--x-large">
            SnapShare
          </h3>
          <br>
          <h4 class="title--large text--dark">
            אין לך עדיין חשבון?
          </h4>
          <br>
          <p class="title--small text--dark">
            <span>
              <router-link to="/signup">לחץ כאן</router-link>
            </span> לפתיחת חשבון
          </p>
          <small>
            שכחת סיסמה?
            <router-link to="/forgot-password">נאפס אותה כאן</router-link>
          </small>
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
import { ILoginRequest } from '@/helpers/interfaces';

export default defineComponent({
  name: 'LoginView',

  components: {
    MainInput,
    MainCube,
    MainButton,
  },

  data() {
    return {
      form: {
        email: '',
        password: '',
      } as ILoginRequest,
      errors: {
        email: '',
        password: '',
      },
      isLoading: false as boolean
    };
  },

  computed: {
    hasEvent(): boolean {
      return (this.$store.getters["event/getEvent"])
    }
  },

  methods: {
    async login() {
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
      const user = await this.$store.dispatch('user/login', this.form);
      if(user?.email) {
        await this.$store.dispatch('user/getProfile');
      }

      if(!user) {
        return;
      }

      if(this.$route.query.redirect) {
        this.$router.push(this.$route.query.redirect.toString());
        return;
      }

      if(user.subscription_name && hasEvent) {
        this.$router.push('/event');
      } else {
        this.$router.push('/');
      }

      this.isLoading = false;
    },

    validateForm() {
      this.errors = {
        email: '',
        password: '',
      };

      // Email validation
      if (!this.form.email) {
        this.errors.email = 'מייל הינו שדה חובה';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = 'כתובת אימייל לא תקינה';
      }

      // Password validation
      if (!this.form.password) {
        this.errors.password = 'סיסמה הינה שדה חובה';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*^?]{8,40}$/.test(this.form.password)) {
        this.errors.password = 'הסיסמה חייבת להכיל 8-40 תווים, אות גדולה, אות קטנה ומספר';
      }

      return this.errors;
    }
  }
});
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  min-height: fit-content;
}

.login-content {
  min-height: fit-content;
  position: relative;
  z-index: 2;
  width: 55%;
  height: 65%;
  margin-top: 5%;

  @media only screen and (max-width: 600px) {
    width: 90%;   
  }

  .login-form {
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
  
  .login-details {
    border-radius: 40px 0 0 40px;
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
