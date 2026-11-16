<template>
  <section class="ov-status" aria-labelledby="ov-event-name">
    <div class="ov-status__main">
      <div class="ov-status__titles">
        <p class="ov-status__eyebrow">סקירה</p>
        <h1 id="ov-event-name" class="ov-status__name">{{ name }}</h1>
        <p v-if="dateLabel" class="ov-status__date">{{ dateLabel }}</p>
        <p v-if="venue" class="ov-status__venue">{{ venue }}</p>
      </div>
      <div class="ov-status__chips">
        <span
          class="ov-chip"
          :class="chipClass"
          :aria-label="statusAria"
        >
          <i v-if="phase === 'live'" class="ov-chip__dot" aria-hidden="true" />
          {{ statusLabel }}
        </span>
        <span
          v-if="timingLabel"
          class="ov-chip ov-chip--soft"
        >
          {{ timingLabel }}
        </span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { OverviewPhase } from "@/helpers/overviewTiming";

export default defineComponent({
  name: "OverviewStatusHeader",

  props: {
    name: { type: String, required: true },
    statusLabel: { type: String, required: true },
    dateLabel: { type: String, default: "" },
    venue: { type: String, default: "" },
    timingLabel: { type: String, default: "" },
    phase: {
      type: String as PropType<OverviewPhase>,
      default: "upcoming",
    },
  },

  computed: {
    chipClass(): string {
      if (this.phase === "live") return "ov-chip--live";
      if (this.phase === "past") return "ov-chip--past";
      if (this.phase === "setup") return "ov-chip--setup";
      return "ov-chip--ready";
    },
    statusAria(): string {
      return `סטטוס: ${this.statusLabel}`;
    },
  },
});
</script>

<style lang="scss" scoped>
.ov-status {
  background: #fff;
  border-radius: 22px;
  padding: 22px 24px;
  box-shadow: 0 6px 20px rgba(18, 16, 14, 0.06);
  border: 1px solid rgba(22, 19, 16, 0.05);
}

.ov-status__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.ov-status__eyebrow {
  margin: 0 0 4px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #8a8278;
  letter-spacing: 0.02em;
}

.ov-status__name {
  margin: 0;
  font-size: clamp(1.45rem, 2.6vw, 2.05rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ov-status__date,
.ov-status__venue {
  margin: 8px 0 0;
  color: #5e564e;
  font-weight: 600;
  font-size: 0.98rem;
}

.ov-status__venue {
  margin-top: 4px;
  color: #8a8278;
  font-weight: 500;
}

.ov-status__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.ov-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.ov-chip--ready {
  background: rgba(201, 163, 106, 0.18);
  color: #5a4420;
}

.ov-chip--live {
  background: #fff4f4;
  color: #9a3036;
}

.ov-chip--past {
  background: rgba(22, 19, 16, 0.06);
  color: #5e564e;
}

.ov-chip--setup {
  background: #f3eee6;
  color: #5e564e;
}

.ov-chip--soft {
  background: #f7f2ea;
  color: #5e564e;
  font-weight: 700;
}

.ov-chip__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #dc5b66;
}

@media (prefers-reduced-motion: no-preference) {
  .ov-chip--live .ov-chip__dot {
    animation: ov-pulse 1.6s ease-in-out infinite;
  }
}

@keyframes ov-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 600px) {
  .ov-status {
    padding: 18px 16px;
  }
  .ov-status__chips {
    justify-content: flex-start;
  }
}
</style>
