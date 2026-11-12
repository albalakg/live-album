<template>
  <div class="contact">
    <div class="contact-layout">
      <div class="contact-copy">
        <p class="kicker">צור קשר</p>
        <h1>כתבו לנו.</h1>
        <p>כל בקשה, שאלה, תלונה או טיפ יתקבלו בברכה. נחזור אליכם למייל.</p>
        <a class="mail" :href="`mailto:${email}`">{{ email }}</a>
      </div>
      <form class="contact-card" @submit.prevent="submit()">
        <MainInput type="email" v-model="form.email" title="כתובת מייל" />
        <MainInput v-model="form.full_name" title="שם מלא" />
        <MainTextArea v-model="form.text" title="טקסט חופשי" />
        <MainButton :loading="isLoading" text="פנו אלינו עכשיו" />
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import MainTextArea from '@/components/library/inputs/MainTextArea.vue';
import { BUSINESS_EMAIL_DEFAULT } from '@snapshare/design/site';
import { defineComponent } from 'vue';
import { IUserInfo } from '@/helpers/interfaces';

export default defineComponent({
  name: 'ContactView',

  components: {
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
    },
    email(): string {
      return process.env.VUE_APP_BUSINESS_EMAIL || BUSINESS_EMAIL_DEFAULT;
    },
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
  min-height: 0;
  padding: 12px 0 48px;
}
.contact-layout {
  width: min(980px, calc(100% - 40px));
  margin: 24px auto 48px;
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 36px;
  align-items: start;
}
.contact-copy .kicker {
  color: #dc5b66;
  font-weight: 800;
  margin: 0 0 8px;
}
.contact-copy h1 {
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.03em;
  margin: 0 0 12px;
}
.contact-copy p {
  color: #5e564e;
  margin: 0 0 16px;
  line-height: 1.6;
}
.mail {
  color: #161310;
  font-weight: 800;
  text-decoration: underline;
}
.contact-card {
  background: #fffcfa;
  border-radius: 28px;
  padding: 28px 24px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
@media (max-width: 800px) {
  .contact-layout {
    grid-template-columns: 1fr;
    width: min(480px, calc(100% - 32px));
    gap: 20px;
  }
}
</style>
