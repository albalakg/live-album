/**
 * Hebrew-aware text helpers for smart search. Pure functions, no network, no AI.
 * Normalisation: NFC, strip niqqud/cantillation, strip quotes/geresh, fold final letters, lower-case, squeeze spaces.
 */

const FINALS: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

export function foldFinals(s: string): string {
  return s.replace(/[ךםןףץ]/g, (c) => FINALS[c]);
}

export function stripNiqqud(s: string): string {
  return String(s).normalize("NFC").replace(/[\u0591-\u05C7]/g, "");
}

export function norm(s: string | null | undefined): string {
  return foldFinals(stripNiqqud(String(s ?? "")).replace(/["״'׳`]/g, ""))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Same folding as norm() for building regex sources (keeps regex syntax chars). */
export function normRe(s: string): string {
  return foldFinals(stripNiqqud(s));
}

export function re(src: string, flags = ""): RegExp {
  return new RegExp(normRe(src), flags);
}

export function hasHebrew(s: string): boolean {
  return /[\u05D0-\u05EA]/.test(s);
}

/** Phonetic skeleton: ע≈א, ט≈ת, ק≈כ, ו/י dropped inside the word (common spelling variants). */
export function skeleton(w: string): string {
  return w.replace(/ע/g, "א").replace(/ט/g, "ת").replace(/ק/g, "כ").replace(/(?!^)[וי]/g, "");
}

/** Damerau-Levenshtein distance (adjacent swap = 1). */
export function editDistance(a: string, b: string): number {
  const n = a.length;
  const m = b.length;
  if (!n) return m;
  if (!m) return n;
  const d: number[][] = [];
  for (let i = 0; i <= n; i++) {
    d.push(new Array(m + 1).fill(0));
    d[i][0] = i;
  }
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[n][m];
}

/* ───────── keyboard layout (standard Israeli layout ↔ QWERTY) ───────── */

const LATIN_KEYS = "qwertyuiop[]asdfghjkl;'zxcvbnm,./";
const HEBREW_KEYS = "/'קראטוןםפ][שדגכעיחלךף,זסבהנמצתץ.";
const L2H: Record<string, string> = {};
const H2L: Record<string, string> = {};
for (let i = 0; i < LATIN_KEYS.length; i++) {
  L2H[LATIN_KEYS[i]] = HEBREW_KEYS[i];
}
Object.keys(L2H).forEach((k) => {
  H2L[L2H[k]] = k;
});

export function isLatinTyping(s: string): boolean {
  return /^[a-z0-9 ,.;/'[\]]+$/i.test(s) && /[a-z]/i.test(s);
}

/** Text typed in Latin while meaning Hebrew: "sbv" → "דנה". */
export function latinToHebrew(s: string): string {
  return s
    .toLowerCase()
    .split("")
    .map((c) => (c === " " ? " " : L2H[c] || c))
    .join("");
}

/** Text typed in Hebrew while meaning Latin: "קסבקך" → "excel". */
export function hebrewToLatin(s: string): string {
  return s
    .split("")
    .map((c) => (c === " " ? " " : H2L[c] || H2L[FINALS[c] || ""] || c))
    .join("");
}

/* ───────── phones ───────── */

/** Digits only; a leading 972 becomes 0 (so +972 54… == 054…). */
export function phoneDigits(s: string | null | undefined): string {
  let d = String(s ?? "").replace(/\D/g, "");
  if (d.startsWith("972")) d = "0" + d.slice(3);
  return d;
}

/** Display form for Israeli numbers: 050-000-1105 / 03-123-4567; anything else unchanged. */
export function formatPhone(s: string | null | undefined): string {
  const raw = String(s ?? "");
  const d = phoneDigits(raw);
  if (/^05\d{8}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (/^0[2-9]\d{7}$/.test(d)) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  return raw;
}

export function isPhoneQuery(q: string): boolean {
  return /^[\d\s+\-().]+$/.test(q.trim()) && phoneDigits(q).length >= 3;
}

/* ───────── misc ───────── */

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export function hhmm(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}
