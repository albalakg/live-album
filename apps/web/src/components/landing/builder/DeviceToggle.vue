<template>
  <div class="seg" role="group" aria-label="סוג מסך">
    <button type="button" :aria-pressed="modelValue === 'phone'" @click="$emit('update:modelValue', 'phone')">
      <BuilderIcon name="phone" />טלפון
    </button>
    <button type="button" :aria-pressed="modelValue === 'desktop'" @click="$emit('update:modelValue', 'desktop')">
      <BuilderIcon name="desk" />מחשב
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import type { PreviewDevice } from "./builderTypes";

export default defineComponent({
  name: "DeviceToggle",
  components: { BuilderIcon },
  props: {
    modelValue: { type: String as PropType<PreviewDevice>, required: true },
  },
  emits: ["update:modelValue"],
});
</script>
