/** Shared trivia MVP types and UI metadata (10 playable types). */

export const TRIVIA_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו"] as const;
export const TRIVIA_LETTER_COLORS = [
  "#DC5B66",
  "#C9A36A",
  "#1F6F6A",
  "#6E4A8A",
  "#E8893A",
  "#8B4CCF",
] as const;

export const TRIVIA_QUESTION_CAP = 40;

export type TriviaPace = "host" | "auto" | "free";
export type TriviaThemeId =
  | "elegant"
  | "neon"
  | "cinema"
  | "arcade"
  | "playful"
  | "festival"
  | "corporate";
export type TriviaTeamsMode = "none" | "sides" | "tables";
export type TriviaCurrentPhase =
  | "lobby"
  | "question"
  | "reveal"
  | "leaderboard"
  | "photos"
  | "podium";
export type TriviaStatus = "draft" | "scheduled" | "live" | "results";
export type TriviaLegacyPhase = "photos" | "live" | "results";

export type TriviaMvpType =
  | "choice"
  | "multi"
  | "truefalse"
  | "who"
  | "whosaid"
  | "poll"
  | "thisorthat"
  | "twothruths"
  | "number"
  | "photo"
  | "buzzer"
  | "tugofwar"
  | "blur"
  | "spotdiff"
  | "video"
  | "cloud"
  | "rate"
  | "finish"
  | "date"
  | "order"
  | "map"
  | "match"
  | "fillblank"
  | "emoji"
  | "audio";

export type TriviaTypeGroupId =
  | "quiz"
  | "couple"
  | "photos"
  | "opinions"
  | "creative";

export interface TriviaTypeMeta {
  id: TriviaMvpType | string;
  group: TriviaTypeGroupId;
  label: string;
  short: string;
  desc: string;
  ico: string;
  bg: string;
  soon?: boolean;
  mvp: boolean;
}

export const TRIVIA_TYPE_GROUPS: { id: TriviaTypeGroupId; label: string }[] = [
  { id: "quiz", label: "חידון" },
  { id: "couple", label: "על בני הזוג" },
  { id: "photos", label: "תמונות מהאלבום" },
  { id: "opinions", label: "דעות והצבעות" },
  { id: "creative", label: "יצירתי" },
];

/** Gallery catalog: all types are playable. */
export const TRIVIA_TYPE_CATALOG: TriviaTypeMeta[] = [
  { id: "choice", group: "quiz", ico: "אב", bg: "#fde8ea", label: "בחירה", short: "בחירה", desc: "כמה תשובות, אחת נכונה", mvp: true },
  { id: "multi", group: "quiz", ico: "✔✔", bg: "#f6ecd4", label: "כמה נכונות", short: "כמה נכונות", desc: "יותר מתשובה אחת נכונה", mvp: true },
  { id: "truefalse", group: "quiz", ico: "נ/ל", bg: "#e6f0ee", label: "נכון או לא", short: "נכון / לא", desc: "שתי אפשרויות ברורות", mvp: true },
  { id: "twothruths", group: "quiz", ico: "②①", bg: "#f8e6f0", label: "שתי אמיתות ושקר", short: "שתי אמיתות", desc: "שלושה משפטים — מצאו את השקר", mvp: true },
  { id: "buzzer", group: "quiz", ico: "●", bg: "#fde0e3", label: "באזר", short: "באזר", desc: "הראשון שלוחץ עונה", mvp: true },
  { id: "who", group: "couple", ico: "ע/ג", bg: "#e7f0e4", label: "מי יותר סביר", short: "מי יותר סביר", desc: "עמית מול גל, עם תשובה נכונה", mvp: true },
  { id: "whosaid", group: "couple", ico: "❝", bg: "#f6ecd4", label: "מי אמר/ה", short: "מי אמר/ה", desc: "ציטוט — מי אמר אותו", mvp: true },
  { id: "thisorthat", group: "couple", ico: "⇄", bg: "#fde8ea", label: "זה או זה", short: "זה או זה", desc: "בחירה מהירה בין שתי אפשרויות", mvp: true },
  { id: "tugofwar", group: "couple", ico: "━", bg: "#eee6f6", label: "משיכת חבל", short: "משיכת חבל", desc: "הצבעה חיה, עמית מול גל", mvp: true },
  { id: "photo", group: "photos", ico: "▣", bg: "#efe8dc", label: "שאלת תמונה", short: "תמונה", desc: "שאלה על תמונה מהאלבום החי", mvp: true },
  { id: "blur", group: "photos", ico: "◌", bg: "#e8eef4", label: "תמונה מתגלה", short: "מתגלה", desc: "התמונה מתחדדת לאט — נחשו מהר", mvp: true },
  { id: "spotdiff", group: "photos", ico: "◎", bg: "#f6ecd4", label: "מצא את ההבדל", short: "ההבדל", desc: "שתי תמונות מהאלבום, כמה הבדלים", mvp: true },
  { id: "video", group: "photos", ico: "▶", bg: "#fde8ea", label: "שאלת וידאו", short: "וידאו", desc: "קטע קצר מהאלבום", mvp: true },
  { id: "poll", group: "opinions", ico: "▌", bg: "#e6f0ee", label: "סקר", short: "סקר", desc: "בלי תשובה נכונה, רק דעה", mvp: true },
  { id: "cloud", group: "opinions", ico: "☁", bg: "#e8eef4", label: "ענן מילים", short: "ענן מילים", desc: "תשובה חופשית שעולה למסך", mvp: true },
  { id: "rate", group: "opinions", ico: "10", bg: "#f6ecd4", label: "דירוג", short: "דירוג", desc: "מ־1 עד 10", mvp: true },
  { id: "finish", group: "opinions", ico: "…", bg: "#f8e6f0", label: "השלימו את המשפט", short: "השלימו", desc: "פתיח קבוע, סיום של האורחים", mvp: true },
  { id: "number", group: "creative", ico: "123", bg: "#e7f0e4", label: "נחש מספר", short: "מספר", desc: "סליידר — הקרוב ביותר מנצח", mvp: true },
  { id: "date", group: "creative", ico: "📅", bg: "#efe8dc", label: "נחשו את התאריך", short: "תאריך", desc: "בחירת תאריך — הקרוב מנצח", mvp: true },
  { id: "order", group: "creative", ico: "1–4", bg: "#e8eef4", label: "סדר נכון", short: "סדר", desc: "לסדר אירועים על ציר זמן", mvp: true },
  { id: "map", group: "creative", ico: "📍", bg: "#e6f0ee", label: "נעץ על המפה", short: "מפה", desc: "איפה זה קרה — הקרוב מנצח", mvp: true },
  { id: "match", group: "creative", ico: "⟷", bg: "#eee6f6", label: "התאמת זוגות", short: "התאמה", desc: "לחבר פריטים ששייכים זה לזה", mvp: true },
  { id: "fillblank", group: "creative", ico: "א_", bg: "#f6ecd4", label: "אריחי אותיות", short: "אריחים", desc: "השלימו מילה מאותיות מעורבבות", mvp: true },
  { id: "emoji", group: "creative", ico: "🗼", bg: "#fde8ea", label: "חידת אימוג׳י", short: "אימוג׳י", desc: "לנחש שיר, סרט או מקום", mvp: true },
  { id: "audio", group: "creative", ico: "♪", bg: "#e8eef4", label: "שיר / שמע", short: "שיר", desc: "קטע שמע מהאלבום — נחשו מה שומעים", mvp: true },
];

export const TRIVIA_MVP_TYPES = TRIVIA_TYPE_CATALOG.filter((t) => t.mvp).map(
  (t) => t.id as TriviaMvpType
);

export const TRIVIA_THEMES: {
  id: TriviaThemeId | string;
  name: string;
  for: string;
  sw: string;
  sw2: string;
  mvp: boolean;
}[] = [
  { id: "elegant", name: "אלגנטי", for: "חתונות ואירועים שקטים", sw: "#F3EEE6", sw2: "#C9A36A", mvp: true },
  { id: "neon", name: "ניאון", for: "מסיבות ולילה בתל אביב", sw: "#E24B8D", sw2: "#3DF0FF", mvp: true },
  { id: "cinema", name: "קולנוע", for: "שאלות תמונה ומסך גדול", sw: "#1A1410", sw2: "#C9A36A", mvp: true },
  { id: "arcade", name: "ארקייד", for: "בר ובת מצווה", sw: "#0C1A18", sw2: "#D4B15A", mvp: true },
  { id: "playful", name: "משחקי", for: "ימי הולדת, ברית ובריתה", sw: "#E36B7A", sw2: "#8FB37A", mvp: true },
  { id: "festival", name: "פסטיבל", for: "שקיעה, במה ואורות", sw: "#C45A1A", sw2: "#8A4DFF", mvp: true },
  { id: "corporate", name: "עסקי", for: "חברות ואירועי צוות", sw: "#10141A", sw2: "#6E8BA8", mvp: true },
];

export function triviaTypeMeta(id: string): TriviaTypeMeta | undefined {
  return TRIVIA_TYPE_CATALOG.find((t) => t.id === id);
}

export function triviaTypeLabel(id: string): string {
  return triviaTypeMeta(id)?.label || id;
}

export function isUnscoredType(type: string): boolean {
  return (
    type === "poll" ||
    type === "thisorthat" ||
    type === "tugofwar" ||
    type === "cloud" ||
    type === "rate" ||
    type === "finish"
  );
}

export function isTwoCardType(type: string): boolean {
  return (
    type === "who" ||
    type === "whosaid" ||
    type === "thisorthat" ||
    type === "tugofwar"
  );
}

/** Types that attach a media asset (photo / video / audio). */
export function isMediaType(type: string): boolean {
  return (
    type === "photo" ||
    type === "blur" ||
    type === "spotdiff" ||
    type === "video" ||
    type === "audio"
  );
}

/** Free-text answer types (no options). */
export function isFreeTextType(type: string): boolean {
  return type === "cloud" || type === "finish" || type === "fillblank";
}

/** "Closest wins" types (no options). */
export function isClosestType(type: string): boolean {
  return type === "number" || type === "date" || type === "map";
}

export function isOrderType(type: string): boolean {
  return type === "order";
}

export function isMatchType(type: string): boolean {
  return type === "match";
}

export function isRateType(type: string): boolean {
  return type === "rate";
}

export function isBuzzerType(type: string): boolean {
  return type === "buzzer";
}

/** Types that carry no option rows at all. */
function hasNoOptions(type: string): boolean {
  return (
    isFreeTextType(type) ||
    isClosestType(type) ||
    isRateType(type)
  );
}

export function defaultOptionsForType(type: string): { label: string; is_correct: boolean }[] {
  if (hasNoOptions(type)) {
    return [];
  }
  if (type === "order" || type === "match") {
    // order: correct order = sort order; match: left-side labels.
    return [
      { label: "", is_correct: true },
      { label: "", is_correct: true },
      { label: "", is_correct: true },
      { label: "", is_correct: true },
    ];
  }
  if (type === "truefalse") {
    return [
      { label: "נכון", is_correct: true },
      { label: "לא נכון", is_correct: false },
    ];
  }
  if (type === "who" || type === "whosaid") {
    return [
      { label: "עמית", is_correct: true },
      { label: "גל", is_correct: false },
    ];
  }
  if (type === "thisorthat" || type === "tugofwar") {
    return [
      { label: "אפשרות א", is_correct: false },
      { label: "אפשרות ב", is_correct: false },
    ];
  }
  if (type === "twothruths") {
    return [
      { label: "אמת ראשונה", is_correct: false },
      { label: "השקר", is_correct: true },
      { label: "אמת שנייה", is_correct: false },
    ];
  }
  if (type === "poll") {
    return [
      { label: "", is_correct: false },
      { label: "", is_correct: false },
      { label: "", is_correct: false },
      { label: "", is_correct: false },
    ];
  }
  return [
    { label: "", is_correct: true },
    { label: "", is_correct: false },
    { label: "", is_correct: false },
    { label: "", is_correct: false },
  ];
}

export function defaultConfigForType(type: string): Record<string, unknown> | null {
  if (type === "number") {
    return { min: 0, max: 100, correct: 50, unit: "" };
  }
  if (type === "who" || type === "whosaid") {
    return {
      sides: [
        { name: "עמית", color: "#1F6F6A", initial: "ע" },
        { name: "גל", color: "#DC5B66", initial: "ג" },
      ],
    };
  }
  if (type === "thisorthat" || type === "tugofwar") {
    return {
      sides: [
        { name: "אפשרות א", color: "#1F6F6A", initial: "א" },
        { name: "אפשרות ב", color: "#6E4A8A", initial: "ב" },
      ],
    };
  }
  if (type === "rate") {
    return { min: 1, max: 10 };
  }
  if (type === "date") {
    // Server stores the answer as a YYYYMMDD number.
    return { correct: 20190615 };
  }
  if (type === "finish") {
    return { prefix: "הכי משוגע באירוע זה ש…" };
  }
  if (type === "fillblank") {
    return { answer: "אהבה", letters: "אהבהקרשן" };
  }
  if (type === "map") {
    return { correct_x: 50, correct_y: 50, label: "המקום" };
  }
  if (type === "match") {
    // options = left labels; right_labels[i] is the i-th right label;
    // correct_map[leftIndex] = rightIndex (same keys the server reads).
    return {
      right_labels: ["", "", "", ""],
      correct_map: [0, 1, 2, 3],
    };
  }
  return null;
}

export interface TriviaOptionDto {
  id?: number;
  label: string;
  is_correct?: boolean;
  sort_order?: number;
}

export type TriviaMediaKind = "image" | "video" | "audio";

export interface TriviaMediaDto {
  id: number;
  url: string | null;
  kind?: TriviaMediaKind | string;
}

/** What a guest has entered; sent as the answer body. */
export interface TriviaGuestDraft {
  option_ids: number[];
  value_number?: number;
  value_text?: string;
  value_json?: Record<string, unknown>;
}

export interface TriviaQuestionDto {
  id?: number;
  type: string;
  prompt: string;
  fun_fact?: string | null;
  media_asset_id?: number | null;
  media?: TriviaMediaDto | null;
  config?: Record<string, unknown> | null;
  sort_order?: number;
  time_limit_seconds: number;
  max_points: number;
  options: TriviaOptionDto[];
  index?: number;
  total?: number;
  started_at?: string | null;
  served_at?: string | null;
  selection_mode?: "single" | "multiple";
}

export interface TriviaPlayerCard {
  rank: number;
  nickname: string;
  avatar_url?: string | null;
  team?: string | null;
  score: number;
}

export interface TriviaTallies {
  mode: "options" | "number" | "date" | "map" | "words" | "rate";
  total_answers?: number;
  options?: { option_id: number; count: number; percent: number }[];
  /** number/date: value; map: x/y (0–100). */
  guesses?: {
    player_id: number;
    value?: number | null;
    x?: number;
    y?: number;
    nickname?: string;
  }[];
  words?: { text: string; count: number }[];
  average?: number | null;
  min?: number;
  max?: number;
  distribution?: { value: number; count: number }[];
}

export interface TriviaClosest {
  nickname: string;
  value?: number;
  x?: number;
  y?: number;
  distance?: number;
  avatar_url?: string | null;
}

export interface TriviaTeamsPayload {
  mode: "sides" | "tables" | string;
  labels?: { a: string; b: string } | null;
  scores?: { a: number; b: number };
  tables?: { team: string; score: number; players: number }[];
}

export interface TriviaScreenPayload {
  phase: TriviaLegacyPhase;
  current_phase?: TriviaCurrentPhase | string | null;
  theme?: string | null;
  pace?: TriviaPace | string | null;
  title?: string | null;
  player_count?: number;
  join_path?: string;
  top?: TriviaPlayerCard[];
  joining?: { nickname: string; avatar_url?: string | null; team?: string | null }[];
  teams?: TriviaTeamsPayload | null;
  prize_text?: string | null;
  question?: TriviaQuestionDto | null;
  tallies?: TriviaTallies | null;
  fun_fact?: string | null;
  correct?: {
    option_ids?: number[];
    number?: number | null;
    date?: number | string | null;
    x?: number | null;
    y?: number | null;
    answer?: string | null;
    alternates?: string[];
    pairs?: { left_id: number; right_id: number }[];
    right_labels?: string[];
    winner?: { nickname: string; elapsed_ms?: number; avatar_url?: string | null } | null;
    closest?: TriviaClosest | null;
  } | null;
  server_now?: string;
  event_name?: string | null;
}

const KNOWN_THEME_IDS = TRIVIA_THEMES.map((t) => String(t.id));

/** Map an API theme id to a known stage theme (falls back to elegant). */
export function normalizeTriviaTheme(id: string | null | undefined): string {
  return id && KNOWN_THEME_IDS.includes(id) ? id : "elegant";
}

/** YYYYMMDD number (or ISO yyyy-mm-dd string) -> ISO yyyy-mm-dd, or "". */
export function dateToIso(value: unknown): string {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  return "";
}

/** ISO yyyy-mm-dd -> YYYYMMDD number, or null when invalid. */
export function isoToDateNumber(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso || "").trim());
  if (!m) return null;
  return Number(`${m[1]}${m[2]}${m[3]}`);
}

/** Hebrew display for a YYYYMMDD number / ISO date. */
export function formatTriviaDate(value: unknown): string {
  const iso = dateToIso(value);
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.${y}`;
}
