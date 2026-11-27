/** Display labels + badge classes for smart search rows (same wording as the approved mock). */
import type { SearchGuestStatus, SearchMessageStatus, SearchPhotoStatus, SearchSide } from "./types";

export const STATUS_LABEL: Record<SearchGuestStatus, [string, string]> = {
  invited: ["טרם ענה", "b-warn"],
  confirmed: ["אישר", "b-ok"],
  declined: ["סירב", "b-rose"],
  maybe: ["אולי", "b-gold"],
  cancelled: ["ביטל", "b-muted"],
};

export const SIDE_LABEL: Record<SearchSide, string> = { bride: "צד הכלה", groom: "צד החתן", shared: "משותף" };

export const PHOTO_STATUS: Record<SearchPhotoStatus, [string, string]> = {
  approved: ["מאושרת", "b-ok"],
  pending: ["ממתינה", "b-warn"],
  hidden: ["מוסתרת", "b-muted"],
};

export const MESSAGE_STATUS: Record<SearchMessageStatus, [string, string]> = {
  scheduled: ["מתוזמן", "b-gold"],
  sent: ["נשלח", "b-ok"],
  partial: ["נשלח חלקית", "b-warn"],
  other: ["אחר", "b-muted"],
};

export const GROUP_BY: Record<string, string> = { none: "בלי קיבוץ", side: "צד", status: "סטטוס", table: "שולחן", group: "קבוצה" };
