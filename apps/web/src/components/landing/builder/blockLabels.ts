/** Hebrew labels for landing block types (editor + list). */
export const BLOCK_TYPE_LABELS: Record<string, string> = {
  HERO_COUNTDOWN: "גיבור וספירה לאחור",
  FOOTER: "כותרת תחתונה",
  STORY: "הסיפור",
  ABOUT: "אודות",
  PEOPLE: "אנשים",
  EVENT_TIMELINE: "לו״ז",
  CARDS: "כרטיסים",
  GALLERY: "גלריה",
  STEPS: "שלושה צעדים",
  MAP: "הגעה",
  WISHING_WELL: "קיר ברכות",
  RSVP: "אישור הגעה",
  FAQ: "שאלות נפוצות",
  QUOTE: "ציטוט",
  TRIVIA_CTA: "טריוויה",
  GIFT: "מתנה",
  MILESTONES: "אבני דרך",
  PLAYLIST: "פלייליסט",
  SPEAKERS: "דוברים",
  SPONSORS: "שותפים",
  NETWORKING: "חיבור",
  HASHTAG: "אשטאג",
  LINEUP: "ליינאפ",
  BEEN_THERE: "הייתי שם",
  GROUNDS: "מפת שטח",
  ZONES: "פינות",
  RULES: "כללים",
  SNAPSHARE_CTA: "העלאה",
  RICH_TEXT: "טקסט חופשי",
  SMART_NAVIGATION: "ניווט",
  LINK_LIST: "קישורים",
  MEDIA_STRIP: "רצועת מדיה",
};

export const LOCKED_BLOCK_TYPES = new Set(["HERO_COUNTDOWN", "FOOTER"]);

export const LANDING_TYPE_FILTERS = [
  { id: "all", label: "הכל" },
  { id: "wedding", label: "חתונה" },
  { id: "barmitzvah", label: "בר/בת מצווה" },
  { id: "birthday", label: "יום הולדת" },
  { id: "brit", label: "ברית/בריתה" },
  { id: "corporate", label: "אירוע חברה" },
  { id: "party", label: "מסיבה" },
  { id: "festival", label: "פסטיבל" },
] as const;

export const ALLOWED_FONTS = [
  "Frank Ruhl Libre",
  "Heebo",
  "Rubik",
  "Varela Round",
  "Assistant",
  "Secular One",
] as const;

export function blockTypeLabel(type: string): string {
  return BLOCK_TYPE_LABELS[type] || type;
}
