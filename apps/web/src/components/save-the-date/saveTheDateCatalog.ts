/* Port of save-the-date-mock/js/std-data.js, plus defaultStyleFor(). */
export type StyleId =
  | "envelope"
  | "calendar"
  | "minimal"
  | "polaroid"
  | "neon"
  | "botanical"
  | "scratch"
  | "boarding";

export type StdKind = "wedding" | "barmitzvah" | "birthday" | "brit" | "other";

export type StyleOpts = { accent: string } & Record<string, boolean | string>;

export interface StyleAccent {
  id: string;
  he: string;
  acc: string;
  bg: string;
  bg2: string;
  foil?: [string, string];
}

export interface StyleOption {
  id: string;
  he: string;
  type: "toggle";
  def: boolean;
}

export interface StyleDef {
  id: StyleId;
  he: string;
  desc: string;
  fx: string;
  fonts: string[];
  demo: string;
  accents: StyleAccent[];
  options: StyleOption[];
}

export interface StdContent {
  kind: StdKind;
  a: string;
  b: string;
  title: string;
  sub: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  line: string;
  photo: string | null;
}

export interface StdShow {
  countdown: boolean;
  calendar: boolean;
  whatsapp: boolean;
  line: boolean;
  venue: boolean;
  hebdate: boolean;
  footer: boolean;
}

export interface StdCfg {
  style: StyleId;
  styleOpts: StyleOpts;
  content: StdContent;
  show: StdShow;
  slug: string;
}

export const STYLES: StyleDef[] = [
  { id: "envelope", he: "מעטפה", desc: "לוחצים על החותם, המעטפה נפתחת והכרטיס עולה", fx: "פתיחת מעטפה",
    fonts: ["Frank Ruhl Libre", "Assistant"], demo: "wedding",
    accents: [
      { id: "bordeaux", he: "בורדו", acc: "#8E2F3C", bg: "#F4E6E0", bg2: "#E9D2CA" },
      { id: "sage", he: "מרווה", acc: "#4F6B57", bg: "#E8EDE4", bg2: "#D5DECF" },
      { id: "navy", he: "נייבי", acc: "#22355B", bg: "#E5E8EF", bg2: "#CFD6E3" },
      { id: "gold", he: "זהב", acc: "#9A7330", bg: "#F3ECDF", bg2: "#E6DAC4" }
    ],
    options: [{ id: "liner", he: "בטנה מעוטרת במעטפה", type: "toggle", def: true },
              { id: "confetti", he: "קונפטי בפתיחה", type: "toggle", def: true }] },
  { id: "calendar", he: "לוח שנה", desc: "דף לוח נתלש, והתאריך מסומן בעיגול", fx: "דף נתלש + עיגול מצויר",
    fonts: ["Suez One", "Rubik"], demo: "wedding",
    accents: [
      { id: "red", he: "אדום", acc: "#D2453B", bg: "#EFE6D8", bg2: "#E2D5C1" },
      { id: "teal", he: "טורקיז", acc: "#1F7A78", bg: "#E4ECE9", bg2: "#CFDDD8" },
      { id: "ink", he: "דיו", acc: "#2B2B33", bg: "#ECE9E3", bg2: "#DCD7CE" },
      { id: "mustard", he: "חרדל", acc: "#C98A12", bg: "#F2EADB", bg2: "#E6D8BD" }
    ],
    options: [{ id: "grid", he: "חודש מלא ליד התאריך", type: "toggle", def: false }] },
  { id: "minimal", he: "מינימלי", desc: "ספרות ענקיות, ושום דבר מיותר", fx: "ספרות שעולות",
    fonts: ["Heebo"], demo: "birthday",
    accents: [
      { id: "black", he: "שחור", acc: "#111111", bg: "#F5F2EC", bg2: "#E9E4DA" },
      { id: "tomato", he: "עגבניה", acc: "#E2462F", bg: "#F5F2EC", bg2: "#E9E4DA" },
      { id: "cobalt", he: "כחול", acc: "#2747D6", bg: "#F3F3F1", bg2: "#E4E4E0" },
      { id: "olive", he: "זית", acc: "#6B7A2A", bg: "#F4F1E8", bg2: "#E6E1D2" }
    ],
    options: [{ id: "dark", he: "מצב כהה", type: "toggle", def: false }] },
  { id: "polaroid", he: "פולרואיד", desc: "תמונה מודפסת עם תאריך בכתב יד", fx: "תמונה שמתפתחת",
    fonts: ["Amatic SC", "Varela Round"], demo: "wedding",
    accents: [
      { id: "kraft", he: "קרפט", acc: "#B5651D", bg: "#E9DCC6", bg2: "#DCCAAE" },
      { id: "rose", he: "ורוד", acc: "#D0567A", bg: "#F2E2E2", bg2: "#E6CFCF" },
      { id: "sky", he: "תכלת", acc: "#3E7CB1", bg: "#E1E9EF", bg2: "#CCD9E3" },
      { id: "mint", he: "מנטה", acc: "#2F9B7A", bg: "#E2EEE8", bg2: "#CDE1D7" }
    ],
    options: [{ id: "photo", he: "תמונה בפולרואיד", type: "toggle", def: true }] },
  { id: "neon", he: "ניאון לילה", desc: "שלט ניאון שנדלק, למסיבה ולבר/בת מצווה", fx: "ניאון מהבהב",
    fonts: ["Karantina", "Rubik"], demo: "mitzva",
    accents: [
      { id: "pink", he: "ורוד", acc: "#FF3EA5", bg: "#14101C", bg2: "#221A2E" },
      { id: "cyan", he: "ציאן", acc: "#28E7FF", bg: "#0E141C", bg2: "#18222E" },
      { id: "lime", he: "ליים", acc: "#B6FF3B", bg: "#10150E", bg2: "#1B2318" },
      { id: "violet", he: "סגול", acc: "#B67CFF", bg: "#130F1E", bg2: "#211A33" }
    ],
    options: [{ id: "flicker", he: "הבהוב בכניסה", type: "toggle", def: true }] },
  { id: "botanical", he: "בוטני", desc: "פרחים בצבעי מים בפינות, עדין ורומנטי", fx: "עלי כותרת נושרים",
    fonts: ["Bellefair", "Assistant"], demo: "wedding",
    accents: [
      { id: "blush", he: "סומק", acc: "#B8606E", bg: "#FBF8F2", bg2: "#F1EADF" },
      { id: "eucalyptus", he: "אקליפטוס", acc: "#4E7466", bg: "#FAF9F4", bg2: "#ECEEE5" },
      { id: "peach", he: "אפרסק", acc: "#C7744B", bg: "#FCF8F1", bg2: "#F3E9DB" }
    ],
    options: [{ id: "petals", he: "עלי כותרת נושרים", type: "toggle", def: true }] },
  { id: "scratch", he: "גרדו וגלו", desc: "מגרדים את הכרטיס כדי לגלות את התאריך", fx: "גירוד + קונפטי",
    fonts: ["Secular One", "Rubik"], demo: "batmitzva",
    accents: [
      { id: "gold", he: "זהב", acc: "#C9962B", bg: "#FFE9D6", bg2: "#FFD3E1", foil: ["#E9C46A", "#B8862B"] },
      { id: "silver", he: "כסף", acc: "#5B5BD6", bg: "#E5E8FF", bg2: "#D9F2FF", foil: ["#D9DEE6", "#9AA3B2"] },
      { id: "rose", he: "רוז גולד", acc: "#C2577A", bg: "#FFE4EC", bg2: "#FFF0DA", foil: ["#F0B8A8", "#C98274"] }
    ],
    options: [{ id: "confetti", he: "קונפטי בגילוי", type: "toggle", def: true }] },
  { id: "boarding", he: "כרטיס טיסה", desc: "כרטיס עלייה למטוס, לחתונה בחו\"ל או סתם בכיף", fx: "מטוס שממריא",
    fonts: ["Rubik", "Rubik"], demo: "destination",
    accents: [
      { id: "ocean", he: "אוקיינוס", acc: "#0F6E8C", bg: "#DCEFF2", bg2: "#F6E7D4" },
      { id: "sunset", he: "שקיעה", acc: "#E0603A", bg: "#FBE6D6", bg2: "#F7D2C2" },
      { id: "jet", he: "שחור", acc: "#1D2430", bg: "#E7E9EC", bg2: "#D6DAE0" }
    ],
    options: [{ id: "photo", he: "תמונת יעד ברקע", type: "toggle", def: true }] }
];

export const BASE_SHOW: StdShow = {
  countdown: true,
  calendar: true,
  whatsapp: true,
  line: true,
  venue: true,
  hebdate: true,
  footer: true,
};

const DEFAULT_STYLE_BY_TYPE: Record<string, StyleId> = {
  wedding: "envelope",
  barmitzvah: "polaroid",
  birthday: "minimal",
  brit: "botanical",
  corporate: "calendar",
  party: "neon",
  festival: "neon",
  other: "envelope",
};

export function defaultStyleFor(eventType?: string | null): StyleId {
  const key = String(eventType || "").trim().toLowerCase();
  return DEFAULT_STYLE_BY_TYPE[key] || "envelope";
}

export function styleById(id?: string | null): StyleDef {
  return STYLES.find((s) => s.id === id) || STYLES[0];
}

export function defaultsFor(id: string): StyleOpts {
  const s = styleById(id);
  const o: StyleOpts = { accent: s.accents[0].id };
  s.options.forEach((x) => {
    o[x.id] = x.def;
  });
  return o;
}

export const ASSET_BASE = "/save-the-date";
