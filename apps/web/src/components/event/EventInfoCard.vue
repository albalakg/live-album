<template>
  <div class="event-info summary-card">
    <div class="summary-card__head">
      <span class="summary-card__label">סטטוס</span>
      <SubscriptionStatus :status="status" />
    </div>

    <div class="summary-rows">
      <template v-for="(item, index) in items" :key="index">
        <div v-if="item.isVisible" class="summary-row">
          <span>{{ item.text }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </template>
    </div>

    <div class="info-callout" v-if="showPendingCallout">
      <span class="material-symbols-outlined" aria-hidden="true">info</span>
      <p>
        האירוע לא יתחיל עד שתעדכנו את הסטטוס למוכן. ההעלאות נפתחות כ־8 שעות לפני
        שעת האירוע. ניתן לשנות תאריך רק בסטטוס ממתין.
      </p>
    </div>

    <div class="info-callout info-callout--live" v-else-if="isInProgress">
      <span class="material-symbols-outlined" aria-hidden="true">sensors</span>
      <p>האירוע חי כעת. אורחים יכולים להעלות קבצים.</p>
    </div>

    <div class="summary-actions">
      <MainButton
        v-if="isReady"
        :loading="loading"
        text="החזר להמתנה"
        @onClick="submit()"
      />
      <template v-else-if="isPending">
        <MainButton
          :disabled="!canUpdateToReady"
          :loading="loading"
          text="האירוע מוכן"
          @onClick="submit()"
        />
        <p v-if="!canUpdateToReady" class="ready-hint">
          {{ readyDisabledReason }}
        </p>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";
import SubscriptionStatus from "../profile/SubscriptionStatus.vue";
import Time from "@/helpers/time";

export default defineComponent({
  name: "EventInfoCard",

  components: {
    MainButton,
    SubscriptionStatus,
  },

  data() {
    return {
      startsAtCounter: "" as string,
      loading: false as boolean,
      intervalId: null as ReturnType<typeof setInterval> | null,
    };
  },

  computed: {
    showCountdown(): boolean {
      return (this.isPending || this.isReady) && !this.isInProgress && !this.isActive;
    },

    showPendingCallout(): boolean {
      return this.isPending || this.isReady;
    },

    items(): Array<{ text: string; value: string; isVisible: boolean }> {
      const data = [
        {
          text: "סיום האירוע",
          value: this.$store.getters["event/getEventFinishTime"],
          isVisible: this.isReady || this.isPending,
        },
        {
          text: "תאריך מחיקת הקבצים",
          value: this.disabledTime,
          isVisible: !this.isReady && !this.isPending,
        },
        {
          text: 'סה"כ קבצים',
          value: String(this.$store.getters["event/getTotalAssets"]),
          isVisible: true,
        },
      ];

      if (this.showCountdown) {
        data.splice(1, 0, {
          text: "האירוע יתחיל בעוד",
          value: this.startsAtCounter || "—",
          isVisible: true,
        });
      }

      return data;
    },

    status(): number {
      return this.$store.getters["event/getEventStatus"];
    },

    isReady(): boolean {
      return this.$store.getters["event/isEventReady"];
    },

    isActive(): boolean {
      return this.$store.getters["event/isEventActive"];
    },

    canUpdateToReady(): boolean {
      return (
        this.isPending &&
        Boolean(this.$store.getters["event/getEventName"]) &&
        Boolean(this.$store.getters["event/getEventDate"])
      );
    },

    readyDisabledReason(): string {
      const hasName = Boolean(this.$store.getters["event/getEventName"]);
      const hasDate = Boolean(this.$store.getters["event/getEventDate"]);
      if (!hasName && !hasDate) {
        return "שמרו שם ותאריך אירוע לפני סימון כמוכן";
      }
      if (!hasName) return "שמרו שם אירוע לפני סימון כמוכן";
      if (!hasDate) return "שמרו תאריך אירוע לפני סימון כמוכן";
      return "";
    },

    isPending(): boolean {
      return this.$store.getters["event/isEventPending"];
    },

    isInProgress(): boolean {
      return this.$store.getters["event/isEventInProgress"];
    },

    eventStartTime(): string {
      return this.$store.getters["event/getEventStartTime"];
    },

    disabledTime(): string {
      return this.$store.getters["event/getEventFinishTime"]
        ? Time.addHours(
            this.$store.getters["event/getEventFinishTime"],
            this.$store.getters["user/getSubscriptionFilesStorageTime"]
          )
        : "";
    },
  },

  watch: {
    eventStartTime() {
      if (!this.intervalId && this.showCountdown) {
        this.intervalId = setInterval(this.updateCounter, 1000);
      }
    },
    showCountdown(value: boolean) {
      if (!value) {
        this.clearCounter();
      } else if (!this.intervalId) {
        this.updateCounter();
        this.intervalId = setInterval(this.updateCounter, 1000);
      }
    },
  },

  methods: {
    async submit() {
      this.loading = true;
      this.isReady
        ? await this.$store.dispatch("event/setPending")
        : await this.$store.dispatch("event/setReady");
      this.loading = false;
    },

    updateCounter() {
      if (!this.eventStartTime || !this.showCountdown) {
        return;
      }

      this.startsAtCounter = Time.countdownTimer(this.eventStartTime);
      if (this.startsAtCounter === "00:00:00:00" && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        if (this.isReady) {
          this.checkForStatusUpdate();
        }
      }
    },

    clearCounter() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    async checkForStatusUpdate() {
      for (let index = 0; index < 3; index++) {
        if (this.isInProgress) {
          return;
        }
        await this.$store.dispatch("user/getProfile");
      }
    },
  },

  mounted() {
    if (this.showCountdown) {
      this.updateCounter();
      this.intervalId = setInterval(this.updateCounter, 1000);
    }
  },

  beforeUnmount() {
    this.clearCounter();
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
    text-align: start;
    direction: ltr;
    unicode-bidi: plaintext;
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
    margin-top: 1px;
  }

  p {
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.45;
  }
}

.info-callout--live {
  background: rgba(47, 190, 106, 0.1);
  border-color: rgba(47, 190, 106, 0.28);

  .material-symbols-outlined {
    color: var(--live, #2fbe6a);
  }
}

.summary-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 260px;
  margin-inline-start: auto;
  width: 100%;
}

.ready-hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted, #5e564e);
  text-align: center;
  line-height: 1.35;
}

:deep(.main-button.disabled) {
  opacity: 1;
  background: rgba(22, 19, 16, 0.08) !important;
  color: var(--muted, #5e564e) !important;
  box-shadow: none !important;
  cursor: not-allowed;
}
</style>
