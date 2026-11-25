/**
 * Browser-side spreadsheet I/O for the guest import/export (no extra dependency:
 * .xlsx is a zip of XML, read/written with fflate + DOMParser).
 */
import { strToU8, unzipSync, zipSync } from "fflate";
import { ImportField } from "./types";

export interface ParsedSheet {
  headers: string[];
  rows: string[][];
  /** 1-based spreadsheet line of each data row (for error messages). */
  lines: number[];
  sheetName: string;
}

export const MAX_IMPORT_BYTES = 8 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 5000;

export class SpreadsheetError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SpreadsheetError.prototype);
    this.name = "SpreadsheetError";
  }
}

export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  if (file.size > MAX_IMPORT_BYTES) throw new SpreadsheetError("הקובץ גדול מדי (עד 8MB)");
  const name = file.name.toLowerCase();
  const buf = new Uint8Array(await file.arrayBuffer());
  const isZip = buf[0] === 0x50 && buf[1] === 0x4b;
  if (name.endsWith(".xls") && !isZip) {
    throw new SpreadsheetError("קובץ ‎.xls‎ ישן לא נתמך. שמרו אותו כ-‎.xlsx‎ או ‎.csv‎ ונסו שוב");
  }
  let grid: { rows: string[][]; sheetName: string };
  if (isZip) {
    grid = parseXlsx(buf);
  } else if (name.endsWith(".csv") || name.endsWith(".txt") || name.endsWith(".tsv") || !name.includes(".")) {
    grid = { rows: parseCsv(decodeText(buf)), sheetName: file.name };
  } else {
    throw new SpreadsheetError("אפשר לייבא קובצי ‎.xlsx‎ או ‎.csv‎ בלבד");
  }
  return toSheet(grid.rows, grid.sheetName);
}

function toSheet(all: string[][], sheetName: string): ParsedSheet {
  const clean = (v: string) => String(v ?? "").replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, "").trim();
  const headerIdx = all.findIndex((r) => r.some((c) => clean(c) !== ""));
  if (headerIdx < 0) throw new SpreadsheetError("הקובץ ריק");
  const width = Math.max(...all.slice(headerIdx, headerIdx + 50).map((r) => r.length));
  const headers = Array.from({ length: width }, (_, i) => clean(all[headerIdx][i] ?? "") || `עמודה ${i + 1}`);
  const rows: string[][] = [];
  const lines: number[] = [];
  for (let i = headerIdx + 1; i < all.length; i++) {
    const r = Array.from({ length: width }, (_, c) => clean(all[i][c] ?? ""));
    if (r.every((c) => c === "")) continue;
    rows.push(r);
    lines.push(i + 1);
  }
  if (!rows.length) throw new SpreadsheetError("לא נמצאו שורות מתחת לכותרות");
  if (rows.length > MAX_IMPORT_ROWS) throw new SpreadsheetError(`יותר מ-${MAX_IMPORT_ROWS.toLocaleString("he-IL")} שורות. פצלו לכמה קבצים`);
  return { headers, rows, lines, sheetName };
}

/* ───────── CSV ───────── */

export function decodeText(buf: Uint8Array): string {
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return new TextDecoder("utf-8").decode(buf.subarray(3));
  if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder("utf-16le").decode(buf.subarray(2));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    // Hebrew Excel on Windows saves CSV as windows-1255
    return new TextDecoder("windows-1255").decode(buf);
  }
}

export function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const counts: [string, number][] = [",", ";", "\t"].map((d) => [d, firstLine.split(d).length - 1]);
  counts.sort((a, b) => b[1] - a[1]);
  const delim = counts[0][1] > 0 ? counts[0][0] : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"' && field === "") quoted = true;
    else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/* ───────── XLSX read ───────── */

function xml(files: Record<string, Uint8Array>, path: string): Document | null {
  const f = files[path];
  if (!f) return null;
  return new DOMParser().parseFromString(new TextDecoder("utf-8").decode(f), "application/xml");
}

function els(node: Document | Element, tag: string): Element[] {
  return Array.from(node.getElementsByTagNameNS("*", tag));
}

function colIndex(ref: string): number {
  const letters = (ref.match(/^[A-Z]+/i)?.[0] || "A").toUpperCase();
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function numberText(v: string): string {
  if (!/^-?\d+(\.\d+)?(E[+-]?\d+)?$/i.test(v)) return v;
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  // Phones stored as numbers lose their leading zero; integers print without exponent.
  if (Number.isInteger(n)) return Math.abs(n) < 1e21 ? n.toFixed(0) : v;
  return String(Math.round(n * 1e6) / 1e6);
}

export function parseXlsx(buf: Uint8Array): { rows: string[][]; sheetName: string } {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(buf, {
      filter: (f) => (f.name.startsWith("xl/") && f.name.endsWith(".xml")) || f.name.endsWith(".rels"),
    });
  } catch {
    throw new SpreadsheetError("לא הצלחנו לפתוח את הקובץ. ודאו שזה קובץ Excel תקין");
  }

  const shared: string[] = [];
  const sst = xml(files, "xl/sharedStrings.xml");
  if (sst) {
    els(sst, "si").forEach((si) => {
      shared.push(els(si, "t").map((t) => t.textContent || "").join(""));
    });
  }

  // First sheet in workbook order
  let sheetPath = "xl/worksheets/sheet1.xml";
  let sheetName = "Sheet1";
  const wb = xml(files, "xl/workbook.xml");
  const rels = xml(files, "xl/_rels/workbook.xml.rels");
  const firstSheet = wb ? els(wb, "sheet")[0] : null;
  if (firstSheet) {
    sheetName = firstSheet.getAttribute("name") || sheetName;
    const rid =
      firstSheet.getAttribute("r:id") ||
      firstSheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
    const rel = rels && rid ? els(rels, "Relationship").find((r) => r.getAttribute("Id") === rid) : null;
    const target = rel?.getAttribute("Target");
    if (target) sheetPath = target.startsWith("/") ? target.slice(1) : "xl/" + target.replace(/^\.\//, "");
  }
  const sheet = xml(files, sheetPath) || xml(files, Object.keys(files).find((k) => k.startsWith("xl/worksheets/sheet")) || "");
  if (!sheet) throw new SpreadsheetError("לא נמצא גיליון בקובץ");

  const rows: string[][] = [];
  els(sheet, "row").forEach((rowEl, idx) => {
    const rAttr = Number(rowEl.getAttribute("r")) || idx + 1;
    const out: string[] = [];
    els(rowEl, "c").forEach((c, ci) => {
      const ref = c.getAttribute("r");
      const col = ref ? colIndex(ref) : ci;
      const type = c.getAttribute("t");
      const v = els(c, "v")[0]?.textContent ?? "";
      let text = "";
      if (type === "s") text = shared[Number(v)] ?? "";
      else if (type === "inlineStr") text = els(c, "t").map((t) => t.textContent || "").join("");
      else if (type === "b") text = v === "1" ? "TRUE" : "FALSE";
      else if (type === "str" || type === "e") text = v;
      else text = numberText(v);
      out[col] = text;
    });
    rows[rAttr - 1] = Array.from(out, (x) => x ?? "");
  });
  return { rows: Array.from(rows, (r) => r ?? []), sheetName };
}

/* ───────── XLSX write ───────── */

const esc = (s: string) =>
  s
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function colName(i: number): string {
  let s = "";
  i++;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

/** Minimal RTL workbook. Strings are inline; numbers stay numeric. Header row bold. */
export function buildXlsx(sheetName: string, rows: (string | number | null)[][], widths: number[] = []): Blob {
  const body = rows
    .map((r, ri) => {
      const cells = r
        .map((v, ci) => {
          const ref = `${colName(ci)}${ri + 1}`;
          const style = ri === 0 ? ' s="1"' : "";
          if (v === null || v === "") return "";
          if (typeof v === "number" && Number.isFinite(v)) return `<c r="${ref}"${style}><v>${v}</v></c>`;
          // Formula guard for spreadsheet apps
          let s = String(v);
          if (/^[=+\-@]/.test(s) && !/^\+?\d[\d\s-]*$/.test(s)) s = "'" + s;
          return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${esc(s)}</t></is></c>`;
        })
        .join("");
      return `<row r="${ri + 1}">${cells}</row>`;
    })
    .join("");
  const cols = widths.length
    ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>`
    : "";
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" rightToLeft="1"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${cols}<sheetData>${body}</sheetData></worksheet>`;
  const safeName = esc(sheetName.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Sheet1");
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`
    ),
    "_rels/.rels": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
    ),
    "xl/workbook.xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets></workbook>`
    ),
    "xl/_rels/workbook.xml.rels": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
    ),
    "xl/styles.xml": strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0"/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>`
    ),
    "xl/worksheets/sheet1.xml": strToU8(sheet),
  };
  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ───────── column mapping ───────── */

export const FIELD_LABELS: Record<ImportField | "ignore", string> = {
  full_name: "שם מלא",
  first_name: "שם פרטי",
  last_name: "שם משפחה",
  phone: "טלפון",
  email: "מייל",
  party_size: "מספר מגיעים",
  group: "קבוצה",
  side: "צד",
  status: "אישור הגעה",
  notes: "הערות",
  ignore: "לא לייבא",
};

const ALIASES: Record<ImportField, string[]> = {
  full_name: ["שם מלא", "שם האורח", "שם אורח", "שם", "אורח", "מוזמן", "שם המוזמן", "full name", "fullname", "name", "guest", "guest name"],
  first_name: ["שם פרטי", "first name", "firstname", "first"],
  last_name: ["שם משפחה", "last name", "lastname", "surname", "family name"],
  phone: ["טלפון", "טלפון נייד", "נייד", "פלאפון", "סלולרי", "מספר טלפון", "מס טלפון", "phone", "mobile", "cell", "phone number", "tel"],
  email: ["מייל", "אימייל", "דואל", "דוא\"ל", "email", "e-mail", "mail"],
  party_size: ["כמות", "כמה מגיעים", "מספר מגיעים", "מגיעים", "מספר אורחים", "מוזמנים", "כמות מוזמנים", "מנות", "כמות מנות", "party size", "count", "guests", "qty", "quantity", "pax"],
  group: ["קבוצה", "קטגוריה", "שיוך", "קרבה", "group", "category"],
  side: ["צד", "צד חתן/כלה", "של מי", "side"],
  status: ["סטטוס", "אישור הגעה", "אישור", "הגעה", "rsvp", "status"],
  notes: ["הערות", "הערה", "notes", "note", "comments", "comment"],
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/["'׳״`.:_\-()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function autoMap(headers: string[]): (ImportField | "ignore")[] {
  const used = new Set<ImportField>();
  const result: (ImportField | "ignore")[] = headers.map(() => "ignore");
  // exact first, then contains
  for (const pass of ["exact", "contains"] as const) {
    headers.forEach((h, i) => {
      if (result[i] !== "ignore") return;
      const n = norm(h);
      for (const field of Object.keys(ALIASES) as ImportField[]) {
        if (used.has(field)) continue;
        const hit = ALIASES[field].some((a) => (pass === "exact" ? norm(a) === n : n.includes(norm(a)) && norm(a).length >= 3));
        if (hit) {
          result[i] = field;
          used.add(field);
          return;
        }
      }
    });
  }
  return result;
}
