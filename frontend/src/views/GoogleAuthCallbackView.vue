<template>
  <div class="google-auth-callback display--flex align--center justify--center">
    <p class="title--medium text--dark text--center">
      {{ loadingText }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { resolvePostLoginRoute } from "@/helpers/postLoginRedirect";

export default defineComponent({
  name: "GoogleAuthCallbackView",

  data() {
    return {
      loadingText: "מתחבר עם Google..." as string,
    };
  },

  async created() {
    const error = this.$route.query.error;

    if (error) {
      this.$notify({
        text: "ההתחברות עם Google נכשלה. נסה שוב.",
        type: "error",
        duration: 5000,
      });
      this.$router.replace("/login");
      return;
    }

    const code = this.$route.query.code;
    if (typeof code !== "string" || !code) {
      this.$notify({
        text: "קישור ההתחברות אינו תקין. נסה שוב.",
        type: "error",
        duration: 5000,
      });
      this.$router.replace("/login");
      return;
    }

    const user = await this.$store.dispatch("user/exchangeOAuthCode", { code });
    if (!user?.email) {
      this.$router.replace("/login");
      return;
    }

    await this.$store.dispatch("user/getProfile");

    this.$router.replace(
      resolvePostLoginRoute(user, this.$route.query, this.$store)
    );
  },
});
</script>

<style lang="scss" scoped>
.google-auth-callback {
  height: 100vh;
  min-height: fit-content;
}
</style>
