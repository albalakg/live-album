import type {
  HubConfig,
  ImageRef,
  ResolvedImage,
  StockEntry,
  TemplateMeta,
} from "../types";
import templateMeta from "./templateMeta.json";
import defaultHubConfigs from "./defaultHubConfigs.json";
import manifest from "./manifest.json";

export const TEMPLATE_IDS = Object.keys(templateMeta) as string[];

export type TemplateId = keyof typeof templateMeta;

interface ManifestFile {
  file: string;
  alt: string;
}

interface ManifestPool {
  hero: ManifestFile;
  [key: string]: ManifestFile;
}

interface Manifest {
  version: number;
  templates: Record<string, string>;
  pools: Record<string, ManifestPool>;
}

const MANIFEST = manifest as Manifest;
const META = templateMeta as Record<string, TemplateMeta>;
const DEFAULTS = defaultHubConfigs as Record<string, HubConfig>;

const artAltFallback: Record<string, string> = {
  blush: "רקע פרחוני",
  espresso: "רקע כהה",
  teal: "רקע טורקיז",
  navy: "רקע חיל הים",
  balloons: "בלונים דקורטיביים",
  adult: "רקע אלגנטי",
  olive: "עלי זית",
  clothes: "חבל כביסה דקורטיבי",
  glass: "רקע זכוכית",
  gala: "רקע גאלה",
  neon: "רקע ניאון",
  retro: "רקע רטרו",
  sunset: "שקיעה דקורטיבית",
  boho: "רקע בוהו",
};

/** Resolve stock key → public URL + Hebrew alt via AI manifest / art stems. */
export function resolveStock(key: string): StockEntry | null {
  if (!key) return null;

  if (key.startsWith("art/")) {
    const stem = key.slice(4);
    if (/^album-\d+/i.test(stem)) return null;
    const url = `/landing/art/${stem}.webp`;
    return { url, alt: artAltFallback[stem] || `עיטור ${stem}` };
  }

  // template-id/hero | template-id/album-N
  const slash = key.indexOf("/");
  if (slash === -1) return null;
  const templateId = key.slice(0, slash);
  const slot = key.slice(slash + 1); // hero | album-1
  const type = MANIFEST.templates[templateId];
  if (!type) return null;
  const pool = MANIFEST.pools[type];
  if (!pool) return null;
  const file = pool[slot] || (slot === "hero" ? pool.hero : undefined);
  if (!file) return null;
  return {
    url: `/landing/ai/${type}/${file.file}`,
    alt: file.alt,
  };
}

export function getTemplate(id: string): TemplateMeta | null {
  return META[id] || null;
}

export function listTemplates(): TemplateMeta[] {
  return TEMPLATE_IDS.map((id) => META[id]).filter(Boolean);
}

export function getDefaultHubConfig(templateId: string): HubConfig | null {
  const cfg = DEFAULTS[templateId];
  return cfg ? (JSON.parse(JSON.stringify(cfg)) as HubConfig) : null;
}

export function isKnownTemplateId(id: string): boolean {
  return Boolean(META[id]);
}

export function navLabelsForTemplate(templateId: string): Array<{ id: string; label: string }> {
  return META[templateId]?.nav || [];
}

/** Build stock map for a template: key → {url, alt}. */
export function stockMapForTemplate(templateId: string): Record<string, StockEntry> {
  const meta = META[templateId];
  const out: Record<string, StockEntry> = {};
  if (!meta) return out;
  for (const key of meta.stock_keys || []) {
    const resolved = resolveStock(key);
    if (resolved) out[key] = resolved;
  }
  // common hero art key
  if (meta.hero_art) {
    const artKey = `art/${meta.hero_art}`;
    const resolved = resolveStock(artKey);
    if (resolved) out[artKey] = resolved;
  }
  return out;
}

export function resolveImageRef(
  ref: ImageRef | string | null | undefined,
  resolvedImages?: Record<string, ResolvedImage>
): ResolvedImage | null {
  if (!ref) return null;

  if (typeof ref === "string") {
    // bare URL or stock key
    if (ref.startsWith("http") || ref.startsWith("/")) {
      return { url: ref, alt: "" };
    }
    const stock = resolveStock(ref);
    return stock ? { url: stock.url, alt: stock.alt } : null;
  }

  if ("url" in ref && ref.url) {
    return {
      url: String(ref.url),
      alt: ref.alt || "",
      thumb_url: ref.thumb_url,
    };
  }

  if ("asset_id" in ref && ref.asset_id != null) {
    const key = `asset:${ref.asset_id}`;
    if (resolvedImages?.[key]) return resolvedImages[key];
    if (resolvedImages?.[String(ref.asset_id)]) return resolvedImages[String(ref.asset_id)];
    return null;
  }

  if ("stock" in ref && ref.stock) {
    const key = ref.stock;
    if (resolvedImages?.[key]) return resolvedImages[key];
    if (resolvedImages?.[`stock:${key}`]) return resolvedImages[`stock:${key}`];
    const stock = resolveStock(key);
    return stock ? { url: stock.url, alt: stock.alt } : null;
  }

  if ("type" in ref && ref.type === "stock" && ref.key) {
    return resolveImageRef({ stock: ref.key }, resolvedImages);
  }

  if ("type" in ref && ref.type === "asset") {
    if (ref.url) {
      return {
        url: String(ref.url),
        alt: ref.alt || "תמונה מהאירוע",
        thumb_url: ref.thumb_url ? String(ref.thumb_url) : String(ref.url),
      };
    }
    if (ref.asset_id != null) {
      return resolveImageRef({ asset_id: ref.asset_id }, resolvedImages);
    }
  }

  return null;
}

export function googleFontsHref(families: string[]): string {
  const unique = Array.from(new Set(["Outfit", ...families.filter(Boolean)]));
  const spec = unique
    .map((f) => {
      const enc = f.replace(/ /g, "+");
      if (f === "Secular One" || f === "Varela Round") return `family=${enc}`;
      if (f === "Outfit") return "family=Outfit:wght@600;700;800";
      if (f === "Frank Ruhl Libre") return "family=Frank+Ruhl+Libre:wght@400;500;700;900";
      if (f === "Heebo") return "family=Heebo:wght@400;500;600;700;800;900";
      if (f === "Rubik") return "family=Rubik:wght@400;500;600;700;800";
      if (f === "Assistant") return "family=Assistant:wght@400;500;600;700;800";
      return `family=${enc}:wght@400;500;600;700;800`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${spec}&display=swap`;
}

export async function loadTemplateTheme(templateId: string): Promise<void> {
  switch (templateId) {
    case "wedding-1":
      await import("../themes/wedding-1.css");
      break;
    case "wedding-2":
      await import("../themes/wedding-2.css");
      break;
    case "barmitzvah-1":
      await import("../themes/barmitzvah-1.css");
      break;
    case "barmitzvah-2":
      await import("../themes/barmitzvah-2.css");
      break;
    case "birthday-1":
      await import("../themes/birthday-1.css");
      break;
    case "birthday-2":
      await import("../themes/birthday-2.css");
      break;
    case "brit-1":
      await import("../themes/brit-1.css");
      break;
    case "brit-2":
      await import("../themes/brit-2.css");
      break;
    case "corporate-1":
      await import("../themes/corporate-1.css");
      break;
    case "corporate-2":
      await import("../themes/corporate-2.css");
      break;
    case "party-1":
      await import("../themes/party-1.css");
      break;
    case "party-2":
      await import("../themes/party-2.css");
      break;
    case "festival-1":
      await import("../themes/festival-1.css");
      break;
    case "festival-2":
      await import("../themes/festival-2.css");
      break;
    default:
      break;
  }
}

export { META as templateRegistry, DEFAULTS as defaultHubConfigMap };
