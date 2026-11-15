<template>
  <div class="ltp" dir="rtl">
    <header class="ltp-head">
      <h2>{{ heading }}</h2>
      <p class="ltp-lede">{{ lede }}</p>
    </header>

    <div class="ltp-filters" role="tablist" aria-label="סינון לפי סוג אירוע">
      <button
        v-for="f in filters"
        :key="f.id"
        type="button"
        class="ltp-chip"
        role="tab"
        :class="{ on: activeType === f.id }"
        :aria-selected="activeType === f.id"
        @click="activeType = f.id"
      >{{ f.label }}</button>
    </div>

    <div class="ltp-grid">
      <button
        v-for="t in filtered"
        :key="t.id"
        type="button"
        class="ltp-card"
        :aria-label="`בחירת עיצוב ${t.name_he}`"
        @click="$emit('select', t.id)"
      >
        <div class="ltp-thumb" :class="{ dark: t.dark }" :style="thumbStyle(t)">
          <span class="ltp-thumb-title">{{ t.name_he }}</span>
          <span class="ltp-thumb-type">{{ t.type_he || typeLabel(t.type) }}</span>
        </div>
        <div class="ltp-meta">
          <strong>{{ t.name_he }}</strong>
          <span>{{ t.type_he || typeLabel(t.type) }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { listTemplates, resolveStock } from "../templates/registry";
import type { TemplateMeta } from "../types";
import { LANDING_TYPE_FILTERS } from "./blockLabels";

export default defineComponent({
  name: "LandingTemplatePicker",
  props: {
    eventType: { type: String, default: "" },
    heading: { type: String, default: "בחרו עיצוב" },
    lede: {
      type: String,
      default: "14 עיצובים מוכנים. אפשר לשנות צבעים, טקסטים ותמונות אחרי הבחירה.",
    },
  },
  emits: ["select"],
  setup(props) {
    const filters = LANDING_TYPE_FILTERS;
    const activeType = ref<string>("all");
    const all = listTemplates();

    watch(
      () => props.eventType,
      (v) => {
        if (v && filters.some((f) => f.id === v)) activeType.value = v;
      },
      { immediate: true }
    );

    const filtered = computed(() => {
      if (activeType.value === "all") return all;
      return all.filter((t) => t.type === activeType.value);
    });

    function typeLabel(type: string): string {
      return filters.find((f) => f.id === type)?.label || type;
    }

    function thumbStyle(t: TemplateMeta): Record<string, string> {
      const palette = t.palettes?.default;
      const stock = resolveStock(`${t.id}/hero`) || resolveStock(`art/${t.hero_art}`);
      const bg = stock?.url
        ? `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.45)), url(${stock.url}) center/cover`
        : `linear-gradient(145deg, ${palette?.primary || "#c9a36a"}, ${palette?.secondary || "#dc5b66"})`;
      return {
        background: bg,
        color: t.dark ? "#F3EEE6" : palette?.text || "#1a1510",
        "--card-bg": palette?.background || "#f4ede3",
      };
    }

    return { filters, activeType, filtered, typeLabel, thumbStyle };
  },
});
</script>

<style lang="scss" scoped>
.ltp {
  display: grid;
  gap: 18px;
}
.ltp-head h2 {
  margin: 0;
  font-size: clamp(1.4rem, 2.5vw, 1.85rem);
  font-weight: 900;
  letter-spacing: -0.03em;
}
.ltp-lede {
  margin: 6px 0 0;
  color: #5e564e;
  max-width: 40em;
}
.ltp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ltp-chip {
  border: 1px solid rgba(22, 19, 16, 0.12);
  background: #fff;
  color: #3a342e;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
}
.ltp-chip.on {
  background: rgba(220, 91, 102, 0.14);
  border-color: transparent;
  color: #161310;
}
.ltp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.ltp-card {
  display: grid;
  gap: 10px;
  text-align: start;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
}
.ltp-thumb {
  aspect-ratio: 4 / 5;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  box-shadow: 0 10px 28px rgba(22, 19, 16, 0.08);
  transition: transform 0.18s ease;
}
.ltp-card:hover .ltp-thumb,
.ltp-card:focus-visible .ltp-thumb {
  transform: translateY(-2px);
}
.ltp-thumb-title {
  font-weight: 900;
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}
.ltp-thumb-type {
  opacity: 0.85;
  font-size: 0.85rem;
  font-weight: 600;
}
.ltp-meta {
  display: grid;
  gap: 2px;
  padding-inline: 4px;
}
.ltp-meta strong {
  font-size: 0.98rem;
}
.ltp-meta span {
  color: #5e564e;
  font-size: 0.86rem;
}
@media (max-width: 480px) {
  .ltp-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .ltp-thumb {
    border-radius: 14px;
    padding: 12px;
  }
}
</style>
