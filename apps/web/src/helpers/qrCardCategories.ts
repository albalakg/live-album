/**
 * QR card gallery categories (Hebrew labels, RTL filter chips).
 * Style chips in the gallery use these; event-type chips stay separate.
 */

export const QR_CATEGORIES = [
  { id: "floral", label: "פרחוני" },
  { id: "minimal", label: "מינימליסטי" },
  { id: "neon", label: "ניאון" },
  { id: "retro", label: "רטרו" },
  { id: "boho", label: "בוהו" },
  { id: "art-deco", label: "ארט דקו" },
  { id: "kids", label: "ילדים" },
  { id: "corporate", label: "עסקי" },
  { id: "watercolor", label: "צבעי מים" },
  { id: "gold", label: "זהב" },
  { id: "festival", label: "פסטיבל" },
  { id: "brit", label: "ברית / בייבי" },
  { id: "barmitzvah", label: "בר/בת מצווה" },
  { id: "wedding", label: "חתונה" },
  { id: "birthday", label: "יום הולדת" },
  { id: "dark", label: "כהה ואלגנטי" },
  { id: "tropical", label: "טרופי" },
  { id: "geometric", label: "גיאומטרי" },
  { id: "general", label: "כללי" },
  // Legacy style labels kept for existing PNG library captions
  { id: "flowers", label: "פרחים" },
  { id: "nature", label: "טבע" },
  { id: "marble", label: "שיש" },
  { id: "playful", label: "צבעוני" },
  { id: "baby", label: "ברית ובריתה" },
] as const;

export type QrCategoryId = (typeof QR_CATEGORIES)[number]["id"];

/** Chips shown in the style/category filter row (excludes legacy duplicates). */
export const QR_CATEGORY_FILTERS = [
  { id: "floral", label: "פרחוני" },
  { id: "minimal", label: "מינימליסטי" },
  { id: "neon", label: "ניאון" },
  { id: "retro", label: "רטרו" },
  { id: "boho", label: "בוהו" },
  { id: "art-deco", label: "ארט דקו" },
  { id: "kids", label: "ילדים" },
  { id: "corporate", label: "עסקי" },
  { id: "watercolor", label: "צבעי מים" },
  { id: "gold", label: "זהב" },
  { id: "festival", label: "פסטיבל" },
  { id: "brit", label: "ברית / בייבי" },
  { id: "barmitzvah", label: "בר/בת מצווה" },
  { id: "wedding", label: "חתונה" },
  { id: "birthday", label: "יום הולדת" },
  { id: "dark", label: "כהה ואלגנטי" },
  { id: "tropical", label: "טרופי" },
  { id: "geometric", label: "גיאומטרי" },
  { id: "general", label: "כללי" },
  { id: "flowers", label: "פרחים" },
  { id: "nature", label: "טבע" },
  { id: "marble", label: "שיש" },
  { id: "playful", label: "צבעוני" },
] as const;

export function categoryLabel(id: string): string {
  return QR_CATEGORIES.find((c) => c.id === id)?.label || id;
}
