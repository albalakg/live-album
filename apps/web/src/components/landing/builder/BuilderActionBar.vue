<template>
  <div class="abar">
    <div v-if="infoStrong" class="abar-info">{{ infoPrefix }} <b>{{ infoStrong }}</b></div>
    <button v-else-if="backLabel" type="button" class="link back" @click="$emit('back')">
      <BuilderIcon name="arrowR" />{{ backLabel }}
    </button>
    <div class="end">
      <button
        type="button"
        class="btn"
        :class="primaryKind === 'publish' ? 'btn-publish' : 'btn-primary'"
        :disabled="disabled || busy"
        @click="$emit('primary')"
      >
        {{ busy && busyLabel ? busyLabel : primaryLabel }}
        <BuilderIcon v-if="arrow && !(busy && busyLabel)" name="arrowL" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BuilderIcon from "./BuilderIcon.vue";

/** Sticky bottom bar: one primary action, a quiet way back (desktop), optional context text. */
export default defineComponent({
  name: "BuilderActionBar",
  components: { BuilderIcon },
  props: {
    primaryLabel: { type: String, required: true },
    primaryKind: { type: String as PropType<"primary" | "publish">, default: "primary" },
    busyLabel: { type: String, default: "" },
    busy: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    arrow: { type: Boolean, default: true },
    /** Left-hand text on the info side (step 1): "העיצוב שבחרתם: <b>name</b>". */
    infoPrefix: { type: String, default: "" },
    infoStrong: { type: String, default: "" },
    /** Quiet back link on the info side (steps 2 and 3). */
    backLabel: { type: String, default: "" },
  },
  emits: ["primary", "back"],
});
</script>
