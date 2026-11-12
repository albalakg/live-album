export const QR_STYLES = [
  { id: "flowers", label: "פרחים" },
  { id: "nature", label: "טבע" },
  { id: "gold", label: "זהב" },
  { id: "marble", label: "שיש" },
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
}

/**
 * The 11 cards that already ship with the product.
 * Add a row here to publish another design. Event tags are an editorial
 * filter so the gallery can be browsed; they do not change the card file.
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
];

export function filterQrCards(style: string, eventType: string): QrCardDesign[] {
  return QR_CARD_CATALOG.filter((card) => {
    const styleOk = style === "all" || card.style === style;
    const eventOk = eventType === "all" || card.eventTypes.includes(eventType as QrEventTypeId);
    return styleOk && eventOk;
  });
}
