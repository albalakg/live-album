<template>
  <div class="gallery-page">
    <header class="page-head">
      <p class="kicker">מסך חי</p>
      <h1>אלבום חי</h1>
      <p class="lede">
        בחירת מצב תצוגה למסך באולם, אפשרויות משותפות, ותצוגה מקדימה לפני המסך
        המלא.
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

    <form class="settings-form" @submit.prevent="saveAll">
      <section class="layout-card">
        <h2>מצב תצוגה</h2>
        <p class="section-lede">איך התמונות יופיעו על המסך באולם.</p>
        <div class="layout-options" role="radiogroup" aria-label="מצב תצוגה">
          <button
            v-for="option in albumsSelectOptions"
            :key="option.id"
            type="button"
            class="layout-option"
            :class="{
              'layout-option--active': form.selectedAlbum === option.id,
            }"
            role="radio"
            :aria-checked="form.selectedAlbum === option.id"
            @click="form.selectedAlbum = option.id"
          >
            <LiveScreenModeThumb
              :preview="option.preview"
              :slots="option.slots"
            />
            <span class="layout-copy">
              <strong>{{ option.label }}</strong>
              <small>{{ option.hint }}</small>
            </span>
          </button>
        </div>

        <div class="mode-options" v-if="activeMode">
          <h3>אפשרויות למצב</h3>
          <div class="timing-grid">
            <label
              v-if="activeMode.optionKeys.includes('ken_burns_intensity')"
              class="field"
            >
              <span>עוצמת קן ברנס</span>
              <select v-model="liveOptions.ken_burns_intensity" class="txt">
                <option value="subtle">עדין</option>
                <option value="medium">בינוני</option>
              </select>
            </label>
            <label
              v-if="activeMode.optionKeys.includes('spotlight_hold_seconds')"
              class="field"
            >
              <span>שניות בספוטלייט</span>
              <input
                class="txt"
                type="number"
                min="2"
                max="30"
                v-model.number="liveOptions.spotlight_hold_seconds"
              />
            </label>
            <label
              v-if="activeMode.optionKeys.includes('mosaic_size')"
              class="field"
            >
              <span>גודל פסיפס</span>
              <select v-model="liveOptions.mosaic_size" class="txt">
                <option value="3x3">3×3</option>
                <option value="4x4">4×4</option>
              </select>
            </label>
            <label
              v-if="activeMode.optionKeys.includes('masonry_density')"
              class="field"
            >
              <span>צפיפות קיר</span>
              <select v-model="liveOptions.masonry_density" class="txt">
                <option value="cozy">נוח</option>
                <option value="dense">צפוף</option>
              </select>
            </label>
            <label
              v-if="activeMode.optionKeys.includes('polaroid_count')"
              class="field"
            >
              <span>מספר כרטיסים</span>
              <input
                class="txt"
                type="number"
                min="8"
                max="12"
                v-model.number="liveOptions.polaroid_count"
              />
            </label>
          </div>
        </div>

        <div class="preview-frame" aria-label="תצוגה מקדימה 16:9">
          <div class="preview-stage">
            <component :is="form.selectedAlbum" />
          </div>
        </div>

        <div v-if="hasBlockedAssets" class="blocked-gallery-toggle">
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
      </section>

      <EventSwitchPanel
        title="מה מוצג באלבום החי"
        lede="שליטה על תמונות אורחים, תמונות שלכם, וכרטיס QR על המסך."
        :items="liveSwitches"
        :values="liveConfig"
        @toggle="toggleLive"
      />

      <section class="shared-options">
        <h2>הגדרות משותפות</h2>
        <div class="timing-grid">
          <label class="field">
            <span>שניות לתמונה</span>
            <input
              class="txt"
              type="number"
              min="1"
              max="120"
              v-model.number="timing.image_display_time"
            />
          </label>
          <label class="field">
            <span>שניות לסרטון</span>
            <input
              class="txt"
              type="number"
              min="1"
              max="300"
              v-model.number="timing.video_display_time"
            />
          </label>
          <label class="field">
            <span>פינת QR</span>
            <select v-model="liveOptions.qr_corner" class="txt">
              <option value="bottom-start">תחתית־התחלה (ברירת מחדל)</option>
              <option value="bottom-end">תחתית־סוף</option>
              <option value="top-start">ראש־התחלה</option>
              <option value="top-end">ראש־סוף</option>
            </select>
          </label>
        </div>
      </section>

      <div class="form-actions">
        <MainButton :loading="loading" text="שמור הגדרות מסך חי" />
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
import LiveScreenModeThumb from "@/components/event/LiveScreenModeThumb.vue";
import EventGallerySingle from "@/components/event/EventGallerySingle.vue";
import EventGallerySplitScreen from "@/components/event/EventGallerySplitScreen.vue";
import EventGalleryRandom from "@/components/event/EventGalleryRandom.vue";
import EventGalleryGrid3X3 from "@/components/event/EventGalleryGrid3X3.vue";
import EventGalleryKenBurns from "@/components/event/EventGalleryKenBurns.vue";
import EventGallerySpotlight from "@/components/event/EventGallerySpotlight.vue";
import EventGalleryMosaic from "@/components/event/EventGalleryMosaic.vue";
import EventGalleryMasonry from "@/components/event/EventGalleryMasonry.vue";
import EventGalleryPolaroid from "@/components/event/EventGalleryPolaroid.vue";
import EventGalleryFilmstrip from "@/components/event/EventGalleryFilmstrip.vue";
import EventGalleryFadeShow from "@/components/event/EventGalleryFadeShow.vue";
import EventGallerySplitPair from "@/components/event/EventGallerySplitPair.vue";
import EventGalleryHeroGrid from "@/components/event/EventGalleryHeroGrid.vue";
import { defineComponent } from "vue";
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import { IEvent } from "@/helpers/interfaces";
import {
  DEFAULT_LIVE_GALLERY,
  LIVE_SCREEN_MODES,
  mergeLiveScreenOptions,
  resolveLiveGalleryMode,
  type LiveScreenOptions,
} from "@/helpers/liveScreenModes";
import type { EventGalleryType } from "@/helpers/types";

type LiveConfigKey =
  | "preview_guests_assets_in_gallery"
  | "preview_owners_assets_in_gallery"
  | "preview_qr_in_gallery";

export default defineComponent({
  name: "EventGalleryView",

  components: {
    MainButton,
    CopyLinkButton,
    EventSwitchPanel,
    LiveScreenModeThumb,
    EventGallerySingle,
    EventGallerySplitScreen,
    EventGalleryRandom,
    EventGalleryGrid3X3,
    EventGalleryKenBurns,
    EventGallerySpotlight,
    EventGalleryMosaic,
    EventGalleryMasonry,
    EventGalleryPolaroid,
    EventGalleryFilmstrip,
    EventGalleryFadeShow,
    EventGallerySplitPair,
    EventGalleryHeroGrid,
  },

  data() {
    return {
      albumsSelectOptions: LIVE_SCREEN_MODES,
      loading: false as boolean,
      liveConfig: {
        preview_guests_assets_in_gallery: false,
        preview_owners_assets_in_gallery: false,
        preview_qr_in_gallery: true,
      } as Record<LiveConfigKey, boolean>,
      timing: {
        image_display_time: 3 as number,
        video_display_time: 8 as number,
      },
      liveOptions: mergeLiveScreenOptions(null),
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
        selectedAlbum: DEFAULT_LIVE_GALLERY as EventGalleryType,
      },
      savedSnapshot: "" as string,
    };
  },

  created() {
    this.$store.dispatch("event/getEventGalleryAssets");
    this.$store.dispatch("event/getEventAssets");
    this.syncFromEvent();
  },

  beforeRouteLeave(
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    if (
      this.isDirty &&
      !window.confirm("יש שינויים שלא נשמרו. לעזוב בלי לשמור?")
    ) {
      next(false);
      return;
    }
    next();
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

    activeMode(): (typeof LIVE_SCREEN_MODES)[number] | null {
      return (
        LIVE_SCREEN_MODES.find((mode) => mode.id === this.form.selectedAlbum) ||
        null
      );
    },

    currentSnapshot(): string {
      return JSON.stringify({
        selectedAlbum: this.form.selectedAlbum,
        liveConfig: this.liveConfig,
        timing: this.timing,
        liveOptions: this.liveOptions,
      });
    },

    isDirty(): boolean {
      return this.currentSnapshot !== this.savedSnapshot;
    },
  },

  watch: {
    event: {
      immediate: true,
      handler() {
        this.syncFromEvent();
      },
    },
  },

  methods: {
    syncFromEvent() {
      const cfg = this.event?.config;
      this.form.selectedAlbum = resolveLiveGalleryMode(cfg?.displayed_gallery);
      this.liveConfig.preview_guests_assets_in_gallery =
        cfg?.preview_guests_assets_in_gallery ?? false;
      this.liveConfig.preview_owners_assets_in_gallery =
        cfg?.preview_owners_assets_in_gallery ?? false;
      this.liveConfig.preview_qr_in_gallery =
        cfg?.preview_qr_in_gallery ?? true;
      this.timing.image_display_time = Number(cfg?.image_display_time) || 3;
      this.timing.video_display_time = Number(cfg?.video_display_time) || 8;
      this.liveOptions = mergeLiveScreenOptions(
        (cfg?.live_screen_options || null) as LiveScreenOptions | null
      );
      this.$nextTick(() => {
        this.savedSnapshot = this.currentSnapshot;
      });
    },

    toggleLive(key: string) {
      const k = key as LiveConfigKey;
      this.liveConfig[k] = !this.liveConfig[k];
    },

    async saveAll() {
      this.loading = true;
      const config: Record<string, string | number | object> = {};
      (Object.keys(this.liveConfig) as LiveConfigKey[]).forEach((key) => {
        config[key] = this.liveConfig[key] ? "true" : "false";
      });
      config.image_display_time = this.timing.image_display_time;
      config.video_display_time = this.timing.video_display_time;
      config.displayed_gallery = this.form.selectedAlbum;
      config.live_screen_options = { ...this.liveOptions };

      const [layoutResult, configResult] = await Promise.all([
        this.$store.dispatch("event/updateGallerySettings", {
          selectedAlbum: this.form.selectedAlbum,
          live_screen_options: { ...this.liveOptions },
        }),
        this.$store.dispatch("event/update", { config }),
      ]);
      this.loading = false;
      if (layoutResult || configResult) {
        this.savedSnapshot = this.currentSnapshot;
      }
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
.settings-form,
.shared-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.links-card,
.layout-card,
.shared-options {
  background: rgba(22, 19, 16, 0.02);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 18px;
}

.links-card h2,
.layout-card h2,
.shared-options h2,
.mode-options h3 {
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
}

.layout-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media only screen and (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media only screen and (max-width: 700px) {
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
  transition: border-color 0.2s ease, background-color 0.2s ease,
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

.preview-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(22, 19, 16, 0.12);
  background: #070605;
}

.preview-stage {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.preview-stage :deep(.stage),
.preview-stage :deep(.kb),
.preview-stage :deep(.spot),
.preview-stage :deep(.mosaic-wall),
.preview-stage :deep(.masonry),
.preview-stage :deep(.polaroid),
.preview-stage :deep(.film),
.preview-stage :deep(.fade-show),
.preview-stage :deep(.pair),
.preview-stage :deep(.hero-grid),
.preview-stage :deep(.gallery),
.preview-stage :deep(.gallery-grid),
.preview-stage :deep(.split-gallery),
.preview-stage :deep(.collage-container) {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
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
  max-width: 320px;
  margin-inline-start: auto;
  width: 100%;
}

.timing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field > span {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 800;
  color: #8a8278;
}

.txt {
  border: 1.5px solid rgba(22, 19, 16, 0.11);
  border-radius: 14px;
  padding: 12px 14px;
  font: inherit;
  background: #fffcfa;
}

@media (max-width: 700px) {
  .timing-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .layout-option {
    transition: none;
  }
}
</style>
