<template>
  <div class="vstrip" role="group" :aria-label="`סגנון תצוגה · ${blockHe}`">
    <div class="vh"><b>סגנון תצוגה</b><span>אותו תוכן, פריסה אחרת</span></div>
    <div class="vopts">
      <button
        v-for="o in options"
        :key="o.id"
        type="button"
        class="vopt"
        :class="{ on: o.id === current }"
        :aria-pressed="o.id === current ? 'true' : 'false'"
        @click="$emit('pick', o.id)"
      >
        <span class="mini" :style="miniStyle" aria-hidden="true">
          <!-- hero -->
          <template v-if="o.id === 'full'">
            <img v-if="sample.hero" class="m-bg" :src="sample.hero" alt="" />
            <span class="m-shade"></span>
            <span class="m-txt m-txt--full"><b>{{ sample.title }}</b><i></i><i class="s"></i></span>
          </template>
          <template v-else-if="o.id === 'split'">
            <span class="m-split-img"><img v-if="sample.hero" :src="sample.hero" alt="" /></span>
            <span class="m-txt"><b>{{ sample.title }}</b><i class="rule"></i><span class="m-cd"><i></i><i></i><i></i></span></span>
          </template>
          <template v-else-if="o.id === 'arch'">
            <span class="m-arch"><img v-if="sample.hero" :src="sample.hero" alt="" /></span>
            <span class="m-txt m-txt--c"><b>{{ sample.title }}</b><span class="m-cd"><i></i><i></i><i></i></span></span>
          </template>
          <!-- gallery -->
          <template v-else-if="o.id === 'honey'">
            <span class="m-honey">
              <span v-for="(src, i) in imgs(7)" :key="i" class="hx" :class="{ r2: i >= 4 }"><img :src="src" alt="" /></span>
            </span>
          </template>
          <template v-else-if="o.id === 'bento'">
            <span class="m-bento">
              <span v-for="(src, i) in imgs(6)" :key="i" :class="'b' + i"><img :src="src" alt="" /></span>
            </span>
          </template>
          <template v-else-if="o.id === 'polaroid'">
            <span class="m-pola">
              <span v-for="(src, i) in imgs(4)" :key="i" class="pl"><img :src="src" alt="" /></span>
            </span>
          </template>
          <!-- schedule -->
          <template v-else-if="o.id === 'timeline'">
            <span class="m-tl">
              <span v-for="(it, i) in items" :key="i" class="tl-i"><i class="dot"></i><b>{{ it.time }}</b><em>{{ it.label }}</em></span>
            </span>
          </template>
          <template v-else-if="o.id === 'cards'">
            <span class="m-cards">
              <span v-for="(it, i) in items" :key="i" class="cd"><i></i><b>{{ it.time }}</b><em>{{ it.label }}</em></span>
            </span>
          </template>
          <template v-else>
            <span class="m-list">
              <span v-for="(it, i) in items" :key="i" class="li"><em>{{ it.label }}</em><i></i><b>{{ it.time }}</b></span>
            </span>
          </template>
        </span>
        <span class="vn">{{ o.he }}</span>
        <small :class="{ def: o.id === preset }">{{ o.id === preset ? "ברירת מחדל של התבנית" : o.desc }}</small>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import type { VariantStripSample } from "./variantStrip";


/**
 * The «⇄ סגנון» strip in the תוכן tab: three small previews of the same content in each layout
 * (the host's own title, photos and schedule, in the template's colours). One click = one undo step.
 */
export default defineComponent({
  name: "WorkspaceVariantStrip",
  props: {
    blockHe: { type: String, default: "" },
    options: { type: Array as PropType<Array<{ id: string; he: string; desc: string }>>, required: true },
    current: { type: String, required: true },
    preset: { type: String, required: true },
    sample: { type: Object as PropType<VariantStripSample>, required: true },
  },
  emits: ["pick"],
  setup(props) {
    const miniStyle = computed(() => {
      const c = props.sample.colors;
      return {
        "--m-bg": c.bg,
        "--m-surface": c.surface,
        "--m-ink": c.ink,
        "--m-accent": c.accent,
        "--m-line": c.line,
        "--m-font": props.sample.font,
      } as Record<string, string>;
    });
    function imgs(n: number): string[] {
      const list = props.sample.images.filter(Boolean);
      if (!list.length) return [];
      return Array.from({ length: n }, (_, i) => list[i % list.length]);
    }
    const items = computed(() => props.sample.items.slice(0, 4));
    return { miniStyle, imgs, items };
  },
});
</script>

<style scoped>
.vstrip { border-top: 1px dashed var(--line); padding: 10px 10px 12px; background: #fbf8f3; border-radius: 0 0 14px 14px; }
.vh { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: var(--muted); margin-bottom: 8px; }
.vh b { color: var(--ink); font-size: 13px; }
.vopts { display: flex; gap: 8px; padding: 2px; }
.vopt { flex: 1 1 0; min-width: 0; text-align: center; }
.mini {
  position: relative; display: flex; flex-direction: column; height: 132px; overflow: hidden;
  border-radius: 10px; border: 1.5px solid var(--line); background: var(--m-bg); color: var(--m-ink);
  direction: rtl;
}
.vopt.on .mini { border-color: var(--rose); box-shadow: 0 0 0 2px var(--rose); }
.vopt:hover .mini { border-color: var(--line-2); }
.vn { display: block; margin-top: 5px; font-size: 12.5px; font-weight: 700; color: var(--ink); }
.vopt small { display: block; font-size: 10.5px; color: var(--muted); line-height: 1.25; margin-top: 1px; }
.vopt small.def { color: var(--rose-ink); font-weight: 600; }
.mini img { width: 100%; height: 100%; object-fit: cover; display: block; max-width: none; }
.mini b { font-family: var(--m-font); font-weight: 700; }
.mini em { font-style: normal; }

.m-bg { position: absolute; inset: 0; }
.m-shade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 30%, rgba(0, 0, 0, 0.7)); }
.m-txt { position: relative; display: flex; flex-direction: column; gap: 4px; padding: 8px; font-size: 13px; line-height: 1.1; text-align: start; }
.m-txt b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.m-txt i { display: block; height: 3px; width: 60%; border-radius: 2px; background: currentColor; opacity: 0.45; }
.m-txt i.s { width: 40%; }
.m-txt--full { margin-top: auto; color: #fff; }
.m-txt--c { align-items: center; text-align: center; padding-top: 4px; }
.m-txt .rule { width: 18px; height: 2px; background: var(--m-accent); opacity: 1; }
.m-split-img { display: block; height: 48%; overflow: hidden; }
.m-arch { display: block; width: 46%; height: 58%; margin: 8px auto 0; border-radius: 999px 999px 6px 6px; overflow: hidden; border: 2px solid var(--m-surface); box-shadow: 0 0 0 1px var(--m-line); }
.m-cd { display: flex; gap: 3px; }
.m-cd i { width: 14px; height: 10px; border-radius: 3px; background: var(--m-surface); border: 1px solid var(--m-line); opacity: 1; }

.m-honey { display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: 2px; height: 100%; padding: 10px 6px; }
.m-honey .hx { width: 22%; aspect-ratio: 1 / 1.1547; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); overflow: hidden; }
.m-honey .hx.r2 { margin-top: -6px; }
.m-bento { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 3px; height: 100%; padding: 8px; }
.m-bento > span { border-radius: 4px; overflow: hidden; }
.m-bento .b0 { grid-column: span 2; grid-row: span 2; }
.m-bento .b5 { display: none; }
.m-pola { display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: 6px; height: 100%; padding: 8px; }
.m-pola .pl { width: 38%; aspect-ratio: 1 / 1.15; background: #fff; padding: 3px 3px 9px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18); }
.m-pola .pl:nth-child(odd) { transform: rotate(-4deg); }
.m-pola .pl:nth-child(even) { transform: rotate(3deg); }

.m-tl, .m-cards, .m-list { display: flex; flex-direction: column; gap: 6px; padding: 10px 8px; font-size: 10px; text-align: start; height: 100%; justify-content: center; }
.m-tl { border-inline-start: 0; position: relative; padding-inline-start: 18px; }
.m-tl::before { content: ""; position: absolute; inset-inline-start: 11px; top: 14px; bottom: 14px; width: 1.5px; background: var(--m-line); }
.tl-i { position: relative; display: flex; flex-direction: column; line-height: 1.15; }
.tl-i .dot { position: absolute; inset-inline-start: -10px; top: 2px; width: 7px; height: 7px; border-radius: 50%; background: var(--m-bg); border: 2px solid var(--m-accent); }
.m-tl b, .m-cards b, .m-list b { color: var(--m-accent); font-size: 10.5px; }
.m-tl em, .m-cards em, .m-list em { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.m-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; align-content: center; }
.m-cards .cd { display: flex; flex-direction: column; gap: 1px; padding: 4px; border-radius: 5px; background: var(--m-surface); border: 1px solid var(--m-line); line-height: 1.15; min-width: 0; }
.m-cards .cd i { width: 10px; height: 10px; border-radius: 3px; background: var(--m-accent); }
.m-list .li { display: flex; align-items: baseline; gap: 3px; padding-bottom: 4px; border-bottom: 1px solid var(--m-line); }
.m-list .li i { flex: 1; border-bottom: 1px dotted var(--m-accent); min-width: 6px; }
</style>
