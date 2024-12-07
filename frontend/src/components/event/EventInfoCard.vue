<template>
    <div class="event-info brs--medium padding--medium bg--white display--flex direction--column justify--space-between">
        <div>
            <div class="padding--x-small display--flex justify--space-between">
                <span class="text--dark title--small">סטטוס</span>
                <SubscriptionStatus :status="status" />
            </div>
            <div class="padding--x-small display--flex justify--space-between" v-for="(item, index) in items"
                :key="index">
                <span class="text--dark title--small">{{ item.text }}</span>
                <span class="text--dark">{{ item.value }}</span>
            </div>
        </div>
        <small class="padding--x-small">
            <strong>שימו לב:</strong>
            האירוע אינו יתחיל עד שתעדכנו את הסטטוס למוכן.
        </small>
        <div class="display--flex justify--end">
            <div class="width--half">
                <MainButton text="האירוע מוכן" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainButton from '../library/buttons/MainButton.vue';
import SubscriptionStatus from '../profile/SubscriptionStatus.vue';

export default defineComponent({
    name: 'EventInfoCard',

    components: {
        MainButton,
        SubscriptionStatus,
    },

    computed: {
        items(): Array<any> {
            return [
                {
                    text: 'שעון לאירוע',
                    value: '05:13:20:11',
                },
                {
                    text: 'סיום לאירוע',
                    value: '26/11/2024 19:30',
                },
                {
                    text: 'סה"כ קבצים',
                    value: 20,
                },
            ];
        },

        status(): number {
            return this.$store.getters['event/getEventStatus'];
        }
    },
});
</script>

<style lang="scss" scoped></style>