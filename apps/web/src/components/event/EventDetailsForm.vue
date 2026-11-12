<template>
  <form @submit.prevent="submit()" class="event-form">
    <header class="form-head">
      <h2>עריכת פרטי האירוע</h2>
      <p>שם, תאריך, תמונת כיסוי והרשאות תצוגה.</p>
    </header>

    <div class="form-grid">
      <MainInput
        v-model="form.name"
        title="שם האירוע"
        :hasError="Boolean(errors.name)"
      />

      <div class="date-field" :class="{ disabled: !isPending }">
        <p class="field-label">תאריך האירוע</p>
        <VueDatePicker
          :disabled="!isPending"
          class="date-picker"
          :class="{ disabled: !isPending }"
          :min-date="minDate"
          locale="he"
          :format="format"
          v-model="form.starts_at"
          select-text="בחר"
          cancel-text="בטל"
          :day-names="days"
        ></VueDatePicker>
        <small class="hint" v-show="isPending">
          בחרו תאריך ושעה מדוייקת של תחילת האירוע
        </small>
        <small class="hint" v-show="!isPending">
          ניתן לשנות את התאריך רק בסטטוס ממתין
        </small>
        <small class="hint hint--error" v-if="errors.starts_at">
          {{ errors.starts_at }}
        </small>
      </div>
    </div>

    <div
      class="cover-dropzone"
      :class="{ 'is-dragging': isDragging, 'has-preview': Boolean(previewUrl) }"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="openFilePicker"
      role="button"
      tabindex="0"
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
      <div class="cover-preview" v-if="previewUrl" :style="{ backgroundImage: `url(${previewUrl})` }"></div>
      <div class="cover-copy">
        <span class="material-symbols-outlined" aria-hidden="true">upload</span>
        <strong>תמונת האירוע</strong>
        <span>גררו לכאן או לחצו לבחירה. מומלץ ברזולוציה של מכשיר נייד.</span>
        <em v-if="uploadedLabel">{{ uploadedLabel }}</em>
      </div>
    </div>

    <section class="switch-section">
      <h3>תצוגה בעמוד העלאות</h3>
      <div
        v-for="item in uploadDisplaySwitches"
        :key="item.key"
        class="switch-row"
        @click="toggleConfig(item.key)"
      >
        <div class="switch-copy">
          <strong>{{ item.title }}</strong>
          <small>{{ item.hint }}</small>
        </div>
        <MainCheckbox
          :value="form.config[item.key]"
          @onClick.stop="toggleConfig(item.key)"
        />
      </div>
    </section>

    <section class="switch-section">
      <h3>הרשאות אורחים</h3>
      <div
        v-for="item in guestPermissionSwitches"
        :key="item.key"
        class="switch-row"
        @click="toggleConfig(item.key)"
      >
        <div class="switch-copy">
          <strong>{{ item.title }}</strong>
          <small>{{ item.hint }}</small>
        </div>
        <MainCheckbox
          :value="form.config[item.key]"
          @onClick.stop="toggleConfig(item.key)"
        />
      </div>
    </section>

    <section class="switch-section">
      <h3>אישור ידני</h3>
      <div class="switch-row" @click="toggleConfig('manual_photo_approval')">
        <div class="switch-copy">
          <strong>אישור ידני לתמונות</strong>
          <small>
            מרגע ההפעלה, תמונות חדשות מחכות לאישור לפני האלבום והמסך
          </small>
        </div>
        <MainCheckbox
          :value="form.config.manual_photo_approval"
          @onClick.stop="toggleConfig('manual_photo_approval')"
        />
      </div>
    </section>

    <div class="form-actions">
      <MainButton :loading="loading" text="שמור" />
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";
import MainInput from "../library/inputs/MainInput.vue";
import { IEvent } from "@/helpers/interfaces";
import Time from "@/helpers/time";
import MainCheckbox from "../library/inputs/MainCheckbox.vue";

type ConfigKey =
  | "preview_site_display_image"
  | "preview_site_display_name"
  | "preview_site_display_date"
  | "preview_guests_assets_in_gallery"
  | "preview_owners_assets_in_gallery"
  | "preview_link_to_album_page_from_upload_page"
  | "video_upload_enabled"
  | "manual_photo_approval";

export default defineComponent({
  name: "EventDetailsForm",

  components: {
    MainButton,
    MainInput,
    MainCheckbox,
  },

  data() {
    return {
      form: {
        name: "" as string,
        starts_at: "" as string,
        image: null as File | null,
        config: {
          preview_site_display_image: false as boolean,
          preview_site_display_name: false as boolean,
          preview_site_display_date: false as boolean,
          preview_guests_assets_in_gallery: false as boolean,
          preview_owners_assets_in_gallery: false as boolean,
          preview_qr_in_gallery: false as boolean,
          preview_link_to_album_page_from_upload_page: false as boolean,
          video_upload_enabled: true as boolean,
          manual_photo_approval: false as boolean,
        },
      },
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
      uploadDisplaySwitches: [
        {
          key: "preview_site_display_image" as ConfigKey,
          title: "הצגת תמונת האירוע",
          hint: "להציג את תמונת הכיסוי בעמוד העלאות",
        },
        {
          key: "preview_site_display_name" as ConfigKey,
          title: "הצגת שם האירוע",
          hint: "להציג את שם האירוע בעמוד העלאות",
        },
        {
          key: "preview_site_display_date" as ConfigKey,
          title: "הצגת תאריך האירוע",
          hint: "להציג את תאריך האירוע בעמוד העלאות",
        },
      ],
      guestPermissionSwitches: [
        {
          key: "video_upload_enabled" as ConfigKey,
          title: "העלאת סרטונים",
          hint: "לאפשר לאורחים ולבעלי האירוע להעלות סרטונים",
        },
        {
          key: "preview_guests_assets_in_gallery" as ConfigKey,
          title: "תמונות אורחים בגלריה",
          hint: "להציג את תמונות האורחים בגלריה",
        },
        {
          key: "preview_owners_assets_in_gallery" as ConfigKey,
          title: "תמונות אישיות בגלריה",
          hint: "להציג את התמונות האישיות שלכם בגלריה",
        },
        {
          key: "preview_link_to_album_page_from_upload_page" as ConfigKey,
          title: "קישור לאלבום מעמוד העלאות",
          hint: "להציג כפתור מעבר מעמוד ההעלאות לעמוד האלבום",
        },
      ],
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
      if (this.imageExists && this.event?.fullPath) return this.event.fullPath;
      return "";
    },

    uploadedLabel(): string {
      if (this.form.image?.name) return this.form.image.name;
      if (this.imageExists) return "קיים קובץ באירוע";
      return "";
    },
  },

  methods: {
    setEvent() {
      this.form.name = this.event?.name ?? "";
      this.form.starts_at = this.event?.starts_at ?? "";
      this.form.config.preview_site_display_image =
        this.event?.config?.preview_site_display_image ?? false;
      this.form.config.preview_site_display_name =
        this.event?.config?.preview_site_display_name ?? false;
      this.form.config.preview_site_display_date =
        this.event?.config?.preview_site_display_date ?? false;
      this.form.config.preview_guests_assets_in_gallery =
        this.event?.config?.preview_guests_assets_in_gallery ?? false;
      this.form.config.preview_owners_assets_in_gallery =
        this.event?.config?.preview_owners_assets_in_gallery ?? false;
      this.form.config.preview_qr_in_gallery =
        this.event?.config?.preview_qr_in_gallery ?? false;
      this.form.config.preview_link_to_album_page_from_upload_page =
        this.event?.config?.preview_link_to_album_page_from_upload_page ?? false;
      this.form.config.video_upload_enabled =
        this.event?.config?.video_upload_enabled ?? true;
      this.form.config.manual_photo_approval = Boolean(
        this.event?.config?.manual_photo_approval
      );
      this.imageExists = !!this.event?.image;
      if (!this.form.image) {
        this.revokeLocalPreview();
      }
    },

    toggleConfig(key: ConfigKey) {
      this.form.config[key] = !this.form.config[key];
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
      if (file && file.type.startsWith("image/")) {
        this.setImageFile(file);
      }
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
      const errors = this.validateForm();
      if (Object.values(errors).some((error) => error !== "")) {
        Object.values(errors).forEach((error) => {
          if (error) {
            this.$notify({
              text: error,
              type: "error",
              duration: 5000,
            });
          }
        });
        return;
      }

      this.loading = true;
      const payload = {
        ...this.form,
      } as Record<string, unknown>;

      if (this.isPending) {
        payload.starts_at = Time.toUTC(this.form.starts_at);
      } else {
        delete payload.starts_at;
      }

      await this.$store.dispatch("event/update", payload);
      this.loading = false;
    },

    validateForm() {
      this.errors = {
        name: "",
        starts_at: "",
      };

      if (!this.form.name) {
        this.errors.name = "שם האירוע הינו שדה חובה";
      } else if (!/.{1,100}$/.test(this.form.name)) {
        this.errors.name = "שם האירוע צריך להכיל בין 1 ל 100 תווים";
      }

      if (!this.form.starts_at) {
        this.errors.starts_at = "תאריך האירוע הינו שדה חובה";
      }

      return this.errors;
    },
  },
});
</script>

<style lang="scss" scoped>
.event-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 4px 0 8px;
}

.form-head h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.form-head p {
  margin: 4px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.92rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.field-label {
  margin: 0 0 6px;
  font-weight: 700;
  font-size: 0.95rem;
}

.date-field.disabled {
  opacity: 0.78;
}

.hint {
  display: block;
  margin-top: 6px;
  color: var(--muted, #5e564e);
}

.hint--error {
  color: #c94a56;
  font-weight: 700;
}

.cover-dropzone {
  position: relative;
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  min-height: 120px;
  padding: 14px;
  border: 1.5px dashed rgba(22, 19, 16, 0.22);
  border-radius: 18px;
  background: rgba(22, 19, 16, 0.02);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.cover-dropzone.is-dragging,
.cover-dropzone:focus-visible {
  border-color: #8a7040;
  box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.35);
  background: rgba(201, 163, 106, 0.08);
  outline: none;
}

.cover-preview {
  width: 100%;
  aspect-ratio: 3 / 4;
  max-height: 140px;
  border-radius: 14px;
  background-size: cover;
  background-position: center;
  background-color: #1c1814;
}

.cover-dropzone:not(.has-preview) {
  grid-template-columns: 1fr;
  text-align: center;
  justify-items: center;
}

.cover-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cover-copy .material-symbols-outlined {
  color: #8a7040;
  font-size: 1.4rem;
}

.cover-copy strong {
  font-size: 1rem;
}

.cover-copy span {
  color: var(--muted, #5e564e);
  font-size: 0.88rem;
  line-height: 1.4;
}

.cover-copy em {
  font-style: normal;
  font-weight: 700;
  color: var(--ink, #161310);
  font-size: 0.85rem;
}

@media (max-width: 520px) {
  .cover-dropzone.has-preview {
    grid-template-columns: 1fr;
  }

  .cover-preview {
    max-height: 180px;
    aspect-ratio: 16 / 10;
  }
}

.switch-section {
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 14px 16px;
  background: #fffcfa;
}

.switch-section h3 {
  margin: 0 0 10px;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--muted, #5e564e);
  letter-spacing: 0.02em;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid rgba(22, 19, 16, 0.06);
  cursor: pointer;
}

.switch-row:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.switch-copy {
  min-width: 0;
  flex: 1;
}

.switch-copy strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
}

.switch-copy small {
  display: block;
  margin-top: 2px;
  color: var(--muted, #5e564e);
  font-size: 0.82rem;
  line-height: 1.35;
}

.form-actions {
  max-width: 220px;
  margin-inline-start: auto;
  width: 100%;
}

:deep(.dp__input_wrap) {
  border-radius: 14px;
  box-shadow: none;

  input {
    direction: rtl;
    border-radius: 14px;
    padding: 12px 14px;
    border: 1px solid rgba(22, 19, 16, 0.16);
    background: #fffcfa;
  }

  .dp--clear-btn {
    left: 25px;
    width: fit-content;
  }
}

:deep(.dp__input:focus),
:deep(.dp__input:focus-visible) {
  outline: none;
  border-color: #8a7040 !important;
  box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.35) !important;
}

:deep(.dp__menu) {
  min-width: unset;
}
</style>
