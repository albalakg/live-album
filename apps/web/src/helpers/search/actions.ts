/** Inline quick actions per result type (safe ones only). */
import type { SearchItem } from "./engine";

export interface ActionButton {
  a: string;
  label: string;
  cls: string;
}

/** Only safe inline actions; "send now" and edits open the real screen (approved rule). */
export function actionsFor(it: SearchItem, opts: { canSeat: boolean }): ActionButton[] {
  const b = (a: string, label: string, cls = "btn-paper"): ActionButton => ({ a, label, cls });
  if (it.type === "guest") {
    const g = it.g;
    const out: ActionButton[] = [];
    if (g.status !== "confirmed") out.push(b("confirm", "✓ אשרו הגעה", "btn-gold"));
    out.push(b("table", opts.canSeat ? (g.table ? "העבירו שולחן" : "שבצו לשולחן") : "פתחו בהושבה"));
    out.push(b("msg", "שלחו הודעה"));
    if (g.phone) {
      out.push(b("copy", "העתיקו טלפון"));
      out.push(b("wa", "פתחו ב-WhatsApp"));
    }
    out.push(b("open", "כרטיס אורח"));
    return out;
  }
  if (it.type === "photo") {
    const out: ActionButton[] = [];
    if (it.ph.status !== "approved") out.push(b("ph-approve", "✓ אשרו", "btn-gold"));
    if (it.ph.status !== "hidden") out.push(b("ph-hide", "הסתירו"));
    out.push(b("ph-fav", it.ph.fav ? "★ הסירו ממועדפות" : "★ מועדפת"));
    out.push(b("ph-dl", "הורידו"));
    if (it.ph.status === "approved") out.push(b("ph-open", "פתחו בקבצים"));
    return out;
  }
  if (it.type === "table") return [b("open-table", "פתחו בהושבה", "btn-gold"), b("add-to-table", "הוסיפו אורח")];
  if (it.type === "message") {
    const m = it.msg;
    if (m.status === "sent" || m.status === "partial" || !m.editable) return [b("open", "צפו בדוח", "btn-gold"), b("dup", "שכפלו")];
    const out = [b("resched", "שנו מועד", "btn-gold")];
    if (m.rawStatus === "scheduled") out.push(b("pause", "השהו"));
    out.push(b("sendnow", "שלחו עכשיו"));
    out.push(b("open", "ערכו"));
    return out;
  }
  if (it.type === "reply") return [b("open", "פתחו שיחה", "btn-gold"), b("msg", "השיבו")];
  return [b("run-cmd", it.type === "page" ? "עברו" : "הפעלה", "btn-gold")];
}
