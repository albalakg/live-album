<template>
  <div class="gallery-page">
    <header class="page-head">
      <p class="kicker">מסך חי</p>
      <h1>אלבום חי</h1>
      <p class="lede">
        בחירת פריסה למסך באולם, מה מוצג עליו, וקישור לתצוגה המלאה.
      </p>
    </header>

    <section class="links-card">
      <h2>תצוגת המסך החי</h2>
      <div class="link-row">
        <div class="link-meta">
          <strong>קישור לאלבום החי</strong>
          <small class="link-url" dir="ltr">{{ liveAlbumUrl }}</small>
        </div>
        <div class="link-actions">
          <span class="file-count">סה״כ {{ totalAssets }} קבצים</span>
          <router-link
            class="ghost-btn"
            to="/event/gallery/full-screen"
            target="_blank"
          >
            צפייה במסך החי
          </router-link>
          <CopyLinkButton :text="liveAlbumUrl" />
        </div>
      </div>
    </section>

    <form class="settings-form" @submit.prevent="submit">
      <section class="layout-card">
        <h2>פריסת האלבום</h2>
        <p class="section-lede">איך התמונות יופיעו על המסך באולם.</p>
        <div class="layout-options" role="radiogroup" aria-label="פריסת האלבום">
          <button
            v-for="option in albumsSelectOptions"
            :key="option.value"
            type="button"
            class="layout-option"
            :class="{ 'layout-option--active': form.selectedAlbum === option.value }"
            role="radio"
            :aria-checked="form.selectedAlbum === option.value"
            @click="form.selectedAlbum = option.value"
          >
            <span class="layout-preview" :data-layout="option.preview" aria-hidden="true">
              <span v-for="n in option.slots" :key="n" class="layout-slot" />
            </span>
            <span class="layout-copy">
              <strong>{{ option.label }}</strong>
              <small>{{ option.hint }}</small>
            </span>
          </button>
        </div>
        <div
          v-if="hasBlockedAssets"
          class="blocked-gallery-toggle"
        >
          <label class="blocked-toggle">
            <input
              type="checkbox"
              :checked="showBlockedGalleryAssets"
              @change="toggleBlockedGalleryAssets"
            />
            <span>הצג תמונות חסומות בתצוגה המקדימה</span>
          </label>
          <small class="blocked-toggle-note">
            לצפייה בלבד — תמונות חסומות לא מוצגות לאורחים עד שתבטלו את החסימה.
          </small>
        </div>
        <div class="form-actions">
          <MainButton :loading="loading" text="שמור פריסה" />
        </div>
      </section>
    </form>

    <form class="settings-form" @submit.prevent="saveLiveConfig">
      <EventSwitchPanel
        title="מה מוצג באלבום החי"
        lede="שליטה על תמונות אורחים, תמונות שלכם, וכרטיס QR על המסך."
        :items="liveSwitches"
        :values="liveConfig"
        @toggle="toggleLive"
      />
      <div class="form-actions">
        <MainButton :loading="configLoading" text="שמור הגדרות תצוגה" />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import MainButton from "@/components/library/buttons/MainButton.vue";
import EventSwitchPanel, {
  SwitchItem,
} from "@/components/event/EventSwitchPanel.vue";
import CopyLinkButton from "@/components/ui/CopyLinkButton.vue";
import { defineComponent } from "vue";
import { IEvent } from "@/helpers/interfaces";

type LiveConfigKey =
  | "preview_guests_assets_in_gallery"
  | "preview_owners_assets_in_gallery"
  | "preview_qr_in_gallery";

type AlbumOption = {
  value: string;
  label: string;
  hint: string;
  preview: "single" | "random" | "split";
  slots: number;
};

export default defineComponent({
  name: "EventGalleryView",

  components: {
    MainButton,
    CopyLinkButton,
    EventSwitchPanel,
  },

  data() {
    return {
      albumsSelectOptions: [
        {
          value: "EventGallerySingle",
          label: "אלבום רגיל",
          hint: "תמונה אחת גדולה שמתחלפת",
          preview: "single",
          slots: 1,
        },
        {
          value: "EventGalleryRandom",
          label: "אלבום קופץ",
          hint: "כמה תמונות מופיעות יחד בתנועה",
          preview: "random",
          slots: 4,
        },
        {
          value: "EventGallerySplitScreen",
          label: "חלוקת מסך",
          hint: "שתי תמונות זו לצד זו",
          preview: "split",
          slots: 2,
        },
        {
          value: "EventGalleryGrid3X3",
          label: "רשת 3×3",
          hint: "הצעה חדשה · תשע תמונות יחד",
          preview: "split",
          slots: 9,
        },
      ] as AlbumOption[],
      loading: false as boolean,
      configLoading: false as boolean,
      liveConfig: {
        preview_guests_assets_in_gallery: false,
        preview_owners_assets_in_gallery: false,
        preview_qr_in_gallery: false,
      } as Record<LiveConfigKey, boolean>,
      liveSwitches: [
        {
          key: "preview_guests_assets_in_gallery",
          title: "תמונות אורחים בגלריה",
          hint: "להציג את תמונות האורחים באלבום החי",
        },
        {
          key: "preview_owners_assets_in_gallery",
          title: "תמונות אישיות בגלריה",
          hint: "להציג את התמונות האישיות שלכם באלבום החי",
        },
        {
          key: "preview_qr_in_gallery",
          title: "כרטיס QR על המסך",
          hint: "להציג את כרטיס ה־QR ליד האלבום החי",
        },
      ] as SwitchItem[],
      form: {
        selectedAlbum: "EventGallerySingle" as string,
      },
    };
  },

  created() {
    this.$store.dispatch("event/getEventGalleryAssets");
    this.$store.dispatch("event/getEventAssets");
    this.setForm();
  },

  computed: {
    totalAssets(): number {
      return this.$store.getters["event/getTotalAssets"];
    },

    eventPath(): string {
      return this.$store.getters["event/getEventPath"];
    },

    liveAlbumUrl(): string {
      return `${window.location.origin}/event/open-album/${this.eventPath}`;
    },

    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },

    hasBlockedAssets(): boolean {
      return this.$store.getters["event/hasBlockedAssets"];
    },

    showBlockedGalleryAssets(): boolean {
      return this.$store.getters["event/showBlockedGalleryAssets"];
    },
  },

  watch: {
    event: {
      immediate: true,
      handler() {
        this.syncLiveConfig();
        this.setForm();
      },
    },
  },

  methods: {
    setForm() {
      this.form.selectedAlbum =
        this.event?.config?.displayed_gallery || "EventGallerySingle";
    },

    syncLiveConfig() {
      const cfg = this.event?.config;
      this.liveConfig.preview_guests_assets_in_gallery =
        cfg?.preview_guests_assets_in_gallery ?? false;
      this.liveConfig.preview_owners_assets_in_gallery =
        cfg?.preview_owners_assets_in_gallery ?? false;
      this.liveConfig.preview_qr_in_gallery =
        cfg?.preview_qr_in_gallery ?? false;
    },

    toggleLive(key: string) {
      const k = key as LiveConfigKey;
      this.liveConfig[k] = !this.liveConfig[k];
    },

    async saveLiveConfig() {
      this.configLoading = true;
      await this.$store.dispatch("event/update", {
        config: { ...this.liveConfig },
      });
      this.configLoading = false;
    },

    async submit() {
      this.loading = true;
      await this.$store.dispatch("event/updateGallerySettings", this.form);
      this.loading = false;
    },

    toggleBlockedGalleryAssets(event: Event) {
      const target = event.target as HTMLInputElement;
      this.$store.dispatch(
        "event/setShowBlockedGalleryAssets",
        target.checked
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.gallery-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  font-family: var(--font, Heebo, sans-serif);
  color: var(--ink, #161310);
}

.page-head .kicker {
  color: var(--rose, #dc5b66);
  font-weight: 800;
  margin: 0;
}

.page-head h1 {
  margin: 4px 0 0;
  font-weight: 900;
  font-size: clamp(1.55rem, 2.4vw, 2rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.lede {
  margin: 8px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.95rem;
  line-height: 1.45;
  max-width: 52ch;
}

.links-card,
.layout-card,
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.links-card,
.layout-card {
  background: rgba(22, 19, 16, 0.02);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 18px;
}

.links-card h2,
.layout-card h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
}

.section-lede {
  margin: -4px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.88rem;
  line-height: 1.4;
}

.link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.link-meta {
  flex: 1;
  min-width: 0;
  text-align: start;
}

.link-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  flex-wrap: wrap;
}

.link-meta strong {
  display: block;
  font-size: 0.95rem;
}

.link-url {
  display: block;
  margin-top: 2px;
  color: var(--muted, #5e564e);
  font-size: 0.82rem;
  direction: ltr;
  unicode-bidi: isolate;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-count {
  color: var(--muted, #5e564e);
  font-size: 0.88rem;
  font-weight: 700;
  white-space: nowrap;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 999px;
  padding: 14px 28px;
  text-decoration: none;
  background: transparent;
  color: var(--ink, #161310);
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.ghost-btn:hover {
  border-color: var(--ink, #161310);
}

.layout-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media only screen and (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.layout-option {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: start;
  padding: 14px;
  border-radius: 16px;
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.12));
  background: #fffcfa;
  cursor: pointer;
  color: inherit;
  font: inherit;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.layout-option:hover {
  border-color: rgba(22, 19, 16, 0.28);
}

.layout-option--active {
  border-color: var(--rose, #dc5b66);
  background: rgba(220, 91, 102, 0.06);
  transform: translateY(-1px);
}

.layout-preview {
  display: grid;
  gap: 6px;
  height: 88px;
  padding: 10px;
  border-radius: 12px;
  background: #1c1814;
}

.layout-preview[data-layout="single"] {
  grid-template-columns: 1fr;
}

.layout-preview[data-layout="split"] {
  grid-template-columns: 1fr 1fr;
}

.layout-preview[data-layout="random"] {
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: 1fr 1fr;
}

.layout-preview[data-layout="random"] .layout-slot:nth-child(1) {
  grid-row: 1 / 3;
}

.layout-slot {
  display: block;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(220, 91, 102, 0.55), rgba(201, 163, 106, 0.45));
  opacity: 0.9;
}

.layout-copy strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 800;
}

.layout-copy small {
  display: block;
  margin-top: 4px;
  color: var(--muted, #5e564e);
  line-height: 1.35;
}

.blocked-gallery-toggle {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 4px;
}

.blocked-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  cursor: pointer;
}

.blocked-toggle input {
  accent-color: #dc5b66;
  margin: 0;
}

.blocked-toggle-note {
  color: var(--muted, #5e564e);
  line-height: 1.4;
  font-size: 0.82rem;
}

.form-actions {
  max-width: 280px;
  margin-inline-start: auto;
  width: 100%;
}
</style>
