<template>
  <form @submit.prevent="submit()" class="event-form">
    <div class="card details-card">
      <div class="details-grid">
        <div class="fields">
          <label class="field">
            <span>שם האירוע</span>
            <input v-model="form.name" class="txt" type="text" />
            <small v-if="errors.name" class="hint hint--error">{{ errors.name }}</small>
          </label>

          <div class="field" :class="{ disabled: !isPending }">
            <span>תאריך ושעה</span>
            <VueDatePicker
              :disabled="!isPending"
              class="date-picker"
              :min-date="minDate"
              locale="he"
              :format="format"
              v-model="form.starts_at"
              select-text="בחר"
              cancel-text="בטל"
              :day-names="days"
            />
            <small class="hint" v-show="!isPending">
              ניתן לשנות את התאריך רק בסטטוס ממתין
            </small>
            <small class="hint hint--error" v-if="errors.starts_at">{{ errors.starts_at }}</small>
          </div>

          <div class="field">
            <span>
              סוג האירוע
              <em class="neu">הצעה חדשה</em>
            </span>
            <div class="type-pills">
              <button
                v-for="t in eventTypes"
                :key="t.id"
                type="button"
                class="pill"
                :class="{ on: form.event_type === t.id }"
                @click="form.event_type = t.id"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="cover"
          :class="{ 'cover--empty': !previewUrl, 'is-dragging': isDragging }"
          :style="previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined"
          role="button"
          tabindex="0"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          @click="openFilePicker"
          @keydown.enter.prevent="openFilePicker"
          @keydown.space.prevent="openFilePicker"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            hidden
            @change="onFileInput"
          />
          <div v-if="!previewUrl" class="cover-empty">
            <span class="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span>
            <strong>העלאת תמונת כיסוי</strong>
            <span>לחצו או גררו תמונה לכאן</span>
          </div>
          <button v-else type="button" class="cover-swap" @click.stop="openFilePicker">
            החלפת תמונת הכיסוי
          </button>
        </div>
      </div>
    </div>

    <div class="card switches-card">
      <h2>תצוגה לאורחים</h2>
      <div class="switch-list">
        <label v-for="item in mainSwitches" :key="item.key" class="switch-row">
          <div>
            <strong>{{ item.title }}</strong>
            <small>{{ item.hint }}</small>
          </div>
          <input type="checkbox" v-model="config[item.key]" />
        </label>
      </div>

      <details class="more">
        <summary>הגדרות נוספות</summary>
        <div class="switch-list">
          <label v-for="item in moreSwitches" :key="item.key" class="switch-row">
            <div>
              <strong>{{ item.title }}</strong>
              <small>{{ item.hint }}</small>
            </div>
            <input type="checkbox" v-model="config[item.key]" />
          </label>
        </div>
      </details>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? "שומר..." : "שמירה" }}
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEvent } from "@/helpers/interfaces";
import Time from "@/helpers/time";
import { notify } from "@/helpers/notify";
import { QR_EVENT_TYPES } from "@/helpers/qrCardCatalog";

type ConfigKey =
  | "preview_site_display_name"
  | "preview_site_display_date"
  | "preview_site_display_image"
  | "video_upload_enabled"
  | "manual_photo_approval"
  | "preview_guests_assets_in_gallery"
  | "preview_owners_assets_in_gallery"
  | "preview_link_to_album_page_from_upload_page";

export default defineComponent({
  name: "EventDetailsForm",

  data() {
    return {
      form: {
        name: "" as string,
        starts_at: "" as string,
        image: null as File | null,
        event_type: "" as string,
      },
      config: {
        preview_site_display_name: true,
        preview_site_display_date: true,
        preview_site_display_image: true,
        video_upload_enabled: true,
        manual_photo_approval: false,
        preview_guests_assets_in_gallery: true,
        preview_owners_assets_in_gallery: true,
        preview_link_to_album_page_from_upload_page: true,
      } as Record<ConfigKey, boolean>,
      errors: {
        name: "" as string,
        starts_at: "" as string,
      },
      imageExists: false as boolean,
      localPreviewUrl: "" as string,
      isDragging: false as boolean,
      days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
      format: "dd/MM/yyyy HH:mm",
      loading: false as boolean,
      eventTypes: QR_EVENT_TYPES,
      mainSwitches: [
        { key: "preview_site_display_name", title: "הצגת שם האירוע", hint: "בעמוד ההעלאה ובמסך החי" },
        { key: "preview_site_display_date", title: "הצגת התאריך", hint: "ליד שם האירוע" },
        { key: "preview_site_display_image", title: "הצגת תמונת הכיסוי", hint: "כרקע בעמוד ההעלאה" },
      ] as { key: ConfigKey; title: string; hint: string }[],
      moreSwitches: [
        { key: "video_upload_enabled", title: "העלאת סרטונים", hint: "כבוי — אורחים מעלים רק תמונות" },
        { key: "manual_photo_approval", title: "אישור ידני לפני פרסום", hint: "כל קובץ ימתין לבדיקה שלכם לפני העלייה לאלבום" },
        { key: "preview_guests_assets_in_gallery", title: "תמונות אורחים באלבום החי", hint: "כבוי — רק התמונות שלכם על המסך" },
        { key: "preview_owners_assets_in_gallery", title: "התמונות שלכם באלבום החי", hint: "תמונות שהעליתם כמארחים" },
        { key: "preview_link_to_album_page_from_upload_page", title: "קישור לאלבום מעמוד ההעלאה", hint: "מוסיף כפתור «צפו באלבום» לאורחים" },
      ] as { key: ConfigKey; title: string; hint: string }[],
    };
  },

  watch: {
    event() {
      this.setEvent();
    },
  },

  created() {
    this.setEvent();
  },

  beforeUnmount() {
    this.revokeLocalPreview();
  },

  computed: {
    minDate(): Date {
      return new Date();
    },
    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },
    isPending(): boolean {
      return this.$store.getters["event/isEventPending"];
    },
    previewUrl(): string {
      if (this.localPreviewUrl) return this.localPreviewUrl;
      if (this.imageExists && this.event?.image && this.event?.fullPath) {
        return this.event.fullPath;
      }
      return "";
    },
  },

  methods: {
    setEvent() {
      this.form.name = this.event?.name ?? "";
      this.form.starts_at = this.event?.starts_at ?? "";
      this.form.event_type = this.event?.event_type || "";
      this.imageExists = Boolean(this.event?.image);
      const cfg = this.event?.config || {};
      (Object.keys(this.config) as ConfigKey[]).forEach((key) => {
        if (cfg[key] !== undefined && cfg[key] !== null) {
          this.config[key] = Boolean(cfg[key]);
        }
      });
      if (!this.form.image) this.revokeLocalPreview();
    },

    openFilePicker() {
      (this.$refs.fileInput as HTMLInputElement | undefined)?.click();
    },

    onFileInput(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (file) this.setImageFile(file);
    },

    onDrop(event: DragEvent) {
      this.isDragging = false;
      const file = event.dataTransfer?.files?.[0];
      if (file && file.type.startsWith("image/")) this.setImageFile(file);
    },

    setImageFile(file: File) {
      this.form.image = file;
      this.imageExists = true;
      this.revokeLocalPreview();
      this.localPreviewUrl = URL.createObjectURL(file);
    },

    revokeLocalPreview() {
      if (this.localPreviewUrl) {
        URL.revokeObjectURL(this.localPreviewUrl);
        this.localPreviewUrl = "";
      }
    },

    async submit() {
      this.errors = { name: "", starts_at: "" };
      if (!this.form.name) this.errors.name = "שם האירוע הינו שדה חובה";
      if (this.isPending && !this.form.starts_at) {
        this.errors.starts_at = "תאריך האירוע הינו שדה חובה";
      }
      if (Object.values(this.errors).some(Boolean)) {
        Object.values(this.errors).forEach((error) => {
          if (error) notify({ text: error, type: "error", duration: 5000 });
        });
        return;
      }

      this.loading = true;
      const configPayload: Record<string, string> = {};
      (Object.keys(this.config) as ConfigKey[]).forEach((key) => {
        configPayload[key] = this.config[key] ? "true" : "false";
      });

      const payload: Record<string, unknown> = {
        name: this.form.name,
        image: this.form.image,
        event_type: this.form.event_type || null,
        config: configPayload,
      };
      if (this.isPending) payload.starts_at = Time.toUTC(this.form.starts_at);

      await this.$store.dispatch("event/update", payload);
      this.loading = false;
      notify({ text: "הפרטים נשמרו", type: "success" });
    },
  },
});
</script>

<style lang="scss" scoped>
.event-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.card {
  background: #fff;
  border-radius: 26px;
  padding: 28px 32px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.details-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(240px, 0.9fr);
  gap: 24px;
  align-items: start;
}
.fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
.hint {
  color: #5e564e;
}
.hint--error {
  color: #c94a56;
  font-weight: 700;
}
.neu {
  display: inline-block;
  margin-inline-start: 8px;
  background: #fff4f4;
  color: #9a3036;
  border-radius: 999px;
  padding: 2px 8px;
  font-style: normal;
  font-size: 0.72rem;
  letter-spacing: 0;
  text-transform: none;
}
.type-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pill {
  border: 1.5px solid rgba(22, 19, 16, 0.11);
  background: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.pill.on {
  background: #12100e;
  color: #fff;
  border-color: #12100e;
}
.cover {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 22px;
  overflow: hidden;
  background: #f3eee6 center / cover no-repeat;
  min-height: 280px;
  cursor: pointer;
}
.cover--empty {
  background:
    radial-gradient(circle at 28% 18%, rgba(220, 91, 102, 0.28), transparent 52%),
    radial-gradient(circle at 82% 78%, rgba(201, 163, 106, 0.34), transparent 48%),
    linear-gradient(160deg, #efe7db, #e4d8c8);
  display: grid;
  place-items: center;
}
.cover-empty {
  display: grid;
  justify-items: center;
  gap: 6px;
  color: #161310;
  text-align: center;
  padding: 20px;
}
.cover-empty .material-symbols-outlined {
  font-size: 42px;
  color: #c9a36a;
}
.cover-empty strong {
  font-size: 1.05rem;
}
.cover-empty span:last-child {
  color: #5e564e;
  font-size: 0.92rem;
}
.cover-swap {
  position: absolute;
  inset-inline: 12px;
  bottom: 12px;
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: rgba(18, 16, 14, 0.72);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}
.switches-card h2 {
  margin: 0 0 14px;
  font-size: 1.22rem;
  font-weight: 800;
}
.switch-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid rgba(22, 19, 16, 0.08);
}
.switch-row:first-child {
  border-top: 0;
}
.switch-row strong {
  display: block;
}
.switch-row small {
  color: #5e564e;
}
.switch-row input {
  width: 44px;
  height: 26px;
}
.more {
  margin-top: 12px;
}
.more summary {
  cursor: pointer;
  font-weight: 800;
  color: #5e564e;
  padding: 10px 0;
}
.form-actions {
  display: flex;
  justify-content: flex-start;
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 12px 22px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}
.btn-primary {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  color: #fff;
}
.btn[disabled] {
  opacity: 0.5;
}
@media (max-width: 900px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  .cover {
    order: -1;
    max-width: 420px;
    margin-inline: auto;
    width: 100%;
  }
}
</style>
