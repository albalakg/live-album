/** Per-block field shapes mirroring HubBlockValidator (template mode). */

export type FieldKind =
  | "text"
  | "textarea"
  | "date"
  | "url"
  | "select"
  | "image"
  | "list";

export interface FieldOption {
  value: string;
  label: string;
}

export interface ListSubField {
  key: string;
  label: string;
  kind: "text" | "textarea" | "url" | "image";
  max?: number;
  required?: boolean;
}

export interface BuilderField {
  key: string;
  label: string;
  kind: FieldKind;
  max?: number;
  required?: boolean;
  options?: FieldOption[];
  /** For list fields */
  itemLabel?: string;
  maxItems?: number;
  minItems?: number;
  subFields?: ListSubField[];
  /** Rules items are plain strings */
  stringItems?: boolean;
}

const COMMON_KICKER: BuilderField = {
  key: "kicker",
  label: "כותרת משנה",
  kind: "text",
  max: 200,
};
const COMMON_HEADING: BuilderField = {
  key: "heading",
  label: "כותרת",
  kind: "text",
  max: 200,
};

export const BLOCK_FIELD_SCHEMAS: Record<string, BuilderField[]> = {
  HERO_COUNTDOWN: [
    { key: "title", label: "כותרת", kind: "text", max: 200, required: true },
    { key: "event_date", label: "תאריך האירוע", kind: "date", required: true },
    { key: "kicker", label: "כותרת עליונה", kind: "text", max: 200 },
    { key: "venue", label: "מקום", kind: "text", max: 200 },
    { key: "city", label: "עיר", kind: "text", max: 200 },
    { key: "welcome_heading", label: "כותרת ברכה", kind: "text", max: 200 },
    { key: "welcome", label: "ברכה", kind: "textarea", max: 5000 },
    { key: "cover", label: "תמונת כיסוי", kind: "image" },
  ],
  STORY: [
    COMMON_KICKER,
    COMMON_HEADING,
    {
      key: "chapters",
      label: "פרקים",
      kind: "list",
      itemLabel: "פרק",
      maxItems: 24,
      subFields: [
        { key: "title", label: "כותרת", kind: "text", max: 200 },
        { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
      ],
    },
    { key: "image", label: "תמונה", kind: "image" },
    { key: "image_caption", label: "כיתוב לתמונה", kind: "text", max: 200 },
  ],
  ABOUT: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
    {
      key: "layout",
      label: "פריסה",
      kind: "select",
      options: [
        { value: "center", label: "מרכז" },
        { value: "split", label: "פיצול" },
        { value: "wide", label: "רחב" },
        { value: "right", label: "ימין" },
      ],
    },
    { key: "image", label: "תמונה", kind: "image" },
  ],
  PEOPLE: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "items",
      label: "אנשים",
      kind: "list",
      itemLabel: "אדם",
      maxItems: 24,
      subFields: [
        { key: "initials", label: "ראשי תיבות", kind: "text", max: 16 },
        { key: "name", label: "שם", kind: "text", max: 200 },
        { key: "role", label: "תפקיד", kind: "text", max: 200 },
      ],
    },
    {
      key: "photos",
      label: "תמונות",
      kind: "list",
      itemLabel: "תמונה",
      maxItems: 24,
      subFields: [
        { key: "image", label: "תמונה", kind: "image" },
        { key: "caption", label: "כיתוב", kind: "text", max: 200 },
      ],
    },
  ],
  EVENT_TIMELINE: [
    COMMON_KICKER,
    COMMON_HEADING,
    {
      key: "items",
      label: "פריטי לו״ז",
      kind: "list",
      itemLabel: "פריט",
      maxItems: 24,
      minItems: 1,
      subFields: [
        { key: "time", label: "שעה", kind: "text", max: 50, required: true },
        { key: "label", label: "כותרת", kind: "text", max: 120, required: true },
        { key: "description", label: "תיאור", kind: "textarea", max: 500 },
      ],
    },
  ],
  CARDS: [
    COMMON_KICKER,
    COMMON_HEADING,
    {
      key: "items",
      label: "כרטיסים",
      kind: "list",
      itemLabel: "כרטיס",
      maxItems: 24,
      subFields: [
        { key: "title", label: "כותרת", kind: "text", max: 200 },
        { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
      ],
    },
  ],
  GALLERY: [
    COMMON_KICKER,
    COMMON_HEADING,
    {
      key: "style",
      label: "סגנון",
      kind: "select",
      options: [
        { value: "masonry", label: "מייסנרי" },
        { value: "carousel", label: "קרוסלה" },
        { value: "filmstrip", label: "סרט" },
        { value: "grid", label: "רשת" },
      ],
    },
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "images",
      label: "תמונות",
      kind: "list",
      itemLabel: "תמונה",
      maxItems: 30,
      subFields: [
        { key: "image", label: "תמונה", kind: "image" },
        { key: "caption", label: "כיתוב", kind: "text", max: 200 },
      ],
    },
  ],
  STEPS: [
    COMMON_KICKER,
    COMMON_HEADING,
    {
      key: "steps",
      label: "צעדים",
      kind: "list",
      itemLabel: "צעד",
      maxItems: 24,
      subFields: [
        { key: "n", label: "מספר", kind: "text", max: 16 },
        { key: "title", label: "כותרת", kind: "text", max: 200 },
        { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
      ],
    },
    { key: "button_text", label: "טקסט כפתור", kind: "text", max: 120 },
    { key: "album_text", label: "טקסט אלבום", kind: "text", max: 200 },
  ],
  MAP: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "location_name", label: "שם המקום", kind: "text", max: 200, required: true },
    { key: "city", label: "עיר", kind: "text", max: 200 },
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    { key: "waze_url", label: "קישור Waze", kind: "url", max: 2048 },
    { key: "google_maps_url", label: "קישור Google Maps", kind: "url", max: 2048 },
  ],
  WISHING_WELL: [
    { key: "title", label: "כותרת", kind: "text", max: 120, required: true },
    { key: "message", label: "הודעה", kind: "textarea", max: 1000 },
    { key: "gift_label", label: "תווית מתנה", kind: "text", max: 200 },
    { key: "gift_note", label: "הערת מתנה", kind: "text", max: 500 },
    { key: "payment_link", label: "קישור תשלום", kind: "url", max: 2048 },
    { key: "account_details", label: "פרטי חשבון", kind: "textarea", max: 500 },
  ],
  RSVP: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
  ],
  FAQ: [
    COMMON_KICKER,
    COMMON_HEADING,
    {
      key: "items",
      label: "שאלות",
      kind: "list",
      itemLabel: "שאלה",
      maxItems: 24,
      minItems: 1,
      subFields: [
        { key: "q", label: "שאלה", kind: "text", max: 500, required: true },
        { key: "a", label: "תשובה", kind: "textarea", max: 5000, required: true },
      ],
    },
  ],
  QUOTE: [
    { key: "text", label: "ציטוט", kind: "textarea", max: 1000, required: true },
    { key: "credit", label: "קרדיט", kind: "text", max: 200 },
  ],
  TRIVIA_CTA: [
    { key: "title", label: "כותרת", kind: "text", max: 200 },
    { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
  ],
  GIFT: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
    { key: "button", label: "טקסט כפתור", kind: "text", max: 120 },
    { key: "url", label: "קישור", kind: "url", max: 2048 },
  ],
  MILESTONES: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "items",
      label: "אבני דרך",
      kind: "list",
      itemLabel: "אבן דרך",
      maxItems: 24,
      subFields: [
        { key: "tag", label: "תג", kind: "text", max: 50 },
        { key: "title", label: "כותרת", kind: "text", max: 200 },
        { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
      ],
    },
  ],
  PLAYLIST: [
    COMMON_HEADING,
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "tracks",
      label: "שירים",
      kind: "list",
      itemLabel: "שיר",
      maxItems: 24,
      subFields: [
        { key: "song", label: "שם השיר", kind: "text", max: 200 },
        { key: "art", label: "אמן", kind: "text", max: 200 },
        { key: "dur", label: "משך", kind: "text", max: 32 },
      ],
    },
  ],
  SPEAKERS: [
    COMMON_HEADING,
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "items",
      label: "דוברים",
      kind: "list",
      itemLabel: "דובר",
      maxItems: 24,
      subFields: [
        { key: "initials", label: "ראשי תיבות", kind: "text", max: 16 },
        { key: "name", label: "שם", kind: "text", max: 200 },
        { key: "role", label: "תפקיד", kind: "text", max: 200 },
      ],
    },
  ],
  SPONSORS: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "items",
      label: "שותפים",
      kind: "list",
      itemLabel: "שותף",
      maxItems: 24,
      subFields: [
        { key: "initials", label: "ראשי תיבות", kind: "text", max: 16 },
        { key: "name", label: "שם", kind: "text", max: 200 },
      ],
    },
  ],
  NETWORKING: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
  ],
  HASHTAG: [
    { key: "tag", label: "אשטאג", kind: "text", max: 100, required: true },
    { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
  ],
  LINEUP: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "items",
      label: "פריטים",
      kind: "list",
      itemLabel: "פריט",
      maxItems: 24,
      subFields: [
        { key: "time", label: "שעה", kind: "text", max: 50 },
        { key: "title", label: "כותרת", kind: "text", max: 200 },
        { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
      ],
    },
  ],
  BEEN_THERE: [
    COMMON_HEADING,
    { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
  ],
  GROUNDS: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "zones",
      label: "אזורים",
      kind: "list",
      itemLabel: "אזור",
      maxItems: 24,
      subFields: [
        { key: "id", label: "מזהה", kind: "text", max: 64 },
        { key: "label", label: "תווית", kind: "text", max: 200 },
      ],
    },
  ],
  ZONES: [
    COMMON_KICKER,
    COMMON_HEADING,
    { key: "note", label: "הערה", kind: "textarea", max: 1000 },
    {
      key: "items",
      label: "פינות",
      kind: "list",
      itemLabel: "פינה",
      maxItems: 24,
      subFields: [
        { key: "title", label: "כותרת", kind: "text", max: 200 },
        { key: "body", label: "תוכן", kind: "textarea", max: 5000 },
      ],
    },
  ],
  RULES: [
    COMMON_KICKER,
    COMMON_HEADING,
    {
      key: "items",
      label: "כללים",
      kind: "list",
      itemLabel: "כלל",
      maxItems: 24,
      stringItems: true,
      subFields: [{ key: "value", label: "כלל", kind: "text", max: 1000 }],
    },
  ],
  FOOTER: [{ key: "note", label: "הערה", kind: "textarea", max: 1000 }],
  SNAPSHARE_CTA: [
    { key: "button_text", label: "טקסט כפתור", kind: "text", max: 120, required: true },
    { key: "subtitle", label: "כותרת משנה", kind: "text", max: 200 },
  ],
  RICH_TEXT: [
    { key: "heading", label: "כותרת", kind: "text", max: 200, required: true },
    { key: "body", label: "תוכן", kind: "textarea", max: 5000, required: true },
    {
      key: "alignment",
      label: "יישור",
      kind: "select",
      options: [
        { value: "RIGHT", label: "ימין" },
        { value: "CENTER", label: "מרכז" },
        { value: "LEFT", label: "שמאל" },
      ],
    },
  ],
};

export function fieldsForBlockType(type: string): BuilderField[] {
  return BLOCK_FIELD_SCHEMAS[type] || [];
}

export function isHttpsUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function emptyListItem(field: BuilderField): Record<string, unknown> | string {
  if (field.stringItems) return "";
  const row: Record<string, unknown> = {};
  for (const sub of field.subFields || []) {
    if (sub.kind === "image") row[sub.key] = null;
    else row[sub.key] = "";
  }
  return row;
}
