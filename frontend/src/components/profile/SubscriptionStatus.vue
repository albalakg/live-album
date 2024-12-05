<template>
    <strong>
        <span class="subscription-status" :class="`text--${statusColor}`">
            {{ statusText }}
        </span>
    </strong>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { EventStatus } from '@/helpers/enums'

export default defineComponent({
    name: 'SubscriptionStatus',

    props: {
        status: {
            type: Number,
            required: true
        }
    },

    computed: {
        statusColor(): string {
            switch (this.status) {
                case EventStatus.ACTIVE:
                    return 'green'
                case EventStatus.PENDING:
                    return 'dark-gray'
                case EventStatus.INACTIVE:
                    return 'pink'
                case EventStatus.READY:
                    return 'light-green'
                default:
                    return 'pink'
            }
        },

        statusText(): string {
            switch (this.status) {
                case EventStatus.ACTIVE:
                    return 'פעיל'
                case EventStatus.PENDING:
                    return 'ממתין'
                case EventStatus.INACTIVE:
                    return 'לא פעיל'
                case EventStatus.READY:
                    return 'מוכן'
                default:
                    return 'שגיאה'
            }
        },
    },
});
</script>

<style lang="scss" scoped>
.subscription-status {
    font-weight: bold;
}
</style>