export const QR_STYLES = [
  { id: "flowers", label: "פרחים" },
  { id: "nature", label: "טבע" },
  { id: "gold", label: "זהב" },
  { id: "marble", label: "שיש" },
  { id: "minimal", label: "מינימלי" },
  { id: "playful", label: "צבעוני" },
  { id: "baby", label: "ברית ובריתה" },
  { id: "festival", label: "פסטיבל" },
  { id: "corporate", label: "אירועי חברה" },
] as const;

export const QR_EVENT_TYPES = [
  { id: "wedding", label: "חתונה" },
  { id: "barmitzvah", label: "בר / בת מצווה" },
  { id: "birthday", label: "יום הולדת" },
  { id: "brit", label: "ברית ובריתה" },
  { id: "corporate", label: "אירוע חברה" },
  { id: "party", label: "מסיבה" },
  { id: "festival", label: "פסטיבל" },
] as const;

export type QrStyleId = (typeof QR_STYLES)[number]["id"];
export type QrEventTypeId = (typeof QR_EVENT_TYPES)[number]["id"];

export interface QrCardDesign {
  id: string;
  file: string;
  label: string;
  style: QrStyleId;
  eventTypes: QrEventTypeId[];
  qrColor?: string;
  qrBackground?: "transparent" | string;
  textColor?: string;
  inverted?: boolean;
  hideCta?: boolean;
}

/**
 * Shipping cards (11) plus approved clean / brit / festival / corporate libraries.
 * Existing rows omit colour fields and keep today's black QR + dark text.
 */
export const QR_CARD_CATALOG: QrCardDesign[] = [
  { id: "flowers", file: "qr-card-flowers.webp", label: "פרחים", style: "flowers", eventTypes: ["wedding", "birthday", "brit"] },
  { id: "flowers-2", file: "qr-card-flowers-2.webp", label: "פרחים 2", style: "flowers", eventTypes: ["wedding", "party"] },
  { id: "flowers-3", file: "qr-card-flowers-3.webp", label: "פרחים 3", style: "flowers", eventTypes: ["barmitzvah", "birthday"] },
  { id: "flowers-4", file: "qr-card-flowers-4.webp", label: "פרחים 4", style: "flowers", eventTypes: ["brit", "birthday"] },
  { id: "flowers-5", file: "qr-card-flowers-5.png", label: "פרחים 5", style: "flowers", eventTypes: ["wedding", "festival"] },
  { id: "nature", file: "qr-card-nature.png", label: "טבע", style: "nature", eventTypes: ["festival", "party", "birthday"] },
  { id: "gold", file: "qr-card-gold.png", label: "זהב לבן", style: "gold", eventTypes: ["wedding", "corporate"] },
  { id: "gold-2", file: "qr-card-gold-2.png", label: "זהב לבן 2", style: "gold", eventTypes: ["wedding", "barmitzvah"] },
  { id: "gold-3", file: "qr-card-gold-3.png", label: "זהב לבן 3", style: "gold", eventTypes: ["corporate", "wedding"] },
  { id: "marble", file: "qr-card-marble.png", label: "שיש מוזהב", style: "marble", eventTypes: ["corporate", "wedding"] },
  { id: "marble-2", file: "qr-card-marble-2.png", label: "שיש מוזהב 2", style: "marble", eventTypes: ["wedding", "barmitzvah", "corporate"] },

  { id: "minimal", file: "qr-card-minimal.png", label: "קשת", style: "minimal", eventTypes: ["wedding", "corporate"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true },
  { id: "minimal-2", file: "qr-card-minimal-2.png", label: "אספרסו", style: "minimal", eventTypes: ["wedding", "corporate"], qrColor: "#F3EEE6", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true },
  { id: "minimal-3", file: "qr-card-minimal-3.png", label: "מונוגרמה", style: "minimal", eventTypes: ["wedding"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true },
  { id: "minimal-4", file: "qr-card-minimal-4.png", label: "בוטני", style: "minimal", eventTypes: ["wedding"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true },
  { id: "minimal-5", file: "qr-card-minimal-5.png", label: "אות דפוס", style: "minimal", eventTypes: ["wedding", "corporate"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true },
  { id: "minimal-6", file: "qr-card-minimal-6.png", label: "גיליון", style: "minimal", eventTypes: ["wedding", "corporate"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true },

  { id: "playful", file: "qr-card-playful.png", label: "בר מצווה", style: "playful", eventTypes: ["barmitzvah"], qrColor: "#0E3B38", qrBackground: "transparent", textColor: "#0E3B38", inverted: false, hideCta: true },
  { id: "playful-2", file: "qr-card-playful-2.png", label: "בת מצווה", style: "playful", eventTypes: ["barmitzvah", "birthday"], qrColor: "#3E2428", qrBackground: "transparent", textColor: "#3E2428", inverted: false, hideCta: true },
  { id: "playful-3", file: "qr-card-playful-3.png", label: "יום הולדת", style: "playful", eventTypes: ["birthday"], qrColor: "#6B2A32", qrBackground: "transparent", textColor: "#6B2A32", inverted: false, hideCta: true },
  { id: "playful-4", file: "qr-card-playful-4.png", label: "חגיגה", style: "playful", eventTypes: ["birthday", "party"], qrColor: "#2E1438", qrBackground: "transparent", textColor: "#2E1438", inverted: false, hideCta: true },
  { id: "playful-5", file: "qr-card-playful-5.png", label: "שרבוטים", style: "playful", eventTypes: ["birthday", "party"], qrColor: "#1A3A42", qrBackground: "transparent", textColor: "#1A3A42", inverted: false, hideCta: true },
  { id: "playful-6", file: "qr-card-playful-6.png", label: "כרטיסייה", style: "playful", eventTypes: ["party", "birthday", "barmitzvah"], qrColor: "#0E3B38", qrBackground: "transparent", textColor: "#0E3B38", inverted: false, hideCta: true },

  { id: "brit", file: "qr-card-brit.png", label: "שמיים", style: "baby", eventTypes: ["brit"], qrColor: "#121C2A", qrBackground: "transparent", textColor: "#121C2A", inverted: false, hideCta: true },
  { id: "brit-2", file: "qr-card-brit-2.png", label: "זית", style: "baby", eventTypes: ["brit"], qrColor: "#2C3828", qrBackground: "transparent", textColor: "#2C3828", inverted: false, hideCta: true },
  { id: "brit-3", file: "qr-card-brit-3.png", label: "ירח", style: "baby", eventTypes: ["brit"], qrColor: "#121C2A", qrBackground: "transparent", textColor: "#121C2A", inverted: false, hideCta: true },
  { id: "brita", file: "qr-card-brita.png", label: "נשימה", style: "baby", eventTypes: ["brit"], qrColor: "#3E2428", qrBackground: "transparent", textColor: "#3E2428", inverted: false, hideCta: true },
  { id: "brita-2", file: "qr-card-brita-2.png", label: "אפרסק", style: "baby", eventTypes: ["brit"], qrColor: "#5A3228", qrBackground: "transparent", textColor: "#5A3228", inverted: false, hideCta: true },
  { id: "brita-3", file: "qr-card-brita-3.png", label: "לילך", style: "baby", eventTypes: ["brit"], qrColor: "#3A2A48", qrBackground: "transparent", textColor: "#3A2A48", inverted: false, hideCta: true },
  { id: "baby", file: "qr-card-baby.png", label: "קשת", style: "baby", eventTypes: ["brit"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true },
  { id: "baby-2", file: "qr-card-baby-2.png", label: "חיטה", style: "baby", eventTypes: ["brit"], qrColor: "#3A2C20", qrBackground: "transparent", textColor: "#3A2C20", inverted: false, hideCta: true },
  { id: "brit-4", file: "qr-card-brit-4.png", label: "נדנדה", style: "baby", eventTypes: ["brit"], qrColor: "#121C2A", qrBackground: "transparent", textColor: "#121C2A", inverted: false, hideCta: true },
  { id: "brit-5", file: "qr-card-brit-5.png", label: "רעשן", style: "baby", eventTypes: ["brit"], qrColor: "#2C3828", qrBackground: "transparent", textColor: "#2C3828", inverted: false, hideCta: true },
  { id: "brita-4", file: "qr-card-brita-4.png", label: "כביסה", style: "baby", eventTypes: ["brit"], qrColor: "#3E2428", qrBackground: "transparent", textColor: "#3E2428", inverted: false, hideCta: true },
  { id: "brita-5", file: "qr-card-brita-5.png", label: "דובי", style: "baby", eventTypes: ["brit"], qrColor: "#5A3228", qrBackground: "transparent", textColor: "#5A3228", inverted: false, hideCta: true },
  { id: "baby-3", file: "qr-card-baby-3.png", label: "קוביות", style: "baby", eventTypes: ["brit"], qrColor: "#3A2C20", qrBackground: "transparent", textColor: "#3A2C20", inverted: false, hideCta: true },
  { id: "baby-4", file: "qr-card-baby-4.png", label: "חסידה", style: "baby", eventTypes: ["brit"], qrColor: "#2C3828", qrBackground: "transparent", textColor: "#2C3828", inverted: false, hideCta: true },

  { id: "festival", file: "qr-card-festival.png", label: "שקיעה", style: "festival", eventTypes: ["festival", "party"], qrColor: "#000000", qrBackground: "transparent", textColor: "#000000", inverted: false, hideCta: true },
  { id: "festival-2", file: "qr-card-festival-2.png", label: "מדבר", style: "festival", eventTypes: ["festival", "party"], qrColor: "#2A1C14", qrBackground: "transparent", textColor: "#2A1C14", inverted: false, hideCta: true },
  { id: "festival-3", file: "qr-card-festival-3.png", label: "ניאון", style: "festival", eventTypes: ["festival", "party"], qrColor: "#F3EEE6", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true },
  { id: "festival-4", file: "qr-card-festival-4.png", label: "בוהו", style: "festival", eventTypes: ["festival", "party"], qrColor: "#2A1C14", qrBackground: "transparent", textColor: "#2A1C14", inverted: false, hideCta: true },
  { id: "festival-5", file: "qr-card-festival-5.png", label: "רטרו", style: "festival", eventTypes: ["festival", "party"], qrColor: "#4A2818", qrBackground: "transparent", textColor: "#4A2818", inverted: false, hideCta: true },
  { id: "festival-6", file: "qr-card-festival-6.png", label: "קונפטי", style: "festival", eventTypes: ["festival", "party"], qrColor: "#3A243A", qrBackground: "transparent", textColor: "#3A243A", inverted: false, hideCta: true },

  { id: "corporate", file: "qr-card-corporate.png", label: "זהב", style: "corporate", eventTypes: ["corporate"], qrColor: "#F3EEE6", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true },
  { id: "corporate-2", file: "qr-card-corporate-2.png", label: "חגיגה", style: "corporate", eventTypes: ["corporate"], qrColor: "#F3EEE6", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true },
  { id: "corporate-3", file: "qr-card-corporate-3.png", label: "זכוכית", style: "corporate", eventTypes: ["corporate"], qrColor: "#1A2830", qrBackground: "transparent", textColor: "#1A2830", inverted: false, hideCta: true },
  { id: "corporate-4", file: "qr-card-corporate-4.png", label: "אבן", style: "corporate", eventTypes: ["corporate"], qrColor: "#3A2C20", qrBackground: "transparent", textColor: "#3A2C20", inverted: false, hideCta: true },
  { id: "corporate-5", file: "qr-card-corporate-5.png", label: "בלוק", style: "corporate", eventTypes: ["corporate"], qrColor: "#1C1612", qrBackground: "transparent", textColor: "#1C1612", inverted: false, hideCta: true },
  { id: "corporate-6", file: "qr-card-corporate-6.png", label: "גאלה", style: "corporate", eventTypes: ["corporate"], qrColor: "#F3EEE6", qrBackground: "transparent", textColor: "#F3EEE6", inverted: true, hideCta: true },
];

export function findQrCardByFile(file: string | null | undefined): QrCardDesign | undefined {
  if (!file) return undefined;
  return QR_CARD_CATALOG.find((card) => card.file === file || card.id === file);
}

export function filterQrCards(style: string, eventType: string): QrCardDesign[] {
  return QR_CARD_CATALOG.filter((card) => {
    const styleOk = style === "all" || card.style === style;
    const eventOk = eventType === "all" || card.eventTypes.includes(eventType as QrEventTypeId);
    return styleOk && eventOk;
  });
}
