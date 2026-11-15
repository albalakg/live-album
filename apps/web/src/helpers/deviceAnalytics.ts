import axios from "axios";

const STORAGE_KEY = "snapshare_device_id";

export type AnalyticsEventName =
  | "landing_view"
  | "upload_page_view"
  | "gallery_view"
  | "gallery_download";

function createUuid(): string {
  const c =
    typeof globalThis !== "undefined"
      ? (globalThis.crypto as Crypto & { randomUUID?: () => string })
      : undefined;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return createUuid();
  }
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) {
      return existing;
    }
    const id = createUuid();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return createUuid();
  }
}

/** Fire-and-forget page/action analytics. Never throws to callers. */
export function trackEvent(
  eventPath: string,
  name: AnalyticsEventName,
  meta?: { count?: number }
): void {
  const path = String(eventPath || "").trim();
  if (!path) return;

  const device_id = getOrCreateDeviceId();
  const payload: {
    device_id: string;
    events: Array<{ name: AnalyticsEventName; meta?: { count?: number } }>;
  } = {
    device_id,
    events: [{ name, ...(meta ? { meta } : {}) }],
  };

  axios.post(`events/${encodeURIComponent(path)}/analytics`, payload).catch(() => {
    /* ignore tracking failures */
  });
}
