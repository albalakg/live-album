<template>
  <div class="trivia-admin">
    <div v-if="!loaded" class="card loading-card">טוען את הטריוויה...</div>

    <template v-else>
      <header class="page-head">
        <div>
          <h1 class="title--large">טריוויה</h1>
          <p class="lede">הגדירו מתי המשחק עולה למסך, כתבו שאלות, ועקבו אחרי הניקוד.</p>
        </div>
        <span class="status" :class="form.status">{{ statusLabel }}</span>
      </header>

      <div class="tabs" role="tablist" aria-label="אזורי טריוויה">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          class="tab"
          role="tab"
          :class="{ active: tab === item.id }"
          :aria-selected="tab === item.id"
          @click="tab = item.id"
        >
          {{ item.label }}
          <span v-if="item.count !== null" class="tab-count">{{ item.count }}</span>
        </button>
      </div>

      <section v-show="tab === 'settings'" class="stack">
        <form class="card" @submit.prevent="saveSettings">
          <div class="enable-row">
            <MainCheckbox :value="form.enabled" @onClick="form.enabled = !form.enabled" />
            <div>
              <p class="title--small">הפעלת טריוויה לאירוע</p>
              <p class="hint">כשהאפשרות כבויה המשחק לא יחליף את התמונות, גם אם הוגדר זמן.</p>
            </div>
          </div>

          <MainInput v-model="form.title" title="כותרת שמוצגת לאורחים" :maxLength="80" />

          <div class="field-grid">
            <label class="field">
              <span class="title--small">מתי להחליף את התמונות</span>
              <VueDatePicker
                v-model="form.starts_at"
                class="date-picker"
                locale="he"
                :format="dateFormat"
                select-text="בחר"
                cancel-text="בטל"
                :day-names="days"
              />
              <span class="hint">המסך עובר לטריוויה בזמן הזה, אם המשחק פעיל.</span>
            </label>
            <label class="field">
              <span class="title--small">מתי להציג את שלושת המקומות הראשונים</span>
              <VueDatePicker
                v-model="form.results_at"
                class="date-picker"
                locale="he"
                :format="dateFormat"
                select-text="בחר"
                cancel-text="בטל"
                :day-names="days"
              />
              <span class="hint">אפשר גם להציג את הפודיום ידנית מהבקרה למטה.</span>
            </label>
          </div>

          <div class="save-row">
            <MainButton text="שמירת הגדרות" color="pink" :loading="savingSettings" />
          </div>
        </form>

        <div class="card">
          <h2 class="title--medium">מה מוצג על המסך</h2>
          <p class="hint">בחרו מה האורחים רואים עכשיו. עריכת שאלות נעולה בזמן שהטריוויה או התוצאות על המסך.</p>
          <div class="modes">
            <button
              type="button"
              class="mode"
              :class="{ active: screenMode === 'photos', busy: actingAction === 'photos' }"
              :disabled="actingAction !== null || screenMode === 'photos'"
              @click="runAction('photos')"
            >
              <span class="mode-title">תמונות</span>
              <span class="mode-text">חזרה לאלבום</span>
            </button>
            <button
              type="button"
              class="mode"
              :class="{ active: screenMode === 'live', busy: actingAction === 'show' }"
              :disabled="actingAction !== null || screenMode === 'live' || !questions.length"
              @click="runAction('show')"
            >
              <span class="mode-title">טריוויה</span>
              <span class="mode-text">השאלות עולות עכשיו</span>
            </button>
            <button
              type="button"
              class="mode"
              :class="{ active: screenMode === 'results', busy: actingAction === 'results' }"
              :disabled="actingAction !== null || screenMode === 'results' || !canShowResults"
              @click="runAction('results')"
            >
              <span class="mode-title">תוצאות</span>
              <span class="mode-text">שלושת המקומות הראשונים</span>
            </button>
          </div>
          <p v-if="!questions.length" class="hint">כדי להעלות את הטריוויה למסך צריך לשמור לפחות שאלה אחת.</p>

          <div class="join">
            <div>
              <p class="title--small">קישור לאורחים</p>
              <p class="hint">האורחים נכנסים מהטלפון, בוחרים כינוי ומצטרפים למשחק.</p>
            </div>
            <div class="join-row">
              <input class="join-input" readonly :value="guestUrl" @focus="selectGuestUrl" />
              <button type="button" class="copy-btn" @click="copyLink">{{ copied ? "הועתק" : "העתקה" }}</button>
            </div>
          </div>
        </div>
      </section>

      <section v-show="tab === 'questions'" class="stack">
        <div class="card questions-card">
          <div class="section-head">
            <div>
              <h2 class="title--medium">שאלות</h2>
              <p class="hint">עד 20 שאלות. לכל שאלה לפחות שתי תשובות, ואחת מהן מסומנת כנכונה.</p>
            </div>
            <button type="button" class="add-btn" :disabled="questionsLocked || questions.length >= 20" @click="addQuestion">
              הוספת שאלה
            </button>
          </div>

          <p v-if="questionsLocked" class="lock-note">
            השאלות נעולות כי הטריוויה על המסך.
            <button type="button" class="inline-link" :disabled="actingAction !== null" @click="runAction('photos')">
              חזרה לתמונות כדי לערוך
            </button>
          </p>

          <div v-if="!questions.length" class="empty">
            <p class="title--medium">עדיין אין שאלות</p>
            <p class="hint">התחילו משאלה קצרה, שתי תשובות, וסמנו מה נכון.</p>
          </div>

          <article
            v-for="(question, questionIndex) in questions"
            :key="question.key"
            class="question"
            :class="{ open: openQuestionKey === question.key, invalid: invalidKeys.includes(question.key) }"
          >
            <div class="question-head" @click="toggleQuestion(question.key)">
              <span class="q-num">{{ questionIndex + 1 }}</span>
              <span class="q-preview">{{ question.prompt.trim() || "שאלה חדשה" }}</span>
              <span class="q-meta">{{ question.time_limit_seconds }} שנ׳</span>
              <div class="row-actions" @click.stop>
                <button type="button" class="icon-btn" aria-label="הזזה למעלה" :disabled="questionsLocked || questionIndex === 0" @click="moveQuestion(questionIndex, -1)">
                  <span class="material-symbols-outlined">keyboard_arrow_up</span>
                </button>
                <button type="button" class="icon-btn" aria-label="הזזה למטה" :disabled="questionsLocked || questionIndex === questions.length - 1" @click="moveQuestion(questionIndex, 1)">
                  <span class="material-symbols-outlined">keyboard_arrow_down</span>
                </button>
                <button type="button" class="icon-btn danger" aria-label="מחיקת שאלה" :disabled="questionsLocked" @click="removeQuestion(questionIndex)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
              <span class="material-symbols-outlined chevron">{{ openQuestionKey === question.key ? "expand_less" : "expand_more" }}</span>
            </div>

            <div v-show="openQuestionKey === question.key" class="question-body">
              <label class="field">
                <span class="title--small">השאלה</span>
                <textarea
                  v-model="question.prompt"
                  :disabled="questionsLocked"
                  maxlength="500"
                  rows="2"
                  placeholder="לדוגמה: איפה נפגשנו לראשונה?"
                  @input="touchQuestion(question.key)"
                ></textarea>
              </label>

              <div class="meta">
                <label>
                  שניות
                  <input v-model.number="question.time_limit_seconds" type="number" min="5" max="120" :disabled="questionsLocked" />
                </label>
                <label>
                  נקודות
                  <input v-model.number="question.max_points" type="number" min="100" max="10000" :disabled="questionsLocked" />
                </label>
              </div>

              <div class="options">
                <div
                  v-for="(option, optionIndex) in question.options"
                  :key="option.key"
                  class="option"
                  :class="{ correct: option.is_correct }"
                >
                  <input
                    v-model="option.label"
                    :disabled="questionsLocked"
                    maxlength="200"
                    placeholder="תשובה"
                    @input="touchQuestion(question.key)"
                  />
                  <button
                    type="button"
                    class="mark"
                    :class="{ on: option.is_correct }"
                    :disabled="questionsLocked"
                    @click="option.is_correct = !option.is_correct; touchQuestion(question.key)"
                  >
                    {{ option.is_correct ? "נכונה" : "סמן כנכונה" }}
                  </button>
                  <button
                    type="button"
                    class="icon-btn"
                    aria-label="מחיקת תשובה"
                    :disabled="questionsLocked || question.options.length <= 2"
                    @click="question.options.splice(optionIndex, 1)"
                  >
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <button type="button" class="text-button" :disabled="questionsLocked || question.options.length >= 6" @click="addOption(question)">
                תשובה נוספת
              </button>
              <p v-if="invalidKeys.includes(question.key)" class="error-note">מלאו את השאלה ואת כל התשובות, וסמנו לפחות תשובה נכונה אחת.</p>
            </div>
          </article>

          <div v-if="questions.length" class="save-row">
            <MainButton text="שמירת שאלות" color="pink" :loading="savingQuestions" :disabled="questionsLocked" @onClick="saveQuestions" />
          </div>
        </div>
      </section>

      <section v-show="tab === 'results'" class="stack">
        <div class="stats" v-if="report">
          <div class="stat">
            <span class="stat-label">שחקנים</span>
            <strong>{{ report.summary.player_count }}</strong>
          </div>
          <div class="stat">
            <span class="stat-label">ממוצע נקודות</span>
            <strong>{{ report.summary.average_score }}</strong>
          </div>
          <div class="stat">
            <span class="stat-label">דיוק ממוצע</span>
            <strong>{{ report.summary.average_accuracy === null ? "—" : percent(report.summary.average_accuracy) }}</strong>
          </div>
        </div>

        <div class="card">
          <div class="section-head">
            <h2 class="title--medium">טבלת ניקוד</h2>
            <button type="button" class="text-button" :disabled="refreshing" @click="loadReport()">
              {{ refreshing ? "מרענן..." : "רענון" }}
            </button>
          </div>

          <div v-if="report && report.players.length" class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>שחקן</th>
                  <th>ניקוד</th>
                  <th>נכונות</th>
                  <th>זמן</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="player in report.players" :key="player.id">
                  <tr class="player-row" :class="{ open: openPlayerId === player.id }" @click="togglePlayer(player.id)">
                    <td><span class="rank" :class="'rank-' + player.rank">{{ player.rank }}</span></td>
                    <td>
                      <div class="player-cell">
                        <img v-if="player.avatar_url" :src="player.avatar_url" alt="" />
                        <span v-else class="avatar-fallback">{{ player.nickname.slice(0, 1) }}</span>
                        {{ player.nickname }}
                      </div>
                    </td>
                    <td>{{ player.score }}</td>
                    <td>{{ player.correct_count }}</td>
                    <td>{{ seconds(player.total_time_ms) }}</td>
                  </tr>
                  <tr v-if="openPlayerId === player.id" class="detail-row">
                    <td colspan="5">
                      <ul class="answers">
                        <li v-for="answer in player.answers" :key="answer.question_id">
                          <span class="chip" :class="answer.is_correct ? 'ok' : 'bad'">{{ answer.is_correct ? "נכון" : "לא נכון" }}</span>
                          <span class="answer-prompt">{{ questionPrompt(answer.question_id) }}</span>
                          <span class="answer-meta">{{ answer.points_awarded }} נק׳ · {{ seconds(answer.elapsed_ms) }}</span>
                        </li>
                      </ul>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div v-else class="empty">
            <p class="title--medium">עדיין אין תוצאות</p>
            <p class="hint">ברגע שאורחים יצטרפו ויענו, הניקוד יופיע כאן.</p>
          </div>
        </div>

        <div v-if="report && report.questions.length" class="card">
          <h2 class="title--medium">קושי השאלות</h2>
          <p class="hint">אחוז התשובות הנכונות. שאלה עם אחוז נמוך הייתה קשה יותר.</p>
          <div class="diff-list">
            <div v-for="question in report.questions" :key="question.id" class="diff-row">
              <div class="diff-top">
                <span>{{ question.prompt }}</span>
                <strong>{{ question.accuracy === null ? "אין תשובות" : percent(question.accuracy) }}</strong>
              </div>
              <div class="bar">
                <span :style="{ width: barWidth(question.accuracy) }" :class="barTone(question.accuracy)"></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import MainButton from "@/components/library/buttons/MainButton.vue";
import MainCheckbox from "@/components/library/inputs/MainCheckbox.vue";
import MainInput from "@/components/library/inputs/MainInput.vue";
import ErrorsHandler from "@/helpers/errorsHandler";
import Time from "@/helpers/time";
import { notify } from "@kyvg/vue3-notification";

interface TriviaOptionForm {
  key: string;
  label: string;
  is_correct: boolean;
}

interface TriviaQuestionForm {
  key: string;
  prompt: string;
  time_limit_seconds: number;
  max_points: number;
  options: TriviaOptionForm[];
}

interface ReportAnswer {
  question_id: number;
  is_correct: boolean;
  points_awarded: number;
  elapsed_ms: number;
}

interface ReportPlayer {
  id: number;
  rank: number;
  nickname: string;
  avatar_url?: string | null;
  score: number;
  correct_count: number;
  total_time_ms: number;
  answers: ReportAnswer[];
}

interface ReportQuestion {
  id: number;
  prompt: string;
  accuracy: number | null;
}

interface TriviaReport {
  summary: {
    player_count: number;
    average_score: number;
    average_accuracy: number | null;
  };
  players: ReportPlayer[];
  questions: ReportQuestion[];
}

let keySeed = 0;
function nextKey(): string {
  keySeed += 1;
  return `q-${keySeed}`;
}

function blankQuestion(): TriviaQuestionForm {
  return {
    key: nextKey(),
    prompt: "",
    time_limit_seconds: 20,
    max_points: 1000,
    options: [
      { key: nextKey(), label: "", is_correct: true },
      { key: nextKey(), label: "", is_correct: false },
    ],
  };
}

export default defineComponent({
  name: "EventTriviaView",

  components: { MainButton, MainCheckbox, MainInput },

  data() {
    return {
      loaded: false,
      savingSettings: false,
      savingQuestions: false,
      actingAction: null as "show" | "results" | "photos" | null,
      refreshing: false,
      copied: false,
      copyTimer: null as ReturnType<typeof setTimeout> | null,
      tab: "settings" as "settings" | "questions" | "results",
      openQuestionKey: null as string | null,
      invalidKeys: [] as string[],
      openPlayerId: null as number | null,
      form: {
        enabled: false,
        status: "draft",
        title: "טריוויה",
        starts_at: null as Date | null,
        results_at: null as Date | null,
        join_path: "",
      },
      questions: [] as TriviaQuestionForm[],
      report: null as TriviaReport | null,
      days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
    };
  },

  computed: {
    eventId(): number {
      return this.$store.getters["event/getEvent"]?.id;
    },

    questionsLocked(): boolean {
      return this.form.status === "live" || this.form.status === "results";
    },

    screenMode(): "photos" | "live" | "results" {
      if (this.form.status === "live") return "live";
      if (this.form.status === "results") return "results";
      return "photos";
    },

    canShowResults(): boolean {
      return this.form.status === "live" || this.form.status === "results";
    },

    guestUrl(): string {
      const path = this.form.join_path || `/event/trivia/${this.$store.getters["event/getEventPath"]}`;
      return window.location.origin + path;
    },

    statusLabel(): string {
      const labels: Record<string, string> = {
        draft: "טיוטה",
        scheduled: "מתוזמן",
        live: "על המסך",
        results: "תוצאות על המסך",
      };
      return labels[this.form.status] || "טיוטה";
    },

    tabs(): { id: "settings" | "questions" | "results"; label: string; count: number | null }[] {
      return [
        { id: "settings", label: "הגדרות", count: null },
        { id: "questions", label: "שאלות", count: this.questions.length },
        { id: "results", label: "תוצאות", count: this.report?.summary.player_count ?? 0 },
      ];
    },
  },

  created() {
    this.load();
  },

  beforeUnmount() {
    if (this.copyTimer) clearTimeout(this.copyTimer);
  },

  methods: {
    dateFormat(date: Date): string {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
    },

    fail(error: unknown, fallback: string) {
      notify({
        text: ErrorsHandler.getErrorMessage(error, fallback),
        type: "error",
        duration: 5000,
      });
    },

    applyGame(data: any) {
      this.form.enabled = !!data.enabled;
      this.form.status = data.status || "draft";
      this.form.title = data.title || "טריוויה";
      this.form.starts_at = data.starts_at ? new Date(data.starts_at) : null;
      this.form.results_at = data.results_at ? new Date(data.results_at) : null;
      this.form.join_path = data.join_path || "";
      const openIndex = this.questions.findIndex((question) => question.key === this.openQuestionKey);
      this.questions = (data.questions || []).map((question: any) => ({
        key: nextKey(),
        prompt: question.prompt,
        time_limit_seconds: question.time_limit_seconds,
        max_points: question.max_points,
        options: (question.options || []).map((option: any) => ({
          key: nextKey(),
          label: option.label,
          is_correct: !!option.is_correct,
        })),
      }));
      this.openQuestionKey = openIndex >= 0 && this.questions[openIndex]
        ? this.questions[openIndex].key
        : null;
      this.invalidKeys = [];
    },

    async load() {
      try {
        const [game, report] = await Promise.all([
          axios.get(`events/${this.eventId}/trivia/admin`),
          axios.get(`events/${this.eventId}/trivia/admin/report`),
        ]);
        this.applyGame(game.data.data);
        this.report = report.data.data;
      } catch (error) {
        this.fail(error, "לא הצלחנו לטעון את הטריוויה");
      } finally {
        this.loaded = true;
      }
    },

    async loadReport(silent = false) {
      if (!silent) this.refreshing = true;
      try {
        const report = await axios.get(`events/${this.eventId}/trivia/admin/report`);
        this.report = report.data.data;
      } catch (error) {
        this.fail(error, "לא הצלחנו לטעון תוצאות");
      } finally {
        if (!silent) this.refreshing = false;
      }
    },

    async saveSettings() {
      this.savingSettings = true;
      try {
        const res = await axios.put(`events/${this.eventId}/trivia/admin`, {
          enabled: this.form.enabled,
          title: this.form.title || "טריוויה",
          starts_at: this.form.starts_at ? Time.toUTC(this.form.starts_at) : null,
          results_at: this.form.results_at ? Time.toUTC(this.form.results_at) : null,
        });
        this.applyGame(res.data.data);
        notify({ text: "ההגדרות נשמרו", type: "success", duration: 3000 });
      } catch (error) {
        this.fail(error, "לא הצלחנו לשמור את ההגדרות");
      } finally {
        this.savingSettings = false;
      }
    },

    addQuestion() {
      if (this.questions.length >= 20 || this.questionsLocked) return;
      const question = blankQuestion();
      this.questions.push(question);
      this.openQuestionKey = question.key;
    },

    removeQuestion(index: number) {
      if (this.questionsLocked) return;
      if (!window.confirm("למחוק את השאלה?")) return;
      const [removed] = this.questions.splice(index, 1);
      if (removed && this.openQuestionKey === removed.key) {
        this.openQuestionKey = null;
      }
    },

    toggleQuestion(key: string) {
      this.openQuestionKey = this.openQuestionKey === key ? null : key;
    },

    touchQuestion(key: string) {
      this.invalidKeys = this.invalidKeys.filter((item) => item !== key);
    },

    addOption(question: TriviaQuestionForm) {
      if (question.options.length >= 6) return;
      question.options.push({ key: nextKey(), label: "", is_correct: false });
    },

    moveQuestion(index: number, direction: number) {
      const next = index + direction;
      const copy = [...this.questions];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      this.questions = copy;
    },

    async saveQuestions() {
      const invalid = this.questions
        .filter((question) => {
          const incomplete = !question.prompt.trim() || question.options.some((option) => !option.label.trim());
          const missingCorrect = !question.options.some((option) => option.is_correct);
          return incomplete || missingCorrect;
        })
        .map((question) => question.key);

      if (invalid.length) {
        this.invalidKeys = invalid;
        this.openQuestionKey = invalid[0];
        notify({ text: "מלאו את כל השאלות והתשובות, וסמנו תשובה נכונה", type: "error", duration: 4000 });
        return;
      }

      this.savingQuestions = true;
      try {
        const res = await axios.put(`events/${this.eventId}/trivia/admin/questions`, {
          questions: this.questions.map((question) => ({
            prompt: question.prompt.trim(),
            time_limit_seconds: question.time_limit_seconds,
            max_points: question.max_points,
            options: question.options.map((option) => ({
              label: option.label.trim(),
              is_correct: option.is_correct,
            })),
          })),
        });
        this.applyGame(res.data.data);
        notify({ text: "השאלות נשמרו", type: "success", duration: 3000 });
      } catch (error) {
        this.fail(error, "לא הצלחנו לשמור את השאלות");
      } finally {
        this.savingQuestions = false;
      }
    },

    async runAction(action: "show" | "results" | "photos") {
      this.actingAction = action;
      try {
        const res = await axios.post(`events/${this.eventId}/trivia/admin/${action}`);
        this.applyGame(res.data.data);
        await this.loadReport(true);
      } catch (error) {
        this.fail(error, "הפעולה לא הושלמה");
      } finally {
        this.actingAction = null;
      }
    },

    selectGuestUrl(event: FocusEvent) {
      const input = event.target as HTMLInputElement | null;
      input?.select();
    },

    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.guestUrl);
        this.copied = true;
        if (this.copyTimer) clearTimeout(this.copyTimer);
        this.copyTimer = setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch {
        notify({ text: "לא הצלחנו להעתיק. סמנו את הקישור ידנית.", type: "error", duration: 4000 });
      }
    },

    togglePlayer(id: number) {
      this.openPlayerId = this.openPlayerId === id ? null : id;
    },

    questionPrompt(id: number): string {
      return this.report?.questions.find((question) => question.id === id)?.prompt || `שאלה ${id}`;
    },

    seconds(ms: number): string {
      return `${(ms / 1000).toFixed(1)} שנ׳`;
    },

    percent(value: number): string {
      return `${Math.round(value * 100)}%`;
    },

    barWidth(accuracy: number | null): string {
      if (accuracy === null) return "0%";
      return `${Math.round(accuracy * 100)}%`;
    },

    barTone(accuracy: number | null): string {
      if (accuracy === null) return "none";
      if (accuracy >= 0.7) return "easy";
      if (accuracy >= 0.4) return "mid";
      return "hard";
    },
  },
});
</script>

<style lang="scss" scoped>
.trivia-admin {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.lede,
.hint {
  color: var(--dark-gray);
  font-size: 14px;
  line-height: 1.5;
}

.lede {
  margin-top: 4px;
}

.status {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
}

.status.scheduled {
  background: #fff4d6;
}

.status.live {
  background: #ffe1e3;
  color: #b4232c;
}

.status.results {
  background: #e5f3dc;
  color: #2f6b22;
}

.tabs {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: #fff;
  border-radius: 16px;
}

.tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  background: transparent;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  color: var(--dark-gray);
}

.tab.active {
  background: var(--pink);
  color: #fff;
}

.tab-count {
  min-width: 22px;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  font-size: 12px;
}

.tab.active .tab-count {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-card {
  color: var(--dark-gray);
}

.enable-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-picker {
  width: 100%;
}

.date-picker :deep(.dp__input) {
  border: 1px solid #eadfdf;
  border-radius: 12px;
  font: inherit;
  min-height: 44px;
}

.save-row :deep(.main-button) {
  width: auto;
  min-width: 180px;
}

.modes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mode {
  text-align: right;
  border: 1px solid #eadfdf;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  font: inherit;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mode.active {
  border-color: var(--pink);
  background: #fff6f6;
  box-shadow: inset 0 0 0 1px var(--pink);
}

.mode:disabled {
  cursor: default;
  opacity: 0.72;
}

.mode.active:disabled {
  opacity: 1;
}

.mode.busy {
  opacity: 0.6;
}

.mode-title {
  font-weight: 700;
}

.mode-text {
  color: var(--dark-gray);
  font-size: 13px;
}

.join {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
  border-top: 1px solid #f3ecec;
}

.join-row {
  display: flex;
  gap: 8px;
}

.join-input,
textarea,
.option input,
.meta input {
  width: 100%;
  border: 1px solid #eadfdf;
  border-radius: 12px;
  padding: 10px 12px;
  box-sizing: border-box;
  font: inherit;
  background: #fff;
  color: var(--dark);
}

.join-input {
  direction: ltr;
  text-align: left;
}

.copy-btn,
.add-btn,
.text-button,
.mark,
.inline-link {
  border: 0;
  background: none;
  color: var(--pink);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.copy-btn,
.add-btn {
  background: var(--pink);
  color: #fff;
  border-radius: 12px;
  padding: 10px 16px;
  white-space: nowrap;
}

.copy-btn:disabled,
.add-btn:disabled,
.text-button:disabled,
.mark:disabled,
.inline-link:disabled,
.icon-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.lock-note {
  background: #fff6f6;
  border-radius: 12px;
  padding: 10px 12px;
  color: #9a3036;
}

.inline-link {
  margin-right: 6px;
}

.empty {
  text-align: center;
  padding: 28px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.question {
  border: 1px solid #f0e6e6;
  border-radius: 14px;
  overflow: hidden;
}

.question.invalid {
  border-color: var(--pink);
}

.question-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
  background: #fff;
}

.question.open .question-head {
  background: #fffafa;
}

.q-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gray);
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
}

.q-preview {
  flex: 1;
  min-width: 0;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.q-meta {
  color: var(--dark-gray);
  font-size: 13px;
  flex-shrink: 0;
}

.chevron {
  color: var(--dark-gray);
}

.question-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 12px 14px;
}

.meta,
.option,
.row-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.meta label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dark-gray);
}

.meta input {
  width: 88px;
}

.option {
  border: 1px solid #eadfdf;
  border-radius: 12px;
  padding: 6px;
  background: #fff;
}

.option.correct {
  border-color: var(--green);
  background: #f4faf1;
}

.option input {
  border: 0;
  padding: 8px;
}

.mark {
  border-radius: 999px;
  padding: 6px 10px;
  background: var(--gray);
  color: var(--dark-gray);
  white-space: nowrap;
}

.mark.on {
  background: #e5f3dc;
  color: #2f6b22;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: var(--gray);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}

.icon-btn .material-symbols-outlined,
.chevron {
  font-size: 20px;
}

.icon-btn.danger {
  color: #b4232c;
}

.error-note {
  color: #b4232c;
  font-size: 13px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat {
  background: #fff;
  border-radius: 16px;
  padding: 16px 18px;
}

.stat-label {
  color: var(--dark-gray);
  font-size: 13px;
}

.stat strong {
  display: block;
  margin-top: 4px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: right;
  padding: 10px 8px;
  border-bottom: 1px solid #f3ecec;
  vertical-align: middle;
}

th {
  color: var(--dark-gray);
  font-size: 13px;
  font-weight: 700;
}

.player-row {
  cursor: pointer;
}

.player-row:hover,
.player-row.open {
  background: #fffafa;
}

.rank {
  display: inline-grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--gray);
  font-weight: 700;
  font-size: 13px;
}

.rank-1 {
  background: #ffe08a;
}

.rank-2 {
  background: #ececec;
}

.rank-3 {
  background: #f3d2b5;
}

.player-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-cell img,
.avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-fallback {
  display: grid;
  place-items: center;
  background: #ffe1e3;
  font-weight: 700;
}

.detail-row td {
  background: #fafafa;
}

.answers {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answers li {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.answer-prompt {
  flex: 1;
  min-width: 140px;
}

.answer-meta {
  color: var(--dark-gray);
  font-size: 13px;
}

.chip {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 700;
}

.chip.ok {
  background: #e5f3dc;
  color: #2f6b22;
}

.chip.bad {
  background: #ffe1e3;
  color: #b4232c;
}

.diff-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.diff-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.bar {
  height: 8px;
  border-radius: 99px;
  background: var(--gray);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.bar .easy {
  background: var(--green);
}

.bar .mid {
  background: #e2b340;
}

.bar .hard {
  background: var(--pink);
}

@media (max-width: 720px) {
  .field-grid,
  .modes,
  .stats {
    grid-template-columns: 1fr;
  }

  .page-head,
  .section-head,
  .join-row {
    flex-direction: column;
  }

  .q-meta {
    display: none;
  }

  .save-row :deep(.main-button),
  .add-btn,
  .copy-btn {
    width: 100%;
  }
}
</style>
