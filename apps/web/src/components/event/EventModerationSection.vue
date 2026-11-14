<template>
  <section class="moderation">
    <header class="moderation-head">
      <p>
        תמונות ממתינות או חסומות. סרטונים אינם נבדקים אוטומטית.
      </p>
      <p v-if="manualApproval" class="note">
        אישור ידני פעיל — תמונות חדשות מחכות כאן לפני האלבום והמסך.
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

    <div class="bulk-bar" v-if="selectedIds.length">
      <span>{{ selectedIds.length }} נבחרו</span>
      <button type="button" class="bulk-approve" :disabled="busyBulk" @click="bulkApprove">
        אישור {{ selectedIds.length }}
      </button>
      <button type="button" class="ghost" @click="selectedIds = []">ביטול בחירה</button>
    </div>

    <div class="queues">
      <section>
        <h3>ממתינות <span>{{ pending.length }}</span></h3>
        <p v-if="pending.length === 0" class="empty">אין תמונות ממתינות.</p>
        <ul v-else class="cards">
          <li v-for="asset in pending" :key="asset.id" :class="{ sel: selectedIds.includes(asset.id) }">
            <figure>
              <img v-if="asset.type !== 'video'" :src="asset.fullPath" alt="תמונה ממתינה" />
              <video v-else :src="asset.fullPath" muted></video>
              <button
                type="button"
                class="pick"
                :aria-pressed="selectedIds.includes(asset.id)"
                @click="toggleSelect(asset.id)"
              ></button>
            </figure>
            <div class="actions">
              <button type="button" :disabled="busyId === asset.id" @click="approve(asset.id)">אישור</button>
              <button type="button" class="ghost" :disabled="busyId === asset.id" @click="hide(asset.id)">
                הסתרה
              </button>
            </div>
          </li>
        </ul>
      </section>
      <section>
        <h3>חסומות <span>{{ blocked.length }}</span></h3>
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
  name: "EventModerationSection",
  components: { MainButton, EventSwitchPanel },
  data() {
    return {
      busyId: null as number | null,
      busyBulk: false,
      selectedIds: [] as number[],
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
    toggleSelect(id: number) {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter((x) => x !== id);
      } else {
        this.selectedIds = [...this.selectedIds, id];
      }
    },
    async approve(id: number) {
      this.busyId = id;
      await this.$store.dispatch("event/approveAssets", [id]);
      this.selectedIds = this.selectedIds.filter((x) => x !== id);
      this.busyId = null;
    },
    async bulkApprove() {
      if (!this.selectedIds.length) return;
      this.busyBulk = true;
      const ids = [...this.selectedIds];
      await this.$store.dispatch("event/approveAssets", ids);
      this.selectedIds = [];
      this.busyBulk = false;
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
  padding: 16px 18px 20px;
  background: transparent;
  border: 0;
  border-radius: 0;
  min-height: 0;
}
.moderation-head p {
  color: var(--muted, #5e564e);
  max-width: 42rem;
  margin: 0 0 6px;
  font-size: 0.92rem;
  line-height: 1.45;
}
.note { font-weight: 700; }
.approval-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
  max-width: 720px;
}
.form-actions {
  max-width: 280px;
  margin-inline-start: auto;
  width: 100%;
}
.queues { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
@media (max-width: 800px) { .queues { grid-template-columns: 1fr; } }
h3 { display: flex; gap: 8px; align-items: center; font-weight: 900; margin: 0; }
h3 span {
  background: var(--espresso, #12100e);
  color: #fff;
  border-radius: 999px;
  min-width: 1.6rem;
  text-align: center;
  font-size: 0.85rem;
  padding: 2px 8px;
}
.cards { list-style: none; display: grid; gap: 12px; padding: 0; margin: 12px 0 0; }
.bulk-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
  font-weight: 800;
}
.bulk-approve {
  border: 0;
  border-radius: 999px;
  padding: 8px 16px;
  background: #12100e;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}
.cards li {
  background: var(--paper, #fff);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 16px;
  overflow: hidden;
}
.cards li.sel {
  box-shadow: 0 0 0 3px #c9a36a;
}
figure { margin: 0; position: relative; }
.pick {
  position: absolute;
  top: 10px;
  inset-inline-start: 10px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid #fff;
  background: rgba(18, 16, 14, 0.35);
  cursor: pointer;
}
.pick[aria-pressed="true"] {
  background: #c9a36a;
}
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
