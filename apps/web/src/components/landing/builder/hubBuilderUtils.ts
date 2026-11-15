import type { AxiosError } from "axios";
import type { HubBlock, HubConfig, ImageRef } from "../types";
import { getDefaultHubConfig, isKnownTemplateId } from "../templates/registry";
import { fieldsForBlockType, isHttpsUrl, type BuilderField } from "./builderFields";
import { LOCKED_BLOCK_TYPES } from "./blockLabels";

export interface EventPrefill {
  name?: string | null;
  starts_at?: string | null;
  welcome_text?: string | null;
  event_type?: string | null;
}

export interface FieldError {
  blockId: string;
  fieldKey: string;
  message: string;
  listIndex?: number;
  listSubKey?: string;
}

export function hasTemplateId(config: HubConfig | { template_id?: string } | null | undefined): boolean {
  const id = config?.template_id;
  return typeof id === "string" && id !== "" && isKnownTemplateId(id);
}

export function cloneHubConfig(config: HubConfig): HubConfig {
  return JSON.parse(JSON.stringify(config)) as HubConfig;
}

function prefillHero(config: HubConfig, event: EventPrefill): void {
  const hero = config.blocks.find((b) => b.type === "HERO_COUNTDOWN");
  if (!hero) return;
  if (event.name) hero.data.title = event.name;
  if (event.starts_at) hero.data.event_date = event.starts_at;
  if (event.welcome_text) {
    hero.data.welcome = event.welcome_text;
  }
}

function keepHeroBasics(from: HubConfig | null, into: HubConfig): void {
  if (!from) return;
  const prev = from.blocks.find((b) => b.type === "HERO_COUNTDOWN");
  const next = into.blocks.find((b) => b.type === "HERO_COUNTDOWN");
  if (!prev || !next) return;
  if (prev.data.title != null) next.data.title = prev.data.title;
  if (prev.data.event_date != null) next.data.event_date = prev.data.event_date;
  if (prev.data.venue != null) next.data.venue = prev.data.venue;
  if (prev.data.city != null) next.data.city = prev.data.city;
}

/** Apply a template defaults; optionally keep hero title/date/venue from previous. */
export function applyTemplateConfig(
  templateId: string,
  options: {
    event?: EventPrefill;
    previous?: HubConfig | null;
    keepHero?: boolean;
  } = {}
): HubConfig | null {
  const base = getDefaultHubConfig(templateId);
  if (!base) return null;
  const config = cloneHubConfig(base);
  if (options.keepHero && options.previous) {
    keepHeroBasics(options.previous, config);
  } else if (options.event) {
    prefillHero(config, options.event);
  }
  return config;
}

export function renumberBlockOrders(blocks: HubBlock[]): HubBlock[] {
  return blocks.map((b, i) => ({ ...b, order: i + 1 }));
}

export function moveBlock(blocks: HubBlock[], blockId: string, dir: -1 | 1): HubBlock[] {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((b) => b.id === blockId);
  if (idx < 0) return blocks;
  const block = sorted[idx];
  if (LOCKED_BLOCK_TYPES.has(block.type)) return blocks;
  const target = idx + dir;
  if (target < 0 || target >= sorted.length) return blocks;
  const other = sorted[target];
  if (LOCKED_BLOCK_TYPES.has(other.type)) return blocks;
  // hero must stay first, footer last
  if (sorted[0]?.type === "HERO_COUNTDOWN" && (idx === 0 || target === 0)) return blocks;
  if (sorted[sorted.length - 1]?.type === "FOOTER" && (idx === sorted.length - 1 || target === sorted.length - 1)) {
    return blocks;
  }
  sorted[idx] = other;
  sorted[target] = block;
  return renumberBlockOrders(sorted);
}

export function setBlockEnabled(blocks: HubBlock[], blockId: string, enabled: boolean): HubBlock[] {
  return blocks.map((b) => {
    if (b.id !== blockId) return b;
    if (LOCKED_BLOCK_TYPES.has(b.type)) return { ...b, enabled: true };
    return { ...b, enabled };
  });
}

export function updateBlockData(
  blocks: HubBlock[],
  blockId: string,
  data: Record<string, unknown>
): HubBlock[] {
  return blocks.map((b) => (b.id === blockId ? { ...b, data: { ...data } } : b));
}

export function normalizeSlugInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "");
}

const HEX = /^#[0-9A-Fa-f]{6}$/;

function validateFieldValue(
  field: BuilderField,
  value: unknown,
  blockId: string,
  errors: FieldError[]
): void {
  if (field.kind === "image") return;

  if (field.kind === "list") {
    const arr = Array.isArray(value) ? value : [];
    if (field.minItems && arr.length < field.minItems) {
      errors.push({
        blockId,
        fieldKey: field.key,
        message: `נדרש לפחות פריט אחד ב«${field.label}»`,
      });
    }
    if (field.maxItems && arr.length > field.maxItems) {
      errors.push({
        blockId,
        fieldKey: field.key,
        message: `יותר מדי פריטים ב«${field.label}»`,
      });
    }
    arr.forEach((item, index) => {
      if (field.stringItems) {
        const s = String(item ?? "");
        if (field.subFields?.[0]?.max && s.length > field.subFields[0].max) {
          errors.push({
            blockId,
            fieldKey: field.key,
            listIndex: index,
            message: `הטקסט ארוך מדי`,
          });
        }
        return;
      }
      if (!item || typeof item !== "object") return;
      const row = item as Record<string, unknown>;
      for (const sub of field.subFields || []) {
        if (sub.kind === "image") continue;
        const v = row[sub.key];
        const str = v == null ? "" : String(v);
        if (sub.required && !str.trim()) {
          errors.push({
            blockId,
            fieldKey: field.key,
            listIndex: index,
            listSubKey: sub.key,
            message: `${sub.label} הוא שדה חובה`,
          });
        }
        if (sub.kind === "url" && str && !isHttpsUrl(str)) {
          errors.push({
            blockId,
            fieldKey: field.key,
            listIndex: index,
            listSubKey: sub.key,
            message: "הקישור חייב להתחיל ב־https://",
          });
        }
        if (sub.max && str.length > sub.max) {
          errors.push({
            blockId,
            fieldKey: field.key,
            listIndex: index,
            listSubKey: sub.key,
            message: `${sub.label} ארוך מדי`,
          });
        }
      }
    });
    return;
  }

  const str = value == null ? "" : String(value);
  if (field.required && !str.trim()) {
    errors.push({
      blockId,
      fieldKey: field.key,
      message: `${field.label} הוא שדה חובה`,
    });
  }
  if (field.kind === "url" && str && !isHttpsUrl(str)) {
    errors.push({
      blockId,
      fieldKey: field.key,
      message: "הקישור חייב להתחיל ב־https://",
    });
  }
  if (field.max && str.length > field.max) {
    errors.push({
      blockId,
      fieldKey: field.key,
      message: `${field.label} ארוך מדי`,
    });
  }
}

/** Client-side mirror of server caps — returns first errors found. */
export function validateHubConfigClient(config: HubConfig): FieldError[] {
  const errors: FieldError[] = [];
  if (!hasTemplateId(config)) {
    return [{ blockId: "", fieldKey: "template_id", message: "בחרו עיצוב לפני השמירה" }];
  }
  for (const block of config.blocks || []) {
    const fields = fieldsForBlockType(block.type);
    for (const field of fields) {
      validateFieldValue(field, block.data?.[field.key], block.id, errors);
    }
  }
  const colors = config.theme?.colors || {};
  for (const [key, val] of Object.entries(colors)) {
    if (val != null && val !== "" && !HEX.test(String(val))) {
      errors.push({
        blockId: "",
        fieldKey: `theme.colors.${key}`,
        message: "צבע חייב להיות בפורמט #RRGGBB",
      });
    }
  }
  return errors;
}

export function mapAxiosValidationErrors(err: unknown): FieldError[] {
  const ax = err as AxiosError<{ errors?: Record<string, string[]>; message?: string }>;
  const status = ax?.response?.status;
  const body = ax?.response?.data;
  const out: FieldError[] = [];

  if (status === 422 && body?.errors) {
    for (const [path, msgs] of Object.entries(body.errors)) {
      const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
      const m = path.match(/hub_config\.blocks\.(\d+)\.data\.([^.]+)/);
      if (m) {
        out.push({
          blockId: `__index_${m[1]}`,
          fieldKey: m[2],
          message: hebrewizeServerMessage(msg),
        });
      } else {
        out.push({ blockId: "", fieldKey: path, message: hebrewizeServerMessage(msg) });
      }
    }
  }
  return out;
}

export function hebrewizeServerMessage(msg: string): string {
  const m = String(msg || "");
  if (/slug/i.test(m) && /required/i.test(m)) return "נדרשת כתובת לפני הפרסום";
  if (/not saved|EVENT_HUB_NOT_SAVED/i.test(m)) return "שמרו את העמוד לפני הפרסום";
  if (/taken/i.test(m)) return "הכתובת תפוסה";
  if (/reserved/i.test(m)) return "הכתובת שמורה";
  if (/invalid.?slug|INVALID_SLUG/i.test(m)) return "כתובת לא תקינה";
  if (/INVALID_BLOCKS|invalid blocks/i.test(m)) {
    return "חלק מהשדות לא תקינים. בדקו את הסעיפים המסומנים.";
  }
  if (/CONTENT_REJECTED|profanity/i.test(m)) return "התוכן נדחה. נסו לנסח מחדש.";
  if (/required/i.test(m)) return "שדה חובה חסר";
  return "לא הצלחנו לשמור. בדקו את השדות ונסו שוב.";
}

export function friendlyHubError(err: unknown): string {
  const ax = err as AxiosError<{ message?: string }>;
  const msg = ax?.response?.data?.message || (err as Error)?.message || "";
  return hebrewizeServerMessage(String(msg));
}

export function isImageRef(value: unknown): value is ImageRef {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const hasAsset = "asset_id" in v;
  const hasStock = "stock" in v;
  return (hasAsset && !hasStock) || (hasStock && !hasAsset);
}

export function snapshotHub(config: HubConfig, slug: string, published: boolean): string {
  return JSON.stringify({ config, slug, published });
}
