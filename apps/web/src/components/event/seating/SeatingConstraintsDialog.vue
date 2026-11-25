<template>
  <Teleport to="body">
  <div class="gs-ui gs-overlay" @mousedown.self="$emit('close')">
    <section class="gs-dialog constraints-dialog" role="dialog" aria-modal="true" aria-label="אילוצי הושבה">
      <h2>אילוצי הושבה</h2>
      <p class="gs-dialog-lede">מי חייב לשבת יחד ומי עדיף שלא. השיבוץ החכם מתחשב בהם, ובמפה תופיע אזהרה אם משהו לא מתקיים. שום דבר לא נחסם.</p>

      <ul class="c-list">
        <li v-for="c in board.constraints" :key="c.id" class="c-item">
          <span class="gs-pill" :class="c.type === 'together' ? 'st-1' : 'st-2'">{{ c.type === "together" ? "יחד" : "בנפרד" }}</span>
          <div class="c-text">
            <b>{{ namesOf(c.guest_ids) }}</b>
            <small v-if="c.note">{{ c.note }}</small>
            <small v-if="violated(c.id)" class="viol">לא מתקיים במפה כרגע</small>
          </div>
          <button class="gs-btn gs-btn-sm gs-btn-ghost gs-btn-danger" type="button" @click="remove(c.id)">מחיקה</button>
        </li>
        <li v-if="!board.constraints.length" class="empty">עוד אין אילוצים</li>
      </ul>

      <form class="c-add" @submit.prevent="add">
        <div class="type-seg" role="radiogroup" aria-label="סוג האילוץ">
          <button type="button" role="radio" :aria-checked="type === 'together'" :class="{ on: type === 'together' }" @click="type = 'together'">חייבים לשבת יחד</button>
          <button type="button" role="radio" :aria-checked="type === 'apart'" :class="{ on: type === 'apart' }" @click="type = 'apart'">לא באותו שולחן</button>
        </div>
        <div class="picked">
          <span v-for="id in picked" :key="id" class="gs-chip">
            {{ nameOf(id) }}
            <button type="button" class="x" :aria-label="'הסרת ' + nameOf(id)" @click="unpick(id)">×</button>
          </span>
        </div>
        <input v-model="query" class="gs-input" type="search" placeholder="חפשו אורח להוספה" aria-label="חיפוש אורח" />
        <div v-if="query.trim()" class="results">
          <button v-for="g in results" :key="g.id" type="button" class="res" @click="pick(g.id)">{{ g.full_name }}<small v-if="g.party_size > 1"> · {{ g.party_size }}</small></button>
          <p v-if="!results.length" class="empty">לא נמצאו אורחים</p>
        </div>
        <input v-model="note" class="gs-input" maxlength="200" placeholder="הערה (רשות)" aria-label="הערה" />
        <div class="gs-dialog-actions">
          <button class="gs-btn gs-btn-deep" type="submit" :disabled="picked.length < 2 || busy">הוספת אילוץ</button>
          <button class="gs-btn" type="button" @click="$emit('close')">סיום</button>
        </div>
      </form>
    </section>
  </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { seatingApi } from "@/helpers/seating/api";
import { SeatingBoard } from "@/helpers/seating/board";
import { apiError } from "@/helpers/seating/labels";
import { CrmGuest } from "@/helpers/seating/types";
import { notify } from "@/helpers/notify";

export default defineComponent({
  name: "SeatingConstraintsDialog",

  props: {
    eventId: { type: Number, required: true },
  },

  emits: ["close", "changed"],

  setup() {
    const board = inject("seatingBoard") as SeatingBoard;
    return { board };
  },

  data() {
    return {
      type: "together" as "together" | "apart",
      picked: [] as number[],
      query: "",
      note: "",
      busy: false,
    };
  },

  computed: {
    results(): CrmGuest[] {
      const q = this.query.trim().toLowerCase();
      return this.board.guests
        .filter((g) => g.status !== 2 && g.status !== 4 && this.picked.indexOf(g.id) < 0 && g.full_name.toLowerCase().includes(q))
        .slice(0, 8);
    },
  },

  mounted() {
    window.addEventListener("keydown", this.onEsc);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onEsc);
  },
  methods: {
    onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") this.$emit("close");
    },
    nameOf(id: number): string {
      return this.board.guestMap.get(id)?.full_name || `#${id}`;
    },
    namesOf(ids: number[]): string {
      return ids.map(this.nameOf).join(" · ");
    },
    violated(id: number): boolean {
      return this.board.warnings.some((w) => w.constraint_id === id);
    },
    unpick(id: number) {
      this.picked = this.picked.filter((p) => p !== id);
    },
    pick(id: number) {
      if (this.picked.length >= 30) return;
      this.picked = this.picked.concat(id);
      this.query = "";
    },
    async add() {
      if (this.picked.length < 2) return;
      this.busy = true;
      try {
        const c = await seatingApi.createConstraint(this.eventId, { type: this.type, guest_ids: this.picked, note: this.note.trim() || null });
        this.board.constraints = this.board.constraints.concat(c);
        this.picked = [];
        this.note = "";
        this.$emit("changed");
      } catch (err) {
        notify({ text: apiError(err, "לא הצלחנו לשמור את האילוץ"), type: "error", duration: 4000 });
      } finally {
        this.busy = false;
      }
    },
    async remove(id: number) {
      try {
        await seatingApi.removeConstraint(this.eventId, id);
        this.board.constraints = this.board.constraints.filter((c) => c.id !== id);
        this.$emit("changed");
      } catch (err) {
        notify({ text: apiError(err, "המחיקה נכשלה"), type: "error", duration: 4000 });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.constraints-dialog {
  width: min(600px, 100%);
}
.c-list {
  list-style: none;
  padding: 0;
  margin: 0 0 14px;
  display: grid;
  gap: 6px;
  max-height: 30vh;
  overflow: auto;
}
.c-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 14px;
}
.c-text {
  flex: 1;
  min-width: 0;
  b {
    display: block;
    font-size: 13px;
  }
  small {
    display: block;
    color: #5e564e;
    font-size: 12px;
  }
  .viol {
    color: #7d1a25;
    font-weight: 700;
  }
}
.empty {
  color: #5e564e;
  font-size: 13px;
}
.c-add {
  display: grid;
  gap: 8px;
  border-top: 1px solid rgba(22, 19, 16, 0.11);
  padding-top: 14px;
}
.type-seg {
  display: flex;
  gap: 6px;
  button {
    flex: 1;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(22, 19, 16, 0.14);
    background: #fffcfa;
    color: #161310;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    &.on {
      background: #12100e;
      border-color: #12100e;
      color: #f3eee6;
    }
  }
}
.picked {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 4px;
  .x {
    border: 0;
    background: transparent;
    color: #5e564e;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
  }
}
.results {
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 12px;
  padding: 4px;
  display: grid;
}
.res {
  text-align: right;
  border: 0;
  background: transparent;
  color: #161310;
  font: inherit;
  font-size: 14px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  &:hover,
  &:focus-visible {
    background: #f7f1e8;
  }
  small {
    color: #5e564e;
  }
}
</style>
