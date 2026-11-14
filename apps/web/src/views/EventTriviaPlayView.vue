<template>
  <main class="trivia-play" dir="rtl" lang="he" :data-theme="theme">
    <div class="guest">
      <div class="guest-brand" aria-hidden="false">
        <span class="logo-mark">
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

      <!-- loading -->
      <section v-if="view === 'loading'" class="g-wait">
        <div class="spin" aria-hidden="true"></div>
        <p class="hint">טוענים את המשחק…</p>
      </section>

      <!-- waiting: game not live yet -->
      <section v-else-if="view === 'waiting'" class="g-wait">
        <div class="spin" aria-hidden="true"></div>
        <p class="eyebrow">{{ title }}</p>
        <h1>עוד רגע מתחילים</h1>
        <p class="hint">הטריוויה תופיע כאן ברגע שתעלה על המסך.</p>
      </section>

      <!-- waiting-for-host: joined, lobby / between questions -->
      <section v-else-if="view === 'waiting-for-host'" class="g-wait">
        <div class="spin" aria-hidden="true"></div>
        <p class="eyebrow">{{ title }}</p>
        <h1>עוד רגע מתחילים</h1>
        <p class="hint">המנחה יעלה את השאלה על המסך הגדול. מחכים כאן.</p>
      </section>

      <!-- looking: answered, wait for reveal -->
      <section v-else-if="view === 'looking'" class="g-wait">
        <div class="spin" aria-hidden="true"></div>
        <p class="eyebrow">נשלח</p>
        <h1>מסתכלים על המסך</h1>
        <p class="hint">המנחה חושף את התשובה על המסך הגדול. הניקוד יגיע מיד אחרי.</p>
      </section>

      <!-- closed -->
      <section v-else-if="view === 'closed'" class="g-wait">
        <p class="eyebrow">{{ title }}</p>
        <h1>זהו, המשחק נגמר</h1>
        <p class="hint">הפודיום על המסך באירוע</p>
      </section>

      <!-- join -->
      <section v-else-if="view === 'join'" class="g-join">
        <p class="eyebrow">{{ title }}</p>
        <h1>איך קוראים לך?</h1>
        <p class="hint">בלי אפליקציה. כינוי, ואם בא לך — תמונה. אחר כך מסתכלים על המסך הגדול.</p>
        <form class="g-form" @submit.prevent="join">
          <label>
            שם או כינוי
            <input
              v-model.trim="nickname"
              type="text"
              maxlength="40"
              required
              minlength="2"
              placeholder="למשל: נועה"
              autocomplete="nickname"
            />
          </label>

          <label class="selfie-wrap">
            <div class="selfie" :class="{ has: !!previewUrl }">
              <img v-if="previewUrl" :src="previewUrl" alt="" />
              <span v-else>{{ nicknameInitial }}</span>
            </div>
            <span class="selfie-lab">אפשר גם תמונה</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="sr-only"
              @change="onImage"
            />
          </label>

          <div v-if="needsTeam" class="team-pick">
            <p class="team-lab">בחרו צד</p>
            <div class="team-row">
              <button
                type="button"
                class="team-btn"
                :class="{ on: team === 'a' }"
                @click="team = 'a'"
              >
                {{ teamLabels.a }}
              </button>
              <button
                type="button"
                class="team-btn"
                :class="{ on: team === 'b' }"
                @click="team = 'b'"
              >
                {{ teamLabels.b }}
              </button>
            </div>
          </div>

          <button
            class="g-go"
            type="submit"
            :disabled="submitting || nickname.trim().length < 2 || (needsTeam && !team)"
          >
            יאללה, מתחילים
          </button>
        </form>
      </section>

      <!-- question -->
      <TriviaGuestQuestion
        v-else-if="view === 'question' && question"
        :question="question"
        :selected-ids="selectedIds"
        :number-value="numberValue"
        :seconds-left="secondsLeft"
        :timer-progress="timerProgress"
        :disabled="submitting"
        @update:selected-ids="selectedIds = $event"
        @update:number-value="numberValue = $event"
        @submit="submitOptions"
        @submit-number="submitNumber"
      />

      <!-- feedback -->
      <section
        v-else-if="view === 'feedback' && feedback"
        class="g-feed"
        :class="{ good: feedback.is_correct, bad: feedback.is_correct === false }"
      >
        <p class="eyebrow">
          <template v-if="feedbackUnscored">נשלח</template>
          <template v-else-if="feedback.is_correct">נכון, ומהר</template>
          <template v-else>לא מדויק</template>
        </p>
        <div class="pts">
          <template v-if="feedbackUnscored">✓</template>
          <template v-else-if="feedback.is_correct">+{{ feedback.points_awarded ?? 0 }}</template>
          <template v-else>0</template>
        </div>
        <p class="score">הניקוד שלך: {{ formatScore(feedback.score) }}</p>
      </section>

      <!-- result -->
      <section v-else-if="view === 'result' && result" class="g-result">
        <p class="eyebrow">זהו, המשחק נגמר</p>
        <div
          v-if="!avatarUrl"
          class="av-lg"
          :style="avatarFallbackStyle"
        >{{ nicknameInitial }}</div>
        <img v-else class="av-lg img" :src="avatarUrl" alt="" />
        <h1>{{ nickname || "הניקוד שלך" }}</h1>
        <div class="big">{{ formatScore(result.score) }}</div>
        <p>
          מקום {{ result.rank }} · {{ result.correct_count }} תשובות מדויקות מתוך
          {{ result.total_questions }}
        </p>
        <p class="hint podium-hint">הפודיום על המסך באירוע</p>
      </section>
    </div>
  </main>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import ErrorsHandler from "@/helpers/errorsHandler";
import { notify } from "@/helpers/notify";
import {
  TriviaPace,
  TriviaQuestionDto,
  isUnscoredType,
} from "@/helpers/triviaTypes";
import TriviaGuestQuestion from "@/components/event/trivia/TriviaGuestQuestion.vue";

type PlayView =
  | "loading"
  | "join"
  | "waiting"
  | "waiting-for-host"
  | "question"
  | "looking"
  | "feedback"
  | "result"
  | "closed";

interface TriviaResult {
  score: number;
  rank: number;
  correct_count: number;
  total_questions: number;
}

interface TriviaFeedback extends Partial<TriviaResult> {
  is_correct: boolean | null;
  points_awarded: number | null;
  finished?: boolean;
  waiting_for_reveal?: boolean;
  score: number;
}

interface PlayQuestion extends TriviaQuestionDto {
  id: number;
}

const POLL_MS = 1000;
const FEEDBACK_MS = 1300;

export default defineComponent({
  name: "EventTriviaPlayView",

  components: { TriviaGuestQuestion },

  data() {
    return {
      view: "loading" as PlayView,
      title: "טריוויה",
      theme: "elegant" as string,
      pace: "host" as TriviaPace | string,
      nickname: "",
      avatarUrl: "" as string,
      image: null as File | null,
      previewUrl: "" as string,
      team: "" as "" | "a" | "b",
      teamsMode: "none" as string,
      teamLabels: { a: "צד עמית", b: "צד גל" },
      serverSkew: 0,
      question: null as PlayQuestion | null,
      selectedIds: [] as number[],
      numberValue: 0,
      lastSubmit: null as {
        question_id: number;
        option_ids: number[];
        value_number?: number;
      } | null,
      feedbackShownFor: null as number | null,
      feedback: null as TriviaFeedback | null,
      result: null as TriviaResult | null,
      submitting: false,
      secondsLeft: 0,
      timerProgress: 1,
      pollTimer: null as ReturnType<typeof setInterval> | null,
      clockTimer: null as ReturnType<typeof setInterval> | null,
      feedbackTimer: null as ReturnType<typeof setTimeout> | null,
      autoSubmittedId: null as number | null,
    };
  },

  computed: {
    eventPath(): string {
      return String(this.$route.params.event_path || "");
    },

    sessionKey(): string {
      return `snapshareTrivia:${this.eventPath}`;
    },

    isSharedPace(): boolean {
      return this.pace === "host" || this.pace === "auto";
    },

    needsTeam(): boolean {
      return this.teamsMode === "sides";
    },

    nicknameInitial(): string {
      return (this.nickname || "?").trim().charAt(0) || "?";
    },

    avatarFallbackStyle(): Record<string, string> {
      return { background: "#DC5B66", color: "#fff" };
    },

    feedbackUnscored(): boolean {
      return isUnscoredType(this.question?.type || "");
    },
  },

  created() {
    this.bootstrap();
    this.pollTimer = setInterval(() => this.tickPoll(), POLL_MS);
  },

  beforeUnmount() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.stopClock();
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  },

  methods: {
    token(): string {
      return localStorage.getItem(this.sessionKey) || "";
    },

    headers() {
      return { headers: { "X-Trivia-Session": this.token() } };
    },

    formatScore(n: number): string {
      return Number(n || 0).toLocaleString("he-IL");
    },

    fail(error: unknown, fallback: string) {
      notify({
        text: ErrorsHandler.getErrorMessage(error, fallback),
        type: "error",
        duration: 5000,
      });
    },

    async bootstrap() {
      await this.refreshScreen(true);
      if (this.token()) {
        await this.resume();
      }
    },

    async tickPoll() {
      if (this.view === "join" || this.view === "feedback" || this.view === "result") {
        await this.refreshScreen(false);
        return;
      }
      await this.refreshScreen(false);
      if (!this.token()) return;
      if (
        this.view === "waiting-for-host" ||
        this.view === "looking" ||
        this.view === "waiting" ||
        (this.view === "question" && this.isSharedPace)
      ) {
        await this.loadQuestion({ silent: true });
      }
    },

    async refreshScreen(initial: boolean) {
      try {
        const res = await axios.get(`events/${this.eventPath}/trivia/screen`);
        const screen = res.data.data;
        this.title = screen.title || "טריוויה";
        this.theme = screen.theme === "neon" ? "neon" : "elegant";
        if (screen.pace) this.pace = screen.pace;

        if (screen.teams?.mode === "sides") {
          this.teamsMode = "sides";
          this.teamLabels = {
            a: screen.teams.labels?.a || "צד עמית",
            b: screen.teams.labels?.b || "צד גל",
          };
        } else if (initial) {
          this.teamsMode = "none";
        }

        if (screen.server_now) {
          this.serverSkew = Date.now() - new Date(screen.server_now).getTime();
        }

        if (screen.phase === "results" || screen.current_phase === "podium") {
          if (this.token()) {
            await this.showPersonalResult();
          } else if (this.view !== "result") {
            this.view = "closed";
          }
          return;
        }

        if (screen.phase !== "live") {
          if (
            this.view !== "question" &&
            this.view !== "feedback" &&
            this.view !== "looking" &&
            this.view !== "result"
          ) {
            this.view = "waiting";
          }
          return;
        }

        // live
        if (!this.token()) {
          if (
            initial ||
            this.view === "loading" ||
            this.view === "waiting" ||
            this.view === "closed"
          ) {
            this.view = "join";
          }
          return;
        }

        if (
          this.view === "loading" ||
          this.view === "waiting" ||
          this.view === "join"
        ) {
          await this.resume();
          return;
        }

        // Host-paced: react as soon as screen reports a shared phase change.
        const phase = screen.current_phase || "";
        if (
          this.isSharedPace &&
          (phase === "question" || phase === "reveal" || phase === "leaderboard")
        ) {
          if (
            this.view === "waiting-for-host" ||
            this.view === "looking" ||
            (this.view === "question" && phase !== "question")
          ) {
            await this.loadQuestion({ silent: !initial });
          }
        }
      } catch (error) {
        if (initial) {
          this.view = "closed";
          this.fail(error, "לא מצאנו את הטריוויה");
        }
      }
    },

    async resume() {
      try {
        const res = await axios.get(`events/${this.eventPath}/trivia/me`, this.headers());
        const data = res.data.data;
        this.nickname = data.player.nickname;
        this.avatarUrl = data.player.avatar_url || "";
        if (data.pace) this.pace = data.pace;

        if (data.phase === "results" || data.current_phase === "podium" || data.player.finished) {
          this.result = {
            score: data.player.score,
            rank: data.rank,
            correct_count: data.correct_count,
            total_questions: data.total_questions,
          };
          this.view = "result";
          this.stopClock();
          return;
        }

        if (data.phase === "live") {
          await this.loadQuestion();
        } else {
          this.view = "waiting";
        }
      } catch {
        localStorage.removeItem(this.sessionKey);
        this.view = "join";
      }
    },

    onImage(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0] || null;
      this.image = file;
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = file ? URL.createObjectURL(file) : "";
    },

    async join() {
      if (this.nickname.trim().length < 2) return;
      if (this.needsTeam && !this.team) return;
      this.submitting = true;
      try {
        const form = new FormData();
        form.append("nickname", this.nickname.trim());
        if (this.image) form.append("image", this.image);
        if (this.needsTeam && this.team) form.append("team", this.team);

        const res = await axios.post(`events/${this.eventPath}/trivia/join`, form);
        const data = res.data.data;
        localStorage.setItem(this.sessionKey, data.session_token);
        this.avatarUrl = data.player?.avatar_url || "";
        if (data.pace) this.pace = data.pace;
        if (data.teams_mode) this.teamsMode = data.teams_mode;
        if (data.team_labels) {
          this.teamLabels = {
            a: data.team_labels.a || this.teamLabels.a,
            b: data.team_labels.b || this.teamLabels.b,
          };
        }
        await this.loadQuestion();
      } catch (error) {
        this.fail(error, "לא הצלחנו להכניס אותך למשחק");
      } finally {
        this.submitting = false;
      }
    },

    initNumberValue(q: PlayQuestion) {
      const cfg = (q.config || {}) as { min?: number; max?: number };
      const min = Number(cfg.min ?? 0);
      const max = Number(cfg.max ?? 100);
      this.numberValue = Math.round((min + max) / 2);
    },

    async loadQuestion(opts: { silent?: boolean } = {}) {
      try {
        const res = await axios.get(
          `events/${this.eventPath}/trivia/question`,
          this.headers()
        );
        const data = res.data.data;

        if (data.server_now) {
          this.serverSkew = Date.now() - new Date(data.server_now).getTime();
        }

        if (data.finished) {
          this.result = {
            score: data.score,
            rank: data.rank,
            correct_count: data.correct_count,
            total_questions: data.total_questions,
          };
          this.view = "result";
          this.stopClock();
          return;
        }

        if (data.waiting) {
          this.stopClock();
          const phase = data.current_phase || data.phase || "";

          if (data.answered) {
            if (
              phase === "reveal" &&
              this.lastSubmit &&
              this.feedbackShownFor !== this.lastSubmit.question_id &&
              !isUnscoredType(this.question?.type || "")
            ) {
              await this.fetchRevealFeedback();
              return;
            }
            if (this.view !== "feedback") {
              this.view = "looking";
            }
            return;
          }

          // Shared pace moved on before we answered — leave the question UI
          if (this.view === "question" && this.isSharedPace) {
            this.view = "waiting-for-host";
            this.question = null;
            return;
          }

          if (this.view === "feedback" || this.view === "result") {
            return;
          }
          this.view = "waiting-for-host";
          this.question = null;
          return;
        }

        const q = data.question as PlayQuestion;
        if (!q?.id) {
          this.view = "waiting-for-host";
          return;
        }

        // New shared question after looking / waiting
        if (
          this.question?.id !== q.id ||
          this.view === "waiting-for-host" ||
          this.view === "looking" ||
          this.view === "waiting" ||
          this.view === "loading"
        ) {
          this.question = q;
          this.selectedIds = [];
          this.autoSubmittedId = null;
          this.feedbackShownFor = null;
          if (q.type === "number") this.initNumberValue(q);
          this.view = "question";
          this.startClock();
        } else if (this.view === "question") {
          this.question = q;
        }
      } catch (error) {
        if (!opts.silent) {
          this.fail(error, "לא הצלחנו לטעון שאלה");
        }
      }
    },

    startClock() {
      this.stopClock();
      const tick = () => {
        if (!this.question || this.view !== "question") return;
        const started =
          this.question.started_at || this.question.served_at || "";
        if (!started) return;
        const served = new Date(started).getTime();
        const limit = (this.question.time_limit_seconds || 20) * 1000;
        const elapsed = Date.now() - this.serverSkew - served;
        const remaining = Math.max(0, limit - elapsed);
        this.secondsLeft = Math.ceil(remaining / 1000);
        this.timerProgress = limit ? remaining / limit : 0;
        if (remaining <= 0) {
          this.stopClock();
          this.autoSubmit();
        }
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

    autoSubmit() {
      if (!this.question || this.view !== "question") return;
      if (this.autoSubmittedId === this.question.id) return;
      this.autoSubmittedId = this.question.id;
      if (this.question.type === "number") {
        this.submitNumber(this.numberValue);
        return;
      }
      this.submitOptions([...this.selectedIds]);
    },

    submitOptions(optionIds: number[]) {
      this.submitAnswer({ option_ids: optionIds });
    },

    submitNumber(value: number) {
      this.submitAnswer({ option_ids: [], value_number: value });
    },

    async submitAnswer(payload: { option_ids: number[]; value_number?: number }) {
      if (!this.question || this.submitting || this.view !== "question") return;
      this.submitting = true;
      this.stopClock();
      const questionId = this.question.id;
      const body: {
        question_id: number;
        option_ids: number[];
        value_number?: number;
      } = {
        question_id: questionId,
        option_ids: payload.option_ids,
      };
      if (payload.value_number !== undefined) {
        body.value_number = payload.value_number;
      }

      try {
        const res = await axios.post(
          `events/${this.eventPath}/trivia/answer`,
          body,
          this.headers()
        );
        const data = res.data.data as TriviaFeedback;
        this.lastSubmit = body;

        if (data.waiting_for_reveal || (this.isSharedPace && data.is_correct == null)) {
          this.view = "looking";
          return;
        }

        if (isUnscoredType(this.question.type) && !this.isSharedPace) {
          this.feedback = data;
          this.view = "feedback";
          this.scheduleAfterFeedback(data);
          return;
        }

        this.feedback = data;
        this.feedbackShownFor = questionId;
        this.view = "feedback";
        this.scheduleAfterFeedback(data);
      } catch (error) {
        this.fail(error, "לא הצלחנו לשמור את התשובה");
        if (this.question && this.isSharedPace) {
          await this.loadQuestion({ silent: true });
        } else if (this.question) {
          this.view = "question";
          if (this.secondsLeft > 0) this.startClock();
        } else {
          this.view = "waiting-for-host";
        }
      } finally {
        this.submitting = false;
      }
    },

    async fetchRevealFeedback() {
      if (!this.lastSubmit || this.submitting) return;
      this.submitting = true;
      try {
        const res = await axios.post(
          `events/${this.eventPath}/trivia/answer`,
          this.lastSubmit,
          this.headers()
        );
        const data = res.data.data as TriviaFeedback;
        if (data.waiting_for_reveal || data.is_correct == null) {
          this.view = "looking";
          return;
        }
        this.feedback = data;
        this.feedbackShownFor = this.lastSubmit.question_id;
        this.view = "feedback";
        this.scheduleAfterFeedback(data);
      } catch {
        this.view = "looking";
      } finally {
        this.submitting = false;
      }
    },

    scheduleAfterFeedback(data: TriviaFeedback) {
      if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
      this.feedbackTimer = setTimeout(() => {
        if (data.finished) {
          this.result = {
            score: data.score,
            rank: data.rank ?? 0,
            correct_count: data.correct_count ?? 0,
            total_questions: data.total_questions ?? 0,
          };
          this.view = "result";
          return;
        }
        if (this.isSharedPace) {
          this.view = "looking";
          this.loadQuestion({ silent: true });
          return;
        }
        this.loadQuestion();
      }, FEEDBACK_MS);
    },

    async showPersonalResult() {
      if (this.view === "result") return;
      try {
        const res = await axios.get(
          `events/${this.eventPath}/trivia/me`,
          this.headers()
        );
        const data = res.data.data;
        this.nickname = data.player.nickname;
        this.avatarUrl = data.player.avatar_url || "";
        this.result = {
          score: data.player.score,
          rank: data.rank,
          correct_count: data.correct_count,
          total_questions: data.total_questions,
        };
        this.view = "result";
        this.stopClock();
      } catch {
        this.view = "closed";
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.trivia-play {
  --g-ink: #161310;
  --g-muted: #5e564e;
  --g-faint: #8a8278;
  --g-rose: #dc5b66;
  --g-gold: #c9a36a;
  --g-paper: #fff;
  --g-line: rgba(22, 19, 16, 0.12);
  --g-ans-on: #fff5f5;
  --g-timer-track: #efe8df;
  --g-bg: #f3eee6;

  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  background: var(--g-bg);
  color: var(--g-ink);
  font-family: "Heebo", "Segoe UI", Tahoma, sans-serif;
  direction: rtl;
}

.trivia-play[data-theme="neon"] {
  --g-ink: #fff;
  --g-muted: #b9a8c4;
  --g-faint: #8a7a98;
  --g-rose: #ff2e8b;
  --g-gold: #3df0ff;
  --g-paper: #160e1c;
  --g-line: rgba(226, 75, 141, 0.4);
  --g-ans-on: rgba(255, 46, 139, 0.16);
  --g-timer-track: #1a1224;
  --g-bg: #0a0712;
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 46, 139, 0.22), transparent 42%),
    radial-gradient(circle at 100% 20%, rgba(61, 240, 255, 0.14), transparent 40%),
    var(--g-bg);
}

.guest {
  width: min(440px, 100%);
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 28px 22px 36px;
  box-sizing: border-box;
}

.guest-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Outfit", "Heebo", sans-serif;
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 18px;
}

.logo-mark {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(201, 163, 106, 0.12);
}

.logo-mark svg {
  width: 15px;
  height: 15px;
}

.eyebrow {
  font-weight: 800;
  color: var(--g-rose);
  font-size: 0.85rem;
  margin-bottom: 6px;
}

h1 {
  font-size: 1.85rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 8px;
}

.hint {
  color: var(--g-muted);
  font-size: 0.95rem;
}

.g-wait {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
}

.spin {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid var(--g-timer-track);
  border-top-color: var(--g-rose);
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.g-join {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.g-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 22px;
}

.g-form label {
  font-weight: 750;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.g-form input[type="text"] {
  border: 1px solid var(--g-line);
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 1.1rem;
  background: var(--g-paper);
  font-weight: 600;
  color: inherit;
}

.selfie-wrap {
  align-items: center;
  cursor: pointer;
}

.selfie {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(22, 19, 16, 0.06);
  margin: 8px auto 0;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 2rem;
  color: var(--g-muted);
  border: 2px dashed var(--g-line);
  overflow: hidden;
}

.trivia-play[data-theme="neon"] .selfie {
  background: rgba(255, 255, 255, 0.06);
}

.selfie.has {
  border-style: solid;
}

.selfie img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selfie-lab {
  font-size: 0.8rem;
  font-weight: 750;
  color: var(--g-muted);
  text-align: center;
  margin-top: 4px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.team-pick {
  margin-top: 4px;
}

.team-lab {
  font-weight: 750;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.team-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.team-btn {
  padding: 16px 12px;
  border-radius: 16px;
  border: 2px solid var(--g-line);
  background: var(--g-paper);
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  color: inherit;
}

.team-btn.on {
  border-color: var(--g-gold);
  box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.28);
}

.g-go {
  margin-top: 8px;
  background: linear-gradient(135deg, var(--g-rose), var(--g-gold));
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  padding: 16px;
  border-radius: 16px;
  border: 0;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(220, 91, 102, 0.22);
}

.g-go:disabled {
  opacity: 0.55;
  cursor: default;
}

.g-feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.g-feed .pts {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
}

.g-feed.good .pts {
  color: #2fbe6a;
}

.g-feed.bad .pts {
  color: var(--g-rose);
}

.g-feed .score {
  color: var(--g-muted);
  font-weight: 700;
  margin-top: 8px;
}

.g-result {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.g-result .av-lg {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 2.2rem;
  font-weight: 900;
  margin-bottom: 10px;
}

.g-result .av-lg.img {
  object-fit: cover;
  display: block;
}

.g-result .big {
  font-size: 4rem;
  font-weight: 900;
  color: var(--g-rose);
  line-height: 1;
  margin: 8px 0;
}

.podium-hint {
  margin-top: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>
