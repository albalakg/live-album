<template>
  <div class="gs-overlay" @mousedown.self="close">
    <section class="gs-dialog smart-dialog" role="dialog" aria-modal="true" aria-label="שיבוץ חכם">
      <!-- options -->
      <template v-if="phase === 'options'">
        <h2>שיבוץ חכם</h2>
        <p class="gs-dialog-lede">המערכת מציעה סידור לפי קבוצות, צדדים ואילוצים. שום דבר לא משתנה במפה עד שתאשרו.</p>

        <div class="engines" role="radiogroup" aria-label="סוג השיבוץ">
          <button type="button" role="radio" class="engine" :class="{ on: opts.engine === 'ai', off: !aiAvailable }" :aria-checked="opts.engine === 'ai'" :disabled="!aiAvailable" @click="opts.engine = 'ai'">
            <b>שיבוץ עם AI</b>
            <span>מבין גם הערות והנחיות חופשיות</span>
            <span class="quota-pill"><i class="qbar"><em :style="{ width: quotaPct + '%' }"></em></i>נשארו {{ quota.remaining }} מתוך {{ quota.included }}</span>
          </button>
          <button type="button" role="radio" class="engine" :class="{ on: opts.engine === 'packer' }" :aria-checked="opts.engine === 'packer'" @click="opts.engine = 'packer'">
            <b>סידור אוטומטי מהיר</b>
            <span>בלי AI, לפי קבוצות וצדדים. לא נספר במכסה</span>
          </button>
        </div>
        <p v-if="!aiAvailable" class="note warn">מכסת השיבוצים עם AI לאירוע הזה נוצלה. אפשר להמשיך עם הסידור האוטומטי או ידנית.</p>

        <label class="gs-check"><input v-model="opts.mode" type="radio" value="fill" /><span>להשלים בלבד<small>לא להזיז מי שכבר יושב, רק למלא מקומות פנויים</small></span></label>
        <label class="gs-check"><input v-model="opts.mode" type="radio" value="reshuffle" /><span>לסדר הכל מחדש<small>מתחילים מאפס. ההושבה הנוכחית תוחלף רק אם תאשרו</small></span></label>
        <label class="gs-check"><input v-model="opts.include_pending" type="checkbox" /><span>לשבץ גם מי שעוד לא אישר הגעה</span></label>
        <label class="gs-check"><input v-model="opts.include_maybe" type="checkbox" /><span>לשבץ גם את מי שסימן "אולי"</span></label>

        <div v-if="opts.engine === 'ai'" class="gs-field instr">
          <label class="gs-label" for="smart-instr">הנחיות (רשות)</label>
          <textarea id="smart-instr" v-model="opts.instructions" class="gs-textarea" maxlength="500" placeholder="לדוגמה: סבתא רחל קרוב ליציאה, החברים מהצבא ליד הרחבה, משפחת כהן ולוי לא באותו שולחן"></textarea>
          <p class="gs-hint">{{ opts.instructions.length }}/500 · אילוצים קבועים מוסיפים בכפתור "אילוצים"</p>
        </div>

        <div v-if="opts.engine === 'ai'" class="note cost">
          <template v-if="quota.is_mock">מצב פיתוח: ספק AI מקומי לבדיקות, בלי עלות.</template>
          <template v-else>
            לפי {{ board.guests.length }} רשומות ו-{{ board.tables.length }} שולחנות, העלות המוערכת היא בערך ₪{{ quota.estimate.cost_ils.toFixed(2) }} ({{ quota.model }}).
          </template>
          הרצה מוצלחת משתמשת ביחידת מכסה אחת. הרצה שנכשלת לא נספרת.
        </div>

        <div class="gs-dialog-actions">
          <button class="gs-btn gs-btn-gold" type="button" :disabled="!canRun" @click="run">הציעו שיבוץ</button>
          <button class="gs-btn" type="button" @click="close">ביטול</button>
        </div>
      </template>

      <!-- running -->
      <div v-else-if="phase === 'running'" class="running" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <h2>מסדרים את השולחנות…</h2>
        <p class="gs-dialog-lede">{{ opts.engine === "ai" ? "ה-AI עובר על הקבוצות, הצדדים וההנחיות" : "מחשבים סידור לפי קבוצות וצדדים" }}</p>
      </div>

      <!-- preview -->
      <template v-else-if="phase === 'preview' && run_">
        <h2>הצעת שיבוץ</h2>
        <p class="gs-dialog-lede">
          {{ run_.engine === "ai" ? "הצעה של ה-AI" : "סידור אוטומטי" }}. בדקו, ואם זה נראה טוב אשרו כדי להחיל על המפה.
        </p>
        <div class="sum-grid">
          <div class="sum"><strong>{{ newCount }}</strong><span>יושבו עכשיו</span></div>
          <div class="sum"><strong>{{ run_.summary?.moved ?? 0 }}</strong><span>יוזזו</span></div>
          <div class="sum"><strong>{{ (run_.unplaced || []).length }}</strong><span>לא נמצא מקום</span></div>
          <div class="sum"><strong>{{ run_.summary?.tables_used ?? 0 }}</strong><span>שולחנות</span></div>
        </div>
        <ul v-if="(run_.warnings || []).length" class="warn-list">
          <li v-for="(w, i) in run_.warnings" :key="i">{{ w.message }}<span v-if="w.guest_ids.length">: {{ namesOf(w.guest_ids) }}</span></li>
        </ul>
        <div class="prop-tables">
          <div v-for="row in proposalByTable" :key="row.tableId" class="prop-table">
            <header>
              <b>{{ row.label }}</b>
              <span>{{ row.people }}/{{ row.seats }}</span>
            </header>
            <div class="prop-guests">
              <span v-for="a in row.items" :key="a.guest_id" class="pg" :class="{ fresh: a.isNew, moved: a.isMoved }" :title="a.reason || ''">
                {{ a.name }}<small v-if="a.party > 1"> ×{{ a.party }}</small>
              </span>
            </div>
          </div>
        </div>
        <div v-if="(run_.unplaced || []).length" class="unplaced">
          <b>לא נמצא מקום:</b>
          <span v-for="u in run_.unplaced" :key="u.guest_id">{{ nameOf(u.guest_id) }} ({{ u.reason }})</span>
        </div>
        <p class="legend"><span class="pg fresh">חדש</span> <span class="pg moved">יוזז</span> · ריחוף על שם מציג את הסיבה</p>
        <div class="gs-dialog-actions">
          <button class="gs-btn gs-btn-deep" type="button" :disabled="busy" @click="apply(false)">החלה על המפה</button>
          <button class="gs-btn" type="button" :disabled="busy" @click="discard">ביטול ההצעה</button>
          <button class="gs-btn gs-btn-ghost" type="button" :disabled="busy" @click="backToOptions">שינוי הגדרות</button>
        </div>
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from "vue";
import { seatingApi } from "@/helpers/seating/api";
import { SeatingBoard } from "@/helpers/seating/board";
import { apiData, apiError, apiStatus } from "@/helpers/seating/labels";
import { AiQuota, AiRun, AiRunOptions, PlanState } from "@/helpers/seating/types";
import { notify } from "@/helpers/notify";

interface PropRow {
  tableId: number;
  label: string;
  seats: number;
  people: number;
  items: { guest_id: number; name: string; party: number; reason: string | null; isNew: boolean; isMoved: boolean }[];
}

export default defineComponent({
  name: "SeatingSmartDialog",

  props: {
    eventId: { type: Number, required: true },
    quota: { type: Object as PropType<AiQuota>, required: true },
    flush: { type: Function as PropType<() => Promise<boolean>>, required: true },
  },

  emits: ["close", "applied", "quota"],

  setup() {
    const board = inject("seatingBoard") as SeatingBoard;
    return { board };
  },

  data() {
    return {
      phase: "options" as "options" | "running" | "preview",
      opts: {
        engine: this.quota.remaining > 0 ? "ai" : "packer",
        mode: "fill",
        include_pending: true,
        include_maybe: true,
        instructions: "",
      } as AiRunOptions,
      run_: null as AiRun | null,
      busy: false,
    };
  },

  computed: {
    aiAvailable(): boolean {
      return this.quota.remaining > 0;
    },
    quotaPct(): number {
      return this.quota.included ? Math.round((this.quota.remaining / this.quota.included) * 100) : 0;
    },
    canRun(): boolean {
      return this.board.tables.length > 0 && (this.opts.engine === "packer" || this.aiAvailable);
    },
    currentTableById(): Map<number, string> {
      const m = new Map<number, string>();
      this.board.tables.forEach((t) => {
        if (t.id) m.set(t.id, t.key);
      });
      return m;
    },
    proposalByTable(): PropRow[] {
      const run = this.run_;
      if (!run?.proposal) return [];
      const rows = new Map<number, PropRow>();
      this.board.tables.forEach((t) => {
        if (t.id) rows.set(t.id, { tableId: t.id, label: t.label, seats: t.seats, people: 0, items: [] });
      });
      run.proposal.forEach((a) => {
        const row = rows.get(a.table_id);
        const g = this.board.guestMap.get(a.guest_id);
        if (!row || !g) return;
        const cur = this.board.seats[a.guest_id];
        const curId = cur ? this.board.table(cur.table)?.id : null;
        row.people += g.party_size;
        row.items.push({
          guest_id: a.guest_id,
          name: g.full_name,
          party: g.party_size,
          reason: a.reason,
          isNew: !cur,
          isMoved: !!cur && curId !== a.table_id,
        });
      });
      return Array.from(rows.values()).filter((r) => r.items.length);
    },
    newCount(): number {
      return this.proposalByTable.reduce((s, r) => s + r.items.filter((i) => i.isNew).length, 0);
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
    nameOf(id: number): string {
      return this.board.guestMap.get(id)?.full_name || `#${id}`;
    },
    namesOf(ids: number[]): string {
      return ids.slice(0, 4).map(this.nameOf).join(", ") + (ids.length > 4 ? ` ועוד ${ids.length - 4}` : "");
    },
    async run() {
      if (!this.canRun) return;
      this.phase = "running";
      const saved = await this.flush();
      if (!saved) {
        this.phase = "options";
        notify({ text: "אי אפשר לשבץ לפני שהמפה נשמרה. נסו שוב בעוד רגע", type: "error", duration: 5000 });
        return;
      }
      try {
        const res = await seatingApi.run(this.eventId, this.opts);
        this.run_ = res.run;
        this.$emit("quota", res.quota);
        this.phase = "preview";
      } catch (err) {
        const data = apiData<{ quota?: AiQuota }>(err);
        if (data?.quota) this.$emit("quota", data.quota);
        notify({ text: apiError(err, "השיבוץ נכשל. הניסיון לא נספר במכסה"), type: "error", duration: 6000 });
        this.phase = "options";
      }
    },
    async apply(force: boolean): Promise<void> {
      if (!this.run_) return;
      this.busy = true;
      try {
        const res = await seatingApi.apply(this.eventId, this.run_.id, force);
        this.$emit("quota", res.quota);
        this.$emit("applied", res as PlanState);
        notify({ text: "השיבוץ הוחל על המפה. אפשר לבטל עם Ctrl+Z", type: "success", duration: 4000 });
      } catch (err) {
        if (apiStatus(err) === 409 && !force) {
          if (window.confirm("המפה השתנתה מאז שההצעה נוצרה. להחיל אותה בכל זאת? שינויים ידניים של אורחים שבהצעה יוחלפו.")) {
            this.busy = false;
            return this.apply(true);
          }
        } else {
          notify({ text: apiError(err, "ההחלה נכשלה"), type: "error", duration: 5000 });
        }
      } finally {
        this.busy = false;
      }
    },
    async discard(): Promise<void> {
      const run = this.run_;
      this.run_ = null;
      if (run) {
        try {
          const res = await seatingApi.discard(this.eventId, run.id);
          this.$emit("quota", res.quota);
        } catch {
          /* best effort */
        }
      }
      this.$emit("close");
    },
    backToOptions() {
      const run = this.run_;
      this.run_ = null;
      this.phase = "options";
      if (run) seatingApi.discard(this.eventId, run.id).catch(() => undefined);
    },
    close() {
      if (this.busy || this.phase === "running") return;
      if (this.phase === "preview") {
        this.discard();
        return;
      }
      this.$emit("close");
    },
  },
});
</script>

<style lang="scss" scoped>
.smart-dialog {
  width: min(640px, 100%);
}
.engines {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.engine {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: right;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1.5px solid rgba(22, 19, 16, 0.14);
  background: #fffcfa;
  color: #161310;
  font: inherit;
  cursor: pointer;
  b {
    font-size: 15px;
  }
  span {
    font-size: 12px;
    color: #5e564e;
  }
  &.on {
    border-color: #c9a36a;
    box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.3);
    background: #fbf5ea;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}
.quota-pill {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #12100e;
  color: #f3eee6 !important;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  position: relative;
  .qbar {
    display: inline-block;
    width: 40px;
    height: 5px;
    border-radius: 9px;
    background: rgba(243, 238, 230, 0.22);
    overflow: hidden;
    order: 2;
    em {
      display: block;
      height: 100%;
      background: #c9a36a;
    }
  }
}
.note {
  font-size: 13px;
  border-radius: 14px;
  padding: 10px 12px;
  margin: 10px 0;
  &.cost {
    background: #f7f1e8;
    border: 1px solid rgba(201, 163, 106, 0.4);
    color: #161310;
  }
  &.warn {
    background: #fdf0f1;
    color: #7d1a25;
  }
}
.instr {
  margin-top: 12px;
}
.running {
  text-align: center;
  padding: 30px 10px;
}
.spinner {
  display: inline-block;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 4px solid #e8e0d4;
  border-top-color: #c9a36a;
  animation: spin 0.9s linear infinite;
  margin-bottom: 10px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 3s;
  }
}
.sum-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.sum {
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 14px;
  padding: 10px;
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
}
.warn-list {
  margin: 10px 0 0;
  padding: 10px 12px 10px 28px;
  background: #fdf6e8;
  color: #5c4210;
  border-radius: 14px;
  font-size: 13px;
  padding-inline-start: 26px;
}
.prop-tables {
  margin-top: 12px;
  max-height: 38vh;
  overflow: auto;
  display: grid;
  gap: 8px;
}
.prop-table {
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 14px;
  padding: 8px 10px;
  header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 6px;
    span {
      color: #5e564e;
      font-weight: 700;
    }
  }
}
.prop-guests {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.pg {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: #ece4d8;
  color: #161310;
  font-size: 12px;
  font-weight: 600;
  &.fresh {
    background: #dff1e5;
    color: #14502f;
  }
  &.moved {
    background: #f6ecd2;
    color: #5c4210;
  }
  small {
    margin-inline-start: 2px;
  }
}
.unplaced {
  margin-top: 10px;
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  color: #7d1a25;
}
.legend {
  margin: 10px 0 0;
  font-size: 12px;
  color: #5e564e;
}
@media (max-width: 900px) {
  .engines {
    grid-template-columns: 1fr;
  }
  .sum-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
