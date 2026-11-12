/** Shared product facts. Prices are the live ones — not the unapproved ₪399 proposal. */
export const SITE_ORIGIN = "https://snapshare-live.com";
export const SITE_NAME = "SnapShare";

/** Existing GA4 property. Override with env; do not add a second loader. */
export const GA4_MEASUREMENT_ID = "G-XW53Y5YC3B";

/** Placeholder until Gal supplies the real WhatsApp number. */
export const WHATSAPP_PLACEHOLDER = "0000000000";

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

export function whatsappHref(number) {
  const digits = String(number || "").replace(/\D/g, "");
  const resolved = digits || WHATSAPP_PLACEHOLDER;
  return `https://wa.me/${resolved}`;
}

export function isWhatsappPlaceholder(number) {
  const digits = String(number || "").replace(/\D/g, "");
  return !digits || digits === WHATSAPP_PLACEHOLDER;
}
