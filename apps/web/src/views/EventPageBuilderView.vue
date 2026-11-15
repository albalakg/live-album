<template>
  <EventPageBuilderTab ref="builder" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import EventPageBuilderTab from "@/components/landing/builder/EventPageBuilderTab.vue";

export default defineComponent({
  name: "EventPageBuilderView",
  components: { EventPageBuilderTab },
  beforeRouteLeave(
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const builder = this.$refs.builder as { dirty?: boolean } | undefined;
    if (builder?.dirty && !window.confirm("יש שינויים שלא נשמרו. לעזוב בלי לשמור?")) {
      next(false);
      return;
    }
    next();
  },
});
</script>
