import type { IEventAsset } from "@/helpers/interfaces";
import {
  mergeLiveScreenOptions,
  prefersReducedMotion,
  type LiveScreenOptions,
} from "@/helpers/liveScreenModes";

export const MAX_CONCURRENT_VIDEOS = 1;
export const MAX_ON_SCREEN_NODES = 24;

export function readLiveScreenOptions(event: {
  config?: { live_screen_options?: LiveScreenOptions | null };
} | null): ReturnType<typeof mergeLiveScreenOptions> {
  return mergeLiveScreenOptions(event?.config?.live_screen_options || null);
}

export function imageDisplayMs(event: {
  config?: { image_display_time?: number | string | null };
} | null): number {
  const seconds = Number(event?.config?.image_display_time);
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : 3) * 1000;
}

export function videoDisplayMs(event: {
  config?: { video_display_time?: number | string | null };
} | null): number {
  const seconds = Number(event?.config?.video_display_time);
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : 8) * 1000;
}

export function pickRandomAsset(
  assets: IEventAsset[],
  excludeId?: number | null
): IEventAsset | null {
  if (!assets.length) return null;
  const pool =
    excludeId == null
      ? assets
      : assets.filter((asset) => asset.id !== excludeId);
  const source = pool.length ? pool : assets;
  return source[Math.floor(Math.random() * source.length)] || null;
}

export function newestAssets(
  assets: IEventAsset[],
  limit: number
): IEventAsset[] {
  return [...assets]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, Math.max(0, limit));
}

export function assetThumb(asset: IEventAsset | null | undefined): string {
  if (!asset) return "";
  return (
    asset.thumbPath ||
    asset.thumbnail ||
    asset.thumb ||
    asset.fullPath ||
    asset.path ||
    ""
  );
}

export function assetSrc(asset: IEventAsset | null | undefined): string {
  if (!asset) return "";
  return asset.fullPath || asset.path || "";
}

export function isVideoAsset(asset: IEventAsset | null | undefined): boolean {
  if (!asset) return false;
  return asset.type === "video" || asset.asset_type === "video";
}

export function motionAllowed(): boolean {
  return !prefersReducedMotion();
}

export function capVisibleAssets(
  assets: IEventAsset[],
  limit = MAX_ON_SCREEN_NODES
): IEventAsset[] {
  return assets.slice(0, limit);
}
