import type { RouteLocationNormalizedLoaded } from "vue-router";
import { FAQ_ITEMS } from "@/seo/faqContent";
import {
  findLandingPage,
  ogImagePath,
  visibleFaq,
  type LandingPage,
} from "@/content/landingPages";

export const SITE_ORIGIN = "https://snapshare-live.com";
export const SITE_NAME = "SnapShare";
export const OG_IMAGE_PATH = "/assets/og-image.jpg";
export const OG_IMAGE_URL = `${SITE_ORIGIN}${OG_IMAGE_PATH}`;
export const OG_IMAGE_WIDTH = "1200";
export const OG_IMAGE_HEIGHT = "630";
export const OG_IMAGE_ALT =
  "SnapShare — אלבום דיגיטלי שיתופי לאירועים. האורחים מעלים תמונות והמסך מקרין.";

const FACEBOOK_URL =
  "https://www.facebook.com/share/1By1U5frDi/?mibextid=wwXIfr";
const INSTAGRAM_URL =
  "https://www.instagram.com/snapshare_live?igsh=MXpudTBjMWhxeWw%3D&utm_source=qr";

export interface PageSeo {
  title: string;
  description: string;
  /** index, follow | noindex, nofollow */
  robots: string;
  /** Which JSON-LD graph to emit. */
  schema: "home" | "service" | "website" | "none";
}

const INDEXABLE: Record<string, PageSeo> = {
  home: {
    title: "אלבום דיגיטלי שיתופי לאירועים עם QR | SnapShare",
    description:
      "האורחים סורקים QR ומעלים תמונות וסרטונים בזמן אמת, והמסך באירוע מקרין אלבום חי. ניסיון חינם, בלי אפליקציה — לחתונה, בר מצווה ואירועי חברה.",
    robots: "index, follow",
    schema: "home",
  },
  contact: {
    title: "צור קשר | SnapShare",
    description:
      "דברו איתנו על אלבום דיגיטלי שיתופי לאירוע שלכם. שאלות על מחיר, ניסיון חינם, הקרנה למסך או כרטיס QR — נשמח לעזור.",
    robots: "index, follow",
    schema: "website",
  },
  order: {
    title: "מחירים לאלבום דיגיטלי לאירוע | SnapShare",
    description:
      "ניסיון חינם ב־₪0, מסלול קלאסי ב־₪200 ומסלול פרימיום ב־₪300. אלבום שיתופי עם QR והקרנה חיה למסך האירוע.",
    robots: "index, follow",
    schema: "service",
  },
  termsAndConditions: {
    title: "תנאי שימוש | SnapShare",
    description:
      "תנאי השימוש ומדיניות ההתקשרות של SnapShare, האלבום הדיגיטלי השיתופי לאירועים עם העלאת תמונות ב־QR.",
    robots: "index, follow",
    schema: "website",
  },
};

const AUTH_PAGES: Record<string, Pick<PageSeo, "title" | "description">> = {
  login: {
    title: "התחברות | SnapShare",
    description: "התחברות לחשבון SnapShare לניהול האלבום הדיגיטלי של האירוע.",
  },
  signup: {
    title: "הרשמה | SnapShare",
    description: "פתיחת חשבון SnapShare כדי ליצור אלבום דיגיטלי שיתופי לאירוע.",
  },
  "forgot-password": {
    title: "שחזור סיסמה | SnapShare",
    description: "איפוס הסיסמה לחשבון SnapShare.",
  },
  resetPassword: {
    title: "איפוס סיסמה | SnapShare",
    description: "בחירת סיסמה חדשה לחשבון SnapShare.",
  },
  emailConfirmation: {
    title: "אימות אימייל | SnapShare",
    description: "אישור כתובת האימייל לחשבון SnapShare.",
  },
  googleAuthCallback: {
    title: "התחברות עם Google | SnapShare",
    description: "השלמת ההתחברות ל-SnapShare באמצעות Google.",
  },
  logout: {
    title: "התנתקות | SnapShare",
    description: "התנתקות מחשבון SnapShare.",
  },
};

function organizationNode() {
  return {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    alternateName: ["סנאפשר", "SnapShare Live"],
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/assets/icons/logo.png`,
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL],
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: SITE_NAME,
    inLanguage: "he-IL",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
  };
}

function serviceNode() {
  return {
    "@type": "Service",
    "@id": `${SITE_ORIGIN}/#service`,
    name: "אלבום דיגיטלי שיתופי לאירועים",
    serviceType: "אלבום תמונות חי לאירועים",
    description:
      "האורחים מעלים תמונות וסרטונים בסריקת QR, והאלבום מוקרן בזמן אמת על מסך האירוע.",
    provider: { "@id": `${SITE_ORIGIN}/#organization` },
    areaServed: { "@type": "Country", name: "Israel" },
    url: `${SITE_ORIGIN}/order`,
    offers: [
      {
        "@type": "Offer",
        name: "ניסיון חינם",
        price: "0",
        priceCurrency: "ILS",
        availability: "https://schema.org/InStock",
        url: `${SITE_ORIGIN}/order?subscription=demo`,
      },
      {
        "@type": "Offer",
        name: "קלאסי",
        price: "200",
        priceCurrency: "ILS",
        availability: "https://schema.org/InStock",
        url: `${SITE_ORIGIN}/order?subscription=classic`,
      },
      {
        "@type": "Offer",
        name: "פרימיום",
        price: "300",
        priceCurrency: "ILS",
        availability: "https://schema.org/InStock",
        url: `${SITE_ORIGIN}/order?subscription=premium`,
      },
    ],
  };
}

function faqNode() {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_ORIGIN}/#faq`,
    url: `${SITE_ORIGIN}/#faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function jsonLdFor(schema: PageSeo["schema"]): Record<string, unknown> | null {
  if (schema === "none") return null;
  const graph: object[] = [organizationNode(), websiteNode()];
  if (schema === "home" || schema === "service") {
    graph.push(serviceNode());
  }
  if (schema === "home") {
    graph.push(faqNode());
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function pageSeoFor(name: string | symbol | null | undefined): PageSeo {
  if (typeof name === "string" && INDEXABLE[name]) {
    return INDEXABLE[name];
  }
  if (name === "notFound") {
    return {
      title: "העמוד לא נמצא | SnapShare",
      description: "העמוד שחיפשתם לא קיים באתר SnapShare.",
      robots: "noindex, nofollow",
      schema: "none",
    };
  }
  if (typeof name === "string" && AUTH_PAGES[name]) {
    return {
      ...AUTH_PAGES[name],
      robots: "noindex, nofollow",
      schema: "none",
    };
  }
  return {
    title: "SnapShare",
    description: "SnapShare — אלבום דיגיטלי שיתופי לאירועים.",
    robots: "noindex, nofollow",
    schema: "none",
  };
}

export function canonicalUrl(route: RouteLocationNormalizedLoaded): string | null {
  const seo = pageSeoFor(route.name);
  if (!seo.robots.startsWith("index")) return null;
  const path = route.path === "/" ? "/" : route.path.replace(/\/+$/, "");
  return `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
}

const PLAN_OFFERS = [
  {
    "@type": "Offer",
    name: "ניסיון חינם",
    price: "0",
    priceCurrency: "ILS",
    availability: "https://schema.org/InStock",
    url: `${SITE_ORIGIN}/order?subscription=demo`,
  },
  {
    "@type": "Offer",
    name: "קלאסי",
    price: "200",
    priceCurrency: "ILS",
    availability: "https://schema.org/InStock",
    url: `${SITE_ORIGIN}/order?subscription=classic`,
  },
  {
    "@type": "Offer",
    name: "פרימיום",
    price: "300",
    priceCurrency: "ILS",
    availability: "https://schema.org/InStock",
    url: `${SITE_ORIGIN}/order?subscription=premium`,
  },
];

function landingJsonLd(page: LandingPage): Record<string, unknown> {
  const url = `${SITE_ORIGIN}${page.slug}`;
  const service: Record<string, unknown> = {
    "@type": "Service",
    "@id": `${url}#service`,
    name: page.h1,
    serviceType: page.primaryKeyword,
    provider: { "@id": `${SITE_ORIGIN}/#organization` },
    areaServed: { "@type": "Country", name: "Israel" },
    url,
    offers: PLAN_OFFERS,
  };
  if (page.slug === "/pricing") {
    service.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "מסלולי SnapShare",
      itemListElement: PLAN_OFFERS,
    };
  }

  const graph: object[] = [
    organizationNode(),
    websiteNode(),
    service,
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      url,
      mainEntity: visibleFaq(page).map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "דף הבית",
          item: `${SITE_ORIGIN}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.breadcrumbLabel,
          item: url,
        },
      ],
    },
  ];

  if (page.howToSteps && page.howToSteps.length) {
    graph.push({
      "@type": "HowTo",
      "@id": `${url}#howto`,
      name: page.h1,
      step: page.howToSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.name,
        text: step.text,
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function landingHead(page: LandingPage) {
  const canonical = `${SITE_ORIGIN}${page.slug}`;
  const image = `${SITE_ORIGIN}${ogImagePath(page)}`;
  const json = JSON.stringify(landingJsonLd(page)).replace(/</g, "\\u003c");
  return {
    title: page.title,
    htmlAttrs: { lang: "he", dir: "rtl" as const },
    meta: [
      { name: "description", content: page.metaDescription, key: "description" },
      { name: "robots", content: "index, follow", key: "robots" },
      { property: "og:title", content: page.title, key: "og:title" },
      { property: "og:description", content: page.metaDescription, key: "og:description" },
      { property: "og:type", content: "website", key: "og:type" },
      { property: "og:url", content: canonical, key: "og:url" },
      { property: "og:image", content: image, key: "og:image" },
      { property: "og:image:width", content: OG_IMAGE_WIDTH, key: "og:image:width" },
      { property: "og:image:height", content: OG_IMAGE_HEIGHT, key: "og:image:height" },
      { property: "og:image:alt", content: page.h1, key: "og:image:alt" },
      { property: "og:locale", content: "he_IL", key: "og:locale" },
      { property: "og:site_name", content: SITE_NAME, key: "og:site_name" },
      { name: "twitter:card", content: "summary_large_image", key: "twitter:card" },
      { name: "twitter:title", content: page.title, key: "twitter:title" },
      { name: "twitter:description", content: page.metaDescription, key: "twitter:description" },
      { name: "twitter:image", content: image, key: "twitter:image" },
    ],
    link: [{ rel: "canonical", href: canonical, key: "canonical" }],
    script: [
      { type: "application/ld+json", key: "ldjson", innerHTML: json },
    ],
  };
}

export function buildHeadInput(route: RouteLocationNormalizedLoaded) {
  const landing = findLandingPage(route.path);
  if (landing) return landingHead(landing);
  const seo = pageSeoFor(route.name);
  const canonical = canonicalUrl(route);
  const jsonLd = jsonLdFor(seo.schema);
  const json = jsonLd
    ? JSON.stringify(jsonLd).replace(/</g, "\\u003c")
    : "";

  return {
    title: seo.title,
    htmlAttrs: {
      lang: "he",
      dir: "rtl" as const,
    },
    meta: [
      { name: "description", content: seo.description, key: "description" },
      { name: "robots", content: seo.robots, key: "robots" },
      { property: "og:title", content: seo.title, key: "og:title" },
      { property: "og:description", content: seo.description, key: "og:description" },
      { property: "og:type", content: "website", key: "og:type" },
      ...(canonical
        ? [{ property: "og:url", content: canonical, key: "og:url" }]
        : []),
      { property: "og:image", content: OG_IMAGE_URL, key: "og:image" },
      { property: "og:image:width", content: OG_IMAGE_WIDTH, key: "og:image:width" },
      { property: "og:image:height", content: OG_IMAGE_HEIGHT, key: "og:image:height" },
      { property: "og:image:alt", content: OG_IMAGE_ALT, key: "og:image:alt" },
      { property: "og:locale", content: "he_IL", key: "og:locale" },
      { property: "og:site_name", content: SITE_NAME, key: "og:site_name" },
      { name: "twitter:card", content: "summary_large_image", key: "twitter:card" },
      { name: "twitter:title", content: seo.title, key: "twitter:title" },
      { name: "twitter:description", content: seo.description, key: "twitter:description" },
      { name: "twitter:image", content: OG_IMAGE_URL, key: "twitter:image" },
    ],
    link: canonical
      ? [{ rel: "canonical", href: canonical, key: "canonical" }]
      : [],
    script: json
      ? [
          {
            type: "application/ld+json",
            key: "ldjson",
            innerHTML: json,
          },
        ]
      : [],
  };
}
