<template>
    <strong>
        <span class="subscription-status" :class="`text--${statusColor}`">
            {{ statusText }}
        </span>
    </strong>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { StatusEnum } from '@/helpers/enums'

export default defineComponent({
    name: 'SubscriptionStatus',

    props: {
        status: {
            type: [Number, null],
            required: true
        }
    },

    computed: {
        statusColor(): string {
            switch (this.status) {
                case StatusEnum.ACTIVE:
                    return 'green'
                case StatusEnum.PENDING:
                    return 'dark-gray'
                case StatusEnum.INACTIVE:
                    return 'pink'
                case StatusEnum.READY:
                    return 'light-green'
                default:
                    return 'pink'
            }
        },

        statusText(): string {
            switch (this.status) {
                case StatusEnum.ACTIVE:
                    return 'פעיל'
                case StatusEnum.PENDING:
                    return 'ממתין'
                case StatusEnum.IN_PROGRESS:
                    return 'האירוע חי'
                case StatusEnum.INACTIVE:
                    return 'לא פעיל'
                case StatusEnum.READY:
                    return 'מוכן'
                default:
                    return 'אין אירוע'
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