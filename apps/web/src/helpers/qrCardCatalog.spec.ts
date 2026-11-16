/**
 * Lightweight registry checks for the QR card catalog.
 * The web package has no Jest/Vitest script; import `runQrCatalogUnitChecks`
 * from the external verify harness or run via a one-off ts/node script.
 */
import { assertQrCatalogInvariants, QR_CARD_CATALOG } from "@/helpers/qrCardCatalog";
import { assertV2RegistryInvariants, QR_CARD_DESIGNS_V2 } from "@/helpers/qrCardDesignsV2";

export function runQrCatalogUnitChecks(): {
  ok: boolean;
  errors: string[];
  counts: { total: number; v2: number; legacy: number };
} {
  const errors = [
    ...assertQrCatalogInvariants(),
    ...assertV2RegistryInvariants(),
  ];
  if (QR_CARD_DESIGNS_V2.length < 30) {
    errors.push(`expected ≥30 v2 designs, got ${QR_CARD_DESIGNS_V2.length}`);
  }
  for (const card of QR_CARD_CATALOG) {
    if (card.whitePlate !== true) {
      errors.push(`${card.id}: whitePlate must be true`);
    }
  }
  const legacy = QR_CARD_CATALOG.filter((c) => c.renderer === "image").length;
  const v2 = QR_CARD_CATALOG.filter((c) => c.renderer === "css").length;
  return {
    ok: errors.length === 0,
    errors,
    counts: { total: QR_CARD_CATALOG.length, v2, legacy },
  };
}
