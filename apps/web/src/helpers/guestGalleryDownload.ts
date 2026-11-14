import { zipSync } from "fflate";

export type DownloadProgressPhase = "fetch" | "pack" | "save";

export type DownloadProgress = {
  current: number;
  total: number;
  percent: number;
  phase: DownloadProgressPhase;
};

export type GuestDownloadable = {
  id: number | string;
  fullPath: string;
  type?: string;
  path?: string;
  name?: string;
};

function isMobileClient(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

/** Prefer event path (gallery code) as a filesystem-friendly slug. */
export function eventSlugFrom(event: {
  path?: string;
  name?: string;
} | null | undefined): string {
  const raw = (event?.path || event?.name || "album").toString().trim();
  const slug = raw
    .normalize("NFKD")
    .replace(/[^\w\u0590-\u05FF-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return slug || "album";
}

export function extensionForAsset(asset: GuestDownloadable): string {
  const fromPath = (asset.path || asset.fullPath || "").split("?")[0];
  const match = fromPath.match(/\.([a-z0-9]+)$/i);
  if (match) return match[1].toLowerCase();
  if (asset.type === "video") return "mp4";
  return "jpg";
}

/** Friendly name: <event-slug>-001.jpg (1-based index, zero-padded). */
export function friendlyFileName(
  slug: string,
  index1Based: number,
  asset: GuestDownloadable
): string {
  const pad = String(Math.max(1, index1Based)).padStart(3, "0");
  return `${slug}-${pad}.${extensionForAsset(asset)}`;
}

export async function fetchOriginalBlob(
  url: string,
  signal?: AbortSignal
): Promise<Blob> {
  const res = await fetch(url, {
    mode: "cors",
    credentials: "omit",
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.blob();
}

function triggerAnchorDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * On mobile, try Web Share with the file (saves to Photos when supported).
 * Fall back to a normal download if share is unavailable or rejects.
 */
export async function saveOrShareFile(
  blob: Blob,
  fileName: string
): Promise<"shared" | "downloaded"> {
  if (isMobileClient() && typeof navigator !== "undefined") {
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.share && nav.canShare) {
      try {
        const file = new File([blob], fileName, {
          type: blob.type || "application/octet-stream",
        });
        if (nav.canShare({ files: [file] })) {
          await nav.share({ files: [file] });
          return "shared";
        }
      } catch (err) {
        const name = (err as Error)?.name;
        if (name === "AbortError") return "shared";
        // fall through to download
      }
    }
  }
  triggerAnchorDownload(blob, fileName);
  return "downloaded";
}

export async function downloadSingleAsset(options: {
  asset: GuestDownloadable;
  slug: string;
  index1Based: number;
  signal?: AbortSignal;
}): Promise<void> {
  const { asset, slug, index1Based, signal } = options;
  if (!asset.fullPath) throw new Error("missing_url");
  const blob = await fetchOriginalBlob(asset.fullPath, signal);
  const fileName = friendlyFileName(slug, index1Based, asset);
  await saveOrShareFile(blob, fileName);
}

function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return blob.arrayBuffer().then((buf) => new Uint8Array(buf));
}

/**
 * Client-side ZIP via fflate (store level). Fetches originals sequentially
 * with progress; packs once all bytes are in memory.
 */
export async function zipAndDownloadAssets(options: {
  assets: GuestDownloadable[];
  indices1Based: number[];
  slug: string;
  zipName: string;
  signal?: AbortSignal;
  onProgress?: (p: DownloadProgress) => void;
}): Promise<void> {
  const { assets, indices1Based, slug, zipName, signal, onProgress } = options;
  if (!assets.length) throw new Error("empty");

  const entries: Record<string, Uint8Array> = {};
  const total = assets.length;

  for (let i = 0; i < assets.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const asset = assets[i];
    if (!asset.fullPath) throw new Error("missing_url");
    onProgress?.({
      current: i + 1,
      total,
      percent: Math.round(((i + 0.35) / total) * 90),
      phase: "fetch",
    });
    const blob = await fetchOriginalBlob(asset.fullPath, signal);
    const name = friendlyFileName(slug, indices1Based[i] ?? i + 1, asset);
    // Avoid collisions if two map to same name
    let finalName = name;
    let n = 2;
    while (entries[finalName]) {
      const ext = extensionForAsset(asset);
      const base = name.replace(new RegExp(`\\.${ext}$`), "");
      finalName = `${base}-${n}.${ext}`;
      n += 1;
    }
    entries[finalName] = await blobToUint8Array(blob);
    onProgress?.({
      current: i + 1,
      total,
      percent: Math.round(((i + 1) / total) * 90),
      phase: "fetch",
    });
  }

  onProgress?.({
    current: total,
    total,
    percent: 95,
    phase: "pack",
  });
  const zipped = zipSync(entries, { level: 0 });
  onProgress?.({
    current: total,
    total,
    percent: 100,
    phase: "save",
  });
  const zipBlob = new Blob([zipped as BlobPart], {
    type: "application/zip",
  });
  triggerAnchorDownload(zipBlob, zipName);
}
