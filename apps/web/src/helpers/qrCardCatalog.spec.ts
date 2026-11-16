/**
 * Lightweight registry checks for the QR card catalog.
 * The web package has no Jest/Vitest script; import `runQrCatalogUnitChecks`
 * from the external verify harness or run via a one-off ts/node script.
 */
import { assertQrCatalogInvariants, QR_CARD_CATALOG } from "@/helpers/qrCardCatalog";
import { filterQrCardsBy, normalizeQrSearch } from "@/helpers/qrCardSearch";
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

/** Hebrew-friendly search checks (finals, niqqud, Latin case, multi-select AND/OR). */
export function runQrSearchUnitChecks(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const eq = (a: string, b: string, what: string) => {
    if (a !== b) errors.push(`${what}: "${a}" !== "${b}"`);
  };
  eq(normalizeQrSearch("פרחים"), normalizeQrSearch("פרחימ"), "final mem");
  eq(normalizeQrSearch("חֲתֻנָּה"), "חתנה", "niqqud stripped");
  eq(normalizeQrSearch("NeOn"), "neon", "latin case");
  eq(normalizeQrSearch("בר/בת  מצווה"), "בר בת מצווה", "punctuation + spaces");
  const plene = filterQrCardsBy({ query: "חתונה", styles: [], eventTypes: [] }).length;
  const pointed = filterQrCardsBy({ query: "חֲתֻנָּה", styles: [], eventTypes: [] }).length;
  if (!plene || pointed !== plene) errors.push(`pointed/defective spelling should match plene (${pointed} vs ${plene})`);
  const all = filterQrCardsBy({ query: "", styles: [], eventTypes: [] });
  if (all.length !== QR_CARD_CATALOG.length) errors.push("empty filter must return all cards");
  const wed = filterQrCardsBy({ query: "", styles: [], eventTypes: ["wedding"] });
  const wedOrBrit = filterQrCardsBy({ query: "", styles: [], eventTypes: ["wedding", "brit"] });
  if (!(wedOrBrit.length >= wed.length && wed.length > 0)) errors.push("event types are OR inside the select");
  const wedGold = filterQrCardsBy({ query: "", styles: ["gold"], eventTypes: ["wedding"] });
  if (wedGold.some((c) => !c.eventTypes.includes("wedding"))) errors.push("selects are AND across");
  if (filterQrCardsBy({ query: "זזזזז", styles: [], eventTypes: [] }).length !== 0) errors.push("nonsense query must be empty");
  return { ok: errors.length === 0, errors };
}
