<template>
  <div class="gs-ui msg-ui messaging-page">
    <header class="msg-page-head">
      <div>
        <h1>הודעות WhatsApp לאורחים</h1>
        <p>תבניות חכמות, אישורי הגעה עם בוט, תור שליחה שאפשר לשנות עד הרגע האחרון, ותיבת תגובות.</p>
      </div>
      <div class="msg-head-actions">
        <span v-if="overview && overview.provider === 'mock'" class="b b-amber" title="WHATSAPP_* לא מוגדר — נשלח לספק מדומה">מצב בדיקה · לא נשלחות הודעות אמיתיות</span>
        <button class="gs-btn" type="button" @click="go('packages')">חבילות ומכסה</button>
        <button class="gs-btn msg-btn-green" type="button" @click="compose('rsvp_invite')">+ הודעה חדשה</button>
      </div>
    </header>

    <nav class="msg-tabs" aria-label="אזורי הודעות">
      <router-link v-for="t in tabs" :key="t.key" :to="'/event/messages/' + t.key" :class="{ active: tab === t.key }" :aria-current="tab === t.key ? 'page' : undefined">
        {{ t.label }}<span v-if="t.count" class="msg-count">{{ t.count }}</span>
      </router-link>
    </nav>

    <div v-if="locked" class="gs-card msg-card">
      <h2>הודעות WhatsApp עדיין לא זמינות</h2>
      <p class="msg-sub">הפיצ׳ר כבוי בשרת הזה (WHATSAPP_MESSAGING_ENABLED).</p>
    </div>
    <p v-else-if="loadError" class="msg-note red" role="alert">{{ loadError }} <button class="gs-btn gs-btn-sm" type="button" @click="loadAll">נסו שוב</button></p>
    <p v-else-if="!overview" class="msg-empty">טוען…</p>

    <template v-else>
      <MessagingDashboardPanel v-if="tab === 'dashboard'" :overview="overview" @go="go" @compose="compose" />
      <MessagingTemplatesPanel v-else-if="tab === 'templates'" :templates="templates" :dev-tools="overview.dev_tools" @use="useTemplate" @dev-approve="devApproveTemplate" />
      <MessagingComposerPanel
        v-else-if="tab === 'compose' && audience"
        :key="composerKey"
        :event-id="eventId"
        :templates="templates"
        :audience="audience"
        :overview="overview"
        :initial-template-key="composeKey"
        :initial-step="composerStep"
        :edit-send="editSend"
        @done="onComposed"
        @reload="reloadEdit"
        @open-guest="openGuest"
      />
      <MessagingRsvpPanel v-else-if="tab === 'rsvp'" :key="'rsvp-' + settingsKey" :event-id="eventId" :settings="overview.settings" :auto="overview.event.vars" @saved="onSettings" />
      <section v-else-if="tab === 'audience' && audience" class="gs-card msg-card">
        <div class="msg-card-head">
          <div>
            <h2>פילוח נמענים</h2>
            <p class="msg-sub">כל האורחים מרשימת האורחים של האירוע, עם מכסה ותור לכל אורח</p>
          </div>
          <button class="gs-btn msg-btn-green" type="button" @click="composeTo">הודעה לקהל הזה ←</button>
        </div>
        <MessagingAudiencePicker v-model="audienceSegment" :guests="audience.guests" :groups="audience.groups" :per-guest="audience.per_guest" @open-guest="openGuest" />
      </section>
      <MessagingAutomationsPanel v-else-if="tab === 'automations'" :event-id="eventId" :automations="automations" :event-date="eventDate" @changed="onAutomations" @go="go" />
      <MessagingQueuePanel
        v-else-if="tab === 'queue'"
        :event-id="eventId"
        :sends="sends"
        :dev-tools="overview.dev_tools"
        @changed="onQueueChanged"
        @edit="editFromQueue"
        @open-guest="openGuest"
        @dev-approve="devApproveSend"
        @dev-delivery="devDelivery"
      />
      <MessagingAnalyticsPanel v-else-if="tab === 'analytics' && analytics" :data="analytics" />
      <MessagingInboxPanel v-else-if="tab === 'inbox'" :key="'inbox-' + inboxKey" :event-id="eventId" :threads="threads" :guests="audience ? audience.guests : []" :dev-tools="overview.dev_tools" @changed="onInbox" @open-guest="openGuest" />
      <MessagingPackagesPanel
        v-else-if="tab === 'packages'"
        :quota="overview.quota"
        :dev-tools="overview.dev_tools"
        :checkout-mock="overview.checkout?.driver === 'mock'"
        :busy="buying"
        @buy="buy"
        @dev-entitlement="devEntitlement"
      />
    </template>

    <MessagingGuestDrawer v-if="drawerGuest" :event-id="eventId" :guest="drawerGuest" @close="drawerGuest = null" @go-queue="goQueue" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MessagingDashboardPanel from "@/components/event/messaging/MessagingDashboardPanel.vue";
import MessagingTemplatesPanel from "@/components/event/messaging/MessagingTemplatesPanel.vue";
import MessagingComposerPanel from "@/components/event/messaging/MessagingComposerPanel.vue";
import MessagingRsvpPanel from "@/components/event/messaging/MessagingRsvpPanel.vue";
import MessagingAudiencePicker from "@/components/event/messaging/MessagingAudiencePicker.vue";
import MessagingAutomationsPanel from "@/components/event/messaging/MessagingAutomationsPanel.vue";
import MessagingQueuePanel from "@/components/event/messaging/MessagingQueuePanel.vue";
import MessagingAnalyticsPanel from "@/components/event/messaging/MessagingAnalyticsPanel.vue";
import MessagingInboxPanel from "@/components/event/messaging/MessagingInboxPanel.vue";
import MessagingPackagesPanel from "@/components/event/messaging/MessagingPackagesPanel.vue";
import { AddonProductKey, startAddonCheckout } from "@/helpers/addons/api";
import MessagingGuestDrawer from "@/components/event/messaging/MessagingGuestDrawer.vue";
import { messagingApi } from "@/helpers/messaging/api";
import { AnalyticsResponse, AudienceResponse, Automation, InboxThread, MessagingSend, MessagingSettings, MessagingTemplate, Overview, Segment } from "@/helpers/messaging/types";
import { errStatus, msgError } from "@/helpers/messaging/labels";
import { notify } from "@/helpers/notify";

const TABS = ["dashboard", "templates", "compose", "rsvp", "audience", "automations", "queue", "analytics", "inbox", "packages"] as const;
type Tab = (typeof TABS)[number];
type Step = "content" | "audience" | "schedule";

export default defineComponent({
  name: "EventMessagingView",
  components: {
    MessagingDashboardPanel,
    MessagingTemplatesPanel,
    MessagingComposerPanel,
    MessagingRsvpPanel,
    MessagingAudiencePicker,
    MessagingAutomationsPanel,
    MessagingQueuePanel,
    MessagingAnalyticsPanel,
    MessagingInboxPanel,
    MessagingPackagesPanel,
    MessagingGuestDrawer,
  },
  data() {
    return {
      overview: null as Overview | null,
      buying: false,
      templates: [] as MessagingTemplate[],
      audience: null as AudienceResponse | null,
      sends: [] as MessagingSend[],
      automations: [] as Automation[],
      eventDate: null as string | null,
      analytics: null as AnalyticsResponse | null,
      threads: [] as InboxThread[],
      locked: false,
      loadError: "",
      composeKey: "rsvp_invite",
      composerStep: "content" as Step,
      composerKey: 0,
      editSend: null as MessagingSend | null,
      audienceSegment: { statuses: [0, 3] } as Segment,
      drawerGuest: null as { id: number; full_name: string } | null,
      settingsKey: 0,
      inboxKey: 0,
    };
  },
  computed: {
    eventId(): number {
      return Number(this.$store.getters["event/getEvent"]?.id || 0);
    },
    tab(): Tab {
      const t = String(this.$route.params.tab || "dashboard") as Tab;
      return (TABS as readonly string[]).includes(t) ? t : "dashboard";
    },
    tabs(): { key: Tab; label: string; count?: number }[] {
      const o = this.overview;
      return [
        { key: "dashboard", label: "סקירה ומכסה" },
        { key: "templates", label: "תבניות חכמות" },
        { key: "compose", label: this.editSend ? "עריכת הודעה בתור" : "עורך הודעה" },
        { key: "rsvp", label: "שאלון ופרטים" },
        { key: "audience", label: "פילוח נמענים" },
        { key: "automations", label: "אוטומציות" },
        { key: "queue", label: "תור השליחה", count: o?.queue.upcoming || 0 },
        { key: "analytics", label: "אנליטיקה" },
        { key: "inbox", label: "תיבת תגובות", count: o?.inbox.unread || 0 },
        { key: "packages", label: "חבילות" },
      ];
    },
  },
  watch: {
    eventId() {
      this.loadAll();
    },
    tab() {
      this.loadTab();
      this.revealTab();
    },
  },
  mounted() {
    this.loadAll();
    this.revealTab();
  },
  methods: {
    /** Mobile: keep the active tab visible in the horizontally scrolling tab row. */
    revealTab() {
      this.$nextTick(() => {
        const row = this.$el?.querySelector?.(".msg-tabs") as HTMLElement | null;
        const el = row?.querySelector(".active") as HTMLElement | null;
        if (!row || !el || row.scrollWidth <= row.clientWidth) return;
        el.scrollIntoView({ inline: "center", block: "nearest" });
      });
    },
    go(tab: Tab) {
      if (tab !== "compose") this.editSend = null;
      this.$router.push("/event/messages/" + tab);
    },
    async loadAll() {
      if (!this.eventId) return;
      this.loadError = "";
      try {
        const [overview, templates, audience] = await Promise.all([
          messagingApi.overview(this.eventId),
          messagingApi.templates(this.eventId),
          messagingApi.audience(this.eventId),
        ]);
        this.overview = overview;
        this.templates = templates;
        this.audience = audience;
        await this.loadTab();
      } catch (e) {
        if (errStatus(e) === 403) this.locked = true;
        else this.loadError = msgError(e, "לא הצלחנו לטעון את מסך ההודעות");
      }
    },
    async loadTab() {
      if (!this.eventId || !this.overview) return;
      try {
        if (this.tab === "queue") this.sends = await messagingApi.queue(this.eventId);
        if (this.tab === "automations") {
          const r = await messagingApi.automations(this.eventId);
          this.automations = r.automations;
          this.eventDate = r.event_date;
        }
        if (this.tab === "analytics") this.analytics = await messagingApi.analytics(this.eventId);
        if (this.tab === "inbox") {
          this.threads = await messagingApi.inbox(this.eventId);
          this.inboxKey++;
        }
        if (this.tab === "templates") this.templates = await messagingApi.templates(this.eventId);
      } catch (e) {
        notify({ type: "error", text: msgError(e, "הטעינה נכשלה") });
      }
    },
    async refreshOverview() {
      const [o, a] = await Promise.all([messagingApi.overview(this.eventId), messagingApi.audience(this.eventId)]);
      this.overview = o;
      this.audience = a;
    },
    compose(key = "rsvp_invite") {
      this.editSend = null;
      this.composeKey = key;
      this.composerStep = "content";
      this.composerKey++;
      this.go("compose");
    },
    useTemplate(t: MessagingTemplate) {
      this.compose(t.is_system ? t.key : t.base_key || "custom_manual");
    },
    composeTo() {
      this.compose("custom_manual");
    },
    async onComposed(send: MessagingSend) {
      this.editSend = null;
      await this.refreshOverview();
      this.go("queue");
      if (this.tab === "queue") this.sends = await messagingApi.queue(this.eventId);
      return send;
    },
    editFromQueue(s: MessagingSend, part: Step) {
      this.editSend = s;
      this.composerStep = part;
      this.composerKey++;
      this.$router.push("/event/messages/compose");
    },
    async reloadEdit() {
      if (!this.editSend) return;
      this.editSend = await messagingApi.show(this.eventId, this.editSend.id);
      this.composerKey++;
    },
    async onQueueChanged() {
      this.sends = await messagingApi.queue(this.eventId);
      this.refreshOverview();
    },
    async onAutomations() {
      const r = await messagingApi.automations(this.eventId);
      this.automations = r.automations;
      this.refreshOverview();
    },
    async onInbox(opts?: { silent?: boolean }) {
      if (!opts?.silent) this.threads = await messagingApi.inbox(this.eventId);
      this.overview = await messagingApi.overview(this.eventId);
    },
    onSettings(s: MessagingSettings) {
      if (this.overview) this.overview.settings = s;
      notify({ type: "success", text: "השאלון וההגדרות נשמרו" });
      this.refreshOverview();
    },
    openGuest(g: { id: number; full_name: string }) {
      this.drawerGuest = { id: g.id, full_name: g.full_name };
    },
    goQueue() {
      this.drawerGuest = null;
      this.go("queue");
    },
    async devApproveTemplate(t: MessagingTemplate) {
      if (!t.id) return;
      await messagingApi.devTemplate(this.eventId, t.id, "approved");
      this.templates = await messagingApi.templates(this.eventId);
    },
    async devApproveSend(s: MessagingSend) {
      if (s.template_id) await messagingApi.devTemplate(this.eventId, s.template_id, "approved");
      notify({ type: "success", text: "אושר במצב בדיקה. ההודעה תצא בסבב השליחה הבא." });
      this.onQueueChanged();
    },
    async devDelivery(s: MessagingSend) {
      await messagingApi.devDelivery(this.eventId, s.id, "read");
      this.onQueueChanged();
    },
    async buy(p: { product: AddonProductKey; quantity: number }) {
      if (this.buying) return;
      this.buying = true;
      try {
        await startAddonCheckout(this.eventId, p.product, p.quantity);
      } catch (e) {
        this.buying = false;
        notify({ text: msgError(e, "לא הצלחנו לפתוח את דף התשלום"), type: "error", duration: 5000 });
      }
    },
    async devEntitlement(p: { pro_addon?: boolean; topups?: number }) {
      await messagingApi.devEntitlement(this.eventId, p);
      await this.refreshOverview();
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/guests-seating.scss";
@import "@/styles/messaging.scss";

.messaging-page {
  padding: 8px 4px 40px;
  max-width: 1280px;
  margin: 0 auto;
}
</style>
