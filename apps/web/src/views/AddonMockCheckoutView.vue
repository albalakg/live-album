<template>
  <main class="pay-page" dir="rtl">
    <div class="pay-card">
      <p class="pay-badge">סביבת בדיקה · אין חיוב אמיתי</p>
      <p v-if="loading" class="pay-muted">טוען…</p>
      <template v-else-if="purchase">
        <h1>תשלום מאובטח</h1>
        <p class="pay-muted">דף תשלום מדומה שמחליף את PayPlus עד שיוגדרו פרטי החיבור.</p>
        <dl class="pay-summary">
          <div><dt>מוצר</dt><dd>{{ purchase.title }}</dd></div>
          <div v-if="purchase.quantity > 1"><dt>כמות</dt><dd>{{ purchase.quantity }} × ₪{{ purchase.unit_price }}</dd></div>
          <div class="total"><dt>לתשלום</dt><dd>₪{{ purchase.amount }}</dd></div>
        </dl>
        <p v-if="error" class="pay-error" role="alert">{{ error }}</p>
        <template v-if="open">
          <button class="pay-btn" type="button" :disabled="busy" @click="finish('success')">אישור תשלום (בדיקה)</button>
          <div class="pay-alt">
            <button class="pay-btn-ghost" type="button" :disabled="busy" @click="finish('failure')">הדמיית כישלון</button>
            <button class="pay-btn-ghost" type="button" :disabled="busy" @click="finish('cancel')">ביטול</button>
          </div>
        </template>
        <p v-else class="pay-muted">הרכישה הזו כבר טופלה ({{ statusLabel }}).</p>
      </template>
      <template v-else>
        <h1>הרכישה לא נמצאה</h1>
        <p class="pay-muted">{{ error }}</p>
      </template>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ADDON_STATUS_LABEL, AddonPurchase, addonsApi } from "@/helpers/addons/api";
import { msgError } from "@/helpers/messaging/labels";

export default defineComponent({
  name: "AddonMockCheckoutView",
  data() {
    return { purchase: null as AddonPurchase | null, loading: true, busy: false, error: "" };
  },
  computed: {
    uid(): string {
      return String(this.$route.query.purchase || "");
    },
    open(): boolean {
      return !!this.purchase && ["pending", "in_progress"].includes(this.purchase.status);
    },
    statusLabel(): string {
      return this.purchase ? ADDON_STATUS_LABEL[this.purchase.status] : "";
    },
  },
  async mounted() {
    try {
      this.purchase = await addonsApi.purchase(this.uid);
    } catch (e) {
      this.error = msgError(e, "הקישור לא תקין");
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async finish(outcome: "success" | "failure" | "cancel") {
      if (!this.purchase) return;
      this.busy = true;
      this.error = "";
      try {
        await addonsApi.devComplete(this.purchase.event_id, this.purchase.uid, outcome);
        this.$router.replace({ path: "/addons/return", query: { purchase: this.purchase.uid, status: outcome } });
      } catch (e) {
        this.error = msgError(e, "לא הצלחנו להשלים את התשלום המדומה");
        this.busy = false;
      }
    },
  },
});
</script>

<style scoped lang="scss">
@import "@/styles/addon-pay.scss";
</style>
