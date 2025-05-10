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
    <MainButton :loading="loading" text="שמור" />
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";
import MainInput from "../library/inputs/MainInput.vue";
import { IEvent } from "@/helpers/interfaces";
import { image } from "html2canvas/dist/types/css/types/image";

export default defineComponent({
  name: "EventDetailsForm",

  components: {
    MainButton,
    MainInput,
  },

  data() {
    return {
      form: {
        name: "" as string,
        starts_at: "" as string,
        image: null as File | null,
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
      this.imageExists = !!this.event?.image;
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
      await this.$store.dispatch(
        "event/update",
        this.isPending
          ? this.form
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
</style>
