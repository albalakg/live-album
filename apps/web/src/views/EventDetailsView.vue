<template>
  <div class="event-details">
    <header class="details-head">
      <p class="kicker">ניהול אירוע</p>
      <h1>פרטי האירוע</h1>
      <p class="lede">שם, תאריך וכיסוי. סטטוס האירוע מתעדכן כאן.</p>
    </header>

    <div
      class="event-cover"
      :class="{ 'event-cover--empty': !eventImage }"
      :style="coverStyle"
      role="img"
      :aria-label="eventImage ? 'תמונת האירוע' : 'אין תמונת אירוע'"
    >
      <div v-if="!eventImage" class="event-cover__placeholder">
        <span class="material-symbols-outlined" aria-hidden="true">photo_camera</span>
        <span>תמונת אירוע</span>
      </div>
    </div>

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

  computed: {
    eventImage(): string {
      return this.$store.getters["event/getEventImage"] || "";
    },

    coverStyle(): Record<string, string> {
      if (!this.eventImage) return {};
      return { backgroundImage: `url(${this.eventImage})` };
    },
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

.event-cover {
  width: 100%;
  max-width: 560px;
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  background-position: center;
  background-size: cover;
  background-color: #1c1814;
  overflow: hidden;
}

.event-cover--empty {
  background:
    radial-gradient(circle at 28% 18%, rgba(220, 91, 102, 0.42), transparent 52%),
    radial-gradient(circle at 82% 78%, rgba(201, 163, 106, 0.48), transparent 48%),
    linear-gradient(155deg, #2a221c 0%, #3a2f28 48%, #1c1814 100%);
  border: 1px solid rgba(201, 163, 106, 0.28);
}

.event-cover__placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 252, 250, 0.88);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 8px rgba(18, 16, 14, 0.35);
}

.event-cover__placeholder .material-symbols-outlined {
  font-size: 2rem;
  opacity: 0.9;
}

@media (max-width: 420px) {
  .details-head h1 {
    white-space: normal;
  }

  .event-cover {
    aspect-ratio: 4 / 3;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  max-width: 560px;
}
</style>
