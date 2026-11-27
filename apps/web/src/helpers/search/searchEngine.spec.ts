/**
 * Unit checks for smart search (matcher, layout swap, phones, nicknames, Hebrew parser, power syntax).
 * The web package has no Jest/Vitest; run via the box harness (compiles with tsc and calls runSearchUnitChecks),
 * same pattern as qrCardCatalog.spec.ts. Fixture data is fake placeholder data.
 */
import { SearchEngine } from "./engine";
import { highlightName, matchPhone, matchText, matchToken } from "./matcher";
import { emptySearchData, SearchData, SearchGuest, SearchGuestStatus, SearchSide } from "./types";
import { formatPhone, hebrewToLatin, isPhoneQuery, latinToHebrew, norm, phoneDigits, skeleton } from "./text";

function guest(id: number, name: string, side: SearchSide, group: string, status: SearchGuestStatus, party: number, table: number | null, phone: string | null, meal: string | null = null, addedDays = 30): SearchGuest {
  return { id, name, side, group, groupId: null, status, party, tableId: table, table: table ? "שולחן " + table : null, phone, email: null, notes: "", meal, wa: [], addedDays };
}

export function searchFixture(): SearchData {
  const d = emptySearchData();
  d.groups = ["משפחת כלה", "משפחת חתן", "חברי צבא", "עבודה", "חברות"];
  d.guests = [
    guest(1, "דנה לוי", "bride", "משפחת כלה", "confirmed", 2, 3, "054-000-1101", "רגיל"),
    guest(2, "דנה כהן", "bride", "חברות", "confirmed", 2, 5, "050-000-1202", "צמחוני"),
    guest(3, "דוד כץ", "groom", "חברי צבא", "invited", 1, null, "052-000-1303"),
    guest(4, "דן לוינסון", "groom", "חברי צבא", "invited", 1, null, "052-000-1104"),
    guest(5, "מיכל כהן", "bride", "משפחת כלה", "invited", 3, 1, "054-000-1106"),
    guest(6, "יעל מזרחי", "bride", "משפחת כלה", "invited", 4, null, null),
    guest(7, "נעם דהן", "groom", "משפחת חתן", "declined", 2, null, "054-000-1112"),
    guest(8, "יוסף מלכה", "groom", "משפחת חתן", "confirmed", 2, 2, "054-000-1121", "רגיל"),
    guest(9, "דניאל פרידמן", "groom", "חברי צבא", "confirmed", 2, 4, "052-000-1122", "צמחוני"),
    guest(10, "שיר אוחנה", "bride", "עבודה", "maybe", 1, null, "050-000-1113"),
    guest(11, "צליל מימון", "bride", "משפחת כלה", "invited", 1, null, "053-000-1129", null, 0),
  ];
  d.tables = [1, 2, 3, 4, 5].map((n) => ({ id: n, key: "t" + n, label: "שולחן " + n, seats: n === 4 ? 2 : 10, note: "", x: n * 50, y: 40, w: 40, h: 40, shape: "round" as const }));
  d.photos = [
    { id: 1, min: 21 * 60 + 10, day: 0, dateLabel: "", time: "21:10", status: "approved", fav: false, kind: "תמונה", uploaderN: 1, thumb: null },
    { id: 2, min: 22 * 60 + 30, day: 0, dateLabel: "", time: "22:30", status: "pending", fav: true, kind: "תמונה", uploaderN: 2, thumb: null },
    { id: 3, min: 23 * 60 + 5, day: 0, dateLabel: "", time: "23:05", status: "approved", fav: false, kind: "סרטון", uploaderN: 1, thumb: null },
    { id: 4, min: 22 * 60 + 40, day: -1, dateLabel: "", time: "22:40", status: "hidden", fav: false, kind: "תמונה", uploaderN: 3, thumb: null },
  ];
  d.messages = [
    { id: 1, title: "תזכורת שבוע לפני", status: "scheduled", rawStatus: "scheduled", kind: "אוטומציה", when: "", audience: 10, version: 1, editable: true },
    { id: 2, title: "הזמנה ראשונה", status: "sent", rawStatus: "sent", kind: "ידנית", when: "", audience: 30, version: 1, editable: false },
  ];
  d.commands = [{ id: "export", label: "ייצוא רשימת אורחים ל-Excel", hint: "אורחים", kw: "ייצוא אקסל excel export csv" }];
  return d;
}

type Check = [string, boolean];

export function runSearchUnitChecks(): { ok: boolean; passed: number; errors: string[] } {
  const e = new SearchEngine(searchFixture());
  const names = (q: string) => e.search(q).guestAll.map((x) => x.g.name);
  const parsed = (q: string) => e.serialize(e.parse(q));
  const checks: Check[] = [
    // normalisation: final letters, niqqud, quotes
    ["final letters fold", norm("כהן") === "כהנ" && norm("ךםןףץ") === "כמנפצ"],
    ["niqqud stripped", norm("כֹּהֵן") === norm("כהן")],
    ["quotes stripped", norm('ד"ר') === "דר"],
    ["final letter in query", names("כהנ").includes("דנה כהן")],
    ["niqqud in query", names("דָּנָה").includes("דנה לוי")],
    // typos and spelling variants
    ["typo 3 letters", names("דנא כוהן")[0] === "דנה כהן"],
    ["skeleton", skeleton("כוהן") === skeleton("כהן") && skeleton("טל") === skeleton("תל")],
    ["typo 4+", names("פרידמנ").includes("דניאל פרידמן") && names("פרדימן").includes("דניאל פרידמן")],
    ["no false typo דנה→דהן", !names("דנה").includes("נעם דהן")],
    ["no false typo דנה→דניאל", !names("דנה").includes("דניאל פרידמן")],
    ["matchToken tiers", matchToken("דנ", "דנה") === "prefix" && matchToken("נה", "דנה") === "sub"],
    // initials
    ["initials דכ", names("דכ").includes("דנה כהן") && names("דכ").includes("דוד כץ")],
    ["initials spaced", names("ד כ").includes("דוד כץ")],
    ["initials highlight", highlightName("דוד כץ", matchText("דוד כץ", "דכ")).filter((s) => s.mark === "hit").length === 2],
    // phones in any format
    ["phone digits +972", phoneDigits("+972 54 000 1101") === "0540001101"],
    ["phone query detect", isPhoneQuery("054-000") && !isPhoneQuery("דנה")],
    ["phone +972", names("+972 54 000 1101")[0] === "דנה לוי"],
    ["phone dashed", names("054-0001101")[0] === "דנה לוי"],
    ["phone suffix", names("1303")[0] === "דוד כץ"],
    ["phone none for no-phone guest", matchPhone(null, "054") === null],
    // nicknames
    ["nickname יוסי", names("יוסי").includes("יוסף מלכה")],
    ["nickname דני", names("דני").includes("דניאל פרידמן")],
    // keyboard layout swap both ways
    ["latin→hebrew map", latinToHebrew("sbv") === "דנה"],
    ["hebrew→latin map", hebrewToLatin("קסבקך") === "excel"],
    ["layout fix search", (() => { const r = e.search("sbv"); return !!r.kb && r.kb.dir === "he" && r.guestAll.some((x) => x.g.name === "דנה לוי"); })()],
    ["layout fix to english", (() => { const r = e.search("קסבקך"); return !!r.kb && r.kb.dir === "en" && r.groups.some((g) => g.type === "commands"); })()],
    ["layout fix off", e.search("sbv", { noFix: true }).empty],
    ["no fuzzy for short latin", !e.search("sbv", { noFix: true }).groups.some((g) => g.type === "commands")],
    // Hebrew phrase parser
    ["nl not answered bride", parsed("מי עוד לא אישר מצד הכלה") === "סטטוס:לא-ענה צד:כלה"],
    ["nl no table", parsed("אורחים בלי שולחן") === "שולחן:ללא"],
    ["nl seated at", parsed("מי יושב בשולחן 4") === "שולחן:4"],
    ["nl declined", parsed("מי לא מגיע") === "סטטוס:סירב"],
    ["nl meal", parsed("אורחים צמחוניים") === "מנה:צמחוני"],
    ["nl no phone", parsed("אורחים בלי טלפון") === "טלפון:חסר"],
    ["nl big parties", parsed("משפחות גדולות") === "מוזמנים:3+"],
    ["nl added today", parsed("נוספו היום") === "נוסף:היום"],
    ["nl group", parsed("מי לא אישר מחברי צבא") === "סטטוס:לא-ענה קבוצה:חברי-צבא"],
    ["nl photos time", parsed("תמונות היום אחרי 22:00") === "יום:היום שעה:22:00-24:00"],
    ["nl photos between", parsed("תמונות בין 21:00 ל-23:00") === "שעה:21:00-23:00"],
    ["nl photos pending", parsed("תמונות ממתינות לאישור") === "תמונה:ממתינה"],
    ["nl videos yesterday", parsed("סרטונים מאתמול").startsWith("סוג:סרטון")],
    ["nl tables free", parsed("שולחנות עם מקומות פנויים") === "מקומות:פנויים"],
    ["nl tables full", parsed("שולחנות מלאים") === "מקומות:מלא"],
    ["nl messages scheduled", parsed("הודעות מתוזמנות") === "הודעה:מתוזמנת"],
    ["nl result count", e.search("מי עוד לא אישר מצד הכלה").guestAll.length === 3],
    ["nl photos result", e.search("תמונות היום אחרי 22:00").groups[0].total === 2],
    ["tables free result", e.search("שולחנות מלאים").groups[0].items.length === 1],
    // power syntax
    ["syntax basic", e.search("שולחן:5 צד:כלה").guestAll.map((x) => x.g.id).join() === "2"],
    ["syntax OR comma", e.search("סטטוס:סירב,אולי").guestAll.length === 2],
    ["syntax negation", e.search("-סטטוס:אישר צד:חתן").guestAll.every((x) => x.g.status !== "confirmed" && x.g.side === "groom")],
    ["syntax או groups", e.search("צד:כלה שולחן:5 או צד:חתן שולחן:4").guestAll.length === 2],
    ["syntax value prefix", parsed("סטטוס:סיר") === "סטטוס:סירב"],
    ["syntax fuzzy key", parsed("סטאטוס:אישר") === "סטטוס:אישר"],
    ["syntax unknown value", e.search("סטטוס:בלבלה").unknown.length === 1],
    ["syntax round trip", (() => { const q = "-סטטוס:סירב צד:כלה,חתן שולחן:ללא מנה:צמחוני,טבעוני"; return parsed(parsed(q)) === parsed(q); })()],
    ["syntax time", parsed("שעה:22-23") === "שעה:22:00-23:00"],
    ["ghost key", e.completion("שו", [])?.suffix === "לחן:"],
    ["ghost value", e.completion("סטטוס:לא", [])?.suffix === "-ענה"],
    ["ghost phrase", e.completion("מי עוד", ["מי עוד לא אישר"])?.suffix === " לא אישר"],
    ["suggestion counts", (e.suggestionRow("סטטוס:")?.items || []).find((i) => i.label === "אישר")?.n === 4],
    ["scope #", e.search("#4").groups.some((g) => g.title === "יושבים בשולחן 4")],
    ["scope >", e.search(">").groups[0].type === "commands"],
    ["facets", e.search("צד:חתן").facets.length > 0],
    ["rescue relax", (() => { const r = e.search("דנה צד:חתן"); return r.empty && r.relax.length === 1 && r.relax[0].q === "דנה"; })()],
    ["rescue did you mean", e.search("דנהה כהנן").dym.length > 0 || e.search("דנהה כהנן").guestAll.length > 0],
    ["phone display mobile", formatPhone("0540001101") === "054-000-1101"],
    ["phone display landline", formatPhone("+972 3 123 4567") === "03-123-4567"],
    ["phone display other", formatPhone("+44 20 7946 0000") === "+44 20 7946 0000"],
    ["syntax cancelled", parsed("סטטוס:ביטל") === "סטטוס:ביטל"],
    ["syntax shared side", parsed("צד:משותף") === "צד:משותף"],
    ["video kind kept", parsed("סרטונים מאתמול").indexOf("סוג:סרטון") >= 0],
    ["messages scheduled no leftover text", parsed("הודעות מתוזמנות").indexOf("טקסט") < 0],
    ["time slider rewrite", e.withTimeRange("תמונות היום אחרי 22:00", 1320, 1380, 1140, 1440) === "יום:היום שעה:22:00-23:00"],
  ];
  const errors = checks.filter((c) => !c[1]).map((c) => c[0]);
  return { ok: errors.length === 0, passed: checks.length - errors.length, errors };
}
