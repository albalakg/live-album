import axios, { type AxiosError } from "axios";
import type { HubBlock, HubTheme, ImageRef } from "@/components/landing/types";

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
    const body = res.data as { data?: PublicHubPayload } & PublicHubPayload;
    const data = (body?.data ?? body) as PublicHubPayload;
    if (!data || typeof data !== "object" || !("event_id" in data)) {
      return { ok: false, kind: "network", error: new Error("empty public hub payload") };
    }
    return { ok: true, data };
  } catch (err) {
    if (isNotFound(err)) return { ok: false, kind: "not_found" };
    return { ok: false, kind: "network", error: err };
  }
}

export type { ImageRef, HubBlock, HubTheme };
