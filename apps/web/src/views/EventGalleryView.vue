<template>
  <div class="event-gallery">
    <header class="page-head">
      <p class="kicker">מסך חי</p>
      <h1>אלבום חי</h1>
      <p class="lede">פריסת המסך, מה מוצג באולם, וקישור לתצוגה המלאה.</p>
    </header>

    <div class="gallery-top display--flex justify--space-between align--center">
      <div class="display--flex align--center" v-if="$bp.isMediumAndUp">
        <div class="width--full-mobile">
          <router-link to="/event/gallery/full-screen">
            <MainButton text="צפייה במסך החי" class="gallery-button" />
          </router-link>
        </div>
        <div class="display--flex align--center width--full-mobile">
          <div class="icon-wrapper">
            <MainIcon clickable icon="content_copy" @onClick="copyUrl()" />
          </div>
          <small>{{ copyText }}</small>
        </div>
      </div>
      <template v-else>
        <div class="width--full-mobile margin--top-large">
          <div class="width--full-mobile">
            <router-link to="/event/gallery/full-screen">
              <MainButton text="צפייה במסך החי" class="gallery-button" />
            </router-link>
          </div>
          <div
            class="display--flex align--center width--full-mobile margin--top-small"
          >
            <div class="icon-wrapper">
              <MainIcon clickable icon="content_copy" @onClick="copyUrl()" />
            </div>
            <small>{{ copyText }}</small>
          </div>
        </div>
      </template>
      <span v-if="$bp.isMediumAndUp" class="title--small"
        >סה"כ {{ totalAssets }} קבצים</span
      >
    </div>
    <div class="gallery-content brs--medium">
      <!-- <EventGallery rounded hideMenu /> -->
      <div class="width--three-corner width--full-mobile gallery-wrapper">
        <component :is="form.selectedAlbum"></component>
      </div>
      <div
        class="width--corner bg--white brs--medium padding--medium flex--column align--center justify--center width--full-mobile"
      >
        <h1 class="title--large">אלבום תמונות</h1>
        <br />
        <MainSelect
          :options="albumsSelectOptions"
          v-model="form.selectedAlbum"
          ref="actionSelect"
          placeholder="בחר את האלבום"
          title="בחר את האלבום"
        />
        <br />
        <!-- <MainInput
          v-model="form.imageDisplayTime"
          type="number"
          size="medium"
          title="זמן תצוגת תמונה (שניות)"
        />
        <br />
        <MainInput
          v-model="form.videoDisplayTime"
          type="number"
          size="medium"
          title="זמן תצוגת וידאו (שניות)"
        />
        <br> -->
        <MainButton :loading="loading" text="שמור פריסה" @onClick="submit()" />
        <div
          v-if="hasBlockedAssets"
          class="blocked-gallery-toggle margin--top-medium width--full"
        >
          <label class="blocked-toggle pointer display--flex align--center">
            <input
              type="checkbox"
              :checked="showBlockedGalleryAssets"
              @change="toggleBlockedGalleryAssets"
            />
            <span class="margin--right-small">הצג תמונות חסומות בתצוגה המקדימה</span>
          </label>
          <small class="blocked-toggle-note display--block margin--top-small">
            לצפייה בלבד — תמונות חסומות לא מוצגות לאורחים עד שתבטלו את החסימה.
          </small>
        </div>
      </div>
    </div>

    <form class="live-settings" @submit.prevent="saveLiveConfig">
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
import EventGallerySingle from "@/components/event/EventGallerySingle.vue";
import EventGallerySplitScreen from "@/components/event/EventGallerySplitScreen.vue";
import EventGalleryRandom from "@/components/event/EventGalleryRandom.vue";
import EventGalleryGrid3X3 from "@/components/event/EventGalleryGrid3X3.vue";
import EventSwitchPanel, {
  SwitchItem,
} from "@/components/event/EventSwitchPanel.vue";

import MainIcon from "@/components/library/general/MainIcon.vue";
import { defineComponent } from "vue";
import MainSelect from "@/components/library/inputs/MainSelect.vue";
import MainInput from "@/components/library/inputs/MainInput.vue";
import { IEvent } from "@/helpers/interfaces";

type LiveConfigKey =
  | "preview_guests_assets_in_gallery"
  | "preview_owners_assets_in_gallery"
  | "preview_qr_in_gallery";

export default defineComponent({
  name: "EventGalleryView",

  components: {
    MainButton,
    EventGallerySingle,
    MainIcon,
    MainSelect,
    EventGalleryRandom,
    EventGalleryGrid3X3,
    EventGallerySplitScreen,
    MainInput,
    EventSwitchPanel,
  },

  data() {
    return {
      galleryPollIntervalId: null as ReturnType<typeof setInterval> | null,
      textCopied: false as boolean,
      albumsSelectOptions: [
        { value: "EventGallerySingle", label: "אלבום תמונות רגיל" },
        { value: "EventGalleryRandom", label: "אלבום תמונות קופצות" },
        { value: "EventGallerySplitScreen", label: "אלבום תמונות חלוקה מסך" },
        // { value: "EventGalleryGrid3X3", label: "אלבום תמונות רשת 3x3" },
      ] as { value: string; label: string }[],
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
        // imageDisplayTime: 3 as number,
        // videoDisplayTime: 8 as number,
      },
    };
  },

  created() {
    this.$store.dispatch("event/getEventGalleryAssets");
    this.$store.dispatch("event/getEventAssets");
    this.galleryPollIntervalId = setInterval(() => {
      this.$store.dispatch("event/getEventGalleryAssets");
    }, 10000);
    this.setForm();
  },

  beforeUnmount() {
    if (this.galleryPollIntervalId) {
      clearInterval(this.galleryPollIntervalId);
      this.galleryPollIntervalId = null;
    }
  },

  computed: {
    totalAssets(): number {
      return this.$store.getters["event/getTotalAssets"];
    },

    copyText(): string {
      return this.textCopied ? "הקישור הועתק" : "לחצו להעתקת הקישור לאלבום החי";
    },

    eventPath(): string {
      return this.$store.getters["event/getEventPath"];
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
      },
    },
  },

  methods: {
    setForm() {
      this.form.selectedAlbum = this.event.config.displayed_gallery || "EventGallerySingle";
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

    copyUrl() {
      this.copyTextToClipboard(
        window.location.origin + `/event/open-album/${this.eventPath}`
      );
    },

    toggleBlockedGalleryAssets(event: Event) {
      const target = event.target as HTMLInputElement;
      this.$store.dispatch(
        "event/setShowBlockedGalleryAssets",
        target.checked
      );
    },

    fallbackCopyTextToClipboard(text: string) {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          this.textCopied = true;
          setTimeout(() => {
            this.textCopied = false;
          }, 2000);
        }
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }

      document.body.removeChild(textArea);
    },

    copyTextToClipboard(text: string) {
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text);
        return;
      }

      navigator.clipboard.writeText(text).then(
        () => {
          this.textCopied = true;
          setTimeout(() => {
            this.textCopied = false;
          }, 2000);
        },
        (err) => {
          console.error("Async: Could not copy text: ", err);
          this.fallbackCopyTextToClipboard(text);
        }
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.event-gallery {
  width: 100%;
  min-height: fit-content;
  font-family: var(--font, Heebo, sans-serif);
  color: var(--ink, #161310);
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.gallery-top {
  min-height: 50px;
  width: 100%;
  gap: 12px;

  .icon-wrapper {
    margin-inline-start: 10px;
  }
}

.live-settings {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-actions {
  max-width: 260px;
  margin-inline-start: auto;
  width: 100%;
}

.gallery-content {
  min-height: fit-content;
  margin-top: 12px;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(240px, 0.9fr);
  gap: 16px;

  @media only screen and (max-width: 900px) {
    grid-template-columns: 1fr;

    .gallery-wrapper {
      min-height: 220px;
    }
  }
}

.gallery-content > .bg--white,
.gallery-content > div:last-child {
  background: #fffcfa !important;
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  box-shadow: none;
}

.blocked-gallery-toggle {
  text-align: start;
}

.blocked-toggle {
  gap: 8px;
  font-weight: 700;
}

.blocked-toggle input {
  accent-color: #dc5b66;
  margin-inline-start: 0;
  margin-inline-end: 8px;
}

.blocked-toggle-note {
  color: var(--muted, #5e564e);
  line-height: 1.4;
}
</style>
