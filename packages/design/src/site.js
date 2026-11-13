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

/**
 * Shared plan facts for marketing + order UI.
 * Used as the always-on fallback when the subscriptions API is slow or down.
 * Prices match PRICES — not the unapproved ₪399 proposal.
 */
export const PLAN_FACTS = [
  {
    slug: "demo",
    nameHe: "ניסיון",
    nameApi: "נסיון",
    price: PRICES.trial,
    priceLabel: "חינם",
    priceSub: "בלי כרטיס אשראי",
    features: ["10 קבצים", "48 שעות", "בלי כרטיס אשראי"],
    cta: "נסו בחינם",
    featured: false,
    files_allowed: 10,
    storage_hours: 48,
  },
  {
    slug: "classic",
    nameHe: "קלאסי",
    nameApi: "קלאסי",
    price: PRICES.classic,
    priceLabel: null,
    priceSub: "תשלום אחד לאירוע, בלי מנוי",
    features: ["עד 1,000 קבצים", "האירוע נשמר כ-6 חודשים", "מסך חי כלול"],
    cta: "בחירת קלאסיק",
    featured: true,
    badge: "מומלץ",
    files_allowed: 1000,
    storage_hours: 4320,
  },
  {
    slug: "premium",
    nameHe: "פרימיום",
    nameApi: "פרימיום",
    price: PRICES.premium,
    priceLabel: null,
    priceSub: "תשלום אחד לאירוע, בלי מנוי",
    features: ["עד 5,000 קבצים", "האירוע נשמר כשנה", "מסך חי כלול"],
    cta: "בחירת פרימיום",
    featured: false,
    files_allowed: 5000,
    storage_hours: 8760,
  },
];

export function planFactBySlug(slug) {
  return PLAN_FACTS.find((plan) => plan.slug === slug) || null;
}

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
