<template>
  <div
    ref="viewport"
    class="viewport"
    :class="{ panning: drag && drag.kind === 'pan' }"
    :style="gridStyle"
    tabindex="0"
    aria-label="מפת האולם. גררו שולחנות, גלגלת לזום, גרירה על הרקע להזזה"
    @pointerdown="onDown"
    @wheel.prevent="onWheel"
  >
    <div class="world" :style="worldStyle">
      <div
        v-for="f in board.fixtures"
        :key="f.id"
        class="fx"
        :class="[f.kind, { selected: isSel(f.id) }]"
        :data-fx="f.id"
        :style="boxStyle(f)"
      >
        <span>{{ f.label }}</span>
        <template v-if="single === f.id">
          <div v-for="h in cornerHandles" :key="h" class="handle" :class="h" :data-handle="h"></div>
        </template>
      </div>

      <div
        v-for="t in board.tables"
        :key="t.key"
        class="tbl"
        :class="[t.shape, t.side ? 'side-' + t.side : '', { selected: isSel(t.key), full: board.used(t.key) >= t.seats, over: board.used(t.key) > t.seats, 'drop-over': dropKey === t.key }]"
        :data-key="t.key"
        :style="boxStyle(t)"
      >
        <div
          v-for="c in chairsFor(t)"
          :key="c.i"
          class="chair"
          :class="[c.cell ? 'filled' : 'empty', { hi: single === t.key && board.selectedSeat === c.i, over: dropSeat === t.key + ':' + c.i }]"
          :data-table="t.key"
          :data-seat="c.i"
          :data-guest="c.cell ? c.cell.guest.id : null"
          :style="{ left: c.x + 'px', top: c.y + 'px', background: c.cell ? colorFor(c.cell.guest) : null }"
          :title="c.cell ? chairTitle(c.cell) : 'כסא ' + (c.i + 1) + ' פנוי'"
        >{{ c.cell && c.cell.offset === 0 ? initialsOf(c.cell.guest.full_name) : c.cell ? "+" : "" }}</div>
        <div class="tbl-surface">
          <div class="t-name">{{ t.label }}</div>
          <div v-if="t.side" class="t-sub">{{ sideLabels[t.side] }}</div>
          <div class="t-count">{{ board.used(t.key) }} מתוך {{ t.seats }}</div>
        </div>
        <template v-if="single === t.key">
          <div v-for="h in handlesFor(t)" :key="h" class="handle" :class="h" :data-handle="h"></div>
          <div class="rotate-handle" data-handle="rotate" title="סיבוב (R)"></div>
        </template>
      </div>

      <div v-for="(g, i) in guides" :key="'g' + i" :class="g.type === 'v' ? 'guide-v' : 'guide-h'" :style="g.type === 'v' ? { left: g.pos + 'px' } : { top: g.pos + 'px' }"></div>
      <div v-if="marquee" class="marquee" :style="marqueeStyle"></div>
    </div>

    <div v-if="tip" class="size-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">{{ tip.text }}</div>

    <div class="zoom-fab" @pointerdown.stop>
      <button type="button" aria-label="הקטנה" @click="zoomBy(1 / 1.2)">−</button>
      <button type="button" class="pct" title="התאמה למסך" @click="fit">{{ Math.round(board.cam.scale * 100) }}%</button>
      <button type="button" aria-label="הגדלה" @click="zoomBy(1.2)">+</button>
    </div>
    <p class="hint-keys">Delete מחיקה · Ctrl+D שכפול · Ctrl+Z ביטול · חצים להזזה · R סיבוב · Shift לבחירה מרובה · גלגלת לזום · גרירה על הרקע להזזת המפה</p>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { SeatingBoard } from "@/helpers/seating/board";
import {
  CHAIR,
  chairPositions,
  clamp,
  computeGuides,
  contentBounds,
  Guide,
  MAX_SCALE,
  MIN_SCALE,
  SeatCell,
  seatsFromSize,
  snap,
  toLocal,
} from "@/helpers/seating/engine";
import { initials, SIDE_COLORS, SIDE_LABELS } from "@/helpers/seating/labels";
import { CrmGuest, Fixture, SeatTable } from "@/helpers/seating/types";

type Item = SeatTable | Fixture;
const GRID_HALF = 12;
interface DragState {
  kind: "pan" | "move" | "resize" | "rotate" | "marquee" | "pinch";
  pointer: number;
  startClient: { x: number; y: number };
  startWorld: { x: number; y: number };
  cam?: { x: number; y: number; scale: number };
  ids?: string[];
  originals?: Record<string, { x: number; y: number }>;
  handle?: string;
  orig?: Item;
  isTable?: boolean;
  moved?: boolean;
  additive?: boolean;
  pinch?: { dist: number; scale: number; cx: number; cy: number; camx: number; camy: number };
}

export default defineComponent({
  name: "SeatingCanvas",

  emits: ["guest-down", "seat-pick"],

  setup() {
    const board = inject("seatingBoard") as SeatingBoard;
    return { board };
  },

  data() {
    return {
      drag: null as DragState | null,
      guides: [] as Guide[],
      tip: null as { x: number; y: number; text: string } | null,
      marquee: null as { x: number; y: number; w: number; h: number } | null,
      dropKey: null as string | null,
      dropSeat: null as string | null,
      pointers: new Map<number, { x: number; y: number }>(),
      sideLabels: SIDE_LABELS,
      cornerHandles: ["nw", "ne", "sw", "se"],
    };
  },

  computed: {
    gridStyle(): Record<string, string> {
      const c = this.board.cam;
      const minor = 24 * c.scale;
      const major = 120 * c.scale;
      return {
        backgroundSize: `${minor}px ${minor}px, ${minor}px ${minor}px, ${major}px ${major}px, ${major}px ${major}px`,
        backgroundPosition: `${c.x}px ${c.y}px, ${c.x}px ${c.y}px, ${c.x}px ${c.y}px, ${c.x}px ${c.y}px`,
      };
    },
    worldStyle(): Record<string, string> {
      const c = this.board.cam;
      return { transform: `translate(${c.x}px, ${c.y}px) scale(${c.scale})` };
    },
    single(): string | null {
      return this.board.selected.length === 1 ? this.board.selected[0] : null;
    },
    marqueeStyle(): Record<string, string> {
      const m = this.marquee;
      if (!m) return {};
      return { left: m.x + "px", top: m.y + "px", width: m.w + "px", height: m.h + "px" };
    },
  },

  mounted() {
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    window.addEventListener("pointercancel", this.onUp);
  },

  beforeUnmount() {
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    window.removeEventListener("pointercancel", this.onUp);
  },

  methods: {
    isSel(id: string): boolean {
      return this.board.selected.indexOf(id) >= 0;
    },
    boxStyle(t: Item): Record<string, string> {
      return {
        left: t.x + "px",
        top: t.y + "px",
        width: t.w + "px",
        height: t.h + "px",
        transform: `rotate(${t.rot || 0}deg)`,
      };
    },
    handlesFor(t: SeatTable): string[] {
      return t.shape === "round" ? ["nw", "ne", "sw", "se"] : ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
    },
    chairsFor(t: SeatTable): { i: number; x: number; y: number; cell: SeatCell | null }[] {
      const cells = this.board.cells(t);
      return chairPositions(t, CHAIR).map((p) => ({ ...p, cell: cells[p.i] || null }));
    },
    colorFor(g: CrmGuest): string {
      const group = g.group_id ? this.board.groupMap.get(g.group_id) : null;
      return group?.color || SIDE_COLORS[g.side || "none"];
    },
    initialsOf(name: string): string {
      return initials(name);
    },
    chairTitle(c: SeatCell): string {
      return c.offset ? `${c.guest.full_name} · מקום ${c.offset + 1} מתוך ${c.guest.party_size}` : c.guest.full_name;
    },

    /* ───────── camera ───────── */
    rect(): DOMRect {
      return (this.$refs.viewport as HTMLElement).getBoundingClientRect();
    },
    worldPoint(clientX: number, clientY: number): { x: number; y: number } {
      const r = this.rect();
      const c = this.board.cam;
      return { x: (clientX - r.left - c.x) / c.scale, y: (clientY - r.top - c.y) / c.scale };
    },
    viewCenter(): { x: number; y: number } {
      const r = this.rect();
      return this.worldPoint(r.left + r.width / 2, r.top + r.height / 2);
    },
    zoomAt(factor: number, clientX?: number, clientY?: number) {
      const r = this.rect();
      const px = clientX == null ? r.width / 2 : clientX - r.left;
      const py = clientY == null ? r.height / 2 : clientY - r.top;
      const c = this.board.cam;
      const wx = (px - c.x) / c.scale;
      const wy = (py - c.y) / c.scale;
      c.scale = clamp(MIN_SCALE, MAX_SCALE, c.scale * factor);
      c.x = px - wx * c.scale;
      c.y = py - wy * c.scale;
    },
    zoomBy(f: number) {
      this.zoomAt(f);
    },
    fit() {
      const el = this.$refs.viewport as HTMLElement | undefined;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const b = contentBounds(this.board.tables, this.board.fixtures);
      const pad = r.width < 600 ? 24 : 70;
      const s = clamp(MIN_SCALE, 1.15, Math.min(r.width / (b.w + pad * 2), r.height / (b.h + pad * 2)));
      this.board.cam.scale = s;
      this.board.cam.x = r.width / 2 - (b.x + b.w / 2) * s;
      this.board.cam.y = r.height / 2 - (b.y + b.h / 2) * s;
    },
    focusItem(key: string, scale = 1) {
      const t = this.board.table(key) || this.board.fixture(key);
      const r = this.rect();
      if (!t || !r.width) return;
      const c = this.board.cam;
      c.scale = clamp(MIN_SCALE, MAX_SCALE, scale);
      c.x = r.width / 2 - (t.x + t.w / 2) * c.scale;
      c.y = r.height / 2 - (t.y + t.h / 2) * c.scale;
    },
    onWheel(e: WheelEvent) {
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      this.zoomAt(factor, e.clientX, e.clientY);
    },

    /* ───────── pointer ───────── */
    onDown(e: PointerEvent) {
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pointers.size === 2) {
        this.startPinch();
        return;
      }
      if (e.button != null && e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest(".zoom-fab, button, input, select, textarea, .canvas-overlay")) return;
      const wp = this.worldPoint(e.clientX, e.clientY);
      const base = { pointer: e.pointerId, startClient: { x: e.clientX, y: e.clientY }, startWorld: wp };
      const handle = target.closest("[data-handle]") as HTMLElement | null;
      const chair = target.closest(".chair") as HTMLElement | null;
      const tbl = target.closest(".tbl") as HTMLElement | null;
      const fx = target.closest(".fx") as HTMLElement | null;
      (this.$refs.viewport as HTMLElement).focus({ preventScroll: true });

      if (handle && (tbl || fx)) {
        const key = (tbl?.dataset.key || fx?.dataset.fx) as string;
        const item = this.board.table(key) || this.board.fixture(key);
        if (!item) return;
        e.preventDefault();
        e.stopPropagation();
        this.board.pushHist();
        const kind = handle.dataset.handle === "rotate" ? "rotate" : "resize";
        this.drag = { ...base, kind, ids: [key], handle: handle.dataset.handle, orig: { ...item }, isTable: !!tbl };
        if (kind === "resize" && tbl) this.showTip(e, `${(item as SeatTable).seats} מקומות`);
        return;
      }

      if (chair && tbl) {
        const key = tbl.dataset.key as string;
        const seat = Number(chair.dataset.seat);
        const guestId = Number(chair.dataset.guest) || 0;
        e.preventDefault();
        e.stopPropagation();
        if (this.single !== key) this.board.select([key]);
        this.board.selectedSeat = seat;
        this.$emit("seat-pick", { key, seat });
        if (guestId) this.$emit("guest-down", guestId, e);
        return;
      }

      if (tbl || fx) {
        const key = (tbl?.dataset.key || fx?.dataset.fx) as string;
        if (e.shiftKey || e.metaKey || e.ctrlKey) this.board.select([key], true);
        else if (!this.isSel(key)) this.board.select([key]);
        if (!this.isSel(key)) return;
        e.preventDefault();
        this.board.pushHist();
        const originals: Record<string, { x: number; y: number }> = {};
        this.board.selected.forEach((id) => {
          const it = this.board.table(id) || this.board.fixture(id);
          if (it) originals[id] = { x: it.x, y: it.y };
        });
        this.drag = { ...base, kind: "move", ids: [key].concat(this.board.selected.filter((id) => id !== key)), originals };
        return;
      }

      if (e.shiftKey) {
        this.drag = { ...base, kind: "marquee", additive: true };
        this.marquee = { x: wp.x, y: wp.y, w: 0, h: 0 };
        return;
      }
      this.drag = { ...base, kind: "pan", cam: { ...this.board.cam } };
    },

    startPinch() {
      const pts = Array.from(this.pointers.values());
      if (pts.length < 2) return;
      if (this.drag && this.drag.kind !== "pan") this.finishDrag(false);
      const r = this.rect();
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const cx = (pts[0].x + pts[1].x) / 2 - r.left;
      const cy = (pts[0].y + pts[1].y) / 2 - r.top;
      const c = this.board.cam;
      this.drag = {
        kind: "pinch",
        pointer: -1,
        startClient: { x: cx, y: cy },
        startWorld: { x: 0, y: 0 },
        pinch: { dist, scale: c.scale, cx, cy, camx: c.x, camy: c.y },
      };
    },

    onMove(e: PointerEvent) {
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const d = this.drag;
      if (!d) return;
      if (d.kind === "pinch" && d.pinch) {
        const pts = Array.from(this.pointers.values());
        if (pts.length < 2) return;
        const r = this.rect();
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const cx = (pts[0].x + pts[1].x) / 2 - r.left;
        const cy = (pts[0].y + pts[1].y) / 2 - r.top;
        const p = d.pinch;
        const scale = clamp(MIN_SCALE, MAX_SCALE, p.scale * (dist / Math.max(1, p.dist)));
        const wx = (p.cx - p.camx) / p.scale;
        const wy = (p.cy - p.camy) / p.scale;
        this.board.cam.scale = scale;
        this.board.cam.x = cx - wx * scale;
        this.board.cam.y = cy - wy * scale;
        return;
      }
      if (e.pointerId !== d.pointer) return;
      const dxc = e.clientX - d.startClient.x;
      const dyc = e.clientY - d.startClient.y;
      if (!d.moved && dxc * dxc + dyc * dyc < 9) return;
      d.moved = true;
      const wp = this.worldPoint(e.clientX, e.clientY);

      if (d.kind === "pan" && d.cam) {
        this.board.cam.x = d.cam.x + dxc;
        this.board.cam.y = d.cam.y + dyc;
        return;
      }
      if (d.kind === "marquee") {
        const x = Math.min(d.startWorld.x, wp.x);
        const y = Math.min(d.startWorld.y, wp.y);
        this.marquee = { x, y, w: Math.abs(wp.x - d.startWorld.x), h: Math.abs(wp.y - d.startWorld.y) };
        return;
      }
      if (d.kind === "move" && d.ids && d.originals) {
        const first = d.ids[0];
        const o = d.originals[first];
        let dx = wp.x - d.startWorld.x;
        let dy = wp.y - d.startWorld.y;
        if (o && !e.altKey) {
          dx = snap(o.x + dx) - o.x;
          dy = snap(o.y + dy) - o.y;
        }
        d.ids.forEach((id) => {
          const it = this.board.table(id) || this.board.fixture(id);
          const orig = d.originals?.[id];
          if (it && orig) {
            it.x = orig.x + dx;
            it.y = orig.y + dy;
          }
        });
        const lead = this.board.table(first) || this.board.fixture(first);
        if (lead) {
          const moving = new Set(d.ids);
          const others = (this.board.tables as Item[])
            .concat(this.board.fixtures)
            .filter((it) => !moving.has((it as SeatTable).key || (it as Fixture).id))
            .map((it) => ({ x: it.x, y: it.y, w: it.w, h: it.h }));
          this.guides = computeGuides(lead, others, 3);
        }
        return;
      }
      if (d.kind === "resize" && d.ids && d.orig) {
        const it = this.board.table(d.ids[0]) || this.board.fixture(d.ids[0]);
        if (!it) return;
        const o = d.orig;
        const cx = o.x + o.w / 2;
        const cy = o.y + o.h / 2;
        const local = toLocal(wp.x, wp.y, cx, cy, o.rot || 0);
        const h = d.handle || "se";
        const isRound = d.isTable && (o as SeatTable).shape === "round";
        let hw = Math.max(d.isTable ? 50 : 20, Math.abs(local.x));
        let hh = isRound ? hw : Math.max(d.isTable ? 44 : 20, Math.abs(local.y));
        if (isRound) {
          hw = Math.max(Math.abs(local.x), Math.abs(local.y), 50);
          hh = hw;
        }
        if (h === "n" || h === "s") hw = o.w / 2;
        if (h === "e" || h === "w") hh = o.h / 2;
        it.w = Math.max(d.isTable ? 100 : 40, snap(hw * 2, GRID_HALF));
        it.h = Math.max(d.isTable ? 88 : 40, snap(hh * 2, GRID_HALF));
        it.x = cx - it.w / 2;
        it.y = cy - it.h / 2;
        if (d.isTable) {
          const t = it as SeatTable;
          t.seats = seatsFromSize(t);
          this.showTip(e, `${t.seats} מקומות`);
        } else {
          this.showTip(e, `${Math.round(it.w)}×${Math.round(it.h)}`);
        }
        return;
      }
      if (d.kind === "rotate" && d.ids && d.orig) {
        const it = this.board.table(d.ids[0]) || this.board.fixture(d.ids[0]);
        if (!it) return;
        const o = d.orig;
        const cx = o.x + o.w / 2;
        const cy = o.y + o.h / 2;
        const ang = (Math.atan2(wp.y - cy, wp.x - cx) * 180) / Math.PI + 90;
        it.rot = (((e.shiftKey ? Math.round(ang) : snap(ang, 15)) % 360) + 360) % 360;
        this.showTip(e, `${it.rot}°`);
      }
    },

    onUp(e: PointerEvent) {
      this.pointers.delete(e.pointerId);
      const d = this.drag;
      if (!d) return;
      if (d.kind === "pinch") {
        if (this.pointers.size < 2) this.drag = null;
        return;
      }
      if (e.pointerId !== d.pointer) return;
      this.finishDrag(true);
    },

    finishDrag(commit: boolean) {
      const d = this.drag;
      this.drag = null;
      this.guides = [];
      this.tip = null;
      if (!d) return;
      if (d.kind === "pan") {
        if (!d.moved && this.board.selected.length) this.board.select([]);
        return;
      }
      if (d.kind === "marquee") {
        const m = this.marquee;
        this.marquee = null;
        if (m && m.w > 4 && m.h > 4) {
          const hit = (it: Item) => it.x < m.x + m.w && it.x + it.w > m.x && it.y < m.y + m.h && it.y + it.h > m.y;
          const ids = this.board.tables.filter(hit).map((t) => t.key).concat(this.board.fixtures.filter(hit).map((f) => f.id));
          this.board.select(ids, d.additive);
        }
        return;
      }
      if (d.kind === "resize" && d.isTable && d.ids) {
        const t = this.board.table(d.ids[0]);
        if (t) this.board.afterResize(t);
      }
      if (!commit || !d.moved) {
        this.board.dropHistIfUnchanged();
        return;
      }
      this.board.commit();
    },

    showTip(e: PointerEvent, text: string) {
      const r = this.rect();
      this.tip = { x: e.clientX - r.left + 14, y: e.clientY - r.top + 14, text };
    },

    /* ───────── guest drop highlight (called by the view while dragging a guest) ───────── */
    highlight(key: string | null, seatKey: string | null) {
      this.dropKey = key;
      this.dropSeat = seatKey;
    },
  },
});
</script>

<style lang="scss" scoped>
.viewport {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 18px;
  background-color: #efe8dc;
  background-image: linear-gradient(rgba(22, 19, 16, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(22, 19, 16, 0.07) 1px, transparent 1px),
    linear-gradient(rgba(22, 19, 16, 0.13) 1px, transparent 1px),
    linear-gradient(90deg, rgba(22, 19, 16, 0.13) 1px, transparent 1px);
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  &.panning {
    cursor: grabbing;
  }
  &:focus-visible {
    outline: 2px solid rgba(201, 163, 106, 0.9);
    outline-offset: -2px;
  }
}
.world {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: visible;
  transform-origin: 0 0;
  direction: ltr;
}
.fx {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  padding: 6px;
  letter-spacing: 0.04em;
  box-sizing: border-box;
  direction: rtl;
  cursor: move;
  &.selected {
    outline: 2px solid #c9a36a;
    outline-offset: 2px;
  }
  &.dance {
    background: repeating-linear-gradient(45deg, rgba(22, 19, 16, 0.05) 0 8px, transparent 8px 16px), rgba(255, 252, 250, 0.55);
    color: #161310;
    border: 1.5px dashed rgba(22, 19, 16, 0.3);
    border-radius: 18px;
  }
  &.stage {
    background: #2a231c;
    color: #f3eee6;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(18, 16, 14, 0.18);
  }
  &.bar,
  &.buffet {
    background: #12100e;
    color: #f3eee6;
    border-radius: 14px;
  }
  &.dj {
    background: #3d2e22;
    color: #f3eee6;
    border-radius: 14px;
  }
  &.door,
  &.label {
    background: #d9d0c3;
    color: #161310;
    border-radius: 12px;
    border: 1px solid rgba(22, 19, 16, 0.16);
  }
  &.label {
    background: rgba(255, 252, 250, 0.7);
  }
  &.chuppah {
    background: #fffcfa;
    color: #161310;
    border: 2px solid #c9a36a;
    border-radius: 50%;
  }
}
.tbl {
  position: absolute;
  direction: rtl;
  &.selected {
    z-index: 6;
  }
}
.tbl-surface {
  position: absolute;
  inset: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  text-align: center;
  box-shadow: inset 0 0 0 3px rgba(201, 163, 106, 0.4), 0 10px 22px rgba(18, 16, 14, 0.12);
  background: radial-gradient(circle at 36% 32%, #fffdf9, #f4eadb 52%, #e4d3bc);
  color: #161310;
  cursor: grab;
  overflow: hidden;
  padding: 4px;
}
.tbl.round .tbl-surface {
  border-radius: 50%;
}
.tbl.rect .tbl-surface {
  border-radius: 22px;
}
.tbl.side-bride .tbl-surface {
  background: radial-gradient(circle at 36% 32%, #fff8f7, #f8e0e1 58%, #edc9cb);
  box-shadow: inset 0 0 0 3px rgba(220, 91, 102, 0.45), 0 10px 22px rgba(18, 16, 14, 0.12);
}
.tbl.side-groom .tbl-surface {
  background: radial-gradient(circle at 36% 32%, #f7fbf8, #dce8df 58%, #c5d6c8);
  box-shadow: inset 0 0 0 3px rgba(61, 90, 74, 0.4), 0 10px 22px rgba(18, 16, 14, 0.12);
}
.tbl.side-shared .tbl-surface {
  background: radial-gradient(circle at 36% 32%, #f7f8fc, #d9deea 58%, #c2c9db);
  box-shadow: inset 0 0 0 3px rgba(63, 78, 106, 0.4), 0 10px 22px rgba(18, 16, 14, 0.12);
}
.tbl.selected .tbl-surface {
  box-shadow: inset 0 0 0 3px #c9a36a, 0 0 0 3px rgba(201, 163, 106, 0.55), 0 12px 28px rgba(18, 16, 14, 0.16);
}
.tbl.drop-over .tbl-surface {
  box-shadow: inset 0 0 0 3px #c9a36a, 0 0 0 5px rgba(201, 163, 106, 0.7);
}
.tbl .t-name {
  font-weight: 800;
  font-size: 14px;
  line-height: 1.2;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tbl .t-sub {
  font-size: 10px;
  color: #5e564e;
  font-weight: 650;
}
.tbl .t-count {
  font-size: 11px;
  font-weight: 800;
}
.tbl.full .t-count {
  color: #1d5c3a;
}
.tbl.over .t-count {
  color: #8a1c28;
}
.chair {
  position: absolute;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  border-radius: 8px 8px 7px 7px;
  background: #f4efe6;
  border: 1.5px solid rgba(22, 19, 16, 0.22);
  display: grid;
  place-items: center;
  font-size: 8px;
  font-weight: 800;
  color: #161310;
  box-shadow: 0 2px 4px rgba(18, 16, 14, 0.1);
  z-index: 2;
  cursor: pointer;
  &.filled {
    border-color: transparent;
    color: #fffcfa;
    cursor: grab;
  }
  &.empty {
    color: transparent;
  }
  &.over,
  &:hover {
    box-shadow: 0 0 0 2px #c9a36a, 0 2px 4px rgba(18, 16, 14, 0.1);
  }
  &.hi {
    box-shadow: 0 0 0 2px #dc5b66;
  }
}
.handle {
  position: absolute;
  width: 13px;
  height: 13px;
  margin: -6px 0 0 -6px;
  background: #fffcfa;
  border: 2px solid #8a6a38;
  border-radius: 3px;
  z-index: 7;
  box-shadow: 0 1px 3px rgba(18, 16, 14, 0.2);
  &.nw { left: 0; top: 0; cursor: nwse-resize; }
  &.n { left: 50%; top: 0; cursor: ns-resize; }
  &.ne { left: 100%; top: 0; cursor: nesw-resize; }
  &.w { left: 0; top: 50%; cursor: ew-resize; }
  &.e { left: 100%; top: 50%; cursor: ew-resize; }
  &.sw { left: 0; top: 100%; cursor: nesw-resize; }
  &.s { left: 50%; top: 100%; cursor: ns-resize; }
  &.se { left: 100%; top: 100%; cursor: nwse-resize; }
}
.rotate-handle {
  position: absolute;
  left: 50%;
  top: -24px;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 50%;
  background: #12100e;
  border: 2px solid #f3eee6;
  cursor: grab;
  z-index: 7;
  box-shadow: 0 2px 6px rgba(18, 16, 14, 0.25);
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 12px;
    width: 1.5px;
    height: 12px;
    background: #12100e;
    transform: translateX(-50%);
  }
}
.guide-v,
.guide-h {
  position: absolute;
  background: #dc5b66;
  pointer-events: none;
  z-index: 20;
  opacity: 0.85;
}
.guide-v {
  width: 1.5px;
  top: -20000px;
  height: 40000px;
}
.guide-h {
  height: 1.5px;
  left: -20000px;
  width: 40000px;
}
.marquee {
  position: absolute;
  border: 1.5px dashed #8a6a38;
  background: rgba(201, 163, 106, 0.12);
  pointer-events: none;
  z-index: 25;
}
.size-tip {
  position: absolute;
  z-index: 15;
  background: #12100e;
  color: #f3eee6;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.zoom-fab {
  position: absolute;
  bottom: 28px;
  left: 10px;
  display: flex;
  background: #fffcfa;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
  z-index: 5;
  direction: ltr;
  button {
    width: 36px;
    height: 32px;
    border: 0;
    background: #fffcfa;
    color: #161310;
    font-weight: 800;
    font-size: 14px;
    cursor: pointer;
    &:not(:last-child) {
      border-right: 1px solid rgba(22, 19, 16, 0.11);
    }
    &:hover {
      background: #f7f1e8;
    }
  }
  .pct {
    width: 54px;
    font-size: 11px;
    font-weight: 700;
  }
}
.hint-keys {
  position: absolute;
  bottom: 8px;
  right: 12px;
  left: 160px;
  margin: 0;
  font-size: 11px;
  color: #5e564e;
  text-align: right;
  direction: rtl;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 899px) {
  .zoom-fab {
    left: auto;
    right: 10px;
    bottom: 10px;
  }
  .hint-keys {
    display: none;
  }
}
</style>
