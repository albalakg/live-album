<template>
  <form @submit.prevent="submit()" class="event-form">
    <h2 class="title--large text--dark">עריכת פרטי האירוע</h2>
    <br />
    <MainInput v-model="form.name" title="שם האירוע" :error="errors.name" />
    <br />
    <p class="title--small">תאריך האירוע</p>
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
    ></VueDatePicker>
    <br />
    <MainInput
      :fileExists="imageExists"
      icon="attach_file"
      type="file"
      title="תמונת האירוע"
      hint="התמונה משמשת לעמוד העלאת הקבצים לכן מומלץ ברזולוציה של מכשיר נייד"
      :allowedAssets="['image']"
      @onChange="fileUploaded"
    />
    <br />
    <div class="display--flex checkbox-wrapper">
      <MainCheckbox
        @onClick="form.config.preview_site_display_image = !form.config.preview_site_display_image"
        title="להציג את תמונת החתונה בעמוד העלאות"
        :value="form.config.preview_site_display_image"
        class="checkbox"
      />
      <small> להציג את תמונת החתונה בעמוד העלאות </small>
    </div>
    <div class="display--flex checkbox-wrapper">
      <MainCheckbox
        @onClick="form.config.preview_site_display_name = !form.config.preview_site_display_name"
        title="להציג את שם החתונה בעמוד העלאות"
        :value="form.config.preview_site_display_name"
        class="checkbox"
      />
      <small> להציג את שם החתונה בעמוד העלאות </small>
    </div>
    <div class="display--flex checkbox-wrapper">
      <MainCheckbox
        @onClick="form.config.preview_site_display_date = !form.config.preview_site_display_date"
        title="להציג את תאריך החתונה בעמוד העלאות"
        :value="form.config.preview_site_display_date"
        class="checkbox"
      />
      <small> להציג את תאריך החתונה בעמוד העלאות </small>
    </div>
    <br>
    <MainButton :loading="loading" text="שמור" />
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";
import MainInput from "../library/inputs/MainInput.vue";
import { IEvent } from "@/helpers/interfaces";
import Time from "@/helpers/time";
import MainCheckbox from "../library/inputs/MainCheckbox.vue";

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
        }
      },
      errors: {
        name: "" as string,
        starts_at: "" as string,
      },
      imageExists: false as boolean,
      days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
      format: "dd/MM/yyyy HH:mm",
      loading: false as boolean,
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

  computed: {
    minDate(): Date {
      return new Date();
    },

    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },

    isPending(): boolean {
      return this.$store.getters["event/isEventRending"];
    },
  },

  methods: {
    setEvent() {
      this.form.name = this.event?.name ?? "";
      this.form.starts_at = this.event?.starts_at ?? "";
      this.form.config.preview_site_display_image = this.event?.config?.preview_site_display_image ?? false;
      this.form.config.preview_site_display_name = this.event?.config?.preview_site_display_name ?? false;
      this.form.config.preview_site_display_date = this.event?.config?.preview_site_display_date ?? false;
      this.imageExists = !!this.event?.image;
    },

    deleteImage() {
      this.form.image = null;
      this.imageExists = false;
    },

    fileUploaded(file: File) {
      this.form.image = file;
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
      console.log('config', this.form.config);
      
      await this.$store.dispatch(
        "event/update",
        this.isPending
          ? {
              ...this.form,
              starts_at: Time.toUTC(this.form.starts_at),
            }
          : { name: this.form.name, image: this.form.image }
      );
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
.event-form{
  margin-bottom: 20px;
}

:deep(.dp__input_wrap) {
  border-radius: 8px;
  box-shadow: 0 2px 5px 1px var(--darkTransparent);

  input {
    direction: rtl;
    border-radius: 8px;
    padding: 8px 15px;
  }

  .dp--clear-btn {
    left: 25px;
    width: fit-content;
  }
}

.date-picker {
  margin-top: 5px;
}

.dp__theme_light {
  --dp-border-color: #ffffff;
  --dp-border-color-hover: #ffffff;
  --dp-border-color-focus: #ffffff;
  --dp-menu-min-width: 340px;
  // --dp-primary-color: var(--green);
  // --dp-secondary-color: var(--pink);
}

:deep(.dp__menu) {
  min-width: unset;
}

.checkbox-wrapper {
  margin-bottom: 10px;
  
  .checkbox {
    margin-inline-end: 10px;
  }
}

</style>
