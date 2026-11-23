<template>
  <div class="tsfx" dir="rtl" aria-live="off">
    <!-- floating guest reactions -->
    <div class="tsfx-float" aria-hidden="true">
      <span
        v-for="r in floating"
        :key="r.uid"
        class="tsfx-bubble"
        :class="{ chip: r.chip }"
        :style="{
          insetInlineStart: `${r.x}%`,
          animationDuration: `${r.dur}ms`,
          '--drift': `${r.drift}px`,
          '--scale': r.scale,
        }"
      >
        <template v-if="r.chip">{{ r.emoji }} {{ r.label }}</template>
        <template v-else>{{ r.emoji }}</template>
      </span>
    </div>

    <!-- autoplay blocked: one tap enables sound -->
    <button
      v-if="showUnlock"
      type="button"
      class="tsfx-unlock"
      data-testid="trivia-sound-unlock"
      @click="unlock"
    >
      <span class="tsfx-unlock-ico" aria-hidden="true">🔊</span>
      <b>הפעל סאונד</b>
      <small>הדפדפן חוסם צלילים עד לחיצה אחת על המסך</small>
    </button>

    <p v-else-if="djPlaying" class="tsfx-dj" data-testid="trivia-dj-badge">
      <span aria-hidden="true">🎧</span> ה-DJ מנגן · צלילי המשחק כבויים
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { TriviaSoundEngine } from "@/helpers/triviaSound";
import {
  DEFAULT_TRIVIA_FX,
  TriviaFxSettings,
  reactionByKind,
} from "@/helpers/triviaModeration";

interface FloatingReaction {
  uid: number;
  emoji: string;
  label: string;
  chip: boolean;
  x: number;
  dur: number;
  drift: number;
  scale: number;
}

/** Max reactions floating at once; extra ones are dropped (the screen stays readable). */
const MAX_ON_SCREEN = 18;
/** Spread a polled batch over roughly one poll interval. */
const BATCH_SPREAD_MS = 1800;
/** Countdown ticks start this many seconds before the end. */
const TICK_FROM_SECONDS = 10;
const URGENT_FROM_SECONDS = 5;

let uidSeed = 0;

export default defineComponent({
  name: "TriviaScreenFx",

  props: {
    screen: {
      type: Object as PropType<Record<string, any> | null>,
      default: null,
    },
  },

  data() {
    return {
      engine: null as TriviaSoundEngine | null,
      blocked: true,
      floating: [] as FloatingReaction[],
      lastReactionId: 0,
      timers: [] as ReturnType<typeof setTimeout>[],
      clockTimer: null as ReturnType<typeof setInterval> | null,
      lastTickSecond: -1,
      serverSkew: 0,
      lastPhaseKey: "",
    };
  },

  computed: {
    fx(): TriviaFxSettings {
      return { ...DEFAULT_TRIVIA_FX, ...(this.screen?.fx || {}) };
    },
    phase(): string {
      if (!this.screen) return "photos";
      if (this.screen.phase === "results") return "podium";
      if (this.screen.phase !== "live") return "photos";
      return this.screen.current_phase || "lobby";
    },
    soundOn(): boolean {
      return this.fx.sound_enabled && this.phase !== "photos";
    },
    djPlaying(): boolean {
      return !this.fx.sound_enabled && this.phase !== "photos";
    },
    showUnlock(): boolean {
      return this.soundOn && this.blocked && !!this.engine?.supported;
    },
    phaseKey(): string {
      return `${this.phase}:${this.screen?.question?.id || ""}`;
    },
  },

  watch: {
    "fx.sound_enabled"(on: boolean) {
      this.engine?.setEnabled(on);
      this.syncLobby();
    },
    "fx.sound_volume"(volume: number) {
      this.engine?.setVolume(volume);
    },
    "fx.reactions_enabled"(on: boolean) {
      if (!on) this.clearReactions();
    },
    phaseKey() {
      this.onPhaseChange();
    },
    screen: {
      deep: false,
      handler(screen: Record<string, any> | null) {
        if (screen?.server_now) {
          this.serverSkew = Date.now() - new Date(screen.server_now).getTime();
        }
        this.ingestReactions(screen?.reactions?.items || []);
      },
    },
  },

  mounted() {
    const engine = new TriviaSoundEngine();
    this.engine = engine;
    engine.ensure();
    engine.setVolume(this.fx.sound_volume);
    engine.setEnabled(this.fx.sound_enabled);
    this.refreshBlocked();
    // Some browsers allow audio right away (site engagement); try quietly.
    engine.unlock().then(() => this.refreshBlocked());
    window.addEventListener("pointerdown", this.onAnyGesture, { passive: true });
    window.addEventListener("keydown", this.onAnyGesture);
    this.lastPhaseKey = "";
    this.onPhaseChange();
  },

  beforeUnmount() {
    window.removeEventListener("pointerdown", this.onAnyGesture);
    window.removeEventListener("keydown", this.onAnyGesture);
    this.stopClock();
    this.timers.forEach((t) => clearTimeout(t));
    this.engine?.dispose();
    this.engine = null;
  },

  methods: {
    refreshBlocked() {
      this.blocked = !this.engine || this.engine.blocked;
    },

    async unlock() {
      if (!this.engine) return;
      await this.engine.unlock();
      this.refreshBlocked();
      this.syncLobby();
    },

    onAnyGesture() {
      if (this.engine && this.engine.blocked) this.unlock();
    },

    syncLobby() {
      const engine = this.engine;
      if (!engine) return;
      const want = this.soundOn && !this.blocked && this.phase === "lobby";
      if (want && !engine.lobbyPlaying) engine.startLobby();
      if (!want && engine.lobbyPlaying) engine.stopLobby();
    },

    onPhaseChange() {
      const key = this.phaseKey;
      const first = this.lastPhaseKey === "";
      const prevPhase = this.lastPhaseKey.split(":")[0];
      this.lastPhaseKey = key;
      this.syncLobby();
      this.stopClock();
      if (this.phase === "question") this.startClock();
      // Don't fire a sting just because the screen was (re)opened mid-game.
      if (first || prevPhase === this.phase) return;
      if (this.phase === "reveal") this.engine?.play("reveal");
      if (this.phase === "podium") this.engine?.play("fanfare");
    },

    startClock() {
      this.lastTickSecond = -1;
      const tick = () => {
        const q = this.screen?.question;
        if (!q?.started_at || this.phase !== "question") return;
        const limit = (q.time_limit_seconds || 20) * 1000;
        const elapsed = Date.now() - this.serverSkew - new Date(q.started_at).getTime();
        const remaining = Math.max(0, limit - elapsed);
        const second = Math.ceil(remaining / 1000);
        if (second !== this.lastTickSecond && second > 0 && second <= TICK_FROM_SECONDS) {
          this.lastTickSecond = second;
          this.engine?.play(second <= URGENT_FROM_SECONDS ? "tickUrgent" : "tick");
        }
        if (remaining <= 0) this.stopClock();
      };
      tick();
      this.clockTimer = setInterval(tick, 100);
    },

    stopClock() {
      if (this.clockTimer) clearInterval(this.clockTimer);
      this.clockTimer = null;
    },

    ingestReactions(items: { id: number; kind: string }[]) {
      if (!this.fx.reactions_enabled || !items.length) return;
      const fresh = items.filter((item) => item.id > this.lastReactionId);
      if (!fresh.length) return;
      this.lastReactionId = Math.max(...fresh.map((item) => item.id));
      const gap = BATCH_SPREAD_MS / fresh.length;
      fresh.forEach((item, index) => {
        const timer = setTimeout(() => this.spawn(item.kind), Math.round(index * gap));
        this.timers.push(timer);
      });
    },

    spawn(kind: string) {
      const meta = reactionByKind(kind);
      if (!meta || this.floating.length >= MAX_ON_SCREEN) return;
      const uid = ++uidSeed;
      const dur = 3200 + Math.round(Math.random() * 1400);
      this.floating.push({
        uid,
        emoji: meta.emoji,
        label: meta.label,
        chip: !!meta.chip,
        x: 6 + Math.random() * 84,
        dur,
        drift: Math.round((Math.random() - 0.5) * 120),
        scale: meta.chip ? 1 : 0.85 + Math.random() * 0.5,
      });
      const timer = setTimeout(() => {
        this.floating = this.floating.filter((r) => r.uid !== uid);
      }, dur + 100);
      this.timers.push(timer);
    },

    clearReactions() {
      this.floating = [];
    },
  },
});
</script>

<style scoped>
.tsfx {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
  overflow: hidden;
  font-family: "Heebo", "Segoe UI", Tahoma, sans-serif;
}
.tsfx-float {
  position: absolute;
  inset: 0;
}
.tsfx-bubble {
  position: absolute;
  bottom: -80px;
  font-size: clamp(36px, 4.2vw, 64px);
  line-height: 1;
  transform: translate3d(0, 0, 0) scale(var(--scale, 1));
  animation-name: tsfx-rise;
  animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
  animation-fill-mode: forwards;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35));
  will-change: transform, opacity;
}
.tsfx-bubble.chip {
  font-size: clamp(20px, 1.9vw, 30px);
  font-weight: 800;
  padding: 0.45em 0.9em;
  border-radius: 999px;
  background: linear-gradient(135deg, #f6d48b, #dc5b66);
  color: #fff;
  white-space: nowrap;
  box-shadow: 0 10px 26px rgba(220, 91, 102, 0.45);
}
@keyframes tsfx-rise {
  0% {
    transform: translate3d(0, 0, 0) scale(calc(var(--scale, 1) * 0.6));
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translate3d(calc(var(--drift) * 0.2), -10vh, 0) scale(var(--scale, 1));
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--drift), -88vh, 0) scale(calc(var(--scale, 1) * 1.08));
    opacity: 0;
  }
}
.tsfx-unlock {
  pointer-events: auto;
  position: absolute;
  left: 50%;
  bottom: 8%;
  transform: translateX(-50%);
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 18px 34px;
  border: 0;
  border-radius: 22px;
  background: rgba(14, 12, 10, 0.86);
  color: #fff;
  font: inherit;
  cursor: pointer;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(201, 163, 106, 0.6);
  animation: tsfx-pulse 1.8s ease-in-out infinite;
}
.tsfx-unlock b {
  font-size: 28px;
  font-weight: 900;
}
.tsfx-unlock small {
  font-size: 15px;
  opacity: 0.75;
}
.tsfx-unlock-ico {
  font-size: 34px;
}
@keyframes tsfx-pulse {
  0%,
  100% {
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(201, 163, 106, 0.6);
  }
  50% {
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45), 0 0 0 8px rgba(201, 163, 106, 0.25);
  }
}
.tsfx-dj {
  position: absolute;
  inset-inline-end: 18px;
  bottom: 16px;
  margin: 0;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(14, 12, 10, 0.7);
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  font-weight: 600;
}
@media (prefers-reduced-motion: reduce) {
  .tsfx-bubble {
    animation-timing-function: linear;
  }
  .tsfx-unlock {
    animation: none;
  }
}
</style>
