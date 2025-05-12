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
        <small class="padding--x-small" v-if="canUpgradeSubscription">
            <strong>שימו לב:</strong>
            שדרוג החבילה ניתן כאשר האירוע בסטטוס ממתין בלבד.
            <br>
            עלות שדרוג החבילה הינו 50₪ עבור:
            <br>
            קבצים ללא הגבלה
            <br>
            נשאר ל30 יום
        </small>
        <div class="display--flex justify--end">
            <div class="width--half width--full-mobile">
                <MainButton disabled color="pink" text="שדרג חבילה (בקרוב)" @onClick="submit()" />
                <!-- <MainButton :disabled="!canUpgradeSubscription" color="pink" text="שדרג חבילה" @onClick="submit()" /> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainButton from '../library/buttons/MainButton.vue';
import { StatusEnum, SubscriptionTypesEnum } from '@/helpers/enums';

export default defineComponent({
    name: 'EventSubscriptionCard',

    components: {
        MainButton,
    },

    computed: {
        items(): Array<any> {
            return [
                {
                    text: 'פרטי חבילה',
                    value: this.$store.getters["user/getSubscriptionName"],
                },
                {
                    text: 'כמות קבצים',
                    value: this.$store.getters["user/getSubscriptionFilesAllowed"] + ' קבצים',
                },
                {
                    text: 'זמן הורדת הקבצים',
                    value: this.$store.getters["user/getSubscriptionFilesStorageTime"] + ' ימים',
                },
            ];
        },
        
        eventStatus(): number {
            return this.$store.getters['event/getEventStatus'];
        },

        subscriptionName(): string {
            return this.$store.getters['user/getSubscriptionName'];
        },

        canUpgradeSubscription(): boolean {
            return [StatusEnum.READY, StatusEnum.PENDING].includes(this.eventStatus) && this.subscriptionName === SubscriptionTypesEnum.BASIC;
        }
    },
   
    methods: {
        submit() {
            // 
        },
    }
});
</script>

<style lang="scss" scoped>
.event-subscription-card {
    min-height: fit-content;
    margin-top: 10px;
}
</style>