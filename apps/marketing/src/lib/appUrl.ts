import { appHref } from "@snapshare/design/site";

/**
 * Vue app origin.
 * Dev default is the Vue dev server. Production stays same-origin unless PUBLIC_APP_URL is set.
 */
export const APP_URL = String(
  import.meta.env.PUBLIC_APP_URL ??
    (import.meta.env.DEV ? "http://localhost:8080" : "")
).replace(/\/$/, "");

const APP_PREFIXES = [
  "/order",
  "/login",
  "/signup",
  "/logout",
  "/forgot-password",
  "/reset-password",
  "/email-confirmation",
  "/contact-us",
  "/terms-and-conditions",
  "/qr-cards",
  "/event",
  "/profile",
  "/auth",
];

/** Leave marketing paths alone. Send app paths to APP_URL. */
export function appPath(path: string): string {
  if (!path || /^(https?:|mailto:|tel:)/.test(path)) return path;
  const [pathname, query] = path.split("?");
  const isApp = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!isApp) return path;
  const full = query ? `${pathname}?${query}` : pathname;
  return appHref(full, APP_URL);
}
