<template>
  <div class="signup">
    <MainCube
      color="pink"
      left="10%"
      top="15%"
      width="large"
      height="xx-large"
    />
    <MainCube left="12%" top="12%" width="xx-large" height="large" />
    <MainCube right="12%" top="12%" width="large" height="large" />
    <MainCube right="15%" top="15%" width="medium" height="medium" />
    <MainCube right="15%" top="55%" width="xx-large" height="medium" />
    <MainCube
      color="pink"
      left="24%"
      top="85%"
      width="large"
      height="xx-large"
    />
    <MainCube
      color="pink"
      left="13%"
      top="88%"
      width="xxxx-large"
      height="medium"
    />
    <MainCube left="12%" top="85%" width="medium" height="medium" />
    <MainCube left="22%" top="82%" width="large" height="large" />
    <MainCube right="0%" top="67%" width="small" height="large" />

    <div
      class="signup-content margin--auto shadow--small brs--x-large display--flex bg--white"
    >
      <div class="signup-form">
        <h3 class="text--dark title--x-large text--center">
          שמחים שמצטרפים אלינו
        </h3>
        <form
          class="display--flex flex--wrap width--full justify--space-between"
          @submit.prevent="signup()"
        >
          <template v-if="$bp.isMobile">
            <div class="width--full padding--large">
              <MainInput autocomplete="email" v-model="form.email" type="email" title="כתובת מייל" />
              <br />
              <MainInput
                v-model="form.password"
                type="password"
                title="סיסמה"
              />
              <br />
              <MainInput autocomplete="first_name" v-model="form.first_name" title="שם פרטי" />
              <br />
              <MainInput autocomplete="last_name" v-model="form.last_name" title="שם משפחה" />
              <div class="signup-form-bottom">
                <MainButton :loading="isLoading" text="הרשמה" />
              </div>
              <div class="signup-form-bottom">
                <p class="title--medium text--dark text--center">
                  כבר יש חשבון?
                  <br />
                  <router-link to="/login">לחץ כאן</router-link>
                </p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="signup-form-content-side padding--large">
              <MainInput v-model="form.email" type="email" title="כתובת מייל" />
              <br />
              <MainInput
                v-model="form.password"
                type="password"
                title="סיסמה"
              />

              <div class="signup-form-bottom">
                <MainButton :loading="isLoading" text="הרשמה" />
              </div>
            </div>
            <div class="signup-form-content-side padding--large">
              <MainInput v-model="form.first_name" title="שם פרטי" />
              <br />
              <MainInput v-model="form.last_name" title="שם משפחה" />

              <div class="signup-form-bottom">
                <p class="title--small text--dark text--center">
                  כבר יש חשבון?
                  <br />
                  <router-link to="/login">לחץ כאן</router-link>
                </p>
              </div>
            </div>
          </template>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from "@/components/library/buttons/MainButton.vue";
import MainCube from "@/components/library/background/MainCube.vue";
import MainInput from "@/components/library/inputs/MainInput.vue";
import { defineComponent } from "vue";
import { ISignupRequest } from "@/helpers/interfaces";
import ErrorsHandler from "@/helpers/errorsHandler";

export default defineComponent({
  name: "SignupView",

  components: {
    MainInput,
    MainCube,
    MainButton,
  },

  data() {
    return {
      form: {
        email: "",
        password: "",
        first_name: "",
        last_name: "",
      } as ISignupRequest,
      errors: {
        email: "",
        password: "",
        first_name: "",
        last_name: "",
      },
      isLoading: false as boolean,
    };
  },

  methods: {
    async signup() {
      const errors = this.validateForm();
      if (Object.values(errors).some((error) => error !== "")) {
        Object.values(errors).forEach((error) => {
          if (error) {
            this.$notify({
              text: error,
              type: "error",
              duration: 5000,
            });
          }
        });
        return;
      }

      this.isLoading = true;
      const isSuccess = await this.$store.dispatch("user/signup", this.form);
      this.isLoading = false;

      if (!isSuccess) {
        return;
      }

      this.$router.push("/login");
    },

    validateForm() {
      this.errors = {
        email: "",
        password: "",
        first_name: "",
        last_name: "",
      };

      // Email validation
      if (!this.form.email) {
        this.errors.email = "מייל הינו שדה חובה";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = "כתובת אימייל לא תקינה";
      }

      // Password validation
      if (!this.form.password) {
        this.errors.password = "סיסמה הינה שדה חובה";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*^?]{8,40}$/.test(
          this.form.password
        )
      ) {
        this.errors.password =
          "הסיסמה חייבת להכיל 8-40 תווים, אות גדולה, אות קטנה ומספר";
      }

      // First Name validation
      if (!this.form.first_name) {
        this.errors.first_name = "שם פרטי הינו שדה חובה";
      } else if (!/^.{0,100}$/.test(this.form.last_name)) {
        this.errors.first_name = "השם פרטי הוא עד 100 תווים";
      }

      // Last Name validation
      if (!this.form.last_name) {
        this.errors.last_name = "שם משפחה הינו שדה חובה";
      } else if (!/^.{0,100}$/.test(this.form.last_name)) {
        this.errors.last_name = "השם משפחה הוא עד 100 תווים";
      }

      return this.errors;
    },
  },
});
</script>

<style lang="scss" scoped>
.signup {
  height: 100vh;
  min-height: fit-content;
}

.signup-content {
  position: relative;
  z-index: 2;
  width: 55%;
  min-height: fit-content;
  height: 65%;
  margin-top: 5%;
  background: linear-gradient(to right, var(--pink) 50%, white 50%);

  @media only screen and (max-width: 600px) {
    width: 90%;
  }

  .signup-form {
    padding: 5% 4%;
    height: 80%;
    width: 92%;
    min-height: fit-content;

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
