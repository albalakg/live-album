/**
 * Frontend trivia template pack (SPEC §6 / §11).
 * Backend also ships `couple` and `birthday` via from-template; this pack
 * lets the builder show richer cards and apply locally when preferred.
 */

export interface TriviaTemplateQuestion {
  type: string;
  prompt: string;
  time_limit_seconds?: number;
  max_points?: number;
  fun_fact?: string | null;
  media_asset_id?: number | null;
  config?: Record<string, unknown> | null;
  options?: { label: string; is_correct: boolean }[];
}

export interface TriviaTemplatePack {
  id: string;
  title: string;
  description: string;
  event: string;
  backend_id?: string;
  game?: {
    title?: string;
    theme?: string;
    pace?: string;
    teams_mode?: string;
    team_labels?: { a: string; b: string } | null;
    prize_text?: string | null;
  };
  questions: TriviaTemplateQuestion[];
}

const sideConfig = {
  sides: [
    { name: "עמית", color: "#1F6F6A", initial: "ע" },
    { name: "גל", color: "#DC5B66", initial: "ג" },
  ],
};

export const TRIVIA_TEMPLATES: TriviaTemplatePack[] = [
  {
    id: "couple",
    backend_id: "couple",
    title: "כמה אתם מכירים את הזוג",
    description: "חתונה: איפה נפגשו, מי אמר, זה או זה, תמונות ושתי אמיתות ושקר.",
    event: "wedding",
    game: {
      title: "כמה אתם מכירים את עמית וגל",
      theme: "elegant",
      pace: "host",
      teams_mode: "sides",
      team_labels: { a: "צד עמית", b: "צד גל" },
      prize_text: "הפרס: בקבוק יין וצילום עם עמית וגל",
    },
    questions: [
      {
        type: "choice",
        prompt: "איפה נפגשו עמית וגל לראשונה?",
        time_limit_seconds: 20,
        max_points: 1000,
        fun_fact: "הם ישבו באותו שולחן, בלי לתכנן, בקיץ 2019.",
        options: [
          { label: "בחתונה של חברים", is_correct: true },
          { label: "בצבא", is_correct: false },
          { label: "באוניברסיטה", is_correct: false },
          { label: "בטיול לדרום", is_correct: false },
        ],
      },
      {
        type: "who",
        prompt: "מי יותר סביר שיאחר ליציאה?",
        config: sideConfig,
        options: [
          { label: "עמית", is_correct: true },
          { label: "גל", is_correct: false },
        ],
        fun_fact: "עמית מבקש «עוד חמש דקות» כבר שנים. גל מחכה ליד הדלת.",
      },
      {
        type: "whosaid",
        prompt: "«בוא נזמין את כולם» — מי אמר/ה?",
        config: sideConfig,
        options: [
          { label: "עמית", is_correct: false },
          { label: "גל", is_correct: true },
        ],
      },
      {
        type: "thisorthat",
        prompt: "חופשה בטבע, או חופשה בעיר?",
        max_points: 0,
        config: {
          sides: [
            { name: "בטבע", color: "#1F6F6A", initial: "🌲" },
            { name: "בעיר", color: "#6E4A8A", initial: "🌆" },
          ],
        },
        options: [
          { label: "בטבע", is_correct: false },
          { label: "בעיר", is_correct: false },
        ],
        fun_fact: "אין תשובה נכונה — רק מה שהקהל בוחר.",
      },
      {
        type: "twothruths",
        prompt: "שתי אמיתות ושקר על הזוג — מה השקר?",
        fun_fact: "השקר הוא על הכלב — אין להם עדיין.",
        options: [
          { label: "הכירו דרך חברים משותפים", is_correct: false },
          { label: "יש להם כלב בשם לונה", is_correct: true },
          { label: "הצעה הייתה בטיול צפון", is_correct: false },
        ],
      },
      {
        type: "truefalse",
        prompt: "עמית וגל התארסו באותה שנה שבה נפגשו.",
        options: [
          { label: "נכון", is_correct: false },
          { label: "לא נכון", is_correct: true },
        ],
      },
      {
        type: "number",
        prompt: "כמה אורחים הוזמנו לחתונה?",
        config: { min: 50, max: 400, correct: 180, unit: "אורחים" },
        options: [],
      },
      {
        type: "poll",
        prompt: "איזה שיר חייבים לרקוד?",
        max_points: 0,
        options: [
          { label: "מזרחית", is_correct: false },
          { label: "פופ ישראלי", is_correct: false },
          { label: "קלאסיקה של שנות ה־90", is_correct: false },
          { label: "הפתעה מהדיג׳יי", is_correct: false },
        ],
      },
      {
        type: "multi",
        prompt: "מה נכון לגבי הזוג? (כמה תשובות)",
        options: [
          { label: "גרים בתל אביב", is_correct: true },
          { label: "אוהבים סושי", is_correct: true },
          { label: "יש להם ילדים", is_correct: false },
          { label: "משחקים טניס ביחד", is_correct: false },
        ],
      },
      {
        type: "photo",
        prompt: "באיזו תמונה מהאלבום צולם הרגע הזה?",
        media_asset_id: null,
        options: [
          { label: "בחופה", is_correct: true },
          { label: "בקבלת פנים", is_correct: false },
          { label: "בריקודים", is_correct: false },
          { label: "בצילומי זוגיות", is_correct: false },
        ],
      },
    ],
  },
  {
    id: "bar-mitzvah",
    title: "בר ובת מצווה",
    description: "12 שאלות על החוגג/ת, חברים ומשפחה.",
    event: "bar_mitzvah",
    game: {
      title: "כמה אתם מכירים את החוגג/ת",
      theme: "neon",
      pace: "host",
    },
    questions: [
      {
        type: "choice",
        prompt: "מה התחביב הכי גדול של החוגג/ת?",
        options: [
          { label: "כדורגל", is_correct: true },
          { label: "ריקוד", is_correct: false },
          { label: "גיימינג", is_correct: false },
          { label: "מוזיקה", is_correct: false },
        ],
      },
      {
        type: "thisorthat",
        prompt: "פיצה או המבורגר?",
        max_points: 0,
        options: [
          { label: "פיצה", is_correct: false },
          { label: "המבורגר", is_correct: false },
        ],
      },
      {
        type: "truefalse",
        prompt: "החוגג/ת תמיד מאחר/ת לבית הספר.",
        options: [
          { label: "נכון", is_correct: false },
          { label: "לא נכון", is_correct: true },
        ],
      },
      {
        type: "number",
        prompt: "כמה חברים הוזמנו?",
        config: { min: 20, max: 200, correct: 80, unit: "" },
        options: [],
      },
      {
        type: "poll",
        prompt: "איזו מסיבה הכי מתאימה אחרי הטקס?",
        max_points: 0,
        options: [
          { label: "בריכה", is_correct: false },
          { label: "קריוקי", is_correct: false },
          { label: "דיג׳יי", is_correct: false },
          { label: "טיול", is_correct: false },
        ],
      },
      {
        type: "twothruths",
        prompt: "שתי אמיתות ושקר — מה השקר?",
        options: [
          { label: "אוהב/ת שוקולד", is_correct: false },
          { label: "יש כלב בשם מקס", is_correct: true },
          { label: "לומד/ת בבית ספר ממלכתי", is_correct: false },
        ],
      },
      {
        type: "multi",
        prompt: "מה נכון על החוגג/ת?",
        options: [
          { label: "אוהב/ת כדורסל", is_correct: true },
          { label: "יש אחים", is_correct: true },
          { label: "גר/ה בחיפה", is_correct: false },
          { label: "מנגן/ת בפסנתר", is_correct: false },
        ],
      },
      {
        type: "who",
        prompt: "מי יותר סביר שיארגן את המסיבה?",
        config: {
          sides: [
            { name: "אבא", color: "#1F6F6A", initial: "א" },
            { name: "אמא", color: "#DC5B66", initial: "א" },
          ],
        },
        options: [
          { label: "אבא", is_correct: false },
          { label: "אמא", is_correct: true },
        ],
      },
      {
        type: "choice",
        prompt: "מה הצבע האהוב?",
        options: [
          { label: "כחול", is_correct: true },
          { label: "ירוק", is_correct: false },
          { label: "סגול", is_correct: false },
          { label: "כתום", is_correct: false },
        ],
      },
      {
        type: "photo",
        prompt: "באיזו תמונה רואים את החיוך הכי גדול?",
        media_asset_id: null,
        options: [
          { label: "בטקס", is_correct: true },
          { label: "עם החברים", is_correct: false },
          { label: "עם המשפחה", is_correct: false },
          { label: "בעוגה", is_correct: false },
        ],
      },
      {
        type: "whosaid",
        prompt: "«עוד חמש דקות» — מי אמר/ה?",
        options: [
          { label: "אבא", is_correct: true },
          { label: "אמא", is_correct: false },
        ],
      },
      {
        type: "poll",
        prompt: "מה הכי כיף במסיבה?",
        max_points: 0,
        options: [
          { label: "העוגה", is_correct: false },
          { label: "הריקודים", is_correct: false },
          { label: "המתנות", is_correct: false },
          { label: "החברים", is_correct: false },
        ],
      },
    ],
  },
  {
    id: "birthday",
    backend_id: "birthday",
    title: "יום הולדת",
    description: "זכרונות, זה או זה, סקרים ונחש מספר.",
    event: "birthday",
    game: {
      title: "כמה אתם מכירים את החוגג/ת",
      theme: "neon",
      prize_text: "הפרס: עוגה וברכה מהבמה",
    },
    questions: [
      {
        type: "choice",
        prompt: "מה האוכל האהוב על החוגג/ת?",
        options: [
          { label: "פיצה", is_correct: true },
          { label: "סושי", is_correct: false },
          { label: "המבורגר", is_correct: false },
          { label: "פסטה", is_correct: false },
        ],
      },
      {
        type: "thisorthat",
        prompt: "ים או בריכה?",
        max_points: 0,
        options: [
          { label: "ים", is_correct: false },
          { label: "בריכה", is_correct: false },
        ],
      },
      {
        type: "number",
        prompt: "באיזה גיל הם מרגישים?",
        config: { min: 5, max: 99, correct: 25, unit: "" },
        options: [],
      },
      {
        type: "poll",
        prompt: "איזו מסיבה הכי מתאימה?",
        max_points: 0,
        options: [
          { label: "שקטה בבית", is_correct: false },
          { label: "מועדון", is_correct: false },
          { label: "ברבקיו", is_correct: false },
          { label: "טיול", is_correct: false },
        ],
      },
      {
        type: "truefalse",
        prompt: "החוגג/ת תמיד מאחר/ת.",
        options: [
          { label: "נכון", is_correct: true },
          { label: "לא נכון", is_correct: false },
        ],
      },
    ],
  },
  {
    id: "brit",
    title: "ברית ובריתה",
    description: "8 שאלות קצרות למשפחה ולחברים.",
    event: "brit",
    game: { title: "ברית שמחה", theme: "elegant" },
    questions: [
      {
        type: "choice",
        prompt: "איך בחרו את השם?",
        options: [
          { label: "על שם סבא/סבתא", is_correct: true },
          { label: "שם מודרני", is_correct: false },
          { label: "הגרלה", is_correct: false },
          { label: "המלצת רופא", is_correct: false },
        ],
      },
      {
        type: "thisorthat",
        prompt: "עוגת גבינה או שוקולד?",
        max_points: 0,
        options: [
          { label: "גבינה", is_correct: false },
          { label: "שוקולד", is_correct: false },
        ],
      },
      {
        type: "truefalse",
        prompt: "התינוק/ת ישן/ה טוב בלילה.",
        options: [
          { label: "נכון", is_correct: false },
          { label: "לא נכון", is_correct: true },
        ],
      },
      {
        type: "poll",
        prompt: "מי הכי דומה להורים?",
        max_points: 0,
        options: [
          { label: "לאמא", is_correct: false },
          { label: "לאבא", is_correct: false },
          { label: "לשניהם", is_correct: false },
          { label: "לסבא", is_correct: false },
        ],
      },
      {
        type: "number",
        prompt: "כמה אורחים הגיעו?",
        config: { min: 10, max: 150, correct: 60, unit: "" },
        options: [],
      },
      {
        type: "who",
        prompt: "מי יותר סביר שיחזיק את התינוק/ת?",
        config: {
          sides: [
            { name: "סבתא", color: "#DC5B66", initial: "ס" },
            { name: "סבא", color: "#1F6F6A", initial: "ס" },
          ],
        },
        options: [
          { label: "סבתא", is_correct: true },
          { label: "סבא", is_correct: false },
        ],
      },
      {
        type: "multi",
        prompt: "מה נכון על המשפחה?",
        options: [
          { label: "יש אחים", is_correct: true },
          { label: "גרים במרכז", is_correct: true },
          { label: "יש כלב", is_correct: false },
          { label: "עברו דירה השנה", is_correct: false },
        ],
      },
      {
        type: "choice",
        prompt: "מה הצבע של העיניים?",
        options: [
          { label: "חום", is_correct: true },
          { label: "ירוק", is_correct: false },
          { label: "כחול", is_correct: false },
          { label: "אפור", is_correct: false },
        ],
      },
    ],
  },
  {
    id: "corporate",
    title: "הכרות לצוות",
    description: "10 שאלות להכרות באירוע חברה.",
    event: "corporate",
    game: { title: "הכרות הצוות", theme: "elegant", teams_mode: "none" },
    questions: [
      {
        type: "choice",
        prompt: "באיזו שנה הוקמה החברה?",
        options: [
          { label: "2015", is_correct: false },
          { label: "2018", is_correct: true },
          { label: "2020", is_correct: false },
          { label: "2012", is_correct: false },
        ],
      },
      {
        type: "thisorthat",
        prompt: "עבודה מהבית או מהמשרד?",
        max_points: 0,
        options: [
          { label: "מהבית", is_correct: false },
          { label: "מהמשרד", is_correct: false },
        ],
      },
      {
        type: "poll",
        prompt: "מה הכי חשוב בתרבות הארגונית?",
        max_points: 0,
        options: [
          { label: "שקיפות", is_correct: false },
          { label: "גמישות", is_correct: false },
          { label: "צמיחה", is_correct: false },
          { label: "כיף", is_correct: false },
        ],
      },
      {
        type: "truefalse",
        prompt: "יש לנו מטבח עם מכונת קפה.",
        options: [
          { label: "נכון", is_correct: true },
          { label: "לא נכון", is_correct: false },
        ],
      },
      {
        type: "number",
        prompt: "כמה עובדים יש בחברה?",
        config: { min: 5, max: 500, correct: 42, unit: "" },
        options: [],
      },
      {
        type: "multi",
        prompt: "אילו מחלקות יש אצלנו?",
        options: [
          { label: "מוצר", is_correct: true },
          { label: "מכירות", is_correct: true },
          { label: "חלל", is_correct: false },
          { label: "משאבי אנוש", is_correct: true },
        ],
      },
      {
        type: "twothruths",
        prompt: "שתי אמיתות ושקר על המנכ״ל/ית",
        options: [
          { label: "התחיל/ה כמתמחה", is_correct: false },
          { label: "גר/ה בחו״ל 10 שנים", is_correct: true },
          { label: "אוהב/ת ריצה", is_correct: false },
        ],
      },
      {
        type: "who",
        prompt: "מי יותר סביר שיארגן ארוחת צוות?",
        config: {
          sides: [
            { name: "HR", color: "#DC5B66", initial: "H" },
            { name: "המנכ״ל", color: "#1F6F6A", initial: "מ" },
          ],
        },
        options: [
          { label: "HR", is_correct: true },
          { label: "המנכ״ל", is_correct: false },
        ],
      },
      {
        type: "choice",
        prompt: "מה הסלוגן שלנו?",
        options: [
          { label: "ביחד צומחים", is_correct: true },
          { label: "רק קדימה", is_correct: false },
          { label: "תמיד ראשונים", is_correct: false },
          { label: "פשוט עובדים", is_correct: false },
        ],
      },
      {
        type: "poll",
        prompt: "איפה הכי כיף לאירוע הבא?",
        max_points: 0,
        options: [
          { label: "במשרד", is_correct: false },
          { label: "בחוץ", is_correct: false },
          { label: "במלון", is_correct: false },
          { label: "זום", is_correct: false },
        ],
      },
    ],
  },
  {
    id: "party",
    title: "מסיבה ופסטיבל",
    description: "10 שאלות אנרגטיות למסיבה.",
    event: "party",
    game: { title: "מסיבת טריוויה", theme: "neon" },
    questions: [
      {
        type: "choice",
        prompt: "איפה נפגשנו לראשונה?",
        options: [
          { label: "במסיבה", is_correct: true },
          { label: "בעבודה", is_correct: false },
          { label: "בטיול", is_correct: false },
          { label: "באוניברסיטה", is_correct: false },
        ],
      },
      {
        type: "thisorthat",
        prompt: "דיג׳יי או להקה חיה?",
        max_points: 0,
        options: [
          { label: "דיג׳יי", is_correct: false },
          { label: "להקה", is_correct: false },
        ],
      },
      {
        type: "poll",
        prompt: "איזה סגנון מוזיקה שולט הערב?",
        max_points: 0,
        options: [
          { label: "אלקטרו", is_correct: false },
          { label: "מזרחית", is_correct: false },
          { label: "רוק", is_correct: false },
          { label: "הכל מעורב", is_correct: false },
        ],
      },
      {
        type: "number",
        prompt: "באיזו שעה נגמרת המסיבה?",
        config: { min: 22, max: 6, correct: 3, unit: "" },
        options: [],
      },
      {
        type: "truefalse",
        prompt: "יש בר פתוח כל הערב.",
        options: [
          { label: "נכון", is_correct: true },
          { label: "לא נכון", is_correct: false },
        ],
      },
      {
        type: "twothruths",
        prompt: "שתי אמיתות ושקר על המסיבה",
        options: [
          { label: "יש פוטותרפיה", is_correct: false },
          { label: "יש בריכה", is_correct: true },
          { label: "יש פינת אוכל", is_correct: false },
        ],
      },
      {
        type: "multi",
        prompt: "מה יש באולם?",
        options: [
          { label: "רחבת ריקודים", is_correct: true },
          { label: "בר", is_correct: true },
          { label: "קזינו", is_correct: false },
          { label: "קולנוע", is_correct: false },
        ],
      },
      {
        type: "who",
        prompt: "מי יותר סביר שיעלה לרקוד ראשון?",
        config: sideConfig,
        options: [
          { label: "עמית", is_correct: false },
          { label: "גל", is_correct: true },
        ],
      },
      {
        type: "photo",
        prompt: "איזו תמונה היא מהמסיבה הקודמת?",
        media_asset_id: null,
        options: [
          { label: "הריקודים", is_correct: true },
          { label: "העוגה", is_correct: false },
          { label: "הכניסה", is_correct: false },
          { label: "הבר", is_correct: false },
        ],
      },
      {
        type: "choice",
        prompt: "מה המשקה של הערב?",
        options: [
          { label: "קוקטייל הבית", is_correct: true },
          { label: "בירה", is_correct: false },
          { label: "יין", is_correct: false },
          { label: "מוחיטו", is_correct: false },
        ],
      },
    ],
  },
];

export function findTriviaTemplate(id: string): TriviaTemplatePack | undefined {
  return TRIVIA_TEMPLATES.find((t) => t.id === id);
}
