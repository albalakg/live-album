/** Data for the «⇄ סגנון» strip previews (built by EventPageWorkspace from the live draft config). */
import { getTemplate, resolveImageRef } from "../templates/registry";
import type { HubConfig, ImageRef } from "../types";

export interface VariantStripSample {
  title: string;
  hero: string;
  images: string[];
  items: Array<{ time: string; label: string }>;
  colors: { bg: string; surface: string; ink: string; accent: string; line: string };
  font: string;
}

function urlOf(ref: unknown): string {
  const img = resolveImageRef(ref as ImageRef);
  return img ? img.thumb_url || img.url : "";
}

export function variantStripSample(cfg: HubConfig | null, templateId: string): VariantStripSample {
  const meta = getTemplate(templateId);
  const c = (meta?.colors || {}) as Record<string, string>;
  const blocks = cfg?.blocks || [];
  const hero = blocks.find((b) => b.type === "HERO_COUNTDOWN")?.data || {};
  const gal = blocks.find((b) => b.type === "GALLERY")?.data || {};
  const tl = blocks.find((b) => b.type === "EVENT_TIMELINE")?.data || {};
  const theme = (cfg?.theme || {}) as Record<string, unknown>;
  const images = ((gal.images || []) as Array<{ image?: unknown }>).map((im) => urlOf(im.image)).filter(Boolean);
  const heroUrl = urlOf(hero.cover) || urlOf(theme.cover) || urlOf(`${templateId}/hero`);
  const items = ((tl.items || []) as Array<Record<string, unknown>>).map((it) => ({
    time: String(it.time || ""),
    label: String(it.label || ""),
  }));
  return {
    title: String(hero.title || meta?.name_he || ""),
    hero: heroUrl,
    images: images.length ? images : heroUrl ? [heroUrl] : [],
    items: items.length ? items : [{ time: "19:00", label: "קבלת פנים" }, { time: "20:30", label: "חופה" }],
    colors: {
      bg: c.bg || "#F7F1E8",
      surface: c.surface || "#FFFFFF",
      ink: c.ink || "#2B2119",
      accent: c.accent || "#A9823F",
      line: c.line || "#E4D6C1",
    },
    font: `"${meta?.default_font || "Heebo"}", serif`,
  };
}
