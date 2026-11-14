<template>
  <div class="trivia-stage-host" ref="host" dir="rtl">
    <div class="stage-scale" ref="scale">
      <section
        class="stage"
        ref="stage"
        :data-theme="theme"
        :data-phase="phase"
        :data-type="questionType"
      >
        <div class="stage-bg"></div>
        <div class="stage-fx" aria-hidden="true"></div>
        <div class="stage-ui">
          <header class="stage-top">
            <div class="stage-brand">
              <span class="logo-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8" />
                  <circle cx="12" cy="12" r="2.6" fill="#DC5B66" />
                  <path
                    d="M16.8 7.2l1.4-1.4"
                    stroke="#C9A36A"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              SnapShare
            </div>
            <div class="stage-event">{{ eventLabel }}</div>
            <div class="stage-progress">{{ progressLabel }}</div>
            <span v-if="phase !== 'podium'" class="live-dot"><i></i> LIVE</span>
            <div
              v-if="phase === 'question'"
              class="timer-ring"
              :aria-label="`${secondsLeft} שניות`"
            >
              <svg viewBox="0 0 108 108">
                <circle class="track" cx="54" cy="54" r="46"></circle>
                <circle
                  class="val"
                  cx="54"
                  cy="54"
                  r="46"
                  :stroke-dasharray="timerCircumference"
                  :stroke-dashoffset="timerDashOffset"
                ></circle>
              </svg>
              <strong>{{ secondsLeft }}</strong>
            </div>
          </header>

          <!-- Lobby -->
          <div v-if="phase === 'lobby'" class="lobby stage-mid">
            <div>
              <h2>{{ title }}</h2>
              <p class="lead">
                סרקו את הקוד, בחרו כינוי, והמתינו על הטלפון. המשחק מתחיל כשהמנחה מוכן.
              </p>
              <div class="lobby-names">
                <span
                  v-for="(name, i) in joiningNames"
                  :key="`${name}-${i}`"
                  :style="{ animationDelay: `${i * 0.08}s` }"
                >{{ name }}</span>
                <span v-if="joiningExtra > 0">+{{ joiningExtra }}</span>
              </div>
            </div>
            <div class="join-box">
              <p>סרקו והצטרפו</p>
              <div class="qr-slot">
                <qrcode-vue :value="joinUrl" :size="240" level="M" render-as="svg" />
              </div>
              <div class="url">{{ joinDisplay }}</div>
            </div>
          </div>

          <!-- Leaderboard -->
          <div v-else-if="phase === 'leaderboard'" class="board-wrap stage-mid">
            <h2>טבלת הניקוד</h2>
            <ol class="board">
              <li
                v-for="player in boardPlayers"
                :key="player.rank"
                :class="`r${player.rank}`"
              >
                <span class="rk">{{ player.rank }}</span>
                <i
                  class="av"
                  :style="avatarStyle(player.nickname, 58)"
                >{{ initial(player.nickname) }}</i>
                <span>{{ player.nickname }}</span>
                <span class="pts">{{ formatScore(player.score) }}</span>
              </li>
            </ol>
          </div>

          <!-- Question / Reveal -->
          <div v-else-if="phase === 'question' || phase === 'reveal'" class="stage-mid">
            <h1 class="stage-q">{{ question?.prompt }}</h1>
            <p v-if="showOpinionSub" class="stage-sub">
              בלי תשובה נכונה — רק מה שהקהל בוחר
            </p>

            <!-- who / whosaid -->
            <div v-if="isWhoFamily" class="who-live">
              <article
                v-for="(side, i) in sideCards"
                :key="i"
                class="who-card"
                :class="{ 'is-correct': isReveal && side.correct }"
                :style="{ animationDelay: `${i * 0.08}s` }"
              >
                <div
                  class="av-lg who-photo"
                  :style="{ background: side.color, color: '#fff' }"
                >{{ side.initial }}</div>
                <h3>{{ side.name }}</h3>
                <div class="wpct">{{ side.percent }}%</div>
                <div class="wbar">
                  <i
                    :style="{
                      width: isReveal || showLiveTallies ? `${side.percent}%` : '0%',
                      background: side.color,
                    }"
                  ></i>
                </div>
                <span v-if="isReveal && side.correct" class="check-badge">✓</span>
              </article>
            </div>

            <!-- thisorthat -->
            <div v-else-if="questionType === 'thisorthat'" class="tot-live">
              <article
                v-for="(side, i) in sideCards"
                :key="i"
                class="tot-card"
                :style="{
                  background: side.color,
                  color: '#fff',
                  animationDelay: `${i * 0.08}s`,
                }"
              >
                <div style="font-size: 72px; line-height: 1">{{ side.initial }}</div>
                <h3>{{ side.name }}</h3>
                <div class="tpct">{{ side.percent }}%</div>
              </article>
            </div>

            <!-- twothruths -->
            <div v-else-if="questionType === 'twothruths'" class="truths">
              <div
                v-for="(row, i) in truthRows"
                :key="i"
                class="truth"
                :class="{ 'is-lie': row.isLie }"
                :style="{ animationDelay: `${i * 0.07}s` }"
              >
                <span
                  class="tnum"
                  :style="{ background: letterColor(i), color: '#fff' }"
                >{{ i + 1 }}</span>
                <span>{{ row.label }}</span>
                <span class="lie-ribbon">השקר</span>
                <span
                  v-if="isReveal"
                  class="pct"
                  style="opacity: 1; margin-right: auto; font-size: 24px"
                >{{ row.percent }}%</span>
              </div>
            </div>

            <!-- number -->
            <div v-else-if="questionType === 'number'" class="num-live">
              <div class="num-axis">
                <div class="line"></div>
                <i
                  v-for="(g, i) in numberGuesses"
                  :key="i"
                  class="guess-dot"
                  :style="{
                    left: `${numberPos(g)}%`,
                    right: 'auto',
                    background: letterColor(i % 6),
                    animationDelay: `${i * 0.04}s`,
                  }"
                  :title="String(g)"
                ></i>
                <div
                  v-if="isReveal && numberCorrect != null"
                  class="correct-mark"
                  :style="{ left: `${numberPos(numberCorrect)}%`, right: 'auto' }"
                >
                  <b>{{ numberCorrect }}</b>
                  <div class="needle"></div>
                </div>
                <span
                  v-for="tick in numberTicks"
                  :key="tick"
                  class="tick"
                  :style="{ left: `${numberPos(tick)}%`, right: 'auto' }"
                >{{ tick }}</span>
              </div>
              <div v-if="isReveal" class="closest-card">
                הכי קרוב:
                <b>{{ closestNickname || "—" }}</b>
                <template v-if="closestValue != null"> עם {{ closestValue }}</template>
                · התשובה {{ numberCorrect }}
                <template v-if="numberUnit"> {{ numberUnit }}</template>
              </div>
            </div>

            <!-- photo -->
            <div v-else-if="questionType === 'photo'" class="photo-live">
              <div class="pic">
                <img v-if="photoUrl" :src="photoUrl" alt="" />
              </div>
              <div>
                <div class="opts-grid" :class="{ tf: optionRows.length <= 2 }">
                  <div
                    v-for="(opt, i) in optionRows"
                    :key="opt.id ?? i"
                    class="s-opt"
                    :class="{ 'is-correct': isReveal && opt.correct }"
                  >
                    <span
                      class="bar-fill"
                      :style="{ width: barWidth(opt) }"
                    ></span>
                    <span class="letter" :style="{ background: letterColor(i) }">{{
                      letter(i)
                    }}</span>
                    <span class="olabel">{{ opt.label }}</span>
                    <span class="pct">{{ opt.percent }}%</span>
                    <span class="check">✓</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- choice / multi / truefalse / poll (default options) -->
            <div
              v-else
              class="opts-grid"
              :class="{ tf: optionRows.length <= 2 }"
            >
              <div
                v-for="(opt, i) in optionRows"
                :key="opt.id ?? i"
                class="s-opt"
                :class="{ 'is-correct': isReveal && opt.correct }"
              >
                <span class="bar-fill" :style="{ width: barWidth(opt) }"></span>
                <span class="letter" :style="{ background: letterColor(i) }">{{
                  letter(i)
                }}</span>
                <span class="olabel">{{ opt.label }}</span>
                <span class="pct">{{ opt.percent }}%</span>
                <span class="check">✓</span>
              </div>
            </div>

            <div class="fun" :class="{ has: isReveal && !!funFact }">
              <template v-if="funFact"><b>רקע קצר.</b>{{ funFact }}</template>
            </div>
          </div>

          <footer v-if="phase !== 'lobby' && phase !== 'podium'" class="stage-foot">
            <div class="players-live">
              <span class="av-stack">
                <i
                  v-for="(player, i) in footPlayers"
                  :key="i"
                  class="av"
                  :style="avatarStyle(player.nickname, 36)"
                >{{ initial(player.nickname) }}</i>
              </span>
              {{ playerCount }} משחקים עכשיו
            </div>
            <div class="team-pill">
              <template v-if="teams">
                <span>{{ teams.labels.a }} · {{ formatScore(teams.scores.a) }}</span>
                <span>{{ teams.labels.b }} · {{ formatScore(teams.scores.b) }}</span>
              </template>
            </div>
            <div class="mini-qr">
              <div class="qr-slot">
                <qrcode-vue :value="joinUrl" :size="74" level="M" render-as="svg" />
              </div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import QrcodeVue from "qrcode.vue";
import {
  TRIVIA_LETTERS,
  TRIVIA_LETTER_COLORS,
  TriviaScreenPayload,
  TriviaQuestionDto,
  isUnscoredType,
} from "@/helpers/triviaTypes";

const TIMER_R = 46;
const TIMER_C = 2 * Math.PI * TIMER_R;

const SIDE_COLORS = ["#1F6F6A", "#DC5B66", "#6E4A8A", "#C9A36A"];

export default defineComponent({
  name: "EventTriviaLiveStage",

  components: { QrcodeVue },

  props: {
    screen: {
      type: Object as PropType<TriviaScreenPayload>,
      required: true,
    },
    eventName: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      secondsLeft: 0,
      timerProgress: 1,
      serverSkew: 0,
      clockTimer: null as ReturnType<typeof setInterval> | null,
      resizeObserver: null as ResizeObserver | null,
    };
  },

  computed: {
    theme(): string {
      const t = this.screen.theme || "elegant";
      return t === "neon" ? "neon" : "elegant";
    },

    phase(): string {
      const p = this.screen.current_phase || "lobby";
      if (["lobby", "question", "reveal", "leaderboard", "podium"].includes(p)) {
        return p;
      }
      return "lobby";
    },

    isReveal(): boolean {
      return this.phase === "reveal";
    },

    title(): string {
      return this.screen.title || "טריוויה";
    },

    eventLabel(): string {
      return this.eventName || this.screen.event_name || this.title;
    },

    playerCount(): number {
      return this.screen.player_count || 0;
    },

    question(): TriviaQuestionDto | null {
      return this.screen.question || null;
    },

    questionType(): string {
      return this.question?.type || "choice";
    },

    isWhoFamily(): boolean {
      return this.questionType === "who" || this.questionType === "whosaid";
    },

    showOpinionSub(): boolean {
      return isUnscoredType(this.questionType);
    },

    showLiveTallies(): boolean {
      return isUnscoredType(this.questionType);
    },

    progressLabel(): string {
      if (this.phase === "lobby") return "הצטרפות";
      if (this.phase === "podium") return "התוצאות";
      const q = this.question;
      if (q?.index && q?.total) return `שאלה ${q.index} מתוך ${q.total}`;
      if (this.phase === "leaderboard") return "טבלת ניקוד";
      return "שאלה";
    },

    joinUrl(): string {
      return window.location.origin + (this.screen.join_path || "");
    },

    joinDisplay(): string {
      try {
        const u = new URL(this.joinUrl);
        return `${u.host}${u.pathname}`.replace(/\/$/, "");
      } catch {
        return this.screen.join_path || "";
      }
    },

    joiningNames(): string[] {
      const list = this.screen.joining || [];
      return list.slice(0, 12).map((j) => j.nickname).filter(Boolean);
    },

    joiningExtra(): number {
      return Math.max(0, this.playerCount - this.joiningNames.length);
    },

    boardPlayers(): NonNullable<TriviaScreenPayload["top"]> {
      return this.screen.top || [];
    },

    footPlayers(): NonNullable<TriviaScreenPayload["top"]> {
      return (this.screen.top || []).slice(0, 5);
    },

    teams(): NonNullable<TriviaScreenPayload["teams"]> | null {
      return this.screen.teams?.mode === "sides" ? this.screen.teams : null;
    },

    funFact(): string {
      return (this.screen.fun_fact || this.question?.fun_fact || "") as string;
    },

    timerCircumference(): string {
      return TIMER_C.toFixed(1);
    },

    timerDashOffset(): string {
      return (TIMER_C * (1 - this.timerProgress)).toFixed(1);
    },

    tallyMap(): Record<number, { count: number; percent: number }> {
      const map: Record<number, { count: number; percent: number }> = {};
      const opts = this.screen.tallies?.options || [];
      opts.forEach((o) => {
        map[o.option_id] = { count: o.count, percent: o.percent };
      });
      return map;
    },

    correctIds(): Set<number> {
      const ids = this.screen.correct?.option_ids || [];
      return new Set(ids);
    },

    optionRows(): {
      id: number | string;
      label: string;
      percent: number;
      correct: boolean;
    }[] {
      const options = this.question?.options || [];
      return options.map((o: TriviaQuestionDto["options"][number], i: number) => {
        const id = o.id ?? i;
        const tally = this.tallyMap[id as number];
        const fromOpt = (o as { is_correct?: boolean }).is_correct;
        const correct =
          fromOpt === true || (this.isReveal && this.correctIds.has(Number(id)));
        return {
          id,
          label: o.label,
          percent: tally?.percent ?? 0,
          correct,
        };
      });
    },

    sideCards(): {
      name: string;
      color: string;
      initial: string;
      percent: number;
      correct: boolean;
    }[] {
      const config = (this.question?.config || {}) as {
        sides?: { name?: string; color?: string; initial?: string }[];
      };
      const sides = config.sides || [];
      const options = this.question?.options || [];
      const count = Math.max(sides.length, options.length, 2);
      const cards: {
        name: string;
        color: string;
        initial: string;
        percent: number;
        correct: boolean;
      }[] = [];
      for (let i = 0; i < count && i < 2; i++) {
        const side = sides[i] || {};
        const opt = options[i];
        const id = opt?.id ?? i;
        const tally = this.tallyMap[Number(id)];
        const fromOpt = (opt as { is_correct?: boolean } | undefined)?.is_correct;
        const correct =
          fromOpt === true || (this.isReveal && this.correctIds.has(Number(id)));
        const name = side.name || opt?.label || `צד ${i + 1}`;
        cards.push({
          name,
          color: side.color || SIDE_COLORS[i % SIDE_COLORS.length],
          initial: side.initial || this.initial(name),
          percent: tally?.percent ?? 0,
          correct,
        });
      }
      return cards;
    },

    truthRows(): { label: string; percent: number; isLie: boolean }[] {
      const options = this.question?.options || [];
      if (options.length) {
        return options.map((o: TriviaQuestionDto["options"][number], i: number) => {
          const id = o.id ?? i;
          const tally = this.tallyMap[Number(id)];
          const fromOpt = (o as { is_correct?: boolean }).is_correct;
          const isLie =
            fromOpt === true || (this.isReveal && this.correctIds.has(Number(id)));
          return {
            label: o.label,
            percent: tally?.percent ?? 0,
            isLie,
          };
        });
      }
      const truths = ((this.question?.config as { truths?: { label?: string; lie?: boolean }[] })
        ?.truths || []) as { label?: string; lie?: boolean }[];
      return truths.map((t) => ({
        label: t.label || "",
        percent: 0,
        isLie: !!t.lie,
      }));
    },

    numberConfig(): {
      min?: number;
      max?: number;
      unit?: string;
      correct?: number;
    } {
      return (this.question?.config || {}) as {
        min?: number;
        max?: number;
        unit?: string;
        correct?: number;
      };
    },

    numberMin(): number {
      return Number(this.numberConfig.min ?? 0);
    },

    numberMax(): number {
      return Number(this.numberConfig.max ?? 100);
    },

    numberUnit(): string {
      return String(this.numberConfig.unit || "");
    },

    numberCorrect(): number | null {
      if (this.screen.correct?.number != null) return Number(this.screen.correct.number);
      if (this.numberConfig.correct != null) return Number(this.numberConfig.correct);
      return null;
    },

    numberTicks(): number[] {
      const min = this.numberMin;
      const max = this.numberMax;
      return [min, Math.round((min + max) / 2), max];
    },

    numberGuesses(): number[] {
      const guesses = this.screen.tallies?.guesses || [];
      return guesses
        .map((g) => g.value)
        .filter((v): v is number => v != null && !Number.isNaN(Number(v)))
        .map(Number);
    },

    closestNickname(): string {
      return this.screen.correct?.closest?.nickname || "";
    },

    closestValue(): number | null {
      const v = this.screen.correct?.closest?.value;
      return v == null ? null : Number(v);
    },

    photoUrl(): string {
      return this.question?.media?.url || "";
    },
  },

  watch: {
    screen: {
      deep: true,
      immediate: true,
      handler() {
        this.syncClock();
      },
    },
  },

  mounted() {
    this.applyScale();
    this.resizeObserver = new ResizeObserver(() => this.applyScale());
    if (this.$refs.host) {
      this.resizeObserver.observe(this.$refs.host as Element);
    }
    window.addEventListener("resize", this.applyScale);
  },

  beforeUnmount() {
    this.stopClock();
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.applyScale);
  },

  methods: {
    applyScale() {
      const host = this.$refs.host as HTMLElement | undefined;
      const stage = this.$refs.stage as HTMLElement | undefined;
      if (!host || !stage) return;
      const s = Math.min(host.clientWidth / 1440, host.clientHeight / 810);
      stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    },

    syncClock() {
      if (this.screen.server_now) {
        this.serverSkew = Date.now() - new Date(this.screen.server_now).getTime();
      }
      if (this.phase === "question" && this.question?.started_at) {
        this.startClock();
      } else {
        this.stopClock();
        this.secondsLeft = this.question?.time_limit_seconds || 0;
        this.timerProgress = 1;
      }
    },

    startClock() {
      this.stopClock();
      const tick = () => {
        const startedAt = this.question?.started_at;
        if (!startedAt) return;
        const served = new Date(startedAt).getTime();
        const limit = (this.question?.time_limit_seconds || 20) * 1000;
        const elapsed = Date.now() - this.serverSkew - served;
        const remaining = Math.max(0, limit - elapsed);
        this.secondsLeft = Math.ceil(remaining / 1000);
        this.timerProgress = limit ? remaining / limit : 0;
        if (remaining <= 0) this.stopClock();
      };
      tick();
      this.clockTimer = setInterval(tick, 200);
    },

    stopClock() {
      if (this.clockTimer) {
        clearInterval(this.clockTimer);
        this.clockTimer = null;
      }
    },

    letter(i: number): string {
      return TRIVIA_LETTERS[i] || String(i + 1);
    },

    letterColor(i: number): string {
      return TRIVIA_LETTER_COLORS[i % TRIVIA_LETTER_COLORS.length];
    },

    initial(name: string): string {
      return (name || "?").trim().charAt(0) || "?";
    },

    avatarStyle(name: string, size: number): Record<string, string> {
      const colors = [...TRIVIA_LETTER_COLORS];
      const code = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const bg = colors[code % colors.length];
      return {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.4)}px`,
        background: bg,
        color: "#ffffff",
        border: "2px solid transparent",
      };
    },

    formatScore(n: number): string {
      return Number(n || 0).toLocaleString("he-IL");
    },

    barWidth(opt: { percent: number }): string {
      if (this.isReveal || this.showLiveTallies) return `${opt.percent}%`;
      return "0%";
    },

    numberPos(value: number): number {
      const span = this.numberMax - this.numberMin;
      if (!span) return 50;
      return ((Number(value) - this.numberMin) / span) * 100;
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/trivia-stage.scss";
</style>
