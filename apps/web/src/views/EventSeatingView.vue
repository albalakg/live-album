<template>
  <div ref="page" class="gs-ui seating-page" :style="pageStyle">
    <!-- entitlement off -->
    <div v-if="loaded && !entitlement.enabled" class="locked gs-card">
      <h1>סידורי הושבה</h1>
      <p>בניית מפת הושבה ושיבוץ חכם עדיין לא זמינים בחשבון הזה.</p>
      <router-link class="gs-btn gs-btn-deep" to="/event/guests">לניהול האורחים</router-link>
    </div>

    <template v-else>
      <header class="toolbar" role="toolbar" aria-label="כלי עריכה">
        <div class="tb-title">
          <h1>סידורי הושבה</h1>
          <span class="save-state" :class="saveState" aria-live="polite">{{ saveLabel }}</span>
        </div>
        <div class="tb-tools">
          <button class="gs-btn gs-btn-sm gs-btn-deep" type="button" @click="addTable('round')">+ שולחן עגול</button>
          <button class="gs-btn gs-btn-sm" type="button" @click="addTable('rect')">+ שולחן מלבני</button>
          <div class="menu-wrap">
            <button class="gs-btn gs-btn-sm" type="button" aria-haspopup="menu" :aria-expanded="fxMenu" @click="fxMenu = !fxMenu">+ אלמנט באולם ▾</button>
            <div v-if="fxMenu" class="menu" role="menu">
              <button v-for="k in fixtureKinds" :key="k" type="button" role="menuitem" @click="addFixture(k)">{{ fixtureLabels[k].label }}</button>
            </div>
          </div>
          <span class="sep" aria-hidden="true"></span>
          <button class="gs-btn gs-btn-sm gs-btn-ghost" type="button" :disabled="!board.hist.length" title="Ctrl+Z" @click="board.undo()">ביטול</button>
          <button class="gs-btn gs-btn-sm gs-btn-ghost" type="button" :disabled="!board.future.length" title="Ctrl+Shift+Z" @click="board.redo()">ביצוע שוב</button>
          <button class="gs-btn gs-btn-sm gs-btn-ghost hide-sm" type="button" :disabled="!board.selected.length" title="Ctrl+D" @click="board.duplicateSelected()">שכפול</button>
          <button class="gs-btn gs-btn-sm gs-btn-ghost hide-sm" type="button" :disabled="!board.selected.length" title="Delete" @click="board.deleteSelected()">מחיקה</button>
          <span class="sep" aria-hidden="true"></span>
          <button class="gs-btn gs-btn-sm gs-btn-gold" type="button" :disabled="!board.tables.length" @click="showSmart = true">שיבוץ חכם (AI)</button>
          <button class="gs-btn gs-btn-sm" type="button" @click="showConstraints = true">אילוצים<span v-if="board.constraints.length"> ({{ board.constraints.length }})</span></button>
          <div v-if="board.warnings.length" class="menu-wrap">
            <button class="gs-btn gs-btn-sm warn-btn" type="button" :aria-expanded="warnMenu" @click="warnMenu = !warnMenu">⚠ {{ board.warnings.length }}</button>
            <div v-if="warnMenu" class="menu warn-menu" role="menu">
              <button v-for="(w, i) in board.warnings" :key="i" type="button" role="menuitem" @click="focusWarning(w)">{{ w.message }}</button>
            </div>
          </div>
          <button class="gs-btn gs-btn-sm hide-sm" type="button" @click="exportSeating">ייצוא לאקסל</button>
          <span class="quota-pill" :title="quota.is_mock ? 'ספק AI מקומי לבדיקות' : ''">AI · נשארו {{ quota.remaining }} מתוך {{ quota.included }}</span>
        </div>
      </header>

      <nav class="mobile-bar" aria-label="פעולות מהירות">
        <button class="gs-btn gs-btn-sm gs-btn-deep" type="button" @click="railOpen = !railOpen">אורחים ({{ board.unseated.length }})</button>
        <button class="gs-btn gs-btn-sm" type="button" @click="addTable('round')">+ שולחן</button>
        <button class="gs-btn gs-btn-sm gs-btn-gold" type="button" :disabled="!board.tables.length" @click="showSmart = true">שיבוץ חכם</button>
      </nav>
      <div v-if="conflict" class="conflict" role="alert">
        <span>המפה נשמרה ממקום אחר (חלון או מכשיר נוסף). מה לעשות?</span>
        <button class="gs-btn gs-btn-sm" type="button" @click="loadServerVersion">לטעון את הגרסה השמורה</button>
        <button class="gs-btn gs-btn-sm gs-btn-deep" type="button" @click="keepMine">לשמור את הגרסה שלי</button>
      </div>

      <div class="stage">
        <Teleport to="body" :disabled="!isNarrow">
          <div v-if="isNarrow && railOpen" class="gs-sheet-scrim" @click="railOpen = false"></div>
          <SeatingGuestRail
            class="stage-rail gs-ui"
            :class="{ 'is-sheet': isNarrow, 'sheet-open': railOpen }"
            :drop-over="gdrag.active && gdrag.overRail"
            :closable="isNarrow"
            @guest-down="onGuestDown"
            @guest-pick="pickGuest"
            @close="railOpen = false"
          />
        </Teleport>

        <div class="stage-canvas">
          <SeatingCanvas ref="canvas" @guest-down="onGuestDown" />
          <div v-if="loaded && !board.tables.length && !board.fixtures.length" class="empty-plan">
            <div class="gs-card">
              <h2>מתחילים את מפת האולם</h2>
              <p>
                יש {{ seatablePeople }} מקומות לשבץ. אפשר להתחיל מתבנית מוכנה ולשנות אותה, או להוסיף שולחנות אחד אחד.
              </p>
              <div class="row">
                <button class="gs-btn gs-btn-deep" type="button" @click="starter">תבנית לפי מספר האורחים</button>
                <button class="gs-btn" type="button" @click="addTable('round')">+ שולחן ראשון</button>
              </div>
            </div>
          </div>
          <div v-if="!loaded" class="loading">טוען את המפה…</div>
        </div>

        <Teleport to="body" :disabled="!isNarrow">
          <SeatingTableInspector v-if="board.selected.length === 1" class="stage-insp gs-ui" :class="{ 'is-sheet': isNarrow, 'sheet-open': isNarrow }" @guest-down="onGuestDown" />
        </Teleport>
        <aside v-if="board.selected.length !== 1" class="stage-insp summary" aria-label="סיכום">
          <h2>סיכום</h2>
          <div class="sum-row"><span>שולחנות</span><b>{{ board.tables.length }}</b></div>
          <div class="sum-row"><span>מקומות</span><b>{{ board.totalSeats }}</b></div>
          <div class="sum-row"><span>הושבו</span><b>{{ board.seatedPeople }} / {{ seatablePeople }}</b></div>
          <div class="occ-bar"><i :style="{ width: seatedPct + '%' }"></i></div>
          <p v-if="board.selected.length > 1" class="hint">נבחרו {{ board.selected.length }} פריטים. גררו להזזה יחד, או מחקו/שכפלו מהסרגל.</p>
          <ul v-else class="tips">
            <li>לוחצים על שולחן כדי לראות את הכסאות ומי יושב בהם</li>
            <li>גוררים את הנקודות בצדדים כדי להגדיל. מספר הכסאות מתעדכן לבד</li>
            <li>Shift + גרירה על הרקע בוחר כמה שולחנות</li>
            <li>גלגלת או צביטה לזום, גרירה על הרקע להזזת המפה</li>
          </ul>
        </aside>
      </div>

    </template>

    <div v-if="gdrag.active" class="ghost" :style="{ left: gdrag.x + 'px', top: gdrag.y + 'px' }" aria-hidden="true">
      {{ ghostName }}<small v-if="ghostParty > 1"> · {{ ghostParty }}</small>
    </div>

    <SeatingSmartDialog v-if="showSmart" :event-id="eventId" :quota="quota" :flush="flush" @close="showSmart = false" @quota="quota = $event" @applied="onApplied" />
    <SeatingConstraintsDialog v-if="showConstraints" :event-id="eventId" @close="showConstraints = false" @changed="scheduleSave(0, true)" />
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, reactive } from "vue";
import SeatingCanvas from "@/components/event/seating/SeatingCanvas.vue";
import SeatingGuestRail from "@/components/event/seating/SeatingGuestRail.vue";
import SeatingTableInspector from "@/components/event/seating/SeatingTableInspector.vue";
import SeatingSmartDialog from "@/components/event/seating/SeatingSmartDialog.vue";
import SeatingConstraintsDialog from "@/components/event/seating/SeatingConstraintsDialog.vue";
import { seatingApi } from "@/helpers/seating/api";
import { SeatingBoard } from "@/helpers/seating/board";
import { FIXTURE_DEFAULTS, GRID, isSeatable, party } from "@/helpers/seating/engine";
import { apiData, apiError, apiStatus } from "@/helpers/seating/labels";
import { buildXlsx, downloadBlob } from "@/helpers/seating/spreadsheet";
import { AiQuota, Entitlement, FixtureKind, PlanState, SeatingWarning, TableShape } from "@/helpers/seating/types";
import { notify } from "@/helpers/notify";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error" | "offline";

interface CanvasApi {
  fit: () => void;
  focusItem: (key: string, scale?: number) => void;
  viewCenter: () => { x: number; y: number };
  zoomBy: (f: number) => void;
  highlight: (key: string | null, seatKey: string | null) => void;
}

const SAVE_DEBOUNCE = 800;

export default defineComponent({
  name: "EventSeatingView",

  components: { SeatingCanvas, SeatingGuestRail, SeatingTableInspector, SeatingSmartDialog, SeatingConstraintsDialog },

  setup() {
    const board = reactive(new SeatingBoard()) as SeatingBoard;
    provide("seatingBoard", board);
    return { board };
  },

  data() {
    return {
      loaded: false,
      entitlement: { enabled: true, source: "", addon: "", pending_pricing: true } as Entitlement,
      quota: { included: 5, used: 0, remaining: 5, provider: "", model: "", is_mock: false, estimate: { tokens_in: 0, tokens_out: 0, cost_usd: 0, cost_ils: 0 } } as AiQuota,
      saveState: "idle" as SaveState,
      saving: false,
      savedVersion: 0,
      saveTimer: 0,
      retryTimer: 0,
      conflict: null as PlanState | null,
      flushWaiters: [] as ((ok: boolean) => void)[],
      fxMenu: false,
      warnMenu: false,
      showSmart: false,
      showConstraints: false,
      railOpen: false,
      isNarrow: false,
      pageH: 0,
      fixtureKinds: ["dance", "stage", "bar", "dj", "door", "buffet", "chuppah", "label"] as FixtureKind[],
      fixtureLabels: FIXTURE_DEFAULTS,
      gdrag: { id: 0, pointer: -1, sx: 0, sy: 0, x: 0, y: 0, active: false, overRail: false, fromRail: false },
    };
  },

  computed: {
    eventId(): number {
      return Number(this.$store.getters["event/getEvent"]?.id || 0);
    },
    canvasApi(): CanvasApi | null {
      return (this.$refs.canvas as unknown as CanvasApi) || null;
    },
    seatablePeople(): number {
      return this.board.guests.reduce((s, g) => (isSeatable(g) ? s + party(g) : s), 0);
    },
    seatedPct(): number {
      return this.seatablePeople ? Math.min(100, Math.round((this.board.seatedPeople / this.seatablePeople) * 100)) : 0;
    },
    saveLabel(): string {
      switch (this.saveState) {
        case "dirty":
          return "שינויים לא שמורים";
        case "saving":
          return "שומר…";
        case "saved":
          return "נשמר ✓";
        case "error":
          return "השמירה נכשלה, מנסים שוב";
        case "offline":
          return "אין חיבור, נשמור כשיחזור";
        default:
          return "";
      }
    },
    pageStyle(): Record<string, string> {
      return this.pageH ? { height: `${this.pageH}px` } : {};
    },
    ghostName(): string {
      return this.board.guestMap.get(this.gdrag.id)?.full_name || "";
    },
    ghostParty(): number {
      return this.board.guestMap.get(this.gdrag.id)?.party_size || 1;
    },
  },

  watch: {
    "board.version"() {
      if (this.loaded) this.scheduleSave();
    },
    eventId(id: number, old: number) {
      if (id && id !== old) this.load();
    },
  },

  mounted() {
    this.board.toastFn = (text, type) => notify({ text, type: type || "success", duration: type === "error" ? 3500 : 2500 });
    this.onResize();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("keydown", this.onKey);
    window.addEventListener("beforeunload", this.onBeforeUnload);
    window.addEventListener("online", this.onOnline);
    document.addEventListener("pointerdown", this.closeMenus);
    this.load();
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("beforeunload", this.onBeforeUnload);
    window.removeEventListener("online", this.onOnline);
    document.removeEventListener("pointerdown", this.closeMenus);
    this.endGuestDrag();
    window.clearTimeout(this.retryTimer);
    if (this.board.version !== this.savedVersion) {
      window.clearTimeout(this.saveTimer);
      this.save();
    }
  },

  methods: {
    /* ───────── load ───────── */
    async load() {
      if (!this.eventId) return;
      try {
        const s = await seatingApi.state(this.eventId);
        this.entitlement = s.entitlement;
        this.quota = s.ai;
        this.board.load(s, s.guests, s.groups);
        this.savedVersion = this.board.version;
        this.saveState = "idle";
        this.loaded = true;
        this.$nextTick(() => {
          this.measure();
          this.$nextTick(() => this.canvasApi?.fit());
        });
      } catch (err) {
        if (apiStatus(err) === 403) {
          this.entitlement = { ...this.entitlement, enabled: false };
          this.loaded = true;
          return;
        }
        notify({ text: apiError(err, "לא הצלחנו לטעון את מפת ההושבה"), type: "error", duration: 5000 });
      }
    },

    /* ───────── autosave ───────── */
    scheduleSave(delay = SAVE_DEBOUNCE, refreshOnly = false) {
      if (refreshOnly) {
        // constraints changed: re-run warnings through a save even without board edits
        this.savedVersion = -1;
      }
      if (this.saveState !== "saving") this.saveState = "dirty";
      window.clearTimeout(this.saveTimer);
      this.saveTimer = window.setTimeout(() => this.save(), delay);
    },
    async save(): Promise<void> {
      if (this.saving || this.conflict || !this.loaded || !this.entitlement.enabled) return;
      const version = this.board.version;
      if (version === this.savedVersion) {
        this.resolveFlush(true);
        return;
      }
      this.saving = true;
      this.saveState = "saving";
      try {
        const res = await seatingApi.save(this.eventId, this.board.payload());
        this.board.revision = res.revision;
        this.board.tables.forEach((t) => {
          if (!t.id && res.key_map[t.key]) t.id = res.key_map[t.key];
        });
        this.board.warnings = res.warnings;
        if (res.dropped.length) {
          res.dropped.forEach((gid) => delete this.board.seats[gid]);
        }
        this.savedVersion = version;
        this.saveState = this.board.version === version ? "saved" : "dirty";
      } catch (err) {
        const status = apiStatus(err);
        if (status === 409) {
          const data = apiData<{ state?: PlanState }>(err);
          this.conflict = data?.state || null;
          this.saveState = "error";
          this.resolveFlush(false);
          if (!this.conflict) this.load();
        } else {
          this.saveState = typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "error";
          this.resolveFlush(false);
          if (status === 403 || status === 422) {
            notify({ text: apiError(err, "השמירה נכשלה"), type: "error", duration: 5000 });
          }
          window.clearTimeout(this.retryTimer);
          if (status !== 403) this.retryTimer = window.setTimeout(() => this.save(), 5000);
        }
      } finally {
        this.saving = false;
      }
      if (!this.conflict && this.saveState !== "error" && this.saveState !== "offline") {
        if (this.board.version !== this.savedVersion) this.scheduleSave(200);
        else this.resolveFlush(true);
      }
    },
    /** Save now and resolve when the server has the current plan (used before AI runs). */
    flush(): Promise<boolean> {
      if (this.board.version === this.savedVersion && !this.saving) return Promise.resolve(true);
      return new Promise((resolve) => {
        this.flushWaiters.push(resolve);
        window.clearTimeout(this.saveTimer);
        if (!this.saving) this.save();
      });
    },
    resolveFlush(ok: boolean) {
      const waiters = this.flushWaiters;
      this.flushWaiters = [];
      waiters.forEach((w) => w(ok));
    },
    loadServerVersion() {
      if (!this.conflict) return;
      this.board.pushHist();
      this.board.applyPlan(this.conflict);
      this.conflict = null;
      this.savedVersion = this.board.version;
      this.saveState = "saved";
    },
    keepMine() {
      if (!this.conflict) return;
      this.board.revision = this.conflict.revision;
      this.conflict = null;
      this.savedVersion = -1;
      this.save();
    },
    onOnline() {
      if (this.saveState === "offline") this.save();
    },
    onBeforeUnload(e: BeforeUnloadEvent) {
      if (this.board.version !== this.savedVersion) {
        this.save();
        e.preventDefault();
        e.returnValue = "";
      }
    },
    onApplied(state: PlanState) {
      this.board.pushHist();
      this.board.applyPlan(state);
      this.savedVersion = this.board.version;
      this.saveState = "saved";
      this.showSmart = false;
    },

    /* ───────── toolbar ───────── */
    addTable(shape: TableShape) {
      const c = this.canvasApi?.viewCenter() || { x: 600, y: 400 };
      const t = this.board.addTable(shape, c.x, c.y);
      if (this.isNarrow) this.railOpen = false;
      this.$nextTick(() => {
        if (this.board.tables.length === 1) this.canvasApi?.focusItem(t.key, 1);
      });
    },
    addFixture(kind: FixtureKind) {
      this.fxMenu = false;
      const c = this.canvasApi?.viewCenter() || { x: 600, y: 400 };
      this.board.addFixture(kind, c.x, c.y);
    },
    starter() {
      this.board.starter(this.seatablePeople);
      this.$nextTick(() => this.canvasApi?.fit());
    },
    closeMenus(e: Event) {
      const t = e.target as HTMLElement;
      if (!t.closest(".menu-wrap")) {
        this.fxMenu = false;
        this.warnMenu = false;
      }
    },
    focusWarning(w: SeatingWarning) {
      this.warnMenu = false;
      let key: string | null = null;
      if (w.table_id) key = this.board.tables.find((t) => t.id === w.table_id)?.key || null;
      if (!key && w.guest_ids.length) key = this.board.seats[w.guest_ids[0]]?.table || null;
      if (key) {
        this.board.select([key]);
        this.canvasApi?.focusItem(key, Math.max(1, this.board.cam.scale));
      } else if (w.constraint_id) {
        this.showConstraints = true;
      }
    },
    exportSeating() {
      const rows: (string | number | null)[][] = [["שולחן", "כסא", "שם", "מקומות", "קבוצה", "טלפון", "הערות"]];
      const sorted = this.board.tables.slice().sort((a, b) => a.label.localeCompare(b.label, "he", { numeric: true }));
      sorted.forEach((t) => {
        this.board.cells(t).forEach((cell, i) => {
          if (cell && cell.offset === 0) {
            const g = cell.guest;
            rows.push([t.label, i + 1, g.full_name, g.party_size, g.group_id ? this.board.groupMap.get(g.group_id)?.name || "" : "", g.phone || "", g.notes || ""]);
          }
        });
        this.board.guests
          .filter((g) => this.board.seats[g.id]?.table === t.key && this.board.seats[g.id]?.seat == null)
          .forEach((g) => rows.push([t.label, null, g.full_name, g.party_size, "", g.phone || "", "חריגה ממספר הכסאות"]));
      });
      this.board.unseated.forEach((g) => rows.push(["לא הושבו", null, g.full_name, g.party_size, g.group_id ? this.board.groupMap.get(g.group_id)?.name || "" : "", g.phone || "", g.notes || ""]));
      downloadBlob(buildXlsx("הושבה", rows, [16, 7, 24, 9, 16, 15, 30]), `seating-${this.eventId}.xlsx`);
    },

    /* ───────── guest drag ───────── */
    onGuestDown(id: number, e: PointerEvent) {
      if (e.button != null && e.button > 0) return;
      if (this.gdrag.pointer !== -1) return;
      const fromRail = !!(e.target as HTMLElement).closest("[data-rail]");
      this.gdrag = { id, pointer: e.pointerId, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, active: false, overRail: false, fromRail };
      window.addEventListener("pointermove", this.onGuestMove);
      window.addEventListener("pointerup", this.onGuestUp);
      window.addEventListener("pointercancel", this.onGuestCancel);
    },
    onGuestMove(e: PointerEvent) {
      const d = this.gdrag;
      if (e.pointerId !== d.pointer) return;
      if (!d.active && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      if (!d.active) {
        d.active = true;
        if (this.isNarrow) this.railOpen = false;
      }
      e.preventDefault();
      d.x = e.clientX;
      d.y = e.clientY;
      const hit = this.hitTest(e.clientX, e.clientY);
      d.overRail = hit.rail;
      this.canvasApi?.highlight(hit.key, hit.key != null && hit.seat != null ? `${hit.key}:${hit.seat}` : null);
    },
    onGuestUp(e: PointerEvent) {
      const d = this.gdrag;
      if (e.pointerId !== d.pointer) return;
      const id = d.id;
      if (d.active) {
        const hit = this.hitTest(e.clientX, e.clientY);
        if (hit.key != null && hit.seat != null) this.board.dropOnSeat(id, hit.key, hit.seat);
        else if (hit.key != null) this.board.placeGuest(id, hit.key);
        else if (hit.rail) this.board.unseat(id);
      } else if (d.fromRail) {
        this.pickGuest(id);
      }
      this.endGuestDrag();
    },
    onGuestCancel() {
      this.endGuestDrag();
    },
    endGuestDrag() {
      window.removeEventListener("pointermove", this.onGuestMove);
      window.removeEventListener("pointerup", this.onGuestUp);
      window.removeEventListener("pointercancel", this.onGuestCancel);
      this.gdrag = { ...this.gdrag, pointer: -1, active: false, overRail: false };
      this.canvasApi?.highlight(null, null);
    },
    hitTest(x: number, y: number): { key: string | null; seat: number | null; rail: boolean } {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!el) return { key: null, seat: null, rail: false };
      const seatEl = el.closest("[data-seat][data-table]") as HTMLElement | null;
      if (seatEl) return { key: seatEl.dataset.table || null, seat: Number(seatEl.dataset.seat), rail: false };
      const tbl = el.closest(".tbl[data-key]") as HTMLElement | null;
      if (tbl) return { key: tbl.dataset.key || null, seat: null, rail: false };
      return { key: null, seat: null, rail: !!el.closest("[data-rail]") };
    },
    /** Tap/Enter on a rail guest: seat at the selected table (or the selected seat). */
    pickGuest(id: number) {
      const t = this.board.selectedTable;
      if (!t) {
        notify({ text: "בחרו שולחן במפה, ואז הקישו על אורח כדי להושיב אותו. אפשר גם לגרור", type: "success", duration: 3000 });
        return;
      }
      if (this.board.selectedSeat != null) this.board.dropOnSeat(id, t.key, this.board.selectedSeat);
      else this.board.placeGuest(id, t.key);
    },

    /* ───────── keyboard ───────── */
    onKey(e: KeyboardEvent) {
      if (this.showSmart || this.showConstraints || !this.loaded || !this.entitlement.enabled) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("input, textarea, select, [contenteditable='true']") || t.isContentEditable)) return;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key;
      const b = this.board;
      if (mod && (k === "z" || k === "Z")) {
        e.preventDefault();
        if (e.shiftKey) b.redo();
        else b.undo();
      } else if (mod && (k === "y" || k === "Y")) {
        e.preventDefault();
        b.redo();
      } else if (mod && (k === "d" || k === "D")) {
        e.preventDefault();
        b.duplicateSelected();
      } else if (mod && (k === "a" || k === "A")) {
        e.preventDefault();
        b.selectAll();
      } else if (mod && (k === "s" || k === "S")) {
        e.preventDefault();
        this.flush();
      } else if (mod) {
        return;
      } else if (k === "Delete" || k === "Backspace") {
        if (b.selected.length) {
          e.preventDefault();
          b.deleteSelected();
        }
      } else if (k === "Escape") {
        b.select([]);
        this.fxMenu = false;
        this.warnMenu = false;
        this.railOpen = false;
      } else if (k === "r" || k === "R" || k === "]") {
        b.rotateSelected(e.shiftKey ? -15 : 15);
      } else if (k === "[") {
        b.rotateSelected(-15);
      } else if (k.indexOf("Arrow") === 0) {
        if (!b.selected.length) return;
        e.preventDefault();
        const step = e.shiftKey ? GRID * 4 : GRID / 2;
        const dx = k === "ArrowLeft" ? -step : k === "ArrowRight" ? step : 0;
        const dy = k === "ArrowUp" ? -step : k === "ArrowDown" ? step : 0;
        b.nudge(dx, dy);
      } else if (k === "+" || k === "=" || k === "-" || k === "_") {
        const up = k === "+" || k === "=";
        const tbl = b.selectedTable;
        if (tbl) b.changeSeats(tbl, tbl.seats + (up ? 1 : -1));
        else this.canvasApi?.zoomBy(up ? 1.15 : 1 / 1.15);
      }
    },

    onResize() {
      this.isNarrow = window.innerWidth < 900;
      if (!this.isNarrow) this.railOpen = false;
      this.$nextTick(this.measure);
    },
    /** Fill the viewport below the page's real top (site header and title sit above it). */
    measure() {
      const el = this.$refs.page as HTMLElement | undefined;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const bottomGap = this.isNarrow ? 88 : 16;
      this.pageH = Math.max(this.isNarrow ? 440 : 540, Math.round(window.innerHeight - top - bottomGap));
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/guests-seating.scss";
</style>

<style lang="scss" scoped>
.seating-page {
  height: calc(100vh - 120px);
  min-height: 540px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #161310;
  direction: rtl;
  position: relative;
}
.locked {
  max-width: 520px;
  margin: 60px auto;
  text-align: center;
  h1 {
    font-size: 24px;
    margin: 0 0 8px;
  }
  p {
    color: #5e564e;
    margin: 0 0 16px;
  }
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px 16px;
  flex-wrap: wrap;
}
.tb-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 850;
    letter-spacing: -0.01em;
  }
}
.save-state {
  font-size: 12px;
  font-weight: 700;
  color: #5e564e;
  &.saved {
    color: #2c5a3f;
  }
  &.error,
  &.offline {
    color: #8a1c28;
  }
}
.tb-tools {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-inline-start: auto;
}
.sep {
  width: 1px;
  height: 22px;
  background: rgba(22, 19, 16, 0.14);
  margin: 0 2px;
}
.menu-wrap {
  position: relative;
}
.menu {
  position: absolute;
  top: calc(100% + 6px);
  inset-inline-start: 0;
  z-index: 60;
  min-width: 170px;
  background: #fffcfa;
  border: 1px solid rgba(22, 19, 16, 0.12);
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(22, 19, 16, 0.18);
  padding: 6px;
  display: grid;
  button {
    text-align: right;
    border: 0;
    background: transparent;
    color: #161310;
    font: inherit;
    font-size: 14px;
    padding: 8px 10px;
    border-radius: 9px;
    cursor: pointer;
    &:hover,
    &:focus-visible {
      background: #f7f1e8;
    }
  }
}
.warn-menu {
  min-width: 260px;
  max-height: 300px;
  overflow: auto;
  inset-inline-start: auto;
  inset-inline-end: 0;
}
.warn-btn {
  background: #fdf6e8;
  border-color: #e3c78f;
  color: #5c4210;
}
.quota-pill {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #12100e;
  color: #f3eee6;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.conflict {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 14px;
  background: #fdf0f1;
  color: #7d1a25;
  font-size: 14px;
  font-weight: 650;
}
.stage {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) 300px;
  gap: 10px;
  direction: ltr;
}
.stage-rail {
  grid-column: 1;
  grid-row: 1;
}
.stage-canvas {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
  display: flex;
  > :first-child {
    flex: 1;
  }
}
.stage-insp {
  grid-column: 3;
  grid-row: 1;
  width: auto;
}
.summary {
  background: #fffcfa;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 18px;
  padding: 14px;
  direction: rtl;
  overflow: auto;
  h2 {
    margin: 0 0 10px;
    font-size: 16px;
  }
}
.sum-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 5px 0;
  span {
    color: #5e564e;
  }
}
.occ-bar {
  height: 8px;
  background: #ece4d8;
  border-radius: 99px;
  overflow: hidden;
  margin: 8px 0 12px;
  i {
    display: block;
    height: 100%;
    background: #3d5a4a;
  }
}
.tips {
  margin: 0;
  padding-inline-start: 18px;
  font-size: 13px;
  color: #5e564e;
  display: grid;
  gap: 6px;
}
.hint {
  font-size: 13px;
  color: #5e564e;
}
.empty-plan {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  direction: rtl;
  .gs-card {
    pointer-events: auto;
    max-width: 420px;
    text-align: center;
    box-shadow: 0 18px 40px rgba(22, 19, 16, 0.12);
  }
  h2 {
    margin: 0 0 6px;
    font-size: 20px;
  }
  p {
    margin: 0 0 14px;
    color: #5e564e;
    font-size: 14px;
  }
  .row {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }
}
.loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #5e564e;
  font-weight: 700;
}
.ghost {
  position: fixed;
  z-index: 3000;
  pointer-events: none;
  transform: translate(-50%, -130%);
  background: #12100e;
  color: #f3eee6;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(22, 19, 16, 0.3);
  white-space: nowrap;
}
.mobile-bar {
  display: none;
}

@media (max-width: 1180px) {
  .stage {
    grid-template-columns: 220px minmax(0, 1fr) 280px;
  }
}

@media (max-width: 899px) {
  .seating-page {
    height: calc(100vh - 230px);
    min-height: 440px;
    gap: 8px;
  }
  .tb-title h1 {
    font-size: 19px;
  }
  .tb-tools {
    flex-wrap: nowrap;
    overflow-x: auto;
    width: 100%;
    margin: 0;
    padding-bottom: 2px;
    scrollbar-width: none;
    > * {
      flex-shrink: 0;
    }
  }
  .menu {
    position: fixed;
    top: auto;
    bottom: 120px;
    inset-inline-start: 12px;
    inset-inline-end: 12px;
  }
  .hide-sm,
  .tb-tools .sep,
  .tb-tools .gs-btn-gold,
  .tb-tools .quota-pill {
    display: none;
  }
  .stage {
    display: block;
    position: relative;
  }
  .stage-canvas {
    height: 100%;
  }
  .summary {
    display: none;
  }
  .mobile-bar {
    display: flex;
    gap: 6px;
    > * {
      flex: 1;
    }
  }
}

</style>
