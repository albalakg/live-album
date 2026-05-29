<template>

  <section class="whatsapp-panel bg--white brs--medium padding--large">

    <div class="panel-intro margin--bottom-medium">

      <h2 class="title--large">תכנון הודעות</h2>

      <p class="panel-desc">

        ניתן לכתוב ולתזמן עד 3 הודעות WhatsApp לאירוע. כל הודעה נשמרת כטיוטה אוטומטית.

      </p>

    </div>



    <WhatsAppQuotaBar :quota="quota" :campaigns="campaigns" class="margin--bottom-medium" />



    <div class="message-slots">

      <WhatsAppMessageSlot

        v-for="(slot, index) in slots"

        :key="index"

        :slot-number="index + 1"

        :expanded="expandedSlot === index"

        :campaign="slot.campaign"

        :message="slot.message"

        :send-mode="slot.sendMode"

        :scheduled-at="slot.scheduledAt"

        :can-send="canSendSlot(index)"

        :sending="sendingSlot === index"

        :cancelling="cancellingId === slot.campaign?.id"

        class="margin--bottom-medium"

        @toggle="toggleSlot(index)"

        @update:message="(v) => updateSlotMessage(index, v)"

        @update:sendMode="(v) => updateSlotSendMode(index, v)"

        @update:scheduledAt="(v) => updateSlotSchedule(index, v)"

        @send="sendSlot(index)"

        @view-detail="openDetail"

        @cancel="cancelCampaign"

      />

    </div>



    <div v-if="guests.length" class="recipients-section brs--medium">

      <header

        class="recipients-header display--flex justify--space-between align--center pointer"

        @click="recipientsExpanded = !recipientsExpanded"

      >

        <div>

          <p class="title--small">נמענים</p>

          <small class="recipients-summary">

            {{ selectedGuestIds.length }} מתוך {{ guests.length }} אורחים נבחרו

          </small>

        </div>

        <div class="display--flex align--center">

          <button

            type="button"

            class="link-btn title--small text--green"

            @click.stop="toggleAllRecipients"

          >

            {{ allRecipientsSelected ? "ביטול הכל" : "בחירת הכל" }}

          </button>

          <MainIcon

            :icon="recipientsExpanded ? 'expand_less' : 'expand_more'"

            size="1.4em"

          />

        </div>

      </header>



      <div v-show="recipientsExpanded" class="recipient-scroll margin--top-small">

        <div

          v-for="guest in guests"

          :key="guest.id"

          class="recipient-row display--flex align--center"

        >

          <MainCheckbox

            :value="selectedGuestIds.includes(guest.id)"

            @onClick="toggleRecipient(guest.id)"

          />

          <span class="recipient-name">{{ guest.full_name }}</span>

          <span class="recipient-phone" dir="ltr">{{ guest.phone }}</span>

        </div>

      </div>

    </div>



    <div v-else class="empty-hint brs--medium margin--top-medium">

      <MainIcon icon="group" size="2em" />

      <p>יש להוסיף אורחים לפני שליחת הודעות</p>

    </div>



    <WhatsAppCampaignDetailModal

      :open="detailOpen"

      @close="detailOpen = false"

    />

  </section>

</template>



<script lang="ts">

import { defineComponent } from "vue";

import MainCheckbox from "@/components/library/inputs/MainCheckbox.vue";

import MainIcon from "@/components/library/general/MainIcon.vue";

import WhatsAppQuotaBar from "./WhatsAppQuotaBar.vue";

import WhatsAppMessageSlot from "./WhatsAppMessageSlot.vue";

import WhatsAppCampaignDetailModal from "./WhatsAppCampaignDetailModal.vue";

import {

  clearWhatsAppDraft,

  IWhatsAppMessageDraft,

  loadWhatsAppDrafts,

  saveWhatsAppDraft,

} from "@/helpers/whatsappDrafts";

import { IWhatsAppCampaign, IWhatsAppGuest, IWhatsAppQuota } from "@/helpers/interfaces";



interface SlotState {

  campaign: IWhatsAppCampaign | null;

  message: string;

  sendMode: "now" | "schedule";

  scheduledAt: Date | null;

}



export default defineComponent({

  name: "WhatsAppSendPanel",



  components: {

    MainCheckbox,

    MainIcon,

    WhatsAppQuotaBar,

    WhatsAppMessageSlot,

    WhatsAppCampaignDetailModal,

  },



  props: {

    resetKey: {

      type: Number,

      default: 0,

    },

  },



  emits: ["sent"],



  data() {

    return {

      slots: [] as SlotState[],

      expandedSlot: 0,

      selectedGuestIds: [] as number[],

      recipientsExpanded: false,

      sendingSlot: null as number | null,

      cancellingId: null as number | null,

      detailOpen: false,

    };

  },



  computed: {

    eventId(): number | null {

      return this.$store.state.event?.event?.id ?? null;

    },



    guests(): IWhatsAppGuest[] {

      return this.$store.getters["whatsapp/getGuests"];

    },



    quota(): IWhatsAppQuota | null {

      return this.$store.getters["whatsapp/getQuota"];

    },



    campaigns(): IWhatsAppCampaign[] {

      return this.$store.getters["whatsapp/getCampaigns"];

    },



    maxSlots(): number {

      return this.quota?.max_sends ?? 3;

    },



    sortedCampaigns(): IWhatsAppCampaign[] {

      return [...this.campaigns].sort(

        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()

      );

    },



    allRecipientsSelected(): boolean {

      return (

        this.guests.length > 0 &&

        this.guests.every((g) => this.selectedGuestIds.includes(g.id))

      );

    },

  },



  watch: {

    campaigns: {

      immediate: true,

      handler() {

        this.buildSlots();

      },

    },



    quota: {

      immediate: true,

      handler() {

        this.buildSlots();

      },

    },



    eventId: {

      immediate: true,

      handler() {

        this.buildSlots();

      },

    },



    guests: {

      immediate: true,

      handler(guests: IWhatsAppGuest[]) {

        this.selectedGuestIds = guests.map((g) => g.id);

      },

    },



    resetKey() {

      this.selectedGuestIds = this.guests.map((g) => g.id);

    },

  },



  methods: {

    buildSlots() {

      if (!this.eventId) return;



      const drafts = loadWhatsAppDrafts(this.eventId);

      const count = this.maxSlots;

      const newSlots: SlotState[] = [];



      for (let i = 0; i < count; i++) {

        const campaign = this.sortedCampaigns[i] ?? null;

        const draft = drafts[i];



        if (campaign) {

          newSlots.push({

            campaign,

            message: campaign.message,

            sendMode: campaign.scheduled_at ? "schedule" : "now",

            scheduledAt: campaign.scheduled_at ? new Date(campaign.scheduled_at) : null,

          });

        } else if (draft) {

          newSlots.push({

            campaign: null,

            message: draft.message,

            sendMode: draft.sendMode,

            scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt) : null,

          });

        } else {

          newSlots.push({

            campaign: null,

            message: "",

            sendMode: "now",

            scheduledAt: null,

          });

        }

      }



      this.slots = newSlots;



      if (this.expandedSlot >= count) {

        this.expandedSlot = 0;

      }



      const firstEditable = newSlots.findIndex((s) => !s.campaign);

      if (firstEditable >= 0 && !newSlots[this.expandedSlot]?.campaign) {

        // keep current expansion if still editable

      } else if (firstEditable >= 0) {

        this.expandedSlot = firstEditable;

      }

    },



    persistDraft(index: number) {

      if (!this.eventId || this.slots[index]?.campaign) return;



      const slot = this.slots[index];

      const draft: IWhatsAppMessageDraft = {

        message: slot.message,

        sendMode: slot.sendMode,

        scheduledAt: slot.scheduledAt?.toISOString() ?? null,

      };

      saveWhatsAppDraft(this.eventId, index, draft);

    },



    toggleSlot(index: number) {

      this.expandedSlot = this.expandedSlot === index ? -1 : index;

    },



    updateSlotMessage(index: number, value: string) {

      this.slots[index].message = value;

      this.persistDraft(index);

    },



    updateSlotSendMode(index: number, value: "now" | "schedule") {

      this.slots[index].sendMode = value;

      this.persistDraft(index);

    },



    updateSlotSchedule(index: number, value: Date | null) {

      this.slots[index].scheduledAt = value;

      this.persistDraft(index);

    },



    canSendSlot(index: number): boolean {

      const slot = this.slots[index];

      if (!slot || slot.campaign) return false;



      const hasFutureSchedule =

        slot.sendMode === "now" ||

        (slot.scheduledAt instanceof Date && slot.scheduledAt > new Date());



      return (

        this.guests.length > 0 &&

        slot.message.trim().length > 0 &&

        this.selectedGuestIds.length > 0 &&

        (this.quota?.remaining_sends ?? 0) > 0 &&

        hasFutureSchedule &&

        this.sendingSlot === null

      );

    },



    async sendSlot(index: number) {

      if (!this.canSendSlot(index) || !this.eventId) return;



      const slot = this.slots[index];

      this.sendingSlot = index;



      const result = await this.$store.dispatch("whatsapp/sendCampaign", {

        message: slot.message.trim(),

        guest_ids: [...this.selectedGuestIds],

        send_mode: slot.sendMode === "schedule" ? "scheduled" : "immediate",

        scheduled_at: slot.sendMode === "schedule" ? slot.scheduledAt : null,

      });



      this.sendingSlot = null;



      if (result) {

        clearWhatsAppDraft(this.eventId, index);

        this.$emit("sent");

      }

    },



    toggleRecipient(guestId: number) {

      const idx = this.selectedGuestIds.indexOf(guestId);

      if (idx >= 0) {

        this.selectedGuestIds.splice(idx, 1);

      } else {

        this.selectedGuestIds.push(guestId);

      }

    },



    toggleAllRecipients() {

      if (this.allRecipientsSelected) {

        this.selectedGuestIds = [];

      } else {

        this.selectedGuestIds = this.guests.map((g) => g.id);

      }

    },



    async openDetail(campaignId: number) {

      await this.$store.dispatch("whatsapp/fetchCampaignDetail", campaignId);

      this.detailOpen = true;

    },



    async cancelCampaign(campaignId: number) {

      if (!window.confirm("לבטל את השליחה המתוזמנת?")) return;



      this.cancellingId = campaignId;

      await this.$store.dispatch("whatsapp/cancelCampaign", campaignId);

      this.cancellingId = null;

      this.$emit("sent");

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



.panel-desc {

  margin: 6px 0 0;

  color: var(--dark-gray);

  font-size: 0.9em;

}



.recipients-section {

  border: 1px solid #eee;

  padding: 14px 16px;

  background: #fafafa;

}



.recipients-header {

  gap: 12px;

}



.recipients-summary {

  color: var(--dark-gray);

}



.link-btn {

  background: none;

  border: none;

  cursor: pointer;

  margin-left: 8px;

  white-space: nowrap;

  flex-shrink: 0;

}



.recipient-scroll {

  max-height: 180px;

  overflow-y: auto;

  border: 1px solid #eee;

  border-radius: 8px;

  padding: 8px;

  background: #fff;

}



.recipient-row {

  gap: 12px;

  padding: 6px 0;

  border-bottom: 1px solid #f5f5f5;



  &:last-child {

    border-bottom: none;

  }

}



.recipient-name {

  flex: 1;

}



.recipient-phone {

  color: var(--dark-gray);

  font-family: monospace;

  font-size: 0.9em;

}



.empty-hint {

  text-align: center;

  padding: 24px;

  color: var(--dark-gray);

  background: #fafafa;

  border: 1px dashed #ddd;



  p {

    margin: 8px 0 0;

  }

}

</style>

