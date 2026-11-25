<template>
  <aside v-if="table || fixture" class="inspector" aria-label="פרטי השולחן">
    <template v-if="table">
      <div class="insp-head">
        <input
          class="gs-input name"
          :value="table.label"
          maxlength="60"
          aria-label="שם השולחן"
          @focus="editStart"
          @input="rename($event)"
          @change="editEnd"
        />
        <button class="gs-btn gs-btn-sm" type="button" @click="board.select([])">סגירה</button>
      </div>
      <div class="insp-body">
        <div class="occ-bar" :class="{ full: used >= table.seats, over: used > table.seats }"><i :style="{ width: Math.min(100, (used / table.seats) * 100) + '%' }"></i></div>
        <p class="occ-text">
          <b>{{ used }}</b> מתוך {{ table.seats }} מקומות תפוסים
          <span v-if="used > table.seats" class="over-txt"> · חריגה של {{ used - table.seats }}</span>
        </p>
        <div class="insp-row">
          <label for="insp-shape">צורה</label>
          <select id="insp-shape" class="gs-select" :value="table.shape" @change="setShape($event)">
            <option value="round">עגול</option>
            <option value="rect">מלבני</option>
          </select>
        </div>
        <div class="insp-row">
          <label for="insp-side">צד</label>
          <select id="insp-side" class="gs-select" :value="table.side || ''" @change="setSide($event)">
            <option value="">ללא</option>
            <option v-for="(label, key) in sideLabels" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="insp-row">
          <span class="lbl">מקומות</span>
          <div class="stepper">
            <button type="button" aria-label="כסא אחד פחות" :disabled="table.seats <= minSeats" @click="board.changeSeats(table, table.seats - 1)">−</button>
            <span aria-live="polite">{{ table.seats }}</span>
            <button type="button" aria-label="כסא אחד יותר" :disabled="table.seats >= maxSeats" @click="board.changeSeats(table, table.seats + 1)">+</button>
          </div>
        </div>

        <div class="mini-table" :class="table.shape" :style="{ width: mini.w + 'px', height: mini.h + 'px' }">
          <div
            v-for="c in miniChairs"
            :key="c.i"
            class="mini-chair"
            :class="{ filled: !!c.cell, hi: board.selectedSeat === c.i }"
            :data-table="table.key"
            :data-seat="c.i"
            :style="{ left: c.x + 'px', top: c.y + 'px', background: c.cell ? colorFor(c.cell.guest) : null }"
            :title="c.cell ? c.cell.guest.full_name : 'כסא ' + (c.i + 1) + ' פנוי'"
            @pointerdown="chairDown(c, $event)"
          >{{ c.cell && c.cell.offset === 0 ? initialsOf(c.cell.guest.full_name) : c.cell ? "+" : c.i + 1 }}</div>
          <div class="mini-surface">{{ table.label }}</div>
        </div>

        <div class="seat-list">
          <div
            v-for="(cell, i) in cells"
            :key="i"
            class="seat-row"
            :class="{ empty: !cell, cont: cell && cell.offset > 0, hi: board.selectedSeat === i }"
            :data-table="table.key"
            :data-seat="i"
            @pointerdown="rowDown(cell, i, $event)"
          >
            <span class="num">{{ i + 1 }}</span>
            <template v-if="cell">
              <span v-if="cell.offset === 0" class="gs-ava sm" :style="{ background: colorFor(cell.guest) }" aria-hidden="true">{{ initialsOf(cell.guest.full_name) }}</span>
              <span v-else class="cont-mark" aria-hidden="true">↳</span>
              <b>{{ cell.guest.full_name }}<small v-if="cell.offset"> · מקום {{ cell.offset + 1 }}</small></b>
              <button v-if="cell.offset === 0" class="rm" type="button" :aria-label="'הורדת ' + cell.guest.full_name + ' מהשולחן'" @pointerdown.stop @click="board.unseat(cell.guest.id)">×</button>
            </template>
            <span v-else class="free">כסא פנוי</span>
          </div>
          <div v-for="g in overflow" :key="'o' + g.id" class="seat-row overflow">
            <span class="num">!</span>
            <b>{{ g.full_name }} <small>· אין כסא פנוי ברצף</small></b>
            <button class="rm" type="button" :aria-label="'הורדת ' + g.full_name" @click="board.unseat(g.id)">×</button>
          </div>
        </div>

        <div class="insp-actions">
          <button class="gs-btn gs-btn-sm" type="button" @click="board.rotateSelected(15)">סיבוב 15°</button>
          <button class="gs-btn gs-btn-sm" type="button" @click="board.duplicateSelected()">שכפול</button>
          <button class="gs-btn gs-btn-sm gs-btn-danger" type="button" @click="board.deleteSelected()">מחיקה</button>
        </div>
        <p class="tip">טיפ: גוררים אורח לכסא מסוים. שחרור על כסא תפוס מחליף מקומות.</p>
      </div>
    </template>

    <template v-else-if="fixture">
      <div class="insp-head">
        <input class="gs-input name" :value="fixture.label" maxlength="40" aria-label="שם האלמנט" @focus="editStart" @input="renameFixture($event)" @change="editEnd" />
        <button class="gs-btn gs-btn-sm" type="button" @click="board.select([])">סגירה</button>
      </div>
      <div class="insp-body">
        <p class="occ-text">אלמנט באולם. אפשר לגרור, לשנות גודל מהפינות ולסובב.</p>
        <div class="insp-actions">
          <button class="gs-btn gs-btn-sm" type="button" @click="board.rotateSelected(90)">סיבוב 90°</button>
          <button class="gs-btn gs-btn-sm" type="button" @click="board.duplicateSelected()">שכפול</button>
          <button class="gs-btn gs-btn-sm gs-btn-danger" type="button" @click="board.deleteSelected()">מחיקה</button>
        </div>
      </div>
    </template>
  </aside>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { SeatingBoard } from "@/helpers/seating/board";
import { chairPositions, MAX_SEATS, MIN_SEATS, SeatCell } from "@/helpers/seating/engine";
import { initials, SIDE_COLORS, SIDE_LABELS } from "@/helpers/seating/labels";
import { CrmGuest, Fixture, SeatTable, Side } from "@/helpers/seating/types";

export default defineComponent({
  name: "SeatingTableInspector",

  emits: ["guest-down"],

  setup() {
    const board = inject("seatingBoard") as SeatingBoard;
    return { board };
  },

  data() {
    return {
      sideLabels: SIDE_LABELS,
      minSeats: MIN_SEATS,
      maxSeats: MAX_SEATS,
      editing: false,
    };
  },

  computed: {
    table(): SeatTable | undefined {
      return this.board.selectedTable;
    },
    fixture(): Fixture | undefined {
      return this.board.selectedFixture;
    },
    used(): number {
      return this.table ? this.board.used(this.table.key) : 0;
    },
    cells(): (SeatCell | null)[] {
      return this.table ? this.board.cells(this.table) : [];
    },
    overflow(): CrmGuest[] {
      const t = this.table;
      if (!t) return [];
      return this.board.guests.filter((g) => this.board.seats[g.id]?.table === t.key && this.board.seats[g.id]?.seat == null);
    },
    mini(): { w: number; h: number } {
      const t = this.table;
      if (!t) return { w: 168, h: 168 };
      const narrow = typeof window !== "undefined" && window.innerWidth < 900;
      if (t.shape === "rect") return narrow ? { w: 170, h: 116 } : { w: 210, h: 140 };
      return narrow ? { w: 140, h: 140 } : { w: 176, h: 176 };
    },
    miniChairs(): { i: number; x: number; y: number; cell: SeatCell | null }[] {
      const t = this.table;
      if (!t) return [];
      return chairPositions({ shape: t.shape, seats: t.seats, w: this.mini.w, h: this.mini.h }, 20).map((p) => ({ ...p, cell: this.cells[p.i] || null }));
    },
  },

  methods: {
    initialsOf(name: string): string {
      return initials(name);
    },
    colorFor(g: CrmGuest): string {
      const group = g.group_id ? this.board.groupMap.get(g.group_id) : null;
      return group?.color || SIDE_COLORS[g.side || "none"];
    },
    editStart() {
      if (!this.editing) {
        this.board.pushHist();
        this.editing = true;
      }
    },
    editEnd() {
      this.editing = false;
      this.board.dropHistIfUnchanged();
    },
    rename(e: Event) {
      const v = (e.target as HTMLInputElement).value;
      if (this.table && v.trim()) {
        this.table.label = v;
        this.board.commit();
      }
    },
    renameFixture(e: Event) {
      const v = (e.target as HTMLInputElement).value;
      if (this.fixture) {
        this.fixture.label = v;
        this.board.commit();
      }
    },
    setShape(e: Event) {
      if (this.table) this.board.setShape(this.table, (e.target as HTMLSelectElement).value === "rect" ? "rect" : "round");
    },
    setSide(e: Event) {
      if (!this.table) return;
      const v = (e.target as HTMLSelectElement).value;
      this.board.pushHist();
      this.table.side = (v || null) as Side | null;
      this.board.commit();
    },
    chairDown(c: { i: number; cell: SeatCell | null }, e: PointerEvent) {
      this.board.selectedSeat = c.i;
      if (c.cell) this.$emit("guest-down", c.cell.guest.id, e);
    },
    rowDown(cell: SeatCell | null, i: number, e: PointerEvent) {
      this.board.selectedSeat = i;
      if (cell) this.$emit("guest-down", cell.guest.id, e);
    },
  },
});
</script>

<style lang="scss" scoped>
.inspector {
  width: 300px;
  background: #fffcfa;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  color: #161310;
  direction: rtl;
}
.insp-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 8px;
  border-bottom: 1px solid rgba(22, 19, 16, 0.11);
  .name {
    height: 36px;
    font-weight: 700;
  }
}
.insp-body {
  flex: 1;
  overflow: auto;
  padding: 10px 12px 16px;
}
.occ-bar {
  height: 8px;
  background: #ece4d8;
  border-radius: 99px;
  overflow: hidden;
  margin: 4px 0 8px;
  i {
    display: block;
    height: 100%;
    background: #3d5a4a;
    border-radius: 99px;
  }
  &.over i {
    background: #8a1c28;
  }
}
.occ-text {
  margin: 0 0 10px;
  font-size: 13px;
}
.over-txt {
  color: #8a1c28;
  font-weight: 700;
}
.insp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  label,
  .lbl {
    color: #5e564e;
    font-weight: 650;
    min-width: 52px;
    font-size: 12px;
  }
  .gs-select {
    height: 34px;
    flex: 1;
  }
}
.stepper {
  flex: 1;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(22, 19, 16, 0.11);
  background: #fffcfa;
  border-radius: 10px;
  padding: 0 4px;
  font-weight: 800;
  button {
    width: 28px;
    height: 26px;
    border: 0;
    background: #e8e0d4;
    color: #161310;
    border-radius: 8px;
    font-weight: 800;
    cursor: pointer;
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}
.mini-table {
  position: relative;
  margin: 10px auto 12px;
  direction: ltr;
}
.mini-surface {
  position: absolute;
  inset: 24px;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 36% 32%, #fffdf9, #f0e4d2);
  box-shadow: inset 0 0 0 2px rgba(201, 163, 106, 0.45);
  color: #161310;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
  padding: 4px;
  overflow: hidden;
}
.mini-table.round .mini-surface {
  border-radius: 50%;
}
.mini-table.rect .mini-surface {
  border-radius: 16px;
}
.mini-chair {
  position: absolute;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border-radius: 7px;
  background: #f4efe6;
  border: 1px solid rgba(22, 19, 16, 0.2);
  display: grid;
  place-items: center;
  font-size: 7px;
  font-weight: 800;
  color: #5e564e;
  cursor: pointer;
  touch-action: none;
  &.filled {
    border-color: transparent;
    color: #fffcfa;
    cursor: grab;
  }
  &:hover,
  &.hi {
    box-shadow: 0 0 0 2px #c9a36a;
  }
}
.seat-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.seat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 6px;
  min-height: 36px;
  border-radius: 10px;
  background: #f7f1e8;
  font-size: 12px;
  color: #161310;
  cursor: grab;
  touch-action: none;
  &.empty {
    background: transparent;
    border: 1px dashed rgba(22, 19, 16, 0.14);
    color: #5e564e;
    cursor: default;
  }
  &.cont {
    background: #fbf7f1;
  }
  &.hi {
    box-shadow: 0 0 0 2px #c9a36a;
  }
  &.overflow {
    background: #fdf0f1;
    color: #7d1a25;
  }
  b {
    flex: 1;
    font-weight: 700;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    small {
      color: #5e564e;
      font-weight: 500;
    }
  }
}
.num {
  width: 20px;
  text-align: center;
  font-weight: 800;
  color: #5e564e;
  font-size: 11px;
}
.gs-ava.sm {
  width: 24px;
  height: 24px;
  font-size: 9px;
}
.cont-mark {
  width: 24px;
  text-align: center;
  color: #6a6158;
}
.free {
  font-size: 12px;
}
.rm {
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #5e564e;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background: #fde8ea;
    color: #8a1c28;
  }
}
.insp-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.tip {
  font-size: 11px;
  color: #5e564e;
  margin: 10px 0 0;
}
</style>
