<template>
  <div class="mapbox" :class="variant">
    <div class="g-head ss-map-head">
      <span>מפת אולם</span>
      <span class="hintk">{{ caption }}</span>
    </div>
    <svg :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="מפת אולם">
      <g v-for="(f, i) in shapes.fixtures" :key="'f' + i">
        <rect class="fx" :x="f.x" :y="f.y" :width="f.w" :height="f.h" rx="6" />
        <text v-if="f.w > 34 && f.h > 12" :x="f.x + f.w / 2" :y="f.y + f.h / 2 + 3.5" class="fx-t">{{ f.label }}</text>
      </g>
      <g
        v-for="t in shapes.tables"
        :key="t.key"
        class="mt"
        :class="[highlight[t.key] ? 'on' : 'off', me === t.key ? 'me' : '']"
        :data-maptable="t.key"
        @click="$emit('select', t.key)"
      >
        <title>{{ t.label }}</title>
        <circle v-if="t.round" :cx="t.cx" :cy="t.cy" :r="t.r" />
        <rect v-else :x="t.cx - t.r * 1.25" :y="t.cy - t.r * 0.8" :width="t.r * 2.5" :height="t.r * 1.6" rx="5" />
        <text :x="t.cx" :y="t.cy - 1" class="mt-n">{{ t.short }}</text>
        <text :x="t.cx" :y="t.cy + 10" class="mt-s">{{ subOf(t.key) }}</text>
      </g>
    </svg>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { SearchFixture, SearchTable } from "@/helpers/search/types";
import type { MapHighlight } from "@/helpers/search/engine";
import { tableNumber } from "@/helpers/search/engine";

const FIXTURE_LABEL: Record<string, string> = { dance: "רחבת ריקודים", stage: "במה", bar: "בר", dj: "DJ", door: "כניסה", buffet: "בופה", chuppah: "חופה" };

export default defineComponent({
  name: "SearchHallMap",
  props: {
    tables: { type: Array as PropType<SearchTable[]>, required: true },
    fixtures: { type: Array as PropType<SearchFixture[]>, default: () => [] },
    highlight: { type: Object as PropType<MapHighlight>, default: () => ({}) },
    mode: { type: String as PropType<"tables" | "guests" | "other">, default: "other" },
    me: { type: String as PropType<string | null>, default: null },
    variant: { type: String, default: "" },
  },
  emits: ["select"],
  data() {
    return { W: 320 };
  },
  computed: {
    caption(): string {
      return this.mode === "tables" ? "המספר = מקומות פנויים" : this.mode === "guests" ? "מודגשים: שולחנות של התוצאות (+כמה יושבים)" : "השולחנות שנמצאו";
    },
    bounds(): { x0: number; y0: number; x1: number; y1: number } {
      const items = [...this.tables, ...this.fixtures];
      if (!items.length) return { x0: 0, y0: 0, x1: 1, y1: 1 };
      return {
        x0: Math.min(...items.map((i) => i.x)),
        y0: Math.min(...items.map((i) => i.y)),
        x1: Math.max(...items.map((i) => i.x + i.w)),
        y1: Math.max(...items.map((i) => i.y + i.h)),
      };
    },
    scale(): number {
      const b = this.bounds;
      const sx = (this.W - 40) / Math.max(1, b.x1 - b.x0);
      const sy = 200 / Math.max(1, b.y1 - b.y0);
      return Math.min(sx, sy);
    },
    H(): number {
      const b = this.bounds;
      return Math.max(90, Math.round((b.y1 - b.y0) * this.scale + 40));
    },
    shapes(): {
      tables: { key: string; label: string; short: string; cx: number; cy: number; r: number; round: boolean }[];
      fixtures: { x: number; y: number; w: number; h: number; label: string }[];
    } {
      const b = this.bounds;
      const s = this.scale;
      // RTL hall: mirror x so the plan reads like the seating screen
      const offX = (this.W - (b.x1 - b.x0) * s) / 2;
      const px = (x: number) => offX + (x - b.x0) * s;
      const py = (y: number) => 20 + (y - b.y0) * s;
      const r = this.radius(this.tables.map((o) => ({ x: px(o.x + o.w / 2), y: py(o.y + o.h / 2) })));
      return {
        fixtures: this.fixtures.map((f) => ({ x: px(f.x), y: py(f.y), w: f.w * s, h: f.h * s, label: f.label || FIXTURE_LABEL[f.kind] || "" })),
        tables: this.tables.map((t) => {
          const num = tableNumber(t.label);
          const short = num || (t.label.replace(/^שולחן\s*/, "").trim() || t.label).slice(0, 5);
          return {
            key: t.key,
            label: t.label,
            short,
            cx: px(t.x + t.w / 2),
            cy: py(t.y + t.h / 2),
            r,
            round: t.shape !== "rect",
          };
        }),
      };
    },
  },
  methods: {
    radius(pts: { x: number; y: number }[]): number {
      let min = 999;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) min = Math.min(min, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
      }
      return Math.max(9, Math.min(17, min / 2.2));
    },
    subOf(key: string): string {
      const h = this.highlight[key];
      if (!h) return "";
      return this.mode === "guests" ? `+${h.n}` : String(Math.max(0, h.free));
    },
  },
});
</script>
