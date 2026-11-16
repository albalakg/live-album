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
  // The wizard saves itself: leaving only flushes the pending save (no "unsaved changes" prompt).
  async beforeRouteLeave(
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const builder = this.$refs.builder as { flush?: () => Promise<boolean> } | undefined;
    try {
      await builder?.flush?.();
    } catch {
      /* the tab keeps its draft and retries; never block navigation */
    }
    next();
  },
});
</script>
