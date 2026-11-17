<template>
  <EventPageWorkspace ref="builder" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type {
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import EventPageWorkspace from "@/components/landing/builder/EventPageWorkspace.vue";

export default defineComponent({
  name: "EventPageBuilderView",
  components: { EventPageWorkspace },
  // The workspace saves itself: leaving only flushes the pending save (no "unsaved changes" prompt).
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
