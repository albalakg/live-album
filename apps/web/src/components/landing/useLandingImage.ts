import { inject } from "vue";
import { LANDING_CTX } from "./landingContext";
import { resolveImageRef } from "./templates/registry";
import type { ImageRef, ResolvedImage } from "./types";

export function useLandingImage() {
  const ctx = inject(LANDING_CTX, null);

  function resolve(ref: ImageRef | string | null | undefined, fallbackAlt = ""): ResolvedImage | null {
    const img = resolveImageRef(ref, ctx?.resolvedImages);
    if (!img) return null;
    return { ...img, alt: img.alt || fallbackAlt };
  }

  return { resolve, ctx };
}
