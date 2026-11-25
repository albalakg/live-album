import axios from "axios";
import {
  AiQuota,
  AiRun,
  AiRunOptions,
  CrmGuest,
  Fixture,
  GuestGroup,
  GuestListResponse,
  ImportCommitResponse,
  ImportPreviewResponse,
  ImportRow,
  PlanState,
  SaveResponse,
  SeatTable,
  SeatingConstraint,
  SeatingStateResponse,
  Side,
} from "./types";

type Envelope<T> = { data: T };
const unwrap = <T>(res: { data: Envelope<T> }): T => res.data.data;
const base = (eventId: number) => `events/${eventId}`;

export interface GuestPayload {
  full_name?: string;
  phone?: string | null;
  email?: string | null;
  status?: number;
  party_size?: number;
  side?: Side | null;
  group_id?: number | null;
  group_name?: string | null;
  notes?: string | null;
}

export const guestsApi = {
  list: (eventId: number) => axios.get(`${base(eventId)}/guests`).then((r) => unwrap<GuestListResponse>(r)),
  create: (eventId: number, payload: GuestPayload) =>
    axios.post(`${base(eventId)}/guests`, payload).then((r) => unwrap<CrmGuest>(r)),
  update: (eventId: number, id: number, payload: GuestPayload) =>
    axios.put(`${base(eventId)}/guests/${id}`, payload).then((r) => unwrap<CrmGuest>(r)),
  remove: (eventId: number, ids: number[]) =>
    axios.delete(`${base(eventId)}/guests`, { data: { guest_ids: ids } }).then((r) => unwrap<{ deleted: number }>(r)),
  bulkUpdate: (eventId: number, ids: number[], changes: { status?: number; side?: Side | null; group_id?: number | null }) =>
    axios.post(`${base(eventId)}/guests/bulk-update`, { guest_ids: ids, changes }).then((r) => unwrap<{ updated: number }>(r)),
  importPreview: (eventId: number, rows: ImportRow[], onDuplicate: "skip" | "update") =>
    axios
      .post(`${base(eventId)}/guests/import/preview`, { rows, on_duplicate: onDuplicate })
      .then((r) => unwrap<ImportPreviewResponse>(r)),
  importCommit: (eventId: number, rows: ImportRow[], onDuplicate: "skip" | "update") =>
    axios
      .post(`${base(eventId)}/guests/import/commit`, { rows, on_duplicate: onDuplicate })
      .then((r) => unwrap<ImportCommitResponse>(r)),
  exportCsv: (eventId: number) =>
    axios.get(`${base(eventId)}/guests/export`, { responseType: "blob" }).then((r) => r.data as Blob),

  createGroup: (eventId: number, payload: { name: string; side?: Side | null; color?: string | null }) =>
    axios.post(`${base(eventId)}/guest-groups`, payload).then((r) => unwrap<GuestGroup>(r)),
  updateGroup: (eventId: number, id: number, payload: { name?: string; side?: Side | null; color?: string | null }) =>
    axios.put(`${base(eventId)}/guest-groups/${id}`, payload).then((r) => unwrap<GuestGroup>(r)),
  removeGroup: (eventId: number, id: number) => axios.delete(`${base(eventId)}/guest-groups/${id}`),
};

export interface SavePayload {
  revision: number;
  tables: SeatTable[];
  fixtures: Fixture[];
  assignments: { guest_id: number; table_key: string; seat: number | null }[];
}

export const seatingApi = {
  state: (eventId: number) => axios.get(`${base(eventId)}/seating`).then((r) => unwrap<SeatingStateResponse>(r)),
  save: (eventId: number, payload: SavePayload) =>
    axios.put(`${base(eventId)}/seating`, payload).then((r) => unwrap<SaveResponse>(r)),

  createConstraint: (eventId: number, payload: { type: "together" | "apart"; guest_ids: number[]; note?: string | null }) =>
    axios.post(`${base(eventId)}/seating/constraints`, payload).then((r) => unwrap<SeatingConstraint>(r)),
  removeConstraint: (eventId: number, id: number) => axios.delete(`${base(eventId)}/seating/constraints/${id}`),

  quota: (eventId: number) => axios.get(`${base(eventId)}/seating/ai/quota`).then((r) => unwrap<AiQuota>(r)),
  run: (eventId: number, options: AiRunOptions) =>
    axios.post(`${base(eventId)}/seating/ai/runs`, options).then((r) => unwrap<{ run: AiRun; quota: AiQuota }>(r)),
  apply: (eventId: number, runId: number, force = false) =>
    axios
      .post(`${base(eventId)}/seating/ai/runs/${runId}/apply`, { force })
      .then((r) => unwrap<PlanState & { run: AiRun; quota: AiQuota; dropped: number[] }>(r)),
  discard: (eventId: number, runId: number) =>
    axios.post(`${base(eventId)}/seating/ai/runs/${runId}/discard`).then((r) => unwrap<{ run: AiRun; quota: AiQuota }>(r)),
};
