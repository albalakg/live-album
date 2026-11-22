<template>
  <EventTimeline v-if="variant === 'legacy'" :data="data" :section-id="sectionId" :alt="alt" />
  <section
    v-else
    ref="rootEl"
    :id="'sec-' + sectionId"
    class="block wide vx-sec vx-sch"
    :class="['vx-sch--' + variant, alt && 'alt', isWide && 'is-wide']"
    :data-variant="variant"
  >
    <div class="wrap">
      <header class="vx-head">
        <p class="sec-kicker">{{ data.kicker || "לו״ז" }}</p>
        <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      </header>

      <ol v-if="variant === 'timeline'" class="vs-tl">
        <li v-for="(it, i) in items" :key="i">
          <span class="vs-dot" aria-hidden="true"></span>
          <div class="vs-c">
            <b class="vs-tm" dir="ltr">{{ it.time }}</b>
            <h3>{{ it.label }}</h3>
            <p v-if="it.description">{{ it.description }}</p>
          </div>
        </li>
      </ol>

      <div v-else-if="variant === 'cards'" class="vs-cards">
        <div v-for="(it, i) in items" :key="i" class="vs-card">
          <span class="vs-ic"><VariantIcon :name="it.icon" /></span>
          <b class="vs-tm" dir="ltr">{{ it.time }}</b>
          <h3>{{ it.label }}</h3>
          <p v-if="it.description">{{ it.description }}</p>
        </div>
      </div>

      <ul v-else class="vs-list">
        <li v-for="(it, i) in items" :key="i">
          <span class="vs-lb">{{ it.label }}<small v-if="it.description">{{ it.description }}</small></span>
          <span class="vs-lead" aria-hidden="true"></span>
          <b class="vs-tm" dir="ltr">{{ it.time }}</b>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import EventTimeline from "../EventTimeline.vue";
import VariantIcon from "./VariantIcon.vue";
import { TIMELINE_ICONS } from "../../variants/variants";
import { ensureGen2Fonts, useVariantBlock, useWideSection } from "./useVariantBlock";
import "./variantSections.css";

const DEFAULT_ICONS = ["glass", "ring", "dish", "music"];

/**
 * EVENT_TIMELINE for gen-2 templates: timeline / cards / list.
 * Old templates (variant "legacy") render the original EventTimeline.
 */
export default defineComponent({
  name: "VariantScheduleSection",
  components: { EventTimeline, VariantIcon },
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const { templateId, variant } = useVariantBlock("EVENT_TIMELINE", () => props.data);
    const rootEl = ref<HTMLElement | null>(null);
    const { isWide } = useWideSection(rootEl);

    watch(
      () => (variant.value === "legacy" ? "" : templateId.value),
      (id) => id && ensureGen2Fonts(id),
      { immediate: true }
    );

    const items = computed(() =>
      ((props.data.items || []) as Array<Record<string, unknown>>).map((it, i) => {
        const icon = String(it.icon || "");
        return {
          time: String(it.time || ""),
          label: String(it.label || ""),
          description: String(it.description || ""),
          icon: (TIMELINE_ICONS as readonly string[]).includes(icon) ? icon : DEFAULT_ICONS[i % DEFAULT_ICONS.length],
        };
      })
    );

    return { variant, rootEl, isWide, items };
  },
});
</script>
