/**
 * Smart search engine: runs fully in the browser over the event data already loaded for the host.
 * No network, no AI. Same input → same output.
 */
import { isPhoneQuery, matchPhone, matchText, TextMatch } from "./matcher";
import {
  buildSchema,
  Entity,
  ENTITY_LABEL,
  Filter,
  FilterValue,
  filterSyntax,
  findKey,
  isKeyValue,
  KeyDef,
  NumCmp,
  ParsedQuery,
  parseQuery,
  resolveValue,
  Schema,
  serializeQuery,
  TimeRange,
} from "./query";
import {
  SearchCommand,
  SearchData,
  SearchGuest,
  SearchHelp,
  SearchMessage,
  SearchPage,
  SearchPhoto,
  SearchReply,
  SearchTable,
} from "./types";
import { editDistance, hasHebrew, hebrewToLatin, isLatinTyping, latinToHebrew, norm } from "./text";

export type SearchItem =
  | { type: "guest"; g: SearchGuest; m: TextMatch | null }
  | { type: "table"; t: SearchTable }
  | { type: "photo"; ph: SearchPhoto }
  | { type: "message"; msg: SearchMessage }
  | { type: "reply"; r: SearchReply }
  | { type: "command"; c: SearchCommand }
  | { type: "page"; p: SearchPage }
  | { type: "help"; h: SearchHelp };

export type GroupType = "guests" | "tables" | "photos" | "messages" | "replies" | "commands" | "pages" | "help";

export interface ResultGroup {
  type: GroupType;
  title: string;
  total: number;
  items: SearchItem[];
}

export interface MapHighlight {
  [tableKey: string]: { n: number; free: number };
}

export interface SearchResult {
  P: ParsedQuery;
  scope: string | null;
  groups: ResultGroup[];
  ent: Entity | null;
  facets: { token: string; n: number }[];
  relax: { drop: string; n: number; q: string }[];
  dym: string[];
  unknown: string[];
  guestAll: { g: SearchGuest; m: TextMatch | null }[];
  mapHl: MapHighlight | null;
  photoCtx: SearchPhoto[] | null;
  empty: boolean;
  kb: { from: string; to: string; dir: "he" | "en" } | null;
}

export interface Completion {
  suffix: string;
  kind: "key" | "value" | "phrase" | "name";
}

export interface SuggestionRow {
  title: string;
  items: { label: string; ins: string; n: number | null }[];
}

export const COMMON_PHRASES = [
  "מי עוד לא אישר מצד הכלה",
  "אורחים בלי שולחן",
  "אורחים צמחוניים",
  "תמונות ממתינות לאישור",
  "שולחנות מלאים",
  "שולחנות עם מקומות פנויים",
  "הודעות מתוזמנות",
  "תמונות היום אחרי 22:00",
];

const cmp = (v: number, o: NumCmp) => (o.op === "<=" ? v <= o.n : o.op === "<" ? v < o.n : o.op === ">" ? v > o.n : v >= o.n);

export function tableNumber(label: string): string | null {
  const m = String(label || "").match(/\d+/);
  return m ? m[0] : null;
}

export class SearchEngine {
  readonly data: SearchData;
  readonly schema: Schema;
  private takenByKey: Record<string, number> = {};

  constructor(data: SearchData) {
    this.data = data;
    this.schema = buildSchema(data.groups, data.meals);
    this.refresh();
  }

  /** Recompute derived numbers after an optimistic local change. */
  refresh(): void {
    const taken: Record<string, number> = {};
    const byId: Record<number, string> = {};
    this.data.tables.forEach((t) => {
      taken[t.key] = 0;
      byId[t.id] = t.key;
    });
    this.data.guests.forEach((g) => {
      if (g.tableId != null && byId[g.tableId] !== undefined) taken[byId[g.tableId]] += g.party;
    });
    this.takenByKey = taken;
  }

  taken(t: SearchTable): number {
    return this.takenByKey[t.key] || 0;
  }

  free(t: SearchTable): number {
    return t.seats - this.taken(t);
  }

  tableOf(g: SearchGuest): SearchTable | undefined {
    return g.tableId == null ? undefined : this.data.tables.find((t) => t.id === g.tableId);
  }

  /* ───────── filters ───────── */

  private tableMatches(g: SearchGuest, x: FilterValue): boolean {
    if (x === "none") return !g.table;
    if (x === "any") return !!g.table;
    if (!g.table) return false;
    const want = norm(String(x).replace(/-/g, " "));
    const num = tableNumber(g.table);
    if (/^\d+$/.test(want)) return num === want;
    return norm(g.table) === want || norm(g.table).includes(want);
  }

  testFilter(f: Filter, item: SearchGuest | SearchPhoto | SearchTable | SearchMessage, ent: Entity): boolean {
    let r = false;
    if (ent === "guests") {
      const g = item as SearchGuest;
      if (f.k === "status") r = f.v.includes(g.status);
      else if (f.k === "side") r = f.v.includes(g.side || "");
      else if (f.k === "group") r = f.v.some((x) => norm(String(x)) === norm(g.group));
      else if (f.k === "table") r = f.v.some((x) => this.tableMatches(g, x));
      else if (f.k === "meal") r = f.v.some((x) => { const nx = norm(String(x)); return (!!g.meal && norm(g.meal).includes(nx)) || (!!g.notes && norm(g.notes).includes(nx)); });
      else if (f.k === "party") r = f.v.some((o) => cmp(g.party, o as NumCmp));
      else if (f.k === "phone") r = f.v.some((x) => (x === "missing" ? !g.phone : !!g.phone));
      else if (f.k === "wa") r = f.v.some((x) => g.wa.includes(String(x)));
      else if (f.k === "added") r = f.v.some((x) => g.addedDays !== null && (x === "today" ? g.addedDays === 0 : g.addedDays <= 7));
    } else if (ent === "photos") {
      const p = item as SearchPhoto;
      if (f.k === "pstatus") r = f.v.some((x) => (x === "fav" ? p.fav : p.status === x));
      else if (f.k === "kind") r = f.v.includes(p.kind);
      else if (f.k === "time") r = f.v.some((x) => { const tr = x as TimeRange; return p.min >= tr[0] && p.min <= tr[1]; });
      else if (f.k === "day") r = f.v.some((x) => (x === "today" ? p.day === 0 : p.day === -1));
      else if (f.k === "uploader") r = f.v.includes(p.uploaderN);
    } else if (ent === "tables") {
      const t = item as SearchTable;
      const fr = this.free(t);
      r = f.v.some((x) => (x === "free" ? fr > 0 : x === "full" ? fr <= 0 : this.taken(t) === 0));
    } else if (ent === "messages") {
      r = f.v.includes((item as SearchMessage).status);
    }
    return f.neg ? !r : r;
  }

  parse(raw: string): ParsedQuery {
    return parseQuery(this.schema, raw);
  }

  serialize(P: ParsedQuery): string {
    return serializeQuery(this.schema, P);
  }

  syntaxOf(f: Filter): string {
    return filterSyntax(this.schema, f);
  }

  /* ───────── guests ───────── */

  guestsFor(P: { alts: { filters: Filter[]; text: string }[] }): { g: SearchGuest; m: TextMatch | null }[] {
    const res: Record<number, { g: SearchGuest; m: TextMatch | null; s: number }> = {};
    for (const a of P.alts) {
      const fs = a.filters.filter((f) => this.schema.byCode[f.k].ent === "guests");
      for (const g of this.data.guests) {
        if (!fs.every((f) => this.testFilter(f, g, "guests"))) continue;
        let m: TextMatch | null = null;
        let s = 10;
        if (a.text) {
          m = isPhoneQuery(a.text) ? matchPhone(g.phone, a.text) : matchText(g.name, a.text);
          if (!m && norm(a.text).length > 2 && norm(g.group).includes(norm(a.text))) m = { score: 30, how: ["group"] };
          if (!m && norm(a.text).length > 2 && g.email && norm(g.email).includes(norm(a.text))) m = { score: 30, how: [] };
          if (!m && norm(a.text).length > 2 && g.notes && norm(g.notes).includes(norm(a.text))) m = { score: 25, how: [] };
          if (!m) continue;
          s = m.score;
        }
        const prev = res[g.id];
        if (!prev || prev.s < s) res[g.id] = { g, m, s };
      }
    }
    return Object.keys(res)
      .map((k) => res[Number(k)])
      .sort((x, y) => y.s - x.s || x.g.name.localeCompare(y.g.name, "he"))
      .map(({ g, m }) => ({ g, m }));
  }

  /* ───────── execute ───────── */

  execute(raw: string): SearchResult {
    let q = raw;
    let scope: string | null = null;
    const sm = q.match(/^\s*([>@#])\s*/);
    if (sm) {
      scope = sm[1];
      q = q.slice(sm[0].length);
    }
    const P = this.parse(q);
    const D = this.data;
    const out: SearchResult = {
      P,
      scope,
      groups: [],
      ent: P.ent,
      facets: [],
      relax: [],
      dym: [],
      unknown: P.alts.reduce((acc: string[], a) => acc.concat(a.unknown), []),
      guestAll: [],
      mapHl: null,
      photoCtx: null,
      empty: false,
      kb: null,
    };
    const text = P.text;
    if (!q.trim() && !scope) return out;
    const wantG = !scope || scope === "@";
    const wantT = !scope || scope === "#";
    const wantC = !scope || scope === ">";
    const entFilters = (ent: Entity) => P.alts.reduce((acc: Filter[], a) => acc.concat(a.filters.filter((f) => this.schema.byCode[f.k].ent === ent)), []);
    const hlTables = (tb: SearchTable[]) => {
      const hl: MapHighlight = {};
      tb.forEach((x) => (hl[x.key] = { n: this.taken(x), free: this.free(x) }));
      return hl;
    };

    if (!q.trim() && scope) {
      if (scope === ">") {
        out.groups = [
          { type: "commands", title: "פעולות", total: D.commands.length, items: D.commands.map((c) => ({ type: "command", c } as SearchItem)) },
          { type: "pages", title: "מעבר מהיר", total: D.pages.length, items: D.pages.map((p) => ({ type: "page", p } as SearchItem)) },
        ];
      }
      if (scope === "#") out.groups = [{ type: "tables", title: "שולחנות", total: D.tables.length, items: D.tables.map((t) => ({ type: "table", t } as SearchItem)) }];
      if (scope === "@") {
        out.guestAll = D.guests.map((g) => ({ g, m: null }));
        out.groups = [{ type: "guests", title: "אורחים", total: D.guests.length, items: D.guests.map((g) => ({ type: "guest", g, m: null } as SearchItem)) }];
      }
    } else if (P.ent === "photos") {
      const fs = entFilters("photos");
      let r = D.photos.filter((p) => fs.every((f) => this.testFilter(f, p, "photos")));
      if (text && /^#?\d+$/.test(text)) r = r.filter((p) => p.uploaderN === Number(text.replace("#", "")));
      out.groups.push({ type: "photos", title: ENTITY_LABEL.photos, total: r.length, items: r.map((ph) => ({ type: "photo", ph } as SearchItem)) });
      out.photoCtx = D.photos.filter((p) => fs.filter((f) => f.k !== "time").every((f) => this.testFilter(f, p, "photos")));
    } else if (P.ent === "tables") {
      const fs = entFilters("tables");
      const r = D.tables.filter((t) => fs.every((f) => this.testFilter(f, t, "tables")));
      out.groups.push({ type: "tables", title: ENTITY_LABEL.tables, total: r.length, items: r.map((t) => ({ type: "table", t } as SearchItem)) });
      out.mapHl = D.tables.length ? hlTables(r) : null;
    } else if (P.ent === "messages") {
      const fs = entFilters("messages");
      let r = D.messages.filter((m) => fs.every((f) => this.testFilter(f, m, "messages")));
      if (text) r = r.filter((m) => matchText(m.title, text));
      out.groups.push({ type: "messages", title: ENTITY_LABEL.messages, total: r.length, items: r.map((msg) => ({ type: "message", msg } as SearchItem)) });
    } else if (P.ent === "guests" && wantG) {
      const items = this.guestsFor(P);
      out.guestAll = items;
      out.groups.push({ type: "guests", title: ENTITY_LABEL.guests, total: items.length, items: items.map((x) => ({ type: "guest", g: x.g, m: x.m } as SearchItem)) });
      out.mapHl = this.guestMap(items.map((x) => x.g));
      out.facets = this.facetsFor(items.map((x) => x.g), P);
    } else {
      const t = text || q.trim();
      if (wantG) {
        const items = this.guestsFor({ alts: [{ filters: [], text: t }] });
        out.guestAll = items;
        if (items.length) out.groups.push({ type: "guests", title: "אורחים", total: items.length, items: items.map((x) => ({ type: "guest", g: x.g, m: x.m } as SearchItem)) });
      }
      if (wantT && D.tables.length) {
        const tn = norm(t).match(/^#?\s*(?:שולחנ?\s*)?(\d+)$/);
        const tb = D.tables.filter((x) => (tn ? tableNumber(x.label) === tn[1] : !isPhoneQuery(t) && !!matchText(x.label + " " + x.note, t)));
        if (tb.length) {
          out.groups.push({ type: "tables", title: "שולחנות", total: tb.length, items: tb.map((x) => ({ type: "table", t: x } as SearchItem)) });
          out.mapHl = hlTables(tb);
          if (tn && tb.length === 1) {
            const sg = D.guests.filter((g) => g.tableId === tb[0].id);
            if (sg.length) {
              out.groups.push({ type: "guests", title: "יושבים ב" + tb[0].label, total: sg.length, items: sg.map((g) => ({ type: "guest", g, m: null } as SearchItem)) });
              out.guestAll = sg.map((g) => ({ g, m: null }));
            }
          }
        }
      }
      if (!scope) {
        const ms = D.messages.filter((m) => matchText(m.title, t));
        if (ms.length) out.groups.push({ type: "messages", title: "הודעות ואוטומציות", total: ms.length, items: ms.map((msg) => ({ type: "message", msg } as SearchItem)) });
        const rp = norm(t).length > 2 ? D.replies.filter((r) => matchText(r.text, t) || matchText(r.who, t)) : [];
        if (rp.length) out.groups.push({ type: "replies", title: "תגובות אורחים", total: rp.length, items: rp.map((r) => ({ type: "reply", r } as SearchItem)) });
      }
      if (wantC) {
        const cm = D.commands.filter((c) => matchText(c.label + " " + c.kw, t));
        if (cm.length) out.groups.push({ type: "commands", title: "פעולות", total: cm.length, items: cm.slice(0, scope ? 12 : 3).map((c) => ({ type: "command", c } as SearchItem)) });
        const pg = D.pages.filter((p) => matchText(p.label, t));
        if (pg.length) out.groups.push({ type: "pages", title: "מעבר מהיר", total: pg.length, items: pg.slice(0, scope ? 12 : 3).map((p) => ({ type: "page", p } as SearchItem)) });
        const hp = !scope ? D.help.filter((h) => matchText(h.label, t)) : [];
        if (hp.length) out.groups.push({ type: "help", title: "עזרה", total: hp.length, items: hp.map((h) => ({ type: "help", h } as SearchItem)) });
      }
      if (!out.mapHl && out.guestAll.length) out.mapHl = this.guestMap(out.guestAll.map((x) => x.g));
    }
    out.empty = out.groups.every((g) => !g.items.length);
    return out;
  }

  private guestMap(gs: SearchGuest[]): MapHighlight | null {
    if (!this.data.tables.length) return null;
    const hl: MapHighlight = {};
    gs.forEach((g) => {
      const t = this.tableOf(g);
      if (!t) return;
      if (!hl[t.key]) hl[t.key] = { n: 0, free: this.free(t) };
      hl[t.key].n++;
    });
    return Object.keys(hl).length ? hl : null;
  }

  /** execute + keyboard-layout repair + rescue suggestions. */
  search(raw: string, opts: { noFix?: boolean } = {}): SearchResult {
    const out = this.execute(raw);
    const text = raw.trim();
    if (!text) return out;
    if (out.empty && !opts.noFix && !/^[>@#]/.test(text) && !/:/.test(text)) {
      if (isLatinTyping(text) && !isPhoneQuery(text)) {
        const fixed = latinToHebrew(text);
        const o2 = this.execute(fixed);
        if (!o2.empty) {
          o2.kb = { from: text, to: fixed, dir: "he" };
          return o2;
        }
      } else if (hasHebrew(text)) {
        const lat = hebrewToLatin(text);
        const o2 = this.execute(lat);
        if (!o2.empty) {
          o2.kb = { from: text, to: lat, dir: "en" };
          return o2;
        }
      }
    }
    if (out.empty) this.buildRescue(out, raw);
    return out;
  }

  facetsFor(R: SearchGuest[], P: ParsedQuery): { token: string; n: number }[] {
    if (R.length < 3 || P.alts.length > 1) return [];
    const have = new Set(P.alts.reduce((acc: string[], a) => acc.concat(a.filters.map((f) => f.k + ":" + JSON.stringify(f.v))), []));
    const cands: { f: Filter; n: number }[] = [];
    const push = (k: string, v: FilterValue) => {
      if (have.has(k + ":" + JSON.stringify([v]))) return;
      const f: Filter = { k, v: [v], neg: false, src: "syntax" };
      const n = R.filter((g) => this.testFilter(f, g, "guests")).length;
      if (n > 0 && n < R.length) cands.push({ f, n });
    };
    ["bride", "groom", "shared"].forEach((v) => push("side", v));
    ["invited", "confirmed", "declined", "maybe"].forEach((v) => push("status", v));
    if (this.data.tables.length) {
      push("table", "none");
      push("table", "any");
    }
    this.schema.groups.forEach((v) => push("group", v));
    ["צמחוני", "טבעוני", "ללא גלוטן"].forEach((v) => push("meal", v));
    push("party", { op: ">=", n: 3 });
    push("phone", "missing");
    return cands
      .sort((a, b) => b.n - a.n)
      .slice(0, 5)
      .map((c) => ({ token: this.syntaxOf(c.f), n: c.n }));
  }

  buildRescue(out: SearchResult, raw: string): void {
    const P = out.P;
    if (P.alts.length === 1 && P.alts[0].filters.length) {
      const a = P.alts[0];
      a.filters.forEach((f, i) => {
        const P2 = { alts: [{ ...a, filters: a.filters.filter((_x, j) => j !== i) }] };
        const only = P2.alts[0].filters.every((x) => this.schema.byCode[x.k].ent === "guests");
        const n = only && (P2.alts[0].filters.length || P2.alts[0].text) ? this.guestsFor(P2).length : 0;
        if (n > 0) out.relax.push({ drop: this.syntaxOf(f), n, q: serializeQuery(this.schema, P2) });
      });
      out.relax.sort((x, y) => y.n - x.n);
      out.relax = out.relax.slice(0, 3);
    }
    const t = norm(P.text || raw);
    if (t && !/:/.test(t)) {
      const cands: { name: string; d: number }[] = [];
      this.data.guests.forEach((g) => {
        const wts = norm(g.name).split(" ");
        const d = Math.min(...t.split(" ").map((qt) => Math.min(...wts.map((w) => editDistance(qt, w.slice(0, Math.max(qt.length, 2)))))));
        if (d <= Math.max(1, Math.min(3, Math.floor(t.length / 2)))) cands.push({ name: g.name, d });
      });
      out.dym = cands
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .map((c) => c.name);
    }
  }

  countOf(q: string): number {
    return this.execute(q).groups.reduce((a, g) => a + g.total, 0);
  }

  counters(): { n: number; label: string; q: string; tone: string }[] {
    const D = this.data;
    const out = [
      { n: D.guests.filter((g) => g.status === "invited").length, label: "טרם ענו", q: "סטטוס:לא-ענה", tone: "warn" },
    ];
    if (D.tables.length) out.push({ n: D.guests.filter((g) => !g.table && g.status !== "declined" && g.status !== "cancelled").length, label: "ללא שולחן", q: "שולחן:ללא -סטטוס:סירב,ביטל", tone: "rose" });
    out.push({ n: D.photos.filter((p) => p.status === "pending").length, label: "תמונות ממתינות", q: "תמונה:ממתינה", tone: "gold" });
    if (D.messages.length) out.push({ n: D.messages.filter((m) => m.status === "scheduled").length, label: "הודעות מתוזמנות", q: "הודעה:מתוזמנת", tone: "ok" });
    if (D.tables.length) out.push({ n: D.tables.filter((t) => this.free(t) > 0).length, label: "שולחנות עם מקום", q: "מקומות:פנויים", tone: "ok" });
    else out.push({ n: D.guests.filter((g) => g.status === "confirmed").reduce((a, g) => a + g.party, 0), label: "מגיעים (אישרו)", q: "סטטוס:אישר", tone: "ok" });
    return out;
  }

  /* ───────── ghost completion + suggestion row ───────── */

  valueCandidates(def: KeyDef): string[] {
    if (def.vals) return def.vals.map((v) => v.label);
    if (def.type === "table") {
      return ["ללא"].concat(this.data.tables.map((t) => tableNumber(t.label) || t.label.replace(/\s+/g, "-")));
    }
    if (def.type === "num") return ["3+", "4+", "2+"];
    if (def.type === "time") return ["22:00-23:00", "21:00-22:00", "22:30-"];
    if (def.type === "uploader") {
      const ns = Array.from(new Set(this.data.photos.map((p) => p.uploaderN))).sort((a, b) => a - b);
      return (ns.length ? ns : [1, 2, 3]).slice(0, 6).map((n) => "#" + n);
    }
    return [];
  }

  completion(q: string, phrases: string[]): Completion | null {
    if (!q || /\s$/.test(q) || /^[>@#]/.test(q)) return null;
    const m = q.match(/(\S*)$/);
    const tok = m ? m[1] : "";
    const neg = /^[-!]/.test(tok);
    const body = neg ? tok.slice(1) : tok;
    if (body.includes(":")) {
      const i = body.indexOf(":");
      const def = findKey(this.schema, body.slice(0, i));
      if (!def) return null;
      const part = body.slice(i + 1).split(/[,|]/).pop() || "";
      const cands = this.valueCandidates(def).filter((c) => norm(c).replace(/-/g, "").startsWith(norm(part).replace(/-/g, "")) && c.length > part.length);
      if (!cands.length) return null;
      return { suffix: cands[0].slice(part.length), kind: "value" };
    }
    const nq = norm(q);
    if (!q.includes(" ") && body.length >= 1) {
      const k = this.schema.keys.find((d) => norm(d.name).startsWith(norm(body)) && norm(d.name) !== norm(body));
      if (k) return { suffix: k.name.slice(body.length) + ":", kind: "key" };
    }
    if (nq.length >= 2) {
      const ph = phrases.find((p) => norm(p).startsWith(nq) && norm(p) !== nq && p.startsWith(q) && !isKeyValue(p.split(" ")[0]));
      if (ph) return { suffix: ph.slice(q.length), kind: "phrase" };
    }
    if (body.length >= 2 && !q.includes(" ")) {
      const nm = this.data.guests.map((g) => g.name).find((n) => n.startsWith(q) && norm(n) !== norm(q));
      if (nm) return { suffix: nm.slice(q.length), kind: "name" };
    }
    return null;
  }

  suggestionCount(def: KeyDef, label: string): number | null {
    const code = resolveValue(def, label);
    if (code === null) return null;
    const f: Filter = { k: def.code, v: [code], neg: false, src: "syntax" };
    const D = this.data;
    const list: (SearchGuest | SearchPhoto | SearchTable | SearchMessage)[] =
      def.ent === "guests" ? D.guests : def.ent === "photos" ? D.photos : def.ent === "tables" ? D.tables : D.messages;
    return list.filter((x) => this.testFilter(f, x, def.ent)).length;
  }

  suggestionRow(q: string): SuggestionRow | null {
    const m = q.match(/(\S*)$/);
    const tok = m ? m[1] : "";
    const neg = /^[-!]/.test(tok);
    const body = neg ? tok.slice(1) : tok;
    if (!body || /^[>@#]/.test(q)) return null;
    if (body.includes(":")) {
      const i = body.indexOf(":");
      const def = findKey(this.schema, body.slice(0, i));
      if (!def) return null;
      const part = body.slice(i + 1).split(/[,|]/).pop() || "";
      const cands = this.valueCandidates(def)
        .filter((c) => !part || norm(c).replace(/-/g, "").startsWith(norm(part).replace(/-/g, "")))
        .slice(0, 7);
      const head = q.slice(0, q.length - part.length);
      return { title: def.name + ":", items: cands.map((c) => ({ label: c, ins: head + c, n: this.suggestionCount(def, c) })) };
    }
    if (!/^[a-z]/i.test(body) && !q.includes(" ")) {
      const ks = this.schema.keys.filter((d) => norm(d.name).startsWith(norm(body)));
      if (!ks.length) return null;
      return { title: "מסננים:", items: ks.slice(0, 6).map((d) => ({ label: d.name + ":", ins: (neg ? "-" : "") + d.name + ":", n: null })) };
    }
    return null;
  }

  /** Rewrite the query's שעה: filter (photo slider). */
  withTimeRange(q: string, a: number, b: number, lo: number, hi: number): string {
    const P = this.parse(q);
    const alt = P.alts[0];
    alt.filters = alt.filters.filter((f) => f.k !== "time");
    if (!(a <= lo && b >= hi)) alt.filters.push({ k: "time", v: [[a, b]], neg: false, src: "syntax" });
    return this.serialize(P) || "תמונות";
  }
}
