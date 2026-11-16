<template>
  <div class="trivia-stage-host" ref="host" dir="rtl">
    <div class="stage-scale" ref="scale">
      <section
        class="stage"
        ref="stage"
        :data-theme="theme"
        :data-skin="skin"
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
                <span v-if="!joiningNames.length" class="lobby-empty">
                  מחכים לאורחים הראשונים…
                </span>
              </div>
              <p v-if="tablesMode" class="lead lobby-tables">
                משחקים לפי שולחנות: בהצטרפות כל אחד מזין את מספר השולחן שלו.
              </p>
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
            <ol v-if="boardPlayers.length" class="board">
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
            <p v-if="boardNote" class="board-note">{{ boardNote }}</p>
            <div v-if="tables.length" class="tables-board">
              <span v-for="row in tables.slice(0, 4)" :key="row.team">
                שולחן {{ row.team }} · {{ formatScore(row.score) }}
              </span>
            </div>
          </div>

          <!-- Question / Reveal -->
          <div v-else-if="phase === 'question' || phase === 'reveal'" class="stage-mid">
            <h1 class="stage-q">{{ question?.prompt }}</h1>
            <p v-if="finishPrefix" class="finish-prefix">{{ finishPrefix }}</p>
            <p v-if="subText" class="stage-sub">{{ subText }}</p>

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

            <!-- tugofwar -->
            <div v-else-if="questionType === 'tugofwar'" class="rope-live">
              <div class="rope-names">
                <div
                  v-for="(side, i) in sideCards"
                  :key="i"
                  class="rope-name"
                  :class="{ lead: ropeLeader === i }"
                >
                  <div
                    class="av-lg"
                    :style="{ background: side.color, color: '#fff' }"
                  >{{ side.initial }}</div>
                  <h3>{{ side.name }}</h3>
                  <div class="rope-pct">{{ ropePercents[i] }}%</div>
                </div>
              </div>
              <div class="rope-track" aria-hidden="true">
                <span
                  v-for="(side, i) in sideCards"
                  :key="i"
                  class="rope-seg"
                  :style="{ width: `${ropePercents[i]}%`, background: side.color }"
                ></span>
                <i class="rope-knot" :style="{ right: `${ropePercents[0]}%` }"></i>
              </div>
              <p class="rope-note">{{ ropeNote }}</p>
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
              <p v-if="!isReveal && !numberGuesses.length" class="empty-note">
                הניחושים יופיעו כאן
              </p>
              <div v-if="isReveal" class="closest-card">
                <template v-if="closestNickname">
                  הכי קרוב:
                  <b>{{ closestNickname }}</b>
                  <template v-if="closestValue != null"> עם {{ closestValue }}</template>
                  ·
                </template>
                <template v-else>אף אחד לא ענה ·</template>
                התשובה {{ numberCorrect }}
                <template v-if="numberUnit"> {{ numberUnit }}</template>
              </div>
            </div>

            <!-- date -->
            <div v-else-if="questionType === 'date'" class="num-live date-live">
              <div class="num-axis">
                <div class="line"></div>
                <template v-if="dateAxis">
                  <i
                    v-for="(g, i) in dateGuessDays"
                    :key="i"
                    class="guess-dot"
                    :style="{
                      left: `${datePos(g)}%`,
                      right: 'auto',
                      background: letterColor(i % 6),
                      animationDelay: `${i * 0.04}s`,
                    }"
                  ></i>
                  <div
                    v-if="isReveal && dateCorrectDays != null"
                    class="correct-mark"
                    :style="{ left: `${datePos(dateCorrectDays)}%`, right: 'auto' }"
                  >
                    <b>{{ dateCorrectLabel }}</b>
                    <div class="needle"></div>
                  </div>
                  <span
                    v-for="(tick, i) in dateTicks"
                    :key="i"
                    class="tick"
                    :style="{ left: `${tick.pos}%`, right: 'auto' }"
                  >{{ tick.label }}</span>
                </template>
              </div>
              <p v-if="!isReveal && !dateGuessDays.length" class="empty-note">
                הניחושים יופיעו כאן
              </p>
              <div v-if="isReveal" class="closest-card">
                <template v-if="closestNickname">
                  הכי קרוב:
                  <b>{{ closestNickname }}</b>
                  <template v-if="closestDateLabel"> עם {{ closestDateLabel }}</template>
                  ·
                </template>
                <template v-else>אף אחד לא ענה ·</template>
                התשובה {{ dateCorrectLabel }}
              </div>
            </div>

            <!-- map -->
            <div v-else-if="questionType === 'map'" class="map-live">
              <div class="map-box">
                <TriviaMapPin
                  readonly
                  :pins="mapGuesses"
                  :correct="isReveal ? mapCorrect : null"
                  :label="isReveal ? mapLabel : ''"
                  aria-label="מפה עם הנעצים של האורחים"
                />
              </div>
              <div class="map-side">
                <div class="map-count">{{ mapCountText }}</div>
                <div v-if="isReveal" class="closest-card">
                  <template v-if="closestNickname">
                    הנעץ הכי קרוב:
                    <b>{{ closestNickname }}</b>
                  </template>
                  <template v-else>אף אחד לא הניח נעץ</template>
                  <template v-if="mapLabel"> · {{ mapLabel }}</template>
                </div>
              </div>
            </div>

            <!-- cloud / finish -->
            <div v-else-if="questionType === 'cloud' || questionType === 'finish'" class="cloud-live">
              <div v-if="cloudWords.length" class="cloud-flex">
                <span
                  v-for="(w, i) in cloudWords"
                  :key="`${w.text}-${i}`"
                  class="cloud-word"
                  :class="`w-${w.tone}`"
                  :style="{ fontSize: `${w.size}px`, animationDelay: `${i * 0.03}s` }"
                >{{ w.text }}<sup v-if="w.count > 1">×{{ w.count }}</sup></span>
              </div>
              <p v-else class="empty-note">
                עדיין אין תשובות. כתבו בטלפון והמילים יעלו לכאן.
              </p>
            </div>

            <!-- rate -->
            <div v-else-if="questionType === 'rate'" class="rate-live">
              <div class="rate-avg">
                <div class="rate-big">{{ rateAverageText }}</div>
                <div class="rate-caption">{{ rateCaption }}</div>
              </div>
              <div class="rate-bars">
                <div v-for="row in rateRows" :key="row.value">
                  <span>{{ row.value }}</span>
                  <i :style="{ width: `${row.width}%` }"></i>
                  <b>{{ row.count }}</b>
                </div>
              </div>
            </div>

            <!-- order -->
            <div v-else-if="questionType === 'order'" class="order-live">
              <div
                v-for="(item, i) in orderRows"
                :key="item.id"
                class="order-item"
                :class="{ 'is-placed': isReveal }"
                :style="{ animationDelay: `${i * 0.07}s` }"
              >
                <span class="onum">{{ isReveal ? i + 1 : "?" }}</span>
                <span>{{ item.label }}</span>
              </div>
            </div>

            <!-- match -->
            <div v-else-if="questionType === 'match'" class="match-live">
              <template v-if="isReveal && matchRows.length">
                <div
                  v-for="(row, i) in matchRows"
                  :key="i"
                  class="match-row"
                  :style="{ animationDelay: `${i * 0.08}s` }"
                >
                  <span class="m-left">{{ row.left }}</span>
                  <span class="m-link" aria-hidden="true">⟷</span>
                  <span class="m-right">{{ row.right }}</span>
                </div>
              </template>
              <div v-else class="match-cols">
                <div class="match-col">
                  <div v-for="item in matchLeft" :key="item.id" class="match-chip">
                    {{ item.label }}
                  </div>
                </div>
                <div class="match-col">
                  <div v-for="item in matchRight" :key="item.id" class="match-chip alt">
                    {{ item.label }}
                  </div>
                </div>
              </div>
            </div>

            <!-- fillblank -->
            <div v-else-if="questionType === 'fillblank'" class="fill-live">
              <div v-if="isReveal && fillAnswerChars.length" class="fill-row answer">
                <span v-for="(c, i) in fillAnswerChars" :key="i" class="fill-tile ok">{{ c }}</span>
              </div>
              <div v-else class="fill-row">
                <span v-for="(c, i) in fillLetters" :key="i" class="fill-tile">{{ c }}</span>
              </div>
              <p v-if="isReveal && fillAnswerChars.length" class="fill-caption">
                המילה: <b>{{ fillAnswerChars.join("") }}</b>
              </p>
            </div>

            <!-- choice / multi / truefalse / poll / buzzer / emoji / photo / blur / spotdiff / video / audio -->
            <div
              v-else
              class="opts-wrap"
              :class="{ 'photo-live': isMediaLayout, 'media-live': isMediaLayout }"
              :data-kind="mediaKind"
            >
              <div v-if="isMediaLayout" class="pic" :class="{ 'is-blur': isBlur, 'is-audio': mediaKind === 'audio' }">
                <template v-if="mediaUrl">
                  <img
                    v-if="mediaKind === 'image'"
                    :src="mediaUrl"
                    alt=""
                    :style="blurStyle"
                  />
                  <video
                    v-else-if="mediaKind === 'video'"
                    :src="mediaUrl"
                    :autoplay="!preview"
                    :controls="preview"
                    loop
                    playsinline
                    preload="metadata"
                  ></video>
                  <div v-else class="audio-card">
                    <div class="audio-bars" aria-hidden="true">
                      <i v-for="n in 14" :key="n" :style="{ animationDelay: `${n * 0.07}s` }"></i>
                    </div>
                    <audio :src="mediaUrl" :autoplay="!preview" controls preload="metadata"></audio>
                  </div>
                </template>
                <div v-else class="media-missing">הקובץ יופיע כאן</div>
              </div>
              <div>
                <div class="opts-grid" :class="{ tf: optionRows.length <= 2 }">
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
                <div v-if="questionType === 'buzzer' && isReveal" class="buzzer-winner">
                  <template v-if="buzzerWinner">
                    ⚡ <b>{{ buzzerWinner.nickname }}</b> היה הראשון
                    <template v-if="buzzerWinner.seconds"> · {{ buzzerWinner.seconds }} שניות</template>
                  </template>
                  <template v-else>אף אחד לא לחץ נכון בזמן. הניקוד נשאר כמו שהוא</template>
                </div>
              </div>
            </div>

            <p v-if="isReveal && noAnswers" class="reveal-note">
              אף אחד לא ענה על השאלה הזאת.
            </p>
            <p v-else-if="isReveal && singleAnswer" class="reveal-note soft">
              ענה שחקן אחד.
            </p>

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
              {{ playersLabel }}
            </div>
            <div class="team-pill">
              <template v-if="sidesTeams">
                <span>{{ sidesTeams.labels.a }} · {{ formatScore(sidesTeams.scores.a) }}</span>
                <span>{{ sidesTeams.labels.b }} · {{ formatScore(sidesTeams.scores.b) }}</span>
              </template>
              <template v-else-if="tables.length">
                <span v-for="row in tables.slice(0, 3)" :key="row.team">
                  שולחן {{ row.team }} · {{ formatScore(row.score) }}
                </span>
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
import TriviaMapPin from "@/components/event/trivia/TriviaMapPin.vue";
import {
  TRIVIA_LETTERS,
  TRIVIA_LETTER_COLORS,
  TriviaScreenPayload,
  TriviaQuestionDto,
  formatTriviaDate,
  isMediaType,
  isUnscoredType,
  normalizeTriviaTheme,
} from "@/helpers/triviaTypes";

const TIMER_R = 46;
const TIMER_C = 2 * Math.PI * TIMER_R;
const MAX_BLUR_PX = 40;

const SIDE_COLORS = ["#1F6F6A", "#DC5B66", "#6E4A8A", "#C9A36A"];

/** YYYYMMDD number (or small day count) -> whole days since epoch. */
function toDays(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 10000101) {
    const y = Math.floor(n / 10000);
    const m = Math.floor((n % 10000) / 100);
    const d = n % 100;
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  }
  return n;
}

function daysToLabel(days: number): string {
  return formatTriviaDate(new Date(days * 86400000).toISOString().slice(0, 10));
}

export default defineComponent({
  name: "EventTriviaLiveStage",

  components: { QrcodeVue, TriviaMapPin },

  props: {
    screen: {
      type: Object as PropType<TriviaScreenPayload>,
      required: true,
    },
    eventName: {
      type: String,
      default: "",
    },
    /** Builder preview: no autoplay, static blur. */
    preview: {
      type: Boolean,
      default: false,
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
      return normalizeTriviaTheme(this.screen.theme);
    },

    /** "legacy" themes have hand-written rules; others use CSS variables. */
    skin(): string {
      return this.theme === "elegant" || this.theme === "neon" ? "legacy" : "vars";
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

    playersLabel(): string {
      if (this.playerCount <= 0) return "אין עדיין שחקנים";
      if (this.playerCount === 1) return "שחקן אחד משחק עכשיו";
      return `${this.playerCount} משחקים עכשיו`;
    },

    question(): TriviaQuestionDto | null {
      return this.screen.question || null;
    },

    questionType(): string {
      return this.question?.type || "choice";
    },

    config(): Record<string, any> {
      return (this.question?.config || {}) as Record<string, any>;
    },

    isWhoFamily(): boolean {
      return this.questionType === "who" || this.questionType === "whosaid";
    },

    showLiveTallies(): boolean {
      return isUnscoredType(this.questionType);
    },

    subText(): string {
      const t = this.questionType;
      if (!this.question) return "";
      if (isUnscoredType(t)) {
        switch (t) {
          case "tugofwar":
            return "בלי תשובה נכונה — כל הקהל מושך בחבל";
          case "cloud":
            return "בלי תשובה נכונה — המילים עולות למסך";
          case "finish":
            return "בלי תשובה נכונה — השלימו בטלפון";
          case "rate":
            return "בלי תשובה נכונה — מדרגים בטלפון";
          default:
            return "בלי תשובה נכונה — רק מה שהקהל בוחר";
        }
      }
      if (this.isReveal) return "";
      switch (t) {
        case "buzzer":
          return "הראשון שעונה נכון לוקח את כל הנקודות";
        case "spotdiff":
          return "סמנו בטלפון את כל ההבדלים שמצאתם";
        case "blur":
          return "התמונה מתחדדת עם הזמן. ענו מהר";
        case "video":
          return "צפו בקטע וענו בטלפון";
        case "audio":
          return "האזינו לקטע וענו בטלפון";
        case "date":
          return "בחרו תאריך בטלפון. הקרוב ביותר מנצח";
        case "map":
          return "הניחו נעץ בטלפון. הקרוב ביותר מנצח";
        case "order":
          return "סדרו מהראשון ועד האחרון בטלפון";
        case "match":
          return "חברו כל פריט לזוג שלו בטלפון";
        case "fillblank":
          return "הרכיבו את המילה מהאותיות בטלפון";
        case "emoji":
          return "מה מסתתר מאחורי האימוג׳י?";
        default:
          return "";
      }
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

    boardNote(): string {
      const list = this.boardPlayers;
      if (!list.length) return "עוד אין תוצאות. מחכים לתשובות הראשונות.";
      if (list.length === 1) return "שחקן אחד בטבלה. עוד רגע מצטרפים אחרים.";
      const tied = list.filter((p) => p.score === list[0].score);
      if (tied.length > 1 && list[0].score > 0) {
        return `תיקו על המקום הראשון: ${tied.map((p) => p.nickname).join(" ו")}`;
      }
      return "";
    },

    footPlayers(): NonNullable<TriviaScreenPayload["top"]> {
      return (this.screen.top || []).slice(0, 5);
    },

    sidesTeams(): { labels: { a: string; b: string }; scores: { a: number; b: number } } | null {
      const t = this.screen.teams;
      if (t?.mode === "sides" && t.labels && t.scores) {
        return { labels: t.labels, scores: t.scores };
      }
      return null;
    },

    tables(): { team: string; score: number; players: number }[] {
      const t = this.screen.teams;
      if (t?.mode === "tables" && Array.isArray(t.tables)) return t.tables;
      return [];
    },

    tablesMode(): boolean {
      return this.screen.teams?.mode === "tables";
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

    totalAnswers(): number | null {
      const t = this.screen.tallies;
      if (!t) return null;
      if (t.total_answers != null) return Number(t.total_answers);
      if (t.guesses) return t.guesses.length;
      return null;
    },

    noAnswers(): boolean {
      return this.totalAnswers === 0;
    },

    singleAnswer(): boolean {
      return this.totalAnswers === 1 && (this.screen.player_count || 0) > 1;
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
      count: number;
    }[] {
      const sides = (this.config.sides || []) as {
        name?: string;
        color?: string;
        initial?: string;
      }[];
      const options = this.question?.options || [];
      const count = Math.max(sides.length, options.length, 2);
      const cards: {
        name: string;
        color: string;
        initial: string;
        percent: number;
        correct: boolean;
        count: number;
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
          count: tally?.count ?? 0,
        });
      }
      return cards;
    },

    /* ---- tug of war ---- */
    ropePercents(): number[] {
      const a = this.sideCards[0]?.count ?? 0;
      const b = this.sideCards[1]?.count ?? 0;
      const total = a + b;
      if (!total) return [50, 50];
      const pa = Math.round((a / total) * 100);
      return [pa, 100 - pa];
    },

    ropeLeader(): number {
      const a = this.sideCards[0]?.count ?? 0;
      const b = this.sideCards[1]?.count ?? 0;
      if (a === b) return -1;
      return a > b ? 0 : 1;
    },

    ropeNote(): string {
      const a = this.sideCards[0]?.count ?? 0;
      const b = this.sideCards[1]?.count ?? 0;
      const total = a + b;
      if (!total) return "ממתינים להצבעות. עוד אף אחד לא משך בחבל";
      if (a === b) return total === 1 ? "הצבעה אחת עד עכשיו" : "תיקו! החבל נשאר באמצע";
      const lead = this.sideCards[a > b ? 0 : 1]?.name || "";
      return total === 1 ? `הצבעה אחת עד עכשיו: ${lead}` : `${lead} מובילים`;
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

    /* ---- number ---- */
    numberMin(): number {
      return Number(this.config.min ?? 0);
    },

    numberMax(): number {
      return Number(this.config.max ?? 100);
    },

    numberUnit(): string {
      return String(this.config.unit || "");
    },

    numberCorrect(): number | null {
      if (this.screen.correct?.number != null) return Number(this.screen.correct.number);
      if (this.config.correct != null && this.questionType === "number") {
        return Number(this.config.correct);
      }
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

    /* ---- date ---- */
    dateGuessDays(): number[] {
      const guesses = this.screen.tallies?.guesses || [];
      return guesses
        .map((g) => toDays(g.value))
        .filter((v): v is number => v != null);
    },

    dateCorrectDays(): number | null {
      return toDays(this.screen.correct?.date ?? this.config.correct);
    },

    dateCorrectLabel(): string {
      return this.dateCorrectDays == null ? "" : daysToLabel(this.dateCorrectDays);
    },

    closestDateLabel(): string {
      const d = toDays(this.screen.correct?.closest?.value);
      return d == null ? "" : daysToLabel(d);
    },

    dateAxis(): { lo: number; hi: number } | null {
      const days = [...this.dateGuessDays];
      if (this.isReveal && this.dateCorrectDays != null) days.push(this.dateCorrectDays);
      const cfgLo = toDays(this.config.min);
      const cfgHi = toDays(this.config.max);
      let lo = cfgLo ?? (days.length ? Math.min(...days) : null);
      let hi = cfgHi ?? (days.length ? Math.max(...days) : null);
      if (lo == null || hi == null) return null;
      if (hi - lo < 30) {
        const mid = (lo + hi) / 2;
        lo = mid - 30;
        hi = mid + 30;
      } else if (cfgLo == null || cfgHi == null) {
        const pad = (hi - lo) * 0.1;
        lo -= pad;
        hi += pad;
      }
      return { lo, hi };
    },

    dateTicks(): { pos: number; label: string }[] {
      const axis = this.dateAxis;
      if (!axis) return [];
      const mid = Math.round((axis.lo + axis.hi) / 2);
      return [
        { pos: 2, label: daysToLabel(Math.round(axis.lo)) },
        { pos: 50, label: daysToLabel(mid) },
        { pos: 98, label: daysToLabel(Math.round(axis.hi)) },
      ];
    },

    /* ---- map ---- */
    mapGuesses(): { x: number; y: number }[] {
      const guesses = this.screen.tallies?.guesses || [];
      return guesses
        .filter((g) => g.x != null && g.y != null)
        .map((g) => ({ x: Number(g.x), y: Number(g.y) }));
    },

    mapCorrect(): { x: number; y: number } | null {
      const x = this.screen.correct?.x ?? this.config.correct_x;
      const y = this.screen.correct?.y ?? this.config.correct_y;
      if (x == null || y == null) return null;
      return { x: Number(x), y: Number(y) };
    },

    mapLabel(): string {
      return String(this.config.label || "");
    },

    mapCountText(): string {
      const n = this.mapGuesses.length;
      if (!n) return "עדיין אין נעצים על המפה";
      if (n === 1) return "נעץ אחד על המפה";
      return `${n} נעצים על המפה`;
    },

    /* ---- cloud / finish ---- */
    finishPrefix(): string {
      return this.questionType === "finish" ? String(this.config.prefix || "") : "";
    },

    cloudWords(): { text: string; count: number; size: number; tone: string }[] {
      const raw = (this.screen.tallies?.words || []).slice(0, 36);
      if (!raw.length) return [];
      const max = Math.max(...raw.map((w) => w.count), 1);
      const sized = raw.map((w, i) => ({
        text: w.text,
        count: w.count,
        size:
          max === 1
            ? Math.max(30, 52 - Math.floor(raw.length / 3))
            : Math.round(30 + (w.count / max) * 62),
        tone: ["a", "b", "c"][i % 3],
      }));
      // Biggest words in the middle, smaller ones fanning out.
      const out: typeof sized = [];
      sized.forEach((item, i) => {
        if (i % 2 === 0) out.push(item);
        else out.unshift(item);
      });
      return out;
    },

    /* ---- rate ---- */
    rateRows(): { value: number; count: number; width: number }[] {
      const dist = this.screen.tallies?.distribution || [];
      const max = Math.max(...dist.map((d) => d.count), 1);
      return dist.map((d) => ({
        value: d.value,
        count: d.count,
        width: Math.round((d.count / max) * 100),
      }));
    },

    rateAverageText(): string {
      const avg = this.screen.tallies?.average;
      return avg == null ? "—" : Number(avg).toFixed(1);
    },

    rateCaption(): string {
      const n = Number(this.screen.tallies?.total_answers ?? 0);
      if (!n) return "עדיין אין דירוגים";
      if (n === 1) return "דירוג אחד";
      return `ממוצע מתוך ${n} דירוגים`;
    },

    /* ---- order ---- */
    orderRows(): { id: number | string; label: string }[] {
      const options = (this.question?.options || []).map(
        (o: TriviaQuestionDto["options"][number], i: number) => ({
          id: o.id ?? i,
          label: o.label,
        })
      );
      const ids = this.screen.correct?.option_ids || [];
      if (this.isReveal && ids.length) {
        const byId = new Map<number, { id: number | string; label: string }>(
          options.map((o) => [Number(o.id), o])
        );
        const ordered: { id: number | string; label: string }[] = [];
        ids.forEach((id) => {
          const found = byId.get(Number(id));
          if (found) ordered.push(found);
        });
        if (ordered.length === options.length) return ordered;
      }
      return options;
    },

    /* ---- match ---- */
    matchLeft(): { id: number | string; label: string }[] {
      return (this.question?.options || []).map(
        (o: TriviaQuestionDto["options"][number], i: number) => ({
          id: o.id ?? i,
          label: o.label,
        })
      );
    },

    matchRight(): { id: number | string; label: string }[] {
      const items = this.config.right_items;
      if (Array.isArray(items)) {
        return items.map((r: any, i: number) => ({
          id: r?.id ?? i,
          label: String(r?.label ?? ""),
        }));
      }
      const labels = this.config.right_labels;
      if (Array.isArray(labels)) {
        return labels.map((label: unknown, i: number) => ({ id: i, label: String(label ?? "") }));
      }
      return [];
    },

    matchRows(): { left: string; right: string }[] {
      const labels: string[] =
        this.screen.correct?.right_labels ||
        (Array.isArray(this.config.right_labels)
          ? this.config.right_labels.map((l: unknown) => String(l ?? ""))
          : []);
      let pairs = this.screen.correct?.pairs || this.config.correct_pairs;
      if (!Array.isArray(pairs) || !pairs.length) {
        const map = this.config.correct_map;
        pairs = this.matchLeft.map((o, i) => ({
          left_id: o.id,
          right_id: Array.isArray(map) && map[i] != null ? Number(map[i]) : i,
        }));
      }
      const leftById = new Map(this.matchLeft.map((o) => [Number(o.id), o.label]));
      return (pairs as { left_id: number; right_id: number }[])
        .map((p) => ({
          left: leftById.get(Number(p.left_id)) || "",
          right: labels[Number(p.right_id)] || "",
        }))
        .filter((r) => r.left || r.right);
    },

    /* ---- fill in the blank ---- */
    fillLetters(): string[] {
      const letters = this.config.letters;
      const raw = Array.isArray(letters) ? letters.join("") : String(letters || "");
      return Array.from(raw.replace(/\s+/g, ""));
    },

    fillAnswerChars(): string[] {
      const answer = this.screen.correct?.answer ?? this.config.answer ?? "";
      return Array.from(String(answer).trim());
    },

    /* ---- buzzer ---- */
    buzzerWinner(): { nickname: string; seconds: string } | null {
      const w = this.screen.correct?.winner;
      if (!w?.nickname) return null;
      return {
        nickname: w.nickname,
        seconds: w.elapsed_ms != null ? (Number(w.elapsed_ms) / 1000).toFixed(2) : "",
      };
    },

    /* ---- media ---- */
    mediaUrl(): string {
      return this.question?.media?.url || "";
    },

    mediaKind(): "image" | "video" | "audio" {
      const kind = String(this.question?.media?.kind || "");
      if (kind === "video" || kind === "audio" || kind === "image") return kind;
      if (this.questionType === "video") return "video";
      if (this.questionType === "audio") return "audio";
      return "image";
    },

    isMediaLayout(): boolean {
      return isMediaType(this.questionType);
    },

    isBlur(): boolean {
      return this.questionType === "blur";
    },

    blurStyle(): Record<string, string> {
      if (!this.isBlur) return {};
      let p = 0;
      if (this.preview) p = 0.45;
      else if (this.phase === "question") p = Math.max(0, Math.min(1, this.timerProgress));
      return { filter: `blur(${(p * MAX_BLUR_PX).toFixed(1)}px)` };
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

    datePos(days: number): number {
      const axis = this.dateAxis;
      if (!axis || axis.hi === axis.lo) return 50;
      const pos = ((days - axis.lo) / (axis.hi - axis.lo)) * 100;
      return Math.max(2, Math.min(98, pos));
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/trivia-stage.scss";
</style>
