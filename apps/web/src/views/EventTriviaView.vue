<template>
  <div class="trivia-builder" dir="rtl" lang="he">
    <div v-if="!loaded && !loadError" class="tb-loading" role="status">טוען את הטריוויה...</div>

    <div v-else-if="loadError" class="tb-error" role="alert">
      <h2>לא הצלחנו לטעון את הטריוויה</h2>
      <p>{{ loadError }}</p>
      <button type="button" class="tb-btn tb-btn-primary" :disabled="loading" @click="load">
        {{ loading ? "טוען..." : "נסו שוב" }}
      </button>
    </div>

    <div v-else-if="showEntry && $route.query.empty === '1'" class="tb-entry empty">
      <h1>טריוויה</h1>
      <div class="tb-entry-card">
        <h2>עוד אין טריוויה לאירוע</h2>
        <p>צרו משחק קצר שהאורחים ישחקו מהטלפון.</p>
        <button type="button" class="tb-btn tb-btn-primary" @click="openBuilder">יצירת טריוויה</button>
      </div>
    </div>

    <div v-else-if="showEntry" class="tb-entry">
      <header class="tb-page-head">
        <div>
          <h1>טריוויה</h1>
          <p class="tb-lede">דלת כניסה לבונה המאושר. כאן רואים סיכום ופותחים את העריכה המלאה.</p>
        </div>
      </header>
      <div class="tb-entry-card">
        <h2>{{ game.title || "טריוויה לאירוע" }}</h2>
        <p>{{ questions.length }} שאלות · {{ statusLabel }} · ערכת {{ game.theme || "elegant" }}</p>
        <div class="tb-entry-actions">
          <button type="button" class="tb-btn tb-btn-primary" @click="openBuilder">פתיחת הבונה</button>
          <button type="button" class="tb-btn tb-btn-ghost" @click="togglePreview">תצוגה מקדימה</button>
        </div>
      </div>
    </div>

    <template v-else-if="loaded">
      <header class="tb-page-head">
        <div>
          <h1>טריוויה</h1>
          <p class="tb-lede">
            בונים את המשחק בדקות. האורחים עונים מהטלפון, בלי אפליקציה, והמסך הגדול באירוע הוא הכוכב.
          </p>
          <span class="tb-focus-tag">מצב מיקוד</span>
        </div>
        <div class="tb-head-actions">
          <span class="tb-status-pill" :class="savePillClass">
            <i></i> {{ savePillLabel }}
          </span>
          <span class="tb-status-pill" :class="statusPillClass">
            <i></i> {{ statusLabel }}
          </span>
          <button type="button" class="tb-btn tb-btn-ghost" @click="templatesOpen = true">תבניות</button>
          <button type="button" class="tb-btn tb-btn-ghost" @click="togglePreview">
            {{ previewOpen ? "סגירת תצוגה" : "תצוגה חיה" }}
          </button>
          <button type="button" class="tb-btn tb-btn-ghost" @click="openDryRun">ניסוי</button>
          <button
            type="button"
            class="tb-btn tb-btn-primary"
            :disabled="acting || !questions.length"
            @click="goLive"
          >הפעלה על המסך</button>
        </div>
      </header>

      <div class="tb-tabs" role="tablist" aria-label="אזורי טריוויה">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          class="tb-tab"
          role="tab"
          :class="{ on: tab === item.id }"
          :aria-selected="tab === item.id"
          @click="setTab(item.id)"
        >{{ item.label }}</button>
      </div>

      <TriviaHostRemote
        :visible="isLive"
        :busy="acting"
        :has-questions="questions.length > 0"
        :current-phase="game.current_phase"
        @phase="setLivePhase"
        @photos="runPhotos"
      />

      <p v-if="questionsLocked && tab === 'build'" class="tb-lock-note">
        השאלות נעולות כי הטריוויה על המסך.
        <button type="button" :disabled="acting" @click="runPhotos">חזרה לתמונות כדי לערוך</button>
      </p>

      <div v-show="tab === 'build'" class="tb-mob-tabs">
        <button type="button" :class="{ on: mobPane === 'list' }" @click="mobPane = 'list'">שאלות</button>
        <button type="button" :class="{ on: mobPane === 'edit' }" @click="mobPane = 'edit'">עריכה</button>
        <button type="button" :class="{ on: mobPane === 'preview' }" @click="openPreviewFromMobile">תצוגה</button>
      </div>

      <div v-show="tab === 'build'" class="tb-workspace">
        <TriviaQuestionList
          :questions="questions"
          :selected-index="selectedIndex"
          :locked="questionsLocked"
          :cap="questionCap"
          :mob-on="mobPane === 'list'"
          @select="selectQuestion"
          @add="openGalleryForAdd"
          @reorder="onReorder"
          @open-templates="templatesOpen = true"
        />
        <TriviaQuestionEditor
          :question="selectedQuestion"
          :locked="questionsLocked"
          :at-cap="questions.length >= questionCap"
          :mob-on="mobPane === 'edit'"
          :album-photos="albumPhotos"
          @update="onQuestionUpdate"
          @change-type="openGalleryForChange"
          @duplicate="duplicateQuestion"
          @delete="deleteQuestion"
        />
      </div>

      <TriviaThemeGrid
        v-show="tab === 'theme'"
        :theme="game.theme"
        @select="onThemeSelect"
      />

      <TriviaSettingsPanel
        v-show="tab === 'settings'"
        :game="game"
        :guest-url="guestUrl"
        :copied="copied"
        @patch="onSettingsPatch"
        @copy-link="copyLink"
      />

      <TriviaReportPanel
        v-show="tab === 'results'"
        :report="report"
        :refreshing="refreshing"
        :team-labels="game.team_labels"
        @refresh="loadReport()"
      />

      <TriviaTypeGallery
        :open="galleryOpen"
        :mode="galleryMode"
        @close="galleryOpen = false"
        @pick="onTypePicked"
      />

      <TriviaTemplatesModal
        :open="templatesOpen"
        :busy="templateBusy"
        @close="templatesOpen = false"
        @apply="applyTemplate"
      />

      <TriviaPreviewDrawer
        :open="previewOpen"
        :screen="previewScreen"
        :phase="previewPhase"
        :theme="previewTheme"
        :event-name="eventName"
        @close="previewOpen = false"
        @phase="previewPhase = $event"
        @theme="previewTheme = $event"
      />

      <!-- Dry-run overlay — no live phase API calls -->
      <teleport to="body">
        <div v-if="dryRunOpen" class="tb-dryrun">
          <div class="tb-dryrun-bar">
            <b>ניסוי · לא משפיע על המסך באירוע</b>
            <button
              v-for="p in dryPhases"
              :key="p.id"
              type="button"
              :class="{ on: previewPhase === p.id }"
              @click="previewPhase = p.id"
            >{{ p.label }}</button>
            <button type="button" @click="dryRunOpen = false">סגירה</button>
          </div>
          <div class="tb-dryrun-stage">
            <EventTriviaPodium
              v-if="previewPhase === 'podium' && previewScreen"
              :screen="previewScreen"
              :event-name="eventName"
            />
            <EventTriviaLiveStage
              v-else-if="previewScreen"
              :screen="previewScreen"
              :event-name="eventName"
            />
          </div>
        </div>
      </teleport>
    </template>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import EventTriviaLiveStage from "@/components/event/EventTriviaLiveStage.vue";
import EventTriviaPodium from "@/components/event/EventTriviaPodium.vue";
import TriviaQuestionList from "@/components/event/trivia/TriviaQuestionList.vue";
import TriviaQuestionEditor from "@/components/event/trivia/TriviaQuestionEditor.vue";
import TriviaTypeGallery from "@/components/event/trivia/TriviaTypeGallery.vue";
import TriviaPreviewDrawer from "@/components/event/trivia/TriviaPreviewDrawer.vue";
import TriviaThemeGrid from "@/components/event/trivia/TriviaThemeGrid.vue";
import TriviaSettingsPanel from "@/components/event/trivia/TriviaSettingsPanel.vue";
import TriviaReportPanel, {
  TriviaReportData,
} from "@/components/event/trivia/TriviaReportPanel.vue";
import TriviaTemplatesModal from "@/components/event/trivia/TriviaTemplatesModal.vue";
import TriviaHostRemote from "@/components/event/trivia/TriviaHostRemote.vue";
import ErrorsHandler from "@/helpers/errorsHandler";
import { notify } from "@/helpers/notify";
import Time from "@/helpers/time";
import { findTriviaTemplate } from "@/helpers/triviaTemplates";
import {
  TriviaScreenPayload,
  TriviaCurrentPhase,
  TRIVIA_QUESTION_CAP,
  defaultConfigForType,
  defaultOptionsForType,
  isUnscoredType,
} from "@/helpers/triviaTypes";
import {
  BuilderTabId,
  MobilePaneId,
  TriviaBuilderGame,
  TriviaBuilderQuestion,
  applyTypeChange,
  blankBuilderQuestion,
  gameFromApi,
  nextBuilderKey,
  questionFromApi,
  questionPayload,
  toPublicQuestion,
} from "@/helpers/triviaBuilder";

const TABS: BuilderTabId[] = ["build", "theme", "settings", "results"];
const AUTOSAVE_MS = 800;

export default defineComponent({
  name: "EventTriviaView",

  components: {
    EventTriviaLiveStage,
    EventTriviaPodium,
    TriviaQuestionList,
    TriviaQuestionEditor,
    TriviaTypeGallery,
    TriviaPreviewDrawer,
    TriviaThemeGrid,
    TriviaSettingsPanel,
    TriviaReportPanel,
    TriviaTemplatesModal,
    TriviaHostRemote,
  },

  data() {
    return {
      loaded: false,
      loading: false,
      loadError: "" as string,
      showEntry: this.$route.query.builder !== "1",
      tab: "build" as BuilderTabId,
      mobPane: "edit" as MobilePaneId,
      questions: [] as TriviaBuilderQuestion[],
      selectedIndex: 0,
      game: {
        enabled: true,
        status: "draft",
        phase: "photos",
        current_phase: "lobby",
        title: "טריוויה",
        theme: "elegant",
        pace: "host",
        teams_mode: "none",
        team_labels: { a: "צד עמית", b: "צד גל" },
        speed_bonus: true,
        prize_text: "",
        reveal_seconds: 6,
        default_time: 20,
        default_points: 1000,
        current_question_id: null,
        starts_at: null,
        results_at: null,
        join_path: "",
        question_cap: TRIVIA_QUESTION_CAP,
      } as TriviaBuilderGame,
      report: null as TriviaReportData | null,
      refreshing: false,
      acting: false,
      templateBusy: false,
      galleryOpen: false,
      galleryMode: "add" as "add" | "change",
      templatesOpen: false,
      previewOpen: false,
      dryRunOpen: false,
      previewPhase: "lobby" as TriviaCurrentPhase | string,
      previewTheme: "elegant",
      saveState: "idle" as "idle" | "pending" | "saving" | "saved" | "error",
      questionSaveTimer: null as ReturnType<typeof setTimeout> | null,
      settingsSaveTimer: null as ReturnType<typeof setTimeout> | null,
      savedClearTimer: null as ReturnType<typeof setTimeout> | null,
      copied: false,
      copyTimer: null as ReturnType<typeof setTimeout> | null,
      suppressAutosave: false,
      dryPhases: [
        { id: "lobby", label: "הצטרפות" },
        { id: "question", label: "שאלה" },
        { id: "reveal", label: "חשיפה" },
        { id: "leaderboard", label: "ניקוד" },
        { id: "podium", label: "פודיום" },
      ],
    };
  },

  computed: {
    eventId(): number {
      return this.$store.getters["event/getEvent"]?.id;
    },
    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
    },
    eventPath(): string {
      return this.$store.getters["event/getEventPath"] || "";
    },
    questionCap(): number {
      return this.game.question_cap || TRIVIA_QUESTION_CAP;
    },
    questionsLocked(): boolean {
      return this.game.status === "live" || this.game.status === "results";
    },
    isLive(): boolean {
      return this.game.status === "live" || this.game.status === "results";
    },
    selectedQuestion(): TriviaBuilderQuestion | null {
      return this.questions[this.selectedIndex] || null;
    },
    guestUrl(): string {
      const path =
        this.game.join_path || `/event/trivia/${this.eventPath}`;
      return window.location.origin + path;
    },
    statusLabel(): string {
      const labels: Record<string, string> = {
        draft: "טיוטה",
        scheduled: "מתוזמן",
        live: "על המסך",
        results: "תוצאות על המסך",
      };
      return labels[this.game.status] || "טיוטה";
    },
    statusPillClass(): string {
      if (this.game.status === "live") return "live";
      return "draft";
    },
    savePillClass(): string {
      if (this.saveState === "saved") return "saved";
      if (this.saveState === "saving" || this.saveState === "pending") return "saving";
      return "draft";
    },
    savePillLabel(): string {
      if (this.saveState === "saving") return "שומר…";
      if (this.saveState === "pending") return "שומר…";
      if (this.saveState === "saved") return "נשמר עכשיו";
      if (this.saveState === "error") return "שמירה נכשלה";
      return "טיוטה";
    },
    tabs(): { id: BuilderTabId; label: string }[] {
      return [
        { id: "build", label: "בנייה" },
        { id: "theme", label: "עיצוב" },
        { id: "settings", label: "הגדרות" },
        { id: "results", label: "תוצאות" },
      ];
    },
    albumPhotos(): { id: number; url: string }[] {
      const assets =
        this.$store.getters["event/getActiveGuestAssets"] ||
        this.$store.getters["event/getEvent"]?.assets ||
        [];
      return (assets as any[])
        .filter((a) => a && (a.type === "image" || !a.type) && (a.fullPath || a.url || a.path))
        .slice(0, 12)
        .map((a) => ({
          id: a.id,
          url: a.fullPath || a.url || a.path,
        }));
    },
    previewScreen(): TriviaScreenPayload | null {
      const q = this.selectedQuestion;
      const phase = this.previewPhase;
      const theme = this.previewTheme || this.game.theme;
      const publicQ = toPublicQuestion(q);
      const sampleTop = [
        { rank: 1, nickname: "נועה", score: 4200, team: "a" },
        { rank: 2, nickname: "יואב", score: 3800, team: "b" },
        { rank: 3, nickname: "מיכל", score: 3100, team: "a" },
      ];
      const joining = [
        { nickname: "נועה" },
        { nickname: "יואב" },
        { nickname: "מיכל" },
        { nickname: "איתי" },
      ];

      if (phase === "podium") {
        return {
          phase: "results",
          current_phase: "podium",
          theme,
          pace: this.game.pace,
          title: this.game.title,
          player_count: 12,
          join_path: this.game.join_path,
          top: sampleTop,
          prize_text: this.game.prize_text || "הפרס: בקבוק יין",
          teams:
            this.game.teams_mode === "sides"
              ? {
                  mode: "sides",
                  labels: this.game.team_labels,
                  scores: { a: 12000, b: 9800 },
                }
              : null,
          server_now: new Date().toISOString(),
          event_name: this.eventName,
        };
      }

      const isReveal = phase === "reveal";
      let question = publicQ;
      if (question && isReveal) {
        question = {
          ...question,
          options: (question.options || []).map((o) => ({
            ...o,
            is_correct: !!o.is_correct,
          })),
        };
      } else if (question) {
        question = {
          ...question,
          options: (question.options || []).map(({ id, label, sort_order }) => ({
            id,
            label,
            sort_order,
          })),
        };
      }

      const tallies =
        isReveal || q?.type === "poll" || q?.type === "thisorthat"
          ? {
              mode: "options" as const,
              total_answers: 24,
              options: (question?.options || []).map((o, i) => ({
                option_id: o.id || i + 1,
                count: [10, 8, 4, 2][i] || 1,
                percent: [42, 33, 17, 8][i] || 5,
              })),
            }
          : null;

      return {
        phase: "live",
        current_phase: phase,
        theme,
        pace: this.game.pace,
        title: this.game.title,
        player_count: 12,
        join_path: this.game.join_path,
        top: sampleTop,
        joining: phase === "lobby" ? joining : undefined,
        teams:
          this.game.teams_mode === "sides"
            ? {
                mode: "sides",
                labels: this.game.team_labels,
                scores: { a: 4200, b: 3800 },
              }
            : null,
        prize_text: this.game.prize_text,
        question: phase === "lobby" || phase === "leaderboard" ? null : question,
        tallies: isReveal || q?.type === "poll" || q?.type === "thisorthat" ? tallies : null,
        fun_fact: isReveal ? q?.fun_fact || null : null,
        correct: isReveal
          ? {
              option_ids: (q?.options || [])
                .map((o, i) => (o.is_correct ? o.id ?? i + 1 : null))
                .filter((x): x is number => x != null),
              number:
                q?.type === "number"
                  ? Number((q.config as any)?.correct ?? 0)
                  : undefined,
            }
          : null,
        server_now: new Date().toISOString(),
        event_name: this.eventName,
      };
    },
  },

  watch: {
    "$route.query.tab": {
      immediate: true,
      handler(value: unknown) {
        const raw = Array.isArray(value) ? value[0] : value;
        const next = typeof raw === "string" ? raw : "";
        const map: Record<string, BuilderTabId> = {
          build: "build",
          theme: "theme",
          settings: "settings",
          results: "results",
          questions: "build",
        };
        this.tab = map[next] || "build";
      },
    },
  },

  created() {
    this.load();
  },

  beforeUnmount() {
    if (this.questionSaveTimer) clearTimeout(this.questionSaveTimer);
    if (this.settingsSaveTimer) clearTimeout(this.settingsSaveTimer);
    if (this.savedClearTimer) clearTimeout(this.savedClearTimer);
    if (this.copyTimer) clearTimeout(this.copyTimer);
  },

  methods: {
    openBuilder() {
      this.showEntry = false;
      if (this.$route.query.builder !== "1") {
        this.$router.replace({
          query: { ...this.$route.query, builder: "1" },
        });
      }
    },

    setTab(id: BuilderTabId) {
      this.tab = id;
      const query = { ...this.$route.query } as Record<string, unknown>;
      if (id === "build") delete query.tab;
      else query.tab = id;
      this.$router.replace({ query: query as never }).catch(() => undefined);
      if (id === "results") this.loadReport(true);
    },

    fail(error: unknown, fallback: string) {
      notify({
        text: ErrorsHandler.getErrorMessage(error, fallback),
        type: "error",
        duration: 5000,
      });
    },

    markSaved() {
      this.saveState = "saved";
      if (this.savedClearTimer) clearTimeout(this.savedClearTimer);
      this.savedClearTimer = setTimeout(() => {
        if (this.saveState === "saved") this.saveState = "idle";
      }, 2500);
    },

    applyAdminPayload(data: any, keepSelection = true) {
      this.suppressAutosave = true;
      const prevId = keepSelection ? this.selectedQuestion?.id : null;
      const prevKey = keepSelection ? this.selectedQuestion?.key : null;
      this.game = gameFromApi(data);
      this.previewTheme = this.game.theme;
      this.questions = (data.questions || []).map(questionFromApi);
      if (!this.questions.length) {
        this.selectedIndex = 0;
      } else if (prevId != null) {
        const idx = this.questions.findIndex((q) => q.id === prevId);
        this.selectedIndex = idx >= 0 ? idx : 0;
      } else if (prevKey) {
        const idx = this.questions.findIndex((q) => q.key === prevKey);
        this.selectedIndex = idx >= 0 ? idx : Math.min(this.selectedIndex, this.questions.length - 1);
      } else {
        this.selectedIndex = Math.min(this.selectedIndex, this.questions.length - 1);
      }
      this.$nextTick(() => {
        this.suppressAutosave = false;
      });
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const game = await axios.get(`events/${this.eventId}/trivia/admin`);
        this.applyAdminPayload(game.data.data, false);
        this.loaded = true;
        try {
          const report = await axios.get(`events/${this.eventId}/trivia/admin/report`);
          this.report = report.data.data;
        } catch {
          this.report = null;
        }
      } catch (error) {
        this.loadError = ErrorsHandler.getErrorMessage(error, "לא הצלחנו לטעון את הטריוויה");
        this.fail(error, "לא הצלחנו לטעון את הטריוויה");
        this.loaded = false;
      } finally {
        this.loading = false;
      }
    },

    async loadReport(silent = false) {
      if (!silent) this.refreshing = true;
      try {
        const report = await axios.get(`events/${this.eventId}/trivia/admin/report`);
        this.report = report.data.data;
      } catch (error) {
        if (!silent) this.fail(error, "לא הצלחנו לטעון תוצאות");
      } finally {
        if (!silent) this.refreshing = false;
      }
    },

    selectQuestion(index: number) {
      this.selectedIndex = index;
      this.mobPane = "edit";
    },

    scheduleQuestionSave() {
      if (this.suppressAutosave || this.questionsLocked) return;
      const q = this.selectedQuestion;
      if (!q?.id) return;
      this.saveState = "pending";
      if (this.questionSaveTimer) clearTimeout(this.questionSaveTimer);
      this.questionSaveTimer = setTimeout(() => {
        this.patchQuestion(q);
      }, AUTOSAVE_MS);
    },

    async patchQuestion(q: TriviaBuilderQuestion) {
      if (!q.id || this.questionsLocked) return;
      this.saveState = "saving";
      try {
        const res = await axios.patch(
          `events/${this.eventId}/trivia/admin/questions/${q.id}`,
          questionPayload(q)
        );
        this.applyAdminPayload(res.data.data);
        this.markSaved();
      } catch (error) {
        this.saveState = "error";
        this.fail(error, "לא הצלחנו לשמור את השאלה");
      }
    },

    onQuestionUpdate(next: TriviaBuilderQuestion) {
      const idx = this.questions.findIndex((q) => q.key === next.key);
      if (idx < 0) return;
      this.questions.splice(idx, 1, next);
      this.scheduleQuestionSave();
    },

    scheduleSettingsSave() {
      if (this.suppressAutosave) return;
      this.saveState = "pending";
      if (this.settingsSaveTimer) clearTimeout(this.settingsSaveTimer);
      this.settingsSaveTimer = setTimeout(() => {
        this.saveSettings();
      }, AUTOSAVE_MS);
    },

    async saveSettings() {
      this.saveState = "saving";
      try {
        const res = await axios.put(`events/${this.eventId}/trivia/admin`, {
          enabled: this.game.enabled,
          title: this.game.title || "טריוויה",
          starts_at: this.game.starts_at ? Time.toUTC(this.game.starts_at) : null,
          results_at: this.game.results_at ? Time.toUTC(this.game.results_at) : null,
          theme: this.game.theme,
          pace: this.game.pace,
          teams_mode: this.game.teams_mode,
          team_labels: this.game.team_labels,
          speed_bonus: this.game.speed_bonus,
          prize_text: this.game.prize_text || null,
          reveal_seconds: this.game.reveal_seconds,
          default_time: this.game.default_time,
          default_points: this.game.default_points,
        });
        this.applyAdminPayload(res.data.data);
        this.markSaved();
      } catch (error) {
        this.saveState = "error";
        this.fail(error, "לא הצלחנו לשמור את ההגדרות");
      }
    },

    onSettingsPatch(partial: Partial<TriviaBuilderGame>) {
      this.game = { ...this.game, ...partial } as TriviaBuilderGame;
      this.scheduleSettingsSave();
    },

    onThemeSelect(id: string) {
      this.game.theme = id;
      this.previewTheme = id;
      this.scheduleSettingsSave();
    },

    openGalleryForAdd() {
      if (this.questionsLocked) return;
      if (this.questions.length >= this.questionCap) {
        notify({
          text: `אפשר עד ${this.questionCap} שאלות`,
          type: "error",
          duration: 4000,
        });
        return;
      }
      this.galleryMode = "add";
      this.galleryOpen = true;
    },

    openGalleryForChange() {
      if (this.questionsLocked || !this.selectedQuestion) return;
      this.galleryMode = "change";
      this.galleryOpen = true;
    },

    async onTypePicked(typeId: string) {
      this.galleryOpen = false;
      if (this.galleryMode === "add") {
        await this.addQuestion(typeId);
        return;
      }
      const q = this.selectedQuestion;
      if (!q) return;
      if (q.type === typeId) return;
      const losesData =
        q.options.some((o) => o.label.trim()) ||
        q.type === "number" ||
        q.type === "photo";
      if (losesData && !window.confirm("להחליף סוג? נתונים ספציפיים לסוג עלולים להימחק.")) {
        return;
      }
      const next = applyTypeChange(q, typeId);
      this.onQuestionUpdate(next);
    },

    async addQuestion(type: string) {
      if (this.questionsLocked) return;
      if (this.questions.length >= this.questionCap) {
        notify({
          text: `אפשר עד ${this.questionCap} שאלות`,
          type: "error",
          duration: 4000,
        });
        return;
      }
      const draft = blankBuilderQuestion(type, {
        time: this.game.default_time,
        points: this.game.default_points,
      });
      this.saveState = "saving";
      try {
        const res = await axios.post(
          `events/${this.eventId}/trivia/admin/questions`,
          questionPayload(draft)
        );
        this.applyAdminPayload(res.data.data, false);
        this.selectedIndex = this.questions.length - 1;
        this.mobPane = "edit";
        this.markSaved();
      } catch (error) {
        this.saveState = "error";
        this.fail(error, "לא הצלחנו להוסיף שאלה");
      }
    },

    async duplicateQuestion() {
      const q = this.selectedQuestion;
      if (!q || this.questionsLocked) return;
      if (this.questions.length >= this.questionCap) {
        notify({
          text: `אפשר עד ${this.questionCap} שאלות`,
          type: "error",
          duration: 4000,
        });
        return;
      }
      const copy: TriviaBuilderQuestion = {
        ...q,
        key: nextBuilderKey("q"),
        id: undefined,
        prompt: q.prompt ? `${q.prompt} (העתק)` : "",
        options: q.options.map((o) => ({
          ...o,
          key: nextBuilderKey("o"),
          id: undefined,
        })),
        config: q.config ? { ...q.config } : null,
      };
      this.saveState = "saving";
      try {
        const res = await axios.post(
          `events/${this.eventId}/trivia/admin/questions`,
          questionPayload(copy)
        );
        this.applyAdminPayload(res.data.data, false);
        this.selectedIndex = this.questions.length - 1;
        this.markSaved();
      } catch (error) {
        this.saveState = "error";
        this.fail(error, "לא הצלחנו לשכפל");
      }
    },

    async deleteQuestion() {
      const q = this.selectedQuestion;
      if (!q || this.questionsLocked) return;
      if (!window.confirm("למחוק את השאלה?")) return;
      if (!q.id) {
        this.questions.splice(this.selectedIndex, 1);
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        return;
      }
      this.saveState = "saving";
      try {
        const res = await axios.delete(
          `events/${this.eventId}/trivia/admin/questions/${q.id}`
        );
        this.applyAdminPayload(res.data.data, false);
        this.markSaved();
      } catch (error) {
        this.saveState = "error";
        this.fail(error, "לא הצלחנו למחוק");
      }
    },

    async onReorder(payload: { from: number; to: number }) {
      if (this.questionsLocked) return;
      const { from, to } = payload;
      const copy = [...this.questions];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      this.questions = copy;
      this.selectedIndex = to;
      const ids = copy.map((q) => q.id).filter((id): id is number => !!id);
      if (ids.length !== copy.length) return;
      this.saveState = "saving";
      try {
        const res = await axios.put(
          `events/${this.eventId}/trivia/admin/questions/reorder`,
          { ids }
        );
        this.applyAdminPayload(res.data.data);
        this.markSaved();
      } catch (error) {
        this.saveState = "error";
        this.fail(error, "לא הצלחנו לסדר מחדש");
        this.load();
      }
    },

    async applyTemplate(templateId: string) {
      if (this.questionsLocked) {
        notify({
          text: "אי אפשר להחליף שאלות בזמן שהטריוויה על המסך",
          type: "error",
          duration: 4000,
        });
        return;
      }
      const pack = findTriviaTemplate(templateId);
      if (!pack) return;

      const replace =
        this.questions.length === 0
          ? false
          : window.confirm(
              "יש כבר שאלות. להחליף אותן בתבנית? הניקוד של שחקנים קודמים יאופס."
            );
      if (this.questions.length > 0 && !replace) return;

      this.templateBusy = true;
      this.saveState = "saving";
      try {
        if (pack.backend_id) {
          const res = await axios.post(
            `events/${this.eventId}/trivia/admin/from-template`,
            { template_id: pack.backend_id, replace: this.questions.length > 0 }
          );
          this.applyAdminPayload(res.data.data, false);
        } else {
          const questions = pack.questions.map((tq) => {
            const type = tq.type;
            const opts =
              tq.options ||
              defaultOptionsForType(type).map((o) => ({
                label: o.label,
                is_correct: o.is_correct,
              }));
            return {
              type,
              prompt: tq.prompt,
              time_limit_seconds: tq.time_limit_seconds ?? this.game.default_time,
              max_points: isUnscoredType(type)
                ? 0
                : tq.max_points ?? this.game.default_points,
              fun_fact: tq.fun_fact ?? null,
              media_asset_id: tq.media_asset_id ?? null,
              config: tq.config ?? defaultConfigForType(type),
              options: opts,
            };
          });
          if (pack.game) {
            await axios.put(`events/${this.eventId}/trivia/admin`, {
              enabled: true,
              title: pack.game.title || this.game.title,
              theme: pack.game.theme || this.game.theme,
              pace: pack.game.pace || this.game.pace,
              teams_mode: pack.game.teams_mode || this.game.teams_mode,
              team_labels: pack.game.team_labels || this.game.team_labels,
              prize_text: pack.game.prize_text ?? this.game.prize_text,
              speed_bonus: this.game.speed_bonus,
              reveal_seconds: this.game.reveal_seconds,
              default_time: this.game.default_time,
              default_points: this.game.default_points,
              starts_at: this.game.starts_at ? Time.toUTC(this.game.starts_at) : null,
              results_at: this.game.results_at ? Time.toUTC(this.game.results_at) : null,
            });
          }
          const res = await axios.put(
            `events/${this.eventId}/trivia/admin/questions`,
            { questions }
          );
          this.applyAdminPayload(res.data.data, false);
        }
        this.templatesOpen = false;
        this.tab = "build";
        this.markSaved();
        notify({ text: "התבנית הוחלה", type: "success", duration: 3000 });
      } catch (error) {
        this.saveState = "error";
        this.fail(error, "לא הצלחנו להחיל תבנית");
      } finally {
        this.templateBusy = false;
      }
    },

    togglePreview() {
      this.previewOpen = !this.previewOpen;
      if (this.previewOpen) {
        this.previewTheme = this.game.theme;
        if (!this.previewPhase) this.previewPhase = "lobby";
      }
    },

    openPreviewFromMobile() {
      this.mobPane = "preview";
      this.previewOpen = true;
    },

    openDryRun() {
      this.previewTheme = this.game.theme;
      this.previewPhase = "lobby";
      this.dryRunOpen = true;
      this.previewOpen = false;
    },

    async goLive() {
      if (!this.questions.length) return;
      this.acting = true;
      try {
        if (!this.game.enabled) {
          await axios.put(`events/${this.eventId}/trivia/admin`, {
            enabled: true,
            title: this.game.title || "טריוויה",
            theme: this.game.theme,
            pace: this.game.pace,
            teams_mode: this.game.teams_mode,
            team_labels: this.game.team_labels,
            speed_bonus: this.game.speed_bonus,
            prize_text: this.game.prize_text || null,
            reveal_seconds: this.game.reveal_seconds,
            default_time: this.game.default_time,
            default_points: this.game.default_points,
            starts_at: this.game.starts_at ? Time.toUTC(this.game.starts_at) : null,
            results_at: this.game.results_at ? Time.toUTC(this.game.results_at) : null,
          });
        }
        const res = await axios.post(`events/${this.eventId}/trivia/admin/show`);
        this.applyAdminPayload(res.data.data);
        notify({ text: "הטריוויה על המסך", type: "success", duration: 3000 });
      } catch (error) {
        this.fail(error, "לא הצלחנו להפעיל על המסך");
      } finally {
        this.acting = false;
      }
    },

    async setLivePhase(phase: string) {
      this.acting = true;
      try {
        const body: Record<string, unknown> = { phase };
        if (phase === "question") {
          const ids = this.questions.map((q) => q.id).filter(Boolean) as number[];
          const cur = this.game.current_question_id;
          let nextId = ids[0];
          if (cur && this.game.current_phase === "question") {
            const i = ids.indexOf(cur);
            nextId = i >= 0 && i < ids.length - 1 ? ids[i + 1] : ids[i] || ids[0];
          } else if (cur && ids.includes(cur)) {
            nextId = cur;
          } else if (this.selectedQuestion?.id) {
            nextId = this.selectedQuestion.id;
          }
          if (nextId) body.question_id = nextId;
        }
        const res = await axios.post(
          `events/${this.eventId}/trivia/admin/phase`,
          body
        );
        this.applyAdminPayload(res.data.data);
        await this.loadReport(true);
      } catch (error) {
        this.fail(error, "לא הצלחנו לעדכן את שלב המשחק");
      } finally {
        this.acting = false;
      }
    },

    async runPhotos() {
      this.acting = true;
      try {
        const res = await axios.post(`events/${this.eventId}/trivia/admin/photos`);
        this.applyAdminPayload(res.data.data);
      } catch (error) {
        this.fail(error, "לא הצלחנו לחזור לתמונות");
      } finally {
        this.acting = false;
      }
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
        notify({
          text: "לא הצלחנו להעתיק. סמנו את הקישור ידנית.",
          type: "error",
          duration: 4000,
        });
      }
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/trivia-builder.scss";

.tb-entry {
  padding: 8px 0 40px;
}
.tb-entry-card {
  margin-top: 18px;
  background: #fff;
  border-radius: 26px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
  max-width: 560px;
}
.tb-entry-card h2 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 900;
}
.tb-entry-card p {
  color: #5e564e;
  margin: 0 0 18px;
}
.tb-entry-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tb-entry.empty .tb-entry-card {
  text-align: center;
  margin-inline: auto;
}
</style>
