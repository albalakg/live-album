<template>
  <section class="tb-editor-panel" :class="{ 'mob-on': mobOn }">
    <div v-if="!question" class="tb-empty">
      <h3>בחרו שאלה</h3>
      <p>או הוסיפו שאלה חדשה מהרשימה.</p>
    </div>

    <template v-else>
      <div class="tb-editor-tools-wrap">
        <div class="tb-editor-tools">
          <button
            type="button"
            class="tb-type-badge"
            :disabled="locked"
            @click="$emit('change-type')"
          >
            <span class="gal-ico" :style="{ background: typeMeta?.bg || '#eee' }">
              {{ typeMeta?.ico || "?" }}
            </span>
            {{ typeMeta?.label || question.type }}
            <span class="chg">שינוי</span>
          </button>
          <button
            type="button"
            class="tb-icon-btn"
            title="שכפול"
            aria-label="שכפול שאלה"
            :disabled="locked || atCap"
            @click="$emit('duplicate')"
          >
            <span class="material-symbols-outlined" style="font-size: 18px">content_copy</span>
          </button>
          <button
            type="button"
            class="tb-icon-btn danger"
            title="מחיקה"
            aria-label="מחיקת שאלה"
            :disabled="locked"
            @click="$emit('delete')"
          >
            <span class="material-symbols-outlined" style="font-size: 18px">delete</span>
          </button>
        </div>
      </div>

      <div class="tb-editor">
        <label class="tb-field">
          <span>השאלה</span>
          <textarea
            class="tb-prompt"
            :value="question.prompt"
            :disabled="locked"
            maxlength="500"
            rows="3"
            placeholder="לדוגמה: איפה נפגשו עמית וגל לראשונה?"
            @input="patch({ prompt: ($event.target as HTMLTextAreaElement).value })"
          ></textarea>
        </label>

        <!-- who / whosaid / thisorthat -->
        <div v-if="isTwoCard" class="tb-who-grid">
          <div
            v-for="(side, i) in sideCards"
            :key="i"
            class="tb-who-side"
            :class="{ correct: !unscored && question.options[i]?.is_correct }"
          >
            <div
              class="tb-who-avatar"
              :style="{ background: side.color }"
            >{{ side.initial }}</div>
            <input
              type="text"
              :value="question.options[i]?.label || side.name"
              :disabled="locked"
              maxlength="80"
              @input="updateSideLabel(i, ($event.target as HTMLInputElement).value)"
            />
            <button
              v-if="!unscored"
              type="button"
              class="tb-mark"
              :class="{ on: question.options[i]?.is_correct }"
              :disabled="locked"
              @click="markCorrect(i)"
            >
              {{ question.options[i]?.is_correct ? "התשובה" : "סמן כתשובה" }}
            </button>
            <span v-else class="tb-hint-row">בלי תשובה נכונה</span>
          </div>
        </div>

        <!-- twothruths -->
        <div v-else-if="question.type === 'twothruths'" class="tb-opts">
          <div
            v-for="(opt, i) in question.options"
            :key="opt.key"
            class="tb-opt"
            :class="{ correct: opt.is_correct }"
          >
            <span class="tb-opt-letter" :style="{ background: letterColor(i) }">{{ i + 1 }}</span>
            <input
              type="text"
              :value="opt.label"
              :disabled="locked"
              maxlength="200"
              placeholder="משפט"
              @input="updateOption(i, { label: ($event.target as HTMLInputElement).value })"
            />
            <button
              type="button"
              class="tb-mark"
              :class="{ on: opt.is_correct }"
              :disabled="locked"
              @click="markLie(i)"
            >
              {{ opt.is_correct ? "זה השקר" : "סמן כשקר" }}
            </button>
            <span></span>
          </div>
        </div>

        <!-- number -->
        <template v-else-if="question.type === 'number'">
          <div class="tb-num-range">
            <label class="tb-field">
              <span>מ־</span>
              <input
                type="number"
                :value="numConfig.min"
                :disabled="locked"
                @input="patchNum('min', Number(($event.target as HTMLInputElement).value))"
              />
            </label>
            <label class="tb-field">
              <span>עד</span>
              <input
                type="number"
                :value="numConfig.max"
                :disabled="locked"
                @input="patchNum('max', Number(($event.target as HTMLInputElement).value))"
              />
            </label>
            <label class="tb-field">
              <span>התשובה</span>
              <input
                type="number"
                :value="numConfig.correct"
                :disabled="locked"
                @input="patchNum('correct', Number(($event.target as HTMLInputElement).value))"
              />
            </label>
          </div>
          <label class="tb-field">
            <span>יחידה (אופציונלי)</span>
            <input
              type="text"
              :value="numConfig.unit || ''"
              :disabled="locked"
              maxlength="40"
              @input="patchNum('unit', ($event.target as HTMLInputElement).value)"
            />
          </label>
          <p class="tb-hint-row">
            מי שהכי קרוב מקבל את מלוא הנקודות, והשאר לפי המרחק.
          </p>
        </template>

        <!-- rate -->
        <template v-else-if="question.type === 'rate'">
          <div class="tb-num-range two">
            <label class="tb-field">
              <span>הציון הנמוך</span>
              <input
                type="number"
                :value="rateConfig.min"
                :disabled="locked"
                @input="patchConfig({ min: Number(($event.target as HTMLInputElement).value) })"
              />
            </label>
            <label class="tb-field">
              <span>הציון הגבוה</span>
              <input
                type="number"
                :value="rateConfig.max"
                :disabled="locked"
                @input="patchConfig({ max: Number(($event.target as HTMLInputElement).value) })"
              />
            </label>
          </div>
          <p class="tb-hint-row">
            האורחים מדרגים עם סליידר, והממוצע מוצג על המסך. בלי תשובה נכונה.
          </p>
        </template>

        <!-- date -->
        <template v-else-if="question.type === 'date'">
          <label class="tb-field">
            <span>התאריך הנכון</span>
            <input
              type="date"
              class="tb-date-input"
              :value="dateIso"
              :disabled="locked"
              @input="patchDate(($event.target as HTMLInputElement).value)"
            />
          </label>
          <p class="tb-hint-row">
            האורחים בוחרים תאריך. מי שהכי קרוב מקבל את מלוא הנקודות, והשאר לפי המרחק.
          </p>
        </template>

        <!-- map -->
        <template v-else-if="question.type === 'map'">
          <div class="tb-map-editor">
            <div class="tb-map-preview">
              <TriviaMapPin
                :correct="mapPoint"
                :label="mapConfig.label"
                aria-label="מפה: לחצו כדי לסמן את המקום הנכון"
                :disabled="locked"
                @update:model-value="setMapPoint"
              />
              <p class="tb-hint-row">לחצו על המפה כדי לסמן את המקום הנכון.</p>
            </div>
            <div class="tb-map-fields">
              <label class="tb-field">
                <span>שם המקום (מוצג בחשיפה)</span>
                <input
                  type="text"
                  :value="mapConfig.label"
                  :disabled="locked"
                  maxlength="60"
                  @input="patchConfig({ label: ($event.target as HTMLInputElement).value })"
                />
              </label>
              <div class="tb-num-range two">
                <label class="tb-field">
                  <span>מרחק מהצד (0–100)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    :value="mapConfig.x"
                    :disabled="locked"
                    @input="patchMapCoord('correct_x', ($event.target as HTMLInputElement).value)"
                  />
                </label>
                <label class="tb-field">
                  <span>מרחק מלמעלה (0–100)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    :value="mapConfig.y"
                    :disabled="locked"
                    @input="patchMapCoord('correct_y', ($event.target as HTMLInputElement).value)"
                  />
                </label>
              </div>
              <p class="tb-hint-row">
                המפה היא ציור מופשט, בלי מפה אמיתית. מי שהנעץ שלו הכי קרוב מנצח.
              </p>
            </div>
          </div>
        </template>

        <!-- cloud -->
        <template v-else-if="question.type === 'cloud'">
          <p class="tb-hint-row tb-hint-box">
            כתבו רק את השאלה. האורחים יכתבו מילה או שתיים, והמילים יעלו למסך כענן. בלי תשובה נכונה.
          </p>
          <TriviaApprovalToggle
            :checked="!!question.requires_approval"
            :disabled="!question.id"
            @toggle="$emit('approval', $event)"
          />
        </template>

        <!-- finish -->
        <template v-else-if="question.type === 'finish'">
          <label class="tb-field">
            <span>תחילת המשפט (מוצגת לאורחים)</span>
            <input
              type="text"
              :value="finishConfig.prefix"
              :disabled="locked"
              maxlength="160"
              placeholder="הכי משוגע באירוע זה ש…"
              @input="patchConfig({ prefix: ($event.target as HTMLInputElement).value })"
            />
          </label>
          <p class="tb-hint-row">
            האורחים משלימים את המשפט, והתשובות עולות למסך. בלי תשובה נכונה.
          </p>
          <TriviaApprovalToggle
            :checked="!!question.requires_approval"
            :disabled="!question.id"
            @toggle="$emit('approval', $event)"
          />
        </template>

        <!-- fillblank -->
        <template v-else-if="question.type === 'fillblank'">
          <label class="tb-field">
            <span>המילה הנכונה</span>
            <input
              type="text"
              :value="fillConfig.answer"
              :disabled="locked"
              maxlength="40"
              @input="patchConfig({ answer: ($event.target as HTMLInputElement).value })"
            />
          </label>
          <label class="tb-field">
            <span>האותיות שמוצגות לאורחים</span>
            <input
              type="text"
              :value="fillConfig.letters"
              :disabled="locked"
              maxlength="40"
              placeholder="האותיות של המילה, ועוד כמה מבלבלות"
              @input="patchConfig({ letters: ($event.target as HTMLInputElement).value })"
            />
          </label>
          <button
            type="button"
            class="tb-linkish"
            :disabled="locked || !fillConfig.answer.trim()"
            @click="suggestLetters"
          >ערבוב אותיות מהמילה</button>
          <p class="tb-hint-row">
            האורחים מרכיבים את המילה מהאותיות. כדאי להוסיף שתיים־שלוש אותיות מיותרות.
          </p>
        </template>

        <!-- match -->
        <template v-else-if="question.type === 'match'">
          <div class="tb-field">
            <span>זוגות להתאמה</span>
            <div class="tb-match-rows">
              <div
                v-for="(opt, i) in question.options"
                :key="opt.key"
                class="tb-match-row"
              >
                <span class="tb-opt-letter" :style="{ background: letterColor(i) }">{{ i + 1 }}</span>
                <input
                  type="text"
                  :value="opt.label"
                  :disabled="locked"
                  maxlength="120"
                  placeholder="פריט"
                  @input="updateOption(i, { label: ($event.target as HTMLInputElement).value })"
                />
                <span class="tb-match-arrow" aria-hidden="true">⟷</span>
                <input
                  type="text"
                  :value="matchRights[i] || ''"
                  :disabled="locked"
                  maxlength="120"
                  placeholder="הזוג שלו"
                  @input="updateRight(i, ($event.target as HTMLInputElement).value)"
                />
                <select
                  :value="matchMap[i] ?? i"
                  :disabled="locked"
                  :aria-label="`הזוג הנכון של פריט ${i + 1}`"
                  @change="setMatch(i, Number(($event.target as HTMLSelectElement).value))"
                >
                  <option
                    v-for="(_, r) in question.options"
                    :key="r"
                    :value="r"
                  >{{ matchRights[r] || `זוג ${r + 1}` }}</option>
                </select>
                <button
                  type="button"
                  class="tb-icon-btn"
                  aria-label="מחיקת זוג"
                  :disabled="locked || question.options.length <= minOptions"
                  @click="removeMatchRow(i)"
                >×</button>
              </div>
            </div>
            <button
              v-if="question.options.length < maxOptions"
              type="button"
              class="tb-linkish"
              :disabled="locked"
              @click="addMatchRow"
            >+ זוג נוסף</button>
            <p class="tb-hint-row">
              בכל שורה: פריט, הזוג שלו, ובחירה של הזוג הנכון. האורחים יראו את הצד הימני מעורבב.
            </p>
            <p v-if="matchDuplicate" class="tb-hint-row tb-warn">
              שני פריטים מצביעים על אותו זוג. כדאי שלכל פריט יהיה זוג משלו.
            </p>
          </div>
        </template>

        <!-- order -->
        <template v-else-if="question.type === 'order'">
          <div class="tb-field">
            <span>סדר נכון, מהראשון לאחרון</span>
            <div class="tb-opts">
              <div
                v-for="(opt, i) in question.options"
                :key="opt.key"
                class="tb-opt tb-order-row"
              >
                <span class="tb-opt-letter" :style="{ background: letterColor(i) }">{{ i + 1 }}</span>
                <input
                  type="text"
                  :value="opt.label"
                  :disabled="locked"
                  maxlength="200"
                  placeholder="אירוע"
                  @input="updateOption(i, { label: ($event.target as HTMLInputElement).value })"
                />
                <span class="tb-order-btns">
                  <button
                    type="button"
                    class="tb-icon-btn"
                    aria-label="הזזה למעלה"
                    :disabled="locked || i === 0"
                    @click="moveOption(i, -1)"
                  >↑</button>
                  <button
                    type="button"
                    class="tb-icon-btn"
                    aria-label="הזזה למטה"
                    :disabled="locked || i === question.options.length - 1"
                    @click="moveOption(i, 1)"
                  >↓</button>
                </span>
                <button
                  type="button"
                  class="tb-icon-btn"
                  aria-label="מחיקת פריט"
                  :disabled="locked || question.options.length <= minOptions"
                  @click="removeOption(i)"
                >×</button>
              </div>
            </div>
            <button
              v-if="question.options.length < maxOptions"
              type="button"
              class="tb-linkish"
              :disabled="locked"
              @click="addOption"
            >+ פריט נוסף</button>
            <p class="tb-hint-row">
              כתבו לפי הסדר הנכון. האורחים יראו אותם מעורבבים וירכיבו את הסדר.
            </p>
          </div>
        </template>

        <!-- choice / multi / truefalse / poll / buzzer / emoji + media types -->
        <template v-else>
          <div v-if="isMedia" class="tb-field">
            <span>{{ mediaPickerLabel }}</span>
            <div v-if="pickerItems.length" class="tb-photo-pick">
              <button
                v-for="photo in pickerItems"
                :key="photo.id"
                type="button"
                :class="{ on: question.media_asset_id === photo.id }"
                :disabled="locked"
                @click="pickPhoto(photo)"
              >
                <video
                  v-if="photo.kind === 'video'"
                  :src="photo.url"
                  muted
                  playsinline
                  preload="metadata"
                ></video>
                <img v-else :src="photo.url" alt="" />
              </button>
            </div>
            <p v-else class="tb-hint-row">{{ mediaEmptyHint }}</p>
            <p v-if="mediaHint" class="tb-hint-row">{{ mediaHint }}</p>
          </div>
          <p v-else-if="typeHint" class="tb-hint-row tb-hint-box">{{ typeHint }}</p>

          <div class="tb-field">
            <span>תשובות</span>
            <div class="tb-opts">
              <div
                v-for="(opt, i) in question.options"
                :key="opt.key"
                class="tb-opt"
                :class="{ correct: !unscored && opt.is_correct }"
              >
                <span class="tb-opt-letter" :style="{ background: letterColor(i) }">{{ letter(i) }}</span>
                <input
                  type="text"
                  :value="opt.label"
                  :disabled="locked || question.type === 'truefalse'"
                  maxlength="200"
                  placeholder="תשובה"
                  @input="updateOption(i, { label: ($event.target as HTMLInputElement).value })"
                />
                <button
                  v-if="!unscored"
                  type="button"
                  class="tb-mark"
                  :class="{ on: opt.is_correct }"
                  :disabled="locked"
                  @click="isMultiMark ? toggleCorrect(i) : markCorrect(i)"
                >
                  {{ opt.is_correct ? (question.type === "spotdiff" ? "הבדל" : "נכונה") : question.type === "spotdiff" ? "סמן כהבדל" : "סמן כנכונה" }}
                </button>
                <span v-else></span>
                <button
                  v-if="question.type !== 'truefalse'"
                  type="button"
                  class="tb-icon-btn"
                  aria-label="מחיקת תשובה"
                  :disabled="locked || question.options.length <= 2"
                  @click="removeOption(i)"
                >×</button>
                <span v-else></span>
              </div>
            </div>
            <button
              v-if="question.type !== 'truefalse' && question.options.length < 6"
              type="button"
              class="tb-linkish"
              :disabled="locked"
              @click="addOption"
            >+ תשובה נוספת</button>
          </div>
        </template>

        <div class="tb-advanced" :class="{ open: advancedOpen }">
          <button type="button" class="tb-advanced-tog" @click="advancedOpen = !advancedOpen">
            הגדרות נוספות
            <span class="chev">▾</span>
          </button>
          <div class="tb-advanced-body">
            <div class="tb-meta-row">
              <label class="tb-field">
                <span>שניות</span>
                <input
                  type="number"
                  min="5"
                  max="120"
                  :value="question.time_limit_seconds"
                  :disabled="locked"
                  @input="patch({ time_limit_seconds: Number(($event.target as HTMLInputElement).value) })"
                />
              </label>
              <label class="tb-field">
                <span>{{ unscored ? "בלי ניקוד" : "נקודות" }}</span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  :value="question.max_points"
                  :disabled="locked || unscored"
                  @input="patch({ max_points: Number(($event.target as HTMLInputElement).value) })"
                />
              </label>
            </div>
            <label class="tb-field">
              <span>רמז למנחה, לא מוצג לאורחים</span>
              <input
                type="text"
                :value="question.host_hint"
                :disabled="locked"
                maxlength="200"
                placeholder="למשל: להזכיר את הטיול לצפון"
                @input="patch({ host_hint: ($event.target as HTMLInputElement).value })"
              />
            </label>
            <label class="tb-field">
              <span>רקע קצר, אחרי החשיפה</span>
              <textarea
                rows="2"
                :value="question.fun_fact"
                :disabled="locked"
                maxlength="500"
                @input="patch({ fun_fact: ($event.target as HTMLTextAreaElement).value })"
              ></textarea>
            </label>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import TriviaMapPin from "@/components/event/trivia/TriviaMapPin.vue";
import TriviaApprovalToggle from "@/components/event/trivia/TriviaApprovalToggle.vue";
import {
  TriviaBuilderQuestion,
  nextBuilderKey,
} from "@/helpers/triviaBuilder";
import {
  TRIVIA_LETTERS,
  TRIVIA_LETTER_COLORS,
  dateToIso,
  isBuzzerType,
  isMatchType,
  isMediaType,
  isOrderType,
  isTwoCardType,
  isUnscoredType,
  isoToDateNumber,
  triviaTypeMeta,
} from "@/helpers/triviaTypes";

interface PickerItem {
  id: number;
  url: string;
  kind?: string;
}

const HEBREW_DECOYS = ["א", "ב", "ג", "ד", "ה", "ו", "ל", "מ", "נ", "ר", "ש", "ת"];

export default defineComponent({
  name: "TriviaQuestionEditor",

  components: { TriviaMapPin, TriviaApprovalToggle },

  props: {
    question: {
      type: Object as PropType<TriviaBuilderQuestion | null>,
      default: null,
    },
    locked: { type: Boolean, default: false },
    atCap: { type: Boolean, default: false },
    mobOn: { type: Boolean, default: false },
    albumPhotos: {
      type: Array as PropType<PickerItem[]>,
      default: () => [],
    },
  },

  emits: ["update", "change-type", "duplicate", "delete", "approval"],

  data() {
    return {
      advancedOpen: false,
    };
  },

  computed: {
    typeMeta(): ReturnType<typeof triviaTypeMeta> | null {
      return this.question ? triviaTypeMeta(this.question.type) : null;
    },
    unscored(): boolean {
      return this.question ? isUnscoredType(this.question.type) : false;
    },
    isTwoCard(): boolean {
      return this.question ? isTwoCardType(this.question.type) : false;
    },
    isMedia(): boolean {
      return this.question ? isMediaType(this.question.type) : false;
    },
    isMultiMark(): boolean {
      const t = this.question?.type;
      return t === "multi" || t === "spotdiff";
    },
    minOptions(): number {
      const t = this.question?.type || "";
      if (isOrderType(t)) return 3;
      return 2;
    },
    maxOptions(): number {
      const t = this.question?.type || "";
      return isMatchType(t) ? 4 : 6;
    },
    cfg(): Record<string, any> {
      return (this.question?.config || {}) as Record<string, any>;
    },
    rateConfig(): { min: number; max: number } {
      return { min: Number(this.cfg.min ?? 1), max: Number(this.cfg.max ?? 10) };
    },
    dateIso(): string {
      return dateToIso(this.cfg.correct);
    },
    mapConfig(): { x: number; y: number; label: string } {
      return {
        x: Number(this.cfg.correct_x ?? 50),
        y: Number(this.cfg.correct_y ?? 50),
        label: String(this.cfg.label ?? ""),
      };
    },
    mapPoint(): { x: number; y: number } {
      return { x: this.mapConfig.x, y: this.mapConfig.y };
    },
    finishConfig(): { prefix: string } {
      return { prefix: String(this.cfg.prefix ?? "") };
    },
    fillConfig(): { answer: string; letters: string } {
      const letters = this.cfg.letters;
      return {
        answer: String(this.cfg.answer ?? ""),
        letters: Array.isArray(letters) ? letters.join("") : String(letters ?? ""),
      };
    },
    /** Right-hand labels (server key right_labels; legacy: rights). */
    matchRights(): string[] {
      const raw = this.cfg.right_labels ?? this.cfg.rights ?? [];
      return Array.isArray(raw) ? raw.map((r: unknown) => String(r ?? "")) : [];
    },
    /** correct_map[leftIndex] = rightIndex (legacy: answer_map). */
    matchMap(): number[] {
      const raw = this.cfg.correct_map ?? this.cfg.answer_map ?? [];
      const count = this.question?.options.length || 0;
      const out: number[] = [];
      for (let i = 0; i < count; i++) {
        const v = Array.isArray(raw) ? raw[i] : (raw as Record<string, unknown>)[i];
        out.push(Number.isFinite(Number(v)) && v != null ? Number(v) : i);
      }
      return out;
    },
    matchDuplicate(): boolean {
      return new Set(this.matchMap).size !== this.matchMap.length;
    },
    pickerItems(): PickerItem[] {
      const type = this.question?.type || "";
      const wantsVideo = type === "video" || type === "audio";
      return this.albumPhotos.filter((p) =>
        wantsVideo ? p.kind === "video" : p.kind !== "video"
      );
    },
    mediaPickerLabel(): string {
      const type = this.question?.type;
      if (type === "video") return "בחרו סרטון מהאלבום החי";
      if (type === "audio") return "בחרו קטע מהאלבום החי";
      return "בחרו תמונה מהאלבום החי";
    },
    mediaEmptyHint(): string {
      const type = this.question?.type;
      if (type === "video" || type === "audio") {
        return "אין עדיין סרטונים באלבום — אפשר לשמור את השאלה ולהוסיף אחר כך.";
      }
      return "אין עדיין תמונות באלבום — אפשר לשמור את השאלה ולהוסיף תמונה אחר כך.";
    },
    mediaHint(): string {
      switch (this.question?.type) {
        case "blur":
          return "התמונה מתחדדת לאט עם הזמן. מי שעונה מוקדם מקבל יותר נקודות.";
        case "spotdiff":
          return "סמנו כמה הבדלים בתשובות: כל תשובה שסימנתם היא הבדל שהאורחים צריכים למצוא.";
        case "video":
          return "הסרטון מתנגן על המסך ובטלפון של כל אורח.";
        case "audio":
          return "הקטע יתנגן כשמע בלבד, בלי תמונה.";
        default:
          return "";
      }
    },
    typeHint(): string {
      const t = this.question?.type || "";
      if (isBuzzerType(t)) {
        return "הראשון שעונה נכון לוקח את כל הנקודות. סמנו את התשובה הנכונה.";
      }
      if (t === "emoji") {
        return "כתבו את חידת האימוג׳י בשאלה, למשל 🗼🥖, ובחרו את התשובה הנכונה.";
      }
      return "";
    },
    numConfig(): { min: number; max: number; correct: number; unit: string } {
      const c = (this.question?.config || {}) as Record<string, unknown>;
      return {
        min: Number(c.min ?? 0),
        max: Number(c.max ?? 100),
        correct: Number(c.correct ?? 50),
        unit: String(c.unit ?? ""),
      };
    },
    sideCards(): { name: string; color: string; initial: string }[] {
      const sides = (this.question?.config as any)?.sides;
      if (Array.isArray(sides) && sides.length >= 2) {
        return sides.slice(0, 2).map((s: any, i: number) => ({
          name: s.name || this.question?.options[i]?.label || "",
          color: s.color || (i === 0 ? "#1F6F6A" : "#DC5B66"),
          initial: s.initial || (s.name || "?").slice(0, 1),
        }));
      }
      return [
        { name: "עמית", color: "#1F6F6A", initial: "ע" },
        { name: "גל", color: "#DC5B66", initial: "ג" },
      ];
    },
  },

  methods: {
    letter(i: number) {
      return TRIVIA_LETTERS[i] || String(i + 1);
    },
    letterColor(i: number) {
      return TRIVIA_LETTER_COLORS[i % TRIVIA_LETTER_COLORS.length];
    },
    patch(partial: Partial<TriviaBuilderQuestion>) {
      if (!this.question) return;
      // Mutate in place and emit the same object so list/editor identity stays
      // stable — replacing the question on every keystroke remounted inputs and
      // cleared visible values on blur.
      Object.assign(this.question, partial);
      this.$emit("update", this.question);
    },
    updateOption(index: number, partial: { label?: string; is_correct?: boolean }) {
      if (!this.question) return;
      const opt = this.question.options[index];
      if (!opt) return;
      Object.assign(opt, partial);
      this.$emit("update", this.question);
    },
    markCorrect(index: number) {
      if (!this.question) return;
      this.question.options.forEach((o, i) => {
        o.is_correct = i === index;
      });
      this.$emit("update", this.question);
    },
    toggleCorrect(index: number) {
      if (!this.question) return;
      const opt = this.question.options[index];
      if (!opt) return;
      opt.is_correct = !opt.is_correct;
      this.$emit("update", this.question);
    },
    markLie(index: number) {
      this.markCorrect(index);
    },
    addOption() {
      if (!this.question || this.question.options.length >= 6) return;
      this.patch({
        options: [
          ...this.question.options,
          {
            key: nextBuilderKey("o"),
            label: "",
            is_correct: false,
          },
        ],
      });
    },
    removeOption(index: number) {
      if (!this.question || this.question.options.length <= this.minOptions) return;
      this.patch({
        options: this.question.options.filter((_, i) => i !== index),
      });
    },
    updateSideLabel(index: number, label: string) {
      if (!this.question) return;
      const opt = this.question.options[index];
      if (opt) Object.assign(opt, { label });
      const sides = [...(this.sideCards as any[])];
      sides[index] = {
        ...sides[index],
        name: label,
        initial: label.slice(0, 1) || sides[index].initial,
      };
      this.patch({
        config: { ...(this.question.config || {}), sides },
      });
    },
    patchNum(key: string, value: number | string) {
      if (!this.question) return;
      this.patch({
        config: {
          ...this.numConfig,
          ...(this.question.config || {}),
          [key]: value,
        },
      });
    },
    pickPhoto(photo: PickerItem) {
      this.patch({
        media_asset_id: photo.id,
        media: { id: photo.id, url: photo.url, kind: photo.kind },
      });
    },
    patchConfig(partial: Record<string, unknown>) {
      if (!this.question) return;
      this.patch({ config: { ...(this.question.config || {}), ...partial } });
    },
    patchDate(iso: string) {
      const n = isoToDateNumber(iso);
      if (n != null) this.patchConfig({ correct: n });
    },
    patchMapCoord(key: "correct_x" | "correct_y", raw: string) {
      const n = Math.max(0, Math.min(100, Number(raw)));
      if (Number.isFinite(n)) this.patchConfig({ [key]: n });
    },
    setMapPoint(point: { x: number; y: number } | null) {
      if (!point) return;
      this.patchConfig({ correct_x: point.x, correct_y: point.y });
    },
    suggestLetters() {
      const answer = Array.from(this.fillConfig.answer.replace(/\s+/g, ""));
      if (!answer.length) return;
      const decoys = HEBREW_DECOYS.filter((c) => !answer.includes(c)).slice(0, 3);
      const pool = [...answer, ...decoys];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      this.patchConfig({ letters: pool.join("") });
    },
    moveOption(index: number, dir: -1 | 1) {
      if (!this.question) return;
      const target = index + dir;
      if (target < 0 || target >= this.question.options.length) return;
      const next = [...this.question.options];
      [next[index], next[target]] = [next[target], next[index]];
      this.patch({ options: next });
    },
    /** Write match config with the server keys and drop legacy ones. */
    writeMatch(
      rights: string[],
      map: number[],
      options?: TriviaBuilderQuestion["options"]
    ) {
      if (!this.question) return;
      const next = { ...(this.question.config || {}) } as Record<string, unknown>;
      delete next.rights;
      delete next.answer_map;
      next.right_labels = rights;
      next.correct_map = map;
      if (options) this.patch({ options, config: next });
      else this.patch({ config: next });
    },
    updateRight(index: number, label: string) {
      const rights = [...this.matchRights];
      while (rights.length <= index) rights.push("");
      rights[index] = label;
      this.writeMatch(rights, this.matchMap);
    },
    setMatch(index: number, right: number) {
      const map = [...this.matchMap];
      map[index] = right;
      this.writeMatch(this.paddedRights(), map);
    },
    paddedRights(): string[] {
      const count = this.question?.options.length || 0;
      const rights = [...this.matchRights];
      while (rights.length < count) rights.push("");
      return rights.slice(0, count);
    },
    addMatchRow() {
      if (!this.question || this.question.options.length >= this.maxOptions) return;
      const count = this.question.options.length;
      const rights = [...this.paddedRights(), ""];
      const map = [...this.matchMap, count];
      this.writeMatch(rights, map, [
        ...this.question.options,
        { key: nextBuilderKey("o"), label: "", is_correct: false },
      ]);
    },
    removeMatchRow(index: number) {
      if (!this.question || this.question.options.length <= this.minOptions) return;
      const rights = this.paddedRights().filter((_, i) => i !== index);
      const map = this.matchMap
        .filter((_, i) => i !== index)
        .map((r, i) => {
          if (r === index) return i;
          return r > index ? r - 1 : r;
        });
      this.writeMatch(
        rights,
        map,
        this.question.options.filter((_, i) => i !== index)
      );
    },
  },
});
</script>
