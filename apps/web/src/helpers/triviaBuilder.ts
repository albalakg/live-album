/** Local builder form models and payload helpers for trivia MVP. */

import {
  TRIVIA_QUESTION_CAP,
  TriviaQuestionDto,
  defaultConfigForType,
  defaultOptionsForType,
  isClosestType,
  isFreeTextType,
  isMediaType,
  isRateType,
  isTwoCardType,
  isUnscoredType,
  TRIVIA_THEMES,
} from "@/helpers/triviaTypes";

export { TRIVIA_QUESTION_CAP };

export type BuilderTabId = "build" | "theme" | "settings" | "results" | "live";
export type MobilePaneId = "list" | "edit" | "preview";

export interface TriviaBuilderOption {
  key: string;
  id?: number;
  label: string;
  is_correct: boolean;
}

export interface TriviaBuilderQuestion {
  key: string;
  id?: number;
  type: string;
  prompt: string;
  fun_fact: string;
  host_hint: string;
  media_asset_id: number | null;
  media: { id: number; url: string | null; kind?: string } | null;
  config: Record<string, unknown> | null;
  time_limit_seconds: number;
  max_points: number;
  options: TriviaBuilderOption[];
  /** Free-text questions only: answers wait for host approval before the screen. */
  requires_approval?: boolean;
}

export interface TriviaBuilderGame {
  enabled: boolean;
  status: string;
  phase: string;
  current_phase: string;
  title: string;
  theme: string;
  pace: string;
  teams_mode: string;
  team_labels: { a: string; b: string };
  speed_bonus: boolean;
  prize_text: string;
  reveal_seconds: number;
  default_time: number;
  default_points: number;
  current_question_id: number | null;
  starts_at: Date | null;
  results_at: Date | null;
  join_path: string;
  question_cap: number;
}

let keySeed = 0;
export function nextBuilderKey(prefix = "q"): string {
  keySeed += 1;
  return `${prefix}-${keySeed}-${Date.now().toString(36)}`;
}

export function blankBuilderQuestion(
  type = "choice",
  defaults?: { time?: number; points?: number }
): TriviaBuilderQuestion {
  const options = defaultOptionsForType(type).map((o) => ({
    key: nextBuilderKey("o"),
    label: o.label,
    is_correct: o.is_correct,
  }));
  const unscored = isUnscoredType(type);
  return {
    key: nextBuilderKey("q"),
    type,
    prompt: "",
    fun_fact: "",
    host_hint: "",
    media_asset_id: null,
    media: null,
    config: defaultConfigForType(type),
    time_limit_seconds: defaults?.time ?? 20,
    max_points: unscored ? 0 : defaults?.points ?? 1000,
    options,
  };
}

export function questionFromApi(
  raw: any,
  previous?: TriviaBuilderQuestion | null
): TriviaBuilderQuestion {
  const type = raw.type || "choice";
  const config = raw.config
    ? { ...raw.config }
    : defaultConfigForType(type);
  if (config && raw.host_hint == null && (raw.config as any)?.host_hint) {
    // keep
  }
  const hostHint =
    typeof raw.config?.host_hint === "string" ? raw.config.host_hint : "";
  const prev =
    previous && previous.id != null && previous.id === raw.id ? previous : null;
  return {
    // Keep a stable key when the same question is refreshed from the API so
    // inputs are patched in place instead of remounted (avoids blur flicker).
    key: prev?.key || nextBuilderKey("q"),
    id: raw.id,
    type,
    prompt: raw.prompt || "",
    fun_fact: raw.fun_fact || "",
    host_hint: hostHint,
    media_asset_id: raw.media_asset_id ?? null,
    media: raw.media || null,
    config,
    time_limit_seconds: raw.time_limit_seconds ?? 20,
    max_points: raw.max_points ?? (isUnscoredType(type) ? 0 : 1000),
    requires_approval: !!raw.requires_approval,
    options: (raw.options || []).map((o: any, i: number) => {
      const prevOpt = prev?.options?.[i];
      const byId = o.id
        ? prev?.options?.find((p) => p.id === o.id)
        : undefined;
      return {
        key: byId?.key || prevOpt?.key || nextBuilderKey("o"),
        id: o.id,
        label: o.label || "",
        is_correct: !!o.is_correct,
      };
    }),
  };
}

export function gameFromApi(data: any): TriviaBuilderGame {
  return {
    enabled: !!data.enabled,
    status: data.status || "draft",
    phase: data.phase || "photos",
    current_phase: data.current_phase || "lobby",
    title: data.title || "טריוויה",
    theme: TRIVIA_THEMES.some((t) => t.id === data.theme)
      ? String(data.theme)
      : "elegant",
    pace: data.pace || "host",
    teams_mode: ["sides", "tables"].includes(data.teams_mode)
      ? data.teams_mode
      : "none",
    team_labels: {
      a: data.team_labels?.a || "צד עמית",
      b: data.team_labels?.b || "צד גל",
    },
    speed_bonus: data.speed_bonus !== false,
    prize_text: data.prize_text || "",
    reveal_seconds: data.reveal_seconds ?? 6,
    default_time: data.default_time ?? 20,
    default_points: data.default_points ?? 1000,
    current_question_id: data.current_question_id ?? null,
    starts_at: data.starts_at ? new Date(data.starts_at) : null,
    results_at: data.results_at ? new Date(data.results_at) : null,
    join_path: data.join_path || "",
    question_cap: data.question_cap || TRIVIA_QUESTION_CAP,
  };
}

/** Body for PATCH / POST single question. */
export function questionPayload(q: TriviaBuilderQuestion) {
  const config = { ...(q.config || {}) };
  if (q.host_hint.trim()) {
    config.host_hint = q.host_hint.trim();
  } else {
    delete config.host_hint;
  }
  const unscored = isUnscoredType(q.type);
  const payload: Record<string, unknown> = {
    type: q.type,
    prompt: q.prompt.trim(),
    time_limit_seconds: q.time_limit_seconds,
    max_points: unscored ? 0 : q.max_points,
    fun_fact: q.fun_fact.trim() || null,
    media_asset_id: isMediaType(q.type) ? q.media_asset_id : null,
    config: Object.keys(config).length ? config : null,
  };
  if (isClosestType(q.type) || isFreeTextType(q.type) || isRateType(q.type)) {
    payload.options = [];
  } else {
    payload.options = q.options.map((o) => ({
      label: o.label.trim(),
      is_correct: unscored ? false : !!o.is_correct,
    }));
  }
  return payload;
}

const CHOICE_LIKE_TYPES = new Set([
  "choice",
  "multi",
  "poll",
  "buzzer",
  "emoji",
  "photo",
  "blur",
  "spotdiff",
  "video",
  "audio",
]);

export function applyTypeChange(
  q: TriviaBuilderQuestion,
  nextType: string
): TriviaBuilderQuestion {
  const keepPrompt = q.prompt;
  const keepFun = q.fun_fact;
  const keepHint = q.host_hint;
  const keepTime = q.time_limit_seconds;
  const blank = blankBuilderQuestion(nextType, {
    time: keepTime,
    points: q.max_points > 0 ? q.max_points : undefined,
  });
  blank.key = q.key;
  blank.id = q.id;
  blank.prompt = keepPrompt;
  blank.fun_fact = keepFun;
  blank.host_hint = keepHint;
  if (isUnscoredType(nextType)) blank.max_points = 0;
  if (isTwoCardType(nextType) && isTwoCardType(q.type) && q.options.length >= 2) {
    const unscoredNext = isUnscoredType(nextType);
    blank.options = q.options.slice(0, 2).map((o) => ({
      ...o,
      key: o.key || nextBuilderKey("o"),
      is_correct: unscoredNext ? false : o.is_correct,
    }));
    if (q.config?.sides) blank.config = { ...q.config };
  }
  if (
    CHOICE_LIKE_TYPES.has(nextType) &&
    CHOICE_LIKE_TYPES.has(q.type) &&
    q.options.length >= 2
  ) {
    blank.options = q.options.map((o) => ({
      ...o,
      is_correct: nextType === "poll" ? false : o.is_correct,
    }));
  }
  if (isMediaType(nextType) && isMediaType(q.type)) {
    blank.media_asset_id = q.media_asset_id;
    blank.media = q.media;
  }
  return blank;
}
export function toPublicQuestion(q: TriviaBuilderQuestion | null): TriviaQuestionDto | null {
  if (!q) return null;
  return {
    id: q.id,
    type: q.type,
    prompt: q.prompt || "שאלה",
    fun_fact: q.fun_fact || null,
    media_asset_id: q.media_asset_id,
    media: q.media,
    config: q.config,
    time_limit_seconds: q.time_limit_seconds,
    max_points: q.max_points,
    options: q.options.map((o, i) => ({
      id: o.id ?? i + 1,
      label: o.label || `אפשרות ${i + 1}`,
      is_correct: o.is_correct,
      sort_order: i,
    })),
    index: 1,
    total: 1,
    started_at: new Date().toISOString(),
    selection_mode: q.type === "multi" ? "multiple" : "single",
  };
}
