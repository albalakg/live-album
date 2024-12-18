<template>
    <div
        class="general-info brs--medium padding--x-large bg--white display--flex direction--column justify--space-between">
        <div class="padding--x-small display--flex justify--space-between">
            <span class="text--dark title--small">סטטוס</span>
            <SubscriptionStatus :status="eventStatus" />
        </div>
        <template v-if="eventStatus">
            <div class="padding--x-small display--flex justify--space-between" v-for="(item, index) in items"
                :key="index">
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
        </template>
        <template v-else>
            <div class="display--flex justify--end">
                <div class="width--half">
                    <router-link to="/order">
                        <MainButton color="pink" text="רכוש עכשיו" @onClick="submit()" />
                    </router-link>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import { defineComponent } from 'vue';
import SubscriptionStatus from './SubscriptionStatus.vue';
import { StatusEnum, SubscriptionTypesEnum } from '@/helpers/enums';
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

        eventStatus(): number | null {
            return this.$store.getters['event/getEventStatus'];
        },

        subscriptionName(): string {
            return this.$store.getters['user/getSubscriptionName'];
        },

        canUpgradeSubscription(): boolean {
            if(this.eventStatus === null) {
                return false;
            }

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
.general-info {
    min-height: calc(40% - 80px);
    margin-bottom: 20px;
}
</style>