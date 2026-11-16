/**
 * Best-effort venue line from event fields or hub hero block data.
 * Never invents a venue — returns "" when unknown.
 */
export function resolveOverviewVenue(opts: {
  event?: Record<string, unknown> | null;
  hubConfig?: Record<string, unknown> | null;
}): string {
  const event = opts.event || null;
  if (event) {
    const direct = [
      event.venue,
      event.location_name,
      event.location,
      event.place,
      event.address,
    ]
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
    const city = typeof event.city === "string" ? event.city.trim() : "";
    if (direct[0]) {
      return city && !direct[0].includes(city) ? `${direct[0]}, ${city}` : direct[0];
    }
    if (city) return city;
  }

  const hub = opts.hubConfig;
  if (!hub || typeof hub !== "object") return "";
  const blocks = Array.isArray(hub.blocks) ? hub.blocks : [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    const type = String(b.type || "");
    if (!/HERO|COUNTDOWN|MAP|NAV/i.test(type)) continue;
    const data = (b.data || {}) as Record<string, unknown>;
    const venue = [data.venue, data.location_name, data.location]
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .find(Boolean);
    const city = typeof data.city === "string" ? data.city.trim() : "";
    if (venue) {
      return city && !venue.includes(city) ? `${venue}, ${city}` : venue;
    }
    if (city) return city;
  }
  return "";
}
