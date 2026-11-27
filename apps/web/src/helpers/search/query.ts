/**
 * One filter language for smart search: power syntax (key:value, comma = OR, "-" = NOT, "או" between groups)
 * and a rule-based Hebrew phrase parser. Both produce the same ParsedQuery; serialize() turns it back
 * into canonical syntax, so chips and the query text are always the same thing.
 */
import { editDistance, hhmm, norm, re } from "./text";

export type Entity = "guests" | "photos" | "tables" | "messages";
export interface NumCmp {
  op: ">=" | "<=" | ">" | "<";
  n: number;
}
export type TimeRange = [number, number];
export type FilterValue = string | number | NumCmp | TimeRange;

export interface Filter {
  k: string;
  v: FilterValue[];
  neg: boolean;
  src: "syntax" | "nl";
}

export interface ParsedAlt {
  filters: Filter[];
  text: string;
  ent: Entity | null;
  unknown: string[];
}

export interface ParsedQuery {
  alts: ParsedAlt[];
  ent: Entity | null;
  text: string;
}

export interface KeyValue {
  code: string;
  label: string;
  syn: string[];
}

export interface KeyDef {
  code: string;
  ent: Entity;
  name: string;
  syn: string[];
  type?: "table" | "num" | "time" | "uploader";
  vals?: KeyValue[];
}

const V = (code: string, label: string, syn: string[] = []): KeyValue => ({ code, label, syn });
const dash = (s: string) => s.trim().replace(/\s+/g, "-");

export const DEFAULT_MEALS = ["צמחוני", "טבעוני", "ללא גלוטן", "רגיל"];

export interface Schema {
  keys: KeyDef[];
  byCode: Record<string, KeyDef>;
  groups: string[];
  meals: string[];
}

export function buildSchema(groups: string[], meals: string[]): Schema {
  const mealList: string[] = [];
  DEFAULT_MEALS.concat(meals).forEach((m) => {
    const t = (m || "").trim();
    if (t && !mealList.some((x) => norm(x) === norm(t))) mealList.push(t);
  });
  const groupList = groups.filter((g) => (g || "").trim());
  const keys: KeyDef[] = [
    {
      code: "status",
      ent: "guests",
      name: "סטטוס",
      syn: ["מצב"],
      vals: [
        V("invited", "לא-ענה", ["טרם", "לא-אישר", "ממתין", "לא-אישרו", "הוזמן", "לא-ענו"]),
        V("confirmed", "אישר", ["מאושר", "מגיע", "אישרו", "מגיעים"]),
        V("declined", "סירב", ["לא-מגיע", "סירבו"]),
        V("maybe", "אולי", ["מתלבט"]),
        V("cancelled", "ביטל", ["ביטלו", "מבוטל"]),
      ],
    },
    { code: "side", ent: "guests", name: "צד", syn: [], vals: [V("bride", "כלה", ["הכלה"]), V("groom", "חתן", ["החתן"]), V("shared", "משותף", ["שניהם", "משותפים"])] },
    { code: "group", ent: "guests", name: "קבוצה", syn: ["קבוצת"], vals: groupList.map((g) => V(g, dash(g))) },
    { code: "table", ent: "guests", name: "שולחן", syn: ["שולחנות"], type: "table" },
    { code: "meal", ent: "guests", name: "מנה", syn: ["מנות"], vals: mealList.map((m) => V(m, dash(m), m === "ללא גלוטן" ? ["גלוטן"] : [])) },
    { code: "party", ent: "guests", name: "מוזמנים", syn: ["מגיעים"], type: "num" },
    { code: "phone", ent: "guests", name: "טלפון", syn: [], vals: [V("missing", "חסר", ["אין", "בלי"]), V("has", "קיים", ["יש"])] },
    {
      code: "wa",
      ent: "guests",
      name: "וואטסאפ",
      syn: ["ווטסאפ", "whatsapp"],
      vals: [V("לא-נשלח", "לא-נשלח"), V("נשלח", "נשלח"), V("נקרא", "נקרא"), V("נכשל", "נכשל"), V("נענה", "נענה", ["ענה"]), V("חסום", "חסום", ["הסיר"])],
    },
    { code: "added", ent: "guests", name: "נוסף", syn: ["נוספו"], vals: [V("today", "היום"), V("week", "השבוע")] },
    {
      code: "pstatus",
      ent: "photos",
      name: "תמונה",
      syn: ["תמונות"],
      vals: [V("approved", "מאושרת", ["מאושרות"]), V("pending", "ממתינה", ["ממתינות", "לאישור"]), V("hidden", "מוסתרת", ["מוסתרות", "חסומה"]), V("fav", "מועדפת", ["מועדפות"])],
    },
    { code: "kind", ent: "photos", name: "סוג", syn: [], vals: [V("סרטון", "סרטון", ["וידאו", "סרטונים"]), V("תמונה", "תמונה", ["תמונות"])] },
    { code: "time", ent: "photos", name: "שעה", syn: [], type: "time" },
    { code: "day", ent: "photos", name: "יום", syn: [], vals: [V("today", "היום"), V("yesterday", "אתמול")] },
    { code: "uploader", ent: "photos", name: "מעלה", syn: [], type: "uploader" },
    { code: "free", ent: "tables", name: "מקומות", syn: [], vals: [V("free", "פנויים", ["פנוי", "פנויות"]), V("full", "מלא", ["מלאים"]), V("empty", "ריק", ["ריקים"])] },
    {
      code: "mstatus",
      ent: "messages",
      name: "הודעה",
      syn: ["הודעות"],
      vals: [V("scheduled", "מתוזמנת", ["מתוזמן", "מתוזמנות", "ממתינה"]), V("sent", "נשלחה", ["נשלח", "נשלחו"]), V("partial", "חלקית")],
    },
  ];
  const byCode: Record<string, KeyDef> = {};
  keys.forEach((k) => {
    byCode[k.code] = k;
  });
  return { keys, byCode, groups: groupList, meals: mealList };
}

export const ENTITY_LABEL: Record<Entity, string> = { guests: "אורחים", photos: "תמונות וסרטונים", tables: "שולחנות", messages: "הודעות ואוטומציות" };

const nv = (s: string) => norm(s).replace(/-/g, " ");

function resolveEnum(def: KeyDef, raw: string): string | null {
  const v = nv(raw);
  if (!v || !def.vals) return null;
  let hit = def.vals.find((x) => [x.label].concat(x.syn).some((s) => nv(s) === v));
  if (!hit) {
    const c = def.vals.filter((x) => [x.label].concat(x.syn).some((s) => nv(s).startsWith(v)));
    if (c.length === 1) hit = c[0];
  }
  return hit ? hit.code : null;
}

export function resolveValue(def: KeyDef, raw: string): FilterValue | null {
  if (def.type === "table") {
    const n = norm(raw);
    if (!n) return null;
    if (/^(ללא|אין|none)$/.test(n)) return "none";
    if (/^(יש|כלשהו)$/.test(n)) return "any";
    return raw.trim();
  }
  if (def.type === "num") {
    const m = norm(raw).match(/^(>=|<=|>|<)?(\d+)\+?$/);
    return m ? { op: (m[1] || ">=") as NumCmp["op"], n: Number(m[2]) } : null;
  }
  if (def.type === "time") {
    const m = raw.match(/^(\d{1,2})(?::(\d{2}))?(-)?(?:(\d{1,2})(?::(\d{2}))?)?$/);
    if (!m) return null;
    const a = Number(m[1]) * 60 + Number(m[2] || 0);
    if (m[4] !== undefined) return [a, Number(m[4]) * 60 + Number(m[5] || 0)];
    return [a, m[3] ? 1440 : a + 59];
  }
  if (def.type === "uploader") {
    const m = raw.match(/^#?(\d+)$/);
    return m ? Number(m[1]) : null;
  }
  return resolveEnum(def, raw);
}

export function valueText(def: KeyDef, code: FilterValue): string {
  if (def.type === "table") return code === "none" ? "ללא" : code === "any" ? "כלשהו" : dash(String(code));
  if (def.type === "num") {
    const c = code as NumCmp;
    return (c.op === ">=" ? "" : c.op) + c.n + (c.op === ">=" ? "+" : "");
  }
  if (def.type === "time") {
    const t = code as TimeRange;
    return hhmm(t[0]) + "-" + (t[1] >= 1440 ? "24:00" : hhmm(t[1]));
  }
  if (def.type === "uploader") return "#" + code;
  const v = (def.vals || []).find((x) => x.code === code);
  return v ? v.label : String(code);
}

export function valueHuman(def: KeyDef, code: FilterValue): string {
  return def.type === "time" ? valueText(def, code).replace("-", "–") : valueText(def, code).replace(/-/g, " ");
}

export function filterSyntax(schema: Schema, f: Filter): string {
  const d = schema.byCode[f.k];
  return (f.neg ? "-" : "") + d.name + ":" + f.v.map((x) => valueText(d, x)).join(",");
}

export function filterHuman(schema: Schema, f: Filter): { key: string; val: string } {
  const d = schema.byCode[f.k];
  return { key: d.name, val: f.v.map((x) => valueHuman(d, x)).join(" או ") };
}

/* ───────── tokenizer + syntax ───────── */

export function tokenize(raw: string): string[] {
  const out: string[] = [];
  raw.replace(/"([^"]*)"|(\S+)/g, (_m: string, q: string | undefined, w: string | undefined) => {
    out.push(q !== undefined ? q : (w as string));
    return "";
  });
  return out;
}

export const isKeyValue = (t: string | undefined): boolean => !!t && /^[-!]?[^\s:]+:[^\s]*$/.test(t);

export function findKey(schema: Schema, raw: string): KeyDef | undefined {
  const nk = norm(raw);
  let k = schema.keys.find((d) => norm(d.name) === nk || d.syn.some((s) => norm(s) === nk));
  if (!k && nk.length >= 3) k = schema.keys.find((d) => editDistance(norm(d.name), nk) <= 1);
  return k;
}

/* ───────── Hebrew phrase rules ───────── */

const RX = {
  cancelled: re("(ביטלו|ביטל|מבוטלים)"),
  declined: re("(לא מגיע|לא יגיע|לא מגיעים|סירבו|מסרבים|סירב)"),
  notResp: re("(עוד )?לא (אישר\\S*|ענ\\S*|הגיב\\S*|השיב\\S*)|טרם (אישר\\S*|ענ\\S*)"),
  confirmed: re("(אישרו|אישר|מאושרים|מגיעים)"),
  maybe: re("(אולי|מתלבטים|לא בטוחים)"),
  bride: re("(מ?צד )?ה?כלה"),
  groom: re("(מ?צד )?ה?חתן"),
  shared: re("משותפ\\S*"),
  noTable: re("(בלי|ללא|חסרי|חסר) שולחנ?\\S*|לא (משובצ\\S*|שובצו|הושבו|יושבו)"),
  tableN: re("(יושב\\S*|מי|אורחים) (ב?)שולחנ?\\s*(\\d+)"),
  noPhone: re("(בלי|ללא|חסר) (טלפון|מספר)"),
  big: re("(\\d+) (אנשים|משתתפים|מוזמנים|מקומות) ומעלה|משפחות גדולות"),
  added: re("(נוספו|הוזמנו|חדשים) ?(היום)?"),
  addedWeek: re("(נוספו|חדשים) השבוע"),
  noWa: re("(לא קיבלו|בלי) (הודעה|וואטסאפ|הזמנה)"),
  waRead: re("קראו (את )?ה?(הודעה|הזמנה)"),
  waBlocked: re("(הסירו|חסמו)"),
  photo: re("תמונות|תמונה|סרטונים|סרטון|צילומים"),
  video: re("סרטונים|סרטון|וידאו"),
  pend: re("ממתינ\\S*( לאישור)?"),
  hid: re("מוסתר\\S*|הוסתרו|חסומ\\S*"),
  fav: re("מועדפ\\S*"),
  today: re("היום"),
  yday: re("אתמול"),
  between: re("בין (\\d{1,2})(?::(\\d{2}))? (ל|ו)-?(\\d{1,2})(?::(\\d{2}))?"),
  fromH: re("(?:מ|ב)?שעה (\\d{1,2})(?::(\\d{2}))?"),
  afterH: re("אחרי (\\d{1,2})(?::(\\d{2}))?"),
  beforeH: re("(לפני|עד) (\\d{1,2})(?::(\\d{2}))?"),
  atH: re("בשעה (\\d{1,2})"),
  beforeMidnight: re("(לפני|עד) חצות"),
  uploaderN: re("(של )?מעלה #?(\\d+)"),
  tables: re("שולחנות"),
  free: re("(עם )?(מקומות? )?פנוי\\S*|מקום פנוי"),
  full: re("מלאים|מלא"),
  empty: re("ריקים|ריק"),
  msg: re("הודעות|הודעה|תזכורת|תזכורות|קמפיינ\\S*|מתוזמנ\\S*|ממתינ\\S* לשליחה"),
  sched: re("מתוזמנ\\S*|ממתינ\\S* לשליחה"),
  sent: re("נשלח\\S*"),
};

const MEAL_RX: [string, RegExp][] = [
  ["צמחוני", re("צמחונ\\S*")],
  ["טבעוני", re("טבעונ\\S*")],
  ["ללא גלוטן", re("גלוטן")],
];

const FILLER = new Set(
  ["מי", "עוד", "של", "מצד", "את", "כל", "האורחים", "אורחים", "מוזמנים", "מהם", "כמה", "הם", "אלה", "יש", "אילו", "איזה", "הצג", "תראה", "לי", "עם", "ה", "מ", "ב", "ל", "ש", "צד"].map(norm)
);

function addFilter(list: Filter[], f: Filter): void {
  const ex = list.find((x) => x.k === f.k && x.neg === f.neg);
  if (!ex) {
    list.push(f);
    return;
  }
  f.v.forEach((v) => {
    if (!ex.v.some((y) => JSON.stringify(y) === JSON.stringify(v))) ex.v.push(v);
  });
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function parseAlt(schema: Schema, tokens: string[]): ParsedAlt {
  const filters: Filter[] = [];
  const unknown: string[] = [];
  const rest: string[] = [];
  for (const tok of tokens) {
    if (!isKeyValue(tok)) {
      rest.push(tok);
      continue;
    }
    let neg = false;
    let tt = tok;
    if (/^[-!]/.test(tt)) {
      neg = true;
      tt = tt.slice(1);
    }
    const i = tt.indexOf(":");
    const def = findKey(schema, tt.slice(0, i));
    if (!def) {
      rest.push(tok);
      continue;
    }
    const raw = tt.slice(i + 1);
    if (!raw) continue;
    const vals = raw
      .split(/[,|]/)
      .filter(Boolean)
      .map((x) => resolveValue(def, x));
    if (vals.some((v) => v === null)) {
      unknown.push(tok);
      continue;
    }
    addFilter(filters, { k: def.code, v: vals as FilterValue[], neg, src: "syntax" });
  }

  let t = norm(rest.join(" "));
  let ent: Entity | null = null;
  const take = (rx: RegExp, cb: (m: RegExpMatchArray) => void): boolean => {
    const m = t.match(rx);
    if (!m) return false;
    t = t.replace(rx, " ").replace(/\s+/g, " ").trim();
    cb(m);
    return true;
  };
  const add = (k: string, v: FilterValue) => addFilter(filters, { k, v: [v], neg: false, src: "nl" });
  const mins = (h: string, m?: string) => Number(h) * 60 + Number(m || 0);

  const isVideo = RX.video.test(t);
  if (take(RX.photo, () => (ent = "photos"))) {
    if (isVideo) add("kind", "סרטון");
    take(RX.video, () => undefined);
    take(RX.pend, () => add("pstatus", "pending"));
    take(RX.hid, () => add("pstatus", "hidden"));
    take(RX.fav, () => add("pstatus", "fav"));
    take(RX.today, () => add("day", "today"));
    take(RX.yday, () => add("day", "yesterday"));
    take(RX.between, (m) => add("time", [mins(m[1], m[2]), mins(m[4], m[5])]));
    take(RX.beforeMidnight, () => add("time", [0, 1440]));
    take(RX.afterH, (m) => add("time", [mins(m[1], m[2]), 1440]));
    take(RX.beforeH, (m) => add("time", [0, mins(m[2], m[3])]));
    take(RX.atH, (m) => add("time", [Number(m[1]) * 60, Number(m[1]) * 60 + 59]));
    take(RX.fromH, (m) => add("time", [mins(m[1], m[2]), 1440]));
    take(RX.uploaderN, (m) => add("uploader", Number(m[2])));
  } else if (take(RX.tables, () => (ent = "tables"))) {
    take(RX.free, () => add("free", "free"));
    take(RX.full, () => add("free", "full"));
    take(RX.empty, () => add("free", "empty"));
  } else if (RX.msg.test(t) && !/אורח|מי |לא ענ|לא אישר|לא קיבלו|בלי הודעה/.test(t)) {
    ent = "messages";
    const sc = RX.sched.test(t);
    const sn = RX.sent.test(t);
    t = t.replace(new RegExp(RX.msg.source, "g"), " ").replace(new RegExp(RX.sent.source, "g"), " ").replace(/\s+/g, " ").trim();
    if (sc) add("mstatus", "scheduled");
    else if (sn) add("mstatus", "sent");
  } else {
    const st =
      take(RX.cancelled, () => add("status", "cancelled")) ||
      take(RX.declined, () => add("status", "declined")) ||
      take(RX.notResp, () => add("status", "invited")) ||
      take(RX.maybe, () => add("status", "maybe"));
    if (!st) take(RX.confirmed, () => add("status", "confirmed"));
    take(RX.noTable, () => add("table", "none"));
    take(RX.tableN, (m) => add("table", m[3]));
    take(RX.noPhone, () => add("phone", "missing"));
    take(RX.noWa, () => add("wa", "לא-נשלח"));
    take(RX.waRead, () => add("wa", "נקרא"));
    MEAL_RX.forEach(([label, rx]) => take(rx, () => add("meal", label)));
    take(RX.big, (m) => addFilter(filters, { k: "party", v: [{ op: ">=", n: Number(m[1] || 3) }], neg: false, src: "nl" }));
    if (!take(RX.addedWeek, () => add("added", "week"))) take(RX.added, () => add("added", "today"));
    if (filters.length) {
      take(RX.bride, () => add("side", "bride"));
      take(RX.groom, () => add("side", "groom"));
      take(RX.shared, () => add("side", "shared"));
      schema.groups
        .slice()
        .sort((a, b) => b.length - a.length)
        .forEach((g) => {
          const ng = norm(g);
          if (ng.length < 2) return;
          take(new RegExp("(^| )(קבוצת |מ|ה)?" + escapeRe(ng) + "( |$)"), () => add("group", g));
        });
    }
  }
  t = t
    .split(" ")
    .filter((w) => w && !FILLER.has(w))
    .join(" ");
  const first = filters[0];
  const e: Entity | null = ent || (first ? schema.byCode[first.k].ent : null);
  return { filters, text: t, ent: e, unknown };
}

export function parseQuery(schema: Schema, raw: string): ParsedQuery {
  const toks = tokenize(raw);
  const groups: string[][] = [[]];
  toks.forEach((t, i) => {
    if (t === "|" || (t === "או" && isKeyValue(toks[i - 1]) && isKeyValue(toks[i + 1]))) groups.push([]);
    else groups[groups.length - 1].push(t);
  });
  const alts = groups.map((g) => parseAlt(schema, g));
  const withEnt = alts.find((a) => a.ent);
  return { alts, ent: withEnt ? withEnt.ent : null, text: alts.map((a) => a.text).filter(Boolean).join(" ") };
}

export function serializeQuery(schema: Schema, P: { alts: { filters: Filter[]; text: string }[] }): string {
  return P.alts
    .map((a) => a.filters.map((f) => filterSyntax(schema, f)).concat(a.text ? [a.text] : []).join(" "))
    .filter(Boolean)
    .join(" או ");
}

export function stripScope(q: string): string {
  return q.replace(/^\s*[>@#]\s*/, "");
}
