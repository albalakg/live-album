import { StatusEnum } from "@/helpers/enums";

export type OverviewPhase = "setup" | "upcoming" | "live" | "past";

export interface OverviewTimingInput {
  hasName: boolean;
  status: number | null | undefined;
  startsAt?: string | null;
  finishedAt?: string | null;
  nowMs?: number;
}

export interface OverviewTimingResult {
  phase: OverviewPhase;
  /** Short Hebrew line under the date (countdown / חי עכשיו / הסתיים). */
  timingLabel: string;
  /** Accessible longer description. */
  timingDetail: string;
}

function parseEventInstant(raw?: string | null): number | null {
  if (!raw || !String(raw).trim()) return null;
  const trimmed = String(raw).trim();
  // Local formatted YYYY/MM/DD HH:mm:ss
  if (/^\d{4}\/\d{2}\/\d{2}/.test(trimmed)) {
    const normalized = trimmed.replace(/\//g, "-").replace(" ", "T");
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  }
  if (/[Zz]$/.test(trimmed) || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  }
  const isoLike = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const d = new Date(`${isoLike}Z`);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days >= 2) return `עוד ${days} ימים`;
  if (days === 1) return hours > 0 ? `עוד יום ו־${hours} שע׳` : "עוד יום";
  if (hours >= 2) return `עוד ${hours} שעות`;
  if (hours === 1) return minutes > 0 ? `עוד שעה ו־${minutes} דק׳` : "עוד שעה";
  if (minutes >= 2) return `עוד ${minutes} דקות`;
  if (minutes === 1) return "עוד דקה";
  return "מתחיל בקרוב";
}

/**
 * Derive calm phase + Hebrew timing label from event status and dates.
 * Prefers explicit IN_PROGRESS / ACTIVE / INACTIVE; falls back to clock windows.
 */
export function resolveOverviewTiming(
  input: OverviewTimingInput
): OverviewTimingResult {
  const now = input.nowMs ?? Date.now();
  if (!input.hasName) {
    return {
      phase: "setup",
      timingLabel: "בהקמה",
      timingDetail: "האירוע עדיין בהקמה",
    };
  }

  const status = input.status ?? null;
  const startMs = parseEventInstant(input.startsAt);
  const finishMs = parseEventInstant(input.finishedAt);

  if (status === StatusEnum.IN_PROGRESS) {
    return {
      phase: "live",
      timingLabel: "קורה עכשיו",
      timingDetail: "האירוע חי כעת",
    };
  }

  if (status === StatusEnum.INACTIVE) {
    return {
      phase: "past",
      timingLabel: "סגור",
      timingDetail: "האירוע הסתיים",
    };
  }

  if (status === StatusEnum.ACTIVE) {
    // ACTIVE = post-event album window in this product.
    return {
      phase: "past",
      timingLabel: "האלבום זמין",
      timingDetail: "האירוע הסתיים — האלבום עדיין זמין",
    };
  }

  if (
    startMs != null &&
    finishMs != null &&
    now >= startMs &&
    now <= finishMs
  ) {
    return {
      phase: "live",
      timingLabel: "קורה עכשיו",
      timingDetail: "האירוע חי כעת",
    };
  }

  if (finishMs != null && now > finishMs) {
    return {
      phase: "past",
      timingLabel: "האלבום זמין",
      timingDetail: "האירוע הסתיים",
    };
  }

  if (startMs != null && now < startMs) {
    const label = formatCountdown(startMs - now);
    return {
      phase: "upcoming",
      timingLabel: label,
      timingDetail: `האירוע יתחיל בעוד ${label.replace(/^עוד\s+/, "")}`,
    };
  }

  if (status === StatusEnum.PENDING || status === StatusEnum.READY) {
    return {
      phase: "upcoming",
      timingLabel: status === StatusEnum.PENDING ? "ממתין לאישור" : "מוכן",
      timingDetail:
        status === StatusEnum.PENDING
          ? "האירוע ממתין לסימון כמוכן"
          : "האירוע מוכן ומחכה לתאריך",
    };
  }

  return {
    phase: "upcoming",
    timingLabel: "",
    timingDetail: "",
  };
}

export function parseOverviewInstant(raw?: string | null): number | null {
  return parseEventInstant(raw);
}
