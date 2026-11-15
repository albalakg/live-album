import {
  getDefaultHubConfig,
  resolveImageRef,
  resolveStock,
} from "./templates/registry";
import type {
  EventMeta,
  HubBlock,
  HubConfig,
  HubTheme,
  ImageRef,
  ResolvedImage,
} from "./types";
import type { PublicHubIntegrations, PublicHubPayload } from "@/api/eventHub";

const ASSET_ALT = "תמונה מהאירוע";

const NEUTRAL_THEME: HubTheme = {
  palette_id: "default",
  background_type: "LIGHT",
  font_family: "Heebo",
  scale: "M",
  colors: {
    primary: "#3D6A80",
    secondary: "#8AA0AC",
    accent: "#3D6A80",
    background: "#F4F1EC",
    text: "#1A2830",
  },
};

function isResolvedPublicRef(node: unknown): node is ImageRef {
  if (!node || typeof node !== "object") return false;
  const n = node as Record<string, unknown>;
  if (n.type === "stock" && typeof n.key === "string") return true;
  if (n.type === "asset" && (typeof n.url === "string" || n.asset_id != null)) return true;
  if ("stock" in n || "asset_id" in n || "url" in n) return true;
  return false;
}

/** Convert a public image ref into a ResolvedImage (stock via registry, asset via urls). */
export function resolvePublicImageRef(
  ref: ImageRef | null | undefined,
  fallbackAlt = ASSET_ALT
): ResolvedImage | null {
  if (ref == null) return null;

  if (typeof ref === "object" && "type" in ref && ref.type === "stock" && ref.key) {
    const stock = resolveStock(ref.key);
    if (!stock) return null;
    return { url: stock.url, alt: stock.alt || fallbackAlt, thumb_url: stock.url };
  }

  if (typeof ref === "object" && "type" in ref && ref.type === "asset") {
    const url = ref.url ? String(ref.url) : "";
    if (!url) return null;
    return {
      url,
      thumb_url: ref.thumb_url ? String(ref.thumb_url) : url,
      alt: ref.alt || fallbackAlt,
    };
  }

  const resolved = resolveImageRef(ref);
  if (!resolved) return null;
  return {
    ...resolved,
    alt: resolved.alt || fallbackAlt,
  };
}

function defaultImageAtPath(defaults: HubConfig | null, path: Array<string | number>): ImageRef | null {
  if (!defaults) return null;
  let cur: unknown = defaults;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return null;
    cur = (cur as Record<string | number, unknown>)[key as never];
  }
  if (isResolvedPublicRef(cur) || (cur && typeof cur === "object" && "stock" in (cur as object))) {
    return cur as ImageRef;
  }
  return null;
}

/**
 * Walk theme + blocks. Null single-slot image refs fall back to the template
 * default stock for that same path. Gallery items that were dropped stay absent.
 */
function fillNullSlots(
  theme: HubTheme,
  blocks: HubBlock[],
  templateId: string | null
): { theme: HubTheme; blocks: HubBlock[] } {
  const defaults = templateId ? getDefaultHubConfig(templateId) : null;

  const fillTheme = { ...theme } as HubTheme & Record<string, unknown>;
  if (fillTheme.cover == null && defaults?.theme?.cover) {
    fillTheme.cover = defaults.theme.cover;
  }

  const outBlocks = blocks.map((block, bi) => {
    const data = { ...(block.data || {}) } as Record<string, unknown>;
    const defBlock = defaults?.blocks?.find((b) => b.id === block.id) || defaults?.blocks?.[bi];
    const defData = (defBlock?.data || {}) as Record<string, unknown>;

    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val === null && defData[key] != null && isResolvedPublicRef(defData[key])) {
        data[key] = defData[key];
        continue;
      }
      // nested image on list items already filtered by server when null
      if (Array.isArray(val)) {
        data[key] = val.map((item, ii) => {
          if (!item || typeof item !== "object") return item;
          const row = { ...(item as Record<string, unknown>) };
          if (row.image === null) {
            const defItem = Array.isArray(defData[key])
              ? (defData[key] as Array<Record<string, unknown>>)[ii]
              : null;
            if (defItem?.image) row.image = defItem.image;
            else return null; // drop if no default
          }
          return row;
        }).filter((x) => x != null);
      }
    }

    // hero cover inside data
    if (data.cover === null && defData.cover) {
      data.cover = defData.cover;
    }

    return { ...block, data };
  });

  return { theme: fillTheme as HubTheme, blocks: outBlocks };
}

export function integrationsToEventMeta(
  integrations: PublicHubIntegrations | undefined,
  eventName?: string,
  slug?: string,
  eventPath?: string | null
): EventMeta {
  const path =
    (eventPath && String(eventPath).trim()) ||
    (integrations?.gallery_path ? String(integrations.gallery_path) : "");
  const meta: EventMeta = {
    event_name: eventName,
    slug,
  };
  if (path) {
    meta.event_path = path;
    meta.upload_url = `/event/uploads/${path}`;
    meta.album_url = `/event/open-gallery/${path}`;
    if (integrations?.icebreaker_enabled) {
      meta.trivia_url = `/event/trivia/${path}`;
    }
  }
  return meta;
}

export interface NormalizedPublicHub {
  templateId: string;
  isLegacy: boolean;
  hubConfig: HubConfig;
  eventMeta: EventMeta;
  coverResolved: ResolvedImage | null;
}

/** Normalize M1 public payload into LandingRenderer props. */
export function normalizePublicHub(payload: PublicHubPayload, slug: string): NormalizedPublicHub {
  const templateId =
    typeof payload.template_id === "string" && payload.template_id.trim()
      ? payload.template_id.trim()
      : "";
  const isLegacy = !templateId;

  const rawBlocks: HubBlock[] = (payload.blocks || []).map((b, i) => ({
    id: String(b.id || `blk-${i}`),
    type: String(b.type || ""),
    enabled: b.enabled !== false,
    order: typeof b.order === "number" ? b.order : i + 1,
    data: (b.data || {}) as Record<string, unknown>,
  }));

  const rawTheme: HubTheme = {
    ...(isLegacy ? NEUTRAL_THEME : {}),
    ...(payload.theme || {}),
    palette_id: payload.theme?.palette_id || (isLegacy ? "default" : payload.theme?.palette_id) || "default",
  };

  const filled = isLegacy
    ? { theme: rawTheme, blocks: rawBlocks }
    : fillNullSlots(rawTheme, rawBlocks, templateId);

  const hubConfig: HubConfig = {
    template_id: templateId || "legacy",
    theme: filled.theme,
    blocks: filled.blocks,
  };

  const coverRef =
    (filled.theme.cover as ImageRef | null | undefined) ||
    (filled.blocks.find((b) => b.type === "HERO_COUNTDOWN")?.data?.cover as ImageRef | null | undefined) ||
    null;
  const coverResolved = resolvePublicImageRef(coverRef, ASSET_ALT);

  return {
    templateId: templateId || "legacy",
    isLegacy,
    hubConfig,
    eventMeta: integrationsToEventMeta(
      payload.integrations,
      payload.event_name,
      slug,
      payload.event_path
    ),
    coverResolved,
  };
}

export { NEUTRAL_THEME, ASSET_ALT, defaultImageAtPath };
