/**
 * Seating builder engine (ported from the approved mock). Pure functions over
 * tables + seats so the Vue view stays thin and the logic is unit-testable.
 */
import { CrmGuest, Fixture, FixtureKind, Seat, SeatTable, TableShape } from "./types";

export const GRID = 24;
export const PAD = 26;
export const CHAIR = 24;
export const PITCH = 28;
export const MIN_SCALE = 0.22;
export const MAX_SCALE = 2.2;
export const WORLD_W = 2400;
export const WORLD_H = 1800;
export const MIN_SEATS = 2;
export const MAX_SEATS = 30;

export const clamp = (a: number, b: number, v: number): number => Math.max(a, Math.min(b, v));
export const snap = (v: number, g = GRID): number => Math.round(v / g) * g;

let uidCounter = 0;
export function uid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}${Date.now().toString(36)}${uidCounter.toString(36)}`;
}

export const FIXTURE_DEFAULTS: Record<FixtureKind, { label: string; w: number; h: number }> = {
  dance: { label: "רחבת ריקודים", w: 360, h: 180 },
  stage: { label: "במה", w: 240, h: 56 },
  bar: { label: "בר", w: 160, h: 100 },
  dj: { label: "DJ", w: 140, h: 100 },
  door: { label: "כניסה", w: 200, h: 56 },
  buffet: { label: "מזנון", w: 260, h: 72 },
  chuppah: { label: "חופה", w: 140, h: 140 },
  label: { label: "טקסט", w: 160, h: 48 },
};

/** Resize the table box to fit its seat count, keeping its center. */
export function applySize(t: SeatTable): SeatTable {
  const cx = t.x + t.w / 2;
  const cy = t.y + t.h / 2;
  if (t.shape === "round") {
    const d = clamp(96, 260, (t.seats * PITCH) / Math.PI);
    const box = Math.round(d + PAD * 2);
    t.w = box;
    t.h = box;
  } else {
    const per = t.seats * PITCH;
    const sw = clamp(100, 320, per * 0.28);
    const sh = clamp(72, 200, per / 2 - sw);
    t.w = Math.round(sw + PAD * 2);
    t.h = Math.round(sh + PAD * 2);
  }
  t.x = Math.round(cx - t.w / 2);
  t.y = Math.round(cy - t.h / 2);
  return t;
}

/** Inverse of applySize: how many chairs fit a box of this size. */
export function seatsFromSize(t: Pick<SeatTable, "shape" | "w" | "h">): number {
  if (t.shape === "round") {
    const d = Math.min(t.w, t.h) - PAD * 2;
    return clamp(4, 24, Math.round((d * Math.PI) / PITCH));
  }
  const sw = t.w - PAD * 2;
  const sh = t.h - PAD * 2;
  return clamp(4, 24, Math.round((2 * (sw + sh)) / PITCH));
}

export function chairPositions(t: { shape: TableShape; seats: number; w: number; h: number }, chair = CHAIR): { i: number; x: number; y: number }[] {
  const pts: { i: number; x: number; y: number }[] = [];
  const cx = t.w / 2;
  const cy = t.h / 2;
  if (t.shape === "round") {
    const r = Math.min(t.w, t.h) / 2 - chair / 2 - 1;
    for (let i = 0; i < t.seats; i++) {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
      pts.push({ i, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pts;
  }
  const inset = chair / 2 + 2;
  const L = inset;
  const R = t.w - inset;
  const T = inset;
  const B = t.h - inset;
  const rw = R - L;
  const rh = B - T;
  const per = 2 * (rw + rh);
  for (let i = 0; i < t.seats; i++) {
    const d = ((i + 0.5) / t.seats) * per;
    let x: number;
    let y: number;
    if (d <= rw) {
      x = L + d;
      y = T;
    } else if (d <= rw + rh) {
      x = R;
      y = T + (d - rw);
    } else if (d <= rw + rh + rw) {
      x = R - (d - rw - rh);
      y = B;
    } else {
      x = L;
      y = B - (d - rw - rh - rw);
    }
    pts.push({ i, x, y });
  }
  return pts;
}

export function newTable(shape: TableShape, index: number, cx: number, cy: number): SeatTable {
  const t: SeatTable = {
    id: null,
    key: uid("n"),
    label: `שולחן ${index}`,
    shape,
    seats: shape === "rect" ? 8 : 10,
    side: null,
    x: cx - 80,
    y: cy - 80,
    w: 160,
    h: 160,
    rot: 0,
  };
  applySize(t);
  t.x = snap(t.x);
  t.y = snap(t.y);
  return t;
}

export function newFixture(kind: FixtureKind, cx: number, cy: number): Fixture {
  const def = FIXTURE_DEFAULTS[kind];
  return { id: uid("f"), kind, label: def.label, x: snap(cx - def.w / 2), y: snap(cy - def.h / 2), w: def.w, h: def.h, rot: 0 };
}

/* ───────── seats ───────── */

export type SeatMap = Record<number, Seat>;

export interface SeatCell {
  guest: CrmGuest;
  offset: number;
}

export function party(g: CrmGuest): number {
  return Math.max(1, g.party_size || 1);
}

export function isSeatable(g: CrmGuest): boolean {
  return g.status !== 2 && g.status !== 4;
}

export function guestsAt(tableKey: string, seats: SeatMap, guests: Map<number, CrmGuest>): CrmGuest[] {
  const out: CrmGuest[] = [];
  Object.keys(seats).forEach((id) => {
    const s = seats[Number(id)];
    const g = guests.get(Number(id));
    if (s && s.table === tableKey && g) out.push(g);
  });
  return out.sort((a, b) => (seats[a.id].seat ?? 999) - (seats[b.id].seat ?? 999) || a.id - b.id);
}

export function occupancy(tableKey: string, seats: SeatMap, guests: Map<number, CrmGuest>): number {
  return guestsAt(tableKey, seats, guests).reduce((s, g) => s + party(g), 0);
}

export function seatCells(t: SeatTable, seats: SeatMap, guests: Map<number, CrmGuest>): (SeatCell | null)[] {
  const map: (SeatCell | null)[] = new Array(t.seats).fill(null);
  guestsAt(t.key, seats, guests).forEach((g) => {
    const start = seats[g.id].seat;
    if (start == null) return;
    for (let i = 0; i < party(g); i++) {
      const idx = start + i;
      if (idx >= 0 && idx < map.length) map[idx] = { guest: g, offset: i };
    }
  });
  return map;
}

export function findBlock(t: SeatTable, seats: SeatMap, guests: Map<number, CrmGuest>, needed: number, prefer: number | null, ignoreGuest?: number): number {
  const cells = seatCells(t, seats, guests);
  const n = cells.length;
  if (needed > n) return -1;
  const free = (i: number) => !cells[i] || cells[i]?.guest.id === ignoreGuest;
  const order: number[] = [];
  if (prefer != null && prefer >= 0) order.push(Math.min(prefer, n - needed));
  for (let i = 0; i <= n - needed; i++) if (order.indexOf(i) < 0) order.push(i);
  for (const s of order) {
    let ok = s >= 0 && s + needed <= n;
    for (let k = s; ok && k < s + needed; k++) ok = free(k);
    if (ok) return s;
  }
  return -1;
}

export interface PlaceResult {
  ok: boolean;
  message?: string;
}

/** Put a guest at a table (optionally preferring a seat). Mutates `seats`. */
export function place(seats: SeatMap, tables: SeatTable[], guests: Map<number, CrmGuest>, guestId: number, tableKey: string | null, prefer: number | null = null): PlaceResult {
  const g = guests.get(guestId);
  if (!g) return { ok: false };
  if (!isSeatable(g)) return { ok: false, message: `${g.full_name} סימן/ה שלא מגיע/ה` };
  if (!tableKey) {
    delete seats[guestId];
    return { ok: true };
  }
  const t = tables.find((x) => x.key === tableKey);
  if (!t) return { ok: false };
  const current = seats[guestId];
  const used = occupancy(t.key, seats, guests) - (current && current.table === t.key ? party(g) : 0);
  if (used + party(g) > t.seats) {
    return { ok: false, message: `${t.label} מלא: נשארו ${Math.max(0, t.seats - used)} מקומות, צריך ${party(g)}` };
  }
  const start = findBlock(t, seats, guests, party(g), prefer, guestId);
  if (start < 0) return { ok: false, message: "אין מספיק כסאות פנויים ברצף. נסו כסא אחר" };
  seats[guestId] = { table: t.key, seat: start };
  return { ok: true };
}

/** Drop on a specific chair: swap with an equal-size guest, else make room. */
export function swapOrPlace(seats: SeatMap, tables: SeatTable[], guests: Map<number, CrmGuest>, guestId: number, tableKey: string, seatIndex: number): PlaceResult {
  const t = tables.find((x) => x.key === tableKey);
  const g = guests.get(guestId);
  if (!t || !g) return { ok: false };
  const cell = seatCells(t, seats, guests)[seatIndex];
  if (!cell || cell.guest.id === guestId) return place(seats, tables, guests, guestId, tableKey, seatIndex);
  const other = cell.guest;
  const mine = seats[guestId];
  const theirs = seats[other.id];

  // Equal party sizes: swap places (also across tables).
  if (party(g) === party(other)) {
    if (mine) seats[other.id] = { ...mine };
    else delete seats[other.id];
    seats[guestId] = { ...theirs };
    return { ok: true };
  }

  // Otherwise: lift the other guest, place, then put them back nearby or in the rail.
  delete seats[other.id];
  const res = place(seats, tables, guests, guestId, tableKey, seatIndex);
  if (!res.ok) {
    seats[other.id] = theirs;
    return res;
  }
  const back = findBlock(t, seats, guests, party(other), theirs.seat);
  if (back >= 0) seats[other.id] = { table: tableKey, seat: back };
  return { ok: true, message: back >= 0 ? undefined : `${other.full_name} הועבר/ה לרשימת הממתינים` };
}

/** After shrinking a table: re-seat guests whose block no longer fits; unseat what can't fit. */
export function evictOverflow(seats: SeatMap, t: SeatTable, guests: Map<number, CrmGuest>): number[] {
  const evicted: number[] = [];
  const list = guestsAt(t.key, seats, guests);
  // first, everyone whose block is out of range is lifted
  const lifted: CrmGuest[] = [];
  list.forEach((g) => {
    const s = seats[g.id];
    if (s.seat == null || s.seat + party(g) > t.seats) {
      delete seats[g.id];
      lifted.push(g);
    }
  });
  lifted.forEach((g) => {
    const used = occupancy(t.key, seats, guests);
    const start = used + party(g) <= t.seats ? findBlock(t, seats, guests, party(g), 0) : -1;
    if (start >= 0) seats[g.id] = { table: t.key, seat: start };
    else evicted.push(g.id);
  });
  return evicted;
}

/* ───────── layout helpers ───────── */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function contentBounds(tables: Box[], fixtures: Box[]): Box {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  tables.concat(fixtures).forEach((b) => {
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.w);
    maxY = Math.max(maxY, b.y + b.h);
  });
  if (!isFinite(minX)) return { x: 400, y: 300, w: 1200, h: 800 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export interface Guide {
  type: "v" | "h";
  pos: number;
}

export function computeGuides(t: Box & { key?: string }, others: (Box & { key?: string })[], threshold = 3): Guide[] {
  const out: Guide[] = [];
  const c = { l: t.x, r: t.x + t.w, t: t.y, b: t.y + t.h, cx: t.x + t.w / 2, cy: t.y + t.h / 2 };
  others.forEach((o) => {
    if (o.key && o.key === t.key) return;
    const oc = { l: o.x, r: o.x + o.w, t: o.y, b: o.y + o.h, cx: o.x + o.w / 2, cy: o.y + o.h / 2 };
    ([[c.cx, oc.cx], [c.l, oc.l], [c.r, oc.r], [c.l, oc.r], [c.r, oc.l]] as [number, number][]).forEach(([a, b]) => {
      if (Math.abs(a - b) <= threshold) out.push({ type: "v", pos: b });
    });
    ([[c.cy, oc.cy], [c.t, oc.t], [c.b, oc.b], [c.t, oc.b], [c.b, oc.t]] as [number, number][]).forEach(([a, b]) => {
      if (Math.abs(a - b) <= threshold) out.push({ type: "h", pos: b });
    });
  });
  return out;
}

export function toLocal(wx: number, wy: number, cx: number, cy: number, rot: number): { x: number; y: number } {
  const dx = wx - cx;
  const dy = wy - cy;
  const a = (-rot * Math.PI) / 180;
  return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) };
}

/** A starter floor plan for an empty event: N round tables in a grid below a dance floor. */
export function starterLayout(peopleToSeat: number): { tables: SeatTable[]; fixtures: Fixture[] } {
  const count = clamp(4, 40, Math.ceil(Math.max(1, peopleToSeat) / 10) + 1);
  const cols = count <= 6 ? 3 : count <= 12 ? 4 : count <= 20 ? 5 : 6;
  const tables: SeatTable[] = [];
  const startX = 480;
  const startY = 560;
  const gap = 264;
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const t = newTable("round", i + 1, startX + c * gap + 90, startY + r * gap + 90);
    tables.push(t);
  }
  const width = (cols - 1) * gap + 180;
  const fixtures: Fixture[] = [
    { ...newFixture("dance", startX + width / 2, 360), w: 420, h: 180, x: snap(startX + width / 2 - 210), y: 264 },
    { ...newFixture("stage", startX + width / 2, 216), x: snap(startX + width / 2 - 120), y: 192 },
    { ...newFixture("door", startX + width / 2, startY + Math.ceil(count / cols) * gap + 72) },
  ];
  return { tables, fixtures };
}
