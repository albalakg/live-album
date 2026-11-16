import {
  QR_CATEGORIES,
  QR_CATEGORY_FILTERS,
  categoryLabel,
  type QrCategoryId,
} from "@/helpers/qrCardCategories";
import {
  QR_CARD_DESIGNS_V2,
  isV2DesignFile,
  type QrV2Design,
} from "@/helpers/qrCardDesignsV2";

export { QR_CATEGORIES, QR_CATEGORY_FILTERS, categoryLabel, isV2DesignFile };
export type { QrCategoryId };

/** @deprecated Prefer QR_CATEGORY_FILTERS — kept for older imports. */
export const QR_STYLES = QR_CATEGORIES;

/**
 * Style chips shown in the template picker (Hebrew category row).
 */
export const QR_STYLE_FILTERS = QR_CATEGORY_FILTERS;

export const QR_EVENT_TYPES = [
  { id: "wedding", label: "חתונה" },
  { id: "barmitzvah", label: "בר / בת מצווה" },
  { id: "birthday", label: "יום הולדת" },
  { id: "brit", label: "ברית ובריתה" },
  { id: "corporate", label: "אירוע חברה" },
  { id: "party", label: "מסיבה" },
  { id: "festival", label: "פסטיבל" },
] as const;

export type QrStyleId = string;
export type QrEventTypeId = (typeof QR_EVENT_TYPES)[number]["id"];

export interface QrCardDesign {
  id: string;
  file: string;
  label: string;
  /** Primary category / legacy style id */
  style: QrStyleId;
  /** All filter categories this card belongs to */
  categories: QrCategoryId[];
  eventTypes: QrEventTypeId[];
  qrColor?: string;
  qrBackground?: "transparent" | string;
  textColor?: string;
  inverted?: boolean;
  hideCta?: boolean;
  /** Solid white quiet-zone plate under the QR (required for scanability). */
  whitePlate: boolean;
  renderer: "image" | "css";
}

function img(
  partial: Omit<QrCardDesign, "renderer" | "whitePlate" | "categories"> & {
    categories?: QrCategoryId[];
  }
): QrCardDesign {
  const categories =
    partial.categories && partial.categories.length
      ? partial.categories
      : ([partial.style] as QrCategoryId[]);
  return {
    ...partial,
    categories,
    whitePlate: true,
    renderer: "image",
  };
}

function fromV2(d: QrV2Design): QrCardDesign {
  return {
    id: d.id,
    file: d.file,
    label: d.label,
    style: d.style,
    categories: d.categories,
    eventTypes: d.eventTypes as QrEventTypeId[],
    qrColor: d.qrColor,
    qrBackground: d.qrBackground,
    textColor: d.textColor,
    inverted: d.inverted,
    hideCta: d.hideCta,
    whitePlate: true,
    renderer: "css",
  };
}

/**
 * Shipping PNG library (kept intact) plus CSS/SVG v2 designs.
 * Existing rows keep today's colours; whitePlate is declared for every card.
 */
export const QR_CARD_CATALOG_LEGACY: QrCardDesign[] = [
  img({ id: "flowers", file: "qr-card-flowers.webp", label: "פרחים", style: "flowers", categories: ["flowers", "floral", "wedding"], eventTypes: ["wedding", "birthday", "brit"] }),
  img({ id: "flowers-2", file: "qr-card-flowers-2.webp", label: "פרחים 2", style: "flowers", categories: ["flowers", "floral"], eventTypes: ["wedding", "party"] }),
  img({ id: "flowers-3", file: "qr-card-flowers-3.webp", label: "פרחים 3", style: "flowers", categories: ["flowers", "floral", "barmitzvah"], eventTypes: ["barmitzvah", "birthday"] }),
  img({ id: "flowers-4", file: "qr-card-flowers-4.webp", label: "פרחים 4", style: "flowers", categories: ["flowers", "floral", "brit"], eventTypes: ["brit", "birthday"] }),
  img({ id: "flowers-5", file: "qr-card-flowers-5.png", label: "פרחים 5", style: "flowers", categories: ["flowers", "floral", "festival"], eventTypes: ["wedding", "festival"] }),
  img({ id: "nature", file: "qr-card-nature.png", label: "טבע", style: "nature", categories: ["nature", "tropical"], eventTypes: ["festival", "party", "birthday"] }),
  img({ id: "gold", file: "qr-card-gold.png", label: "זהב לבן", style: "gold", categories: ["gold", "wedding"], eventTypes: ["wedding", "corporate"] }),
  img({ id: "gold-2", file: "qr-card-gold-2.png", label: "זהב לבן 2", style: "gold", categories: ["gold", "wedding", "barmitzvah"], eventTypes: ["wedding", "barmitzvah"] }),
  img({ id: "gold-3", file: "qr-card-gold-3.png", label: "זהב לבן 3", style: "gold", categories: ["gold", "corporate"], eventTypes: ["corporate", "wedding"] }),
  img({ id: "marble", file: "qr-card-marble.png", label: "שיש מוזהב", style: "marble", categories: ["marble", "gold", "corporate"], eventTypes: ["corporate", "wedding"] }),
  img({ id: "marble-2", file: "qr-card-marble-2.png", label: "שיש מוזהב 2", style: "marble", categories: ["marble", "gold"], eventTypes: ["wedding", "barmitzvah", "corporate"] }),

  img({ id: "minimal", file: "qr-card-minimal.png", label: "קשת", style: "minimal", categories: ["minimal", "wedding"], eventTypes: ["wedding", "corporate"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true }),
  img({ id: "minimal-2", file: "qr-card-minimal-2.png", label: "אספרסו", style: "minimal", categories: ["minimal", "dark"], eventTypes: ["wedding", "corporate"], qrColor: "#12100e", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true }),
  img({ id: "minimal-3", file: "qr-card-minimal-3.png", label: "מונוגרמה", style: "minimal", categories: ["minimal", "wedding"], eventTypes: ["wedding"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true }),
  img({ id: "minimal-4", file: "qr-card-minimal-4.png", label: "בוטני", style: "minimal", categories: ["minimal", "floral"], eventTypes: ["wedding"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true }),
  img({ id: "minimal-5", file: "qr-card-minimal-5.png", label: "אות דפוס", style: "minimal", categories: ["minimal"], eventTypes: ["wedding", "corporate"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true }),
  img({ id: "minimal-6", file: "qr-card-minimal-6.png", label: "גיליון", style: "minimal", categories: ["minimal", "corporate"], eventTypes: ["wedding", "corporate"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true }),

  img({ id: "playful", file: "qr-card-playful.png", label: "בר מצווה", style: "playful", categories: ["playful", "barmitzvah"], eventTypes: ["barmitzvah"], qrColor: "#0E3B38", qrBackground: "transparent", textColor: "#0E3B38", inverted: false, hideCta: true }),
  img({ id: "playful-2", file: "qr-card-playful-2.png", label: "בת מצווה", style: "playful", categories: ["playful", "barmitzvah"], eventTypes: ["barmitzvah", "birthday"], qrColor: "#3E2428", qrBackground: "transparent", textColor: "#3E2428", inverted: false, hideCta: true }),
  img({ id: "playful-3", file: "qr-card-playful-3.png", label: "יום הולדת", style: "playful", categories: ["playful", "birthday"], eventTypes: ["birthday"], qrColor: "#6B2A32", qrBackground: "transparent", textColor: "#6B2A32", inverted: false, hideCta: true }),
  img({ id: "playful-4", file: "qr-card-playful-4.png", label: "חגיגה", style: "playful", categories: ["playful", "birthday"], eventTypes: ["birthday", "party"], qrColor: "#2E1438", qrBackground: "transparent", textColor: "#2E1438", inverted: false, hideCta: true }),
  img({ id: "playful-5", file: "qr-card-playful-5.png", label: "שרבוטים", style: "playful", categories: ["playful", "kids"], eventTypes: ["birthday", "party"], qrColor: "#1A3A42", qrBackground: "transparent", textColor: "#1A3A42", inverted: false, hideCta: true }),
  img({ id: "playful-6", file: "qr-card-playful-6.png", label: "כרטיסייה", style: "playful", categories: ["playful", "general"], eventTypes: ["party", "birthday", "barmitzvah"], qrColor: "#0E3B38", qrBackground: "transparent", textColor: "#0E3B38", inverted: false, hideCta: true }),

  img({ id: "brit", file: "qr-card-brit.png", label: "שמיים", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#121C2A", qrBackground: "transparent", textColor: "#121C2A", inverted: false, hideCta: true }),
  img({ id: "brit-2", file: "qr-card-brit-2.png", label: "זית", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#2C3828", qrBackground: "transparent", textColor: "#2C3828", inverted: false, hideCta: true }),
  img({ id: "brit-3", file: "qr-card-brit-3.png", label: "ירח", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#121C2A", qrBackground: "transparent", textColor: "#121C2A", inverted: false, hideCta: true }),
  img({ id: "brita", file: "qr-card-brita.png", label: "נשימה", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#3E2428", qrBackground: "transparent", textColor: "#3E2428", inverted: false, hideCta: true }),
  img({ id: "brita-2", file: "qr-card-brita-2.png", label: "אפרסק", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#5A3228", qrBackground: "transparent", textColor: "#5A3228", inverted: false, hideCta: true }),
  img({ id: "brita-3", file: "qr-card-brita-3.png", label: "לילך", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#3A2A48", qrBackground: "transparent", textColor: "#3A2A48", inverted: false, hideCta: true }),
  img({ id: "baby", file: "qr-card-baby.png", label: "קשת", style: "baby", categories: ["baby", "brit", "kids"], eventTypes: ["brit"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true }),
  img({ id: "baby-2", file: "qr-card-baby-2.png", label: "חיטה", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#3A2C20", qrBackground: "transparent", textColor: "#3A2C20", inverted: false, hideCta: true }),
  img({ id: "brit-4", file: "qr-card-brit-4.png", label: "נדנדה", style: "baby", categories: ["baby", "brit", "kids"], eventTypes: ["brit"], qrColor: "#121C2A", qrBackground: "transparent", textColor: "#121C2A", inverted: false, hideCta: true }),
  img({ id: "brit-5", file: "qr-card-brit-5.png", label: "רעשן", style: "baby", categories: ["baby", "brit", "kids"], eventTypes: ["brit"], qrColor: "#2C3828", qrBackground: "transparent", textColor: "#2C3828", inverted: false, hideCta: true }),
  img({ id: "brita-4", file: "qr-card-brita-4.png", label: "כביסה", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#3E2428", qrBackground: "transparent", textColor: "#3E2428", inverted: false, hideCta: true }),
  img({ id: "brita-5", file: "qr-card-brita-5.png", label: "דובי", style: "baby", categories: ["baby", "brit", "kids"], eventTypes: ["brit"], qrColor: "#5A3228", qrBackground: "transparent", textColor: "#5A3228", inverted: false, hideCta: true }),
  img({ id: "baby-3", file: "qr-card-baby-3.png", label: "קוביות", style: "baby", categories: ["baby", "brit", "kids"], eventTypes: ["brit"], qrColor: "#3A2C20", qrBackground: "transparent", textColor: "#3A2C20", inverted: false, hideCta: true }),
  img({ id: "baby-4", file: "qr-card-baby-4.png", label: "חסידה", style: "baby", categories: ["baby", "brit"], eventTypes: ["brit"], qrColor: "#2C3828", qrBackground: "transparent", textColor: "#2C3828", inverted: false, hideCta: true }),

  img({ id: "festival", file: "qr-card-festival.png", label: "שקיעה", style: "festival", categories: ["festival", "retro"], eventTypes: ["festival", "party"], qrColor: "#000000", qrBackground: "transparent", textColor: "#000000", inverted: false, hideCta: true }),
  img({ id: "festival-2", file: "qr-card-festival-2.png", label: "מדבר", style: "festival", categories: ["festival", "boho"], eventTypes: ["festival", "party"], qrColor: "#2A1C14", qrBackground: "transparent", textColor: "#2A1C14", inverted: false, hideCta: true }),
  img({ id: "festival-3", file: "qr-card-festival-3.png", label: "ניאון", style: "festival", categories: ["festival", "neon", "dark"], eventTypes: ["festival", "party"], qrColor: "#12100e", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true }),
  img({ id: "festival-4", file: "qr-card-festival-4.png", label: "בוהו", style: "festival", categories: ["festival", "boho"], eventTypes: ["festival", "party"], qrColor: "#2A1C14", qrBackground: "transparent", textColor: "#2A1C14", inverted: false, hideCta: true }),
  img({ id: "festival-5", file: "qr-card-festival-5.png", label: "רטרו", style: "festival", categories: ["festival", "retro"], eventTypes: ["festival", "party"], qrColor: "#4A2818", qrBackground: "transparent", textColor: "#4A2818", inverted: false, hideCta: true }),
  img({ id: "festival-6", file: "qr-card-festival-6.png", label: "קונפטי", style: "festival", categories: ["festival", "birthday"], eventTypes: ["festival", "party"], qrColor: "#3A243A", qrBackground: "transparent", textColor: "#3A243A", inverted: false, hideCta: true }),

  img({ id: "corporate", file: "qr-card-corporate.png", label: "זהב", style: "corporate", categories: ["corporate", "gold", "dark"], eventTypes: ["corporate"], qrColor: "#12100e", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true }),
  img({ id: "corporate-2", file: "qr-card-corporate-2.png", label: "חגיגה", style: "corporate", categories: ["corporate", "dark"], eventTypes: ["corporate"], qrColor: "#12100e", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true }),
  img({ id: "corporate-3", file: "qr-card-corporate-3.png", label: "זכוכית", style: "corporate", categories: ["corporate", "minimal"], eventTypes: ["corporate"], qrColor: "#1A2830", qrBackground: "transparent", textColor: "#1A2830", inverted: false, hideCta: true }),
  img({ id: "corporate-4", file: "qr-card-corporate-4.png", label: "אבן", style: "corporate", categories: ["corporate"], eventTypes: ["corporate"], qrColor: "#3A2C20", qrBackground: "transparent", textColor: "#3A2C20", inverted: false, hideCta: true }),
  img({ id: "corporate-5", file: "qr-card-corporate-5.png", label: "בלוק", style: "corporate", categories: ["corporate", "geometric"], eventTypes: ["corporate"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true }),
  img({ id: "corporate-6", file: "qr-card-corporate-6.png", label: "גאלה", style: "corporate", categories: ["corporate", "gold", "dark"], eventTypes: ["corporate"], qrColor: "#12100e", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true }),
];

export const QR_CARD_CATALOG: QrCardDesign[] = [
  ...QR_CARD_CATALOG_LEGACY,
  ...QR_CARD_DESIGNS_V2.map(fromV2),
];

export function findQrCardByFile(file: string | null | undefined): QrCardDesign | undefined {
  if (!file) return undefined;
  return QR_CARD_CATALOG.find((card) => card.file === file || card.id === file);
}

export function filterQrCards(style: string, eventType: string): QrCardDesign[] {
  return QR_CARD_CATALOG.filter((card) => {
    const styleOk =
      style === "all" ||
      card.style === style ||
      card.categories.includes(style as QrCategoryId);
    const eventOk =
      eventType === "all" ||
      card.eventTypes.includes(eventType as QrEventTypeId);
    return styleOk && eventOk;
  });
}

/** Registry invariants for unit / smoke checks. */
export function assertQrCatalogInvariants(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const files = new Set<string>();
  const validCats = new Set(QR_CATEGORIES.map((c) => c.id));
  for (const card of QR_CARD_CATALOG) {
    if (ids.has(card.id)) errors.push(`duplicate id: ${card.id}`);
    ids.add(card.id);
    if (files.has(card.file)) errors.push(`duplicate file: ${card.file}`);
    files.add(card.file);
    if (!card.whitePlate) errors.push(`${card.id}: whitePlate must be true`);
    if (!card.label.trim()) errors.push(`${card.id}: empty label`);
    for (const cat of card.categories) {
      if (!validCats.has(cat)) errors.push(`${card.id}: unknown category ${cat}`);
    }
  }
  return errors;
}
