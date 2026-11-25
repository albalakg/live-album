/** Guest CRM + seating planner types (mirror the Laravel API). */

export type GuestStatus = 0 | 1 | 2 | 3 | 4;
export type Side = "bride" | "groom" | "shared";

export interface CrmGuest {
  id: number;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: GuestStatus;
  party_size: number;
  side: Side | null;
  group_id: number | null;
  notes: string | null;
  table_id: number | null;
  table_label: string | null;
  seat: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GuestGroup {
  id: number;
  name: string;
  side: Side | null;
  color: string | null;
  sort_order: number;
  guests: number;
  people: number;
}

export interface GuestStats {
  invitations: number;
  people_invited: number;
  confirmed: number;
  declined: number;
  maybe: number;
  pending: number;
  cancelled: number;
  seated: number;
  unseated: number;
  without_phone: number;
}

export interface GuestListResponse {
  guests: CrmGuest[];
  groups: GuestGroup[];
  stats: GuestStats;
}

export type ImportField =
  | "full_name"
  | "first_name"
  | "last_name"
  | "phone"
  | "email"
  | "party_size"
  | "group"
  | "side"
  | "status"
  | "notes";

export type ImportRow = Partial<Record<ImportField, string>> & { _line: number };

export type ImportAction = "new" | "update" | "skip" | "duplicate_in_file" | "error";

export interface ImportPreviewRow {
  line: number;
  action: ImportAction;
  match_id: number | null;
  values: {
    full_name: string;
    phone: string | null;
    email: string | null;
    party_size: number;
    side: Side | null;
    status: GuestStatus;
    status_given: boolean;
    group: string | null;
    notes: string | null;
  };
  errors: { field: string; message: string }[];
  warnings: { code: string; message: string }[];
}

export interface ImportSummary {
  new: number;
  update: number;
  skip: number;
  duplicate_in_file: number;
  error: number;
  warnings: number;
  people: number;
}

export interface ImportPreviewResponse {
  rows: ImportPreviewRow[];
  summary: ImportSummary;
  on_duplicate: "skip" | "update";
}

export interface ImportCommitResponse {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  groups_created: number;
  summary: ImportSummary;
}

/* ───────── seating ───────── */

export type TableShape = "round" | "rect";

export interface SeatTable {
  id: number | null;
  key: string;
  label: string;
  shape: TableShape;
  seats: number;
  side: Side | null;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
}

export type FixtureKind = "dance" | "stage" | "bar" | "dj" | "door" | "buffet" | "chuppah" | "label";

export interface Fixture {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
}

export interface ServerAssignment {
  guest_id: number;
  table_id: number;
  seat: number | null;
}

/** Client-side seat: guest → table key + first seat of their block. */
export interface Seat {
  table: string;
  seat: number | null;
}

export interface SeatingConstraint {
  id: number;
  type: "together" | "apart";
  guest_ids: number[];
  note: string | null;
}

export interface SeatingWarning {
  type: "over_capacity" | "together" | "apart";
  table_id?: number;
  constraint_id?: number;
  guest_ids: number[];
  message: string;
}

export interface AiQuota {
  included: number;
  used: number;
  remaining: number;
  provider: string;
  model: string;
  is_mock: boolean;
  estimate: { tokens_in: number; tokens_out: number; cost_usd: number; cost_ils: number };
}

export interface Entitlement {
  enabled: boolean;
  source: string;
  addon: string;
  pending_pricing: boolean;
}

export interface PlanState {
  revision: number;
  tables: (SeatTable & { id: number })[];
  fixtures: Fixture[];
  assignments: ServerAssignment[];
  constraints: SeatingConstraint[];
  warnings: SeatingWarning[];
  updated_at: string | null;
}

export interface SeatingStateResponse extends PlanState {
  guests: CrmGuest[];
  groups: GuestGroup[];
  stats: GuestStats;
  entitlement: Entitlement;
  ai: AiQuota;
}

export interface SaveResponse extends PlanState {
  key_map: Record<string, number>;
  dropped: number[];
}

export interface ProposalAssignment {
  guest_id: number;
  table_id: number;
  seat: number | null;
  reason: string | null;
  source: "kept" | "ai" | "packer" | "repaired";
}

export interface AiRun {
  id: number;
  engine: "ai" | "packer";
  provider: string;
  model: string | null;
  status: "pending" | "succeeded" | "failed" | "applied" | "discarded";
  counted: boolean;
  base_revision: number;
  options: Record<string, unknown> | null;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  summary: {
    assignments: number;
    unplaced: number;
    tables_used: number;
    new: number | null;
    moved: number | null;
    repaired: number | null;
    people: number | null;
  } | null;
  proposal?: ProposalAssignment[];
  unplaced?: { guest_id: number; reason: string }[];
  warnings?: SeatingWarning[];
  created_at: string | null;
}

export interface AiRunOptions {
  engine: "ai" | "packer";
  mode: "fill" | "reshuffle";
  include_pending: boolean;
  include_maybe: boolean;
  instructions: string;
}
