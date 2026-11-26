export type SendStatus = "scheduled" | "paused" | "sending" | "sent" | "partial" | "cancelled" | "review";
export type RecipientStatus = "pending" | "sending" | "sent" | "delivered" | "read" | "failed" | "cancelled" | "skipped";
export type MetaStatus = "draft" | "pending" | "approved" | "rejected" | "needs_review";
export type Category = "marketing" | "utility";

export interface TemplateButton {
  type: "quick_reply" | "url";
  text: string;
  payload?: string;
  link?: string;
}

export interface MessageContent {
  header: string | null;
  body: string;
  footer: string | null;
  buttons: TemplateButton[];
}

export interface MessagingTemplate extends MessageContent {
  id: number | null;
  key: string;
  base_key?: string | null;
  is_system: boolean;
  custom_only: boolean;
  title: string;
  stage: string;
  category: Category;
  meta_status: MetaStatus;
  meta_reason: string | null;
  submitted_at?: string | null;
}

export interface Segment {
  statuses?: number[];
  sides?: string[];
  group_ids?: number[];
  has_table?: boolean;
  guest_ids?: number[];
  exclude_guest_ids?: number[];
}

export interface SendCounts {
  pending: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  skipped: number;
  cancelled: number;
  sms: number;
  total: number;
}

export interface MessagingSend extends MessageContent {
  id: number;
  title: string;
  source: "manual" | "automation";
  automation_id: number | null;
  template_id: number | null;
  template_key: string | null;
  category: Category;
  status: SendStatus;
  scheduled_at: string | null;
  override_quiet: boolean;
  version: number;
  content_version: number;
  audience_mode: "fixed" | "dynamic";
  editable: boolean;
  template_status: MetaStatus | null;
  template_reason: string | null;
  counts: SendCounts;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  segment: Segment;
  rendered?: { header: string; body: string; footer: string };
  cost?: Cost;
  adjusted_from?: string | null;
  pending_updated?: number;
  locked_unchanged?: number;
  changes?: Record<string, unknown>;
}

export interface Cost {
  messages: number;
  usd: number;
  ils: number;
  category?: Category;
}

export interface QuotaSummary {
  package: { id: number; key: string; label: string };
  per_guest: number;
  max_guests: number | null;
  pro_addon: boolean;
  topups: number;
  guests_with_phone: number;
  capacity: number;
  used: number;
  reserved: number;
  remaining: number;
  pricing: {
    checkout_enabled: boolean;
    packages: { id: number; key: string; label: string; per_guest: number; max_guests: number | null }[];
    pro_addon: { key: string; label: string; price: number; per_guest: number };
    topup: { key: string; label: string; price: number; per_guest: number };
    currency: string;
  };
}

export interface RsvpConfig {
  ask_party_size: boolean;
  max_party_size: number;
  ask_meal: boolean;
  meals: string[];
  ask_allergies: boolean;
  ask_shuttle: boolean;
  thank_you_yes: string;
  thank_you_no: string;
  thank_you_maybe: string;
}

export interface MessagingSettings {
  quiet_hours_enabled: boolean;
  shabbat_guard_enabled: boolean;
  sms_fallback_enabled: boolean;
  variables: Record<string, string>;
  rsvp_config: RsvpConfig;
  quiet_hours: { start: string; end: string };
  test_sends_used: number;
  test_sends_limit: number;
}

export interface Funnel {
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  sms: number;
}

export interface Overview {
  enabled: boolean;
  provider: "mock" | "meta";
  sms_provider: string;
  dev_tools: boolean;
  event: { id: number; name: string; starts_at: string | null; vars: Record<string, string> };
  quota: QuotaSummary;
  guests: {
    total: number;
    with_phone: number;
    no_phone: number;
    opted_out: number;
    by_status: Record<string, number>;
    people_by_status: Record<string, number>;
    responded_whatsapp: number;
    responded_web: number;
  };
  queue: { upcoming: number; pending_messages: number; review: number; next: MessagingSend | null };
  inbox: { unread: number; suggestions: number };
  funnel: Funnel;
  settings: MessagingSettings;
}

export interface AudienceGuest {
  id: number;
  full_name: string;
  status: number;
  side: string | null;
  group_id: number | null;
  party_size: number;
  has_phone: boolean;
  opted_out: boolean;
  table_label: string | null;
  used: number;
  pending: number;
  left: number;
  last_status: string | null;
  rsvp_source: string | null;
  answers: { meal?: string | null; allergies?: string | null };
}

export interface AudienceResponse {
  per_guest: number;
  groups: { id: number; name: string; side: string | null }[];
  guests: AudienceGuest[];
}

export interface PreviewResponse {
  audience: { matched: number; eligible: number; no_phone: number; opted_out: number; will_send: number; over_quota: number; guest_cap: number };
  rendered: MessageContent & { sample_guest: { id: number; full_name: string } | null };
  missing_variables: Record<string, string>;
  needs_review: boolean;
  schedule: { at: string; conflicts: string[]; next_allowed: string | null };
  cost: Cost;
}

export interface Automation {
  id: number;
  key: string;
  template_key: string;
  title: string;
  enabled: boolean;
  offset_days: number;
  send_time: string;
  segment: Segment;
  category: Category;
  next_run_at: string | null;
  state: string;
  send_id: number | null;
  send_version: number | null;
}

export interface InboxThread {
  guest_id: number;
  full_name: string;
  guest_status: number | null;
  party_size: number | null;
  unread: number;
  last: { direction: "in" | "out"; body: string; at: string; intent: string | null } | null;
  window_open: boolean;
  bot_step: string | null;
  suggestion: { message_id: number; changes: Record<string, string | number> } | null;
}

export interface ThreadMessage {
  id: number;
  direction: "in" | "out";
  kind: string;
  body: string;
  status: string | null;
  intent: string | null;
  suggestion: Record<string, string | number> | null;
  handled: string | null;
  at: string;
}

export interface ThreadResponse {
  guest: { id: number; full_name: string; status: number; party_size: number; table_label: string | null; answers: Record<string, unknown>; opted_out: boolean };
  window_open: boolean;
  window_closes_at: string | null;
  messages: ThreadMessage[];
}

export interface GuestQueueItem {
  recipient_id: number;
  send_id: number;
  title: string;
  send_status: SendStatus;
  version: number;
  scheduled_at: string | null;
  status: RecipientStatus;
  locked: boolean;
  sent_at: string | null;
}

export interface AnalyticsResponse {
  funnel: Funnel;
  sends: MessagingSend[];
  replies_by_intent: Record<string, number>;
  cost: { usd: number; ils: number };
}

export interface RecipientRow {
  id: number;
  guest_id: number;
  full_name: string;
  guest_status: number | null;
  status: RecipientStatus;
  channel: "whatsapp" | "sms";
  locked: boolean;
  skip_reason: string | null;
  error: string | null;
  sent_at: string | null;
}

export interface AuditRow {
  id: number;
  action: string;
  changes: Record<string, unknown>;
  affected_pending: number;
  locked_unchanged: number;
  created_at: string;
}
