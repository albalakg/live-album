/**
 * Gen-2 templates: a template = palette + fonts + mood + preset layouts for three blocks
 * (hero / gallery / schedule). `blocks[].variant` null = follow the template preset.
 * Unknown values fall back to the preset (the server stores them as null).
 */
import { getTemplate } from "../templates/registry";
import type { HubBlock, TemplateMeta } from "../types";

export type VariantBlockType = "HERO_COUNTDOWN" | "GALLERY" | "EVENT_TIMELINE";

export interface VariantOption {
  id: string;
  he: string;
  desc: string;
}

export const VARIANTS: Record<VariantBlockType, VariantOption[]> = {
  HERO_COUNTDOWN: [
    { id: "full", he: "תמונה מלאה", desc: "תמונה על כל הרוחב, הטקסט עליה" },
    { id: "split", he: "מפוצל", desc: "תמונה בצד אחד, טקסט וספירה בשני" },
    { id: "arch", he: "קשת", desc: "תמונה במסגרת קשת, טקסט ממורכז" },
  ],
  GALLERY: [
    { id: "honey", he: "כוורת", desc: "משושים, בלי גלילה במחשב" },
    { id: "bento", he: "פסיפס", desc: "רשת אריחים בגדלים שונים" },
    { id: "polaroid", he: "פולרואיד", desc: "תמונות מודפסות, מפוזרות" },
  ],
  EVENT_TIMELINE: [
    { id: "timeline", he: "ציר זמן", desc: "קו אנכי עם נקודות" },
    { id: "cards", he: "כרטיסים", desc: "שורה של כרטיסים עם אייקון" },
    { id: "list", he: "רשימה", desc: "שורות נקיות, שעה מול שם" },
  ],
};

export const VARIANT_BLOCK_TYPES = Object.keys(VARIANTS) as VariantBlockType[];

/** Section names for the toast / chips. */
export const VARIANT_BLOCK_HE: Record<VariantBlockType, string> = {
  HERO_COUNTDOWN: "פתיחה",
  GALLERY: "גלריה",
  EVENT_TIMELINE: "לו״ז",
};

export const TIMELINE_ICONS = ["glass", "ring", "dish", "music"] as const;

/** Per-block variant choices kept in the builder state; missing / null = follow the template. */
export type VariantMap = Partial<Record<VariantBlockType, string | null>>;

export function isVariantBlockType(t: string): t is VariantBlockType {
  return (VARIANT_BLOCK_TYPES as string[]).includes(t);
}

export function isGen2Meta(meta: TemplateMeta | null | undefined): boolean {
  return Boolean(meta && meta.generation === 2);
}

export function isGen2Template(templateId: string | null | undefined): boolean {
  return isGen2Meta(templateId ? getTemplate(templateId) : null);
}

export function isKnownVariant(type: VariantBlockType, v: unknown): v is string {
  return typeof v === "string" && VARIANTS[type].some((o) => o.id === v);
}

export function presetFor(templateId: string, type: VariantBlockType): string {
  const meta = getTemplate(templateId);
  const p = meta?.presets?.[type];
  return isKnownVariant(type, p) ? p : VARIANTS[type][0].id;
}

/**
 * Layout to render. "legacy" = an old template: render the original component untouched
 * (variants are ignored there).
 */
export function resolveVariant(templateId: string, type: VariantBlockType, stored: unknown): string {
  if (!isGen2Template(templateId)) return "legacy";
  return isKnownVariant(type, stored) ? stored : presetFor(templateId, type);
}

export function variantLabel(type: VariantBlockType, id: string): string {
  return VARIANTS[type].find((o) => o.id === id)?.he || id;
}

/** Stored value for a pick: the preset itself is stored as null (= keep following the template). */
export function storedVariant(templateId: string, type: VariantBlockType, pick: string | null | undefined): string | null {
  if (!pick || !isKnownVariant(type, pick)) return null;
  return pick === presetFor(templateId, type) ? null : pick;
}

/** Read the per-type choices from saved blocks (first block of each type). */
export function readVariants(blocks: HubBlock[] | null | undefined, templateId: string): VariantMap {
  const out: VariantMap = {};
  for (const b of blocks || []) {
    if (!isVariantBlockType(b.type) || b.type in out) continue;
    out[b.type] = storedVariant(templateId, b.type, b.variant as string | null | undefined);
  }
  return out;
}

/** Write `variant` on every hero / gallery / schedule block (null = template preset). Mutates. */
export function applyVariants<T extends { blocks: HubBlock[] }>(cfg: T, map: VariantMap | null | undefined, templateId: string): T {
  // Old templates have no variants: leave their blocks exactly as the wizard built them.
  if (!isGen2Template(templateId)) return cfg;
  for (const b of cfg.blocks) {
    if (!isVariantBlockType(b.type)) continue;
    b.variant = storedVariant(templateId, b.type, map?.[b.type]);
  }
  return cfg;
}

/**
 * Template switch: manual picks are kept; a kept pick that equals the new preset becomes null.
 * Returns the new map plus the per-type layout the page will show (for the toast).
 */
export function variantsAfterSwitch(
  map: VariantMap | null | undefined,
  nextTemplateId: string
): { map: VariantMap; kept: VariantBlockType[]; shown: Record<VariantBlockType, string> } {
  const next: VariantMap = {};
  const kept: VariantBlockType[] = [];
  const shown = {} as Record<VariantBlockType, string>;
  const gen2 = isGen2Template(nextTemplateId);
  for (const t of VARIANT_BLOCK_TYPES) {
    const pick = map?.[t];
    if (!gen2) {
      // Old templates ignore variants; keep the picks so they come back on a gen-2 template.
      next[t] = pick ?? null;
      shown[t] = "legacy";
      continue;
    }
    const stored = storedVariant(nextTemplateId, t, pick);
    if (stored) kept.push(t);
    next[t] = stored;
    shown[t] = resolveVariant(nextTemplateId, t, stored);
  }
  return { map: next, kept, shown };
}

/**
 * Copy `variant` + template id (+ the page cover) into block data for rendering (never saved).
 * LandingRenderer only hands `data` + `sectionId` to sections, so this is how the variant
 * wrappers learn their layout without touching the renderer.
 */
export function withRenderHints<T extends { blocks: HubBlock[]; theme?: unknown }>(cfg: T, templateId: string): T {
  const theme = (cfg.theme || {}) as Record<string, unknown>;
  const cover = theme.cover ?? null;
  return {
    ...cfg,
    blocks: (cfg.blocks || []).map((b) =>
      isVariantBlockType(b.type)
        ? {
            ...b,
            data: {
              ...(b.data || {}),
              __variant: b.variant ?? null,
              __tpl: templateId,
              ...(b.type === "HERO_COUNTDOWN" ? { __cover: cover } : {}),
            },
          }
        : b
    ),
  };
}

/** Strip render hints (defensive: they must never reach the API). */
export function stripRenderHints<T extends { blocks: HubBlock[] }>(cfg: T): T {
  for (const b of cfg.blocks) {
    if (b.data && typeof b.data === "object") {
      delete (b.data as Record<string, unknown>).__variant;
      delete (b.data as Record<string, unknown>).__tpl;
      delete (b.data as Record<string, unknown>).__cover;
    }
  }
  return cfg;
}

/** Gen-2 sample gallery: 7 neutral stock images of the template. */
export const V2_ALBUM_COUNT = 7;
export function v2SampleImages(templateId: string): Array<{ stock: string }> {
  return Array.from({ length: V2_ALBUM_COUNT }, (_, i) => ({ stock: `${templateId}/album-${i + 1}` }));
}

/** `classic/album-3`, `classic-1/album-3` (the wizard's type-1 fallback) → album index, else null. */
function sampleAlbumIndex(stock: unknown, templateId: string): number | null {
  if (typeof stock !== "string") return null;
  const m = /^([\w-]+)\/album-(\d+)$/.exec(stock);
  if (!m) return null;
  return m[1] === templateId || m[1] === `${templateId}-1` ? Number(m[2]) : null;
}

/**
 * Gen-2 gallery samples. The wizard model builds sample keys as `<type>-1/album-N` (old naming),
 * which a gen-2 template does not have (and the server rejects). When the gallery holds only
 * this template's samples, send its 7 own samples (`<id>/album-1..7`, fills the honeycomb).
 * Mutates and returns cfg. Old templates are untouched.
 */
export function fixGen2SampleGallery<T extends { blocks: HubBlock[] }>(cfg: T, templateId: string): T {
  if (!isGen2Template(templateId)) return cfg;
  for (const b of cfg.blocks) {
    const data = b.data as Record<string, unknown> | undefined;
    if (b.type === "STORY" && data?.image && typeof data.image === "object") {
      const ref = data.image as { stock?: unknown };
      if (typeof ref.stock === "string" && /-1\/album-\d+$/.test(ref.stock) && sampleAlbumIndex(ref.stock, templateId)) {
        data.image = { stock: `${templateId}/album-${sampleAlbumIndex(ref.stock, templateId)}` };
      }
    }
    if (b.type !== "GALLERY" || !data || !Array.isArray(data.images)) continue;
    const imgs = data.images as Array<{ image?: { stock?: unknown } | null; caption?: string }>;
    const allSamples = imgs.length > 0 && imgs.every((im) => sampleAlbumIndex(im?.image?.stock, templateId) !== null);
    if (allSamples) {
      data.images = v2SampleImages(templateId).map((ref) => ({ image: ref, caption: "" }));
    } else {
      data.images = imgs.map((im) => {
        const n = sampleAlbumIndex(im?.image?.stock, templateId);
        return n !== null ? { ...im, image: { stock: `${templateId}/album-${Math.min(n, V2_ALBUM_COUNT)}` } } : im;
      });
    }
  }
  return cfg;
}

/** Wizard config → what the builder previews and saves: variants applied, gen-2 samples fixed, hints stripped. */
export function finalizeHubConfig<T extends { blocks: HubBlock[] }>(cfg: T, map: VariantMap | null | undefined, templateId: string): T {
  applyVariants(cfg, map, templateId);
  fixGen2SampleGallery(cfg, templateId);
  return stripRenderHints(cfg);
}

/**
 * Builder state: the wizard model names gen-2 gallery samples `<id>-1/album-N` (old naming), which
 * have no images. Rename them to `<id>/album-N`; a gallery of samples only gets all 7 (fills the
 * honeycomb). Host photos (asset_id) are untouched. Mutates and returns content.
 */
export function fixGen2ContentSamples<T extends { gallery?: { images?: Array<{ stock?: string; asset_id?: unknown }> } }>(
  content: T,
  templateId: string
): T {
  if (!isGen2Template(templateId) || !content?.gallery?.images) return content;
  const imgs = content.gallery.images;
  const allSamples = imgs.length > 0 && imgs.every((im) => sampleAlbumIndex(im?.stock, templateId) !== null);
  if (allSamples) {
    content.gallery.images = v2SampleImages(templateId);
    return content;
  }
  content.gallery.images = imgs.map((im) => {
    const n = sampleAlbumIndex(im?.stock, templateId);
    return n !== null ? { ...im, stock: `${templateId}/album-${Math.min(n, V2_ALBUM_COUNT)}` } : im;
  });
  return content;
}
