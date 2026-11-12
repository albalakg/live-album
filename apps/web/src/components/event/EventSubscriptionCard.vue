<template>
  <div class="event-subscription-card summary-card">
    <div class="summary-card__head">
      <span class="summary-card__label">חבילה</span>
      <span class="plan-pill">{{ subscriptionNameLabel }}</span>
    </div>

    <div class="summary-rows">
      <div class="summary-row" v-for="(item, index) in items" :key="index">
        <span>{{ item.text }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <div class="info-callout" v-if="canUpgradeSubscription">
      <span class="material-symbols-outlined" aria-hidden="true">workspace_premium</span>
      <p>
        שדרוג זמין בסטטוס ממתין בלבד. 50₪ לתוספת קבצים ללא הגבלה ונשארים ל־30 יום.
      </p>
    </div>

    <div class="summary-actions" v-if="canUpgradeSubscription">
      <router-link :to="'/order?subscription=' + subscriptionUpgradeName">
        <MainButton text="שדרגו חבילה" />
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";
import { StatusEnum, SubscriptionTypesEnum } from "@/helpers/enums";

export default defineComponent({
  name: "EventSubscriptionCard",

  components: {
    MainButton,
  },

  computed: {
    items(): Array<{ text: string; value: string }> {
      return [
        {
          text: "כמות קבצים",
          value: this.$store.getters["user/getSubscriptionFilesAllowed"] + " קבצים",
        },
        {
          text: "זמן הורדת הקבצים",
          value: this.formattedStorageTime,
        },
      ];
    },

    subscriptionNameLabel(): string {
      return this.$store.getters["user/getSubscriptionName"] || "—";
    },

    formattedStorageTime(): string {
      const hours =
        Number(this.$store.getters["user/getSubscriptionFilesStorageTime"]) || 0;
      const days = Math.floor(hours / 24);

      if (days >= 30) {
        const months = Math.floor(days / 30);
        if (months === 1) return "חודש";
        if (months === 2) return "חודשיים";
        return `${months} חודשים`;
      }

      if (days >= 7) {
        const weeks = Math.floor(days / 7);
        if (weeks === 1) return "שבוע";
        if (weeks === 2) return "שבועיים";
        return `${weeks} שבועות`;
      }

      if (days === 1) return "יום";
      if (days === 2) return "יומיים";
      return `${days} ימים`;
    },

    subscriptionUpgradeName(): string {
      return this.userIsDemo ? "classic" : "premium";
    },

    userIsDemo(): boolean {
      return SubscriptionTypesEnum.DEMO === this.subscriptionName;
    },

    eventStatus(): number {
      return this.$store.getters["event/getEventStatus"];
    },

    subscriptionName(): string {
      return this.$store.getters["user/getSubscriptionName"];
    },

    userIsPremium(): boolean {
      return SubscriptionTypesEnum.PREMIUM === this.subscriptionName;
    },

    canUpgradeSubscription(): boolean {
      return (
        [StatusEnum.READY, StatusEnum.PENDING].includes(this.eventStatus) &&
        !this.userIsPremium
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.summary-card {
  background: #fffcfa;
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
}

.summary-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-card__label {
  font-weight: 800;
  font-size: 0.95rem;
}

.plan-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  background: rgba(201, 163, 106, 0.16);
  color: #8a7040;
  font-weight: 800;
  font-size: 0.82rem;
  text-transform: capitalize;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  font-size: 0.92rem;
  color: var(--muted, #5e564e);

  strong {
    color: var(--ink, #161310);
    font-weight: 700;
  }
}

.info-callout {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: rgba(201, 163, 106, 0.12);
  border: 1px solid rgba(201, 163, 106, 0.28);
  border-radius: 14px;
  padding: 10px 12px;
  color: var(--muted, #5e564e);

  .material-symbols-outlined {
    color: #8a7040;
    font-size: 1.2rem;
    flex: none;
  }

  p {
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.45;
  }
}

.summary-actions {
  margin-top: auto;
  max-width: 260px;
  margin-inline-start: auto;
  width: 100%;
}

.summary-actions a {
  text-decoration: none;
}
</style>
