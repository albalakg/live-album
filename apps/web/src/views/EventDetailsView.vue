<template>
  <div class="event-details">
    <header class="page-head">
      <div>
        <h1>פרטי האירוע</h1>
        <p class="lede">
          שם, תאריך ותמונת כיסוי יופיעו לאורחים בעמוד ההעלאה ובמסך החי.
        </p>
      </div>
    </header>

    <EventDetailsForm />
  </div>
</template>

<script lang="ts">
import EventDetailsForm from "@/components/event/EventDetailsForm.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EventDetailsView",

  components: {
    EventDetailsForm,
  },
});
</script>

<style lang="scss" scoped>
.page-head h1 {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}
.lede {
  margin: 8px 0 0;
  color: #5e564e;
  font-size: 1.05rem;
  max-width: 42em;
}
</style>
