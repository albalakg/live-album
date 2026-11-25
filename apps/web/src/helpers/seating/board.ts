/**
 * Seating builder state + actions, shared by the canvas, rail and inspector
 * (provided by EventSeatingView, injected as "seatingBoard").
 */
import {
  applySize,
  clamp,
  evictOverflow,
  GRID,
  isSeatable,
  MAX_SEATS,
  MIN_SEATS,
  newFixture,
  newTable,
  occupancy,
  party,
  place,
  PlaceResult,
  SeatMap,
  seatCells,
  SeatCell,
  snap,
  starterLayout,
  swapOrPlace,
  uid,
} from "./engine";
import { CrmGuest, Fixture, FixtureKind, GuestGroup, PlanState, SeatTable, SeatingConstraint, SeatingWarning, TableShape } from "./types";

interface Snapshot {
  tables: SeatTable[];
  fixtures: Fixture[];
  seats: SeatMap;
}

const HISTORY_LIMIT = 70;

export class SeatingBoard {
  tables: SeatTable[] = [];
  fixtures: Fixture[] = [];
  seats: SeatMap = {};
  guests: CrmGuest[] = [];
  groups: GuestGroup[] = [];
  guestMap: Map<number, CrmGuest> = new Map();
  groupMap: Map<number, GuestGroup> = new Map();
  constraints: SeatingConstraint[] = [];
  warnings: SeatingWarning[] = [];
  revision = 0;

  selected: string[] = [];
  selectedSeat: number | null = null;
  cam = { x: 0, y: 0, scale: 1 };

  hist: string[] = [];
  future: string[] = [];
  /** Bumped on every persisted change; the view autosaves when it moves. */
  version = 0;
  toastFn: (text: string, type?: "success" | "error") => void = () => undefined;

  /* ───────── loading ───────── */

  load(state: PlanState, guests: CrmGuest[], groups: GuestGroup[]): void {
    this.setPeople(guests, groups);
    this.applyPlan(state);
    this.hist = [];
    this.future = [];
  }

  setPeople(guests: CrmGuest[], groups: GuestGroup[]): void {
    this.guests = guests;
    this.groups = groups;
    this.guestMap = new Map(guests.map((g) => [g.id, g] as [number, CrmGuest]));
    this.groupMap = new Map(groups.map((g) => [g.id, g] as [number, GuestGroup]));
  }

  applyPlan(state: PlanState): void {
    this.revision = state.revision;
    this.tables = state.tables.map((t) => ({ ...t, key: t.key || `t${t.id}` }));
    this.fixtures = state.fixtures.map((f) => ({ ...f, rot: f.rot || 0 }));
    const keyById: Record<number, string> = {};
    this.tables.forEach((t) => {
      if (t.id) keyById[t.id] = t.key;
    });
    const seats: SeatMap = {};
    state.assignments.forEach((a) => {
      const key = keyById[a.table_id];
      if (key) seats[a.guest_id] = { table: key, seat: a.seat };
    });
    this.seats = seats;
    this.constraints = state.constraints;
    this.warnings = state.warnings;
    this.selected = this.selected.filter((id) => this.tables.some((t) => t.key === id) || this.fixtures.some((f) => f.id === id));
  }

  /* ───────── derived ───────── */


  table(key: string | null | undefined): SeatTable | undefined {
    return key ? this.tables.find((t) => t.key === key) : undefined;
  }

  fixture(id: string | null | undefined): Fixture | undefined {
    return id ? this.fixtures.find((f) => f.id === id) : undefined;
  }

  get selectedTable(): SeatTable | undefined {
    return this.selected.length === 1 ? this.table(this.selected[0]) : undefined;
  }

  get selectedFixture(): Fixture | undefined {
    return this.selected.length === 1 ? this.fixture(this.selected[0]) : undefined;
  }

  used(key: string): number {
    return occupancy(key, this.seats, this.guestMap);
  }

  cells(t: SeatTable): (SeatCell | null)[] {
    return seatCells(t, this.seats, this.guestMap);
  }

  get unseated(): CrmGuest[] {
    return this.guests.filter((g) => isSeatable(g) && !this.seats[g.id]);
  }

  get seatedPeople(): number {
    return this.guests.reduce((s, g) => (this.seats[g.id] ? s + party(g) : s), 0);
  }

  get totalSeats(): number {
    return this.tables.reduce((s, t) => s + t.seats, 0);
  }

  /* ───────── history ───────── */

  snapshot(): string {
    const snap: Snapshot = { tables: this.tables, fixtures: this.fixtures, seats: this.seats };
    return JSON.stringify(snap);
  }

  restore(raw: string): void {
    const s = JSON.parse(raw) as Snapshot;
    this.tables = s.tables;
    this.fixtures = s.fixtures;
    this.seats = s.seats;
    this.selected = this.selected.filter((id) => this.table(id) || this.fixture(id));
    this.selectedSeat = null;
  }

  pushHist(): void {
    this.hist.push(this.snapshot());
    if (this.hist.length > HISTORY_LIMIT) this.hist.shift();
    this.future = [];
  }

  /** Drop the last history entry when an interaction turned out to change nothing. */
  dropHistIfUnchanged(): void {
    const last = this.hist[this.hist.length - 1];
    if (last && last === this.snapshot()) this.hist.pop();
  }

  undo(): void {
    const prev = this.hist.pop();
    if (!prev) return;
    this.future.push(this.snapshot());
    this.restore(prev);
    this.commit();
  }

  redo(): void {
    const next = this.future.pop();
    if (!next) return;
    this.hist.push(this.snapshot());
    this.restore(next);
    this.commit();
  }

  commit(): void {
    this.version += 1;
  }

  /* ───────── selection ───────── */

  select(ids: string[], add = false): void {
    if (!add) {
      this.selected = ids.slice();
    } else {
      const set = new Set(this.selected);
      ids.forEach((id) => (set.has(id) ? set.delete(id) : set.add(id)));
      this.selected = Array.from(set);
    }
    if (this.selected.length !== 1) this.selectedSeat = null;
  }

  selectAll(): void {
    this.selected = this.tables.map((t) => t.key).concat(this.fixtures.map((f) => f.id));
  }

  /* ───────── tables / fixtures ───────── */

  addTable(shape: TableShape, cx: number, cy: number): SeatTable {
    this.pushHist();
    const n = this.nextTableNumber();
    const t = newTable(shape, n, cx, cy);
    this.tables.push(t);
    this.select([t.key]);
    this.commit();
    return t;
  }

  nextTableNumber(): number {
    let max = 0;
    this.tables.forEach((t) => {
      const m = t.label.match(/(\d+)\s*$/);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return Math.max(max, this.tables.length) + 1;
  }

  addFixture(kind: FixtureKind, cx: number, cy: number): Fixture {
    this.pushHist();
    const f = newFixture(kind, cx, cy);
    this.fixtures.push(f);
    this.select([f.id]);
    this.commit();
    return f;
  }

  starter(people: number): void {
    this.pushHist();
    const s = starterLayout(people);
    this.tables = s.tables;
    this.fixtures = s.fixtures;
    this.seats = {};
    this.selected = [];
    this.commit();
  }

  duplicateSelected(): void {
    const tables = this.selected.map((id) => this.table(id)).filter(Boolean) as SeatTable[];
    const fixtures = this.selected.map((id) => this.fixture(id)).filter(Boolean) as Fixture[];
    if (!tables.length && !fixtures.length) return;
    this.pushHist();
    const copies: string[] = [];
    let n = this.nextTableNumber();
    tables.forEach((t) => {
      const c: SeatTable = { ...t, id: null, key: uid("n"), label: `שולחן ${n++}`, x: snap(t.x + GRID * 2), y: snap(t.y + GRID * 2) };
      this.tables.push(c);
      copies.push(c.key);
    });
    fixtures.forEach((f) => {
      const c: Fixture = { ...f, id: uid("f"), x: snap(f.x + GRID * 2), y: snap(f.y + GRID * 2) };
      this.fixtures.push(c);
      copies.push(c.id);
    });
    this.select(copies);
    this.commit();
    this.toastFn(copies.length > 1 ? `שוכפלו ${copies.length} פריטים` : "שוכפל");
  }

  deleteSelected(): void {
    if (!this.selected.length) return;
    const ids = new Set(this.selected);
    const tables = this.tables.filter((t) => ids.has(t.key));
    const seated = tables.reduce((s, t) => s + this.used(t.key), 0);
    this.pushHist();
    tables.forEach((t) => {
      Object.keys(this.seats).forEach((gid) => {
        if (this.seats[Number(gid)].table === t.key) delete this.seats[Number(gid)];
      });
    });
    this.tables = this.tables.filter((t) => !ids.has(t.key));
    this.fixtures = this.fixtures.filter((f) => !ids.has(f.id));
    this.select([]);
    this.commit();
    if (seated) this.toastFn(`${seated} מקומות חזרו לרשימת הממתינים. אפשר לבטל עם Ctrl+Z`);
  }

  rotateSelected(delta: number): void {
    const items = (this.selected.map((id) => this.table(id) || this.fixture(id)).filter(Boolean) as (SeatTable | Fixture)[]);
    if (!items.length) return;
    this.pushHist();
    items.forEach((t) => {
      t.rot = (((snap((t.rot || 0) + delta, 15)) % 360) + 360) % 360;
    });
    this.commit();
  }

  nudge(dx: number, dy: number): void {
    const items = (this.selected.map((id) => this.table(id) || this.fixture(id)).filter(Boolean) as (SeatTable | Fixture)[]);
    if (!items.length) return;
    this.pushHist();
    items.forEach((t) => {
      t.x += dx;
      t.y += dy;
    });
    this.commit();
  }

  changeSeats(t: SeatTable, n: number): void {
    n = clamp(MIN_SEATS, MAX_SEATS, n);
    if (n === t.seats) return;
    this.pushHist();
    t.seats = n;
    applySize(t);
    this.afterResize(t);
    this.commit();
  }

  setShape(t: SeatTable, shape: TableShape): void {
    if (t.shape === shape) return;
    this.pushHist();
    t.shape = shape;
    applySize(t);
    this.afterResize(t);
    this.commit();
  }

  afterResize(t: SeatTable): void {
    const evicted = evictOverflow(this.seats, t, this.guestMap);
    if (evicted.length) {
      const names = evicted.map((id) => this.guestMap.get(id)?.full_name).filter(Boolean);
      this.toastFn(`${names.slice(0, 2).join(", ")}${names.length > 2 ? ` ועוד ${names.length - 2}` : ""} חזרו לרשימת הממתינים`);
    }
  }

  /* ───────── guests ───────── */

  placeGuest(guestId: number, key: string | null, prefer: number | null = null): PlaceResult {
    this.pushHist();
    const res = place(this.seats, this.tables, this.guestMap, guestId, key, prefer);
    this.finish(res);
    return res;
  }

  dropOnSeat(guestId: number, key: string, seat: number): PlaceResult {
    this.pushHist();
    const res = swapOrPlace(this.seats, this.tables, this.guestMap, guestId, key, seat);
    this.finish(res);
    return res;
  }

  unseat(guestId: number): void {
    if (!this.seats[guestId]) return;
    this.pushHist();
    delete this.seats[guestId];
    this.commit();
  }

  private finish(res: PlaceResult): void {
    if (res.ok) {
      this.commit();
      if (res.message) this.toastFn(res.message);
    } else {
      this.hist.pop();
      if (res.message) this.toastFn(res.message, "error");
    }
  }

  /** Seating payload for the autosave API. */
  payload(): { revision: number; tables: SeatTable[]; fixtures: Fixture[]; assignments: { guest_id: number; table_key: string; seat: number | null }[] } {
    return {
      revision: this.revision,
      tables: this.tables.map((t) => ({ ...t, x: Math.round(t.x), y: Math.round(t.y), w: Math.round(t.w), h: Math.round(t.h) })),
      fixtures: this.fixtures.map((f) => ({ ...f, x: Math.round(f.x), y: Math.round(f.y), w: Math.round(f.w), h: Math.round(f.h) })),
      assignments: Object.keys(this.seats)
        .map(Number)
        .filter((gid) => this.guestMap.has(gid))
        .map((gid) => ({ guest_id: gid, table_key: this.seats[gid].table, seat: this.seats[gid].seat })),
    };
  }
}
