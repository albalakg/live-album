<template>
  <div class="plan-page">
    <header class="page-head">
      <div>
        <h1>חבילה</h1>
        <p class="lede">המסלול של האירוע, מכסת הקבצים ותאריך התוקף. תשלום אחד לאירוע — בלי מנוי.</p>
      </div>
    </header>

    <section class="card current">
      <div class="current-head">
        <h2>החבילה הנוכחית</h2>
        <span class="plan-pill">{{ subscriptionNameLabel }}</span>
      </div>
      <div class="usage">
        <div>
          <strong>{{ totalAssets }}</strong>
          <span>קבצים מתוך {{ filesAllowedLabel }}</span>
        </div>
        <div v-if="expiryLabel">
          <strong>{{ expiryLabel }}</strong>
          <span>תוקף אחסון / מחיקה</span>
        </div>
      </div>
      <EventSubscriptionCard />
    </section>

    <section class="plans">
      <article
        v-for="plan in plans"
        :key="plan.slug"
        class="plan-card"
        :class="{ current: plan.isCurrent }"
      >
        <h3>{{ plan.title }}</h3>
        <p class="price">{{ plan.price }}</p>
        <ul>
          <li>{{ plan.files }}</li>
          <li>{{ plan.storage }}</li>
          <li>תשלום אחד לאירוע</li>
        </ul>
        <router-link
          v-if="plan.cta && canUpgrade"
          class="btn"
          :class="plan.slug === 'premium' ? 'btn-primary' : 'btn-ghost'"
          :to="`/order?subscription=${plan.slug}`"
        >
          {{ plan.cta }}
        </router-link>
        <p v-else-if="plan.isCurrent" class="current-note">המסלול של האירוע</p>
      </article>
    </section>

    <p v-if="showAddon" class="addon">
      תוספת קבצים ללא הגבלה ל־30 יום ב־50 ₪ — זמינה בסטטוס ממתין או מוכן, כשלא על פרימיום.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EventSubscriptionCard from "@/components/event/EventSubscriptionCard.vue";
import Time from "@/helpers/time";
import { StatusEnum, SubscriptionTypesEnum } from "@/helpers/enums";

export default defineComponent({
  name: "EventPlanView",

  components: { EventSubscriptionCard },

  computed: {
    totalAssets(): number {
      return Number(this.$store.getters["event/getTotalAssets"] || 0);
    },
    filesAllowedLabel(): string {
      const allowed = this.$store.getters["user/getSubscriptionFilesAllowed"];
      return allowed == null ? "—" : String(allowed);
    },
    subscriptionName(): string {
      return this.$store.getters["user/getSubscriptionName"] || "";
    },
    subscriptionNameLabel(): string {
      return this.subscriptionName || "נסיון";
    },
    expiryLabel(): string {
      const finish = this.$store.getters["event/getEventFinishTime"];
      const hours =
        Number(this.$store.getters["user/getSubscriptionFilesStorageTime"]) || 0;
      if (!finish || !hours) return "";
      const status = this.$store.getters["event/getEventStatus"];
      if (status === StatusEnum.PENDING || status === StatusEnum.READY) return "";
      return Time.addHours(finish, hours) || "";
    },
    canUpgrade(): boolean {
      const status = this.$store.getters["event/getEventStatus"];
      return (
        [StatusEnum.READY, StatusEnum.PENDING].includes(status) &&
        this.subscriptionName !== SubscriptionTypesEnum.PREMIUM
      );
    },
    showAddon(): boolean {
      return this.canUpgrade;
    },
    plans(): Array<{
      slug: string;
      title: string;
      price: string;
      files: string;
      storage: string;
      cta: string;
      isCurrent: boolean;
    }> {
      const current = String(
        this.$store.getters["user/getSubscriptionName"] || ""
      );
      const isDemo =
        current === SubscriptionTypesEnum.DEMO || current === "נסיון";
      const isClassic =
        current === SubscriptionTypesEnum.CLASSIC || current === "קלאסי";
      const isPremium =
        current === SubscriptionTypesEnum.PREMIUM || current === "פרימיום";
      return [
        {
          slug: "demo",
          title: "נסיון",
          price: "חינם",
          files: "עד 10 קבצים",
          storage: "48 שעות",
          cta: "",
          isCurrent: isDemo,
        },
        {
          slug: "classic",
          title: "קלאסי",
          price: "₪200",
          files: "עד 1,000 קבצים",
          storage: "כ־6 חודשים",
          cta: isDemo ? "שדרוג" : "",
          isCurrent: isClassic,
        },
        {
          slug: "premium",
          title: "פרימיום",
          price: "₪300",
          files: "עד 5,000 קבצים",
          storage: "כשנה",
          cta: "שדרוג",
          isCurrent: isPremium,
        },
      ];
    },
  },

  async created() {
    if (!this.$store.getters["event/getEvent"]) return;
    await this.$store.dispatch("event/getEventAssets");
  },
});
</script>

<style lang="scss" scoped>
.page-head h1 {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}
.lede {
  margin: 8px 0 0;
  color: #5e564e;
  max-width: 40em;
}
.card {
  background: #fff;
  border-radius: 26px;
  padding: 24px 28px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
  margin: 18px 0;
}
.current-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.current-head h2 {
  margin: 0;
  font-size: 1.22rem;
  font-weight: 800;
}
.plan-pill {
  background: #12100e;
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 800;
  font-size: 0.85rem;
}
.usage {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 18px 0;
}
.usage strong {
  display: block;
  font-size: 1.6rem;
  font-weight: 900;
}
.usage span {
  color: #5e564e;
}
.plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.plan-card {
  background: #fff;
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.plan-card.current {
  box-shadow: 0 0 0 3px #c9a36a, 0 8px 24px rgba(18, 16, 14, 0.08);
}
.plan-card h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 900;
}
.price {
  font-size: 2rem;
  font-weight: 900;
  margin: 8px 0 14px;
  letter-spacing: -0.04em;
}
.plan-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
  color: #5e564e;
}
.plan-card li {
  padding: 4px 0;
}
.btn {
  display: inline-flex;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 800;
  text-decoration: none;
}
.btn-primary {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  color: #fff;
}
.btn-ghost {
  background: #12100e;
  color: #fff;
}
.current-note {
  color: #1f6f6a;
  font-weight: 800;
}
.addon {
  margin-top: 18px;
  color: #5e564e;
}
@media (max-width: 900px) {
  .plans,
  .usage {
    grid-template-columns: 1fr;
  }
}
</style>
