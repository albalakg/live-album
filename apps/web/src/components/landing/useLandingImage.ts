import { inject } from "vue";
import { LANDING_CTX } from "./landingContext";
import { resolveImageRef, resolveStock } from "./templates/registry";
import type { ImageRef, ResolvedImage } from "./types";

const ASSET_ALT = "תמונה מהאירוע";

export function useLandingImage() {
  const ctx = inject(LANDING_CTX, null);

  function resolve(ref: ImageRef | string | null | undefined, fallbackAlt = ""): ResolvedImage | null {
    if (ref == null) return null;

    // Public payload shape: { type:'stock', key } | { type:'asset', asset_id, url, thumb_url }
    if (typeof ref === "object" && "type" in ref && ref.type === "stock" && ref.key) {
      const stock = resolveStock(ref.key);
      if (!stock) return null;
      return { url: stock.url, alt: stock.alt || fallbackAlt, thumb_url: stock.url };
    }
    if (typeof ref === "object" && "type" in ref && ref.type === "asset") {
      const url = ref.url ? String(ref.url) : "";
      if (!url) return null;
      return {
        url,
        thumb_url: ref.thumb_url ? String(ref.thumb_url) : url,
        alt: ref.alt || fallbackAlt || ASSET_ALT,
      };
    }

    const img = resolveImageRef(ref, ctx?.resolvedImages);
    if (!img) return null;
    return { ...img, alt: img.alt || fallbackAlt || ASSET_ALT };
  }

  return { resolve, ctx };
}
