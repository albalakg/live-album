import { SendStatus } from "./types";

export const SEND_STATUS: Record<SendStatus, { label: string; cls: string }> = {
  scheduled: { label: "מתוזמן", cls: "b-gold" },
  review: { label: "ממתין לאישור Meta", cls: "b-violet" },
  paused: { label: "מושהה", cls: "b-grey" },
  sending: { label: "בשליחה", cls: "b-blue" },
  sent: { label: "נשלח", cls: "b-green" },
  partial: { label: "חלקי", cls: "b-amber" },
  cancelled: { label: "בוטל", cls: "b-red" },
};

export const RECIPIENT_STATUS: Record<string, string> = {
  pending: "ממתין",
  sending: "בשליחה",
  sent: "נשלח",
  delivered: "נמסר",
  read: "נקרא",
  failed: "נכשל",
  cancelled: "בוטל",
  skipped: "דולג",
  replied: "השיב",
};

export const SKIP_REASONS: Record<string, string> = {
  quota: "נגמרה מכסת ההודעות לאורח",
  guest_cap: "מעבר למספר האורחים בחבילה",
  opted_out: "ביקש להסיר",
  no_phone: "אין טלפון",
  invalid_phone: "טלפון לא תקין",
  segment_changed: "כבר לא מתאים לקהל (למשל אישר בינתיים)",
  audience_changed: "הוסר מהקהל",
  cancelled: "השליחה בוטלה",
  automation_off: "האוטומציה כובתה",
};

export const META_STATUS: Record<string, { label: string; cls: string }> = {
  approved: { label: "מאושר Meta", cls: "b-green" },
  pending: { label: "בבדיקת Meta", cls: "b-violet" },
  rejected: { label: "נדחה ע״י Meta", cls: "b-red" },
  draft: { label: "טיוטה", cls: "b-grey" },
  needs_review: { label: "דורש אישור Meta", cls: "b-violet" },
};

export const STAGES: Record<string, string> = {
  pre: "טרום-אירוע",
  rsvp: "אישורי הגעה",
  dayof: "יום האירוע",
  post: "אחרי האירוע",
  manual: "ידני",
};

export const CATEGORY_LABEL: Record<string, string> = { marketing: "Marketing", utility: "Utility" };

export const VARIABLES: { key: string; label: string }[] = [
  { key: "first_name", label: "שם פרטי" },
  { key: "couple_names", label: "שמות הזוג" },
  { key: "event_title", label: "שם האירוע" },
  { key: "event_date", label: "תאריך" },
  { key: "event_day", label: "יום" },
  { key: "event_time", label: "שעה" },
  { key: "venue_name", label: "מקום" },
  { key: "venue_address", label: "כתובת" },
  { key: "waze_link", label: "Waze" },
  { key: "table_label", label: "מספר שולחן" },
  { key: "table_link", label: "קישור השולחן שלי" },
  { key: "party_size", label: "מספר מוזמנים" },
  { key: "hub_link", label: "דף אירוע" },
  { key: "rsvp_link", label: "קישור אישור הגעה" },
  { key: "album_link", label: "קישור אלבום" },
  { key: "gift_link", label: "קישור מתנה" },
];

export const CONFLICT_LABEL: Record<string, string> = {
  quiet: "שעות שקט (21:30–08:30)",
  shabbat: "שבת (שישי 15:00 – מוצ״ש 20:30)",
};

const SERVER_MESSAGES: Record<string, string> = {
  "This message was changed in the meantime. Reload and try again.": "ההודעה עודכנה בינתיים ממקום אחר. טענו מחדש ונסו שוב.",
  "This message was already sent or cancelled and can no longer be changed": "ההודעה כבר נשלחה או בוטלה ואי אפשר לשנות אותה.",
  "Quiet hours / Shabbat are active. Confirm override to send now.": "עכשיו שעות שקט / שבת. צריך לאשר עקיפה כדי לשלוח עכשיו.",
  "No guests with a phone number match this audience": "אין אורחים עם טלפון שמתאימים לקהל הזה.",
  "The schedule time is in the past": "המועד שנבחר כבר עבר.",
  "Message body is required": "צריך לכתוב תוכן להודעה.",
  "Invalid phone number": "מספר הטלפון לא תקין.",
  "Test-send limit reached for this event": "נוצלו כל שליחות הבדיקה לאירוע הזה.",
  "The free 24h reply window is closed. Send an approved template instead.": "חלון 24 השעות החינמי נסגר. אפשר לשלוח רק תבנית מאושרת.",
  "WhatsApp messaging is not enabled": "הודעות WhatsApp עדיין לא זמינות בחשבון הזה.",
  "Links must start with https://": "קישורים צריכים להתחיל ב-https://",
  "Nothing to change": "לא היה מה לשנות.",
  "This RSVP link is not valid": "הקישור לא תקין או שפג תוקפו.",
  "Please choose whether you are coming": "בחרו אם אתם מגיעים.",
  "This timing is already in the past for the event date": "התזמון הזה כבר עבר ביחס לתאריך האירוע.",
  "This guest opted out of messages": "האורח ביקש להסיר אותו מההודעות.",
};

export function msgError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
  const msg = data?.message || "";
  if (SERVER_MESSAGES[msg]) return SERVER_MESSAGES[msg];
  if (msg.startsWith("Unknown variable")) return "יש משתנה לא מוכר בטקסט: " + msg.replace("Unknown variable: ", "");
  return fallback;
}

export function errStatus(err: unknown): number {
  return (err as { response?: { status?: number } })?.response?.status || 0;
}

export function errData<T = Record<string, unknown>>(err: unknown): T | null {
  return ((err as { response?: { data?: { data?: T } } })?.response?.data?.data as T) || null;
}

const TZ = "Asia/Jerusalem";

export function fmtWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const day = d.toLocaleDateString("he-IL", { weekday: "long", timeZone: TZ });
  const date = d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ });
  const time = d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });
  return `${day}, ${date} · ${time}`;
}

export function fmtShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });
}

/** ISO → "YYYY-MM-DDTHH:mm" in Israel time for <input type="datetime-local">. */
export function toLocalInput(iso: string | null | undefined): string {
  // Default: about an hour from now, rounded up to the next 15 minutes (matches the time picker steps).
  const q = 15 * 60 * 1000;
  const d = iso ? new Date(iso) : new Date(Math.ceil((Date.now() + 60 * 60 * 1000) / q) * q);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "00";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

export function renderVars(text: string | null | undefined, vars: Record<string, string>): string {
  return String(text || "").replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_m, k: string) => (vars[k] ? vars[k] : "—"));
}
