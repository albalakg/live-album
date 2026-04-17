<template>
  <div class="subscription-payment-redirect" aria-hidden="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

/** Legacy `/order/pay` — checkout iframe lives on `/order`. */
export default defineComponent({
  name: "SubscriptionPaymentView",

  async mounted() {
    const sub = this.$route.query.subscription;
    await this.$router.replace({
      path: "/order",
      query:
        sub !== undefined && sub !== null && String(sub) !== ""
          ? { subscription: String(sub) }
          : {},
    });
  },
});
</script>

<style lang="scss" scoped>
.subscription-payment-redirect {
  min-height: 40vh;
}
</style>
