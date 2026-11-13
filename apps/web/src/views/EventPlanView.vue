<template>
  <div class="plan-page">
    <header class="page-head">
      <p class="kicker">מסלול</p>
      <h1>חבילה</h1>
      <p class="lede">המסלול של האירוע, מכסת הקבצים ותאריך התוקף להורדה.</p>
    </header>

    <div class="plan-grid">
      <EventSubscriptionCard />

      <section class="summary-card usage-card">
        <div class="summary-card__head">
          <span class="summary-card__label">שימוש</span>
        </div>
        <div class="summary-rows">
          <div class="summary-row">
            <span>קבצים באירוע</span>
            <strong>{{ totalAssets }}</strong>
          </div>
          <div class="summary-row">
            <span>מכסת קבצים</span>
            <strong>{{ filesAllowedLabel }}</strong>
          </div>
          <div class="summary-row" v-if="expiryLabel">
            <span>תוקף הורדה / מחיקה</span>
            <strong>{{ expiryLabel }}</strong>
          </div>
          <div class="summary-row" v-if="finishLabel">
            <span>סיום האירוע</span>
            <strong>{{ finishLabel }}</strong>
          </div>
        </div>
        <p v-if="!totalAssets" class="empty-hint">
          עדיין אין קבצים באירוע. אחרי שהאורחים יעלו, המספר יופיע כאן.
        </p>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EventSubscriptionCard from "@/components/event/EventSubscriptionCard.vue";
import Time from "@/helpers/time";
import { StatusEnum } from "@/helpers/enums";

export default defineComponent({
  name: "EventPlanView",

  components: { EventSubscriptionCard },

  computed: {
    totalAssets(): number {
      return Number(this.$store.getters["event/getTotalAssets"] || 0);
    },

    filesAllowedLabel(): string {
      const allowed = this.$store.getters["user/getSubscriptionFilesAllowed"];
      return allowed == null ? "—" : `${allowed} קבצים`;
    },

    finishLabel(): string {
      return this.$store.getters["event/getEventFinishTime"] || "";
    },

    expiryLabel(): string {
      const finish = this.$store.getters["event/getEventFinishTime"];
      const hours =
        Number(this.$store.getters["user/getSubscriptionFilesStorageTime"]) || 0;
      if (!finish || !hours) return "";
      const status = this.$store.getters["event/getEventStatus"];
      if (status === StatusEnum.PENDING || status === StatusEnum.READY) {
        return "";
      }
      return Time.addHours(finish, hours) || "";
    },
  },

  async created() {
    if (this.$store.getters["event/getEvent"]) {
      await this.$store.dispatch("event/getEventAssets");
    }
  },
});
</script>

<style lang="scss" scoped>
.plan-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head .kicker {
  color: var(--rose, #dc5b66);
  font-weight: 800;
  margin: 0;
}

.page-head h1 {
  margin: 4px 0 0;
  font-weight: 900;
  font-size: clamp(1.55rem, 2.4vw, 2rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.lede {
  margin: 8px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.95rem;
  line-height: 1.45;
  max-width: 52ch;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 1024px) {
  .plan-grid {
    grid-template-columns: 1fr;
  }
}

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

.empty-hint {
  margin: 0;
  color: var(--muted, #5e564e);
  font-size: 0.88rem;
  line-height: 1.45;
}
</style>
