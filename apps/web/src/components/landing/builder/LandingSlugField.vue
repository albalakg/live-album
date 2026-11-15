<template>
  <div class="lsf" dir="rtl">
    <label class="lsf-label" for="landing-slug-input">כתובת העמוד</label>
    <div class="lsf-row">
      <span class="lsf-prefix" dir="ltr">/h/</span>
      <input
        id="landing-slug-input"
        class="lsf-input"
        type="text"
        dir="ltr"
        autocomplete="off"
        spellcheck="false"
        :value="modelValue"
        placeholder="my-event"
        @input="onInput"
      />
    </div>
    <p class="lsf-status" :class="statusClass" role="status">{{ statusText }}</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, watch } from "vue";
import { checkHubSlug, type SlugCheckReason } from "@/api/eventHub";
import { normalizeSlugInput } from "./hubBuilderUtils";

export default defineComponent({
  name: "LandingSlugField",
  props: {
    modelValue: { type: String, default: "" },
    eventId: { type: Number, required: true },
  },
  emits: ["update:modelValue", "availability"],
  setup(props, { emit }) {
    const checking = ref(false);
    const available = ref<boolean | null>(null);
    const reason = ref<SlugCheckReason>(null);
    let timer: ReturnType<typeof setTimeout> | null = null;
    let reqId = 0;

    const statusClass = computed(() => {
      if (!props.modelValue) return "muted";
      if (checking.value) return "muted";
      if (available.value === true) return "ok";
      if (available.value === false) return "bad";
      return "muted";
    });

    const statusText = computed(() => {
      if (!props.modelValue) return "בחרו כתובת קצרה באנגלית.";
      if (checking.value) return "בודקים זמינות…";
      if (available.value === true) return "הכתובת פנויה";
      switch (reason.value) {
        case "taken":
          return "הכתובת תפוסה";
        case "reserved":
          return "הכתובת שמורה";
        case "invalid":
          return "כתובת לא תקינה";
        case "too_short":
          return "קצרה מדי";
        case "too_long":
          return "ארוכה מדי";
        default:
          return "";
      }
    });

    function onInput(e: Event) {
      const raw = (e.target as HTMLInputElement).value;
      const next = normalizeSlugInput(raw);
      emit("update:modelValue", next);
    }

    async function runCheck(slug: string) {
      if (!slug) {
        available.value = null;
        reason.value = null;
        emit("availability", { available: false, reason: null, slug: "" });
        return;
      }
      const id = ++reqId;
      checking.value = true;
      try {
        const res = await checkHubSlug(props.eventId, slug);
        if (id !== reqId) return;
        available.value = res.available;
        reason.value = res.reason;
        emit("availability", {
          available: res.available,
          reason: res.reason,
          slug: res.slug,
        });
      } catch (err) {
        console.error(err);
        if (id !== reqId) return;
        available.value = null;
        reason.value = "invalid";
        emit("availability", { available: false, reason: "invalid", slug });
      } finally {
        if (id === reqId) checking.value = false;
      }
    }

    watch(
      () => props.modelValue,
      (slug) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => runCheck(slug), 400);
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      if (timer) clearTimeout(timer);
    });

    return { onInput, statusClass, statusText };
  },
});
</script>

<style lang="scss" scoped>
.lsf {
  display: grid;
  gap: 6px;
}
.lsf-label {
  font-weight: 800;
  font-size: 0.92rem;
}
.lsf-row {
  display: flex;
  align-items: center;
  gap: 0;
  background: #fff;
  border: 1px solid rgba(22, 19, 16, 0.14);
  border-radius: 12px;
  overflow: hidden;
}
.lsf-prefix {
  padding: 10px 12px;
  background: rgba(22, 19, 16, 0.05);
  color: #5e564e;
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
}
.lsf-input {
  flex: 1;
  border: 0;
  padding: 10px 12px;
  font: inherit;
  min-width: 0;
  background: transparent;
}
.lsf-input:focus {
  outline: none;
}
.lsf-status {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
}
.lsf-status.ok {
  color: #2f7a45;
}
.lsf-status.bad {
  color: #a33;
}
.lsf-status.muted {
  color: #5e564e;
  font-weight: 500;
}
</style>
