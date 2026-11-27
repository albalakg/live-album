/** Static commands / help registry for smart search. Pages come from the host navigation. */
import { SearchCommand, SearchHelp, SearchPage } from "./types";

export interface CommandTarget {
  path?: string;
  query?: Record<string, string>;
  /** handled in the palette (e.g. export) */
  run?: "export-guests";
}

export const COMMAND_TARGETS: Record<string, CommandTarget> = {
  "add-guest": { path: "/event/guests", query: { action: "add" } },
  "add-table": { path: "/event/seating" },
  "auto-seat": { path: "/event/seating" },
  "new-msg": { path: "/event/messages/compose" },
  qr: { path: "/event/qr" },
  std: { path: "/event/save-the-date" },
  quiet: { path: "/event/messages/rsvp" },
  export: { run: "export-guests" },
  plan: { path: "/event/plan" },
  upload: { path: "/event/upload" },
  gallery: { path: "/event/gallery" },
};

export function buildCommands(opts: { seating: boolean; messaging: boolean }): SearchCommand[] {
  const list: SearchCommand[] = [
    { id: "add-guest", label: "הוסף אורח חדש", hint: "אורחים", kw: "הוסף אורח חדש הוספה add guest" },
  ];
  if (opts.seating) {
    list.push({ id: "add-table", label: "צור שולחן חדש", hint: "הושבה", kw: "שולחן חדש צור add table" });
    list.push({ id: "auto-seat", label: "שיבוץ אוטומטי לפי קבוצות", hint: "הושבה", kw: "שבץ אוטומטית הושבה אוטומטית שיבוץ" });
  }
  if (opts.messaging) {
    list.push({ id: "new-msg", label: "הודעה חדשה לאורחים", hint: "הודעות", kw: "הודעה חדשה שלח וואטסאפ whatsapp" });
    list.push({ id: "quiet", label: "שעות שקט ושבת", hint: "הגדרות הודעות", kw: "שעות שקט שבת הגדרות" });
  }
  list.push(
    { id: "qr", label: "הורדת כרטיס QR", hint: "כרטיס QR", kw: "qr כרטיס הורד" },
    { id: "std", label: "עריכת Save the Date", hint: "דף אירוע", kw: "save the date שמור תאריך" },
    { id: "export", label: "ייצוא רשימת אורחים ל-Excel", hint: "אורחים", kw: "ייצוא אקסל excel הורדה export csv" },
    { id: "plan", label: "החבילה והתוספות שלי", hint: "חבילה", kw: "חבילה תוספות תשלום שדרוג" },
    { id: "upload", label: "עמוד העלאת תמונות לאורחים", hint: "עמוד העלאה", kw: "העלאה עמוד upload" },
    { id: "gallery", label: "הגדרות האלבום החי", hint: "אלבום חי", kw: "אלבום חי גלריה מסך gallery" }
  );
  return list;
}

export function buildHelp(opts: { messaging: boolean }): SearchHelp[] {
  const list: SearchHelp[] = [{ id: "h-import", label: "איך מייבאים אורחים מקובץ Excel?", path: "/event/guests" }];
  if (opts.messaging) {
    list.push({ id: "h-shabbat", label: "למה הודעה לא נשלחה בשבת?", path: "/event/messages/rsvp" });
    list.push({ id: "h-resched", label: "איך משנים מועד של הודעה מתוזמנת?", path: "/event/messages/queue" });
  }
  list.push({ id: "h-approve", label: "איך מאשרים תמונות לפני שהן מוצגות?", path: "/event/assets" });
  return list;
}

export function buildPages(nav: { text: string; path: string }[]): SearchPage[] {
  return nav.map((n) => ({ id: "p-" + n.path, label: n.text, path: n.path }));
}
