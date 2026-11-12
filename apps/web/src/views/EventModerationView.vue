<template>
  <section class="moderation">
    <header class="moderation-head">
      <p class="kicker">בדיקת תוכן</p>
      <h1>תור בדיקה</h1>
      <p>
        תמונות שממתינות לבדיקה אוטומטית, ותמונות שנחסמו. אישור משתמש בנקודת הקצה הקיימת לביטול חסימה. הסתרה משתמשת בנקודת הקצה הקיימת להסתרה מהאלבום.
      </p>
      <p class="note">סרטונים אינם נבדקים אוטומטית.</p>
      <p v-if="manualApproval" class="note">
        אישור ידני פעיל. תמונות שהועלו מאז מחכות כאן לפני שהן עולות לאלבום ולמסך.
      </p>
    </header>

    <form class="approval-form" @submit.prevent="saveManualApproval">
      <EventSwitchPanel
        title="אישור ידני"
        :items="approvalSwitches"
        :values="approvalConfig"
        @toggle="toggleApproval"
      />
      <div class="form-actions">
        <MainButton :loading="approvalLoading" text="שמור הגדרה" />
      </div>
    </form>

    <div class="queues">
      <section>
        <h2>ממתינות <span>{{ pending.length }}</span></h2>
        <p v-if="pending.length === 0" class="empty">אין תמונות ממתינות.</p>
        <ul v-else class="cards">
          <li v-for="asset in pending" :key="asset.id">
            <figure>
              <img v-if="asset.type !== 'video'" :src="asset.fullPath" alt="תמונה ממתינה" />
              <video v-else :src="asset.fullPath" muted></video>
            </figure>
            <div class="actions">
              <button type="button" :disabled="busyId === asset.id" @click="approve(asset.id)">אישור</button>
              <button type="button" class="ghost" :disabled="busyId === asset.id" @click="hide(asset.id)">
                {{ asset.is_displayed ? "הסתר" : "הצג" }}
              </button>
            </div>
          </li>
        </ul>
      </section>
      <section>
        <h2>חסומות <span>{{ blocked.length }}</span></h2>
        <p v-if="blocked.length === 0" class="empty">אין תמונות חסומות.</p>
        <ul v-else class="cards">
          <li v-for="asset in blocked" :key="asset.id">
            <figure>
              <img v-if="asset.type !== 'video'" :src="asset.fullPath" alt="תמונה חסומה" />
              <video v-else :src="asset.fullPath" muted></video>
              <small v-if="asset.moderation_labels && asset.moderation_labels.length">
                {{ asset.moderation_labels.join(", ") }}
              </small>
            </figure>
            <div class="actions">
              <button type="button" :disabled="busyId === asset.id" @click="approve(asset.id)">אישור</button>
              <button type="button" class="ghost" :disabled="busyId === asset.id" @click="hide(asset.id)">
                {{ asset.is_displayed ? "הסתר" : "הצג" }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEvent, IEventAsset } from "@/helpers/interfaces";
import MainButton from "@/components/library/buttons/MainButton.vue";
import EventSwitchPanel, {
  SwitchItem,
} from "@/components/event/EventSwitchPanel.vue";

export default defineComponent({
  name: "EventModerationView",
  components: { MainButton, EventSwitchPanel },
  data() {
    return {
      busyId: null as number | null,
      approvalLoading: false,
      approvalConfig: {
        manual_photo_approval: false,
      } as Record<string, boolean>,
      approvalSwitches: [
        {
          key: "manual_photo_approval",
          title: "אישור ידני לתמונות",
          hint: "מרגע ההפעלה, תמונות חדשות מחכות לאישור לפני האלבום והמסך",
        },
      ] as SwitchItem[],
    };
  },
  computed: {
    pending(): IEventAsset[] {
      return this.$store.getters["event/getPendingAssets"];
    },
    blocked(): IEventAsset[] {
      return this.$store.getters["event/getBlockedAssets"];
    },
    manualApproval(): boolean {
      return Boolean(this.$store.getters["event/manualPhotoApproval"]);
    },
    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },
  },
  watch: {
    event: {
      immediate: true,
      handler() {
        this.approvalConfig.manual_photo_approval = Boolean(
          this.event?.config?.manual_photo_approval
        );
      },
    },
  },
  async created() {
    if (this.$route.name === "previewModeration") {
      await this.$store.dispatch("event/loadSampleAlbum", "owner");
      return;
    }
    if (!this.$store.getters["event/getEvent"]) return;
    await this.$store.dispatch("event/getEventAssets");
  },
  methods: {
    toggleApproval(key: string) {
      this.approvalConfig[key] = !this.approvalConfig[key];
    },
    async saveManualApproval() {
      this.approvalLoading = true;
      await this.$store.dispatch("event/update", {
        config: { ...this.approvalConfig },
      });
      this.approvalLoading = false;
    },
    async approve(id: number) {
      this.busyId = id;
      await this.$store.dispatch("event/approveAssets", [id]);
      this.busyId = null;
    },
    async hide(id: number) {
      this.busyId = id;
      await this.$store.dispatch("event/hideAssetIds", [id]);
      this.busyId = null;
    },
  },
});
</script>

<style lang="scss" scoped>
.moderation {
  font-family: var(--font, Heebo, sans-serif);
  color: var(--ink, #161310);
  padding: 4px 0 12px;
  background: transparent;
  min-height: 0;
}
.kicker { color: var(--rose, #dc5b66); font-weight: 800; }
h1 { font-weight: 900; font-size: 2rem; margin: 4px 0 8px; }
.moderation-head p { color: var(--muted, #5e564e); max-width: 42rem; }
.note { font-weight: 700; }
.approval-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
  max-width: 720px;
}
.form-actions {
  max-width: 220px;
  margin-inline-start: auto;
  width: 100%;
}
.queues { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
@media (max-width: 800px) { .queues { grid-template-columns: 1fr; } }
h2 { display: flex; gap: 8px; align-items: center; font-weight: 900; }
h2 span {
  background: var(--espresso, #12100e);
  color: #fff;
  border-radius: 999px;
  min-width: 1.6rem;
  text-align: center;
  font-size: 0.85rem;
  padding: 2px 8px;
}
.cards { list-style: none; display: grid; gap: 12px; padding: 0; margin: 12px 0 0; }
.cards li {
  background: var(--paper, #fff);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 16px;
  overflow: hidden;
}
figure { margin: 0; position: relative; }
img, video { width: 100%; height: 180px; object-fit: cover; display: block; background: #111; }
small {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: rgba(18, 16, 14, 0.8);
  color: #fff;
  border-radius: 999px;
  padding: 3px 8px;
}
.actions { display: flex; gap: 8px; padding: 10px; }
button {
  border: 0;
  border-radius: 999px;
  background: var(--espresso, #12100e);
  color: #fff;
  font-weight: 800;
  padding: 8px 14px;
  cursor: pointer;
  font-family: inherit;
}
button.ghost { background: transparent; color: var(--ink, #161310); border: 1px solid var(--line, rgba(22, 19, 16, 0.2)); }
button:disabled { opacity: 0.6; cursor: progress; }
.empty { color: var(--muted, #5e564e); }
</style>
