/* Helpers to turn the public/admin hub payload into a StdCfg the renderer understands. */
import type { SaveTheDateSlice } from "@/components/landing/types";
import {
  ASSET_BASE,
  BASE_SHOW,
  defaultsFor,
  styleById,
  type StdCfg,
  type StdContent,
  type StdKind,
  type StyleId,
  type StyleOpts,
} from "./saveTheDateCatalog";

export type { SaveTheDateSlice };

export function mapKind(raw?: string | null): StdKind {
  const k = String(raw || "").trim().toLowerCase();
  if (k === "wedding" || k === "barmitzvah" || k === "birthday" || k === "brit" || k === "other") {
    return k;
  }
  if (k === "mitzva" || k === "batmitzva") return "barmitzvah";
  return "other";
}

export function resolvePhotoSrc(photo: unknown): string | null {
  if (photo == null || photo === "") return null;
  if (typeof photo === "string") {
    if (photo.startsWith("assets/")) return `${ASSET_BASE}/${photo.slice("assets/".length)}`;
    return photo;
  }
  if (typeof photo === "object") {
    const p = photo as { url?: string; thumb_url?: string; stock?: string };
    if (typeof p.url === "string" && p.url) return p.url;
    if (typeof p.thumb_url === "string" && p.thumb_url) return p.thumb_url;
  }
  return null;
}

export function toStdCfg(slice: SaveTheDateSlice | null | undefined, slug: string): StdCfg {
  const style: StyleId = styleById(slice?.style).id;
  const incomingOpts = (slice?.style_opts && slice.style_opts[style]) || slice?.style_opts || {};
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
    photo: resolvePhotoSrc(c.photo),
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
