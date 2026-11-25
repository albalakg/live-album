<template>
  <div class="gs-ui guests-page">
    <header class="page-top">
      <div>
        <h1>ניהול אורחים</h1>
        <p class="lede">רשימה אחת לאירוע, משותפת להושבה ול-WhatsApp</p>
      </div>
      <div class="top-actions">
        <button class="gs-btn" type="button" @click="showImport = true">ייבוא מאקסל</button>
        <div class="menu-wrap">
          <button class="gs-btn" type="button" aria-haspopup="menu" :aria-expanded="exportOpen" :disabled="!guests.length" @click="exportOpen = !exportOpen">
            ייצוא ▾
          </button>
          <div v-if="exportOpen" class="pop" role="menu">
            <button type="button" role="menuitem" @click="exportXlsx">קובץ Excel (‎.xlsx‎)</button>
            <button type="button" role="menuitem" @click="exportCsv">קובץ CSV</button>
          </div>
        </div>
        <button class="gs-btn" type="button" @click="showGroups = true">קבוצות</button>
        <router-link v-if="seatingEnabled" class="gs-btn" to="/event/seating">מפת הושבה</router-link>
        <button class="gs-btn gs-btn-deep" type="button" @click="openEditor(null)">+ הוספת אורח</button>
      </div>
    </header>

    <section class="stats" aria-label="סיכום">
      <div class="stat gs-card"><strong>{{ stats.invitations }}</strong><span>הזמנות ברשימה</span></div>
      <div class="stat gs-card"><strong class="ok">{{ stats.confirmed }}</strong><span>מגיעים (אנשים)</span></div>
      <div class="stat gs-card"><strong>{{ stats.pending + stats.maybe }}</strong><span>ממתינים / אולי</span></div>
      <div class="stat gs-card"><strong>{{ stats.seated }}</strong><span>הושבו</span></div>
      <div class="stat gs-card"><strong>{{ stats.unseated }}</strong><span>עוד בלי שולחן</span></div>
    </section>

    <section class="filters" aria-label="סינון">
      <input v-model="query" class="gs-input search" type="search" placeholder="חיפוש לפי שם, טלפון, קבוצה או הערה" aria-label="חיפוש" />
      <select v-model="statusFilter" class="gs-select" aria-label="סטטוס">
        <option value="all">כל הסטטוסים</option>
        <option v-for="s in statusOrder" :key="s" :value="String(s)">{{ statusLabels[s] }}</option>
      </select>
      <select v-model="sideFilter" class="gs-select" aria-label="צד">
        <option value="all">כל הצדדים</option>
        <option v-for="(label, key) in sideLabels" :key="key" :value="key">{{ label }}</option>
        <option value="none">ללא צד</option>
      </select>
      <select v-model="groupFilter" class="gs-select" aria-label="קבוצה">
        <option value="all">כל הקבוצות</option>
        <option v-for="g in groups" :key="g.id" :value="String(g.id)">{{ g.name }}</option>
        <option value="none">ללא קבוצה</option>
      </select>
      <select v-model="extraFilter" class="gs-select" aria-label="עוד">
        <option value="all">הכל</option>
        <option value="unseated">לא הושבו</option>
        <option value="seated">הושבו</option>
        <option value="nophone">בלי טלפון</option>
      </select>
    </section>

    <div v-if="selected.length" class="bulk gs-card" role="region" aria-label="פעולות על נבחרים">
      <b>{{ selected.length }} נבחרו</b>
      <select class="gs-select" aria-label="שינוי סטטוס" @change="bulkSet('status', $event)">
        <option value="">שינוי אישור הגעה…</option>
        <option v-for="s in statusOrder" :key="s" :value="String(s)">{{ statusLabels[s] }}</option>
      </select>
      <select class="gs-select" aria-label="שיוך לקבוצה" @change="bulkSet('group_id', $event)">
        <option value="">שיוך לקבוצה…</option>
        <option v-for="g in groups" :key="g.id" :value="String(g.id)">{{ g.name }}</option>
        <option value="0">ללא קבוצה</option>
      </select>
      <select class="gs-select" aria-label="שינוי צד" @change="bulkSet('side', $event)">
        <option value="">שינוי צד…</option>
        <option v-for="(label, key) in sideLabels" :key="key" :value="key">{{ label }}</option>
        <option value="none">ללא צד</option>
      </select>
      <button class="gs-btn gs-btn-sm gs-btn-danger" type="button" @click="bulkDelete">מחיקה</button>
      <button class="gs-btn gs-btn-sm gs-btn-ghost" type="button" @click="selected = []">ביטול בחירה</button>
    </div>

    <section class="list gs-card" aria-live="polite">
      <div v-if="loading" class="state">טוענים את הרשימה…</div>
      <div v-else-if="loadError" class="state">
        <p>{{ loadError }}</p>
        <button class="gs-btn" type="button" @click="load">נסו שוב</button>
      </div>
      <div v-else-if="!guests.length" class="state empty">
        <h2>עוד אין אורחים</h2>
        <p>מייבאים את הרשימה מאקסל בדקה, או מוסיפים אורח אחד אחד.</p>
        <div class="row-actions">
          <button class="gs-btn gs-btn-deep" type="button" @click="showImport = true">ייבוא מאקסל</button>
          <button class="gs-btn" type="button" @click="openEditor(null)">הוספת אורח</button>
        </div>
      </div>
      <template v-else>
        <div class="table-head" role="row">
          <label class="cb"><input type="checkbox" :checked="allVisibleSelected" aria-label="בחירת כל המוצגים" @change="toggleAll" /></label>
          <button type="button" class="th sortable" @click="sortBy('name')">אורח <span v-if="sort === 'name'">▾</span></button>
          <span class="th">טלפון</span>
          <span class="th">קבוצה</span>
          <button type="button" class="th sortable num" @click="sortBy('party')">מקומות <span v-if="sort === 'party'">▾</span></button>
          <button type="button" class="th sortable" @click="sortBy('status')">אישור הגעה <span v-if="sort === 'status'">▾</span></button>
          <button type="button" class="th sortable" @click="sortBy('table')">שולחן <span v-if="sort === 'table'">▾</span></button>
        </div>
        <div
          v-for="g in pageRows"
          :key="g.id"
          class="g-row"
          :class="{ sel: selectedSet.has(g.id), muted: g.status === 2 || g.status === 4 }"
          role="row"
          tabindex="0"
          @click="openEditor(g)"
          @keydown.enter.self="openEditor(g)"
        >
          <label class="cb" @click.stop><input type="checkbox" :checked="selectedSet.has(g.id)" :aria-label="'בחירת ' + g.full_name" @change="toggle(g.id)" /></label>
          <div class="who">
            <span class="gs-ava" :style="{ background: avatarColor(g) }" aria-hidden="true">{{ initialsOf(g.full_name) }}</span>
            <div class="who-text">
              <b>{{ g.full_name }}</b>
              <small v-if="g.notes">{{ g.notes }}</small>
            </div>
          </div>
          <span class="g-phone" dir="ltr">{{ g.phone || "—" }}</span>
          <span class="grp">
            <span v-if="groupOf(g)" class="gs-chip"><i :style="{ background: groupOf(g)?.color || '#5c4a3a' }"></i>{{ groupOf(g)?.name }}</span>
            <span v-else-if="g.side" class="gs-chip">{{ sideLabels[g.side] }}</span>
          </span>
          <span class="num party">{{ g.party_size }}</span>
          <span class="rsvp" @click.stop>
            <select
              class="gs-pill rsvp-select"
              :class="'st-' + g.status"
              :value="g.status"
              :aria-label="'אישור הגעה של ' + g.full_name"
              @change="setStatus(g, $event)"
            >
              <option v-for="s in statusOrder" :key="s" :value="s">{{ statusLabels[s] }}</option>
            </select>
          </span>
          <span class="tbl">
            <span v-if="g.table_label" class="gs-pill table">{{ g.table_label }}</span>
            <span v-else-if="g.status !== 2 && g.status !== 4" class="gs-pill none">לא הושב</span>
          </span>
        </div>
        <p v-if="!filtered.length" class="state">אין אורחים שמתאימים לסינון</p>
        <div v-if="filtered.length > pageRows.length" class="more">
          <button class="gs-btn" type="button" @click="limit += 200">הצגת עוד {{ Math.min(200, filtered.length - pageRows.length) }}</button>
        </div>
        <p class="foot">
          מוצגים {{ pageRows.length }} מתוך {{ filtered.length }}
          <span v-if="filtered.length !== guests.length"> (סך הכל {{ guests.length }})</span>
          · {{ filteredPeople }} אנשים
          <span v-if="stats.without_phone"> · {{ stats.without_phone }} בלי טלפון</span>
        </p>
      </template>
    </section>

    <GuestEditorDrawer
      v-if="editorOpen"
      :key="editing ? editing.id : 'new'"
      :event-id="eventId"
      :guest="editing"
      :groups="groups"
      @close="editorOpen = false"
      @saved="onSaved"
      @deleted="onDeleted"
    />
    <GuestImportWizard v-if="showImport" :event-id="eventId" @close="showImport = false" @imported="load" />
    <GuestGroupsDialog v-if="showGroups" :event-id="eventId" :groups="groups" @close="showGroups = false" @changed="load" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import GuestEditorDrawer from "@/components/event/guests/GuestEditorDrawer.vue";
import GuestImportWizard from "@/components/event/guests/GuestImportWizard.vue";
import GuestGroupsDialog from "@/components/event/guests/GuestGroupsDialog.vue";
import { guestsApi } from "@/helpers/seating/api";
import { apiError, initials, SIDE_COLORS, SIDE_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/helpers/seating/labels";
import { buildXlsx, downloadBlob } from "@/helpers/seating/spreadsheet";
import { CrmGuest, GuestGroup, GuestStats, GuestStatus } from "@/helpers/seating/types";
import { isSeatingEnabled } from "@/helpers/features";
import { notify } from "@/helpers/notify";

const EMPTY_STATS: GuestStats = {
  invitations: 0,
  people_invited: 0,
  confirmed: 0,
  declined: 0,
  maybe: 0,
  pending: 0,
  cancelled: 0,
  seated: 0,
  unseated: 0,
  without_phone: 0,
};

type SortKey = "name" | "party" | "status" | "table" | "id";

export default defineComponent({
  name: "EventGuestsView",

  components: { GuestEditorDrawer, GuestImportWizard, GuestGroupsDialog },

  data() {
    return {
      loading: true,
      loadError: "",
      guests: [] as CrmGuest[],
      groups: [] as GuestGroup[],
      stats: { ...EMPTY_STATS } as GuestStats,
      query: "",
      statusFilter: "all",
      sideFilter: "all",
      groupFilter: "all",
      extraFilter: "all",
      sort: "id" as SortKey,
      limit: 200,
      selected: [] as number[],
      editorOpen: false,
      editing: null as CrmGuest | null,
      showImport: false,
      showGroups: false,
      exportOpen: false,
      statusLabels: STATUS_LABELS,
      statusOrder: STATUS_ORDER,
      sideLabels: SIDE_LABELS,
      seatingEnabled: isSeatingEnabled(),
    };
  },

  computed: {
    eventId(): number {
      return Number(this.$store.getters["event/getEvent"]?.id || 0);
    },
    groupMap(): Map<number, GuestGroup> {
      return new Map(this.groups.map((g) => [g.id, g] as [number, GuestGroup]));
    },
    selectedSet(): Set<number> {
      return new Set(this.selected);
    },
    filtered(): CrmGuest[] {
      const q = this.query.trim().toLowerCase();
      const qDigits = q.replace(/\D/g, "");
      const rows = this.guests.filter((g) => {
        if (this.statusFilter !== "all" && String(g.status) !== this.statusFilter) return false;
        if (this.sideFilter === "none" ? !!g.side : this.sideFilter !== "all" && g.side !== this.sideFilter) return false;
        if (this.groupFilter === "none" ? !!g.group_id : this.groupFilter !== "all" && String(g.group_id) !== this.groupFilter) return false;
        if (this.extraFilter === "unseated" && (g.table_id || g.status === 2 || g.status === 4)) return false;
        if (this.extraFilter === "seated" && !g.table_id) return false;
        if (this.extraFilter === "nophone" && g.phone) return false;
        if (!q) return true;
        const group = g.group_id ? this.groupMap.get(g.group_id)?.name || "" : "";
        const hay = `${g.full_name} ${group} ${g.notes || ""} ${g.email || ""} ${g.table_label || ""}`.toLowerCase();
        if (hay.includes(q)) return true;
        return qDigits.length >= 3 && (g.phone || "").replace(/\D/g, "").includes(qDigits);
      });
      const order: Record<number, number> = { 1: 0, 0: 1, 3: 2, 2: 3, 4: 4 };
      const by: Record<SortKey, (a: CrmGuest, b: CrmGuest) => number> = {
        id: (a, b) => a.id - b.id,
        name: (a, b) => a.full_name.localeCompare(b.full_name, "he"),
        party: (a, b) => b.party_size - a.party_size || a.id - b.id,
        status: (a, b) => order[a.status] - order[b.status] || a.id - b.id,
        table: (a, b) => (a.table_label || "תתת").localeCompare(b.table_label || "תתת", "he", { numeric: true }) || a.id - b.id,
      };
      return rows.slice().sort(by[this.sort]);
    },
    pageRows(): CrmGuest[] {
      return this.filtered.slice(0, this.limit);
    },
    filteredPeople(): number {
      return this.filtered.reduce((s, g) => s + g.party_size, 0);
    },
    allVisibleSelected(): boolean {
      return this.pageRows.length > 0 && this.pageRows.every((g) => this.selectedSet.has(g.id));
    },
  },

  watch: {
    query() {
      this.limit = 200;
    },
  },

  mounted() {
    this.load();
    document.addEventListener("click", this.closeMenus);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.closeMenus);
  },

  methods: {
    closeMenus(e: MouseEvent) {
      if (!(e.target as HTMLElement)?.closest?.(".menu-wrap")) this.exportOpen = false;
    },
    async load() {
      if (!this.eventId) return;
      this.loadError = "";
      try {
        const data = await guestsApi.list(this.eventId);
        this.guests = data.guests;
        this.groups = data.groups;
        this.stats = data.stats;
        const ids = new Set(this.guests.map((g) => g.id));
        this.selected = this.selected.filter((id) => ids.has(id));
      } catch (err) {
        this.loadError = apiError(err, "לא הצלחנו לטעון את רשימת האורחים");
      } finally {
        this.loading = false;
      }
    },
    initialsOf(name: string): string {
      return initials(name);
    },
    groupOf(g: CrmGuest): GuestGroup | undefined {
      return g.group_id ? this.groupMap.get(g.group_id) : undefined;
    },
    avatarColor(g: CrmGuest): string {
      return this.groupOf(g)?.color || SIDE_COLORS[g.side || "none"];
    },
    sortBy(key: SortKey) {
      this.sort = this.sort === key ? "id" : key;
    },
    toggle(id: number) {
      this.selected = this.selectedSet.has(id) ? this.selected.filter((x) => x !== id) : this.selected.concat(id);
    },
    toggleAll() {
      if (this.allVisibleSelected) {
        const visible = new Set(this.pageRows.map((g) => g.id));
        this.selected = this.selected.filter((id) => !visible.has(id));
      } else {
        const set = new Set(this.selected);
        this.pageRows.forEach((g) => set.add(g.id));
        this.selected = Array.from(set);
      }
    },
    openEditor(g: CrmGuest | null) {
      this.editing = g;
      this.editorOpen = true;
    },
    onSaved(payload: { guest: CrmGuest; keepOpen: boolean }) {
      if (!payload.keepOpen) this.editorOpen = false;
      this.load();
    },
    onDeleted() {
      this.editorOpen = false;
      this.load();
    },
    async setStatus(g: CrmGuest, e: Event) {
      const status = Number((e.target as HTMLSelectElement).value) as GuestStatus;
      const prev = g.status;
      g.status = status;
      try {
        await guestsApi.update(this.eventId, g.id, { status });
        if ((status === 2 || status === 4) && g.table_label) {
          notify({ text: `${g.full_name} הוסר/ה מ${g.table_label}`, type: "success", duration: 3500 });
        }
        this.load();
      } catch (err) {
        g.status = prev;
        notify({ text: apiError(err, "העדכון נכשל"), type: "error", duration: 4000 });
      }
    },
    async bulkSet(field: "status" | "group_id" | "side", e: Event) {
      const el = e.target as HTMLSelectElement;
      const raw = el.value;
      el.value = "";
      if (raw === "") return;
      const changes =
        field === "status"
          ? { status: Number(raw) }
          : field === "group_id"
          ? { group_id: Number(raw) || null }
          : { side: raw === "none" ? null : (raw as "bride" | "groom" | "shared") };
      try {
        const res = await guestsApi.bulkUpdate(this.eventId, this.selected, changes);
        notify({ text: `עודכנו ${res.updated} אורחים`, type: "success", duration: 3000 });
        this.load();
      } catch (err) {
        notify({ text: apiError(err, "העדכון נכשל"), type: "error", duration: 4000 });
      }
    },
    async bulkDelete() {
      if (!window.confirm(`למחוק ${this.selected.length} אורחים מהרשימה? הם יוסרו גם מההושבה.`)) return;
      try {
        const res = await guestsApi.remove(this.eventId, this.selected);
        notify({ text: `נמחקו ${res.deleted} אורחים`, type: "success", duration: 3000 });
        this.selected = [];
        this.load();
      } catch (err) {
        notify({ text: apiError(err, "המחיקה נכשלה"), type: "error", duration: 4000 });
      }
    },
    exportRows(): (string | number | null)[][] {
      const rows: (string | number | null)[][] = [["שם מלא", "טלפון", "מייל", "מספר מגיעים", "אישור הגעה", "קבוצה", "צד", "שולחן", "הערות"]];
      this.filtered.forEach((g) => {
        rows.push([
          g.full_name,
          g.phone || "",
          g.email || "",
          g.party_size,
          STATUS_LABELS[g.status],
          this.groupOf(g)?.name || "",
          g.side ? SIDE_LABELS[g.side] : "",
          g.table_label || "",
          g.notes || "",
        ]);
      });
      return rows;
    },
    exportXlsx() {
      this.exportOpen = false;
      downloadBlob(buildXlsx("אורחים", this.exportRows(), [24, 15, 24, 12, 12, 18, 11, 12, 30]), `guests-${this.eventId}.xlsx`);
      if (this.filtered.length !== this.guests.length) {
        notify({ text: `יוצאו ${this.filtered.length} אורחים לפי הסינון`, type: "success", duration: 3000 });
      }
    },
    async exportCsv() {
      this.exportOpen = false;
      try {
        const blob = await guestsApi.exportCsv(this.eventId);
        downloadBlob(blob, `guests-${this.eventId}.csv`);
      } catch (err) {
        notify({ text: apiError(err, "הייצוא נכשל"), type: "error", duration: 4000 });
      }
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/guests-seating.scss";
</style>

<style lang="scss" scoped>
.guests-page {
  max-width: 1280px;
}
.page-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 900;
    letter-spacing: -0.04em;
  }
  .lede {
    margin: 4px 0 0;
    color: #5e564e;
  }
}
.top-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.menu-wrap {
  position: relative;
}
.pop {
  position: absolute;
  top: calc(100% + 6px);
  inset-inline-start: 0;
  background: #fffcfa;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(18, 16, 14, 0.16);
  padding: 6px;
  min-width: 190px;
  z-index: 30;
  button {
    display: block;
    width: 100%;
    text-align: right;
    border: 0;
    background: transparent;
    color: #161310;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 9px 10px;
    border-radius: 10px;
    cursor: pointer;
    &:hover,
    &:focus-visible {
      background: #f7f1e8;
    }
  }
}
.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.stat {
  padding: 14px 16px;
  strong {
    display: block;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.02em;
  }
  strong.ok {
    color: #1d5c3a;
  }
  span {
    color: #5e564e;
    font-size: 13px;
    font-weight: 600;
  }
}
.filters {
  display: grid;
  grid-template-columns: 1fr repeat(4, 150px);
  gap: 8px;
  margin-bottom: 12px;
}
.bulk {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  background: #12100e;
  border-color: #12100e;
  color: #f3eee6;
  b {
    margin-inline-end: 6px;
  }
  .gs-select {
    width: auto;
    min-width: 150px;
    height: 34px;
  }
  .gs-btn-ghost {
    color: #f3eee6;
    &:hover {
      background: rgba(243, 238, 230, 0.12);
    }
  }
}
.list {
  overflow: hidden;
}
.table-head,
.g-row {
  display: grid;
  grid-template-columns: 40px minmax(200px, 2fr) 130px minmax(120px, 1.2fr) 70px 120px 110px;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}
.table-head {
  height: 42px;
  background: #f7f1e8;
  border-bottom: 1px solid rgba(22, 19, 16, 0.11);
  font-size: 12px;
  font-weight: 800;
  color: #5e564e;
}
.th {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  text-align: right;
}
.sortable {
  cursor: pointer;
  &:hover {
    color: #161310;
  }
}
.num {
  text-align: center;
}
.g-row {
  min-height: 56px;
  border-bottom: 1px solid rgba(22, 19, 16, 0.07);
  cursor: pointer;
  &:hover {
    background: #fbf7f1;
  }
  &:focus-visible {
    outline: 2px solid #c9a36a;
    outline-offset: -2px;
  }
  &.sel {
    background: #f6efe3;
  }
  &.muted .who-text b {
    color: #5e564e;
  }
}
.cb {
  display: grid;
  place-items: center;
  input {
    width: 16px;
    height: 16px;
    accent-color: #8a6a38;
    cursor: pointer;
  }
}
.who {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.who-text {
  min-width: 0;
  b {
    display: block;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  small {
    display: block;
    color: #5e564e;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.g-phone {
  font-size: 13px;
  color: #161310;
  text-align: right;
}
.party {
  font-weight: 800;
}
.rsvp-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding: 0 10px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  &:focus-visible {
    outline: 2px solid #c9a36a;
  }
}
.state {
  padding: 32px 20px;
  text-align: center;
  color: #5e564e;
  h2 {
    margin: 0 0 6px;
    color: #161310;
    font-size: 22px;
  }
}
.row-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}
.more {
  text-align: center;
  padding: 12px;
}
.foot {
  margin: 0;
  padding: 12px 16px;
  font-size: 12px;
  color: #5e564e;
}

@media (max-width: 1100px) {
  .filters {
    grid-template-columns: 1fr 1fr;
    .search {
      grid-column: 1 / -1;
    }
  }
  .table-head,
  .g-row {
    grid-template-columns: 34px minmax(160px, 2fr) 110px 60px 110px 90px;
  }
  .grp,
  .table-head > :nth-child(4) {
    display: none;
  }
}
@media (max-width: 900px) {
  .page-top {
    align-items: stretch;
  }
  .top-actions {
    .gs-btn {
      flex: 1 1 auto;
    }
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
    .stat:first-child {
      grid-column: 1 / -1;
    }
  }
  .table-head {
    display: none;
  }
  .g-row {
    grid-template-columns: 30px 1fr auto;
    grid-template-areas:
      "cb who rsvp"
      "cb meta tbl";
    padding: 10px 12px;
    row-gap: 4px;
    .cb { grid-area: cb; }
    .who { grid-area: who; }
    .rsvp { grid-area: rsvp; justify-self: end; }
    .tbl { grid-area: tbl; justify-self: end; }
    .g-phone { grid-area: meta; font-size: 12px; color: #5e564e; padding-inline-start: 44px; }
    .party,
    .grp { display: none; }
  }
}
</style>
