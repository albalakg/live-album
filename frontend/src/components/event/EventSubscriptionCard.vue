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
                <router-link :to="'/order?subscription=' + subscriptionUpgradeName">
                    <MainButton v-if="canUpgradeSubscription" color="pink" text="שדרגו חבילה" />
                </router-link>
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
                    value: this.formattedStorageTime,
                },
            ];
        },

        formattedStorageTime(): string {
            const hours = Number(this.$store.getters["user/getSubscriptionFilesStorageTime"]) || 0;
            const days = Math.floor(hours / 24);

            if (days >= 30) {
                const months = Math.floor(days / 30);
                if (months === 1) return 'חודש';
                if (months === 2) return 'חודשיים';
                return `${months} חודשים`;
            }

            if (days >= 7) {
                const weeks = Math.floor(days / 7);
                if (weeks === 1) return 'שבוע';
                if (weeks === 2) return 'שבועיים';
                return `${weeks} שבועות`;
            }

            if (days === 1) return 'יום';
            if (days === 2) return 'יומיים';
            return `${days} ימים`;
        },

        subscriptionUpgradeName(): string {
            return this.userIsDemo ? 'classic' : 'premium';
        },

        userIsDemo(): boolean {
            return SubscriptionTypesEnum.DEMO === this.subscriptionName;
        },

        eventStatus(): number {
            return this.$store.getters['event/getEventStatus'];
        },

        subscriptionName(): string {
            return this.$store.getters['user/getSubscriptionName'];
        },

        userIsPremium(): boolean {
            return SubscriptionTypesEnum.PREMIUM === this.subscriptionName;
        },

        canUpgradeSubscription(): boolean {
            return [StatusEnum.READY, StatusEnum.PENDING].includes(this.eventStatus) && !this.userIsPremium;
        }
    },
});
</script>

<style lang="scss" scoped>
.event-subscription-card {
    min-height: fit-content;
    margin-top: 10px;
}
</style>