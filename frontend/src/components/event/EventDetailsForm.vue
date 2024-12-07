<template>
    <form @submit.prevent="submit()" class="event-form">
        <h2 class="title--large text--dark">
            עריכת פרטי האירוע
        </h2>
        <br>
        <MainInput v-model="form.name" title="שם האירוע" />
        <br>
        <p class="title--small">
            תאריך האירוע
        </p>
        <VueDatePicker class="date-picker" :min-date="minDate" locale="he" :format="format" v-model="form.starts_at" select-text="בחר" cancel-text="בטל" :day-names="days"></VueDatePicker>
        <br>
        <MainInput icon="attach_file" type="file" title="תמונת האירוע"
            hint="התמונה משמשת לעמוד העלאת הקבצים לכן מומלץ ברזולוציה של מכשיר נייד" :allowedAssets="['image']" @onChange="fileUploaded" />
        <br>
        <MainButton :loading="loading" text="שמור" />
    </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainButton from '../library/buttons/MainButton.vue';
import MainInput from '../library/inputs/MainInput.vue';
import { IEvent } from '@/helpers/interfaces';

export default defineComponent({
    name: 'EventDetailsForm',

    components: {
        MainButton,
        MainInput,
    },

    data() {
        return {
            form: {
                name: '' as string,
                starts_at: '' as string,
                image: null as File | null,
            },
            days: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
            format: 'dd/MM/yyyy HH:mm',
            loading: false as boolean
        }
    },

    watch: {
        event() {
            this.setEvent();
        }
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
        }
    },

    methods: {
        setEvent() {
            this.form.name = this.event?.name ?? '';
            this.form.starts_at = this.event?.starts_at ?? '';
        },

        fileUploaded(file: File) {
            this.form.image = file;
        },

        async submit() {
            this.loading = true;
            await this.$store.dispatch("event/update", this.form);
            this.loading = false;
        },
    }
});
</script>

<style lang="scss" scoped>

::v-deep .dp__input_wrap {
    border-radius: 8px;
    box-shadow: 0 2px 5px 1px var(--darkTransparent);
    
    input {
        border-radius: 8px;
        padding: 8px 35px;
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
</style>