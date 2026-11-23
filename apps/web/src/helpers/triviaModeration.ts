import axios from "axios";

/** Guest reactions (server kinds → what the phone and the screen show). */
export interface TriviaReactionKind {
  kind: "heart" | "party" | "laugh" | "clap" | "mazel";
  emoji: string;
  label: string;
  chip?: boolean;
}

export const TRIVIA_REACTIONS: TriviaReactionKind[] = [
  { kind: "heart", emoji: "❤️", label: "לב" },
  { kind: "party", emoji: "🎉", label: "חגיגה" },
  { kind: "laugh", emoji: "😂", label: "צחוק" },
  { kind: "clap", emoji: "👏", label: "מחיאות כפיים" },
  { kind: "mazel", emoji: "🥂", label: "מזל טוב", chip: true },
];

export function reactionByKind(kind: string): TriviaReactionKind | undefined {
  return TRIVIA_REACTIONS.find((r) => r.kind === kind);
}

/** Live-screen sound + reactions settings (screen payload `fx`). */
export interface TriviaFxSettings {
  sound_enabled: boolean;
  sound_volume: number;
  reactions_enabled: boolean;
}

export const DEFAULT_TRIVIA_FX: TriviaFxSettings = {
  sound_enabled: true,
  sound_volume: 70,
  reactions_enabled: true,
};

/**
 * Machine-readable reason on guest-facing trivia errors
 * ("removed", "rejoin_blocked", "nickname_blocked", "reactions_off", "rate_limited").
 */
export function triviaErrorReason(error: unknown): string | null {
  const reason = (error as any)?.response?.data?.data?.reason;
  return typeof reason === "string" ? reason : null;
}

/**
 * Debounced client-side hint: asks the server filter whether a nickname or
 * free-text answer would be blocked / hidden. The server stays the source of truth.
 */
export class TriviaTextHint {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private seq = 0;

  constructor(
    private eventPath: () => string,
    private onResult: (flagged: boolean) => void,
    private delayMs = 450
  ) {}

  check(text: string): void {
    if (this.timer) clearTimeout(this.timer);
    const value = (text || "").trim();
    if (value.length < 2) {
      this.onResult(false);
      return;
    }
    const seq = ++this.seq;
    this.timer = setTimeout(async () => {
      try {
        const res = await axios.post(`events/${this.eventPath()}/trivia/text-check`, {
          text: value.slice(0, 200),
        });
        if (seq === this.seq) this.onResult(!!res.data?.data?.flagged);
      } catch {
        if (seq === this.seq) this.onResult(false);
      }
    }, this.delayMs);
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.seq++;
  }
}
