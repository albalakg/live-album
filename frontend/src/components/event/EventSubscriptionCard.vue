<template>
    <div
        class="event-subscription-card brs--medium padding--medium bg--white display--flex direction--column justify--space-between">
        <div>
            <div class="padding--x-small display--flex justify--space-between" v-for="(item, index) in items"
                :key="index">
                <span class="text--dark title--small">{{ item.text }}</span>
                <span class="text--dark">{{ item.value }}</span>
            </div>
        </div>
        <small class="padding--x-small">
            <strong>שימו לב:</strong>
            שדרוג החבילה ניתן כאשר האירוע בסטטוס ממתין בלבד.
            <br>
            עלות שדרוג החבילה הינו 50₪.
         </small>
        <div class="display--flex justify--end">
            <div class="width--half">
                <MainButton color="pink" text="שדרוג חבילה" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainButton from '../library/buttons/MainButton.vue';

export default defineComponent({
    name: 'EventSubscriptionCard',

    components: {
        MainButton,
    },

    computed: {
        items(): Array<any> {
            return [
                {
                    text: 'פרטי מנוי',
                    value: 'מנוי בסיסי',
                },
                {
                    text: 'כמות קבצים',
                    value: 'עד 300 קבצים',
                },
                {
                    text: 'זמן הורדת הקבצים',
                    value: '14 ימים',
                },
            ];
        }
    },
});
</script>

<style lang="scss" scoped></style>