<template>
  <main class="trivia-play">
    <section class="card" v-if="view === 'loading'">
      <p>טוענים את המשחק...</p>
    </section>

    <section class="card" v-else-if="view === 'waiting'">
      <p class="eyebrow">{{ title }}</p>
      <h1>עוד רגע מתחילים</h1>
      <p>הטריוויה תופיע כאן ברגע שתעלה על המסך.</p>
    </section>

    <section class="card" v-else-if="view === 'closed'">
      <p class="eyebrow">{{ title }}</p>
      <h1>המשחק הסתיים</h1>
      <p>התוצאות מוצגות על המסך באירוע.</p>
    </section>

    <section class="card" v-else-if="view === 'join'">
      <p class="eyebrow">{{ title }}</p>
      <h1>איך קוראים לך?</h1>
      <form @submit.prevent="join">
        <label>
          שם או כינוי
          <input v-model.trim="nickname" maxlength="40" required minlength="2" placeholder="למשל: נועה" />
        </label>
        <label class="file-label">
          תמונה, אם בא לך
          <input type="file" accept="image/jpeg,image/png,image/webp" @change="onImage" />
        </label>
        <button class="go" type="submit" :disabled="submitting">יאללה, מתחילים</button>
      </form>
    </section>

    <section class="card question-card" v-else-if="view === 'question' && question">
      <div class="question-top">
        <span>שאלה {{ question.index }} מתוך {{ question.total }}</span>
        <div class="timer" :style="{ '--progress': timerProgress }">
          <strong>{{ secondsLeft }}</strong>
        </div>
      </div>
      <h1>{{ question.prompt }}</h1>
      <p class="hint" v-if="question.selection_mode === 'multiple'">סמנו את כל התשובות הנכונות</p>
      <div class="answers">
        <button
          v-for="option in question.options"
          :key="option.id"
          type="button"
          class="answer"
          :class="{ selected: selectedIds.includes(option.id) }"
          @click="choose(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
      <button
        v-if="question.selection_mode === 'multiple'"
        class="go"
        type="button"
        :disabled="submitting || !selectedIds.length"
        @click="submit(selectedIds)"
      >
        אישור
      </button>
    </section>

    <section class="card feedback" v-else-if="view === 'feedback' && feedback" :class="{ good: feedback.is_correct }">
      <p class="eyebrow">{{ feedback.is_correct ? "נכון" : "לא מדויק" }}</p>
      <h1>{{ feedback.is_correct ? `+${feedback.points_awarded}` : "0" }}</h1>
      <p>הניקוד שלך: {{ feedback.score }}</p>
    </section>

    <section class="card result" v-else-if="view === 'result' && result">
      <p class="eyebrow">זהו</p>
      <img v-if="avatarUrl" :src="avatarUrl" alt="" />
      <h1>{{ nickname || "הניקוד שלך" }}</h1>
      <p class="score">{{ result.score }}</p>
      <p>מקום {{ result.rank }} · {{ result.correct_count }} תשובות נכונות מתוך {{ result.total_questions }}</p>
    </section>
  </main>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import ErrorsHandler from "@/helpers/errorsHandler";
import { notify } from "@kyvg/vue3-notification";

interface TriviaOption {
  id: number;
  label: string;
}

interface TriviaQuestion {
  id: number;
  prompt: string;
  index: number;
  total: number;
  time_limit_seconds: number;
  served_at: string;
  selection_mode: "single" | "multiple";
  options: TriviaOption[];
}

interface TriviaResult {
  score: number;
  rank: number;
  correct_count: number;
  total_questions: number;
}

interface TriviaFeedback extends TriviaResult {
  is_correct: boolean;
  points_awarded: number;
  finished: boolean;
}

export default defineComponent({
  name: "EventTriviaPlayView",

  data() {
    return {
      view: "loading" as string,
      title: "טריוויה",
      nickname: "",
      avatarUrl: "" as string,
      image: null as File | null,
      serverSkew: 0,
      question: null as TriviaQuestion | null,
      selectedIds: [] as number[],
      feedback: null as TriviaFeedback | null,
      result: null as TriviaResult | null,
      submitting: false,
      secondsLeft: 0,
      timerProgress: 1,
      screenTimer: null as ReturnType<typeof setInterval> | null,
      clockTimer: null as ReturnType<typeof setInterval> | null,
      feedbackTimer: null as ReturnType<typeof setTimeout> | null,
    };
  },

  computed: {
    eventPath(): string {
      return String(this.$route.params.event_path || "");
    },

    sessionKey(): string {
      return `snapshareTrivia:${this.eventPath}`;
    },
  },

  created() {
    this.bootstrap();
    this.screenTimer = setInterval(() => this.refreshScreen(false), 5000);
  },

  beforeUnmount() {
    if (this.screenTimer) clearInterval(this.screenTimer);
    this.stopClock();
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
  },

  methods: {
    token(): string {
      return localStorage.getItem(this.sessionKey) || "";
    },

    headers() {
      return { headers: { "X-Trivia-Session": this.token() } };
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

    async refreshScreen(initial: boolean) {
      try {
        const res = await axios.get(`events/${this.eventPath}/trivia/screen`);
        const screen = res.data.data;
        this.title = screen.title || "טריוויה";

        if (screen.phase === "results") {
          if (this.token()) {
            await this.showPersonalResult();
          } else if (this.view !== "result") {
            this.view = "closed";
          }
          return;
        }

        if (screen.phase !== "live") {
          if (this.view !== "question" && this.view !== "feedback") {
            this.view = "waiting";
          }
          return;
        }

        if (initial && !this.token() && this.view === "loading") {
          this.view = "join";
        } else if (this.view === "waiting" || this.view === "loading") {
          this.view = this.token() ? this.view : "join";
          if (this.token() && this.view !== "question" && this.view !== "feedback" && this.view !== "result") {
            await this.resume();
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
        if (data.phase === "results" || data.player.finished) {
          this.result = {
            score: data.player.score,
            rank: data.rank,
            correct_count: data.correct_count,
            total_questions: data.total_questions,
          };
          this.view = "result";
          return;
        }
        if (data.phase === "live") {
          await this.loadQuestion();
        }
      } catch (error) {
        localStorage.removeItem(this.sessionKey);
        this.view = "join";
      }
    },

    onImage(event: Event) {
      const input = event.target as HTMLInputElement;
      this.image = input.files?.[0] || null;
    },

    async join() {
      if (this.nickname.trim().length < 2) return;
      this.submitting = true;
      try {
        const form = new FormData();
        form.append("nickname", this.nickname.trim());
        if (this.image) form.append("image", this.image);
        const res = await axios.post(`events/${this.eventPath}/trivia/join`, form);
        localStorage.setItem(this.sessionKey, res.data.data.session_token);
        this.avatarUrl = res.data.data.player.avatar_url || "";
        await this.loadQuestion();
      } catch (error) {
        this.fail(error, "לא הצלחנו להכניס אותך למשחק");
      } finally {
        this.submitting = false;
      }
    },

    async loadQuestion() {
      try {
        const res = await axios.get(`events/${this.eventPath}/trivia/question`, this.headers());
        const data = res.data.data;
        if (data.finished) {
          this.result = data;
          this.view = "result";
          this.stopClock();
          return;
        }
        this.question = data.question;
        this.serverSkew = Date.now() - new Date(data.server_now).getTime();
        this.selectedIds = [];
        this.view = "question";
        this.startClock();
      } catch (error) {
        this.fail(error, "לא הצלחנו לטעון שאלה");
      }
    },

    startClock() {
      this.stopClock();
      const tick = () => {
        if (!this.question) return;
        const served = new Date(this.question.served_at).getTime();
        const limit = this.question.time_limit_seconds * 1000;
        const elapsed = Date.now() - this.serverSkew - served;
        const remaining = Math.max(0, limit - elapsed);
        this.secondsLeft = Math.ceil(remaining / 1000);
        this.timerProgress = limit ? remaining / limit : 0;
        if (remaining <= 0) {
          this.stopClock();
          this.submit(this.selectedIds);
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

    choose(optionId: number) {
      if (!this.question || this.submitting) return;
      if (this.question.selection_mode === "single") {
        this.submit([optionId]);
        return;
      }
      if (this.selectedIds.includes(optionId)) {
        this.selectedIds = this.selectedIds.filter((id) => id !== optionId);
      } else {
        this.selectedIds = [...this.selectedIds, optionId];
      }
    },

    async submit(optionIds: number[]) {
      if (!this.question || this.submitting || this.view !== "question") return;
      this.submitting = true;
      this.stopClock();
      const questionId = this.question.id;
      try {
        const res = await axios.post(
          `events/${this.eventPath}/trivia/answer`,
          { question_id: questionId, option_ids: optionIds },
          this.headers()
        );
        this.feedback = res.data.data;
        this.view = "feedback";
        this.feedbackTimer = setTimeout(() => {
          if (this.feedback?.finished) {
            this.result = this.feedback;
            this.view = "result";
          } else {
            this.loadQuestion();
          }
        }, 1300);
      } catch (error) {
        this.fail(error, "לא הצלחנו לשמור את התשובה");
        this.view = "question";
        if (this.secondsLeft > 0) {
          this.startClock();
        }
      } finally {
        this.submitting = false;
      }
    },

    async showPersonalResult() {
      if (this.view === "result") return;
      try {
        const res = await axios.get(`events/${this.eventPath}/trivia/me`, this.headers());
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
      } catch (error) {
        this.view = "closed";
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.trivia-play {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 8% 12%, #ffd5d7 0, transparent 36%),
    radial-gradient(circle at 100% 0%, #fff1c9 0, transparent 32%),
    #f6f3f1;
}

.card {
  width: min(560px, 100%);
  background: #fff;
  border-radius: 28px;
  padding: 32px 28px;
  box-shadow: 0 18px 50px rgba(34, 34, 34, 0.08);
}

.eyebrow {
  color: var(--pink);
  font-weight: 700;
  margin-bottom: 8px;
}

h1 {
  font-size: 34px;
  line-height: 1.25;
  margin-bottom: 12px;
}

form,
.answers {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
}

input[type="text"],
input:not([type="file"]) {
  border: 1px solid #eadfdf;
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 18px;
  font-weight: 400;
}

.file-label input {
  font-weight: 400;
}

.go,
.answer {
  border: 0;
  border-radius: 16px;
  padding: 16px 18px;
  font-size: 18px;
  cursor: pointer;
}

.go {
  background: var(--pink);
  color: #fff;
  font-weight: 700;
}

.go:disabled {
  opacity: 0.55;
  cursor: default;
}

.question-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timer {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(var(--pink) calc(var(--progress) * 360deg), #f1e6e6 0);
}

.timer strong {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-items: center;
}

.hint {
  color: var(--dark-gray);
  margin-bottom: 4px;
}

.answer {
  background: #fff;
  border: 1px solid #eadfdf;
  text-align: right;
}

.answer.selected {
  border-color: var(--pink);
  background: #fff5f5;
}

.feedback.good h1 {
  color: var(--green);
}

.feedback:not(.good) h1 {
  color: var(--pink);
}

.result {
  text-align: center;
}

.result img {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}

.score {
  font-size: 56px;
  font-weight: 700;
  color: var(--pink);
  line-height: 1;
  margin: 8px 0 12px;
}
</style>
