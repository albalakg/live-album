/**
 * Event page wizard model (builder B).
 * Port of builder-mock/js/sections.js. Pure functions only (no Vue, no API, no DOM),
 * so everything here is unit-testable.
 *
 * Wizard state is stored per section *kind* (story, schedule, gift ...), not per template
 * block, so switching templates never wipes what the host typed. `toHubConfig` projects the
 * state onto the chosen template's default blocks; `fromHubConfig` does the reverse.
 */
import type { HubBlock, HubConfig, HubTheme } from "../types";
import type { EventPrefill } from "./hubBuilderUtils";

/* ------------------------------------------------------------------ */
/* Copy + catalogues                                                   */
/* ------------------------------------------------------------------ */

export const TYPE_KICKER: Record<string, string> = {
  wedding: "החתונה של",
  barmitzvah: "חוגגים את",
  birthday: "יום הולדת",
  brit: "מזל טוב",
  corporate: "מזמינים אתכם ל",
  party: "מוזמנים ל",
  festival: "מוזמנים ל",
};

export interface CategoryOption {
  id: string;
  he: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: "all", he: "הכל" },
  { id: "wedding", he: "חתונה" },
  { id: "barmitzvah", he: "בר/בת מצווה" },
  { id: "birthday", he: "יום הולדת" },
  { id: "brit", he: "ברית/בריתה" },
  { id: "corporate", he: "אירוע חברה" },
  { id: "party", he: "מסיבה" },
  { id: "festival", he: "פסטיבל" },
];

/** Editable fields a kind exposes in the wizard (the UI decides how to render each). */
export type KindField =
  | "heading"
  | "text"
  | "rows"
  | "dressTitle"
  | "dressText"
  | "images"
  | "mapNote"
  | "waze"
  | "qa"
  | "giftText"
  | "giftUrl";

export interface KindMeta {
  name: string;
  desc: string;
  /** Icon name, resolved by the Vue icon set. */
  icon: string;
  fields: KindField[];
  recommended?: boolean;
}

/** Friendly section catalogue. Key = base kind. */
export const KINDS: Record<string, KindMeta> = {
  story: { name: "הסיפור שלנו", desc: "כמה מילים על איך הכל התחיל", icon: "heart", fields: ["heading", "text"] },
  people: { name: "מי אנחנו", desc: "כרטיסים קטנים עם השמות", icon: "users", fields: [] },
  parasha: { name: "הפרשה", desc: "כמה מילים על הפרשה", icon: "book", fields: ["heading", "text"] },
  schedule: { name: "לו״ז", desc: "מה קורה ומתי", icon: "clock", fields: ["rows"] },
  dress: { name: "קוד לבוש", desc: "מה כדאי ללבוש", icon: "shirt", fields: ["dressTitle", "dressText"] },
  gallery: { name: "גלריית תמונות", desc: "כמה תמונות שאתם אוהבים", icon: "image", fields: ["images"] },
  upload: {
    name: "העלאת תמונות",
    desc: "איך מעלים תמונות לאלבום. מומלץ להשאיר",
    icon: "camera",
    fields: [],
    recommended: true,
  },
  map: { name: "הגעה ומפה", desc: "כפתורים ל־Waze ולגוגל מפות", icon: "pin", fields: ["mapNote", "waze"] },
  faq: { name: "שאלות נפוצות", desc: "חניה, ילדים וכל מה ששואלים", icon: "help", fields: ["qa"] },
  gift: { name: "מתנה", desc: "קישור לביט, פייבוקס או רשימת מתנות", icon: "gift", fields: ["giftText", "giftUrl"] },
  wishes: { name: "ברכות מהאורחים", desc: "האורחים משאירים לכם ברכה", icon: "chat", fields: ["heading", "text"] },
  rsvp: { name: "אישור הגעה", desc: "האורחים מאשרים שהם מגיעים", icon: "check", fields: ["heading", "text"] },
  quote: { name: "משפט פתיחה", desc: "משפט קצר בפס רחב", icon: "quote", fields: ["text"] },
  trivia: { name: "טריוויה", desc: "כפתור כניסה למשחק על המסך", icon: "star", fields: [] },
  milestones: { name: "רגעים מהשנה", desc: "שלושה רגעים קטנים", icon: "star", fields: [] },
  playlist: { name: "פלייליסט", desc: "השירים של הערב", icon: "music", fields: [] },
  speakers: { name: "דוברים", desc: "מי עולה לבמה", icon: "mic", fields: [] },
  sponsors: { name: "שותפים", desc: "הלוגואים של השותפים", icon: "star", fields: [] },
  hashtag: { name: "האשטאג", desc: "האשטאג של האירוע", icon: "hash", fields: [] },
  network: { name: "היכרויות", desc: "הסבר על נטוורקינג באירוע", icon: "users", fields: [] },
  been: { name: "הייתי שם", desc: "האורחים מסמנים שהיו", icon: "star", fields: [] },
  grounds: { name: "מפת המתחם", desc: "איפה כל דבר נמצא", icon: "pin", fields: [] },
  food: { name: "אוכל ושתייה", desc: "פינות האוכל במתחם", icon: "cup", fields: [] },
  rules: { name: "כללי המקום", desc: "מה מותר ומה לא", icon: "help", fields: [] },
  info: { name: "פרטים חשובים", desc: "כרטיסי מידע קצרים", icon: "info", fields: [] },
};

/** Off by default (product decision: wishes / RSVP / BeenThere stay off until the host turns them on). */
export const DEFAULT_OFF: string[] = ["wishes", "rsvp", "gift", "been", "trivia", "network"];

/** Template types that get a dedicated gift section. */
export const GIFT_TYPES: string[] = ["wedding", "barmitzvah", "birthday", "brit", "party"];

export interface Palette {
  id: string;
  name: string;
  /** Primary / accent colour. null = the template's own. */
  a: string | null;
  /** Secondary / heading colour. null = the template's own. */
  b: string | null;
}

export const PALETTES: Palette[] = [
  { id: "original", name: "של העיצוב", a: null, b: null },
  { id: "rose", name: "ורוד עתיק", a: "#A85A67", b: "#5C2F37" },
  { id: "olive", name: "זית", a: "#6E7D45", b: "#38401F" },
  { id: "navy", name: "כחול לילה", a: "#3E5F92", b: "#1C2B45" },
  { id: "terra", name: "טרקוטה", a: "#B8603A", b: "#5E2E19" },
  { id: "gold", name: "זהב", a: "#A97C3C", b: "#3A2A22" },
];

export interface FontOption {
  id: string;
  name: string;
  /** Value stored in hub_config.theme.font_family. */
  family: string;
  css: string;
}

export const FONTS: FontOption[] = [
  { id: "classic", name: "קלאסי", family: "Frank Ruhl Libre", css: '"Frank Ruhl Libre", serif' },
  { id: "clean", name: "נקי", family: "Heebo", css: '"Heebo", sans-serif' },
  { id: "soft", name: "רך", family: "Varela Round", css: '"Varela Round", sans-serif' },
];

/* ------------------------------------------------------------------ */
/* Wizard state (BUILD-SPEC §5)                                        */
/* ------------------------------------------------------------------ */

export interface WizardEvent {
  type: string;
  name1: string;
  name2: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time: string;
  venue: string;
  city: string;
  /** Used only for the `event-{id}` slug fallback. */
  id?: string | number;
}

export interface WizardTheme {
  palette_id: string;
  /** null = the template's own font. */
  font_id: string | null;
}

export interface WizardRow {
  time?: string;
  label?: string;
  q?: string;
  a?: string;
}

/** Gallery image reference. Only `stock` (neutral key) or `asset_id` are ever persisted. */
export interface WizardImage {
  stock?: string;
  asset_id?: number | string;
  /** Display-only helpers for asset picks; dropped on save. */
  url?: string;
  thumb_url?: string;
}

export interface KindContent {
  heading?: string;
  text?: string;
  /** Dress code headline. */
  title?: string;
  rows?: WizardRow[];
  images?: WizardImage[];
  note?: string;
  waze?: string;
  url?: string;
}

/** Keyed by base kind; survives template switches. */
export type WizardContent = Record<string, KindContent>;

export interface WizardState {
  template_id: string;
  event: WizardEvent;
  /** Only explicit choices; a missing kind falls back to its default (see DEFAULT_OFF). */
  sections: Record<string, boolean>;
  /** Kinds in page order. [] = template order. */
  order: string[];
  content: WizardContent;
  theme: WizardTheme;
  slug: string;
  slugTouched: boolean;
  is_published: boolean;
}

/* ------------------------------------------------------------------ */
/* Kinds                                                               */
/* ------------------------------------------------------------------ */

export interface BlockLike {
  type: string;
  id: string;
}

/** Block -> wizard kind. With `seen`, duplicates get -2, -3 ... */
export function kindOf(b: BlockLike, seen?: Set<string>): string {
  const t = b.type;
  const id = b.id;
  let k: string;
  if (t === "STORY") k = "story";
  else if (t === "ABOUT") k = id === "parasha" ? "parasha" : "story";
  else if (t === "PEOPLE") k = "people";
  else if (t === "EVENT_TIMELINE" || t === "LINEUP") k = "schedule";
  else if (t === "CARDS") k = id === "dress" ? "dress" : "info";
  else if (t === "GALLERY") k = "gallery";
  else if (t === "STEPS" || t === "SNAPSHARE_CTA") k = "upload";
  else if (t === "MAP" || t === "SMART_NAVIGATION") k = "map";
  else if (t === "FAQ") k = "faq";
  else if (t === "GIFT") k = "gift";
  else if (t === "WISHING_WELL") k = "wishes";
  else if (t === "RSVP") k = "rsvp";
  else if (t === "QUOTE") k = "quote";
  else if (t === "TRIVIA_CTA") k = "trivia";
  else if (t === "MILESTONES") k = "milestones";
  else if (t === "PLAYLIST") k = "playlist";
  else if (t === "SPEAKERS") k = "speakers";
  else if (t === "SPONSORS") k = "sponsors";
  else if (t === "HASHTAG") k = "hashtag";
  else if (t === "NETWORKING") k = "network";
  else if (t === "BEEN_THERE") k = "been";
  else if (t === "GROUNDS") k = "grounds";
  else if (t === "ZONES") k = "food";
  else if (t === "RULES") k = "rules";
  else k = id;
  if (seen) {
    let kk = k;
    let n = 2;
    while (seen.has(kk)) kk = `${k}-${n++}`;
    seen.add(kk);
    return kk;
  }
  return k;
}

export function baseKind(k: string): string {
  return String(k).replace(/-\d+$/, "");
}

export function kindMeta(k: string): KindMeta {
  return KINDS[baseKind(k)] || KINDS.info;
}

/** Default on/off for a kind when the host has not chosen. */
export function isKindOnByDefault(k: string): boolean {
  return !DEFAULT_OFF.includes(baseKind(k));
}

export interface KindPair {
  kind: string;
  block: HubBlock;
}

/** Hero is always the cover; the footer is always last. Neither is a wizard card. */
function isHero(b: BlockLike): boolean {
  return b.type === "HERO_COUNTDOWN";
}
function isFooter(b: BlockLike): boolean {
  return b.type === "FOOTER";
}
/** The bottom "upload" call-to-action rides along with the STEPS block (one card in the wizard). */
function isUploadFollower(b: BlockLike, blocks: BlockLike[]): boolean {
  return b.type === "SNAPSHARE_CTA" && blocks.some((x) => x.type === "STEPS");
}

/** Wizard cards for a block list, in block order (hero, footer and upload-CTA follower excluded). */
export function templateKinds(blocks: HubBlock[]): KindPair[] {
  const seen = new Set<string>();
  const out: KindPair[] = [];
  for (const block of blocks) {
    if (isHero(block) || isFooter(block) || isUploadFollower(block, blocks)) continue;
    out.push({ kind: kindOf(block, seen), block });
  }
  return out;
}

/** Template type from a template id: "wedding-1" -> "wedding". */
export function templateTypeOf(templateId: string): string {
  return String(templateId || "").replace(/-\d+$/, "");
}

export function giftEligible(type: string): boolean {
  return GIFT_TYPES.includes(type);
}

/**
 * Keep only known kinds from `order`, then add any missing kind next to its
 * template neighbour. Empty order = template order.
 */
export function normalizeOrder(order: string[] | null | undefined, kinds: string[]): string[] {
  const known = new Set(kinds);
  const out: string[] = [];
  for (const k of order || []) if (known.has(k) && !out.includes(k)) out.push(k);
  if (!out.length) return kinds.slice();
  kinds.forEach((k, i) => {
    if (out.includes(k)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const pos = out.indexOf(kinds[j]);
      if (pos >= 0) {
        at = pos + 1;
        break;
      }
    }
    out.splice(at, 0, k);
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Gift block                                                          */
/* ------------------------------------------------------------------ */

/** GIFT section for templates that have none (wedding-1 keeps the gift link inside WISHING_WELL). */
export const GIFT_BLOCK: HubBlock = {
  id: "gift",
  type: "GIFT",
  enabled: false,
  order: 0,
  data: {
    kicker: "מתנה",
    heading: "מתנה לזוג",
    body: "למי שרוצה, אפשר להעביר מתנה בקישור.",
    button: "למתנה",
    url: null,
  },
};

const GIFT_HEADING_BY_TYPE: Record<string, string> = { wedding: "מתנה לזוג" };

function cloneJson<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function renumber(blocks: HubBlock[]): HubBlock[] {
  return blocks.map((b, i) => ({ ...b, order: i + 1 }));
}

/**
 * Adds a GIFT block when missing, for wedding / barmitzvah / birthday / brit / party.
 * Inserted before the first WISHING_WELL / RSVP / FAQ, else before the closing blocks.
 * Returns a new array (input untouched) with contiguous `order` values.
 */
export function ensureGiftBlock(blocks: HubBlock[], eventType: string): HubBlock[] {
  const list = blocks.map((b) => cloneJson(b));
  if (!giftEligible(eventType) || list.some((b) => b.type === "GIFT")) return renumber(list);
  const gift = cloneJson(GIFT_BLOCK);
  gift.data.heading = GIFT_HEADING_BY_TYPE[eventType] || "מתנה";
  let id = gift.id;
  let n = 2;
  while (list.some((b) => b.id === id)) id = `${gift.id}-${n++}`;
  gift.id = id;
  let at = list.findIndex((b) => b.type === "WISHING_WELL" || b.type === "RSVP" || b.type === "FAQ");
  if (at < 0) at = list.findIndex((b) => b.type === "SNAPSHARE_CTA" || b.type === "FOOTER");
  list.splice(at < 0 ? list.length : at, 0, gift);
  return renumber(list);
}

/* ------------------------------------------------------------------ */
/* Sample content                                                      */
/* ------------------------------------------------------------------ */

export const SAMPLE_TEXT = {
  story: "כאן אפשר לספר לאורחים במשפט או שניים איך הכל התחיל. אפשר גם להשאיר את זה קצר.",
  parasha: "כמה מילים על הפרשה ועל מה שהיא אומרת לנו.",
  dress: "בגדים חגיגיים ונעליים נוחות לרחבה.",
  map: "יש חניה במקום.",
  gift: "למתנה",
} as const;

export const SAMPLE_FAQ: WizardRow[] = [
  { q: "יש חניה?", a: "כן, ליד המקום." },
  { q: "אפשר להגיע עם ילדים?", a: "כתבו כאן מה מתאים לכם." },
  { q: "איך מעלים תמונות?", a: "סורקים את ה־QR שעל השולחן, או נכנסים מהקישור. בלי אפליקציה." },
];

/** Text that came from the template mock-ups rather than from the host. */
const TEMPLATE_SAMPLE_RE = /במוק|לדוגמה|\(דוגמה\)/;

function sameRows(a: WizardRow[] | undefined, b: WizardRow[]): boolean {
  if (!a || a.length !== b.length) return false;
  return a.every((r, i) => (r.q || "") === (b[i].q || "") && (r.a || "") === (b[i].a || ""));
}

/**
 * True while the host still sees placeholder copy (drives the amber
 * "worth updating the text" hint). Compares against the sample strings, so
 * it stays correct after a reload.
 */
export function isSampleContent(kind: string, content: KindContent | null | undefined): boolean {
  if (!content) return false;
  const k = baseKind(kind);
  const text = (content.text || "").trim();
  switch (k) {
    case "story":
      return text === SAMPLE_TEXT.story || TEMPLATE_SAMPLE_RE.test(text);
    case "parasha":
      return text === SAMPLE_TEXT.parasha || TEMPLATE_SAMPLE_RE.test(text);
    case "dress":
      return text === SAMPLE_TEXT.dress || TEMPLATE_SAMPLE_RE.test(text);
    case "map":
      return (content.note || "").trim() === SAMPLE_TEXT.map || TEMPLATE_SAMPLE_RE.test(content.note || "");
    case "faq":
      return sameRows(content.rows, SAMPLE_FAQ);
    default:
      return false;
  }
}

/** Neutral gallery sample keys: template/{type}/album-N. Never an assets/ai path. */
/** Neutral gallery samples: `{templateId}/album-N` (resolves via registry). Never assets/ai. */
export function sampleGalleryImages(templateId: string, count = 6): WizardImage[] {
  const tid = templateId || "wedding-1";
  return Array.from({ length: count }, (_, i) => ({ stock: `${tid}/album-${i + 1}` }));
}

/** Coerces any gallery image into a persistable ref: {asset_id} or {stock}. */
export function toImageRef(
  img: WizardImage,
  templateIdOrType: string,
  index: number
): { asset_id: number | string } | { stock: string } {
  if (img.asset_id != null && img.asset_id !== "") return { asset_id: img.asset_id };
  const tid = templateIdOrType.includes("-")
    ? templateIdOrType
    : `${templateIdOrType || "wedding"}-1`;
  const neutral = `${tid}/album-${index + 1}`;
  let key = String(img.stock || "").trim();
  if (!key) return { stock: neutral };
  // Reject AI people pool; map mock paths to neutral template albums
  if (/^\/?assets\/ai\//.test(key)) {
    const m = key.match(/album-(\d+)/i);
    return { stock: `${tid}/album-${m ? m[1] : index + 1}` };
  }
  if (/^\/?assets\//.test(key)) return { stock: neutral };
  if (/^template\//.test(key)) {
    const m = key.match(/album-(\d+)/i);
    return { stock: `${tid}/album-${m ? m[1] : index + 1}` };
  }
  key = key.replace(/\.(jpe?g|png|webp)$/i, "");
  return { stock: key };
}

function dataOf(blocks: HubBlock[], pred: (b: HubBlock) => boolean): Record<string, unknown> | undefined {
  return blocks.find(pred)?.data;
}
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function arr(v: unknown): Array<Record<string, unknown>> {
  return Array.isArray(v) ? (v as Array<Record<string, unknown>>) : [];
}

/** Starting content per kind: friendly, clearly editable sample text.
 *  `templateIdOrType` may be a full id (`wedding-1`) or a type (`wedding`). */
export function defaultContent(
  blocks: HubBlock[],
  ev: WizardEvent,
  templateIdOrType: string = ev.type
): WizardContent {
  const story = dataOf(blocks, (b) => b.type === "STORY" || (b.type === "ABOUT" && b.id !== "parasha"));
  const tl = dataOf(blocks, (b) => b.type === "EVENT_TIMELINE");
  const lu = dataOf(blocks, (b) => b.type === "LINEUP");
  const dress = dataOf(blocks, (b) => b.type === "CARDS" && b.id === "dress");
  const dressItem = arr(dress?.items)[0];
  let rows: WizardRow[];
  if (tl && arr(tl.items).length) rows = arr(tl.items).map((i) => ({ time: str(i.time), label: str(i.label) }));
  else if (lu && arr(lu.items).length) rows = arr(lu.items).map((i) => ({ time: str(i.time), label: str(i.title) }));
  else rows = [{ time: ev.time || "19:00", label: "מתחילים" }];
  const galleryTid = templateIdOrType.includes("-")
    ? templateIdOrType
    : `${templateIdOrType || "wedding"}-1`;
  return {
    story: { heading: str(story?.heading) || "קצת עלינו", text: SAMPLE_TEXT.story },
    parasha: { heading: "הפרשה", text: SAMPLE_TEXT.parasha },
    schedule: { rows },
    dress: { title: str(dressItem?.title) || "חגיגי", text: SAMPLE_TEXT.dress },
    gallery: { images: sampleGalleryImages(galleryTid) },
    map: { note: SAMPLE_TEXT.map, waze: "" },
    faq: { rows: SAMPLE_FAQ.map((r) => ({ ...r })) },
    gift: { text: SAMPLE_TEXT.gift, url: "" },
    wishes: { heading: "ברכות", text: "נשמח לכמה מילים מכם." },
    rsvp: { heading: "מגיעים?", text: "נשמח לדעת עד שבוע לפני." },
    quote: { text: "הערב הזה שייך גם לכם." },
  };
}

/* ------------------------------------------------------------------ */
/* Slug                                                                */
/* ------------------------------------------------------------------ */

/** Common Hebrew first names -> Latin spelling used in slugs. */
export const NAMES: Record<string, string> = {
  "עמית": "amit", "גל": "gal", "נועה": "noa", "יונתן": "yonatan", "תמר": "tamar", "אדם": "adam", "ארי": "ari",
  "דנה": "dana", "שירה": "shira", "איתי": "itay", "מאיה": "maya", "רוני": "roni", "יעל": "yael", "דניאל": "daniel",
  "אורי": "ori", "ליאור": "lior", "עידו": "ido", "נוי": "noy", "שני": "shani", "טל": "tal", "מיכל": "michal",
  "עומר": "omer", "רותם": "rotem", "אביגיל": "avigail", "נתן": "natan", "יוסי": "yossi", "שרה": "sara", "דוד": "david",
  "משה": "moshe", "רחל": "rachel", "לאה": "lea", "אליה": "elia", "הילה": "hila", "ליה": "lia", "אור": "or",
  "אבי": "avi", "אברהם": "avraham", "אדיר": "adir", "אהרון": "aharon", "אודי": "udi", "אופיר": "ofir", "אור־אל": "orel",
  "אוראל": "orel", "אורית": "orit", "אורן": "oren", "אילן": "ilan", "אילנה": "ilana", "איציק": "itzik", "איתן": "eitan",
  "אלון": "alon", "אלי": "eli", "אליאב": "eliav", "אליהו": "eliyahu", "אלירן": "eliran", "אלמוג": "almog", "אמיר": "amir",
  "אמנון": "amnon", "אמיתי": "amitai", "אנה": "anna", "אסף": "assaf", "אסתר": "esther", "אפרת": "efrat", "ארז": "erez",
  "אריאל": "ariel", "אריאלה": "ariela", "אשר": "asher", "בן": "ben", "בני": "benny", "בנימין": "binyamin", "בר": "bar",
  "ברק": "barak", "בת־אל": "batel", "בתיה": "batya", "גבי": "gabi", "גבריאל": "gavriel", "גיא": "guy", "גידי": "gidi",
  "גילי": "gili", "גלעד": "gilad", "גלית": "galit", "גדעון": "gideon", "גיל": "gil", "דבורה": "dvora", "דור": "dor",
  "דורון": "doron", "דורית": "dorit", "דין": "din", "דקל": "dekel", "דרור": "dror", "הדס": "hadas", "הדר": "hadar",
  "הלל": "hillel", "זיו": "ziv", "זהר": "zohar", "זהבה": "zehava", "חגית": "hagit", "חגי": "hagai", "חן": "chen",
  "חנה": "hana", "חיים": "haim", "חנן": "hanan", "טוהר": "tohar", "טליה": "talia", "טלי": "tali", "יאיר": "yair",
  "יגאל": "yigal", "יהונתן": "yehonatan", "יהודה": "yehuda", "יהלי": "yahli", "יובל": "yuval", "יואב": "yoav",
  "יוגב": "yogev", "יוני": "yoni", "יוסף": "yosef", "יותם": "yotam", "יזהר": "yizhar", "ינון": "yinon", "יעקב": "yaakov",
  "יערה": "yaara", "יפעת": "yifat", "יפה": "yafa", "יצחק": "yitzhak", "ירדן": "yarden", "ירון": "yaron", "ישי": "yishai",
  "ישראל": "israel", "כרמל": "carmel", "כרמית": "carmit", "לביא": "lavi", "ליאם": "liam", "ליאל": "liel", "לידור": "lidor",
  "לימור": "limor", "ליהי": "lihi", "לירון": "liron", "לירז": "liraz", "לילך": "lilach", "לינוי": "linoy", "לני": "lani",
  "מאור": "maor", "מגן": "magen", "מוטי": "moti", "מור": "mor", "מורן": "moran", "מזל": "mazal", "מירב": "merav",
  "מירי": "miri", "מיכאל": "michael", "מלי": "mali", "מעיין": "maayan", "מרים": "miriam", "משי": "meshi", "מתן": "matan",
  "נבו": "nevo", "נדב": "nadav", "נדיה": "nadia", "נוגה": "noga", "נועם": "noam", "נופר": "nofar", "נורית": "nurit",
  "ניב": "niv", "ניר": "nir", "ניצן": "nitzan", "נירית": "nirit", "נעמה": "naama", "נעמי": "naomi", "נריה": "neria",
  "סתיו": "stav", "סיוון": "sivan", "סיגל": "sigal", "סול": "sol", "סהר": "sahar", "סטלה": "stella", "סמדר": "smadar",
  "עדי": "adi", "עדן": "eden", "עדיאל": "adiel", "עודד": "oded", "עופר": "ofer", "עוז": "oz", "עילי": "ily",
  "עינב": "einav", "עמוס": "amos", "עמרי": "omri", "ענת": "anat", "עפרה": "ofra", "פז": "paz", "פנינה": "pnina",
  "צביקה": "zvika", "צוף": "tzuf", "צחי": "tzachi", "צופית": "tzofit", "קורן": "koren", "קרן": "keren", "קובי": "kobi",
  "רביד": "ravid", "רבקה": "rivka", "רז": "raz", "רועי": "roey", "רון": "ron", "רונן": "ronen", "רונית": "ronit",
  "רוז": "rose", "רות": "ruth", "רן": "ran", "רינת": "rinat", "רפאל": "raphael", "רמי": "rami",
  "שגיא": "sagi", "שגית": "sagit", "שחר": "shachar", "שי": "shay", "שילה": "shila", "שלומי": "shlomi", "שלמה": "shlomo",
  "שמעון": "shimon", "שמואל": "shmuel", "שמרית": "shimrit", "שקד": "shaked", "שרון": "sharon", "תהילה": "tehila",
  "תום": "tom", "תומר": "tomer", "תכלת": "tchelet", "תמיר": "tamir", "תקווה": "tikva", "אלה": "ella", "אוריאל": "uriel",
  "אביב": "aviv", "אביה": "avia", "אביטל": "avital", "אביחי": "avichai", "איילת": "ayelet", "איה": "aya", "איריס": "iris",
  "אלכס": "alex", "אלעד": "elad", "אנטון": "anton", "אסיף": "asif", "אפרים": "efraim", "ארנון": "arnon", "אתי": "etti",
  "בועז": "boaz", "ביאנקה": "bianca", "בלה": "bella", "גאיה": "gaya", "גבע": "geva", "גוני": "goni", "גפן": "gefen",
  "דן": "dan", "דפנה": "dafna", "דניאלה": "daniela", "דקלה": "dikla", "הילי": "hili", "וולדי": "valdi", "ורד": "vered",
  "טום": "tom", "יסמין": "yasmin", "ירדנה": "yardena", "ליבי": "libi", "מוריה": "moria",
  "מיקה": "mika", "נטע": "neta", "נילי": "nili", "עמיחי": "amichai", "פרח": "perach", "קלרה": "clara",
  "שושנה": "shoshana", "שירלי": "shirley", "שלי": "shelly", "תאיר": "tair", "תאי": "tai", "אלינור": "elinor",
};

/** Letter-by-letter fallback for names missing from NAMES. */
export const LETTERS: Record<string, string> = {
  "א": "a", "ב": "b", "ג": "g", "ד": "d", "ה": "h", "ו": "v", "ז": "z", "ח": "ch", "ט": "t", "י": "y",
  "כ": "k", "ך": "ch", "ל": "l", "מ": "m", "ם": "m", "נ": "n", "ן": "n", "ס": "s", "ע": "a", "פ": "p", "ף": "f",
  "צ": "tz", "ץ": "tz", "ק": "k", "ר": "r", "ש": "sh", "ת": "t",
};

export function translitWord(word: string): string {
  const w = String(word || "").trim();
  if (!w) return "";
  if (/^[a-z0-9-]+$/i.test(w)) return w.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(NAMES, w)) {
    return NAMES[w];
  }
  let out = "";
  const ch = Array.from(w);
  ch.forEach((c, i) => {
    const last = i === ch.length - 1;
    const first = i === 0;
    if (c === "ו") out += first ? "v" : ch[i + 1] === "ו" ? "" : "o";
    else if (c === "י") out += first ? "y" : "i";
    else if (c === "ה" && last) out += "a";
    else if (/[0-9a-z]/i.test(c)) out += c.toLowerCase();
    else out += LETTERS[c] || "";
  });
  return out.replace(/(.)\1{2,}/g, "$1$1");
}

export const SLUG_MIN = 3;
export const SLUG_MAX = 40;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Full normalisation (use on blur / submit). Max 40 chars. */
export function normalizeSlug(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX);
}

/** Lenient clean-up while typing: keeps a trailing hyphen so "amit-" can become "amit-gal". */
export function sanitizeSlugInput(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-/, "")
    .slice(0, SLUG_MAX);
}

export function isValidSlugFormat(s: string): boolean {
  return typeof s === "string" && s.length >= SLUG_MIN && s.length <= SLUG_MAX && SLUG_RE.test(s);
}

export type LocalSlugStatus = "empty" | "short" | "long" | "invalid" | "ok";

/** Instant client-side check. "ok" still needs the API for taken / reserved. */
export function localSlugStatus(s: string): LocalSlugStatus {
  if (!s) return "empty";
  if (s.length < SLUG_MIN) return "short";
  if (s.length > SLUG_MAX) return "long";
  if (!SLUG_RE.test(s)) return "invalid";
  return "ok";
}

export function suggestSlug(ev: Pick<WizardEvent, "type" | "name1" | "name2" | "title" | "id">): string {
  let base: string;
  if (ev.type === "wedding" && ev.name1 && ev.name2) {
    base = `${translitWord(ev.name1)}-and-${translitWord(ev.name2)}`;
  } else {
    base = String(ev.title || "")
      .split(/[\s·]+/)
      .map(translitWord)
      .filter(Boolean)
      .join("-");
  }
  base = normalizeSlug(base);
  return base.length >= SLUG_MIN ? base : `event-${ev.id ?? "1"}`;
}

export const TYPE_WORD: Record<string, string> = {
  wedding: "wedding",
  barmitzvah: "bar-mitzvah",
  birthday: "birthday",
  brit: "brit",
  corporate: "event",
  party: "party",
  festival: "festival",
};

/** Candidate alternatives, unfiltered: check each against `hub/slug-check`. */
export function slugCandidates(slug: string, ev: Pick<WizardEvent, "type" | "name1" | "name2" | "date">): string[] {
  const year = (ev.date || "").slice(0, 4) || String(new Date().getFullYear() + 1);
  const n1 = translitWord(ev.name1 || "");
  const n2 = translitWord(ev.name2 || "");
  const c = [`${slug}-${year}`, `${slug}-${TYPE_WORD[ev.type] || "event"}`];
  if (ev.type === "wedding" && n1 && n2) c.unshift(`${n1}-and-${n2}`, `${n1}-${n2}-${year}`);
  c.push(`${slug}-2`);
  return Array.from(new Set(c.map(normalizeSlug))).filter((s) => s !== slug && isValidSlugFormat(s));
}

/** First 3 valid alternatives for which `isFree` is true (sync predicate; pass cached slug-check results). */
export function slugAlternatives(
  slug: string,
  ev: Pick<WizardEvent, "type" | "name1" | "name2" | "date">,
  isFree: (s: string) => boolean = () => true
): string[] {
  return slugCandidates(slug, ev).filter(isFree).slice(0, 3);
}

/* ------------------------------------------------------------------ */
/* Dates + titles                                                      */
/* ------------------------------------------------------------------ */

export function dateHe(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
  } catch {
    return iso;
  }
}

export function titleOf(ev: Pick<WizardEvent, "type" | "name1" | "name2" | "title">): string {
  if (ev.type === "wedding" && (ev.name1 || ev.name2)) {
    if (ev.name1 && ev.name2) return `${ev.name1} ו${ev.name2}`;
    return ev.name1 || ev.name2;
  }
  return ev.title || "";
}

function lastSunday(year: number, month: number): number {
  // month: 0-based. Day of month of the last Sunday.
  const last = new Date(Date.UTC(year, month + 1, 0));
  return last.getUTCDate() - last.getUTCDay();
}

/**
 * Israel offset for a local date/time: "+03:00" in summer time, else "+02:00".
 * Summer time runs from 02:00 on the Friday before the last Sunday of March
 * until 02:00 on the last Sunday of October.
 */
export function israelOffset(date: string, time = "12:00"): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || "");
  if (!m) return "+03:00";
  const y = Number(m[1]);
  const key = Number(m[2]) * 100 + Number(m[3]);
  const hour = Number((time || "12:00").slice(0, 2)) || 0;
  const startKey = 300 + (lastSunday(y, 2) - 2);
  const endKey = 1000 + lastSunday(y, 9);
  let summer: boolean;
  if (key > startKey && key < endKey) summer = true;
  else if (key === startKey) summer = hour >= 2;
  else if (key === endKey) summer = hour < 2;
  else summer = false;
  return summer ? "+03:00" : "+02:00";
}

/** ISO string with the Israel offset, e.g. 2027-06-10T19:00:00+03:00. */
export function eventDateIso(date: string, time: string): string {
  const t = /^\d{2}:\d{2}$/.test(time || "") ? time : "19:00";
  return `${date}T${t}:00${israelOffset(date, t)}`;
}

/* ------------------------------------------------------------------ */
/* State -> hub_config                                                 */
/* ------------------------------------------------------------------ */

type ThemeOut = Omit<HubTheme, "primary_color" | "secondary_color" | "font_family"> & {
  primary_color: string | null;
  secondary_color: string | null;
  font_family: string | null;
};

function isOn(state: WizardState, kind: string): boolean {
  const v = state.sections[kind];
  return v !== undefined ? !!v : isKindOnByDefault(kind);
}

/** Per-kind data patch merged over the template block's own data. */
function patchFor(block: HubBlock, kind: string, state: WizardState): Record<string, unknown> {
  const k = baseKind(kind);
  const ev = state.event;
  const v: KindContent | undefined = state.content[k];
  const data = block.data || {};
  const type = templateTypeOf(state.template_id);
  const patch: Record<string, unknown> = {};

  if (k === "people") {
    if (ev.type === "wedding" && block.type === "PEOPLE") {
      const old = arr(data.items);
      patch.items = [ev.name1, ev.name2]
        .filter(Boolean)
        .map((n, i) => ({ initials: Array.from(n)[0], name: n, role: str(old[i]?.role) }));
      patch.heading = titleOf(ev) || data.heading;
      patch.photos = [];
      patch.note = "";
    }
    return patch;
  }

  if (k === "map") {
    patch.location_name = ev.venue || str(data.location_name) || "המקום";
    patch.city = ev.city || str(data.city);
    if (v) {
      patch.note = v.note || "";
      patch.waze_url = v.waze ? v.waze : null;
      patch.google_maps_url = null;
    }
    return patch;
  }

  if (!v) return patch;

  switch (k) {
    case "story":
    case "parasha":
      patch.heading = v.heading || str(data.heading);
      patch.body = v.text || "";
      if (block.type === "STORY") patch.chapters = [{ title: "", body: v.text || "" }];
      break;
    case "wishes":
      patch.title = v.heading || str(data.title) || "ברכות";
      patch.message = v.text || "";
      // The gift link lives in its own section now.
      patch.gift_label = undefined;
      patch.gift_note = undefined;
      break;
    case "rsvp":
      patch.heading = v.heading || str(data.heading);
      patch.body = v.text || "";
      break;
    case "schedule": {
      const rows = (v.rows || []).filter((r) => r.time && r.label);
      if (!rows.length) break; // the API requires at least one complete row
      const titleKey = block.type === "LINEUP" ? "title" : "label";
      const extraKey = block.type === "LINEUP" ? "body" : "description";
      const oldByLabel = new Map(arr(data.items).map((i) => [str(i[titleKey]), str(i[extraKey])]));
      patch.items = rows.map((r) => {
        const row: Record<string, unknown> = { time: r.time, [titleKey]: r.label };
        const extra = oldByLabel.get(r.label || "");
        if (extra) row[extraKey] = extra;
        return row;
      });
      break;
    }
    case "dress":
      if (block.type === "CARDS" && (v.title || v.text)) {
        patch.items = [{ title: v.title || "", body: v.text || "" }];
      }
      break;
    case "gallery": {
      const imgs = (v.images || []).slice(0, 12);
      patch.images = imgs.map((im, i) => ({
        image: toImageRef(im, state.template_id || type, i),
        caption: "",
      }));
      const heading = str(data.heading);
      patch.heading = heading && !/דוגמה/.test(heading) ? heading : "רגעים שאנחנו אוהבים";
      patch.note = "";
      break;
    }
    case "faq":
      patch.items = (v.rows || []).filter((r) => r.q).map((r) => ({ q: r.q, a: r.a || "" }));
      break;
    case "gift": {
      patch.button = v.text || "למתנה";
      patch.url = v.url ? v.url : null;
      if (TEMPLATE_SAMPLE_RE.test(str(data.body))) patch.body = GIFT_BLOCK.data.body;
      break;
    }
    case "quote":
      patch.text = v.text || str(data.text);
      break;
    default:
      break;
  }
  return patch;
}

function mergeData(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = cloneJson(base || {});
  for (const [key, val] of Object.entries(patch)) {
    if (val === undefined) delete out[key];
    else out[key] = val;
  }
  return out;
}

function heroData(block: HubBlock | undefined, state: WizardState): Record<string, unknown> {
  const ev = state.event;
  const base = cloneJson(block?.data || {});
  const iso = ev.date ? eventDateIso(ev.date, ev.time) : str(base.event_date);
  return {
    ...base,
    kicker: TYPE_KICKER[ev.type] || str(base.kicker),
    title: titleOf(ev) || str(base.title) || "האירוע שלנו",
    event_date: iso,
    venue: ev.venue || "",
    city: ev.city || "",
    date_he: dateHe(ev.date) || str(base.date_he),
    time_he: ev.time || str(base.time_he),
  };
}

function themeFor(state: WizardState, templateTheme?: HubTheme | null): ThemeOut {
  const pal = PALETTES.find((p) => p.id === state.theme.palette_id) || PALETTES[0];
  const font = FONTS.find((f) => f.id === state.theme.font_id);
  const base: Partial<HubTheme> = templateTheme ? cloneJson(templateTheme) : {};
  const theme = {
    ...base,
    palette_id: pal.id,
    primary_color: pal.a,
    secondary_color: pal.b,
    font_family: font ? font.family : null,
  } as ThemeOut;
  // theme.colors.* wins over theme.primary_color in the renderer, so keep them in step.
  if (pal.a && pal.b && theme.colors) {
    theme.colors = { ...theme.colors, primary: pal.a, secondary: pal.b };
  }
  return theme;
}

/**
 * Wizard state -> hub_config.
 *
 * @param state wizard state
 * @param templateDefaultBlocks the chosen template's default hub config blocks (ids/types preserved)
 * @param templateTheme optional default theme of the template; keeps background_type, cover, scale
 */
export function toHubConfig(
  state: WizardState,
  templateDefaultBlocks: HubBlock[],
  templateTheme?: HubTheme | null
): HubConfig {
  const type = templateTypeOf(state.template_id);
  const hasGift = templateDefaultBlocks.some((b) => b.type === "GIFT");
  const giftWanted = giftEligible(type) && !hasGift && ("gift" in state.sections || state.order.includes("gift"));
  const source = giftWanted ? ensureGiftBlock(templateDefaultBlocks, type) : templateDefaultBlocks;

  const heroBlock = source.find(isHero);
  const footers = source.filter(isFooter);
  const pairs = templateKinds(source);
  const order = normalizeOrder(state.order, pairs.map((p) => p.kind));
  const byKind = new Map(pairs.map((p) => [p.kind, p.block]));
  const followers = source.filter((b) => isUploadFollower(b, source));
  const uploadKind = pairs.find((p) => p.block.type === "STEPS")?.kind;

  const out: HubBlock[] = [
    {
      id: heroBlock?.id || "hero",
      type: "HERO_COUNTDOWN",
      enabled: true,
      order: 1,
      data: heroData(heroBlock, state),
    },
  ];

  for (const kind of order) {
    const block = byKind.get(kind);
    if (!block) continue;
    const on = isOn(state, kind);
    out.push({
      id: block.id,
      type: block.type,
      enabled: on,
      order: out.length + 1,
      data: mergeData(block.data, patchFor(block, kind, state)),
    });
    if (kind === uploadKind) {
      for (const f of followers) {
        out.push({ id: f.id, type: f.type, enabled: on, order: out.length + 1, data: cloneJson(f.data) });
      }
    }
  }

  for (const f of footers) {
    out.push({ id: f.id, type: f.type, enabled: true, order: out.length + 1, data: cloneJson(f.data) });
  }

  return {
    template_id: state.template_id,
    theme: themeFor(state, templateTheme) as unknown as HubTheme,
    blocks: out,
  };
}

/* ------------------------------------------------------------------ */
/* hub_config -> state                                                 */
/* ------------------------------------------------------------------ */

const EVENT_TYPE_ALIASES: Record<string, string> = {
  bar_mitzvah: "barmitzvah",
  "bar-mitzvah": "barmitzvah",
  bat_mitzvah: "barmitzvah",
  "bat-mitzvah": "barmitzvah",
  bnei_mitzvah: "barmitzvah",
  company: "corporate",
  business: "corporate",
};

/** Event row type -> wizard type (lower-cased, aliases resolved); falls back to the template's type. */
export function normalizeEventType(raw: string | null | undefined, fallback: string): string {
  const v = String(raw || "").trim().toLowerCase();
  if (!v) return fallback;
  const mapped = EVENT_TYPE_ALIASES[v] || v;
  return mapped in TYPE_KICKER ? mapped : fallback;
}

function splitDateTime(raw: unknown): { date: string; time: string } {
  const m = /(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(str(raw));
  if (m) return { date: m[1], time: m[2] };
  const d = /(\d{4}-\d{2}-\d{2})/.exec(str(raw));
  return { date: d ? d[1] : "", time: "" };
}

function splitNames(title: string, names: unknown): { name1: string; name2: string } {
  if (Array.isArray(names)) {
    const [a, b] = names.map((n) => String(n || ""));
    if (a || b) return { name1: a || "", name2: b || "" };
  }
  const m = /^(.+?) ו(.+)$/.exec(title.trim());
  return m ? { name1: m[1], name2: m[2] } : { name1: title.trim(), name2: "" };
}

function imageFromItem(item: Record<string, unknown>): WizardImage | null {
  const ref = (item.image && typeof item.image === "object" ? item.image : item) as Record<string, unknown>;
  if (ref.asset_id != null && ref.asset_id !== "") {
    const img: WizardImage = { asset_id: ref.asset_id as number | string };
    if (typeof ref.url === "string") img.url = ref.url;
    if (typeof ref.thumb_url === "string") img.thumb_url = ref.thumb_url;
    return img;
  }
  if (typeof ref.stock === "string" && ref.stock) return { stock: ref.stock };
  if (ref.type === "stock" && typeof ref.key === "string") return { stock: ref.key };
  return null;
}

function readContent(pairs: KindPair[], base: WizardContent): WizardContent {
  const content: WizardContent = cloneJson(base);
  for (const { kind, block } of pairs) {
    const k = baseKind(kind);
    if (kind !== k) continue; // duplicated kinds share the first block's content
    const d = block.data || {};
    switch (k) {
      case "story": {
        const chapters = arr(d.chapters).map((c) => str(c.body)).filter(Boolean);
        content.story = {
          heading: str(d.heading) || content.story?.heading,
          text: chapters.length ? chapters.join("\n\n") : str(d.body) || content.story?.text,
        };
        break;
      }
      case "parasha":
        content.parasha = { heading: str(d.heading) || content.parasha?.heading, text: str(d.body) || content.parasha?.text };
        break;
      case "schedule": {
        const rows = arr(d.items).map((i) => ({ time: str(i.time), label: str(i.label) || str(i.title) }));
        if (rows.length) content.schedule = { rows };
        break;
      }
      case "dress": {
        const first = arr(d.items)[0];
        if (first && block.id === "dress") content.dress = { title: str(first.title), text: str(first.body) };
        break;
      }
      case "gallery": {
        const images = arr(d.images).map(imageFromItem).filter((x): x is WizardImage => !!x);
        content.gallery = { images };
        break;
      }
      case "map":
        content.map = { note: str(d.note), waze: str(d.waze_url) };
        break;
      case "faq": {
        const rows = arr(d.items).map((i) => ({ q: str(i.q), a: str(i.a) }));
        if (rows.length) content.faq = { rows };
        break;
      }
      case "gift":
        content.gift = { text: str(d.button) || content.gift?.text, url: str(d.url) };
        break;
      case "wishes":
        content.wishes = { heading: str(d.title) || content.wishes?.heading, text: str(d.message) || content.wishes?.text };
        break;
      case "rsvp":
        content.rsvp = { heading: str(d.heading) || content.rsvp?.heading, text: str(d.body) || content.rsvp?.text };
        break;
      case "quote":
        content.quote = { text: str(d.text) || content.quote?.text };
        break;
      default:
        break;
    }
  }
  return content;
}

export interface FromHubOptions {
  slug?: string | null;
  is_published?: boolean;
}

/**
 * Hydrate the wizard from a saved hub_config.
 * Hero data wins over the event row; the event row fills what the hero lacks.
 */
export function fromHubConfig(
  hubConfig: HubConfig,
  eventPrefill: EventPrefill | null | undefined,
  eventId?: string | number | null,
  opts: FromHubOptions = {}
): WizardState {
  const template_id = hubConfig.template_id;
  const tType = templateTypeOf(template_id);
  const allBlocks = [...(hubConfig.blocks || [])].sort((a, b) => a.order - b.order);
  const hero = allBlocks.find(isHero);
  const hd = hero?.data || {};
  const prefill = eventPrefill || {};

  const type = normalizeEventType(prefill.event_type, tType in TYPE_KICKER ? tType : "party");
  const heroTitle = str(hd.title);
  const title = heroTitle || str(prefill.name);
  const { date, time } = splitDateTime(hd.event_date || prefill.starts_at);
  const names = type === "wedding" ? splitNames(title, hd.names) : { name1: "", name2: "" };

  const event: WizardEvent = {
    type,
    name1: names.name1,
    name2: names.name2,
    title: type === "wedding" ? titleOf({ type, ...names, title }) || title : title,
    date,
    time: time || "19:00",
    venue: str(hd.venue) || str(hd.venue_name),
    city: str(hd.city) || str(hd.venue_city),
    id: eventId ?? undefined,
  };

  const source = ensureGiftBlock(allBlocks, tType);
  const pairs = templateKinds(source);
  const kinds = pairs.map((p) => p.kind);

  // Saved order: kinds of the stored blocks only (a gift added by ensureGiftBlock slots in beside its neighbours).
  const savedKinds = templateKinds(allBlocks).map((p) => p.kind);
  const order = normalizeOrder(savedKinds, kinds);

  const sections: Record<string, boolean> = {};
  const savedPairs = templateKinds(allBlocks);
  for (const { kind, block } of savedPairs) {
    if (block.enabled !== isKindOnByDefault(kind)) sections[kind] = block.enabled;
  }

  const content = readContent(pairs, defaultContent(source, event, tType));

  const pal = PALETTES.find((p) => p.id === hubConfig.theme?.palette_id)
    || PALETTES.find((p) => p.a && p.a === hubConfig.theme?.primary_color && p.b === hubConfig.theme?.secondary_color)
    || PALETTES[0];
  const font = FONTS.find((f) => f.family === hubConfig.theme?.font_family);

  const slug = opts.slug ? String(opts.slug) : suggestSlug(event);
  return {
    template_id,
    event,
    sections,
    order,
    content,
    theme: { palette_id: pal.id, font_id: font ? font.id : null },
    slug,
    slugTouched: !!opts.slug,
    is_published: !!opts.is_published,
  };
}
