export const DEFAULT_QR_CARD_DESIGN = "qr-card-flowers.webp";

export const DEFAULT_QR_CARD_TEXT = "סרקו, צלמו ותעלו בואו נחגוג ביחד";

export const QR_CARD_OPTIONS = [
  { label: "פרחים", value: "qr-card-flowers.webp" },
  { label: "פרחים 2", value: "qr-card-flowers-2.webp" },
  { label: "פרחים 3", value: "qr-card-flowers-3.webp" },
  { label: "פרחים 4", value: "qr-card-flowers-4.webp" },
  { label: "5 פרחים", value: "qr-card-flowers-5.png" },
  { label: "טבע", value: "qr-card-nature.png" },
  { label: "זהב לבן", value: "qr-card-gold.png" },
  { label: "זהב לבן 2", value: "qr-card-gold-2.png" },
  { label: "זהב לבן 3", value: "qr-card-gold-3.png" },
  { label: "שיש מוזהב", value: "qr-card-marble.png" },
  { label: "שיש מוזהב 2", value: "qr-card-marble-2.png" },
] as const;

export type QrCardDesign = (typeof QR_CARD_OPTIONS)[number]["value"];

export const QR_CARD_DESIGN_VALUES: string[] = QR_CARD_OPTIONS.map(
  (option) => option.value
);

export function isValidQrCardDesign(
  design: string | null | undefined
): design is QrCardDesign {
  return typeof design === "string" && QR_CARD_DESIGN_VALUES.includes(design);
}
