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

    <div class="login-content">
      <form class="login-form display--flex direction--column justify--space-between width--full-mobile" @submit.prevent="login()">
        <h3 class="text--dark title--x-large">
          התחברות
        </h3>
        <div>
          <MainInput 
            autocomplete="email"
            v-model="form.email" 
            type="email" 
            title="כתובת מייל"
            :error="errors.email"
            :tab-index="1"
          />
          <br>
          <MainInput 
            autocomplete="password"
            v-model="form.password" 
            type="password" 
            title="סיסמה"
            :error="errors.password"
            :tab-index="2"
          />
        </div>
        <br>
        <div>
          <MainButton :loading="isLoading" text="כניסה למערכת" :tab-index="3" />
          <div class="auth-divider">
            <span>— או —</span>
          </div>
          <GoogleSignInButton :redirect="googleRedirect" />
        </div>
      </form>
      <div class="login-details">
        <div class="login-details-inner">
          <h3>SnapShare</h3>
          <h4>אין לך עדיין חשבון?</h4>
          <p>פתיחת חשבון לוקחת דקה. בלי כרטיס אשראי.</p>
          <router-link class="panel-cta" to="/signup">פתיחת חשבון</router-link>
          <p class="panel-note">
            שכחת סיסמה?
            <router-link to="/forgot-password">נאפס אותה כאן</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainCube from '@/components/library/background/MainCube.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue';
import { defineComponent } from 'vue';
import { ILoginRequest } from '@/helpers/interfaces';
import { resolvePostLoginRoute } from '@/helpers/postLoginRedirect';

export default defineComponent({
  name: 'LoginView',

  components: {
    MainInput,
    MainCube,
    MainButton,
    GoogleSignInButton,
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
    googleRedirect(): string {
      const redirect = this.$route.query.redirect;
      return typeof redirect === "string" ? redirect : "";
    },
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

      this.isLoading = false;

      if(!user) {
        return;
      }

      this.$router.push(
        resolvePostLoginRoute(user, this.$route.query, this.$store)
      );
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
  min-height: 0;
}

.login-content {
  width: min(920px, calc(100% - 48px));
  margin: 40px auto 64px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  min-height: 520px;
  background: #fff;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
  position: relative;
  z-index: 2;

  .login-form {
    width: auto;
    height: auto;
    min-height: 0;
    padding: 40px 36px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }

  .login-details {
    width: auto;
    height: auto;
    border-radius: 0;
    background: #12100e;
    color: #f7f2eb;
    padding: 36px 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-details-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    max-width: 320px;
  }

  .login-details h3,
  .login-details h4,
  .login-details p,
  .login-details a {
    color: #f7f2eb !important;
  }

  .login-details h3 {
    font-family: Outfit, Heebo, sans-serif;
    font-weight: 800;
    font-size: 2.4rem;
    letter-spacing: -0.04em;
    line-height: 1.1;
  }

  .login-details h4 {
    font-weight: 800;
    font-size: 1.35rem;
    line-height: 1.3;
  }

  .login-details p {
    color: rgba(247, 242, 235, 0.86) !important;
    font-size: 1rem;
    line-height: 1.5;
  }

  .login-details a.panel-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 6px;
    padding: 14px 28px;
    border-radius: 999px;
    background: #fff;
    color: #12100e !important;
    font-weight: 800;
    text-decoration: none;
    box-shadow: none;
  }

  .panel-note a {
    font-weight: 800;
    text-decoration: underline;
  }

  :deep(.inner-input) {
    box-shadow: none;
    border: 1.5px solid rgba(22, 19, 16, 0.14);
    border-radius: 14px;
    background: #fff;
    min-height: 52px;
    padding-top: 0;
    padding-bottom: 0;
    display: flex;
    align-items: center;
  }

  :deep(input) {
    font-size: 1.05rem;
    min-height: 52px;
    height: 52px;
    width: 100%;
    background: transparent;
  }

  @media only screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    width: min(440px, calc(100% - 32px));

    .login-form,
    .login-details {
      width: auto;
      height: auto;
      padding: 28px 22px;
    }
  }

  .login-form a {
    font-weight: 700;
    text-decoration: underline;
  }

  .auth-divider {
    margin: 16px 0;
    text-align: center;
    color: #888;
    font-size: 14px;
  }
}
</style>
