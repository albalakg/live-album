<template>
  <div class="hist">
    <div class="hist-bars" aria-hidden="true">
      <i
        v-for="b in bins"
        :key="b.m"
        :class="{ in: b.m + step - 1 >= from && b.m < to }"
        :style="{ height: Math.max(6, Math.round((b.n / maxN) * 100)) + '%' }"
        :title="`${fmt(b.m)} · ${b.n}`"
      ></i>
    </div>
    <div class="hist-sl" dir="ltr">
      <input id="sl-from" type="range" :min="lo" :max="hi - step" :step="step" :value="from" aria-label="משעה" @input="onFrom" />
      <input id="sl-to" type="range" :min="lo + step" :max="hi" :step="step" :value="to" aria-label="עד שעה" @input="onTo" />
    </div>
    <div class="hist-lbl">
      <span>{{ fmt(from) }}–{{ to >= 1440 ? "24:00" : fmt(to) }}</span>
      <span class="hintk">גררו כדי לצמצם · <b>{{ total }}</b> תוצאות</span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { SearchPhoto } from "@/helpers/search/types";
import { hhmm } from "@/helpers/search/text";

export default defineComponent({
  name: "SearchPhotoHistogram",
  props: {
    photos: { type: Array as PropType<SearchPhoto[]>, required: true },
    range: { type: Array as unknown as PropType<[number, number] | null>, default: null },
    total: { type: Number, required: true },
  },
  emits: ["change"],
  data() {
    return { from: 0, to: 1440 };
  },
  computed: {
    lo(): number {
      const mins = this.photos.map((p) => p.min);
      const first = mins.length ? Math.min(...mins) : 19 * 60;
      return Math.min(19 * 60, Math.floor(first / 60) * 60);
    },
    hi(): number {
      return 1440;
    },
    step(): number {
      const span = this.hi - this.lo;
      return span <= 360 ? 15 : span <= 720 ? 30 : 60;
    },
    bins(): { m: number; n: number }[] {
      const out: { m: number; n: number }[] = [];
      for (let m = this.lo; m < this.hi; m += this.step) {
        out.push({ m, n: this.photos.filter((p) => p.min >= m && p.min < m + this.step).length });
      }
      return out;
    },
    maxN(): number {
      return Math.max(1, ...this.bins.map((b) => b.n));
    },
  },
  watch: {
    range: { immediate: true, handler() { this.sync(); } },
    lo() { this.sync(); },
  },
  methods: {
    fmt(m: number): string {
      return hhmm(m);
    },
    sync() {
      const r = this.range;
      this.from = r ? Math.max(this.lo, r[0]) : this.lo;
      this.to = r ? Math.min(this.hi, r[1]) : this.hi;
    },
    onFrom(e: Event) {
      let a = Number((e.target as HTMLInputElement).value);
      if (a >= this.to) a = this.to - this.step;
      this.from = a;
      (e.target as HTMLInputElement).value = String(a);
      this.$emit("change", this.from, this.to, this.lo, this.hi);
    },
    onTo(e: Event) {
      let b = Number((e.target as HTMLInputElement).value);
      if (b <= this.from) b = this.from + this.step;
      this.to = b;
      (e.target as HTMLInputElement).value = String(b);
      this.$emit("change", this.from, this.to, this.lo, this.hi);
    },
  },
});
</script>
