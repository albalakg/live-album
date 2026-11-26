<template>
  <main class="tbl-page" dir="rtl">
    <div class="tbl-card">
      <p v-if="loading" class="tbl-muted">טוען…</p>
      <template v-else-if="!data">
        <h1>הקישור לא נמצא</h1>
        <p class="tbl-muted">{{ error }}</p>
      </template>
      <template v-else>
        <p class="tbl-kicker">{{ data.event.couple_names || data.event.title }}</p>
        <p class="tbl-when">
          <span v-if="data.event.date">יום {{ data.event.day }}, {{ data.event.date }}</span>
          <span v-if="data.event.time"> · {{ data.event.time }}</span>
          <span v-if="data.event.venue_name"> · {{ data.event.venue_name }}</span>
        </p>

        <template v-if="data.state === 'assigned' && data.table">
          <p class="tbl-hello">היי {{ data.guest.first_name }}, השולחן שלך</p>
          <div class="tbl-hero" role="status">
            <span class="tbl-hero-kicker">{{ isNumeric ? "שולחן מספר" : "שולחן" }}</span>
            <strong class="tbl-hero-label">{{ data.table.label }}</strong>
            <span v-if="data.guest.party_size > 1" class="tbl-hero-sub">שמור עבור {{ data.guest.party_size }} אורחים</span>
          </div>

          <figure v-if="data.map" class="tbl-map">
            <svg :viewBox="viewBox" role="img" :aria-label="`מפת האולם, השולחן שלך (${data.table.label}) מסומן`" preserveAspectRatio="xMidYMid meet">
              <g v-for="(f, i) in data.map.fixtures" :key="'f' + i" :transform="rotate(f)">
                <rect :x="f.x" :y="f.y" :width="f.w" :height="f.h" rx="10" class="fx" />
                <text :x="f.x + f.w / 2" :y="f.y + f.h / 2" class="fx-t" text-anchor="middle" dominant-baseline="central">{{ fixtureName(f) }}</text>
              </g>
              <g v-for="(t, i) in data.map.tables" :key="'t' + i" :transform="rotate(t)" :class="['tb', { mine: t.mine }]">
                <ellipse v-if="t.shape !== 'rect'" :cx="t.x + t.w / 2" :cy="t.y + t.h / 2" :rx="t.w / 2" :ry="t.h / 2" />
                <rect v-else :x="t.x" :y="t.y" :width="t.w" :height="t.h" rx="12" />
                <text :x="t.x + t.w / 2" :y="t.y + t.h / 2" text-anchor="middle" dominant-baseline="central">{{ t.label }}</text>
              </g>
              <g v-if="mine" class="pin" :transform="`translate(${mine.x + mine.w / 2}, ${mine.y - 12})`">
                <path d="M0 0 C -14 -18 -22 -28 -22 -40 A 22 22 0 1 1 22 -40 C 22 -28 14 -18 0 0 Z" />
                <circle cx="0" cy="-40" r="8" />
              </g>
            </svg>
            <figcaption class="tbl-muted">השולחן שלך מסומן בזהב</figcaption>
          </figure>
        </template>

        <div v-else class="tbl-note" role="status">
          <h2>{{ stateTitle }}</h2>
          <p>{{ stateText }}</p>
        </div>

        <div class="tbl-links">
          <a v-if="data.event.waze_link" :href="data.event.waze_link" target="_blank" rel="noopener" class="tbl-link">ניווט ב-Waze</a>
          <a v-if="data.event.hub_link" :href="data.event.hub_link" class="tbl-link">לדף האירוע</a>
        </div>
      </template>
    </div>
    <p class="tbl-foot">SnapShare</p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PublicTable, PublicTableMapFixture, PublicTableMapTable, publicTableApi } from "@/helpers/seating/publicTable";
import { msgError } from "@/helpers/messaging/labels";

const FIXTURE_NAMES: Record<string, string> = { dance: "רחבת ריקודים", stage: "במה", bar: "בר", dj: "DJ", door: "כניסה", buffet: "מזנון", chuppah: "חופה" };

export default defineComponent({
  name: "PublicTableView",
  data() {
    return { data: null as PublicTable | null, loading: true, error: "" };
  },
  computed: {
    token(): string {
      return String(this.$route.params.token || "");
    },
    isNumeric(): boolean {
      return /^\d+$/.test(this.data?.table?.label || "");
    },
    mine(): PublicTableMapTable | null {
      return this.data?.map?.tables.find((t) => t.mine) || null;
    },
    viewBox(): string {
      const items = [...(this.data?.map?.tables || []), ...(this.data?.map?.fixtures || [])];
      if (!items.length) return "0 0 100 100";
      const pad = 40;
      const minX = Math.min(...items.map((i) => i.x)) - pad;
      const minY = Math.min(...items.map((i) => i.y)) - pad - 60; // room for the pin
      const maxX = Math.max(...items.map((i) => i.x + i.w)) + pad;
      const maxY = Math.max(...items.map((i) => i.y + i.h)) + pad;
      return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
    },
    stateTitle(): string {
      const s = this.data?.state;
      if (s === "declined") return "עדכנת שלא תגיע/י";
      if (s === "unavailable") return "מפת ההושבה עוד לא פורסמה";
      return "השולחן עוד לא נקבע";
    },
    stateText(): string {
      const s = this.data?.state;
      if (s === "declined") return "אם התוכניות השתנו, כדאי לעדכן את בעלי השמחה.";
      return "בעלי השמחה עדיין מסדרים את ההושבה. הקישור הזה יתעדכן אוטומטית, אפשר לחזור אליו בכל רגע.";
    },
  },
  async mounted() {
    try {
      this.data = await publicTableApi.show(this.token);
    } catch (e) {
      this.error = msgError(e, "הקישור לא תקין או שפג תוקפו.");
    } finally {
      this.loading = false;
    }
  },
  methods: {
    rotate(i: PublicTableMapTable | PublicTableMapFixture): string {
      return i.rot ? `rotate(${i.rot} ${i.x + i.w / 2} ${i.y + i.h / 2})` : "";
    },
    fixtureName(f: PublicTableMapFixture): string {
      return f.label || FIXTURE_NAMES[f.kind] || "";
    },
  },
});
</script>

<style scoped lang="scss">
.tbl-page {
  min-height: 100dvh;
  background: #f3eee6;
  color: #161310;
  font-family: Heebo, "Segoe UI", Tahoma, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
  box-sizing: border-box;
}
.tbl-card {
  width: min(560px, 100%);
  background: #fffcfa;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(18, 16, 14, 0.12);
  padding: 24px 20px;
  text-align: center;
}
h1 { margin: 4px 0 6px; font-size: 26px; font-weight: 900; }
h2 { margin: 0 0 6px; font-size: 19px; }
.tbl-kicker { margin: 0; color: #6e5228; font-weight: 800; font-size: 15px; }
.tbl-when { margin: 2px 0 0; font-weight: 700; font-size: 14px; color: #3b342d; }
.tbl-muted { color: #5e564e; font-size: 13px; margin: 8px 0 0; }
.tbl-hello { font-weight: 700; margin: 18px 0 8px; }
.tbl-hero { background: #12100e; color: #f3eee6; border-radius: 20px; padding: 18px 12px 16px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.tbl-hero-kicker { font-size: 13px; font-weight: 700; color: #e9d6b0; }
.tbl-hero-label { font-size: 56px; line-height: 1.05; font-weight: 900; letter-spacing: -0.02em; color: #fffcfa; word-break: break-word; }
.tbl-hero-sub { font-size: 13px; color: #e9d6b0; }
.tbl-map { margin: 16px 0 0; }
.tbl-map svg { width: 100%; height: auto; max-height: 60vh; background: #f8f4ee; border: 1px solid rgba(22, 19, 16, 0.11); border-radius: 16px; }
.fx { fill: #e8e0d3; stroke: #b9ab95; stroke-width: 2; }
.fx-t { fill: #3b342d; font-size: 22px; font-weight: 700; }
.tb ellipse, .tb rect { fill: #fffcfa; stroke: #8f8578; stroke-width: 3; }
.tb text { fill: #3b342d; font-size: 28px; font-weight: 800; }
.tb.mine ellipse, .tb.mine rect { fill: #c9a36a; stroke: #12100e; stroke-width: 5; }
.tb.mine text { fill: #12100e; font-size: 34px; font-weight: 900; }
.pin path { fill: #12100e; }
.pin circle { fill: #c9a36a; }
.tbl-note { background: #fff8e8; color: #3d2c08; border: 1px solid #ead7a8; border-radius: 16px; padding: 16px; margin: 18px 0 4px; }
.tbl-note p { margin: 0; font-size: 14px; line-height: 1.6; }
.tbl-links { display: flex; gap: 16px; justify-content: center; margin-top: 14px; }
.tbl-link { color: #6e5228; font-weight: 800; }
.tbl-link:focus-visible { outline: 2px solid #c9a36a; outline-offset: 2px; }
.tbl-foot { margin-top: 16px; color: #5e564e; font-size: 12px; }
</style>
