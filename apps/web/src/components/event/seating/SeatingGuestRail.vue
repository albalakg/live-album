<template>
  <aside class="rail" data-rail="1" :class="{ over: dropOver }" aria-label="אורחים שעדיין לא הושבו">
    <header>
      <div class="rail-title">
        <b>עדיין לא הושבו</b>
        <button v-if="closable" class="close" type="button" aria-label="סגירת הרשימה" @click="$emit('close')">×</button>
      </div>
      <span class="count">{{ board.unseated.length }} הזמנות · {{ unseatedPeople }} מקומות</span>
      <input v-model="query" class="gs-input search" type="search" placeholder="חיפוש ברשימה" aria-label="חיפוש אורח" />
      <select v-model="groupFilter" class="gs-select group" aria-label="סינון לפי קבוצה">
        <option value="all">כל הקבוצות</option>
        <option v-for="g in board.groups" :key="g.id" :value="String(g.id)">{{ g.name }}</option>
        <option value="none">ללא קבוצה</option>
      </select>
    </header>
    <div class="rail-list">
      <div
        v-for="g in rows"
        :key="g.id"
        class="gchip"
        :data-guest="g.id"
        role="button"
        tabindex="0"
        :aria-label="`${g.full_name}, ${g.party_size} מקומות. גררו לשולחן`"
        @pointerdown="$emit('guest-down', g.id, $event)"
        @keydown.enter.prevent="$emit('guest-pick', g.id)"
      >
        <span class="gs-ava" :style="{ background: colorFor(g) }" aria-hidden="true">{{ initialsOf(g.full_name) }}</span>
        <div class="meta">
          <b>{{ g.full_name }}</b>
          <small>
            {{ groupName(g) }}<template v-if="groupName(g)"> · </template>{{ g.party_size }} מקומות<template v-if="g.status !== 1"> · {{ statusLabels[g.status] }}</template>
          </small>
        </div>
        <span class="grip" aria-hidden="true">⋮⋮</span>
      </div>
      <p v-if="!board.unseated.length && board.guests.length" class="done">כולם הושבו 🎉</p>
      <p v-else-if="!board.guests.length" class="done">
        עוד אין אורחים.
        <router-link to="/event/guests">לניהול האורחים</router-link>
      </p>
      <p v-else-if="!rows.length" class="done">אין תוצאות</p>
      <p class="drop-hint">גררו לכאן אורח כדי להוריד אותו מהשולחן</p>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { SeatingBoard } from "@/helpers/seating/board";
import { initials, SIDE_COLORS, STATUS_LABELS } from "@/helpers/seating/labels";
import { CrmGuest } from "@/helpers/seating/types";

export default defineComponent({
  name: "SeatingGuestRail",

  props: {
    dropOver: { type: Boolean, default: false },
    closable: { type: Boolean, default: false },
  },

  emits: ["guest-down", "guest-pick", "close"],

  setup() {
    const board = inject("seatingBoard") as SeatingBoard;
    return { board };
  },

  data() {
    return {
      query: "",
      groupFilter: "all",
      statusLabels: STATUS_LABELS,
    };
  },

  computed: {
    rows(): CrmGuest[] {
      const q = this.query.trim().toLowerCase();
      return this.board.unseated
        .filter((g) => {
          if (this.groupFilter === "none" ? !!g.group_id : this.groupFilter !== "all" && String(g.group_id) !== this.groupFilter) return false;
          if (!q) return true;
          return `${g.full_name} ${this.groupName(g)} ${g.notes || ""} ${g.phone || ""}`.toLowerCase().includes(q);
        })
        .slice()
        .sort((a, b) => (a.group_id || 1e9) - (b.group_id || 1e9) || b.party_size - a.party_size || a.id - b.id);
    },
    unseatedPeople(): number {
      return this.board.unseated.reduce((s, g) => s + g.party_size, 0);
    },
  },

  methods: {
    initialsOf(name: string): string {
      return initials(name);
    },
    groupName(g: CrmGuest): string {
      return g.group_id ? this.board.groupMap.get(g.group_id)?.name || "" : "";
    },
    colorFor(g: CrmGuest): string {
      const group = g.group_id ? this.board.groupMap.get(g.group_id) : null;
      return group?.color || SIDE_COLORS[g.side || "none"];
    },
  },
});
</script>

<style lang="scss" scoped>
.rail {
  background: #fffcfa;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  direction: rtl;
  &.over {
    outline: 2px dashed #c9a36a;
    outline-offset: -2px;
    background: #f7f1e8;
  }
}
header {
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(22, 19, 16, 0.11);
  display: grid;
  gap: 6px;
}
.rail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  b {
    font-size: 15px;
  }
}
.close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: #f1e8da;
  color: #161310;
  font-size: 18px;
  cursor: pointer;
}
.count {
  color: #5e564e;
  font-size: 12px;
}
.search,
.group {
  height: 34px;
  font-size: 13px;
}
.rail-list {
  flex: 1;
  overflow: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 80px;
}
.gchip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 12px;
  background: #f7f1e8;
  border: 1px solid rgba(22, 19, 16, 0.11);
  cursor: grab;
  color: #161310;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  &:hover {
    border-color: #c9a36a;
  }
  &:focus-visible {
    outline: 2px solid #c9a36a;
  }
  .gs-ava {
    width: 30px;
    height: 30px;
    font-size: 11px;
  }
}
.meta {
  flex: 1;
  min-width: 0;
  b {
    display: block;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  small {
    color: #5e564e;
    font-size: 11px;
  }
}
.grip {
  color: #6a6158;
  font-size: 12px;
  letter-spacing: -2px;
}
.done {
  color: #5e564e;
  font-size: 13px;
  text-align: center;
  margin: 12px 0;
  a {
    color: #6b4b1d;
    font-weight: 700;
  }
}
.drop-hint {
  margin: auto 0 0;
  padding-top: 8px;
  font-size: 11px;
  color: #6a6158;
  text-align: center;
}
</style>
