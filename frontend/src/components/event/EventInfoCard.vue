<template>
    <div
        class="event-info brs--medium padding--medium bg--white display--flex direction--column justify--space-between">
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
            <br>
            ניתן לעדכן את תאריך האירוע רק בסטטוס ממתין.
        </small>
        <div class="display--flex justify--end">
            <div class="width--half">
                <MainButton v-if="isReady" :loading="loading" color="pink" text="החזר להמתנה" @onClick="submit()" />
                <MainButton v-else :loading="loading" text="האירוע מוכן" @onClick="submit()" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainButton from '../library/buttons/MainButton.vue';
import SubscriptionStatus from '../profile/SubscriptionStatus.vue';
import { StatusEnum } from '@/helpers/enums';

export default defineComponent({
    name: 'EventInfoCard',

    components: {
        MainButton,
        SubscriptionStatus,
    },

    data() {
        return {
            startsAtCounter: '' as string,
            loading: false as boolean,
        }
    },

    computed: {
        items(): Array<any> {
            return [
                {
                    text: 'שעון לאירוע',
                    value: '05:13:20:11',
                },
                {
                    text: 'סיום האירוע',
                    value: this.$store.getters['event/getEventFinishTime'],
                },
                {
                    text: 'סה"כ קבצים',
                    value: this.$store.getters['event/getTotalAssets'],
                },
            ];
        },

        status(): number {
            return this.$store.getters['event/getEventStatus'];
        },

        isReady(): boolean {
            return this.$store.getters['event/isEventReady'];
        },
    },

    methods: {
        async submit() {
            this.loading = true;
            this.isReady ? this.$store.dispatch("event/setPending") : this.$store.dispatch("event/setReady");
            this.loading = false;
        }
    }
});
</script>

<style lang="scss" scoped>
.event-info {
    min-height: fit-content;
}
</style>