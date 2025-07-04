<template>
  <div class="contact">
    <MainLine color="light-green" top="250px" width="full" height="x-large" />
    <MainLine color="green" top="300px" width="full" height="large" />
    <MainLine color="light-green" top="335px" width="full" height="medium" />
    <MainLine color="green" top="350px" width="full" height="xx-large" />
    <MainLine color="light-green" top="430px" width="full" height="medium" />
    <MainLine color="green" top="455px" width="full" height="large" />
    <MainLine color="light-green" top="485px" width="full" height="x-large" />


    <MainCube color="pink" left="27%" top="72%" width="small" height="small" />
    <MainCube color="pink" left="23%" top="73%" width="medium" height="medium" />
    <MainCube color="pink" left="26%" top="76%" width="large" height="large" />
    <MainCube color="green" left="30%" top="13%" width="large" height="xxx-large" />
    <MainCube color="pink" left="10%" top="8%" width="medium" height="x-large" />
    <MainCube color="green" left="11%" top="13%" width="medium" height="medium" />
    <MainCube color="green" left="5%" top="10%" width="large" height="large" />
    <MainCube color="green" right="0" top="22%" width="xx-large" height="medium" />
    <MainCube color="pink" right="32%" top="80%" width="xx-large" height="large" />
    <MainCube color="green" right="31%" top="84%" width="medium" height="xxx-large" />

    <div class="contact-content width--corner width--80-mobile bg--pink margin--auto brs--medium padding--medium shadow--small">
      <h2 class="text--center text--white title--large">צרו איתנו קשר</h2>
      <p class="text--center title--small">
        כל בקשה, הארה, תלונה או טיפ יתקבלו בברכה
      </p>
      <div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
      <form @submit.prevent="submit()" class="contact-form display--flex justify--space-between direction--column">
        <div class="contact-body">
          <MainInput type="email" v-model="form.email" title="כתובת מייל" />
          <br>
          <MainInput v-model="form.full_name" title="שם מלא" />
          <br>
          <MainTextArea v-model="form.text" title="טקסט חופשי" />
        </div>
        <div class="contact-bottom">
          <MainButton :loading="isLoading" text="פנו אלינו עכשיו" />
        </div>
      </form>
      <div class="bottom-background bg--white"></div>
    </div>
  </div>
</template>

<script lang="ts">
import MainCube from '@/components/library/background/MainCube.vue';
import MainLine from '@/components/library/background/MainLine.vue';
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import MainTextArea from '@/components/library/inputs/MainTextArea.vue';
import { defineComponent } from 'vue';
import { IUserInfo } from '@/helpers/interfaces';

export default defineComponent({
  name: 'ContactView',

  components: {
    MainCube,
    MainLine,
    MainInput,
    MainTextArea,
    MainButton,
  },

  data() {
    return {
      form: {
        email: '' as string,
        full_name: '' as string,
        text: '' as string,
      },
      errors: {
        email: '' as string,
        full_name: '' as string,
        text: '' as string,
      },
      isLoading: false as boolean
    };
  },

  mounted() {
    this.setUser();
  },

  watch: {
    user() {
      this.setUser()
    }
  },

  computed: {
    user(): IUserInfo | null {
      return this.$store.getters['user/getUser'];
    }
  },

  methods: {
    setUser() {
      if (!this.$store.getters['user/isLoggedIn']) {
        return;
      }

      this.form.email = this.$store.getters['user/getEmail'] ?? '';
      this.form.full_name = this.$store.getters['user/getFullName'] ?? '';
    },

    async submit() {
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
      const isSuccess = await this.$store.dispatch('contact/send', this.form);
      this.isLoading = false;

      if (!isSuccess) {
        return;
      }

      this.$router.push('/home');
    },

    validateForm() {
      this.errors = {
        email: "",
        full_name: "",
        text: "",
      };

      // Email validation
      if (!this.form.email) {
        this.errors.email = "מייל הינו שדה חובה";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = "כתובת אימייל לא תקינה";
      }

      // First Name validation
      if (!this.form.full_name) {
        this.errors.full_name = "שם מלא הינו שדה חובה";
      } else if (!/^.{0,100}$/.test(this.form.full_name)) {
        this.errors.full_name = "השם מלא הוא עד 100 תווים";
      }

      // Last Name validation
      if (!this.form.text) {
        this.errors.text = "שם משפחה הינו שדה חובה";
      } else if (!/^.{0,1000}$/.test(this.form.text)) {
        this.errors.text = "השם משפחה הוא עד 1000 תווים";
      }

      return this.errors;
    }
  }
});
</script>

<style lang="scss" scoped>
.contact {
  height: 100vh;
  min-height: fit-content;

  .contact-content {
    min-height: 520px;
    position: relative;
    max-width: 400px;
    top: 5%;

    .contact-form {
      position: relative;
      z-index: 1;
      min-height: fit-content;
      height: calc(100% - 80px);
      margin: 10px;

      .contact-body {
        padding-bottom: 20px;
      }

      .contact-bottom {
        margin-top: 50px;
      }
    }

    .bottom-background {
      width: 100%;
      height: 19%;
      position: absolute;
      bottom: 0;
      right: 0;
      border-radius: 0 0 12px 12px;
    }

    h2 {
      margin-top: 10px;
    }
  }
}
</style>
