<template>
  <div class="event-details">
    <header class="details-head">
      <p class="kicker">ניהול אירוע</p>
      <h1>פרטי האירוע</h1>
      <p class="lede">שם, תאריך וכיסוי. סטטוס האירוע מתעדכן כאן.</p>
    </header>

    <div class="stats-row">
      <EventInfoCard />
    </div>

    <EventDetailsForm />
  </div>
</template>

<script lang="ts">
import EventDetailsForm from "@/components/event/EventDetailsForm.vue";
import EventInfoCard from "@/components/event/EventInfoCard.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EventDetailsView",

  components: {
    EventDetailsForm,
    EventInfoCard,
  },
});
</script>

<style lang="scss" scoped>
.event-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.details-head .kicker {
  color: var(--rose, #dc5b66);
  font-weight: 800;
  margin: 0;
}

.details-head h1 {
  margin: 4px 0 0;
  font-weight: 900;
  font-size: clamp(1.55rem, 2.4vw, 2rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
  white-space: nowrap;
}

.lede {
  margin: 8px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.95rem;
  line-height: 1.45;
  max-width: 52ch;
}

@media (max-width: 420px) {
  .details-head h1 {
    white-space: normal;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  max-width: 560px;
}
</style>
