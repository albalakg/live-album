<template>
  <SaveTheDateWorkspace ref="workspace" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import SaveTheDateWorkspace from "@/components/save-the-date/SaveTheDateWorkspace.vue";

export default defineComponent({
  name: "EventSaveTheDateView",
  components: { SaveTheDateWorkspace },
  async beforeRouteLeave(
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const workspace = this.$refs.workspace as { flush?: () => Promise<boolean> } | undefined;
    try {
      await workspace?.flush?.();
    } catch {
      /* the tab keeps its draft and retries; never block navigation */
    }
    next();
  },
});
</script>
