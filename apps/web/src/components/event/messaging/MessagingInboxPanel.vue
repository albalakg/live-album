<template>
  <div class="msg-inbox">
    <aside class="gs-card msg-thread-list" aria-label="שיחות">
      <p v-if="!threads.length" class="msg-empty">עוד אין תגובות מאורחים</p>
      <button v-for="t in threads" :key="t.guest_id" type="button" class="msg-thread-item" :class="{ on: active === t.guest_id }" :aria-current="active === t.guest_id ? 'true' : undefined" @click="open(t.guest_id)">
        <span class="gs-ava" aria-hidden="true">{{ initials(t.full_name) }}</span>
        <span style="flex: 1; min-width: 0">
          <span class="who"><span>{{ t.full_name }}</span><span v-if="t.unread" class="b b-red">{{ t.unread }}</span></span>
          <span class="snip">{{ t.last ? (t.last.direction === "out" ? "אתם: " : "") + t.last.body : "" }}</span>
          <span class="msg-row" style="margin-top: 4px">
            <span v-if="t.suggestion" class="b b-gold">הצעת עדכון</span>
            <span v-if="t.bot_step" class="b b-blue">בוט באמצע שאלון</span>
            <span :class="t.window_open ? 'b b-green' : 'b b-grey'">{{ t.window_open ? "חלון 24ש׳ פתוח" : "חלון סגור" }}</span>
          </span>
        </span>
      </button>
    </aside>

    <section class="gs-card msg-thread" aria-live="polite">
      <template v-if="thread">
        <div class="msg-thread-head">
          <div>
            <b>{{ thread.guest.full_name }}</b>
            <div class="msg-row" style="margin-top: 4px">
              <span class="gs-pill" :class="'st-' + thread.guest.status">{{ statusLabels[thread.guest.status] }}</span>
              <span class="b">{{ thread.guest.party_size }} מוזמנים</span>
              <span v-if="thread.guest.table_label" class="b">שולחן {{ thread.guest.table_label }}</span>
              <span v-if="answers.meal" class="b b-green">{{ answers.meal }}</span>
              <span v-if="answers.allergies" class="b b-amber">{{ answers.allergies }}</span>
              <span v-if="thread.guest.opted_out" class="b b-red">הוסר מדיוור</span>
            </div>
          </div>
          <button class="gs-btn gs-btn-sm" type="button" @click="$emit('open-guest', { id: thread.guest.id, full_name: thread.guest.full_name })">הודעות בתור</button>
        </div>
        <div ref="body" class="msg-thread-body">
          <div v-for="m in thread.messages" :key="m.id" class="msg-chat-row">
            <div class="msg-bubble" :class="m.direction === 'in' ? 'in' : 'out'">
              {{ m.body }}
              <div class="t">{{ fmtShort(m.at) }}{{ m.direction === "out" && m.handled === "bot" ? " · בוט" : "" }}{{ m.kind === "sms" ? " · SMS" : "" }}</div>
            </div>
            <div v-if="m.direction === 'in' && m.suggestion && !m.handled" class="msg-sugg">
              <span>הצעה: {{ suggestionText(m.suggestion) }}</span>
              <button class="gs-btn gs-btn-sm msg-btn-green" type="button" :disabled="busy" @click="decide(m.id, true)">לעדכן ברשימה</button>
              <button class="gs-btn gs-btn-sm" type="button" :disabled="busy" @click="decide(m.id, false)">להתעלם</button>
            </div>
          </div>
        </div>
        <div class="msg-thread-foot">
          <template v-if="thread.window_open && !thread.guest.opted_out">
            <label class="gs-sr" for="inbox-reply">תשובה</label>
            <textarea id="inbox-reply" v-model="reply" class="gs-textarea" rows="2" maxlength="1000" placeholder="כתבו תשובה (חינם בתוך 24 שעות מההודעה האחרונה של האורח)"></textarea>
            <button class="gs-btn msg-btn-green" type="button" :disabled="busy || !reply.trim()" @click="send">שליחה</button>
          </template>
          <p v-else class="msg-muted" style="margin: 0">{{ thread.guest.opted_out ? "האורח ביקש להסיר אותו — אי אפשר לשלוח." : "חלון 24 השעות נסגר. אפשר לשלוח לו רק תבנית מאושרת (מסך עורך ההודעה)." }}</p>
        </div>
      </template>
      <p v-else class="msg-empty">בחרו שיחה מהרשימה</p>

      <div v-if="devTools" class="msg-dev" style="margin: 10px">
        <b>סימולציה מקומית (Mock):</b> תשובה של אורח בלי וואטסאפ אמיתי.
        <div class="msg-row" style="margin-top: 6px">
          <select v-model.number="simGuest" class="gs-select" aria-label="אורח לסימולציה" style="max-width: 200px">
            <option :value="0">בחרו אורח</option>
            <option v-for="g in simGuests" :key="g.id" :value="g.id">{{ g.full_name }}</option>
          </select>
          <button class="gs-btn gs-btn-sm" type="button" :disabled="!simGuest" @click="simulate({ payload: 'rsvp_yes' })">לחץ "מגיע"</button>
          <button class="gs-btn gs-btn-sm" type="button" :disabled="!simGuest" @click="simulate({ payload: 'rsvp_no' })">לחץ "לא מגיע"</button>
          <input v-model="simText" class="gs-input" aria-label="טקסט לסימולציה" placeholder="מגיעים רק 2, אני צמחונית" style="max-width: 240px" />
          <button class="gs-btn gs-btn-sm" type="button" :disabled="!simGuest || !simText" @click="simulate({ text: simText })">שליחת טקסט</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { messagingApi } from "@/helpers/messaging/api";
import { AudienceGuest, InboxThread, ThreadResponse } from "@/helpers/messaging/types";
import { fmtShort, msgError } from "@/helpers/messaging/labels";
import { initials, STATUS_LABELS } from "@/helpers/seating/labels";
import { notify } from "@/helpers/notify";

export default defineComponent({
  name: "MessagingInboxPanel",
  props: {
    eventId: { type: Number, required: true },
    threads: { type: Array as PropType<InboxThread[]>, required: true },
    guests: { type: Array as PropType<AudienceGuest[]>, default: () => [] },
    devTools: { type: Boolean, default: false },
  },
  emits: ["changed", "open-guest"],
  data() {
    return {
      active: 0,
      thread: null as ThreadResponse | null,
      reply: "",
      busy: false,
      simGuest: 0,
      simText: "",
      statusLabels: STATUS_LABELS as Record<number, string>,
    };
  },
  computed: {
    answers(): { meal?: string; allergies?: string } {
      return (this.thread?.guest.answers || {}) as { meal?: string; allergies?: string };
    },
    simGuests(): AudienceGuest[] {
      return this.guests.filter((g) => g.has_phone).slice(0, 100);
    },
  },
  mounted() {
    if (this.threads.length) this.open(this.threads[0].guest_id);
  },
  methods: {
    initials,
    fmtShort,
    suggestionText(s: Record<string, string | number>): string {
      const parts: string[] = [];
      if (s.status !== undefined) parts.push(this.statusLabels[Number(s.status)]);
      if (s.party_size) parts.push(`${s.party_size} מוזמנים`);
      if (s.meal) parts.push(String(s.meal));
      if (s.allergies) parts.push(String(s.allergies));
      return parts.join(" · ");
    },
    async open(guestId: number) {
      this.active = guestId;
      this.thread = await messagingApi.thread(this.eventId, guestId);
      this.$nextTick(() => {
        const el = this.$refs.body as HTMLElement | undefined;
        if (el) el.scrollTop = el.scrollHeight;
      });
      this.$emit("changed", { silent: true });
    },
    async send() {
      this.busy = true;
      try {
        await messagingApi.reply(this.eventId, this.active, this.reply.trim());
        this.reply = "";
        await this.open(this.active);
      } catch (e) {
        notify({ type: "error", text: msgError(e, "השליחה נכשלה") });
      } finally {
        this.busy = false;
      }
    },
    async decide(messageId: number, apply: boolean) {
      this.busy = true;
      try {
        await messagingApi.suggestion(this.eventId, messageId, apply);
        notify({ type: "success", text: apply ? "רשימת האורחים עודכנה" : "ההצעה נסגרה" });
        await this.open(this.active);
      } catch (e) {
        notify({ type: "error", text: msgError(e, "העדכון נכשל") });
      } finally {
        this.busy = false;
      }
    },
    async simulate(p: { text?: string; payload?: string }) {
      try {
        await messagingApi.devInbound(this.eventId, { guest_id: this.simGuest, ...p });
        this.simText = "";
        this.$emit("changed");
        await this.open(this.simGuest);
      } catch (e) {
        notify({ type: "error", text: msgError(e, "הסימולציה נכשלה") });
      }
    },
  },
});
</script>
