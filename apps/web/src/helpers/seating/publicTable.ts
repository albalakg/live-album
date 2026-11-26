import axios from "axios";

export interface PublicTableMapTable {
  label: string;
  shape: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  mine: boolean;
}

export interface PublicTableMapFixture {
  kind: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
}

export interface PublicTable {
  state: "assigned" | "unassigned" | "declined" | "unavailable";
  guest: { first_name: string; party_size: number };
  event: { title: string; couple_names: string; date: string; day: string; time: string; venue_name: string; waze_link: string; hub_link: string };
  table: { label: string; number: number | null; seats: number; side: string | null } | null;
  map: { tables: PublicTableMapTable[]; fixtures: PublicTableMapFixture[] } | null;
}

export const publicTableApi = {
  show: (token: string) => axios.get(`public/table/${token}`).then((r) => (r.data as { data: PublicTable }).data),
};
