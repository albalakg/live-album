<template>
  <section class="thl" dir="rtl" data-testid="trivia-host-live">
    <header class="thl-head">
      <div>
        <h2>ניהול חי</h2>
        <p class="thl-lede">
          סאונד, תגובות מהקהל, מה מופיע על המסך ומי משחק. כל שינוי מגיע למסך ולטלפונים תוך שתיים-שלוש שניות.
        </p>
      </div>
      <span class="thl-live" :class="{ on: isLive }"><i></i>{{ isLive ? "המשחק על המסך" : "המשחק לא על המסך" }}</span>
    </header>

    <p v-if="loadError" class="thl-error" role="alert">{{ loadError }}</p>

    <div class="thl-grid">
      <!-- Sound + reactions -->
      <article class="thl-card thl-sound" data-testid="trivia-sound-card">
        <h3>סאונד במסך</h3>
        <button
          type="button"
          class="thl-dj"
          :class="{ on: !fx.sound_enabled }"
          :aria-pressed="!fx.sound_enabled"
          data-testid="trivia-dj-toggle"
          @click="patchFx({ sound_enabled: !fx.sound_enabled })"
        >
          <span class="thl-dj-ico" aria-hidden="true">🎧</span>
          <span>
            <b>ה-DJ מנגן</b>
            <small>{{ fx.sound_enabled ? "צלילי המשחק פועלים על המסך" : "צלילי המשחק כבויים, המסך שקט" }}</small>
          </span>
          <span class="thl-switch" :class="{ on: !fx.sound_enabled }" aria-hidden="true"><i></i></span>
        </button>

        <label class="thl-volume" :class="{ off: !fx.sound_enabled }">
          <span>עוצמה</span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            :value="volumeDraft"
            :disabled="!fx.sound_enabled"
            aria-label="עוצמת הצלילים במסך"
            data-testid="trivia-volume"
            @input="onVolume"
          />
          <output>{{ volumeDraft }}%</output>
        </label>
        <p class="thl-note">מוזיקת לובי, טיקים בספירה לאחור, צליל חשיפה ופאנפרה בפודיום.</p>

        <h3 class="thl-sub">תגובות מהקהל</h3>
        <button
          type="button"
          class="thl-row-toggle"
          :aria-pressed="fx.reactions_enabled"
          data-testid="trivia-reactions-toggle"
          @click="patchFx({ reactions_enabled: !fx.reactions_enabled })"
        >
          <span>❤️ 🎉 😂 👏 מזל טוב</span>
          <span class="thl-switch" :class="{ on: fx.reactions_enabled }" aria-hidden="true"><i></i></span>
        </button>
        <p class="thl-note">
          {{ fx.reactions_enabled ? `${reactionsLastMinute} תגובות בדקה האחרונה` : "התגובות כבויות. הטלפונים לא מציגים את הכפתורים." }}
        </p>
      </article>

      <!-- Free-text answers on the screen -->
      <article class="thl-card thl-answers" data-testid="trivia-answers-card">
        <h3>התשובות על המסך</h3>
        <template v-if="question && question.free_text">
          <p class="thl-q">{{ question.prompt || "שאלה בלי כותרת" }}</p>
          <button
            type="button"
            class="thl-row-toggle"
            :aria-pressed="question.requires_approval"
            data-testid="trivia-approval-toggle"
            @click="setApproval(question.id, !question.requires_approval)"
          >
            <span>אישור לפני הצגה</span>
            <span class="thl-switch" :class="{ on: question.requires_approval }" aria-hidden="true"><i></i></span>
          </button>

          <div v-if="pending.length" class="thl-queue" data-testid="trivia-queue">
            <div class="thl-queue-head">
              <b>ממתינות לאישור ({{ pending.length }})</b>
              <button type="button" class="thl-link" @click="approve(pending.map((a) => a.id), true)">לאשר הכל</button>
            </div>
            <ul>
              <li v-for="a in pending" :key="a.id">
                <span class="thl-text">{{ a.text }}</span>
                <small>{{ a.player }}</small>
                <button type="button" class="thl-ok" aria-label="אישור" @click="approve([a.id], true)">✓</button>
                <button type="button" class="thl-no" aria-label="דחייה" @click="approve([a.id], false)">✕</button>
              </li>
            </ul>
          </div>

          <p class="thl-label">על המסך עכשיו</p>
          <div v-if="visibleWords.length" class="thl-words" data-testid="trivia-visible-words">
            <span v-for="w in visibleWords" :key="w.key" class="thl-word">
              {{ w.text }}<em v-if="w.ids.length > 1">×{{ w.ids.length }}</em>
              <button
                type="button"
                :aria-label="`הסתרת ${w.text} מהמסך`"
                :data-word="w.text"
                @click="hide(w.ids, true)"
              >הסתרה</button>
            </span>
          </div>
          <p v-else class="thl-note">עוד אין תשובות על המסך.</p>

          <template v-if="hiddenWords.length">
            <p class="thl-label">הוסתרו</p>
            <div class="thl-words muted">
              <span v-for="w in hiddenWords" :key="w.key" class="thl-word">
                {{ w.text }}<em v-if="w.ids.length > 1">×{{ w.ids.length }}</em>
                <button type="button" @click="hide(w.ids, false)">החזרה</button>
              </span>
            </div>
          </template>
          <p v-if="filteredCount" class="thl-note">
            {{ filteredCount }} {{ filteredCount === 1 ? "תשובה סוננה" : "תשובות סוננו" }} אוטומטית (מילים לא ראויות) ולא יופיעו על המסך.
          </p>
        </template>
        <p v-else class="thl-note">
          {{ question ? "בשאלה הנוכחית אין תשובות טקסט חופשי." : "כשתעלה שאלת ענן מילים או השלימו את המשפט, התשובות יופיעו כאן." }}
        </p>

        <details v-if="freeTextQuestions.length" class="thl-more">
          <summary>אישור לפני הצגה לכל שאלה ({{ freeTextQuestions.length }})</summary>
          <ul>
            <li v-for="q in freeTextQuestions" :key="q.id">
              <span>{{ q.prompt || "שאלה בלי כותרת" }}</span>
              <button
                type="button"
                class="thl-row-toggle compact"
                :aria-pressed="q.requires_approval"
                @click="setApproval(q.id, !q.requires_approval)"
              >
                <span class="thl-switch" :class="{ on: q.requires_approval }" aria-hidden="true"><i></i></span>
              </button>
            </li>
          </ul>
        </details>
      </article>

      <!-- Players -->
      <article class="thl-card thl-players" data-testid="trivia-players-card">
        <div class="thl-players-head">
          <h3>שחקנים <span>{{ activePlayers.length }}</span></h3>
          <input v-model.trim="search" type="search" placeholder="חיפוש כינוי" aria-label="חיפוש שחקן" />
        </div>
        <ul class="thl-list">
          <li v-for="p in shownPlayers" :key="p.id" :class="{ flagged: p.nickname_flagged }" :data-player="p.nickname">
            <template v-if="renaming === p.id">
              <input
                ref="renameInput"
                v-model="renameDraft"
                class="thl-rename"
                maxlength="40"
                aria-label="כינוי חדש"
                @keydown.enter.prevent="saveRename(p.id)"
                @keydown.esc="renaming = null"
              />
              <button type="button" class="thl-btn pri" :disabled="renameDraft.trim().length < 2" @click="saveRename(p.id)">שמירה</button>
              <button type="button" class="thl-btn" @click="renaming = null">ביטול</button>
            </template>
            <template v-else-if="kicking === p.id">
              <div class="thl-kick" data-testid="trivia-kick-confirm">
                <b>להסיר את "{{ p.nickname }}" מהמשחק?</b>
                <label><input v-model="kickBlock" type="checkbox" /> לחסום הצטרפות מחדש מאותו טלפון</label>
                <div>
                  <button type="button" class="thl-btn danger" @click="kick(p.id)">הסרה</button>
                  <button type="button" class="thl-btn" @click="kicking = null">ביטול</button>
                </div>
              </div>
            </template>
            <template v-else>
              <i class="thl-av" aria-hidden="true">{{ (p.nickname || "?").charAt(0) }}</i>
              <span class="thl-name">
                {{ p.nickname }}
                <small v-if="p.team">· {{ p.team }}</small>
                <em v-if="p.nickname_flagged" class="thl-flag">כינוי לא ראוי</em>
              </span>
              <span class="thl-score">{{ p.score.toLocaleString("he-IL") }}</span>
              <button type="button" class="thl-btn" @click="startRename(p)">שינוי שם</button>
              <button type="button" class="thl-btn danger" @click="startKick(p.id)">הסרה</button>
            </template>
          </li>
          <li v-if="!shownPlayers.length" class="thl-empty">{{ search ? "לא נמצא שחקן" : "עוד אין שחקנים" }}</li>
        </ul>

        <template v-if="kickedPlayers.length">
          <p class="thl-label">הוסרו מהמשחק ({{ kickedPlayers.length }})</p>
          <ul class="thl-list muted">
            <li v-for="p in kickedPlayers" :key="p.id">
              <i class="thl-av" aria-hidden="true">{{ (p.nickname || "?").charAt(0) }}</i>
              <span class="thl-name">
                {{ p.nickname }}
                <em v-if="p.rejoin_blocked" class="thl-flag">חסום</em>
              </span>
              <button type="button" class="thl-btn" @click="restore(p.id)">החזרה</button>
            </li>
          </ul>
        </template>
      </article>
    </div>
  </section>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import ErrorsHandler from "@/helpers/errorsHandler";
import { notify } from "@/helpers/notify";
import { DEFAULT_TRIVIA_FX, TriviaFxSettings, triviaErrorReason } from "@/helpers/triviaModeration";

interface LivePlayer {
  id: number;
  nickname: string;
  team: string | null;
  score: number;
  kicked: boolean;
  rejoin_blocked: boolean;
  nickname_flagged: boolean;
}

interface LiveAnswer {
  id: number;
  text: string;
  player: string | null;
  player_kicked: boolean;
  state: "visible" | "hidden" | "pending" | "filtered";
}

interface LiveQuestion {
  id: number;
  type: string;
  prompt: string;
  free_text: boolean;
  requires_approval: boolean;
  answers: LiveAnswer[];
}

interface WordGroup {
  key: string;
  text: string;
  ids: number[];
}

const POLL_MS = 2000;

function wordKey(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default defineComponent({
  name: "TriviaHostLivePanel",

  props: {
    eventId: { type: Number, required: true },
    isLive: { type: Boolean, default: false },
  },

  emits: ["fx"],

  data() {
    return {
      fx: { ...DEFAULT_TRIVIA_FX } as TriviaFxSettings,
      volumeDraft: DEFAULT_TRIVIA_FX.sound_volume,
      volumeTimer: null as ReturnType<typeof setTimeout> | null,
      players: [] as LivePlayer[],
      question: null as LiveQuestion | null,
      freeTextQuestions: [] as { id: number; prompt: string; requires_approval: boolean }[],
      reactionsLastMinute: 0,
      pollTimer: null as ReturnType<typeof setInterval> | null,
      loadError: "",
      search: "",
      renaming: null as number | null,
      renameDraft: "",
      kicking: null as number | null,
      kickBlock: false,
      busy: false,
    };
  },

  computed: {
    activePlayers(): LivePlayer[] {
      return this.players.filter((p) => !p.kicked);
    },
    kickedPlayers(): LivePlayer[] {
      return this.players.filter((p) => p.kicked);
    },
    shownPlayers(): LivePlayer[] {
      const q = this.search.toLowerCase();
      const list = q
        ? this.activePlayers.filter((p) => p.nickname.toLowerCase().includes(q))
        : this.activePlayers;
      // Offensive-looking nicknames first so the host sees them.
      return [...list].sort((a, b) => Number(b.nickname_flagged) - Number(a.nickname_flagged));
    },
    answers(): LiveAnswer[] {
      return (this.question?.answers || []).filter((a) => !a.player_kicked);
    },
    pending(): LiveAnswer[] {
      return this.answers.filter((a) => a.state === "pending");
    },
    visibleWords(): WordGroup[] {
      return this.group(this.answers.filter((a) => a.state === "visible"));
    },
    hiddenWords(): WordGroup[] {
      return this.group(this.answers.filter((a) => a.state === "hidden"));
    },
    filteredCount(): number {
      return this.answers.filter((a) => a.state === "filtered").length;
    },
  },

  mounted() {
    this.load();
    this.pollTimer = setInterval(() => this.load(true), POLL_MS);
  },

  beforeUnmount() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.volumeTimer) clearTimeout(this.volumeTimer);
  },

  methods: {
    group(list: LiveAnswer[]): WordGroup[] {
      const map = new Map<string, WordGroup>();
      list.forEach((a) => {
        const key = wordKey(a.text);
        const row = map.get(key) || { key, text: a.text, ids: [] };
        row.ids.push(a.id);
        map.set(key, row);
      });
      return Array.from(map.values()).sort((a, b) => b.ids.length - a.ids.length);
    },

    apply(data: any) {
      if (!data) return;
      const fx = { ...DEFAULT_TRIVIA_FX, ...(data.fx || {}) };
      this.fx = fx;
      if (!this.volumeTimer) this.volumeDraft = fx.sound_volume;
      this.players = data.players || [];
      this.question = data.question || null;
      this.freeTextQuestions = data.free_text_questions || [];
      this.reactionsLastMinute = data.reactions_last_minute || 0;
      this.$emit("fx", fx);
    },

    async load(silent = false) {
      if (this.busy && silent) return;
      try {
        const res = await axios.get(`events/${this.eventId}/trivia/admin/live`);
        this.apply(res.data.data);
        this.loadError = "";
      } catch (error) {
        if (!silent) {
          this.loadError = ErrorsHandler.getErrorMessage(error, "לא הצלחנו לטעון את הניהול החי");
        }
      }
    },

    async act(request: () => Promise<any>, fallback: string): Promise<boolean> {
      this.busy = true;
      try {
        const res = await request();
        this.apply(res.data.data);
        return true;
      } catch (error) {
        // Production hides server messages, so known cases are matched by reason.
        const text =
          triviaErrorReason(error) === "nickname_blocked"
            ? "הכינוי הזה לא יעבור על המסך. נסו כינוי אחר"
            : ErrorsHandler.getErrorMessage(error, fallback);
        notify({ text, type: "error", duration: 4000 });
        return false;
      } finally {
        this.busy = false;
      }
    },

    patchFx(partial: Partial<TriviaFxSettings>) {
      this.fx = { ...this.fx, ...partial };
      return this.act(
        () => axios.put(`events/${this.eventId}/trivia/admin/fx`, partial),
        "לא הצלחנו לעדכן את הסאונד"
      );
    },

    onVolume(event: Event) {
      this.volumeDraft = Number((event.target as HTMLInputElement).value);
      if (this.volumeTimer) clearTimeout(this.volumeTimer);
      this.volumeTimer = setTimeout(async () => {
        await this.patchFx({ sound_volume: this.volumeDraft });
        this.volumeTimer = null;
      }, 350);
    },

    setApproval(questionId: number, required: boolean) {
      return this.act(
        () => axios.post(`events/${this.eventId}/trivia/admin/questions/${questionId}/approval`, {
          requires_approval: required,
        }),
        "לא הצלחנו לעדכן את האישור"
      );
    },

    approve(ids: number[], approved: boolean) {
      if (!ids.length) return;
      return this.act(
        () => axios.post(`events/${this.eventId}/trivia/admin/answers/approve`, { answer_ids: ids, approved }),
        "לא הצלחנו לעדכן את התשובות"
      );
    },

    hide(ids: number[], hidden: boolean) {
      return this.act(
        () => axios.post(`events/${this.eventId}/trivia/admin/answers/hide`, { answer_ids: ids, hidden }),
        "לא הצלחנו לעדכן את המסך"
      );
    },

    startRename(p: LivePlayer) {
      this.kicking = null;
      this.renaming = p.id;
      this.renameDraft = p.nickname;
      this.$nextTick(() => {
        const input = this.$refs.renameInput as HTMLInputElement | HTMLInputElement[] | undefined;
        const el = Array.isArray(input) ? input[0] : input;
        el?.focus();
        el?.select();
      });
    },

    async saveRename(id: number) {
      const nickname = this.renameDraft.trim();
      if (nickname.length < 2) return;
      const ok = await this.act(
        () => axios.post(`events/${this.eventId}/trivia/admin/players/${id}/rename`, { nickname }),
        "לא הצלחנו לשנות את השם"
      );
      // Keep the field open on a blocked name so the host can fix it.
      if (ok) this.renaming = null;
    },

    startKick(id: number) {
      this.renaming = null;
      this.kicking = id;
      this.kickBlock = false;
    },

    async kick(id: number) {
      await this.act(
        () => axios.post(`events/${this.eventId}/trivia/admin/players/${id}/kick`, { block: this.kickBlock }),
        "לא הצלחנו להסיר את השחקן"
      );
      this.kicking = null;
    },

    restore(id: number) {
      return this.act(
        () => axios.post(`events/${this.eventId}/trivia/admin/players/${id}/restore`),
        "לא הצלחנו להחזיר את השחקן"
      );
    },
  },
});
</script>

<style scoped>
.thl {
  padding: 12px 40px 48px;
  overflow: auto;
  flex: 1;
  min-height: 0;
  color: var(--tb-ink, #161310);
}
.thl-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.thl-head h2 {
  margin: 0 0 4px;
  font-size: 1.6rem;
  font-weight: 900;
}
.thl-lede {
  margin: 0;
  color: var(--tb-muted, #5e564e);
  max-width: 44em;
}
.thl-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #fff;
  font-weight: 750;
  font-size: 0.88rem;
  color: var(--tb-muted, #5e564e);
  box-shadow: var(--tb-shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
  white-space: nowrap;
}
.thl-live i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #bbb;
}
.thl-live.on i {
  background: var(--tb-live, #2fbe6a);
  box-shadow: 0 0 0 4px rgba(47, 190, 106, 0.2);
}
.thl-error {
  color: #b42318;
  font-weight: 700;
}
.thl-grid {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.2fr) minmax(320px, 1.1fr);
  gap: 20px;
  align-items: start;
}
@media (max-width: 1180px) {
  .thl-grid {
    grid-template-columns: 1fr 1fr;
  }
  .thl-players {
    grid-column: 1 / -1;
  }
}
@media (max-width: 760px) {
  .thl {
    padding: 10px 14px 40px;
  }
  .thl-head {
    flex-direction: column;
  }
  .thl-grid {
    grid-template-columns: 1fr;
  }
}
.thl-card {
  background: #fff;
  border-radius: 22px;
  padding: 20px;
  box-shadow: var(--tb-shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
}
.thl-card h3 {
  margin: 0 0 12px;
  font-size: 1.08rem;
  font-weight: 850;
}
.thl-card h3 span {
  color: var(--tb-faint, #8a8278);
  font-weight: 700;
}
.thl-sub {
  margin-top: 22px !important;
}
.thl-dj {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  border: 2px solid var(--tb-line, rgba(22, 19, 16, 0.11));
  background: var(--tb-paper, #fffcfa);
  text-align: start;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
.thl-dj.on {
  border-color: var(--tb-rose, #dc5b66);
  background: #fff3f4;
}
.thl-dj-ico {
  font-size: 2rem;
}
.thl-dj b {
  display: block;
  font-size: 1.25rem;
  font-weight: 900;
}
.thl-dj small {
  color: var(--tb-muted, #5e564e);
}
.thl-dj > span:nth-child(2) {
  flex: 1;
}
.thl-switch {
  flex: none;
  width: 46px;
  height: 26px;
  border-radius: 999px;
  background: #d9d2c8;
  position: relative;
  transition: background 0.2s;
}
.thl-switch i {
  position: absolute;
  top: 3px;
  inset-inline-start: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: inset-inline-start 0.2s;
}
.thl-switch.on {
  background: var(--tb-rose, #dc5b66);
}
.thl-switch.on i {
  inset-inline-start: 23px;
}
.thl-volume {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  font-weight: 700;
}
.thl-volume input {
  flex: 1;
  accent-color: var(--tb-rose, #dc5b66);
}
.thl-volume output {
  min-width: 3.2em;
  text-align: end;
  font-variant-numeric: tabular-nums;
}
.thl-volume.off {
  opacity: 0.45;
}
.thl-note {
  margin: 8px 0 0;
  color: var(--tb-muted, #5e564e);
  font-size: 0.88rem;
}
.thl-row-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--tb-line, rgba(22, 19, 16, 0.11));
  background: var(--tb-paper, #fffcfa);
  font: inherit;
  font-weight: 750;
  color: inherit;
  cursor: pointer;
}
.thl-row-toggle.compact {
  width: auto;
  padding: 4px;
  border: 0;
  background: none;
}
.thl-q {
  margin: 0 0 10px;
  font-weight: 800;
}
.thl-label {
  margin: 16px 0 8px;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--tb-faint, #8a8278);
  letter-spacing: 0.02em;
}
.thl-queue {
  margin-top: 14px;
  padding: 12px;
  border-radius: 16px;
  background: #fff8e8;
  border: 1.5px solid #f1d8a0;
}
.thl-queue-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.thl-queue ul,
.thl-list,
.thl-more ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.thl-queue li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.thl-queue li:first-child {
  border-top: 0;
}
.thl-text {
  font-weight: 800;
  flex: 1;
}
.thl-queue small {
  color: var(--tb-faint, #8a8278);
}
.thl-ok,
.thl-no {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 0;
  font-weight: 900;
  cursor: pointer;
}
.thl-ok {
  background: #e3f6ea;
  color: #1a7f45;
}
.thl-no {
  background: #fde8ea;
  color: #b42318;
}
.thl-link {
  border: 0;
  background: none;
  color: var(--tb-rose, #dc5b66);
  font-weight: 800;
  cursor: pointer;
}
.thl-words {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.thl-word {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 6px 6px 12px;
  border-radius: 999px;
  background: var(--tb-bg, #f3eee6);
  font-weight: 750;
}
.thl-word em {
  font-style: normal;
  color: var(--tb-faint, #8a8278);
  font-size: 0.82rem;
}
.thl-word button {
  border: 0;
  border-radius: 999px;
  padding: 4px 10px;
  background: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  color: #b42318;
  cursor: pointer;
}
.thl-words.muted .thl-word {
  opacity: 0.75;
  text-decoration: line-through;
}
.thl-words.muted .thl-word button {
  color: var(--tb-teal, #1f6f6a);
  text-decoration: none;
}
.thl-more {
  margin-top: 18px;
  border-top: 1px solid var(--tb-line, rgba(22, 19, 16, 0.11));
  padding-top: 12px;
}
.thl-more summary {
  cursor: pointer;
  font-weight: 800;
}
.thl-more li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
}
.thl-players-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.thl-players-head h3 {
  margin: 0;
}
.thl-players-head input,
.thl-rename {
  border: 1.5px solid var(--tb-line, rgba(22, 19, 16, 0.11));
  border-radius: 12px;
  padding: 8px 12px;
  font: inherit;
  min-width: 0;
}
.thl-rename {
  flex: 1;
}
.thl-list {
  max-height: 460px;
  overflow: auto;
}
.thl-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.thl-list li.flagged {
  background: #fff3f4;
  border-radius: 12px;
}
.thl-list.muted li {
  opacity: 0.7;
}
.thl-av {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-style: normal;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, var(--tb-rose, #dc5b66), var(--tb-gold, #c9a36a));
}
.thl-name {
  flex: 1;
  font-weight: 750;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.thl-name small {
  color: var(--tb-faint, #8a8278);
  font-weight: 600;
}
.thl-flag {
  margin-inline-start: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fde8ea;
  color: #b42318;
  font-style: normal;
  font-size: 0.72rem;
  font-weight: 800;
}
.thl-score {
  font-variant-numeric: tabular-nums;
  color: var(--tb-muted, #5e564e);
  font-size: 0.88rem;
}
.thl-btn {
  border: 0;
  border-radius: 999px;
  padding: 6px 12px;
  background: var(--tb-bg, #f3eee6);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  color: inherit;
}
.thl-btn.danger {
  color: #b42318;
}
.thl-btn.pri {
  background: linear-gradient(135deg, var(--tb-rose, #dc5b66), var(--tb-gold, #c9a36a));
  color: #fff;
}
.thl-btn:disabled {
  opacity: 0.5;
}
.thl-kick {
  flex: 1;
  display: grid;
  gap: 8px;
  padding: 10px;
  border-radius: 14px;
  background: #fff3f4;
}
.thl-kick label {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.9rem;
}
.thl-kick div {
  display: flex;
  gap: 8px;
}
.thl-empty {
  color: var(--tb-faint, #8a8278);
  justify-content: center;
}
</style>
