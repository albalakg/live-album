<template>
  <span class="status-pill" :class="`status-pill--${statusTone}`">
    <i v-if="statusTone === 'live'" aria-hidden="true"></i>
    {{ statusText }}
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { StatusEnum } from "@/helpers/enums";

export default defineComponent({
  name: "SubscriptionStatus",

  props: {
    status: {
      type: [Number, null],
      required: true,
    },
  },

  computed: {
    statusTone(): string {
      switch (this.status) {
        case StatusEnum.IN_PROGRESS:
          return "live";
        case StatusEnum.ACTIVE:
          return "active";
        case StatusEnum.READY:
          return "ready";
        case StatusEnum.PENDING:
          return "pending";
        case StatusEnum.INACTIVE:
          return "inactive";
        default:
          return "pending";
      }
    },

    statusText(): string {
      switch (this.status) {
        case StatusEnum.ACTIVE:
          return "פעיל";
        case StatusEnum.PENDING:
          return "ממתין";
        case StatusEnum.IN_PROGRESS:
          return "האירוע חי";
        case StatusEnum.INACTIVE:
          return "לא פעיל";
        case StatusEnum.READY:
          return "מוכן";
        default:
          return "אין אירוע";
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 5px 10px;
  font-weight: 800;
  font-size: 0.82rem;
  white-space: nowrap;
  background: rgba(22, 19, 16, 0.06);
  color: var(--muted, #5e564e);
}

.status-pill i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--live, #2fbe6a);
  box-shadow: 0 0 0 4px rgba(47, 190, 106, 0.18);
}

.status-pill--live {
  background: rgba(47, 190, 106, 0.12);
  color: #1f8a4c;
}

.status-pill--active {
  background: rgba(47, 190, 106, 0.12);
  color: #1f8a4c;
}

.status-pill--ready {
  background: rgba(201, 163, 106, 0.16);
  color: #8a7040;
}

.status-pill--pending {
  background: rgba(22, 19, 16, 0.06);
  color: var(--muted, #5e564e);
}

.status-pill--inactive {
  background: rgba(220, 91, 102, 0.12);
  color: #b3444d;
}
</style>
