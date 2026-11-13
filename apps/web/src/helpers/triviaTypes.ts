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
export type TriviaThemeId = "elegant" | "neon";
export type TriviaTeamsMode = "none" | "sides";
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
  | "photo";

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

/** Gallery catalog: MVP types + Phase 2 shown as בקרוב. */
export const TRIVIA_TYPE_CATALOG: TriviaTypeMeta[] = [
  { id: "choice", group: "quiz", ico: "אב", bg: "#fde8ea", label: "בחירה", short: "בחירה", desc: "כמה תשובות, אחת נכונה", mvp: true },
  { id: "multi", group: "quiz", ico: "✔✔", bg: "#f6ecd4", label: "כמה נכונות", short: "כמה נכונות", desc: "יותר מתשובה אחת נכונה", mvp: true },
  { id: "truefalse", group: "quiz", ico: "נ/ל", bg: "#e6f0ee", label: "נכון או לא", short: "נכון / לא", desc: "שתי אפשרויות ברורות", mvp: true },
  { id: "twothruths", group: "quiz", ico: "②①", bg: "#f8e6f0", label: "שתי אמיתות ושקר", short: "שתי אמיתות", desc: "שלושה משפטים — מצאו את השקר", mvp: true },
  { id: "buzzer", group: "quiz", ico: "●", bg: "#fde0e3", label: "באזר", short: "באזר", desc: "הראשון שלוחץ עונה", soon: true, mvp: false },
  { id: "who", group: "couple", ico: "ע/ג", bg: "#e7f0e4", label: "מי יותר סביר", short: "מי יותר סביר", desc: "עמית מול גל, עם תשובה נכונה", mvp: true },
  { id: "whosaid", group: "couple", ico: "❝", bg: "#f6ecd4", label: "מי אמר/ה", short: "מי אמר/ה", desc: "ציטוט — מי אמר אותו", mvp: true },
  { id: "thisorthat", group: "couple", ico: "⇄", bg: "#fde8ea", label: "זה או זה", short: "זה או זה", desc: "בחירה מהירה בין שתי אפשרויות", mvp: true },
  { id: "tugofwar", group: "couple", ico: "━", bg: "#eee6f6", label: "משיכת חבל", short: "משיכת חבל", desc: "הצבעה חיה, עמית מול גל", soon: true, mvp: false },
  { id: "photo", group: "photos", ico: "▣", bg: "#efe8dc", label: "שאלת תמונה", short: "תמונה", desc: "שאלה על תמונה מהאלבום החי", mvp: true },
  { id: "blur", group: "photos", ico: "◌", bg: "#e8eef4", label: "תמונה מתגלה", short: "מתגלה", desc: "התמונה מתחדדת לאט — נחשו מהר", soon: true, mvp: false },
  { id: "spotdiff", group: "photos", ico: "◎", bg: "#f6ecd4", label: "מצא את ההבדל", short: "ההבדל", desc: "שתי תמונות מהאלבום, כמה הבדלים", soon: true, mvp: false },
  { id: "video", group: "photos", ico: "▶", bg: "#fde8ea", label: "שאלת וידאו", short: "וידאו", desc: "קטע קצר מהאלבום", soon: true, mvp: false },
  { id: "poll", group: "opinions", ico: "▌", bg: "#e6f0ee", label: "סקר", short: "סקר", desc: "בלי תשובה נכונה, רק דעה", mvp: true },
  { id: "cloud", group: "opinions", ico: "☁", bg: "#e8eef4", label: "ענן מילים", short: "ענן מילים", desc: "תשובה חופשית שעולה למסך", soon: true, mvp: false },
  { id: "rate", group: "opinions", ico: "10", bg: "#f6ecd4", label: "דירוג", short: "דירוג", desc: "מ־1 עד 10", soon: true, mvp: false },
  { id: "finish", group: "opinions", ico: "…", bg: "#f8e6f0", label: "השלימו את המשפט", short: "השלימו", desc: "פתיח קבוע, סיום של האורחים", soon: true, mvp: false },
  { id: "number", group: "creative", ico: "123", bg: "#e7f0e4", label: "נחש מספר", short: "מספר", desc: "סליידר — הקרוב ביותר מנצח", mvp: true },
  { id: "date", group: "creative", ico: "📅", bg: "#efe8dc", label: "נחשו את התאריך", short: "תאריך", desc: "בחירת תאריך — הקרוב מנצח", soon: true, mvp: false },
  { id: "order", group: "creative", ico: "1–4", bg: "#e8eef4", label: "סדר נכון", short: "סדר", desc: "לסדר אירועים על ציר זמן", soon: true, mvp: false },
  { id: "map", group: "creative", ico: "📍", bg: "#e6f0ee", label: "נעץ על המפה", short: "מפה", desc: "איפה זה קרה — הקרוב מנצח", soon: true, mvp: false },
  { id: "match", group: "creative", ico: "⟷", bg: "#eee6f6", label: "התאמת זוגות", short: "התאמה", desc: "לחבר פריטים ששייכים זה לזה", soon: true, mvp: false },
  { id: "fillblank", group: "creative", ico: "א_", bg: "#f6ecd4", label: "אריחי אותיות", short: "אריחים", desc: "השלימו מילה מאותיות מעורבבות", soon: true, mvp: false },
  { id: "emoji", group: "creative", ico: "🗼", bg: "#fde8ea", label: "חידת אימוג׳י", short: "אימוג׳י", desc: "לנחש שיר, סרט או מקום", soon: true, mvp: false },
  { id: "audio", group: "creative", ico: "♪", bg: "#e8eef4", label: "שיר / שמע", short: "שיר", desc: "קטע קצר — בשלב הבא", soon: true, mvp: false },
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
  { id: "cinema", name: "קולנוע", for: "שאלות תמונה ומסך גדול", sw: "#1A1410", sw2: "#C9A36A", mvp: false },
  { id: "arcade", name: "ארקייד", for: "בר ובת מצווה", sw: "#0C1A18", sw2: "#D4B15A", mvp: false },
  { id: "playful", name: "משחקי", for: "ימי הולדת, ברית ובריתה", sw: "#E36B7A", sw2: "#8FB37A", mvp: false },
  { id: "festival", name: "פסטיבל", for: "שקיעה, במה ואורות", sw: "#C45A1A", sw2: "#8A4DFF", mvp: false },
  { id: "corporate", name: "עסקי", for: "חברות ואירועי צוות", sw: "#10141A", sw2: "#6E8BA8", mvp: false },
];

export function triviaTypeMeta(id: string): TriviaTypeMeta | undefined {
  return TRIVIA_TYPE_CATALOG.find((t) => t.id === id);
}

export function triviaTypeLabel(id: string): string {
  return triviaTypeMeta(id)?.label || id;
}

export function isUnscoredType(type: string): boolean {
  return type === "poll" || type === "thisorthat";
}

export function isTwoCardType(type: string): boolean {
  return type === "who" || type === "whosaid" || type === "thisorthat";
}

export function defaultOptionsForType(type: string): { label: string; is_correct: boolean }[] {
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
  if (type === "thisorthat") {
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
  if (type === "number") {
    return [];
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
  if (type === "thisorthat") {
    return {
      sides: [
        { name: "אפשרות א", color: "#1F6F6A", initial: "א" },
        { name: "אפשרות ב", color: "#6E4A8A", initial: "ב" },
      ],
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

export interface TriviaQuestionDto {
  id?: number;
  type: string;
  prompt: string;
  fun_fact?: string | null;
  media_asset_id?: number | null;
  media?: { id: number; url: string } | null;
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
  mode: "options" | "number";
  total_answers?: number;
  options?: { option_id: number; count: number; percent: number }[];
  guesses?: { player_id: number; value: number; nickname?: string }[];
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
  teams?: {
    mode: string;
    labels: { a: string; b: string };
    scores: { a: number; b: number };
  } | null;
  prize_text?: string | null;
  question?: TriviaQuestionDto | null;
  tallies?: TriviaTallies | null;
  fun_fact?: string | null;
  correct?: {
    option_ids?: number[];
    number?: number;
    closest?: { nickname: string; value: number } | null;
  } | null;
  server_now?: string;
  event_name?: string | null;
}
