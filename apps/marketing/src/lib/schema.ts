import { SITE_NAME, SITE_ORIGIN, PRICES } from "@snapshare/design/site";

const FACEBOOK_URL = "https://www.facebook.com/share/1By1U5frDi/?mibextid=wwXIfr";
const INSTAGRAM_URL =
  "https://www.instagram.com/snapshare_live?igsh=MXpudTBjMWhxeWw%3D&utm_source=qr";

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    alternateName: ["סנאפשר", "SnapShare Live"],
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/favicon.svg`,
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL],
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: SITE_NAME,
    inLanguage: "he-IL",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
  };
}

export function productNode() {
  return {
    "@type": "Product",
    "@id": `${SITE_ORIGIN}/#product`,
    name: "SnapShare — אלבום חי לאירוע",
    description:
      "האורחים סורקים QR ומעלים תמונות וסרטונים. הכל מופיע על המסך באולם ונשמר באלבום אחד. תשלום אחד לאירוע, בלי מנוי.",
    brand: { "@type": "Brand", name: SITE_NAME },
    url: `${SITE_ORIGIN}/`,
    offers: [
      {
        "@type": "Offer",
        name: "ניסיון",
        price: String(PRICES.trial),
        priceCurrency: PRICES.currency,
        description: "ניסיון חינם, בלי כרטיס אשראי",
        url: `${SITE_ORIGIN}/order`,
      },
      {
        "@type": "Offer",
        name: "קלאסי",
        price: String(PRICES.classic),
        priceCurrency: PRICES.currency,
        description: "תשלום אחד לאירוע, בלי מנוי",
        url: `${SITE_ORIGIN}/order?subscription=classic`,
      },
      {
        "@type": "Offer",
        name: "פרימיום",
        price: String(PRICES.premium),
        priceCurrency: PRICES.currency,
        description: "תשלום אחד לאירוע, בלי מנוי",
        url: `${SITE_ORIGIN}/order?subscription=premium`,
      },
    ],
  };
}

export function faqNode(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path}`,
    })),
  };
}

export function graph(nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
