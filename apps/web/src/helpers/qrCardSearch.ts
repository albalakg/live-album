/**
 * QR card gallery search + multi-select filtering.
 * Hebrew-friendly: strips niqqud/cantillation, folds final letters (ךםןףץ),
 * lower-cases Latin, and treats punctuation (/ - ׳ ״ " ') as spaces. Substring match, with a
 * fallback that ignores ו/י so plene and defective spellings find each other.
 */
import {
  QR_CARD_CATALOG,
  QR_EVENT_TYPES,
  categoryLabel,
  type QrCardDesign,
  type QrCategoryId,
  type QrEventTypeId,
} from "@/helpers/qrCardCatalog";

const FINALS: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

export function normalizeQrSearch(input: string): string {
  return String(input || "")
    .normalize("NFKD")
    .replace(/[\u0591-\u05C7]/g, "") // niqqud + cantillation
    .replace(/[\u0300-\u036f]/g, "") // Latin diacritics
    .replace(/[ךםןףץ]/g, (ch) => FINALS[ch] || ch)
    .toLowerCase()
    .replace(/[/\\\-_.,:;'"`׳״()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Spelling-tolerant form: drops matres lectionis (ו / י) so ktiv haser (חתנה) finds ktiv male (חתונה). */
export function looseQrSearch(normalized: string): string {
  return normalized.replace(/[וי]/g, "");
}

const eventLabel = (id: string) => QR_EVENT_TYPES.find((t) => t.id === id)?.label || id;

/** Name, style, categories ("tags") and event types, normalised once per card. */
export function qrCardSearchText(card: QrCardDesign): string {
  const parts = [
    card.label,
    card.id,
    card.style,
    categoryLabel(card.style),
    ...card.categories.map((c) => `${c} ${categoryLabel(c)}`),
    ...card.eventTypes.map((e) => `${e} ${eventLabel(e)}`),
  ];
  return normalizeQrSearch(parts.join(" "));
}

const textCache = new Map<string, { exact: string; loose: string }>();
function cachedText(card: QrCardDesign): { exact: string; loose: string } {
  let t = textCache.get(card.id);
  if (t === undefined) {
    const exact = qrCardSearchText(card);
    t = { exact, loose: looseQrSearch(exact) };
    textCache.set(card.id, t);
  }
  return t;
}

export interface QrCardFilterState {
  query: string;
  /** OR within the list; empty = all */
  styles: string[];
  /** OR within the list; empty = all */
  eventTypes: string[];
}

/** AND across search / styles / event types; OR inside each multi-select. */
export function filterQrCardsBy(
  state: QrCardFilterState,
  cards: QrCardDesign[] = QR_CARD_CATALOG
): QrCardDesign[] {
  const q = normalizeQrSearch(state.query);
  const terms = q ? q.split(" ") : [];
  return cards.filter((card) => {
    if (
      state.styles.length &&
      !state.styles.some(
        (s) => card.style === s || card.categories.includes(s as QrCategoryId)
      )
    ) {
      return false;
    }
    if (
      state.eventTypes.length &&
      !state.eventTypes.some((e) => card.eventTypes.includes(e as QrEventTypeId))
    ) {
      return false;
    }
    if (!terms.length) return true;
    const text = cachedText(card);
    return terms.every((t) => {
      if (text.exact.includes(t)) return true;
      const loose = looseQrSearch(t);
      return loose.length >= 2 && text.loose.includes(loose);
    });
  });
}
