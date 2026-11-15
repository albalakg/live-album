import axios, { type AxiosError } from "axios";
import type { HubBlock, HubConfig, HubTheme, ImageRef } from "@/components/landing/types";

/** Public GET /api/public/hubs/{slug} payload (M1). */
export interface PublicHubIntegrations {
  gallery_path?: string | null;
  gallery_url?: string | null;
  icebreaker_enabled?: boolean;
}

export interface PublicHubPayload {
  event_id: number;
  event_name: string;
  template_id?: string | null;
  theme: HubTheme;
  blocks: Array<Omit<HubBlock, "enabled"> & { enabled?: boolean }>;
  integrations: PublicHubIntegrations;
}

export type PublicHubFetchResult =
  | { ok: true; data: PublicHubPayload }
  | { ok: false; kind: "not_found" }
  | { ok: false; kind: "network"; error: unknown };

/** Admin GET /api/events/{id}/hub */
export interface AdminHubPayload {
  event_id: number;
  slug: string | null;
  is_published: boolean;
  hub_config: HubConfig | { theme?: HubTheme; blocks?: HubBlock[]; template_id?: string };
  updated_at: string | null;
}

export interface UpdateHubPayload {
  slug?: string | null;
  is_published: boolean;
  hub_config: HubConfig;
}

export interface PublishHubPayload {
  is_published: boolean;
  slug?: string | null;
}

export interface PublishHubResult {
  is_published: boolean;
  slug: string | null;
  updated_at: string | null;
}

export type SlugCheckReason =
  | "invalid"
  | "reserved"
  | "taken"
  | "too_short"
  | "too_long"
  | null;

export interface SlugCheckResult {
  slug: string;
  available: boolean;
  reason: Exclude<SlugCheckReason, null> | null;
}

export interface HubAssetItem {
  id: number;
  url: string;
  thumb_url: string;
  width: number | null;
  height: number | null;
  created_at: string | null;
}

export interface HubAssetsPage {
  data: HubAssetItem[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

function unwrapData<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in (body as object)) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function isNotFound(err: unknown): boolean {
  const ax = err as AxiosError;
  const status = ax?.response?.status;
  return status === 404 || status === 410;
}

/** Typed public hub fetch. Does not throw; maps 404 → not_found. */
export async function getPublicHub(slug: string): Promise<PublicHubFetchResult> {
  try {
    const res = await axios.get<{ data?: PublicHubPayload } | PublicHubPayload>(
      `public/hubs/${encodeURIComponent(slug)}`
    );
    const data = unwrapData<PublicHubPayload>(res.data);
    if (!data || typeof data !== "object" || !("event_id" in data)) {
      return { ok: false, kind: "network", error: new Error("empty public hub payload") };
    }
    return { ok: true, data };
  } catch (err) {
    if (isNotFound(err)) return { ok: false, kind: "not_found" };
    return { ok: false, kind: "network", error: err };
  }
}

export async function getAdminHub(eventId: number): Promise<AdminHubPayload> {
  const res = await axios.get(`events/${eventId}/hub`);
  return unwrapData<AdminHubPayload>(res.data);
}

export async function updateHub(
  eventId: number,
  payload: UpdateHubPayload
): Promise<{ updated_at: string | null }> {
  const res = await axios.put(`events/${eventId}/hub`, payload);
  return unwrapData<{ updated_at: string | null }>(res.data);
}

export async function publishHub(
  eventId: number,
  payload: PublishHubPayload
): Promise<PublishHubResult> {
  const res = await axios.patch(`events/${eventId}/hub/publish`, payload);
  return unwrapData<PublishHubResult>(res.data);
}

export async function checkHubSlug(
  eventId: number,
  slug: string
): Promise<SlugCheckResult> {
  const res = await axios.get(`events/${eventId}/hub/slug-check`, {
    params: { slug },
  });
  return unwrapData<SlugCheckResult>(res.data);
}

export async function getHubAssets(
  eventId: number,
  page = 1,
  perPage = 24
): Promise<HubAssetsPage> {
  const res = await axios.get(`events/${eventId}/hub/assets`, {
    params: { page, per_page: perPage },
  });
  return unwrapData<HubAssetsPage>(res.data);
}

export type { ImageRef, HubBlock, HubTheme, HubConfig };
