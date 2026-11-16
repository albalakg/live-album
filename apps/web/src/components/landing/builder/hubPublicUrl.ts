/**
 * Public address helpers for the event page.
 * Display copy uses the brand host; open/share links use the real origin so local preview works.
 */

function envHost(): string | null {
  const env = process.env.VUE_APP_PUBLIC_HUB_HOST;
  if (!env) return null;
  return env.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/** Brand host shown in the UI (slug field, review, success). */
export function hubHost(): string {
  const fromEnv = envHost();
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "snapshare-live.com";
  const host = window.location.host;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) return "snapshare-live.com";
  return host;
}

export function hubProtocol(): string {
  if (envHost()) return "https:";
  if (typeof window === "undefined") return "https:";
  return window.location.protocol;
}

/** Real origin for opening / sharing (keeps localhost when developing). */
export function hubOrigin(): string {
  if (envHost()) return `https://${envHost()}`;
  if (typeof window === "undefined") return "https://snapshare-live.com";
  return window.location.origin;
}

/** "snapshare-live.com/h/" (what the slug field shows before the editable part). */
export function hubPrefix(): string {
  return `${hubHost()}/h/`;
}

/** Display form: "snapshare-live.com/h/amit-and-gal". */
export function hubDisplayUrl(slug: string): string {
  return `${hubPrefix()}${slug}`;
}

/** Full link for sharing / opening. */
export function hubFullUrl(slug: string): string {
  return `${hubOrigin()}/h/${slug}`;
}

export function whatsappShareUrl(titleText: string, slug: string): string {
  // Share text still shows the brand host so guests see a friendly URL in the message.
  const text = `הדף של ${titleText}: https://${hubDisplayUrl(slug)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
