<template>
  <Teleport to="body">
    <div class="gs-ui msg-ui">
      <div class="gs-sheet-scrim" style="position: fixed; inset: 0; z-index: 12000; background: rgba(18, 16, 14, 0.45)" @click="$emit('close')"></div>
      <aside class="msg-drawer" role="dialog" aria-modal="true" :aria-label="'הודעות של ' + guest.full_name">
        <div class="msg-row" style="margin-bottom: 12px">
          <span class="gs-ava" aria-hidden="true">{{ initials(guest.full_name) }}</span>
          <h2 style="margin: 0; font-size: 18px">{{ guest.full_name }}</h2>
          <span class="msg-spacer"></span>
          <button class="gs-btn gs-btn-sm" type="button" @click="$emit('close')">סגירה</button>
        </div>
        <p class="msg-muted">הודעות שממתינות לאורח הזה ניתנות לשינוי מתור השליחה. הודעות שכבר נשלחו נעולות.</p>
        <p v-if="loading" class="msg-empty">טוען…</p>
        <p v-else-if="!items.length" class="msg-empty">אין הודעות לאורח הזה</p>
        <div v-for="it in items" :key="it.recipient_id" class="gs-card msg-card" style="margin-bottom: 8px; padding: 12px 14px">
          <div class="msg-q-top">
            <span :class="it.locked ? 'b b-grey' : 'b b-gold'">{{ it.locked ? "🔒 " : "" }}{{ recipientStatus[it.status] || it.status }}</span>
            <span v-if="it.send_status" :class="'b ' + (sendStatus[it.send_status] ? sendStatus[it.send_status].cls : 'b-grey')">{{ sendStatus[it.send_status] ? sendStatus[it.send_status].label : it.send_status }}</span>
          </div>
          <b>{{ it.title }}</b>
          <p class="msg-muted" style="margin: 4px 0 0">{{ it.sent_at ? "נשלח " + fmtWhen(it.sent_at) : "מתוכנן " + fmtWhen(it.scheduled_at) }}</p>
          <button v-if="!it.locked && it.status === 'pending'" class="gs-btn gs-btn-sm" type="button" style="margin-top: 8px" @click="$emit('go-queue', it.send_id)">ניהול בתור ←</button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { messagingApi } from "@/helpers/messaging/api";
import { GuestQueueItem } from "@/helpers/messaging/types";
import { fmtWhen, RECIPIENT_STATUS, SEND_STATUS } from "@/helpers/messaging/labels";
import { initials } from "@/helpers/seating/labels";

export default defineComponent({
  name: "MessagingGuestDrawer",
  props: {
    eventId: { type: Number, required: true },
    guest: { type: Object as PropType<{ id: number; full_name: string }>, required: true },
  },
  emits: ["close", "go-queue"],
  data() {
    return { items: [] as GuestQueueItem[], loading: true, recipientStatus: RECIPIENT_STATUS, sendStatus: SEND_STATUS as Record<string, { label: string; cls: string }> };
  },
  async mounted() {
    window.addEventListener("keydown", this.onKey);
    try {
      this.items = await messagingApi.guestMessages(this.eventId, this.guest.id);
    } finally {
      this.loading = false;
    }
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKey);
  },
  methods: {
    initials,
    fmtWhen,
    onKey(e: KeyboardEvent) {
      if (e.key === "Escape") this.$emit("close");
    },
  },
});
</script>
