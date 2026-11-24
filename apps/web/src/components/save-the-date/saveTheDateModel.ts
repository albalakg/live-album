/* Helpers to turn the public/admin hub payload into a StdCfg the renderer understands.
   Also: first-open seed, lossless style switch, defaultStyleFor, draft slice helpers. */
import type { HubBlock, SaveTheDateSlice } from "@/components/landing/types";
import {
  ASSET_BASE,
  BASE_SHOW,
  defaultStyleFor,
  defaultsFor,
  styleById,
  type StdCfg,
  type StdContent,
  type StdKind,
  type StdShow,
  type StyleId,
  type StyleOpts,
} from "./saveTheDateCatalog";

export type { SaveTheDateSlice };
export { defaultStyleFor };

export function mapKind(raw?: string | null): StdKind {
  const k = String(raw || "").trim().toLowerCase();
  if (k === "wedding" || k === "barmitzvah" || k === "birthday" || k === "brit" || k === "other") {
    return k;
  }
  if (k === "mitzva" || k === "batmitzva") return "barmitzvah";
  return "other";
}

export function mapKindFromEventType(eventType?: string | null): StdKind {
  const k = String(eventType || "").trim().toLowerCase();
  if (k === "wedding" || k === "barmitzvah" || k === "birthday" || k === "brit") return k;
  return "other";
}

export function resolvePhotoSrc(
  photo: unknown,
  ctx?: { assetUrls?: Record<string, { url: string; thumb_url?: string }>; stockUrls?: Record<string, string> }
): string | null {
  if (photo == null || photo === "") return null;
  if (typeof photo === "string") {
    if (photo.startsWith("assets/")) return `${ASSET_BASE}/${photo.slice("assets/".length)}`;
    return photo;
  }
  if (typeof photo === "object") {
    const p = photo as { url?: string; thumb_url?: string; stock?: string; asset_id?: number | string };
    if (typeof p.url === "string" && p.url) return p.url;
    if (typeof p.thumb_url === "string" && p.thumb_url) return p.thumb_url;
    if (p.asset_id != null && ctx?.assetUrls) {
      const hit = ctx.assetUrls[String(p.asset_id)];
      if (hit) return hit.url || hit.thumb_url || null;
    }
    if (typeof p.stock === "string" && ctx?.stockUrls && ctx.stockUrls[p.stock]) {
      return ctx.stockUrls[p.stock];
    }
  }
  return null;
}

export function toStdCfg(
  slice: SaveTheDateSlice | null | undefined,
  slug: string,
  ctx?: { assetUrls?: Record<string, { url: string; thumb_url?: string }>; stockUrls?: Record<string, string> }
): StdCfg {
  const style: StyleId = styleById(slice?.style).id;
  const incomingOpts = (slice?.style_opts && slice.style_opts[style]) || {};
  const styleOpts: StyleOpts = {
    ...defaultsFor(style),
    ...(incomingOpts as StyleOpts),
  };
  const c = slice?.content || {};
  const content: StdContent = {
    kind: mapKind(c.kind),
    a: String(c.a || ""),
    b: String(c.b || ""),
    title: String(c.title || ""),
    sub: String(c.sub || ""),
    date: String(c.date || ""),
    time: String(c.time || ""),
    venue: String(c.venue || ""),
    city: String(c.city || ""),
    line: String(c.line || ""),
    photo: resolvePhotoSrc(c.photo, ctx),
  };
  return {
    style,
    styleOpts,
    content,
    show: { ...BASE_SHOW, ...(slice?.show || {}) },
    slug,
  };
}

export function googleFontsHref(fonts: string[]): string {
  const unique = Array.from(new Set(fonts.filter(Boolean)));
  const families = unique
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** True when the slice was never filled (first open). */
export function isSliceEmpty(slice: SaveTheDateSlice | null | undefined): boolean {
  if (!slice || typeof slice !== "object") return true;
  const c = slice.content || {};
  return !c.date && !c.a && !c.b && !c.title;
}

/** Lossless style switch: keep content/show and per-style style_opts. */
export function setStyle(slice: SaveTheDateSlice, style: StyleId): SaveTheDateSlice {
  const next = styleById(style).id;
  const opts = { ...(slice.style_opts || {}) };
  if (!opts[next]) opts[next] = { ...defaultsFor(next) };
  return { ...slice, style: next, style_opts: opts };
}

export function setStyleOpt(slice: SaveTheDateSlice, key: string, value: string | boolean): SaveTheDateSlice {
  const style = styleById(slice.style).id;
  const cur = { ...(slice.style_opts || {}) };
  const mine = { ...defaultsFor(style), ...((cur[style] as StyleOpts) || {}) };
  mine[key] = value as StyleOpts[string];
  return { ...slice, style, style_opts: { ...cur, [style]: mine } };
}

export function emptySlice(style: StyleId): SaveTheDateSlice {
  return {
    style,
    style_opts: { [style]: { ...defaultsFor(style) } },
    content: {
      kind: "other",
      a: "",
      b: "",
      title: "",
      sub: "",
      date: "",
      time: "",
      venue: "",
      city: "",
      line: "",
      photo: null,
    },
    show: { ...BASE_SHOW },
  };
}

/** Conservative wedding name split: only ` & ` or ` ו ` with two obvious parts. */
export function splitWeddingName(name: string): { a: string; b: string } | null {
  const s = String(name || "").trim();
  if (!s) return null;
  // ` & `, spaced ` ו `, or Hebrew vav glued to the second name (`שירה ואלון`).
  const parts = s.split(/\s+&\s+|\s+ו\s+|\s+ו(?=\S)/);
  if (parts.length !== 2) return null;
  const a = parts[0].trim();
  const b = parts[1].trim();
  if (a.length < 2 || b.length < 2) return null;
  if (/[&]| ו /.test(a) || /[&]| ו /.test(b)) return null;
  return { a, b };
}

/** Event start (ISO, SQL, or already-local) → calendar date + HH:MM in Asia/Jerusalem. */
export function jerusalemDateTime(raw: unknown): { date: string; time: string } {
  const s = String(raw || "").trim();
  if (!s) return { date: "", time: "" };
  // Timezone-less SQL or already-local store values (YYYY/MM/DD HH:MM:SS) are wall-clock,
  // not UTC — do not run them through Date() or they shift again.
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
  const m = /^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(s);
  if (m && !hasZone) {
    return { date: `${m[1]}-${m[2]}-${m[3]}`, time: `${m[4] || "19"}:${m[5] || "00"}` };
  }
  const parsed = new Date(s);
  if (!isNaN(+parsed)) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jerusalem",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(parsed);
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
  }
  if (!m) return { date: "", time: "" };
  return { date: `${m[1]}-${m[2]}-${m[3]}`, time: `${m[4] || "19"}:${m[5] || "00"}` };
}

export interface SeedEvent {
  name?: string | null;
  starts_at?: unknown;
  event_type?: string | null;
  image?: string | null;
}

function defaultSub(kind: StdKind): string {
  if (kind === "wedding") return "מתחתנים!";
  if (kind === "barmitzvah") return "בר / בת המצווה";
  if (kind === "birthday") return "חוגגים";
  if (kind === "brit") return "שמרו את התאריך";
  return "שמרו את התאריך";
}

function heroVenue(blocks?: HubBlock[] | null): { venue: string; city: string } {
  const hero = (blocks || []).find((b) => b && b.type === "HERO_COUNTDOWN");
  const data = (hero && hero.data) || {};
  return {
    venue: String(data.venue || data.place || ""),
    city: String(data.city || ""),
  };
}

function seedPhoto(event: SeedEvent, blocks?: HubBlock[] | null): unknown {
  const hero = (blocks || []).find((b) => b && b.type === "HERO_COUNTDOWN");
  const data = ((hero && hero.data) || {}) as Record<string, unknown>;
  const coverObj = data.cover;
  const coverFromObj =
    coverObj && typeof coverObj === "object" && "url" in coverObj
      ? (coverObj as { url?: unknown }).url
      : undefined;
  const cover = data.cover_image_url || coverFromObj;
  if (typeof cover === "string" && cover) return cover;
  const img = event.image;
  if (typeof img === "string" && (img.startsWith("http") || img.startsWith("/"))) return img;
  return null;
}

/** First-open seed from the event row + optional HERO_COUNTDOWN venue. Never writes the events row. */
export function seedSlice(event: SeedEvent, blocks?: HubBlock[] | null): SaveTheDateSlice {
  const eventType = String(event.event_type || "");
  const name = String(event.name || "").trim();
  const split = splitWeddingName(name);
  // Profile payloads may omit event_type; an obvious "A ו B" / "A & B" name still seeds as a wedding.
  const kind = eventType ? mapKindFromEventType(eventType) : split ? "wedding" : "other";
  const style = defaultStyleFor(eventType || (kind === "wedding" ? "wedding" : ""));
  const content: StdContent = {
    kind,
    a: "",
    b: "",
    title: "",
    sub: defaultSub(kind),
    date: "",
    time: "",
    venue: "",
    city: "",
    line: "הזמנה רשמית תגיע בהמשך",
    photo: (seedPhoto(event, blocks) as string | null) || null,
  };
  if (kind === "wedding") {
    if (split) {
      content.a = split.a;
      content.b = split.b;
    } else {
      content.title = name;
    }
  } else {
    content.title = name;
  }
  const dt = jerusalemDateTime(event.starts_at);
  content.date = dt.date;
  content.time = dt.time || "19:00";
  const place = heroVenue(blocks);
  content.venue = place.venue;
  content.city = place.city;
  return {
    style,
    style_opts: { [style]: { ...defaultsFor(style) } },
    content,
    show: { ...BASE_SHOW } as StdShow,
  };
}

/** Display title for the toolbar and share text. */
export function sliceTitle(slice: SaveTheDateSlice | null | undefined): string {
  const c = slice?.content || {};
  if (c.kind === "wedding") {
    const a = String(c.a || "").trim();
    const b = String(c.b || "").trim();
    if (a && b) return `${a} ו${b}`;
    return a || b || String(c.title || "").trim();
  }
  return String(c.title || c.sub || "").trim();
}

export function patchContent(
  slice: SaveTheDateSlice,
  patch: Omit<Partial<StdContent>, "photo"> & { photo?: unknown }
): SaveTheDateSlice {
  return { ...slice, content: { ...(slice.content || {}), ...patch } };
}

export function patchShow(slice: SaveTheDateSlice, patch: Partial<StdShow>): SaveTheDateSlice {
  return { ...slice, show: { ...BASE_SHOW, ...(slice.show || {}), ...patch } };
}
