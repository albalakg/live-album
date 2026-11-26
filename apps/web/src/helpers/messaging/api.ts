import axios from "axios";
import {
  AnalyticsResponse,
  AudienceResponse,
  AuditRow,
  Automation,
  GuestQueueItem,
  InboxThread,
  MessageContent,
  MessagingSend,
  MessagingSettings,
  MessagingTemplate,
  Overview,
  PreviewResponse,
  RecipientRow,
  Segment,
  ThreadResponse,
} from "./types";

type Envelope<T> = { data: T };
const unwrap = <T>(res: { data: Envelope<T> }): T => res.data.data;
const base = (eventId: number) => `events/${eventId}/messaging`;

export interface SendDraft extends Partial<MessageContent> {
  template_key?: string | null;
  title?: string;
  category?: string;
  segment?: Segment;
  scheduled_at?: string | null;
  send_now?: boolean;
  override_quiet?: boolean;
}

export interface SendPatch extends Partial<MessageContent> {
  expected_version: number;
  action?: "update" | "pause" | "resume" | "cancel" | "send_now";
  title?: string;
  segment?: Segment;
  scheduled_at?: string;
  override_quiet?: boolean;
  category?: string;
}

export const messagingApi = {
  overview: (id: number) => axios.get(`${base(id)}/overview`).then((r) => unwrap<Overview>(r)),
  audience: (id: number) => axios.get(`${base(id)}/audience`).then((r) => unwrap<AudienceResponse>(r)),
  settings: (id: number) => axios.get(`${base(id)}/settings`).then((r) => unwrap<MessagingSettings>(r)),
  saveSettings: (id: number, payload: Partial<MessagingSettings>) => axios.put(`${base(id)}/settings`, payload).then((r) => unwrap<MessagingSettings>(r)),

  templates: (id: number) => axios.get(`${base(id)}/templates`).then((r) => unwrap<{ templates: MessagingTemplate[] }>(r).templates),
  submitTemplate: (id: number, payload: Partial<MessageContent> & { title: string; category?: string; base_key?: string | null }) =>
    axios.post(`${base(id)}/templates`, payload).then((r) => unwrap<MessagingTemplate>(r)),

  queue: (id: number, filter?: "upcoming" | "history") =>
    axios.get(`${base(id)}/queue`, { params: filter ? { filter } : {} }).then((r) => unwrap<{ sends: MessagingSend[] }>(r).sends),
  preview: (id: number, draft: SendDraft & { send_id?: number }) => axios.post(`${base(id)}/sends/preview`, draft).then((r) => unwrap<PreviewResponse>(r)),
  create: (id: number, draft: SendDraft) => axios.post(`${base(id)}/sends`, draft).then((r) => unwrap<MessagingSend>(r)),
  show: (id: number, sendId: number) => axios.get(`${base(id)}/sends/${sendId}`).then((r) => unwrap<MessagingSend>(r)),
  patch: (id: number, sendId: number, patch: SendPatch) => axios.patch(`${base(id)}/sends/${sendId}`, patch).then((r) => unwrap<MessagingSend>(r)),
  recipients: (id: number, sendId: number, status?: string) =>
    axios.get(`${base(id)}/sends/${sendId}/recipients`, { params: status ? { status } : {} }).then((r) => unwrap<{ recipients: RecipientRow[] }>(r).recipients),
  audit: (id: number, sendId: number) => axios.get(`${base(id)}/sends/${sendId}/audit`).then((r) => unwrap<{ audit: AuditRow[] }>(r).audit),
  guestMessages: (id: number, guestId: number) => axios.get(`${base(id)}/guests/${guestId}/messages`).then((r) => unwrap<{ items: GuestQueueItem[] }>(r).items),
  testSend: (id: number, payload: Partial<MessageContent> & { phone: string; template_key?: string | null }) =>
    axios.post(`${base(id)}/test-send`, payload).then((r) => unwrap<{ ok: boolean; provider: string; used: number }>(r)),

  automations: (id: number) => axios.get(`${base(id)}/automations`).then((r) => unwrap<{ automations: Automation[]; event_date: string | null }>(r)),
  saveAutomation: (id: number, automationId: number, payload: Partial<Automation>) =>
    axios.put(`${base(id)}/automations/${automationId}`, payload).then((r) => unwrap<Automation>(r)),

  analytics: (id: number) => axios.get(`${base(id)}/analytics`).then((r) => unwrap<AnalyticsResponse>(r)),
  inbox: (id: number) => axios.get(`${base(id)}/inbox`).then((r) => unwrap<{ threads: InboxThread[] }>(r).threads),
  thread: (id: number, guestId: number) => axios.get(`${base(id)}/inbox/${guestId}`).then((r) => unwrap<ThreadResponse>(r)),
  reply: (id: number, guestId: number, body: string) => axios.post(`${base(id)}/inbox/${guestId}/reply`, { body }).then((r) => unwrap<{ id: number }>(r)),
  suggestion: (id: number, messageId: number, apply: boolean) =>
    axios.post(`${base(id)}/inbox/messages/${messageId}/suggestion`, { apply }).then((r) => unwrap<{ handled: string }>(r)),

  // mock-driver dev helpers (server returns 404 outside mock/local)
  devInbound: (id: number, payload: { guest_id: number; text?: string; payload?: string }) =>
    axios.post(`${base(id)}/dev/inbound`, payload).then((r) => unwrap<{ matched: boolean; intent?: string }>(r)),
  devTemplate: (id: number, templateId: number, status: "approved" | "rejected") =>
    axios.post(`${base(id)}/dev/templates/${templateId}`, { status }).then((r) => unwrap<MessagingTemplate>(r)),
  devDelivery: (id: number, sendId: number, status: "delivered" | "read") =>
    axios.post(`${base(id)}/dev/sends/${sendId}/delivery`, { status }).then((r) => unwrap<{ updated: number }>(r)),
  devEntitlement: (id: number, payload: { pro_addon?: boolean; topups?: number }) =>
    axios.post(`${base(id)}/dev/entitlement`, payload).then((r) => unwrap<{ pro_addon: boolean; topups: number }>(r)),
};

export const publicRsvpApi = {
  show: (token: string) => axios.get(`public/rsvp/${token}`).then((r) => unwrap<PublicRsvp>(r)),
  submit: (token: string, payload: RsvpAnswers) => axios.post(`public/rsvp/${token}`, payload).then((r) => unwrap<PublicRsvp>(r)),
  hubConfig: (slug: string) => axios.get(`public/hubs/${slug}/rsvp`).then((r) => unwrap<{ config: PublicRsvp["config"] }>(r).config),
  hubSubmit: (slug: string, payload: RsvpAnswers & { full_name: string; phone: string }) =>
    axios.post(`public/hubs/${slug}/rsvp`, payload).then((r) => unwrap<{ ok: boolean }>(r)),
};

export interface RsvpAnswers {
  status: "yes" | "no" | "maybe";
  party_size?: number;
  meal?: string | null;
  allergies?: string | null;
  shuttle?: boolean;
  note?: string | null;
}

export interface PublicRsvp {
  guest: { first_name: string; party_size: number; status: number; answers: { meal?: string; allergies?: string; note?: string } };
  event: { title: string; couple_names: string; date: string; day: string; time: string; venue_name: string; venue_address: string; waze_link: string; hub_link: string };
  config: { ask_party_size: boolean; max_party_size: number; ask_meal: boolean; meals: string[]; ask_allergies: boolean; ask_shuttle: boolean };
}
