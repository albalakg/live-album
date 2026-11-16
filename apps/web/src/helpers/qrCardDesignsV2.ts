import type { QrCategoryId } from "@/helpers/qrCardCategories";

/** Synthetic asset key — not a real file under /assets. */
export const V2_FILE_PREFIX = "v2:" as const;

/** Event-type ids aligned with QR_EVENT_TYPES in qrCardCatalog. */
export type QrV2EventTypeId =
  | "wedding"
  | "barmitzvah"
  | "birthday"
  | "brit"
  | "corporate"
  | "party"
  | "festival";

export type QrV2Motif =
  | "floral-spray"
  | "rose-arc"
  | "ink-line"
  | "sand-dots"
  | "neon-rings"
  | "neon-grid"
  | "retro-sun"
  | "vinyl"
  | "boho-weave"
  | "boho-moon"
  | "deco-fan"
  | "deco-geo"
  | "balloons"
  | "kid-stars"
  | "navy-rule"
  | "slate-blocks"
  | "wash-blush"
  | "wash-ocean"
  | "foil-ornament"
  | "foil-frame"
  | "fest-burst"
  | "fest-dunes"
  | "soft-clouds"
  | "pastel-bow"
  | "torah-motif"
  | "spark-arch"
  | "romance-hearts"
  | "confetti"
  | "velvet"
  | "palm"
  | "tiles"
  | "ribbon";

export interface QrV2Design {
  id: string;
  /** Stored in qr_card_design; format v2:<id> */
  file: string;
  label: string;
  /** Primary style id for legacy caption row */
  style: string;
  categories: QrCategoryId[];
  eventTypes: QrV2EventTypeId[];
  motif: QrV2Motif;
  /** CSS custom properties consumed by QrCardBackdrop */
  vars: {
    bg: string;
    bg2: string;
    accent: string;
    accent2: string;
    ink: string;
  };
  qrColor: string;
  qrBackground: "transparent";
  textColor: string;
  inverted?: boolean;
  hideCta?: boolean;
  /** Hard requirement: every v2 design declares a solid white QR plate */
  whitePlate: true;
  renderer: "css";
}

function v2(
  partial: Omit<QrV2Design, "file" | "qrBackground" | "whitePlate" | "renderer">
): QrV2Design {
  return {
    ...partial,
    file: `${V2_FILE_PREFIX}${partial.id}`,
    qrBackground: "transparent",
    whitePlate: true,
    renderer: "css",
  };
}

/** ~32 bold CSS/SVG card designs (in addition to the PNG library). */
export const QR_CARD_DESIGNS_V2: QrV2Design[] = [
  v2({
    id: "floral-garden",
    label: "גן פורח",
    style: "floral",
    categories: ["floral", "wedding"],
    eventTypes: ["wedding", "birthday"],
    motif: "floral-spray",
    vars: {
      bg: "#f4f0e8",
      bg2: "#e8f0e4",
      accent: "#c45c6a",
      accent2: "#6a8f5a",
      ink: "#2a241c",
    },
    qrColor: "#1a1510",
    textColor: "#2a241c",
  }),
  v2({
    id: "floral-rose",
    label: "קשת ורדים",
    style: "floral",
    categories: ["floral", "wedding"],
    eventTypes: ["wedding", "party"],
    motif: "rose-arc",
    vars: {
      bg: "#f7ecef",
      bg2: "#f0dce3",
      accent: "#a83248",
      accent2: "#d4a0aa",
      ink: "#3a1c24",
    },
    qrColor: "#2a1218",
    textColor: "#3a1c24",
  }),
  v2({
    id: "minimal-ink",
    label: "דיו שחור",
    style: "minimal",
    categories: ["minimal", "general"],
    eventTypes: ["wedding", "corporate"],
    motif: "ink-line",
    vars: {
      bg: "#faf8f5",
      bg2: "#f0ebe3",
      accent: "#161310",
      accent2: "#8a8178",
      ink: "#161310",
    },
    qrColor: "#12100e",
    textColor: "#161310",
  }),
  v2({
    id: "minimal-sand",
    label: "חול עדין",
    style: "minimal",
    categories: ["minimal"],
    eventTypes: ["wedding", "corporate", "birthday"],
    motif: "sand-dots",
    vars: {
      bg: "#f3ebe0",
      bg2: "#e8dcc8",
      accent: "#9a7b52",
      accent2: "#c4a882",
      ink: "#3a3024",
    },
    qrColor: "#2a2218",
    textColor: "#3a3024",
  }),
  v2({
    id: "neon-pulse",
    label: "פעימת ניאון",
    style: "neon",
    categories: ["neon", "festival", "dark"],
    eventTypes: ["festival", "party"],
    motif: "neon-rings",
    vars: {
      bg: "#0c0e18",
      bg2: "#161a2e",
      accent: "#39f3c3",
      accent2: "#ff4fd8",
      ink: "#f2f6ff",
    },
    qrColor: "#101018",
    textColor: "#f2f6ff",
    inverted: true,
  }),
  v2({
    id: "neon-grid",
    label: "רשת ניאון",
    style: "neon",
    categories: ["neon", "geometric", "dark"],
    eventTypes: ["festival", "party", "birthday"],
    motif: "neon-grid",
    vars: {
      bg: "#0a1020",
      bg2: "#121c36",
      accent: "#5ad0ff",
      accent2: "#b44cff",
      ink: "#eaf4ff",
    },
    qrColor: "#0e1424",
    textColor: "#eaf4ff",
    inverted: true,
  }),
  v2({
    id: "retro-sun",
    label: "שמש רטרו",
    style: "retro",
    categories: ["retro", "festival"],
    eventTypes: ["festival", "party", "birthday"],
    motif: "retro-sun",
    vars: {
      bg: "#f6d9a8",
      bg2: "#f0b878",
      accent: "#d4542a",
      accent2: "#2a5c6e",
      ink: "#2a1c10",
    },
    qrColor: "#1c140c",
    textColor: "#2a1c10",
  }),
  v2({
    id: "retro-vinyl",
    label: "ויניל",
    style: "retro",
    categories: ["retro", "birthday"],
    eventTypes: ["party", "birthday"],
    motif: "vinyl",
    vars: {
      bg: "#2a1e28",
      bg2: "#3e2a38",
      accent: "#e8b84a",
      accent2: "#e07060",
      ink: "#f6efe6",
    },
    qrColor: "#1a1218",
    textColor: "#f6efe6",
    inverted: true,
  }),
  v2({
    id: "boho-weave",
    label: "אריג בוהו",
    style: "boho",
    categories: ["boho", "festival"],
    eventTypes: ["festival", "party", "wedding"],
    motif: "boho-weave",
    vars: {
      bg: "#efe4d4",
      bg2: "#e2d0b4",
      accent: "#8a5a3c",
      accent2: "#c4a06a",
      ink: "#3a2a1c",
    },
    qrColor: "#2a1c12",
    textColor: "#3a2a1c",
  }),
  v2({
    id: "boho-moon",
    label: "ירח בוהו",
    style: "boho",
    categories: ["boho", "dark"],
    eventTypes: ["festival", "party"],
    motif: "boho-moon",
    vars: {
      bg: "#1e2430",
      bg2: "#2a3344",
      accent: "#d8c4a0",
      accent2: "#8a9ab0",
      ink: "#f0e8dc",
    },
    qrColor: "#141820",
    textColor: "#f0e8dc",
    inverted: true,
  }),
  v2({
    id: "art-deco-fan",
    label: "מניפת דקו",
    style: "art-deco",
    categories: ["art-deco", "gold", "wedding"],
    eventTypes: ["wedding", "corporate"],
    motif: "deco-fan",
    vars: {
      bg: "#1a1620",
      bg2: "#2a2230",
      accent: "#d4b46a",
      accent2: "#8a7040",
      ink: "#f4ecd8",
    },
    qrColor: "#121018",
    textColor: "#f4ecd8",
    inverted: true,
  }),
  v2({
    id: "art-deco-geo",
    label: "דקו גיאומטרי",
    style: "art-deco",
    categories: ["art-deco", "geometric", "gold"],
    eventTypes: ["wedding", "corporate", "party"],
    motif: "deco-geo",
    vars: {
      bg: "#f4efe4",
      bg2: "#e8dfc8",
      accent: "#1a1820",
      accent2: "#c9a36a",
      ink: "#1a1820",
    },
    qrColor: "#121018",
    textColor: "#1a1820",
  }),
  v2({
    id: "kids-balloon",
    label: "בלונים שמחים",
    style: "kids",
    categories: ["kids", "birthday"],
    eventTypes: ["birthday", "party"],
    motif: "balloons",
    vars: {
      bg: "#fff6f0",
      bg2: "#ffe8dc",
      accent: "#e85a6a",
      accent2: "#4aa0e0",
      ink: "#2a2430",
    },
    qrColor: "#1a1820",
    textColor: "#2a2430",
  }),
  v2({
    id: "kids-stars",
    label: "כוכבי ילדים",
    style: "kids",
    categories: ["kids", "birthday"],
    eventTypes: ["birthday", "brit"],
    motif: "kid-stars",
    vars: {
      bg: "#eef6ff",
      bg2: "#dcecff",
      accent: "#f0b430",
      accent2: "#6a8ce0",
      ink: "#243048",
    },
    qrColor: "#182030",
    textColor: "#243048",
  }),
  v2({
    id: "corporate-navy",
    label: "נייבי עסקי",
    style: "corporate",
    categories: ["corporate", "minimal"],
    eventTypes: ["corporate"],
    motif: "navy-rule",
    vars: {
      bg: "#f4f6f8",
      bg2: "#e4eaf0",
      accent: "#1a2a44",
      accent2: "#6a849c",
      ink: "#1a2434",
    },
    qrColor: "#121820",
    textColor: "#1a2434",
  }),
  v2({
    id: "corporate-slate",
    label: "צפחה מקצועית",
    style: "corporate",
    categories: ["corporate", "dark"],
    eventTypes: ["corporate"],
    motif: "slate-blocks",
    vars: {
      bg: "#2a3038",
      bg2: "#3a424c",
      accent: "#c9a36a",
      accent2: "#8a949c",
      ink: "#f0f2f4",
    },
    qrColor: "#14181c",
    textColor: "#f0f2f4",
    inverted: true,
  }),
  v2({
    id: "watercolor-blush",
    label: "סומק מים",
    style: "watercolor",
    categories: ["watercolor", "wedding", "floral"],
    eventTypes: ["wedding", "birthday"],
    motif: "wash-blush",
    vars: {
      bg: "#faf4f2",
      bg2: "#f0ddd8",
      accent: "#d4788a",
      accent2: "#e8b8a8",
      ink: "#3a2a28",
    },
    qrColor: "#241818",
    textColor: "#3a2a28",
  }),
  v2({
    id: "watercolor-ocean",
    label: "אוקיינוס רך",
    style: "watercolor",
    categories: ["watercolor", "general"],
    eventTypes: ["birthday", "party", "festival"],
    motif: "wash-ocean",
    vars: {
      bg: "#f0f6f8",
      bg2: "#d0e4ec",
      accent: "#3a8aac",
      accent2: "#88c0d0",
      ink: "#1c3040",
    },
    qrColor: "#142028",
    textColor: "#1c3040",
  }),
  v2({
    id: "gold-foil-ornate",
    label: "זהב מעוטר",
    style: "gold",
    categories: ["gold", "wedding", "dark"],
    eventTypes: ["wedding", "corporate", "barmitzvah"],
    motif: "foil-ornament",
    vars: {
      bg: "#16120e",
      bg2: "#2a2218",
      accent: "#d4b46a",
      accent2: "#8a6a38",
      ink: "#f4ecd8",
    },
    qrColor: "#12100c",
    textColor: "#f4ecd8",
    inverted: true,
  }),
  v2({
    id: "gold-foil-line",
    label: "קו זהב",
    style: "gold",
    categories: ["gold", "minimal", "wedding"],
    eventTypes: ["wedding", "corporate"],
    motif: "foil-frame",
    vars: {
      bg: "#faf6ee",
      bg2: "#f0e6d0",
      accent: "#b8924a",
      accent2: "#d4b878",
      ink: "#2a2218",
    },
    qrColor: "#1a1610",
    textColor: "#2a2218",
  }),
  v2({
    id: "festival-burst",
    label: "פיצוץ פסטיבל",
    style: "festival",
    categories: ["festival", "neon"],
    eventTypes: ["festival", "party"],
    motif: "fest-burst",
    vars: {
      bg: "#1a0e28",
      bg2: "#2e1848",
      accent: "#ff6a3c",
      accent2: "#ffd23c",
      ink: "#fff4e8",
    },
    qrColor: "#140c1c",
    textColor: "#fff4e8",
    inverted: true,
  }),
  v2({
    id: "festival-dunes",
    label: "דיונות אור",
    style: "festival",
    categories: ["festival", "boho"],
    eventTypes: ["festival", "party"],
    motif: "fest-dunes",
    vars: {
      bg: "#f0d8b0",
      bg2: "#e8c088",
      accent: "#c45c2a",
      accent2: "#6a8a9c",
      ink: "#2a1c10",
    },
    qrColor: "#1c140c",
    textColor: "#2a1c10",
  }),
  v2({
    id: "brit-clouds",
    label: "עננים רכים",
    style: "brit",
    categories: ["brit", "kids"],
    eventTypes: ["brit"],
    motif: "soft-clouds",
    vars: {
      bg: "#eef4fa",
      bg2: "#dce8f4",
      accent: "#6a8cbc",
      accent2: "#b8cce0",
      ink: "#243448",
    },
    qrColor: "#182430",
    textColor: "#243448",
  }),
  v2({
    id: "baby-pastel",
    label: "פסטל בייבי",
    style: "brit",
    categories: ["brit", "kids"],
    eventTypes: ["brit"],
    motif: "pastel-bow",
    vars: {
      bg: "#faf0f4",
      bg2: "#f0dce8",
      accent: "#d488a0",
      accent2: "#a8c8b8",
      ink: "#3a2a30",
    },
    qrColor: "#241820",
    textColor: "#3a2a30",
  }),
  v2({
    id: "barmitzvah-scroll",
    label: "מגילת בר",
    style: "barmitzvah",
    categories: ["barmitzvah", "gold"],
    eventTypes: ["barmitzvah"],
    motif: "torah-motif",
    vars: {
      bg: "#f6f0e4",
      bg2: "#e8dcc4",
      accent: "#2a4a6a",
      accent2: "#c9a36a",
      ink: "#1c2838",
    },
    qrColor: "#141c28",
    textColor: "#1c2838",
  }),
  v2({
    id: "batmitzvah-spark",
    label: "ניצוץ בת",
    style: "barmitzvah",
    categories: ["barmitzvah", "wedding"],
    eventTypes: ["barmitzvah", "birthday"],
    motif: "spark-arch",
    vars: {
      bg: "#f8f0f6",
      bg2: "#eadceb",
      accent: "#8a4a7a",
      accent2: "#d4a0c4",
      ink: "#3a2438",
    },
    qrColor: "#241828",
    textColor: "#3a2438",
  }),
  v2({
    id: "wedding-romance",
    label: "רומנטיקה",
    style: "wedding",
    categories: ["wedding", "floral"],
    eventTypes: ["wedding"],
    motif: "romance-hearts",
    vars: {
      bg: "#faf4f6",
      bg2: "#f0e0e6",
      accent: "#b85068",
      accent2: "#d4a0b0",
      ink: "#3a242c",
    },
    qrColor: "#241018",
    textColor: "#3a242c",
  }),
  v2({
    id: "birthday-confetti",
    label: "קונפטי שמח",
    style: "birthday",
    categories: ["birthday", "kids", "festival"],
    eventTypes: ["birthday", "party"],
    motif: "confetti",
    vars: {
      bg: "#fff8f0",
      bg2: "#ffe8d0",
      accent: "#e85840",
      accent2: "#40a0d0",
      ink: "#2a2430",
    },
    qrColor: "#1a1820",
    textColor: "#2a2430",
  }),
  v2({
    id: "dark-velvet",
    label: "קטיפה כהה",
    style: "dark",
    categories: ["dark", "gold"],
    eventTypes: ["wedding", "corporate", "party"],
    motif: "velvet",
    vars: {
      bg: "#140e18",
      bg2: "#241828",
      accent: "#c9a36a",
      accent2: "#6a4058",
      ink: "#f4ecd8",
    },
    qrColor: "#100c14",
    textColor: "#f4ecd8",
    inverted: true,
  }),
  v2({
    id: "tropical-palm",
    label: "דקל טרופי",
    style: "tropical",
    categories: ["tropical", "festival"],
    eventTypes: ["festival", "party", "birthday"],
    motif: "palm",
    vars: {
      bg: "#e8f4ee",
      bg2: "#c8e4d4",
      accent: "#2a7a5a",
      accent2: "#e8a040",
      ink: "#1c382c",
    },
    qrColor: "#14241c",
    textColor: "#1c382c",
  }),
  v2({
    id: "geometric-tiles",
    label: "אריחים",
    style: "geometric",
    categories: ["geometric", "minimal"],
    eventTypes: ["corporate", "wedding", "party"],
    motif: "tiles",
    vars: {
      bg: "#f2f0ec",
      bg2: "#e4e0d8",
      accent: "#2a4a5c",
      accent2: "#c45c4a",
      ink: "#1c2830",
    },
    qrColor: "#141c24",
    textColor: "#1c2830",
  }),
  v2({
    id: "general-ribbon",
    label: "סרט חגיגי",
    style: "general",
    categories: ["general", "birthday"],
    eventTypes: ["birthday", "party", "corporate"],
    motif: "ribbon",
    vars: {
      bg: "#f8f4ee",
      bg2: "#ece4d4",
      accent: "#c45c66",
      accent2: "#c9a36a",
      ink: "#2a241c",
    },
    qrColor: "#1a1610",
    textColor: "#2a241c",
  }),
];

export function isV2DesignFile(file: string | null | undefined): boolean {
  return typeof file === "string" && file.startsWith(V2_FILE_PREFIX);
}

export function findV2DesignByFile(file: string | null | undefined) {
  if (!isV2DesignFile(file)) return undefined;
  return QR_CARD_DESIGNS_V2.find((d) => d.file === file || d.id === file?.slice(V2_FILE_PREFIX.length));
}

export function assertV2RegistryInvariants(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const files = new Set<string>();
  for (const d of QR_CARD_DESIGNS_V2) {
    if (ids.has(d.id)) errors.push(`duplicate id: ${d.id}`);
    ids.add(d.id);
    if (files.has(d.file)) errors.push(`duplicate file: ${d.file}`);
    files.add(d.file);
    if (!d.whitePlate) errors.push(`${d.id}: missing whitePlate`);
    if (!d.categories.length) errors.push(`${d.id}: no categories`);
    if (!d.label.trim()) errors.push(`${d.id}: empty label`);
  }
  return errors;
}
