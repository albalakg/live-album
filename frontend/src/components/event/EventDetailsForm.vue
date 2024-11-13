<template>
    <div class="event-form">
        <h2 class="title--large text--dark">
            עריכת פרטי האירוע
        </h2>
        <br>
        <MainInput title="שם האירוע" />
        <br>
        <MainInput title="תאריך האירוע" />
        <br>
        <MainInput title="שעת האירוע" />
        <br>
        <MainInput icon="attach_file" type="file" title="תמונת האירוע" hint="התמונה משמשת לעמוד העלאת הקבצים לכן מומלץ ברזולוציה של מכשיר נייד" />
        <br>
        <MainButton text="שמור" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainButton from '../library/buttons/MainButton.vue';
import MainInput from '../library/inputs/MainInput.vue';

export default defineComponent({
    name: 'EventDetailsForm',

    components: {
        MainButton,
        MainInput,
    },

    data() {
        return {
            form: {
                name: '',
                date: '',
                time: '',
                image: ''
            }
        }
    }
});
</script>

<style lang="scss" scoped></style>