<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="paths"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { ICON_PATHS } from "./builderIcons";

/** Static, trusted icon paths from builderIcons.ts (never user input). */
export default defineComponent({
  name: "BuilderIcon",
  props: {
    name: { type: String, required: true },
  },
  setup(props) {
    const paths = computed(() => ICON_PATHS[props.name] || ICON_PATHS.info);
    return { paths };
  },
});
</script>
