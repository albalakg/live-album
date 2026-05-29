<template>
  <section class="whatsapp-panel bg--white brs--medium padding--large">
    <h2 class="title--large margin--bottom-medium">היסטוריית שליחות</h2>

    <div
      v-if="!campaigns.length"
      class="empty-state text--center padding--large"
    >
      <MainIcon icon="history" size="2.5em" class="empty-icon" />

      <p>אין שליחות קודמות</p>

      <small>הודעות שתשלחו יופיעו כאן עם סטטוס מפורט</small>
    </div>

    <div v-else class="history-list">
      <article
        v-for="campaign in sortedCampaigns"
        :key="campaign.id"
        class="history-card brs--medium"
      >
        <header
          class="history-card__header display--flex justify--space-between align--center flex--wrap"
        >
          <div>
            <WhatsAppCampaignStatus :status="campaign.status" pill />

            <span class="history-card__date">{{ formatDate(campaign) }}</span>
          </div>

          <div class="history-card__stats display--flex">
            <span class="stat-chip">{{ campaign.recipient_count }} נמענים</span>

            <span v-if="campaign.sent_count" class="stat-chip stat-chip--green">
              {{ campaign.sent_count }} נשלחו
            </span>

            <span
              v-if="campaign.failed_count"
              class="stat-chip stat-chip--pink"
            >
              {{ campaign.failed_count }} נכשלו
            </span>
          </div>
        </header>

        <div class="history-card__preview">
          <div class="whatsapp-bubble">{{ campaign.message }}</div>
        </div>

        <footer class="history-card__actions display--flex">
          <BaseButton
            text="פרטים"
            size="x-small"
            color="dark"
            @onClick="openDetail(campaign.id)"
          />

          <BaseButton
            v-if="canCancel(campaign.status)"
            text="ביטול"
            size="x-small"
            color="pink"
            :loading="cancellingId === campaign.id"
            @onClick="cancelCampaign(campaign.id)"
          />
        </footer>
      </article>
    </div>

    <WhatsAppCampaignDetailModal :open="detailOpen" @close="closeDetail" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseButton from "@/components/library/buttons/BaseButton.vue";

import MainIcon from "@/components/library/general/MainIcon.vue";

import WhatsAppCampaignStatus from "./WhatsAppCampaignStatus.vue";

import WhatsAppCampaignDetailModal from "./WhatsAppCampaignDetailModal.vue";

import Time from "@/helpers/time";

import { IWhatsAppCampaign } from "@/helpers/interfaces";

import { WhatsAppCampaignStatusEnum } from "@/helpers/enums";

export default defineComponent({
  name: "WhatsAppHistoryPanel",

  components: {
    BaseButton,

    MainIcon,

    WhatsAppCampaignStatus,

    WhatsAppCampaignDetailModal,
  },

  data() {
    return {
      detailOpen: false,

      cancellingId: null as number | null,
    };
  },

  computed: {
    campaigns(): IWhatsAppCampaign[] {
      return this.$store.getters["whatsapp/getCampaigns"];
    },

    sortedCampaigns(): IWhatsAppCampaign[] {
      return [...this.campaigns].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    },
  },

  methods: {
    formatDate(campaign: IWhatsAppCampaign): string {
      const dateStr =
        campaign.sent_at || campaign.scheduled_at || campaign.created_at;

      return dateStr ? Time.convertToLocalTime(dateStr) : "—";
    },

    canCancel(status: WhatsAppCampaignStatusEnum): boolean {
      return (
        status === WhatsAppCampaignStatusEnum.PENDING ||
        status === WhatsAppCampaignStatusEnum.SCHEDULED
      );
    },

    async openDetail(campaignId: number) {
      await this.$store.dispatch("whatsapp/fetchCampaignDetail", campaignId);

      this.detailOpen = true;
    },

    closeDetail() {
      this.detailOpen = false;
    },

    async cancelCampaign(campaignId: number) {
      if (!window.confirm("לבטל את השליחה המתוזמנת?")) return;

      this.cancellingId = campaignId;

      await this.$store.dispatch("whatsapp/cancelCampaign", campaignId);

      this.cancellingId = null;
    },
  },
});
</script>

<style lang="scss" scoped>
.whatsapp-panel {
  margin-bottom: 24px;
  max-width: 100%;
  min-width: 0;
  overflow-x: clip;
}

.empty-state {
  color: var(--dark-gray);

  .empty-icon {
    opacity: 0.4;

    margin-bottom: 8px;
  }

  small {
    display: block;

    margin-top: 4px;
  }
}

.history-list {
  display: flex;

  flex-direction: column;

  gap: 12px;
}

.history-card {
  border: 1px solid #eee;

  padding: 14px 16px;

  background: #fafafa;
}

.history-card__header {
  gap: 8px;

  margin-bottom: 10px;
}

.history-card__date {
  font-size: 0.85em;

  color: var(--dark-gray);

  margin-right: 8px;
}

.history-card__stats {
  gap: 6px;

  flex-wrap: wrap;
}

.stat-chip {
  padding: 2px 8px;

  border-radius: 999px;

  background: #eee;

  font-size: 0.8em;

  &--green {
    background: #e8f5e9;

    color: var(--green);
  }

  &--pink {
    background: #fce4ec;

    color: var(--pink);
  }
}

.history-card__preview {
  margin-bottom: 12px;
}

.whatsapp-bubble {
  background: #fff;

  border: 1px solid #e8e8e8;

  border-radius: 8px;

  padding: 10px 12px;

  white-space: pre-wrap;

  word-break: break-word;

  font-size: 0.9em;

  line-height: 1.4;

  max-height: 80px;

  overflow: hidden;
}

.history-card__actions {
  gap: 8px;
}
</style>
