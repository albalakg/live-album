/**
 * Hand-off from smart search to the real screens (composer with a ready audience).
 * Only guest ids are kept, in sessionStorage, for one read; never names or phones.
 */
const KEY = "snapshare.search.handoff";

export function setComposeHandoff(eventId: number, guestIds: number[]): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ eventId, guestIds: guestIds.slice(0, 5000), at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function takeComposeHandoff(eventId: number): number[] | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(KEY);
    const v = JSON.parse(raw) as { eventId: number; guestIds: number[]; at: number };
    if (v.eventId !== eventId || Date.now() - v.at > 10 * 60 * 1000 || !Array.isArray(v.guestIds)) return null;
    return v.guestIds.filter((x) => Number.isInteger(x));
  } catch {
    return null;
  }
}
