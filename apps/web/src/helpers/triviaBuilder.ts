/** Local builder form models and payload helpers for trivia MVP. */

import {
  TRIVIA_QUESTION_CAP,
  TriviaQuestionDto,
  defaultConfigForType,
  defaultOptionsForType,
  isTwoCardType,
  isUnscoredType,
} from "@/helpers/triviaTypes";

export { TRIVIA_QUESTION_CAP };

export type BuilderTabId = "build" | "theme" | "settings" | "results";
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
  media: { id: number; url: string } | null;
  config: Record<string, unknown> | null;
  time_limit_seconds: number;
  max_points: number;
  options: TriviaBuilderOption[];
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

export function questionFromApi(raw: any): TriviaBuilderQuestion {
  const type = raw.type || "choice";
  const config = raw.config
    ? { ...raw.config }
    : defaultConfigForType(type);
  if (config && raw.host_hint == null && (raw.config as any)?.host_hint) {
    // keep
  }
  const hostHint =
    typeof raw.config?.host_hint === "string" ? raw.config.host_hint : "";
  return {
    key: nextBuilderKey("q"),
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
    options: (raw.options || []).map((o: any) => ({
      key: nextBuilderKey("o"),
      id: o.id,
      label: o.label || "",
      is_correct: !!o.is_correct,
    })),
  };
}

export function gameFromApi(data: any): TriviaBuilderGame {
  return {
    enabled: !!data.enabled,
    status: data.status || "draft",
    phase: data.phase || "photos",
    current_phase: data.current_phase || "lobby",
    title: data.title || "טריוויה",
    theme: data.theme === "neon" ? "neon" : "elegant",
    pace: data.pace || "host",
    teams_mode: data.teams_mode || "none",
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
    media_asset_id: q.type === "photo" ? q.media_asset_id : null,
    config: Object.keys(config).length ? config : null,
  };
  if (q.type === "number") {
    payload.options = [];
  } else {
    payload.options = q.options.map((o) => ({
      label: o.label.trim(),
      is_correct: unscored ? false : !!o.is_correct,
    }));
  }
  return payload;
}

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
    points: q.max_points,
  });
  blank.key = q.key;
  blank.id = q.id;
  blank.prompt = keepPrompt;
  blank.fun_fact = keepFun;
  blank.host_hint = keepHint;
  if (isTwoCardType(nextType) && isTwoCardType(q.type) && q.options.length >= 2) {
    blank.options = q.options.slice(0, 2).map((o, i) => ({
      ...o,
      key: o.key || nextBuilderKey("o"),
      is_correct: nextType === "thisorthat" ? false : i === 0 ? o.is_correct : o.is_correct,
    }));
    if (q.config?.sides) blank.config = { ...q.config };
  }
  if (
    (nextType === "choice" ||
      nextType === "multi" ||
      nextType === "poll" ||
      nextType === "photo") &&
    (q.type === "choice" ||
      q.type === "multi" ||
      q.type === "poll" ||
      q.type === "photo") &&
    q.options.length >= 2
  ) {
    blank.options = q.options.map((o) => ({
      ...o,
      is_correct: nextType === "poll" ? false : o.is_correct,
    }));
    if (nextType === "photo") {
      blank.media_asset_id = q.media_asset_id;
      blank.media = q.media;
    }
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
