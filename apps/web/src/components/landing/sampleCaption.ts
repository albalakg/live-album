/** Detect captions that leaked a stock key or filename (e.g. "עיטור fl-rich1"). */

const SAMPLE_ALT = "תמונה לדוגמה";
const ASSET_ALT = "תמונה מהאירוע";

/** fl-rich1, fl-blush-bl, tx-crumple, fl-bot-tl, and similar art stems. */
const STEM_RE = /\b(?:fl|tx|bg|art)-[a-z0-9-]+/i;
const FILE_RE = /\.(webp|jpe?g|png|gif|svg|avif)(\b|$)/i;
const ALBUM_RE = /\balbum-\d+/i;
const ART_PATH_RE = /(^|\/)art\//i;

export function isStockImageRef(ref: unknown): boolean {
  if (ref == null) return false;
  if (typeof ref === "string") {
    if (ref.startsWith("art/")) return true;
    if (/^[\w-]+\/(hero|album-\d+)$/.test(ref)) return true;
    if (ref.includes("/landing/art/") || ref.includes("/landing/ai/")) return true;
    return false;
  }
  if (typeof ref === "object") {
    const o = ref as Record<string, unknown>;
    if (o.type === "stock" || (typeof o.stock === "string" && o.stock)) return true;
    const url = String(o.url || o.key || "");
    if (url.startsWith("art/") || url.includes("/landing/art/") || url.includes("/landing/ai/")) return true;
    if (/^[\w-]+\/(hero|album-\d+)$/.test(url)) return true;
  }
  return false;
}

export function isInternalAssetCaption(text: string, stockKey = ""): boolean {
  const t = String(text || "").trim();
  if (!t) return true;
  if (FILE_RE.test(t) || ART_PATH_RE.test(t) || ALBUM_RE.test(t) || STEM_RE.test(t)) return true;
  if (stockKey) {
    const stem = stockKey.replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "");
    if (stem && t.includes(stem)) return true;
  }
  return false;
}

/** Visible caption on the page. Sample / placeholder tiles: none (the דוגמה badge is enough). */
export function visibleCaption(caption?: string, alt?: string, isSample = false): string {
  if (isSample) return "";
  for (const raw of [caption, alt]) {
    const t = String(raw || "").trim();
    if (t && !isInternalAssetCaption(t)) return t;
  }
  return "";
}

/** img alt text: never a filename or stock id. */
export function accessibleAlt(caption?: string, alt?: string, isSample = false): string {
  for (const raw of [caption, alt]) {
    const t = String(raw || "").trim();
    if (t && !isInternalAssetCaption(t)) return t;
  }
  return isSample ? SAMPLE_ALT : ASSET_ALT;
}

export { SAMPLE_ALT, ASSET_ALT };
