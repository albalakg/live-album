import { QR_CARD_CATALOG } from "@/helpers/qrCardCatalog";

export const DEFAULT_QR_CARD_DESIGN = "qr-card-flowers.webp";

export const DEFAULT_QR_CARD_TEXT = "סרקו, צלמו ותעלו בואו נחגוג ביחד";

export const QR_CARD_OPTIONS = QR_CARD_CATALOG.map((card) => ({
  label: card.label,
  value: card.file,
})) as { label: string; value: string }[];

export type QrCardDesign = (typeof QR_CARD_OPTIONS)[number]["value"];

export const QR_CARD_DESIGN_VALUES: string[] = QR_CARD_OPTIONS.map(
  (option) => option.value
);

export function isValidQrCardDesign(
  design: string | null | undefined
): design is QrCardDesign {
  return typeof design === "string" && QR_CARD_DESIGN_VALUES.includes(design);
}
