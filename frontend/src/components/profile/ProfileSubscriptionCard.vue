<template>
    <div
        class="general-info brs--medium padding--x-large bg--white display--flex direction--column justify--space-between">
        <div class="padding--x-small display--flex justify--space-between">
            <span class="text--dark title--small">סטטוס</span>
            <SubscriptionStatus :status="eventStatus" />
        </div>
        <div class="padding--x-small display--flex justify--space-between" v-for="(item, index) in items" :key="index">
            <span class="text--dark title--small">{{ item.text }}</span>
            <span class="text--dark">{{ item.value }}</span>
        </div>
        <br>
        <small>
            <strong>שימו לב:</strong> שדרוג החבילה ניתן כאשר האירוע בסטטוס ממתין. עלות שדרוג החבילה הינו 50₪.
        </small>
        <div class="display--flex justify--end">
            <div class="width--half">
                <MainButton :disabled="!canUpgradeSubscription" color="pink" text="שדרג מנוי" @onClick="submit()" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import { defineComponent } from 'vue';
import SubscriptionStatus from './SubscriptionStatus.vue';
import { EventStatus } from '@/helpers/enums';
export default defineComponent({
    name: 'ProfileSubscriptionCard',

    components: {
        MainButton,
        SubscriptionStatus
    },

    computed: {
        items(): Array<any> {
            return [
                {
                    text: 'פרטי מנוי',
                    value: this.$store.getters['user/getSubscriptionName'],
                },
                {
                    text: 'תאריך רכישה',
                    value: this.$store.getters['user/getSubscriptionStartDate'],
                },
            ];
        },

        eventStatus(): number {
            return this.$store.getters['event/getEventStatus'];
        },

        canUpgradeSubscription(): boolean {
            return this.eventStatus === EventStatus.READY;
        }
    },

    methods: {
        async submit() {
            // 
        },
    }
});
</script>

<style lang="scss" scoped>
.general-info {
    min-height: calc(40% - 80px);
    margin-bottom: 20px;
}
</style>