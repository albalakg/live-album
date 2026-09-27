<template>
  <div v-if="open" class="detail-modal-backdrop" @click.self="onClose">
    <div class="detail-modal bg--white brs--medium padding--large">
      <header class="detail-header display--flex justify--space-between align--center margin--bottom-medium">
        <h3 class="title--medium">פרטי שליחה</h3>
        <MainIcon clickable icon="close" @onClick="onClose" />
      </header>

      <div v-if="loading" class="detail-modal-body text--center">
        טוען...
      </div>

      <div v-else-if="detail" class="detail-modal-body">
        <div class="detail-meta margin--bottom-medium">
          <p><strong>סטטוס:</strong> <WhatsAppCampaignStatus :status="detail.campaign.status" /></p>
          <p><strong>תאריך:</strong> {{ formatDate(detail.campaign) }}</p>
          <p><strong>נמענים:</strong> {{ detail.campaign.recipient_count }}</p>
          <p><strong>נשלחו:</strong> {{ detail.campaign.sent_count }} | <strong>נכשלו:</strong> {{ detail.campaign.failed_count }}</p>
        </div>

        <div class="detail-message margin--bottom-medium">
          <p class="title--small">הודעה</p>
          <div class="message-box brs--small padding--medium">{{ detail.campaign.message }}</div>
        </div>

        <div class="recipient-table-wrapper">
          <p class="title--small margin--bottom-small">סטטוס לפי אורח</p>
          <div class="table-scroll">
            <table class="recipient-table width--full">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>סטטוס</th>
                  <th>שגיאה</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="recipient in detail.recipients" :key="recipient.guest_id">
                  <td>{{ recipient.full_name }}</td>
                  <td dir="ltr">{{ recipient.phone }}</td>
                  <td>
                    <span :class="`status-badge status-badge--${recipient.status}`">
                      {{ recipientStatusText(recipient.status) }}
                    </span>
                  </td>
                  <td>{{ recipient.error_message || "—" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import WhatsAppCampaignStatus from "./WhatsAppCampaignStatus.vue";
import Time from "@/helpers/time";
import { IWhatsAppCampaign } from "@/helpers/interfaces";

export default defineComponent({
  name: "WhatsAppCampaignDetailModal",

  components: {
    MainIcon,
    WhatsAppCampaignStatus,
  },

  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["close"],

  computed: {
    detail() {
      return this.$store.getters["whatsapp/getCampaignDetail"];
    },

    loading(): boolean {
      return this.$store.getters["whatsapp/isLoading"];
    },
  },

  watch: {
    open(isOpen: boolean) {
      if (!isOpen) {
        this.$store.dispatch("whatsapp/clearCampaignDetail");
      }
    },
  },

  methods: {
    formatDate(campaign: IWhatsAppCampaign): string {
      const dateStr = campaign.sent_at || campaign.scheduled_at || campaign.created_at;
      return dateStr ? Time.convertToLocalTime(dateStr) : "—";
    },

    recipientStatusText(status: string): string {
      switch (status) {
        case "sent":
          return "נשלח";
        case "failed":
          return "נכשל";
        case "pending":
          return "ממתין";
        default:
          return status;
      }
    },

    onClose() {
      this.$emit("close");
    },
  },
});
</script>

<style lang="scss" scoped>
.detail-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
  overflow-y: auto;
}

.detail-modal {
  width: 100%;
  max-width: 640px;
  max-height: calc(100vh - 200px);
  min-width: 0;
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  top: 40px;
  position: relative;

  @media only screen and (max-width: 600px) {
    top: -20px;
  }
}

.detail-header {
  flex-shrink: 0;
}

.detail-modal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-meta,
.detail-message {
  flex-shrink: 0;
}

.recipient-table-wrapper {
  flex: 1;
  min-height: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

.message-box {
  background: #f9f9f9;
  white-space: pre-wrap;
  word-break: break-word;
}

.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

.recipient-table {
  border-collapse: collapse;
  min-width: 400px;

  th,
  td {
    padding: 10px 8px;
    text-align: right;
    border-bottom: 1px solid #eee;
    font-size: 0.9em;
  }

  th {
    background: #fafafa;
    font-weight: 600;
  }
}

.status-badge {
  font-weight: 600;

  &--sent {
    color: var(--green);
  }

  &--failed {
    color: var(--pink);
  }

  &--pending {
    color: var(--dark-gray);
  }
}
</style>
