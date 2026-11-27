/**
 * Forgiving name matching, in tiers (higher wins):
 * prefix 100 · substring 80 · nickname 70 · initials 65 · phonetic skeleton 60 · typo 50.
 */
import { NICKNAME_FAMILIES } from "./nicknames";
import { editDistance, hasHebrew, isPhoneQuery, norm, phoneDigits, skeleton } from "./text";

export type MatchHow = "prefix" | "sub" | "nick" | "init" | "phon" | "typo" | "phone" | "group";

export const TIER: Record<MatchHow, number> = { prefix: 100, sub: 80, nick: 70, init: 65, phon: 60, typo: 50, phone: 90, group: 30 };

export interface MatchPart {
  /** index of the matched word in the name */
  i: number;
  how: MatchHow;
  /** normalised query token */
  qt: string;
}

export interface TextMatch {
  score: number;
  how: MatchHow[];
  parts?: MatchPart[];
  initials?: number;
}

const NICKS: string[][] = NICKNAME_FAMILIES.map((f) => f.map(norm));

export function matchToken(qt: string, wt: string): MatchHow | null {
  if (!qt || !wt) return null;
  if (wt.startsWith(qt)) return "prefix";
  if (qt.length >= 2 && wt.includes(qt)) return "sub";
  if (qt.length >= 2) {
    const fam = NICKS.find((f) => f.some((x) => x.startsWith(qt)) && f.some((x) => wt === x || wt.startsWith(x)));
    if (fam) return "nick";
  }
  if (qt.length >= 3 && (skeleton(wt) === skeleton(qt) || skeleton(wt).startsWith(skeleton(qt)))) return "phon";
  const head = wt.slice(0, qt.length);
  // 3-letter Hebrew words: same first letter and exactly one different letter (דנא → דנה, but not דנה → דהן)
  if (qt.length === 3 && hasHebrew(qt) && wt.length === 3 && qt[0] === wt[0] && [0, 1, 2].filter((i) => qt[i] !== wt[i]).length === 1) return "typo";
  if (qt.length >= 4 && (editDistance(wt, qt) <= 1 || editDistance(head, qt) <= 1)) return "typo";
  if (qt.length >= 6 && (editDistance(wt, qt) <= 2 || editDistance(head, qt) <= 2)) return "typo";
  return null;
}

/** Match every query word to a distinct word of the text; falls back to initials ("דכ" → דנה כהן). */
export function matchText(text: string, q: string): TextMatch | null {
  const qts = norm(q).split(" ").filter(Boolean);
  if (!qts.length) return null;
  const wts = norm(text).split(" ").filter(Boolean);
  const used: Record<number, boolean> = {};
  const parts: MatchPart[] = [];
  let total = 0;
  let ok = true;
  for (const qt of qts) {
    let b: MatchPart | null = null;
    for (let i = 0; i < wts.length; i++) {
      if (used[i]) continue;
      const how = matchToken(qt, wts[i]);
      if (how && (!b || TIER[how] > TIER[b.how])) b = { i, how, qt };
    }
    if (!b) {
      ok = false;
      break;
    }
    used[b.i] = true;
    parts.push(b);
    total += TIER[b.how];
  }
  if (ok) return { score: total / qts.length, how: parts.map((p) => p.how), parts };
  const letters = qts.every((x) => x.length === 1) ? qts.join("") : qts.length === 1 && /^[א-ת]{2,3}$/.test(qts[0]) ? qts[0] : "";
  if (letters.length >= 2 && wts.length >= letters.length && letters.split("").every((c, i) => wts[i][0] === c)) {
    return { score: TIER.init, how: ["init"], initials: letters.length };
  }
  return null;
}

export function matchPhone(phone: string | null, q: string): TextMatch | null {
  if (!phone) return null;
  const gd = phoneDigits(phone);
  const qd = phoneDigits(q);
  if (!qd || !gd.includes(qd)) return null;
  return { score: gd.endsWith(qd) ? 95 : 85, how: ["phone"] };
}

export { isPhoneQuery };

export interface HighlightSegment {
  text: string;
  /** "" plain · "hit" exact highlight · "fz" fuzzy letter */
  mark: "" | "hit" | "fz";
}

/** Split a name into highlight segments for the template (no HTML strings). */
export function highlightName(name: string, m: TextMatch | null | undefined): HighlightSegment[] {
  const out: HighlightSegment[] = [];
  const push = (text: string, mark: HighlightSegment["mark"] = "") => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last.mark === mark) last.text += text;
    else out.push({ text, mark });
  };
  const words = name.split(" ");
  words.forEach((w, i) => {
    if (i) push(" ");
    if (!m || (!m.parts && !m.initials)) return push(w);
    if (m.initials) {
      if (i < m.initials) {
        push(w[0], "hit");
        push(w.slice(1));
      } else push(w);
      return;
    }
    const p = (m.parts || []).find((x) => x.i === i);
    if (!p) return push(w);
    const nw = norm(w);
    if (p.how === "prefix" && nw.length === w.length) {
      push(w.slice(0, p.qt.length), "hit");
      push(w.slice(p.qt.length));
      return;
    }
    if (p.how === "sub" && nw.length === w.length) {
      const k = nw.indexOf(p.qt);
      push(w.slice(0, k));
      push(w.slice(k, k + p.qt.length), "hit");
      push(w.slice(k + p.qt.length));
      return;
    }
    let qi = 0;
    w.split("").forEach((c) => {
      if (qi < p.qt.length && norm(c) === p.qt[qi]) {
        qi++;
        push(c, p.how === "prefix" || p.how === "sub" ? "hit" : "fz");
      } else push(c);
    });
  });
  return out;
}

export const HOW_LABEL: Partial<Record<MatchHow, string>> = {
  typo: "תוקנה שגיאת כתיב",
  phon: "כתיב דומה",
  nick: "כינוי / שם נרדף",
  init: "ראשי תיבות",
  phone: "לפי טלפון",
};

export function howLabel(how: MatchHow[] | undefined): string {
  const h = (how || []).find((x) => HOW_LABEL[x]);
  return h ? (HOW_LABEL[h] as string) : "";
}
