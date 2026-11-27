/**
 * Builds the in-memory SearchData for one event from APIs the dashboard already uses
 * (guests / seating state, event assets, messaging queue + audience + inbox). Request-scoped,
 * decrypted by the server for this host only; never stored, cached on disk, or sent anywhere else.
 */
import { guestsApi, seatingApi } from "@/helpers/seating/api";
import { messagingApi } from "@/helpers/messaging/api";
import type { CrmGuest, GuestGroup, SeatingStateResponse } from "@/helpers/seating/types";
import type { AudienceGuest, InboxThread, MessagingSend } from "@/helpers/messaging/types";
import { buildCommands, buildHelp, buildPages } from "./registry";
import {
  emptySearchData,
  SearchData,
  SearchGuest,
  SearchGuestStatus,
  SearchMessage,
  SearchMessageStatus,
  SearchPhoto,
  SearchReply,
  SearchSide,
} from "./types";

const STATUS: Record<number, SearchGuestStatus> = { 0: "invited", 1: "confirmed", 2: "declined", 3: "maybe", 4: "cancelled" };
const DAY_MS = 86400000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function parseDate(s: unknown): Date | null {
  if (!s) return null;
  const str = String(s);
  const d = new Date(/^\d{4}-\d{2}-\d{2} \d/.test(str) ? str.replace(" ", "T") + (/[zZ]|[+-]\d\d:?\d\d$/.test(str) ? "" : "Z") : str);
  return isNaN(d.getTime()) ? null : d;
}

const pad = (n: number) => String(n).padStart(2, "0");
export function shortWhen(d: Date | null): string {
  if (!d) return "";
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function waTags(a: AudienceGuest | undefined): string[] {
  if (!a) return [];
  const tags: string[] = [];
  if (a.opted_out) tags.push("חסום");
  const st = String(a.last_status || "");
  if (!st) tags.push("לא-נשלח");
  else if (st === "failed") tags.push("נכשל");
  else if (["sent", "delivered", "read"].includes(st)) tags.push("נשלח");
  if (st === "read") tags.push("נקרא");
  if (st === "replied") tags.push("נשלח", "נענה");
  if (st !== "replied" && a.rsvp_source && /whatsapp|bot|wa|sms/i.test(a.rsvp_source)) tags.push("נענה");
  return tags;
}

export function mapGuests(guests: CrmGuest[], groups: GuestGroup[], audience: AudienceGuest[] = []): SearchGuest[] {
  const groupName: Record<number, string> = {};
  groups.forEach((g) => (groupName[g.id] = g.name));
  const aud: Record<number, AudienceGuest> = {};
  audience.forEach((a) => (aud[a.id] = a));
  const today = startOfDay(new Date());
  return guests.map((g) => {
    const created = parseDate(g.created_at);
    const a = aud[g.id];
    return {
      id: g.id,
      name: (g.full_name || "").trim() || "אורח/ת",
      side: (g.side as SearchSide) || null,
      group: g.group_id ? groupName[g.group_id] || "" : "",
      groupId: g.group_id,
      status: STATUS[g.status] || "invited",
      party: Number(g.party_size) || 1,
      tableId: g.table_id,
      table: g.table_label,
      phone: g.phone || null,
      email: g.email || null,
      notes: g.notes || "",
      meal: (a && a.answers && a.answers.meal) || null,
      wa: waTags(a),
      addedDays: created ? Math.max(0, Math.round((today - startOfDay(created)) / DAY_MS)) : null,
    };
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapPhotos(assets: any[]): SearchPhoto[] {
  const list = (assets || [])
    .map((a) => ({ a, d: parseDate(a.created_at) }))
    .filter((x) => x.d)
    .sort((x, y) => (x.d as Date).getTime() - (y.d as Date).getTime());
  const deviceN: Record<string, number> = {};
  let next = 1;
  const today = startOfDay(new Date());
  const mapped = list.map(({ a, d }) => {
    const date = d as Date;
    const dev = String(a.device_id || a.created_by_guest || "owner");
    if (!deviceN[dev]) deviceN[dev] = next++;
    const status = Number(a.moderation_status ?? a.status);
    return {
      id: Number(a.id),
      min: date.getHours() * 60 + date.getMinutes(),
      day: Math.round((startOfDay(date) - today) / DAY_MS),
      dateLabel: `${pad(date.getDate())}.${pad(date.getMonth() + 1)}`,
      time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
      status: status === 2 ? "pending" : status === 6 ? "hidden" : "approved",
      fav: Boolean(a.is_favorite),
      kind: a.type === "video" ? "סרטון" : "תמונה",
      uploaderN: deviceN[dev],
      thumb: a.thumbnail_url || a.thumb_url || a.thumbPath || (a.type === "image" ? a.fullPath || null : null),
    } as SearchPhoto;
  });
  // uploader #N follows first-upload order; the list itself is newest first (like the mock / gallery)
  return mapped.reverse();
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function messageStatus(s: string): SearchMessageStatus {
  if (s === "scheduled" || s === "paused" || s === "review") return "scheduled";
  if (s === "sent") return "sent";
  if (s === "partial") return "partial";
  return "other";
}

export function mapMessages(sends: MessagingSend[]): SearchMessage[] {
  return sends.map((s) => ({
    id: s.id,
    title: s.title || "הודעה",
    status: messageStatus(s.status),
    rawStatus: s.status,
    kind: s.source === "automation" ? "אוטומציה" : "ידנית",
    when: shortWhen(parseDate(s.scheduled_at || s.completed_at || s.created_at)),
    audience: (s.counts && s.counts.total) || 0,
    version: s.version,
    editable: Boolean(s.editable),
  }));
}

export function mapReplies(threads: InboxThread[]): SearchReply[] {
  return threads
    .filter((t) => t.last && t.last.direction === "in" && t.last.body)
    .map((t) => ({ guestId: t.guest_id, who: t.full_name, text: (t.last as { body: string }).body, when: shortWhen(parseDate((t.last as { at: string }).at)) }));
}

export interface LoadOptions {
  eventId: number;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  assets: any[];
  nav: { text: string; path: string }[];
  seating: boolean;
  messaging: boolean;
}

export interface LoadedSearchData {
  data: SearchData;
  seatingState: SeatingStateResponse | null;
  seatingWritable: boolean;
}

export async function loadSearchData(opts: LoadOptions): Promise<LoadedSearchData> {
  const data = emptySearchData();
  let seatingState: SeatingStateResponse | null = null;
  let guests: CrmGuest[] = [];
  let groups: GuestGroup[] = [];
  if (opts.seating) {
    try {
      seatingState = await seatingApi.state(opts.eventId);
      guests = seatingState.guests;
      groups = seatingState.groups;
    } catch {
      seatingState = null;
    }
  }
  const [list, audience, queue, inbox] = await Promise.all([
    seatingState ? Promise.resolve(null) : guestsApi.list(opts.eventId).catch(() => null),
    opts.messaging ? messagingApi.audience(opts.eventId).catch(() => null) : Promise.resolve(null),
    opts.messaging ? messagingApi.queue(opts.eventId).catch(() => null) : Promise.resolve(null),
    opts.messaging ? messagingApi.inbox(opts.eventId).catch(() => null) : Promise.resolve(null),
  ]);
  if (list) {
    guests = list.guests;
    groups = list.groups;
  }
  data.guests = mapGuests(guests, groups, audience ? audience.guests : []);
  data.groups = groups.map((g) => g.name);
  data.meals = Array.from(new Set(data.guests.map((g) => g.meal).filter((m): m is string => !!m)));
  if (seatingState) {
    data.tables = seatingState.tables.map((t) => ({ id: t.id, key: t.key, label: t.label, seats: t.seats, note: "", x: t.x, y: t.y, w: t.w, h: t.h, shape: t.shape }));
    data.fixtures = (seatingState.fixtures || []).map((f) => ({ kind: f.kind, label: f.label, x: f.x, y: f.y, w: f.w, h: f.h }));
  }
  data.photos = mapPhotos(opts.assets);
  data.messages = queue ? mapMessages(queue) : [];
  data.replies = inbox ? mapReplies(inbox) : [];
  data.commands = buildCommands({ seating: !!seatingState, messaging: opts.messaging });
  data.pages = buildPages(opts.nav);
  data.help = buildHelp({ messaging: opts.messaging });
  const writable = !!seatingState && !!seatingState.entitlement && seatingState.entitlement.enabled !== false;
  return { data, seatingState, seatingWritable: writable };
}
