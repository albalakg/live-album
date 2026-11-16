import type { EventGalleryType } from "@/helpers/types";

export type LiveQrCorner =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

export type LiveKenBurnsIntensity = "subtle" | "medium";
export type LiveMosaicSize = "3x3" | "4x4";
export type LiveMasonryDensity = "cozy" | "dense";

export interface LiveScreenOptions {
  qr_corner?: LiveQrCorner;
  ken_burns_intensity?: LiveKenBurnsIntensity;
  mosaic_size?: LiveMosaicSize;
  masonry_density?: LiveMasonryDensity;
  polaroid_count?: number;
  spotlight_hold_seconds?: number;
}

export type LiveModePreviewKind =
  | "kenburns"
  | "spotlight"
  | "mosaic"
  | "masonry"
  | "polaroid"
  | "filmstrip"
  | "fade"
  | "split"
  | "pair"
  | "herogrid"
  | "random"
  | "grid";

export interface LiveScreenModeDefinition {
  id: EventGalleryType;
  label: string;
  hint: string;
  preview: LiveModePreviewKind;
  slots: number;
  optionKeys: Array<keyof LiveScreenOptions>;
}

export const DEFAULT_LIVE_GALLERY: EventGalleryType = "EventGalleryKenBurns";

export const DEFAULT_LIVE_SCREEN_OPTIONS: Required<
  Pick<
    LiveScreenOptions,
    | "qr_corner"
    | "ken_burns_intensity"
    | "mosaic_size"
    | "masonry_density"
    | "polaroid_count"
    | "spotlight_hold_seconds"
  >
> = {
  qr_corner: "bottom-start",
  ken_burns_intensity: "subtle",
  mosaic_size: "3x3",
  masonry_density: "cozy",
  polaroid_count: 10,
  spotlight_hold_seconds: 5,
};

export const LIVE_SCREEN_MODES: LiveScreenModeDefinition[] = [
  {
    id: "EventGalleryKenBurns",
    label: "מצגת קן ברנס",
    hint: "תמונה אחת עם תנועה איטית וחיתוך רך",
    preview: "kenburns",
    slots: 1,
    optionKeys: ["ken_burns_intensity"],
  },
  {
    id: "EventGallerySpotlight",
    label: "ספוטלייט",
    hint: "תמונה חדשה עולה לבמה לכמה שניות",
    preview: "spotlight",
    slots: 1,
    optionKeys: ["spotlight_hold_seconds"],
  },
  {
    id: "EventGalleryMosaic",
    label: "פסיפס",
    hint: "קיר מלא 3×3 או 4×4 עם רענון תא",
    preview: "mosaic",
    slots: 9,
    optionKeys: ["mosaic_size"],
  },
  {
    id: "EventGalleryMasonry",
    label: "קיר לבנים",
    hint: "אריחים צפופים עם כניסה של תמונות חדשות",
    preview: "masonry",
    slots: 8,
    optionKeys: ["masonry_density"],
  },
  {
    id: "EventGalleryPolaroid",
    label: "פולארויד",
    hint: "כרטיסים לבנים עם הטיה קלה",
    preview: "polaroid",
    slots: 6,
    optionKeys: ["polaroid_count"],
  },
  {
    id: "EventGalleryFilmstrip",
    label: "פילם סטריפ",
    hint: "תמונה גדולה ורצועת תמונות אחרונות",
    preview: "filmstrip",
    slots: 5,
    optionKeys: [],
  },
  {
    id: "EventGalleryFadeShow",
    label: "מעבר רך",
    hint: "מצגת פשוטה בלי תנועה",
    preview: "fade",
    slots: 1,
    optionKeys: [],
  },
  {
    id: "EventGallerySplitPair",
    label: "זוג תמונות",
    hint: "שתי תמונות יציבות זו לצד זו",
    preview: "pair",
    slots: 2,
    optionKeys: [],
  },
  {
    id: "EventGalleryHeroGrid",
    label: "שיא ורשת",
    hint: "תמונה ראשית עם רשת קטנה לידה",
    preview: "herogrid",
    slots: 5,
    optionKeys: [],
  },
  {
    id: "EventGallerySplitScreen",
    label: "חלוקת מסך",
    hint: "שתי פאנלים מתחלפים",
    preview: "split",
    slots: 2,
    optionKeys: [],
  },
];

/** Legacy ids still render; unknown values fall back to Ken Burns. */
const LEGACY_ALIASES: Record<string, EventGalleryType> = {
  EventGallerySingle: "EventGalleryKenBurns",
  EventGalleryGrid3X3: "EventGalleryMosaic",
  EventGalleryRandom: "EventGalleryPolaroid",
};

const MODE_IDS = new Set(LIVE_SCREEN_MODES.map((mode) => mode.id));

export function resolveLiveGalleryMode(
  value?: string | null
): EventGalleryType {
  if (!value) return DEFAULT_LIVE_GALLERY;
  if (LEGACY_ALIASES[value]) return LEGACY_ALIASES[value];
  if (MODE_IDS.has(value as EventGalleryType)) {
    return value as EventGalleryType;
  }
  // Keep Random/Single/Grid registered for direct component mounts if needed
  if (
    value === "EventGallerySingle" ||
    value === "EventGalleryRandom" ||
    value === "EventGalleryGrid3X3"
  ) {
    return value as EventGalleryType;
  }
  return DEFAULT_LIVE_GALLERY;
}

export function mergeLiveScreenOptions(
  raw?: LiveScreenOptions | null
): Required<
  Pick<
    LiveScreenOptions,
    | "qr_corner"
    | "ken_burns_intensity"
    | "mosaic_size"
    | "masonry_density"
    | "polaroid_count"
    | "spotlight_hold_seconds"
  >
> &
  LiveScreenOptions {
  return {
    ...DEFAULT_LIVE_SCREEN_OPTIONS,
    ...(raw || {}),
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function liveModeIds(): EventGalleryType[] {
  return LIVE_SCREEN_MODES.map((mode) => mode.id);
}
