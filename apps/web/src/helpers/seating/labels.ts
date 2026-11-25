import { GuestStatus, Side } from "./types";

export const STATUS_LABELS: Record<GuestStatus, string> = {
  0: "ממתין",
  1: "מגיע",
  2: "לא מגיע",
  3: "אולי",
  4: "בוטל",
};

export const STATUS_ORDER: GuestStatus[] = [1, 0, 3, 2, 4];

export const SIDE_LABELS: Record<Side, string> = {
  bride: "צד כלה",
  groom: "צד חתן",
  shared: "משותף",
};

/** Dark swatches → white text passes AA. Used for avatars by side when a guest has no group color. */
export const SIDE_COLORS: Record<Side | "none", string> = {
  bride: "#8f3a44",
  groom: "#365646",
  shared: "#3b4a68",
  none: "#5c4a3a",
};

/** Group swatches: all dark enough for white text (AA). */
export const GROUP_SWATCHES = ["#8f3a44", "#365646", "#3b4a68", "#6b4b27", "#574775", "#2d5a62", "#7a4527", "#4a4743"];

export function initials(name: string): string {
  const parts = String(name || "")
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** English API messages → Hebrew for toasts. */
const SERVER_MESSAGES: Record<string, string> = {
  "Guest name is required": "חסר שם אורח",
  "Invalid phone number": "מספר טלפון לא תקין",
  "Invalid email address": "כתובת מייל לא תקינה",
  "A guest with this phone number already exists for this event": "כבר יש אורח עם מספר הטלפון הזה",
  "A guest with this email address already exists for this event": "כבר יש אורח עם המייל הזה",
  "Guest not found": "האורח לא נמצא",
  "Group not found": "הקבוצה לא נמצאה",
  "Group name is required": "חסר שם קבוצה",
  "A group with this name already exists": "כבר יש קבוצה בשם הזה",
  "Too many rows (max 5000)": "יותר מדי שורות (עד 5,000)",
  "Seating is not enabled for this event": "תכנון ההושבה לא פעיל באירוע הזה",
  "Seating plan changed elsewhere": "המפה עודכנה בחלון אחר",
  "Too many tables": "יותר מדי שולחנות",
  "A constraint needs 2–30 guests": "אילוץ צריך 2–30 אורחים",
  "Add tables before arranging": "הוסיפו שולחנות לפני שיבוץ",
  "No guests left to seat": "אין אורחים שממתינים להושבה",
  "No smart-arrange runs left for this event": "נגמרה מכסת השיבוצים החכמים לאירוע",
  "Another smart-arrange run is in progress": "שיבוץ אחר כבר רץ, נסו שוב בעוד רגע",
  "Smart arrange failed. The run was not counted.": "השיבוץ החכם נכשל. הניסיון לא נספר במכסה.",
  "The plan changed since this proposal": "המפה השתנתה מאז ההצעה",
  "This proposal can no longer be applied": "אי אפשר להחיל את ההצעה הזו",
  "Too many guests for one run": "יותר מדי אורחים לשיבוץ אחד",
};

export function apiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.[0]) return SERVER_MESSAGES[first[0]] || fallback;
  }
  const msg = data?.message || "";
  return SERVER_MESSAGES[msg] || fallback;
}

export function apiStatus(err: unknown): number {
  return (err as { response?: { status?: number } })?.response?.status || 0;
}

export function apiData<T>(err: unknown): T | null {
  return ((err as { response?: { data?: { data?: T } } })?.response?.data?.data as T) ?? null;
}
