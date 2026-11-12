/** Shared product facts. Prices are the live ones — not the unapproved ₪399 proposal. */
export const SITE_ORIGIN = "https://snapshare-live.com";
export const SITE_NAME = "SnapShare";

/** Existing GA4 property. Override with env; do not add a second loader. */
export const GA4_MEASUREMENT_ID = "G-XW53Y5YC3B";

/** Gal's business WhatsApp, E.164. Local display is 0528458600. */
export const WHATSAPP_E164 = "972528458600";
export const WHATSAPP_DISPLAY = "0528458600";
/** Kept so older checks still have a name for an unset number. */
export const WHATSAPP_PLACEHOLDER = "0000000000";

/** Visible business inbox until Gal confirms a different address. */
export const BUSINESS_EMAIL_DEFAULT = "hello@snapshare-live.com";

/**
 * Contact form transport. No secrets live here.
 * laravel: POST JSON { email, full_name, text } to the existing SnapShare API.
 * formspree / web3forms: used only when an id or access key is provided via env.
 */
export const CONTACT_PROVIDER_DEFAULT = "laravel";

export const PRICES = {
  trial: 0,
  classic: 200,
  premium: 300,
  currency: "ILS",
};

/** Launch-sale strikethrough (1.3×) stays off. Real discount codes are unrelated. */
export const SHOW_LAUNCH_SALE_STRIKETHROUGH = false;

export const GUEST_CTA = {
  label: "רוצים אלבום כזה? נסו בחינם",
  path: "/order",
  query: {
    utm_source: "album",
    utm_medium: "guest_cta",
    utm_campaign: "viral",
  },
};

export function guestCtaHref() {
  const params = new URLSearchParams(GUEST_CTA.query);
  return `${GUEST_CTA.path}?${params.toString()}`;
}

/** Prefix an app path with the Vue origin. Empty origin means same host (production). */
export function appHref(path, origin = "") {
  const base = String(origin || "").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export function whatsappHref(number) {
  const digits = String(number || "").replace(/\D/g, "");
  let resolved = digits || WHATSAPP_E164;
  if (resolved.startsWith("0")) resolved = `972${resolved.slice(1)}`;
  return `https://wa.me/${resolved}`;
}

export function isPaidPlan(name) {
  const value = String(name || "").trim().toLowerCase();
  return (
    value === "קלאסי" ||
    value === "פרימיום" ||
    value === "classic" ||
    value === "premium"
  );
}

export function isWhatsappPlaceholder(number) {
  const digits = String(number || "").replace(/\D/g, "");
  return !digits || digits === WHATSAPP_PLACEHOLDER;
}
