/** Origin of the Astro marketing site. Empty in production (same host as the app). */
export function marketingOrigin(): string {
  const fromEnv = process.env.VUE_APP_MARKETING_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:4321";
  return "";
}

/** Absolute URL for a marketing path such as `/`, `/pricing`, or `/#how`. */
export function marketingHref(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const origin = marketingOrigin();
  return origin ? `${origin}${normalized}` : normalized;
}
