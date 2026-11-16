export type SaveStatus = "saved" | "saving" | "error";
export type PreviewDevice = "phone" | "desktop";

export type SlugUiStatus =
  | "idle"
  | "checking"
  | "free"
  | "taken"
  | "reserved"
  | "empty"
  | "short"
  | "long"
  | "invalid"
  | "error";

/** Preview scroll target: block id + a counter so the same id can be scrolled to twice. */
export interface ScrollTarget {
  id: string;
  tick: number;
}
