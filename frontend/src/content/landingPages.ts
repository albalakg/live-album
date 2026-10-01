import pages from "@/content/landing-pages.json";
import { applyPendingClaims } from "@/content/pendingClaims";

export interface LandingSection {
  level: number;
  heading: string | null;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingLink {
  slug: string;
  anchor: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface LandingPage {
  slug: string;
  primaryKeyword: string;
  title: string;
  metaDescription: string;
  h1: string;
  breadcrumbLabel: string;
  ctaTarget: string;
  sections: LandingSection[];
  faq: LandingFaq[];
  internalLinks: LandingLink[];
  schemaTypes: string[];
  howToSteps?: HowToStep[];
}

export const LANDING_PAGES = pages as LandingPage[];

export function findLandingPage(path: string): LandingPage | undefined {
  const normalized = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return LANDING_PAGES.find((page) => page.slug === normalized);
}

export function visibleCopy(text: string): string | null {
  return applyPendingClaims(text);
}

export function ctaLabel(page: LandingPage): string {
  const match = page.internalLinks.find((link) => link.slug === page.ctaTarget);
  return match ? match.anchor : "פתחו אירוע ניסיון בחינם";
}

export interface InlinePart {
  type: "text" | "strong" | "link";
  text: string;
  href?: string;
}

/** Turns proposal markdown (**bold** and [label](/path)) into parts. */
export function parseInline(input: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input))) {
    if (match.index > cursor) {
      parts.push({ type: "text", text: input.slice(cursor, match.index) });
    }
    if (match[1] != null) {
      parts.push({ type: "strong", text: match[1] });
    } else {
      parts.push({ type: "link", text: match[2], href: match[3] });
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < input.length) {
    parts.push({ type: "text", text: input.slice(cursor) });
  }
  return parts;
}

export function linkedSlugsInPage(page: LandingPage): Set<string> {
  const slugs = new Set<string>();
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;
  const chunks: string[] = [];
  page.sections.forEach((section) => {
    (section.paragraphs || []).forEach((paragraph) => {
      const visible = visibleCopy(paragraph);
      if (visible) chunks.push(visible);
    });
    (section.bullets || []).forEach((bullet) => {
      const visible = visibleCopy(bullet);
      if (visible) chunks.push(visible);
    });
  });
  chunks.forEach((chunk) => {
    let match: RegExpExecArray | null;
    const local = new RegExp(pattern.source, "g");
    while ((match = local.exec(chunk))) {
      slugs.add(match[1]);
    }
  });
  slugs.add(page.ctaTarget);
  return slugs;
}

/** Hub-and-spoke links that are not already written into the body. */
export function supplementalLinks(page: LandingPage): LandingLink[] {
  const present = linkedSlugsInPage(page);
  return page.internalLinks.filter((link) => !present.has(link.slug));
}

export function visibleFaq(page: LandingPage): LandingFaq[] {
  return page.faq
    .map((item) => {
      const answer = visibleCopy(item.a);
      if (!answer) return null;
      return { q: item.q, a: answer };
    })
    .filter((item): item is LandingFaq => item !== null);
}

export function ogImagePath(page: LandingPage): string {
  return `/assets/og${page.slug}.jpg`;
}
