export interface OverviewUploadThumb {
  id: number | string;
  src: string;
  alt: string;
  isVideo: boolean;
}

function assetSortKey(asset: Record<string, unknown>): number {
  const raw =
    (asset.created_at as string) ||
    (asset.updated_at as string) ||
    (asset.uploaded_at as string) ||
    "";
  if (raw) {
    const t = Date.parse(String(raw));
    if (!Number.isNaN(t)) return t;
  }
  const id = Number(asset.id);
  return Number.isFinite(id) ? id : 0;
}

function isVideoAsset(asset: Record<string, unknown>): boolean {
  const type = String(asset.type || asset.mime || asset.mime_type || "").toLowerCase();
  if (type.includes("video")) return true;
  const path = String(asset.path || asset.fullPath || "").toLowerCase();
  return /\.(mp4|mov|webm|m4v)(\?|$)/.test(path);
}

function resolveSrc(asset: Record<string, unknown>): string {
  const candidates = [
    asset.thumb_url,
    asset.thumbnail,
    asset.fullPath,
    asset.url,
    asset.path,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
}

/**
 * Newest-first thumbs for the overview grid. Skips assets without a usable URL.
 */
export function pickOverviewRecentUploads(
  assets: unknown,
  limit = 8
): OverviewUploadThumb[] {
  if (!Array.isArray(assets) || limit <= 0) return [];
  const list = assets
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((asset) => ({ asset, key: assetSortKey(asset) }))
    .sort((a, b) => b.key - a.key);

  const out: OverviewUploadThumb[] = [];
  for (const { asset } of list) {
    const src = resolveSrc(asset);
    if (!src) continue;
    const id = (asset.id as number | string) ?? out.length;
    const isVideo = isVideoAsset(asset);
    out.push({
      id,
      src,
      alt: isVideo ? "סרטון שהועלה" : "תמונה שהועלתה",
      isVideo,
    });
    if (out.length >= limit) break;
  }
  return out;
}
