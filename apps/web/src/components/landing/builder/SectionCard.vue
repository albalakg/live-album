<template>
  <!-- Locked cover row -->
  <div v-if="locked" class="sec locked on">
    <div class="sec-h">
      <span class="sec-ic"><BuilderIcon name="sparkle" /></span>
      <span class="sec-txt">
        <b>הפתיחה</b>
        <span>השמות, התאריך וספירה לאחור</span>
      </span>
      <span class="tag"><BuilderIcon name="lock" />תמיד מופיע</span>
    </div>
  </div>

  <div
    v-else
    class="sec"
    :class="{ on, off: !on, open: isOpen, flash, 'has-err': !!error }"
    :data-kind="kind"
    @focusin="$emit('focus-section')"
  >
    <div class="sec-h">
      <span class="sec-ic"><BuilderIcon :name="meta.icon" /></span>
      <button
        type="button"
        class="sec-txt"
        :aria-expanded="on ? (isOpen ? 'true' : 'false') : undefined"
        :tabindex="on ? 0 : -1"
        @click="on && $emit('toggle-open')"
      >
        <b>{{ meta.name }}</b>
        <span>{{ meta.desc }}</span>
        <span v-if="hint && on" class="hint">כדאי לעדכן את הטקסט</span>
      </button>
      <button
        v-if="on"
        type="button"
        class="sec-open"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-label="`${isOpen ? 'סגירה' : 'עריכה'}: ${meta.name}`"
        :title="isOpen ? 'סגירה' : 'עריכה'"
        @click="$emit('toggle-open')"
      >
        <BuilderIcon :name="isOpen ? 'chev' : 'edit'" />
      </button>
      <span class="sw-wrap">
        <button
          type="button"
          class="sw"
          role="switch"
          :aria-checked="on ? 'true' : 'false'"
          :aria-label="meta.name"
          @click="$emit('toggle', !on)"
        />
      </span>
    </div>
    <div v-if="isOpen" class="sec-b">
      <p v-if="error" class="fld-err" role="alert" style="margin-bottom: 12px">{{ error }}</p>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import { kindMeta } from "./hubWizardModel";

export default defineComponent({
  name: "SectionCard",
  components: { BuilderIcon },
  props: {
    kind: { type: String, default: "" },
    on: { type: Boolean, default: false },
    open: { type: Boolean, default: false },
    /** The cover ("הפתיחה"): always on, no switch, not editable here. */
    locked: { type: Boolean, default: false },
    /** Still showing sample text: amber "worth updating" hint. */
    hint: { type: Boolean, default: false },
    /** Brief coral flash after the section is turned on. */
    flash: { type: Boolean, default: false },
    error: { type: String, default: "" },
  },
  emits: ["toggle", "toggle-open", "focus-section"],
  setup(props) {
    const meta = computed(() => kindMeta(props.kind || "info"));
    const isOpen = computed(() => props.on && props.open);
    return { meta, isOpen };
  },
});
</script>
