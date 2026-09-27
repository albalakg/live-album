<template>
  <div v-if="quota" class="quota-bar">
    <div class="quota-bar__header display--flex justify--space-between align--center">
      <span class="quota-bar__title title--small">מכסת הודעות לאירוע</span>
      <span class="quota-bar__count" :class="{ 'quota-bar__count--exhausted': quota.remaining_sends === 0 }">
        {{ usedCount }}/{{ quota.max_sends }}
      </span>
    </div>
    <div class="quota-bar__segments display--flex">
      <div
        v-for="index in quota.max_sends"
        :key="index"
        class="quota-bar__segment brs--small"
        :class="segmentClass(index - 1)"
        :title="segmentTitle(index - 1)"
      />
    </div>
    <p class="quota-bar__hint">
      <template v-if="quota.remaining_sends > 0">
        נותרו {{ quota.remaining_sends }} הודעות — ניתן לכתוב ולתזמן את כולן מראש
      </template>
      <template v-else>
        ניצלת את כל {{ quota.max_sends }} ההודעות לאירוע זה
      </template>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { IWhatsAppCampaign, IWhatsAppQuota } from "@/helpers/interfaces";
import { WhatsAppCampaignStatusEnum } from "@/helpers/enums";

export default defineComponent({
  name: "WhatsAppQuotaBar",

  props: {
    quota: {
      type: Object as PropType<IWhatsAppQuota | null>,
      default: null,
    },
    campaigns: {
      type: Array as PropType<IWhatsAppCampaign[]>,
      default: () => [],
    },
  },

  computed: {
    usedCount(): number {
      if (!this.quota) return 0;
      return this.quota.max_sends - this.quota.remaining_sends;
    },

    sortedCampaigns(): IWhatsAppCampaign[] {
      return [...this.campaigns].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    },
  },

  methods: {
    segmentClass(index: number): Record<string, boolean> {
      if (index >= this.usedCount) {
        return { "quota-bar__segment--empty": true };
      }

      const campaign = this.sortedCampaigns[index];
      if (!campaign) {
        return { "quota-bar__segment--sent": true };
      }

      switch (campaign.status) {
        case WhatsAppCampaignStatusEnum.SCHEDULED:
        case WhatsAppCampaignStatusEnum.PENDING:
          return { "quota-bar__segment--scheduled": true };
        case WhatsAppCampaignStatusEnum.SENDING:
          return { "quota-bar__segment--active": true };
        case WhatsAppCampaignStatusEnum.FAILED:
        case WhatsAppCampaignStatusEnum.CANCELLED:
          return { "quota-bar__segment--failed": true };
        default:
          return { "quota-bar__segment--sent": true };
      }
    },

    segmentTitle(index: number): string {
      if (index >= this.usedCount) {
        return `הודעה ${index + 1} — פנויה`;
      }

      const campaign = this.sortedCampaigns[index];
      if (!campaign) return `הודעה ${index + 1} — נוצלה`;
      return `הודעה ${index + 1} — ${this.statusLabel(campaign.status)}`;
    },

    statusLabel(status: WhatsAppCampaignStatusEnum): string {
      switch (status) {
        case WhatsAppCampaignStatusEnum.SENT:
          return "נשלחה";
        case WhatsAppCampaignStatusEnum.SCHEDULED:
          return "מתוזמנת";
        case WhatsAppCampaignStatusEnum.PENDING:
          return "ממתינה";
        case WhatsAppCampaignStatusEnum.SENDING:
          return "בשליחה";
        case WhatsAppCampaignStatusEnum.FAILED:
          return "נכשלה";
        case WhatsAppCampaignStatusEnum.CANCELLED:
          return "בוטלה";
        default:
          return status;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.quota-bar {
  background: #f8faf8;
  border: 1px solid #e8efe8;
  border-radius: 12px;
  padding: 16px;
}

.quota-bar__header {
  margin-bottom: 10px;
}

.quota-bar__count {
  font-weight: 700;
  color: var(--green);

  &--exhausted {
    color: var(--pink);
  }
}

.quota-bar__segments {
  gap: 8px;
}

.quota-bar__segment {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  transition: background 0.2s;

  &--empty {
    background: #e8e8e8;
  }

  &--sent {
    background: var(--green);
  }

  &--scheduled {
    background: #90caf9;
  }

  &--active {
    background: var(--light-green);
    animation: pulse 1.5s ease-in-out infinite;
  }

  &--failed {
    background: var(--pink);
  }
}

.quota-bar__hint {
  margin: 10px 0 0;
  font-size: 0.85em;
  color: var(--dark-gray);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}
</style>
