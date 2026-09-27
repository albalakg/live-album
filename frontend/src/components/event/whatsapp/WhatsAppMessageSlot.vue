<template>
  <article
    class="message-slot brs--medium"
    :class="{
      'message-slot--expanded': expanded,
      'message-slot--locked': isLocked,
      'message-slot--draft': slotState === 'draft',
    }"
  >
    <header
      class="message-slot__header display--flex align--center justify--space-between pointer"
      @click="$emit('toggle')"
    >
      <div class="message-slot__leading display--flex align--center">
        <span class="message-slot__number">{{ slotNumber }}</span>
        <div class="message-slot__info">
          <div class="message-slot__title-row display--flex align--center">
            <strong class="message-slot__title">הודעה {{ slotNumber }}</strong>
            <WhatsAppCampaignStatus v-if="campaign" :status="campaign.status" pill />
            <span v-else-if="slotState === 'draft'" class="status-pill status-pill--draft">טיוטה</span>
            <span v-else class="status-pill status-pill--empty">פנויה</span>
          </div>
          <small v-if="dateLabel" class="message-slot__date">{{ dateLabel }}</small>
          <small v-else-if="messagePreview" class="message-slot__preview">{{ messagePreview }}</small>
        </div>
      </div>
      <span class="message-slot__chevron" aria-hidden="true">
        <MainIcon
          :icon="expanded ? 'expand_less' : 'expand_more'"
          size="1.4em"
        />
      </span>
    </header>

    <div v-show="expanded" class="message-slot__body">
      <template v-if="isLocked && campaign">
        <div class="whatsapp-preview margin--bottom-medium">
          <div class="whatsapp-preview__bubble">{{ campaign.message }}</div>
        </div>
        <div class="locked-meta display--flex flex--wrap">
          <span class="meta-chip">{{ campaign.recipient_count }} נמענים</span>
          <span v-if="campaign.sent_count" class="meta-chip meta-chip--green">
            {{ campaign.sent_count }} נשלחו
          </span>
          <span v-if="campaign.failed_count" class="meta-chip meta-chip--pink">
            {{ campaign.failed_count }} נכשלו
          </span>
        </div>
        <div class="locked-actions margin--top-medium display--flex">
          <BaseButton
            text="פרטי שליחה"
            size="x-small"
            color="dark"
            @onClick="$emit('view-detail', campaign.id)"
          />
          <BaseButton
            v-if="canCancel"
            text="ביטול שליחה"
            size="x-small"
            color="pink"
            :loading="cancelling"
            @onClick="$emit('cancel', campaign.id)"
          />
        </div>
      </template>

      <template v-else>
        <MainTextArea
          :model-value="localMessage"
          title="תוכן ההודעה"
          :maxLength="4096"
          :rows="5"
          :placeholder="placeholder"
          @update:model-value="onMessageInput"
        />
        <small class="char-counter">{{ localMessage.length }}/4096</small>

        <div v-if="localMessage.trim()" class="whatsapp-preview margin--top-medium">
          <p class="title--small margin--bottom-small">תצוגה מקדימה</p>
          <div class="whatsapp-preview__bubble">{{ localMessage.trim() }}</div>
        </div>

        <div class="send-mode margin--top-medium">
          <p class="title--small margin--bottom-small">זמן שליחה</p>
          <div class="mode-toggle display--flex">
            <button
              type="button"
              class="mode-btn brs--small"
              :class="{ 'mode-btn--active': localSendMode === 'now' }"
              @click="setSendMode('now')"
            >
              שליחה מיידית
            </button>
            <button
              type="button"
              class="mode-btn brs--small"
              :class="{ 'mode-btn--active': localSendMode === 'schedule' }"
              @click="setSendMode('schedule')"
            >
              תזמון שליחה
            </button>
          </div>
        </div>

        <div v-if="localSendMode === 'schedule'" class="schedule-picker margin--top-medium">
          <p class="title--small">תאריך ושעה לשליחה</p>
          <VueDatePicker
            class="date-picker"
            :min-date="minDate"
            locale="he"
            :format="dateFormat"
            :model-value="localScheduledAt"
            @update:model-value="onScheduleChange"
            select-text="בחר"
            cancel-text="בטל"
            :day-names="days"
          />
        </div>

        <div class="slot-actions margin--top-medium display--flex align--center">
          <BaseButton
            :text="localSendMode === 'schedule' ? 'תזמון הודעה' : 'שליחה עכשיו'"
            size="x-small"
            :disabled="!canSend"
            :loading="sending"
            @onClick="submit"
          />
          <span v-if="slotState === 'draft'" class="draft-hint">
            <MainIcon icon="save" size="1em" />
            נשמר אוטומטית כטיוטה
          </span>
        </div>
      </template>
    </div>
  </article>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import MainTextArea from "@/components/library/inputs/MainTextArea.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import BaseButton from "@/components/library/buttons/BaseButton.vue";
import WhatsAppCampaignStatus from "./WhatsAppCampaignStatus.vue";
import Time from "@/helpers/time";
import { IWhatsAppCampaign } from "@/helpers/interfaces";
import { WhatsAppCampaignStatusEnum } from "@/helpers/enums";

export default defineComponent({
  name: "WhatsAppMessageSlot",

  components: {
    MainTextArea,
    MainIcon,
    BaseButton,
    WhatsAppCampaignStatus,
  },

  props: {
    slotNumber: {
      type: Number,
      required: true,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    campaign: {
      type: Object as PropType<IWhatsAppCampaign | null>,
      default: null,
    },
    message: {
      type: String,
      default: "",
    },
    sendMode: {
      type: String as PropType<"now" | "schedule">,
      default: "now",
    },
    scheduledAt: {
      type: Date as PropType<Date | null>,
      default: null,
    },
    canSend: {
      type: Boolean,
      default: false,
    },
    sending: {
      type: Boolean,
      default: false,
    },
    cancelling: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["toggle", "update:message", "update:sendMode", "update:scheduledAt", "send", "view-detail", "cancel"],

  data() {
    return {
      localMessage: this.message,
      localSendMode: this.sendMode,
      localScheduledAt: this.scheduledAt as Date | null,
      minDate: new Date(),
      days: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
    };
  },

  computed: {
    isLocked(): boolean {
      return !!this.campaign;
    },

    slotState(): "empty" | "draft" | "locked" {
      if (this.campaign) return "locked";
      if (this.localMessage.trim()) return "draft";
      return "empty";
    },

    canCancel(): boolean {
      if (!this.campaign) return false;
      return (
        this.campaign.status === WhatsAppCampaignStatusEnum.PENDING ||
        this.campaign.status === WhatsAppCampaignStatusEnum.SCHEDULED
      );
    },

    dateLabel(): string {
      if (!this.campaign) return "";
      const dateStr =
        this.campaign.sent_at || this.campaign.scheduled_at || this.campaign.created_at;
      if (!dateStr) return "";
      const formatted = Time.convertToLocalTime(dateStr);
      if (!formatted) return "";
      const prefix =
        this.campaign.status === WhatsAppCampaignStatusEnum.SCHEDULED ||
        this.campaign.status === WhatsAppCampaignStatusEnum.PENDING
          ? "מתוזמן ל-"
          : "נשלח ב-";
      return prefix + formatted;
    },

    messagePreview(): string {
      const text = this.localMessage.trim() || this.campaign?.message || "";
      if (!text) return "";
      return text.length > 60 ? text.slice(0, 60) + "..." : text;
    },

    placeholder(): string {
      const hints = [
        "לדוגמה: שלום! מזמינים אתכם לצפות בגלריית האירוע 🎉",
        "לדוגמה: תזכורת — עדיין אפשר להעלות תמונות לגלריה 📸",
        "לדוגמה: תודה שהייתם איתנו! הגלריה תישאר פתוחה עוד שבוע 💚",
      ];
      return hints[this.slotNumber - 1] || hints[0];
    },
  },

  watch: {
    message(value: string) {
      if (value !== this.localMessage) {
        this.localMessage = value;
      }
    },

    sendMode(value: "now" | "schedule") {
      this.localSendMode = value;
    },

    scheduledAt(value: Date | null) {
      this.localScheduledAt = value;
    },
  },

  methods: {
    dateFormat(date: Date): string {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },

    onMessageInput(value: string) {
      this.localMessage = value;
      this.$emit("update:message", value);
    },

    setSendMode(mode: "now" | "schedule") {
      this.localSendMode = mode;
      this.$emit("update:sendMode", mode);
    },

    onScheduleChange(value: Date | null) {
      this.localScheduledAt = value;
      this.$emit("update:scheduledAt", value);
    },

    submit() {
      if (!this.canSend) return;
      this.$emit("send");
    },
  },
});
</script>

<style lang="scss" scoped>
.message-slot {
  border: 1px solid #e8e8e8;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;

  &--expanded {
    border-color: #c8e6c9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  &--draft {
    border-color: #bbdefb;
  }

  &--locked {
    background: #fafafa;
  }
}

.message-slot__header {
  gap: 12px;
  padding: 14px 16px;
}

.message-slot__leading {
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.message-slot__number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--green);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.message-slot--locked .message-slot__number {
  background: #bdbdbd;
}

.message-slot__info {
  min-width: 0;
}

.message-slot__title-row {
  gap: 8px;
  flex-wrap: wrap;
}

.message-slot__title {
  white-space: nowrap;
}

.message-slot__date,
.message-slot__preview {
  display: block;
  margin-top: 4px;
  color: var(--dark-gray);
}

.message-slot__preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-slot__chevron {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dark-gray);

  :deep(.main-icon) {
    width: auto;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      top: 0;
    }
  }
}

.message-slot__body {
  padding: 0 16px 16px;
  border-top: 1px solid #f0f0f0;
}

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75em;
  font-weight: 600;
  margin-right: 8px;

  &--draft {
    background: #e3f2fd;
    color: #1565c0;
  }

  &--empty {
    background: #f5f5f5;
    color: var(--dark-gray);
  }
}

.whatsapp-preview__bubble {
  background: #dcf8c6;
  border-radius: 12px 12px 4px 12px;
  padding: 12px 14px;
  max-width: 85%;
  margin-right: auto;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.45;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.char-counter {
  display: block;
  text-align: left;
  color: var(--dark-gray);
  margin-top: 4px;
}

.mode-toggle {
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;

  &--active {
    background: var(--green);
    color: #fff;
    border-color: var(--green);
  }
}

.schedule-picker .date-picker {
  width: 100%;
  max-width: 320px;
}

.slot-actions {
  gap: 12px;
  flex-wrap: wrap;
}

.draft-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85em;
  color: var(--dark-gray);
}

.locked-meta {
  gap: 8px;
}

.meta-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eee;
  font-size: 0.85em;

  &--green {
    background: #e8f5e9;
    color: var(--green);
  }

  &--pink {
    background: #fce4ec;
    color: var(--pink);
  }
}

.locked-actions {
  gap: 8px;
}
</style>
