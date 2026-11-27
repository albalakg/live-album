/**
 * Device-only storage for smart search: recents and pins (per event, localStorage) and an anonymous
 * no-result counter (a number per day, never the query text). Nothing here is sent to the server.
 */
export interface SearchPin {
  name: string;
  q: string;
}

const KEY = "snapshare.search";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota */
  }
}

export function loadRecents(eventId: number): string[] {
  const v = read<string[]>(`${KEY}.recents.${eventId}`, []);
  return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 8) : [];
}

export function saveRecents(eventId: number, list: string[]): void {
  write(`${KEY}.recents.${eventId}`, list.slice(0, 8));
}

export function addRecent(eventId: number, list: string[], q: string): string[] {
  const t = q.trim();
  if (!t) return list;
  const next = [t].concat(list.filter((x) => x !== t)).slice(0, 8);
  saveRecents(eventId, next);
  return next;
}

export function defaultPins(opts: { seating: boolean }): SearchPin[] {
  const pins: SearchPin[] = [{ name: "לא ענו מצד הכלה", q: "סטטוס:לא-ענה צד:כלה" }];
  if (opts.seating) pins.push({ name: "ללא שולחן", q: "שולחן:ללא -סטטוס:סירב,ביטל" });
  pins.push({ name: "תמונות ממתינות", q: "תמונה:ממתינה" });
  return pins;
}

export function loadPins(eventId: number, fallback: SearchPin[]): SearchPin[] {
  const v = read<SearchPin[] | null>(`${KEY}.pins.${eventId}`, null);
  if (!Array.isArray(v)) return fallback;
  return v.filter((p) => p && typeof p.q === "string" && typeof p.name === "string").slice(0, 9);
}

export function savePins(eventId: number, pins: SearchPin[]): void {
  write(`${KEY}.pins.${eventId}`, pins.slice(0, 9));
}

/** Anonymous: increments today's counter only (no text, no event id). */
export function countNoResult(): void {
  const day = new Date().toISOString().slice(0, 10);
  const all = read<Record<string, number>>(`${KEY}.noresult`, {});
  all[day] = (all[day] || 0) + 1;
  const keys = Object.keys(all).sort().slice(-30);
  const trimmed: Record<string, number> = {};
  keys.forEach((k) => (trimmed[k] = all[k]));
  write(`${KEY}.noresult`, trimmed);
}
