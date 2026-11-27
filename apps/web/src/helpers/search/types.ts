/** Normalised, read-only view of one event used by smart search (built in memory from existing API data). */

export type SearchGuestStatus = "invited" | "confirmed" | "declined" | "maybe" | "cancelled";
export type SearchSide = "bride" | "groom" | "shared";

export interface SearchGuest {
  id: number;
  name: string;
  side: SearchSide | null;
  group: string;
  groupId: number | null;
  status: SearchGuestStatus;
  party: number;
  tableId: number | null;
  table: string | null;
  phone: string | null;
  email: string | null;
  notes: string;
  meal: string | null;
  /** WhatsApp tags: לא-נשלח / נשלח / נקרא / נכשל / נענה / חסום (only when messaging data is available). */
  wa: string[];
  /** Days since the guest was added (0 = today), null when unknown. */
  addedDays: number | null;
}

export interface SearchTable {
  id: number;
  key: string;
  label: string;
  seats: number;
  note: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: "round" | "rect";
}

export interface SearchFixture {
  kind: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type SearchPhotoStatus = "approved" | "pending" | "hidden";

export interface SearchPhoto {
  id: number;
  /** Minutes since local midnight of the upload day (upload time, not capture time). */
  min: number;
  /** 0 = today, -1 = yesterday, -n = n days ago. */
  day: number;
  dateLabel: string;
  time: string;
  status: SearchPhotoStatus;
  fav: boolean;
  kind: "תמונה" | "סרטון";
  uploaderN: number;
  thumb: string | null;
}

export type SearchMessageStatus = "scheduled" | "sent" | "partial" | "other";

export interface SearchMessage {
  id: number;
  title: string;
  status: SearchMessageStatus;
  rawStatus: string;
  kind: string;
  when: string;
  audience: number;
  version: number;
  editable: boolean;
}

export interface SearchReply {
  guestId: number;
  who: string;
  text: string;
  when: string;
}

export interface SearchCommand {
  id: string;
  label: string;
  hint: string;
  kw: string;
}

export interface SearchPage {
  id: string;
  label: string;
  path: string;
}

export interface SearchHelp {
  id: string;
  label: string;
  path: string;
}

export interface SearchData {
  guests: SearchGuest[];
  tables: SearchTable[];
  fixtures: SearchFixture[];
  photos: SearchPhoto[];
  messages: SearchMessage[];
  replies: SearchReply[];
  commands: SearchCommand[];
  pages: SearchPage[];
  help: SearchHelp[];
  groups: string[];
  meals: string[];
}

export function emptySearchData(): SearchData {
  return { guests: [], tables: [], fixtures: [], photos: [], messages: [], replies: [], commands: [], pages: [], help: [], groups: [], meals: [] };
}
