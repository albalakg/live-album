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
  event_path?: string | null;
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

export type HubErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "backend_outdated"
  | "payload_too_large"
  | "server"
  | "validation"
  | "unknown";

export interface ClassifiedHubError {
  kind: HubErrorKind;
  message: string;
}

const BACKEND_OUTDATED_HE =
  "השרת שמחובר לאפליקציה הזו לא מכיר עדיין את דף האירוע החדש, ולכן השמירה נכשלה.";
const BACKEND_OUTDATED_LOCAL_HINT =
  "בפיתוח מקומי: פתחו את הבונה ב-http://localhost:8081/event/page (מחובר לשרת 8001).";

function axiosStatus(err: unknown): number | undefined {
  return (err as AxiosError)?.response?.status;
}

function axiosMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string }>;
  return String(ax?.response?.data?.message || (err as Error)?.message || "");
}

function axiosErrors(err: unknown): Record<string, string[]> | undefined {
  const ax = err as AxiosError<{ errors?: Record<string, string[]> }>;
  return ax?.response?.data?.errors;
}

function isBackendOutdatedPayload(err: unknown): boolean {
  const status = axiosStatus(err);
  if (status === 404) return true;
  if (status !== 422) return false;
  const msg = axiosMessage(err);
  if (/Invalid event hub block configuration/i.test(msg)) return true;
  const errors = axiosErrors(err);
  if (!errors) return false;
  return Object.keys(errors).some((path) =>
    /hub_config\.blocks\.\d+\.type$/.test(path)
  );
}

/**
 * Map hub API failures to a stable kind + Hebrew message.
 * Never returns raw English server text.
 */
export function classifyHubError(
  err: unknown,
  opts: { usesTemplate?: boolean } = {}
): ClassifiedHubError {
  console.error(err);
  const ax = err as AxiosError;
  const status = axiosStatus(err);

  if (!ax?.response) {
    return {
      kind: "network",
      message: "אין חיבור לשרת. בדקו שהשרת המקומי רץ ונסו שוב.",
    };
  }

  if (status === 401) {
    return {
      kind: "unauthorized",
      message: "החיבור פג. התחברו מחדש ונסו שוב.",
    };
  }
  if (status === 403) {
    return {
      kind: "forbidden",
      message: "אין לכם הרשאה לערוך את האירוע הזה.",
    };
  }
  if (status === 413) {
    return {
      kind: "payload_too_large",
      message: "התוכן גדול מדי לשמירה. קצרו טקסטים ארוכים ונסו שוב.",
    };
  }
  if (status && status >= 500) {
    return {
      kind: "server",
      message: "תקלה בשרת. השינויים לא נשמרו, נסו שוב בעוד רגע.",
    };
  }

  // Legacy backends: missing hub routes (404) or old block-type whitelist (422)
  if (status === 404 || (opts.usesTemplate && isBackendOutdatedPayload(err))) {
    let message = BACKEND_OUTDATED_HE;
    if (process.env.VUE_APP_ENV === "local") {
      message = `${message}\n${BACKEND_OUTDATED_LOCAL_HINT}`;
    }
    return { kind: "backend_outdated", message };
  }

  if (status === 422) {
    return {
      kind: "validation",
      message: "לא הצלחנו לשמור. בדקו את השדות ונסו שוב.",
    };
  }

  return {
    kind: "unknown",
    message: "לא הצלחנו לשמור. בדקו את השדות ונסו שוב.",
  };
}

export function backendOutdatedMessage(): string {
  let message = BACKEND_OUTDATED_HE;
  if (process.env.VUE_APP_ENV === "local") {
    message = `${message}\n${BACKEND_OUTDATED_LOCAL_HINT}`;
  }
  return message;
}

export type { ImageRef, HubBlock, HubTheme, HubConfig };
