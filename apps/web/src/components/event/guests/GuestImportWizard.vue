<template>
  <Teleport to="body">
  <div class="gs-ui gs-overlay import-overlay" @mousedown.self="close">
    <section class="gs-dialog import-dialog" role="dialog" aria-modal="true" aria-label="ייבוא אורחים">
      <header class="imp-head">
        <div>
          <h2>{{ stepTitle }}</h2>
          <p class="gs-dialog-lede">{{ stepLede }}</p>
        </div>
        <button class="gs-btn gs-btn-sm gs-btn-ghost" type="button" @click="close">סגירה</button>
      </header>

      <ol class="wiz-steps" aria-label="שלבי הייבוא">
        <li v-for="(s, i) in stepNames" :key="s" :class="{ on: step === i + 1, done: step > i + 1 }">
          <span class="num">{{ step > i + 1 ? "✓" : i + 1 }}</span>{{ s }}
        </li>
      </ol>

      <!-- 1. upload -->
      <div v-if="step === 1" class="step-body">
        <label
          class="drop"
          :class="{ over: dragOver, busy: parsing }"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onDrop"
        >
          <input ref="file" type="file" class="gs-sr" accept=".xlsx,.csv,.txt,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" @change="onPick" />
          <span class="drop-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /></svg>
          </span>
          <b>{{ parsing ? "קוראים את הקובץ…" : "גררו לכאן קובץ Excel או CSV" }}</b>
          <span>או <u>בחרו קובץ</u> מהמחשב · עד 5,000 שורות</span>
        </label>
        <p v-if="parseError" class="gs-error big" role="alert">{{ parseError }}</p>
        <div class="tips">
          <p><b>מה צריך בקובץ?</b> שורת כותרות ואז שורה לכל הזמנה. רק השם חובה. טלפון, מייל, כמה מגיעים, קבוצה, צד, אישור הגעה והערות הם רשות.</p>
          <p>עברית עובדת גם בקובצי CSV שנשמרו ב-Excel הישן. אין צורך לסדר את העמודות, נתאים אותן בשלב הבא.</p>
          <button class="gs-btn gs-btn-sm" type="button" @click="downloadTemplate">הורדת קובץ לדוגמה</button>
        </div>
      </div>

      <!-- 2. map -->
      <div v-else-if="step === 2 && sheet" class="step-body">
        <p class="file-line">
          <b>{{ fileName }}</b> · {{ sheet.rows.length.toLocaleString("he-IL") }} שורות · {{ sheet.headers.length }} עמודות
        </p>
        <div class="map-table" role="table" aria-label="מיפוי עמודות">
          <div class="map-row map-head" role="row">
            <span role="columnheader">עמודה בקובץ</span>
            <span role="columnheader">דוגמה</span>
            <span role="columnheader">שדה ב-SnapShare</span>
          </div>
          <div v-for="(h, i) in sheet.headers" :key="i" class="map-row" role="row">
            <span role="cell" class="col-name">{{ h }}</span>
            <span role="cell" class="sample">{{ samples[i] || "—" }}</span>
            <span role="cell">
              <select v-model="mapping[i]" class="gs-select" :aria-label="'שדה עבור ' + h">
                <option v-for="(label, key) in fieldLabels" :key="key" :value="key">{{ label }}</option>
              </select>
            </span>
          </div>
        </div>
        <p v-if="mapError" class="gs-error big" role="alert">{{ mapError }}</p>
        <fieldset class="dup-choice">
          <legend>אורח שכבר קיים ברשימה (לפי טלפון או מייל)</legend>
          <label><input v-model="onDuplicate" type="radio" value="skip" /> לדלג ולהשאיר את מה שיש</label>
          <label><input v-model="onDuplicate" type="radio" value="update" /> לעדכן לפי הקובץ</label>
        </fieldset>
        <div class="gs-dialog-actions">
          <button class="gs-btn gs-btn-deep" type="button" :disabled="busy" @click="preview">{{ busy ? "בודקים…" : "המשיכו לבדיקה" }}</button>
          <button class="gs-btn" type="button" @click="reset">קובץ אחר</button>
        </div>
      </div>

      <!-- 3. review -->
      <div v-else-if="step === 3 && result" class="step-body">
        <div class="sum-grid">
          <button type="button" class="sum" :class="{ on: filter === 'new' }" @click="filter = 'new'">
            <strong>{{ result.summary.new }}</strong><span>חדשים</span>
          </button>
          <button type="button" class="sum" :class="{ on: filter === 'update' }" @click="filter = 'update'">
            <strong>{{ result.summary.update }}</strong><span>יעודכנו</span>
          </button>
          <button type="button" class="sum" :class="{ on: filter === 'skip' }" @click="filter = 'skip'">
            <strong>{{ result.summary.skip + result.summary.duplicate_in_file }}</strong><span>כפולים, ידולגו</span>
          </button>
          <button type="button" class="sum bad" :class="{ on: filter === 'error' }" @click="filter = 'error'">
            <strong>{{ result.summary.error }}</strong><span>שגיאות</span>
          </button>
          <button type="button" class="sum warn" :class="{ on: filter === 'warn' }" @click="filter = 'warn'">
            <strong>{{ result.summary.warnings }}</strong><span>לבדיקה</span>
          </button>
        </div>
        <p class="review-note">
          ייובאו <b>{{ result.summary.new + result.summary.update }}</b> הזמנות, <b>{{ result.summary.people }}</b> אנשים.
          <button type="button" class="link" @click="filter = 'all'">הצגת הכל</button>
        </p>
        <div class="review-list">
          <div v-for="r in visibleRows" :key="r.line" class="rv-row" :class="'a-' + r.action">
            <span class="line">{{ r.line }}</span>
            <div class="rv-main">
              <b>{{ r.values.full_name || "ללא שם" }}</b>
              <small>
                <span v-if="r.values.phone" dir="ltr">{{ r.values.phone }}</span>
                <span v-if="r.values.party_size > 1"> · {{ r.values.party_size }} מקומות</span>
                <span v-if="r.values.group"> · {{ r.values.group }}</span>
                <span v-if="r.values.side"> · {{ sideLabels[r.values.side] }}</span>
                <span v-if="r.values.status_given"> · {{ statusLabels[r.values.status] }}</span>
              </small>
              <small v-for="(e, ei) in r.errors" :key="'e' + ei" class="msg err">{{ e.message }}</small>
              <small v-for="(w, wi) in r.warnings" :key="'w' + wi" class="msg wrn">{{ w.message }}</small>
            </div>
            <span class="gs-pill" :class="'act-' + r.action">{{ actionLabels[r.action] }}</span>
          </div>
          <p v-if="!visibleRows.length" class="empty">אין שורות בקטגוריה הזו</p>
          <p v-if="filteredRows.length > visibleRows.length" class="more">ועוד {{ filteredRows.length - visibleRows.length }} שורות…</p>
        </div>
        <div class="gs-dialog-actions">
          <button class="gs-btn gs-btn-deep" type="button" :disabled="busy || !importable" @click="commit">
            {{ busy ? "מייבאים…" : `ייבוא ${importable} אורחים` }}
          </button>
          <button class="gs-btn" type="button" :disabled="busy" @click="step = 2">חזרה למיפוי</button>
        </div>
      </div>

      <!-- 4. done -->
      <div v-else-if="step === 4 && done" class="step-body done">
        <p class="done-big">✓</p>
        <h3>הרשימה עודכנה</h3>
        <p>
          נוספו {{ done.created }} · עודכנו {{ done.updated }} · דולגו {{ done.skipped }}
          <span v-if="done.errors"> · {{ done.errors }} שורות עם שגיאה לא יובאו</span>
          <span v-if="done.groups_created"> · נוצרו {{ done.groups_created }} קבוצות</span>
        </p>
        <div class="gs-dialog-actions center">
          <button class="gs-btn gs-btn-deep" type="button" @click="close">לרשימת האורחים</button>
          <button class="gs-btn" type="button" @click="reset">ייבוא קובץ נוסף</button>
        </div>
      </div>
    </section>
  </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { guestsApi } from "@/helpers/seating/api";
import { apiError, SIDE_LABELS, STATUS_LABELS } from "@/helpers/seating/labels";
import {
  autoMap,
  buildXlsx,
  downloadBlob,
  FIELD_LABELS,
  parseSpreadsheet,
  ParsedSheet,
  SpreadsheetError,
} from "@/helpers/seating/spreadsheet";
import { ImportCommitResponse, ImportField, ImportPreviewResponse, ImportPreviewRow, ImportRow } from "@/helpers/seating/types";
import { notify } from "@/helpers/notify";

type Mapping = (ImportField | "ignore")[];
type ReviewFilter = "all" | "new" | "update" | "skip" | "error" | "warn";

export default defineComponent({
  name: "GuestImportWizard",

  props: {
    eventId: { type: Number, required: true },
  },

  emits: ["close", "imported"],

  data() {
    return {
      step: 1,
      stepNames: ["העלאת קובץ", "מיפוי עמודות", "בדיקה ואישור"],
      dragOver: false,
      parsing: false,
      parseError: "",
      mapError: "",
      fileName: "",
      sheet: null as ParsedSheet | null,
      mapping: [] as Mapping,
      onDuplicate: "skip" as "skip" | "update",
      busy: false,
      rows: [] as ImportRow[],
      result: null as ImportPreviewResponse | null,
      done: null as ImportCommitResponse | null,
      filter: "all" as ReviewFilter,
      fieldLabels: FIELD_LABELS,
      sideLabels: SIDE_LABELS,
      statusLabels: STATUS_LABELS,
      actionLabels: {
        new: "חדש",
        update: "עדכון",
        skip: "קיים, ידולג",
        duplicate_in_file: "כפול בקובץ",
        error: "שגיאה",
      } as Record<string, string>,
    };
  },

  computed: {
    stepTitle(): string {
      return ["ייבוא אורחים מאקסל", "מיפוי עמודות", "בדיקה לפני ייבוא", "הייבוא הושלם"][this.step - 1];
    },
    stepLede(): string {
      return [
        "קובץ ‎.xlsx‎ או ‎.csv‎ עם שורה לכל הזמנה",
        "התאימו כל עמודה בקובץ לשדה ב-SnapShare. זיהינו אוטומטית את מה שאפשר",
        "שום דבר עוד לא נשמר. בדקו ואשרו",
        "",
      ][this.step - 1];
    },
    samples(): string[] {
      if (!this.sheet) return [];
      return this.sheet.headers.map((_, i) => {
        const vals = (this.sheet as ParsedSheet).rows
          .map((r) => r[i])
          .filter((v) => v)
          .slice(0, 2);
        return vals.join(" · ").slice(0, 60);
      });
    },
    filteredRows(): ImportPreviewRow[] {
      const rows = this.result?.rows || [];
      switch (this.filter) {
        case "all":
          return rows;
        case "skip":
          return rows.filter((r) => r.action === "skip" || r.action === "duplicate_in_file");
        case "warn":
          return rows.filter((r) => r.warnings.length > 0);
        default:
          return rows.filter((r) => r.action === this.filter);
      }
    },
    visibleRows(): ImportPreviewRow[] {
      return this.filteredRows.slice(0, 300);
    },
    importable(): number {
      return this.result ? this.result.summary.new + this.result.summary.update : 0;
    },
  },

  mounted() {
    window.addEventListener("keydown", this.onKey);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.onKey);
  },

  methods: {
    onKey(e: KeyboardEvent) {
      if (e.key === "Escape") this.close();
    },
    close() {
      if (this.busy) return;
      this.$emit("close");
    },
    reset() {
      this.step = 1;
      this.sheet = null;
      this.result = null;
      this.done = null;
      this.parseError = "";
      this.mapError = "";
      const input = this.$refs.file as HTMLInputElement | undefined;
      if (input) input.value = "";
    },
    onPick(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) this.read(file);
    },
    onDrop(e: DragEvent) {
      this.dragOver = false;
      const file = e.dataTransfer?.files?.[0];
      if (file) this.read(file);
    },
    async read(file: File) {
      this.parsing = true;
      this.parseError = "";
      try {
        const sheet = await parseSpreadsheet(file);
        this.sheet = sheet;
        this.fileName = file.name;
        this.mapping = autoMap(sheet.headers);
        this.step = 2;
      } catch (err) {
        this.parseError = err instanceof SpreadsheetError ? err.message : "לא הצלחנו לקרוא את הקובץ";
      } finally {
        this.parsing = false;
      }
    },
    buildRows(): ImportRow[] {
      const sheet = this.sheet as ParsedSheet;
      return sheet.rows.map((r, idx) => {
        const row: ImportRow = { _line: sheet.lines[idx] };
        this.mapping.forEach((field, ci) => {
          if (field === "ignore") return;
          const v = r[ci];
          if (v === undefined || v === "") return;
          row[field] = row[field] ? `${row[field]} ${v}` : v;
        });
        return row;
      });
    },
    async preview() {
      const fields = this.mapping.filter((m) => m !== "ignore");
      if (!fields.includes("full_name") && !fields.includes("first_name")) {
        this.mapError = "צריך לבחור עמודה לשם (שם מלא או שם פרטי)";
        return;
      }
      this.mapError = "";
      this.busy = true;
      try {
        this.rows = this.buildRows();
        this.result = await guestsApi.importPreview(this.eventId, this.rows, this.onDuplicate);
        this.filter = this.result.summary.error ? "error" : "all";
        this.step = 3;
      } catch (err) {
        notify({ text: apiError(err, "הבדיקה נכשלה, נסו שוב"), type: "error", duration: 5000 });
      } finally {
        this.busy = false;
      }
    },
    async commit() {
      this.busy = true;
      try {
        this.done = await guestsApi.importCommit(this.eventId, this.rows, this.onDuplicate);
        this.step = 4;
        this.$emit("imported", this.done);
      } catch (err) {
        notify({ text: apiError(err, "הייבוא נכשל, שום דבר לא נשמר"), type: "error", duration: 6000 });
      } finally {
        this.busy = false;
      }
    },
    downloadTemplate() {
      const rows = [
        ["שם מלא", "טלפון", "מייל", "מספר מגיעים", "קבוצה", "צד", "אישור הגעה", "הערות"],
        ["משפחת לוי", "050-1234567", "", 4, "משפחה", "צד כלה", "מגיעים", "כסא תינוק"],
        ["יוסי כהן", "052-7654321", "yossi@example.com", 2, "חברים מהעבודה", "צד חתן", "", ""],
        ["סבתא רחל", "", "", 1, "משפחה", "צד כלה", "מגיעה", "קרוב ליציאה"],
      ];
      downloadBlob(buildXlsx("אורחים", rows, [22, 16, 24, 12, 18, 12, 14, 24]), "snapshare-guests-template.xlsx");
    },
  },
});
</script>

<style lang="scss" scoped>
.import-dialog {
  width: min(860px, 100%);
}
.imp-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.wiz-steps {
  display: flex;
  gap: 18px;
  list-style: none;
  padding: 0;
  margin: 4px 0 18px;
  flex-wrap: wrap;
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #5e564e;
    font-size: 13px;
    font-weight: 700;
  }
  .num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #e8e0d4;
    color: #161310;
    font-size: 12px;
  }
  li.on {
    color: #161310;
    .num {
      background: #12100e;
      color: #f3eee6;
    }
  }
  li.done .num {
    background: #1d5c3a;
    color: #fffcfa;
  }
}
.drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 38px 16px;
  border: 2px dashed rgba(22, 19, 16, 0.2);
  border-radius: 20px;
  background: #f7f1e8;
  text-align: center;
  cursor: pointer;
  color: #161310;
  b {
    font-size: 17px;
  }
  span {
    color: #5e564e;
    font-size: 14px;
  }
  &.over {
    border-color: #c9a36a;
    background: #f3e7d4;
  }
  &.busy {
    opacity: 0.7;
    pointer-events: none;
  }
  &:focus-within {
    outline: 2px solid #c9a36a;
    outline-offset: 2px;
  }
}
.drop-ico {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #12100e;
  color: #f3eee6 !important;
  display: grid;
  place-items: center;
  svg {
    width: 24px;
    height: 24px;
  }
}
.big {
  font-size: 14px;
  margin-top: 10px;
}
.tips {
  margin-top: 16px;
  font-size: 13px;
  color: #5e564e;
  p {
    margin: 0 0 8px;
  }
  b {
    color: #161310;
  }
}
.file-line {
  margin: 0 0 10px;
  font-size: 14px;
  color: #5e564e;
  b {
    color: #161310;
  }
}
.map-table {
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 16px;
  overflow: hidden;
}
.map-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 220px;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid rgba(22, 19, 16, 0.08);
  font-size: 14px;
}
.map-head {
  border-top: 0;
  background: #f7f1e8;
  font-size: 12px;
  font-weight: 800;
  color: #5e564e;
}
.col-name {
  font-weight: 700;
}
.sample {
  color: #5e564e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dup-choice {
  border: 0;
  padding: 0;
  margin: 16px 0 0;
  font-size: 14px;
  legend {
    font-weight: 800;
    margin-bottom: 6px;
  }
  label {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
    cursor: pointer;
  }
  input {
    accent-color: #8a6a38;
  }
}
.sum-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.sum {
  border: 1px solid rgba(22, 19, 16, 0.11);
  background: #fffcfa;
  color: #161310;
  border-radius: 14px;
  padding: 10px;
  text-align: right;
  font: inherit;
  cursor: pointer;
  strong {
    display: block;
    font-size: 22px;
    font-weight: 900;
  }
  span {
    font-size: 12px;
    color: #5e564e;
    font-weight: 700;
  }
  &.bad strong {
    color: #8a1c28;
  }
  &.warn strong {
    color: #6b4b1d;
  }
  &.on {
    box-shadow: 0 0 0 2px #c9a36a;
  }
}
.review-note {
  font-size: 14px;
  margin: 12px 0 8px;
}
.link {
  background: none;
  border: 0;
  color: #6b4b1d;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
.review-list {
  max-height: 46vh;
  overflow: auto;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 16px;
}
.rv-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 9px 12px;
  border-top: 1px solid rgba(22, 19, 16, 0.07);
  &:first-child {
    border-top: 0;
  }
  &.a-error {
    background: #fdf3f4;
  }
}
.line {
  width: 34px;
  color: #8a8278;
  font-size: 12px;
  font-weight: 700;
  padding-top: 2px;
}
.rv-main {
  flex: 1;
  min-width: 0;
  b {
    display: block;
    font-size: 14px;
  }
  small {
    display: block;
    color: #5e564e;
    font-size: 12px;
  }
  .msg.err {
    color: #8a1c28;
    font-weight: 700;
  }
  .msg.wrn {
    color: #6b4b1d;
    font-weight: 600;
  }
}
.act-new { background: #dff1e5; color: #14502f; }
.act-update { background: #e3e9f5; color: #2c3d63; }
.act-skip,
.act-duplicate_in_file { background: #ece4d8; color: #4a443d; }
.act-error { background: #fbe3e5; color: #7d1a25; }
.empty,
.more {
  padding: 14px;
  color: #5e564e;
  font-size: 13px;
  margin: 0;
}
.done {
  text-align: center;
  .done-big {
    width: 64px;
    height: 64px;
    margin: 8px auto;
    border-radius: 50%;
    background: #1d5c3a;
    color: #fffcfa;
    display: grid;
    place-items: center;
    font-size: 30px;
    font-weight: 900;
  }
  h3 {
    margin: 0 0 6px;
    font-size: 20px;
  }
  p {
    color: #5e564e;
  }
}
.center {
  justify-content: center;
}
@media (max-width: 900px) {
  .map-row {
    grid-template-columns: 1fr 1fr;
    .sample {
      display: none;
    }
  }
  .map-head span:nth-child(2) {
    display: none;
  }
  .sum-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
