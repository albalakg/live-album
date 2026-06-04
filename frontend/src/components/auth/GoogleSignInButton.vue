<template>
  <button
    type="button"
    class="google-sign-in-button pointer shadow--small brs--medium display--flex align--center justify--center"
    @click="signInWithGoogle()"
  >
    <svg class="google-sign-in-button__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
    <span class="title--medium text--dark">המשך עם Google</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "GoogleSignInButton",

  props: {
    redirect: {
      type: String,
      default: "",
    },
  },

  methods: {
    signInWithGoogle() {
      const params = new URLSearchParams();
      params.set(
        "redirect",
        `${process.env.VUE_APP_BASE_URL}/auth/google/callback/`
      );

      if (this.redirect) {
        params.set("post_login_redirect", this.redirect);
      }

      window.location.href = `${process.env.VUE_APP_SERVER_BASE_URL}/api/auth/google/redirect?${params.toString()}`;
    },
  },
});
</script>

<style lang="scss" scoped>
.google-sign-in-button {
  width: 100%;
  gap: 10px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #dadce0;
  transition: background 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: #f8f9fa;
    box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
  }

  &__icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
}
</style>
