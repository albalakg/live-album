<template>
  <div class="event-details">
    <header class="page-head">
      <div>
        <h1>פרטי האירוע</h1>
        <p class="lede">
          שם, תאריך, סוג, תמונת כיסוי וטקסט ברכה — המידע הכללי של האירוע.
        </p>
      </div>
    </header>

    <EventDetailsForm ref="detailsForm" />
  </div>
</template>

<script lang="ts">
import EventDetailsForm from "@/components/event/EventDetailsForm.vue";
import { defineComponent } from "vue";
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";

export default defineComponent({
  name: "EventDetailsView",

  components: {
    EventDetailsForm,
  },

  beforeRouteLeave(
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const form = this.$refs.detailsForm as { isDirty?: boolean } | undefined;
    if (form?.isDirty && !window.confirm("יש שינויים שלא נשמרו. לעזוב בלי לשמור?")) {
      next(false);
      return;
    }
    next();
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
