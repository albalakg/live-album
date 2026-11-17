<template>
  <div class="slug" :class="{ compact }">
    <label class="fld"
      ><span>כתובת העמוד</span>
      <div class="slug-in" dir="ltr">
        <span class="pre">{{ prefix }}</span
        ><input
          ref="inputEl"
          type="text"
          :value="slug"
          spellcheck="false"
          autocomplete="off"
          :aria-describedby="`${uid}-st`"
          @input="onInput"
          @blur="$emit('blur')"
        />
      </div>
    </label>
    <p :id="`${uid}-st`" class="slug-st" :class="msg.cls" aria-live="polite">
      <BuilderIcon :name="msg.cls === 'ok' ? 'check' : 'info'" />{{ msg.text }}
    </p>
    <div v-if="suggestions.length" class="alts">
      <span>אפשר במקום:</span>
      <button v-for="a in suggestions" :key="a" type="button" class="chip" dir="ltr" @click="$emit('suggest', a)">
        {{ a }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import type { SlugUiStatus } from "./builderTypes";
import { sanitizeSlugInput } from "./hubWizardModel";

let seq = 0;

/** Page address with the live availability check (settings tab + publish dialog). */
export default defineComponent({
  name: "WorkspaceSlugField",
  components: { BuilderIcon },
  props: {
    slug: { type: String, required: true },
    status: { type: String as PropType<SlugUiStatus>, required: true },
    suggestions: { type: Array as PropType<string[]>, default: () => [] },
    prefix: { type: String, required: true },
    compact: { type: Boolean, default: false },
  },
  emits: ["input", "blur", "suggest"],
  setup(props, { emit }) {
    const uid = `wsslug-${++seq}`;
    const inputEl = ref<HTMLInputElement | null>(null);
    const msg = computed(() => {
      const m: Record<SlugUiStatus, [string, string]> = {
        idle: ["", "בודקים את הכתובת…"],
        checking: ["", "בודקים את הכתובת…"],
        free: ["ok", "הכתובת פנויה"],
        taken: ["err", "הכתובת תפוסה"],
        reserved: ["err", "המילה הזו שמורה במערכת"],
        short: ["err", "לפחות 3 תווים"],
        long: ["err", "עד 40 תווים"],
        invalid: ["err", "רק אותיות באנגלית, מספרים ומקפים"],
        empty: ["err", "צריך לבחור כתובת"],
        error: ["err", "לא הצלחנו לבדוק עכשיו. נסו שוב בעוד רגע"],
      };
      const [cls, text] = m[props.status] || m.idle;
      return { cls, text };
    });
    function onInput(e: Event) {
      const el = e.target as HTMLInputElement;
      const pos = el.selectionStart ?? el.value.length;
      const clean = sanitizeSlugInput(el.value);
      if (clean !== el.value) {
        el.value = clean;
        const p = Math.min(pos, clean.length);
        el.setSelectionRange(p, p);
      }
      emit("input", clean);
    }
    function focus() {
      inputEl.value?.focus();
    }
    return { uid, inputEl, msg, onInput, focus };
  },
});
</script>
