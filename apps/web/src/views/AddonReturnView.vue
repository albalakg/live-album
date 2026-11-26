<template>
  <main class="pay-page" dir="rtl">
    <div class="pay-card" role="status" aria-live="polite">
      <template v-if="state === 'waiting'">
        <span class="pay-spinner" aria-hidden="true"></span>
        <h1>מאשרים את התשלום…</h1>
        <p class="pay-muted">זה לוקח בדרך כלל כמה שניות. אפשר להשאיר את הדף פתוח.</p>
      </template>
      <template v-else-if="state === 'done' && purchase">
        <p class="pay-check" aria-hidden="true">✓</p>
        <h1>התשלום התקבל</h1>
        <p class="pay-muted">{{ purchase.title }}<span v-if="purchase.quantity > 1"> × {{ purchase.quantity }}</span> נוסף לאירוע.</p>
        <button class="pay-btn" type="button" @click="back">חזרה לאירוע</button>
      </template>
      <template v-else-if="state === 'failed'">
        <h1>{{ purchase && purchase.status === "cancelled" ? "התשלום בוטל" : "התשלום לא הושלם" }}</h1>
        <p class="pay-muted">לא חויבתם. אפשר לנסות שוב מהמסך הקודם.</p>
        <button class="pay-btn" type="button" @click="back">חזרה</button>
      </template>
      <template v-else-if="state === 'slow'">
        <h1>עדיין מחכים לאישור מחברת האשראי</h1>
        <p class="pay-muted">אם חויבתם, התוסף יתווסף אוטומטית ברגע שהאישור יגיע. אפשר לחזור לאירוע ולבדוק בעוד דקה.</p>
        <button class="pay-btn" type="button" @click="back">חזרה לאירוע</button>
      </template>
      <template v-else>
        <h1>הרכישה לא נמצאה</h1>
        <p class="pay-muted">{{ error }}</p>
        <button class="pay-btn" type="button" @click="back">חזרה</button>
      </template>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AddonPurchase, addonReturnPath, addonsApi } from "@/helpers/addons/api";
import { msgError } from "@/helpers/messaging/labels";

const POLL_MS = 2000;
const MAX_POLLS = 20;

export default defineComponent({
  name: "AddonReturnView",
  data() {
    return { purchase: null as AddonPurchase | null, state: "waiting" as "waiting" | "done" | "failed" | "slow" | "error", error: "", polls: 0, timer: 0 };
  },
  computed: {
    uid(): string {
      return String(this.$route.query.purchase || "");
    },
  },
  mounted() {
    this.poll();
  },
  beforeUnmount() {
    window.clearTimeout(this.timer);
  },
  methods: {
    async poll() {
      try {
        const p = await addonsApi.purchase(this.uid);
        this.purchase = p;
        if (p.credited) {
          this.state = "done";
          return;
        }
        if (p.status === "failed" || p.status === "cancelled") {
          this.state = "failed";
          return;
        }
      } catch (e) {
        this.error = msgError(e, "הקישור לא תקין");
        this.state = "error";
        return;
      }
      this.polls += 1;
      if (this.polls >= MAX_POLLS) {
        this.state = "slow";
        return;
      }
      this.timer = window.setTimeout(() => this.poll(), POLL_MS);
    },
    back() {
      const fallback = this.purchase?.product?.startsWith("seating") ? "/event/seating" : "/event/messaging";
      this.$router.replace(addonReturnPath(fallback));
    },
  },
});
</script>

<style scoped lang="scss">
@import "@/styles/addon-pay.scss";
</style>
