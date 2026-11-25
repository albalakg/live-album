<template>
  <Teleport to="body">
  <div class="gs-ui gs-overlay" @mousedown.self="$emit('close')">
    <section class="gs-dialog groups-dialog" role="dialog" aria-modal="true" aria-label="קבוצות">
      <h2>קבוצות וצדדים</h2>
      <p class="gs-dialog-lede">קבוצות עוזרות לשבץ משפחות וחברים יחד. הצבע מופיע ברשימה ובמפת האולם.</p>

      <ul class="group-list">
        <li v-for="g in rows" :key="g.id" class="group-item">
          <div class="swatches" role="radiogroup" :aria-label="'צבע ל' + g.name">
            <button
              v-for="c in colors"
              :key="c"
              type="button"
              role="radio"
              class="sw"
              :class="{ on: g.color === c }"
              :style="{ background: c }"
              :aria-checked="g.color === c"
              :aria-label="'צבע ' + c"
              @click="update(g, { color: c })"
            ></button>
          </div>
          <input
            class="gs-input name"
            :value="g.name"
            maxlength="80"
            :aria-label="'שם הקבוצה ' + g.name"
            @change="onName(g, $event)"
          />
          <select class="gs-select side" :value="g.side || ''" aria-label="צד" @change="onSide(g, $event)">
            <option value="">ללא צד</option>
            <option v-for="(label, key) in sides" :key="key" :value="key">{{ label }}</option>
          </select>
          <span class="count">{{ g.people }} אנשים</span>
          <button class="gs-btn gs-btn-sm gs-btn-ghost gs-btn-danger" type="button" :aria-label="'מחיקת ' + g.name" @click="remove(g)">מחיקה</button>
        </li>
        <li v-if="!rows.length" class="empty">עוד אין קבוצות</li>
      </ul>

      <form class="add-row" @submit.prevent="add">
        <input v-model="newName" class="gs-input" maxlength="80" placeholder="קבוצה חדשה, למשל: חברים מהצבא" aria-label="שם קבוצה חדשה" />
        <select v-model="newSide" class="gs-select" aria-label="צד לקבוצה החדשה">
          <option :value="null">ללא צד</option>
          <option v-for="(label, key) in sides" :key="key" :value="key">{{ label }}</option>
        </select>
        <button class="gs-btn gs-btn-deep" type="submit" :disabled="!newName.trim() || busy">הוספה</button>
      </form>

      <div class="gs-dialog-actions">
        <button class="gs-btn" type="button" @click="$emit('close')">סיום</button>
      </div>
    </section>
  </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { guestsApi } from "@/helpers/seating/api";
import { apiError, GROUP_SWATCHES, SIDE_LABELS } from "@/helpers/seating/labels";
import { GuestGroup, Side } from "@/helpers/seating/types";
import { notify } from "@/helpers/notify";

export default defineComponent({
  name: "GuestGroupsDialog",

  props: {
    eventId: { type: Number, required: true },
    groups: { type: Array as PropType<GuestGroup[]>, default: () => [] },
  },

  emits: ["close", "changed"],

  data() {
    return {
      rows: this.groups.map((g) => ({ ...g })) as GuestGroup[],
      newName: "",
      newSide: null as Side | null,
      busy: false,
      sides: SIDE_LABELS,
      colors: GROUP_SWATCHES,
    };
  },

  watch: {
    groups(val: GuestGroup[]) {
      this.rows = val.map((g) => ({ ...g }));
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
    onName(g: GuestGroup, e: Event) {
      this.update(g, { name: (e.target as HTMLInputElement).value });
    },
    onSide(g: GuestGroup, e: Event) {
      this.update(g, { side: ((e.target as HTMLSelectElement).value || null) as Side | null });
    },
    async add() {
      if (!this.newName.trim()) return;
      this.busy = true;
      try {
        await guestsApi.createGroup(this.eventId, { name: this.newName.trim(), side: this.newSide });
        this.newName = "";
        this.$emit("changed");
      } catch (err) {
        notify({ text: apiError(err, "לא הצלחנו להוסיף קבוצה"), type: "error", duration: 4000 });
      } finally {
        this.busy = false;
      }
    },
    async update(g: GuestGroup, patch: { name?: string; side?: Side | null; color?: string }) {
      if (patch.name !== undefined && !patch.name.trim()) return;
      try {
        await guestsApi.updateGroup(this.eventId, g.id, patch);
        Object.assign(g, patch);
        this.$emit("changed");
      } catch (err) {
        notify({ text: apiError(err, "העדכון נכשל"), type: "error", duration: 4000 });
      }
    },
    async remove(g: GuestGroup) {
      if (!window.confirm(`למחוק את הקבוצה "${g.name}"? האורחים יישארו ברשימה בלי קבוצה.`)) return;
      try {
        await guestsApi.removeGroup(this.eventId, g.id);
        this.$emit("changed");
      } catch (err) {
        notify({ text: apiError(err, "המחיקה נכשלה"), type: "error", duration: 4000 });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.groups-dialog {
  width: min(720px, 100%);
}
.group-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.group-item {
  display: grid;
  grid-template-columns: auto 1fr 130px auto auto;
  gap: 8px;
  align-items: center;
}
.swatches {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  width: 92px;
}
.sw {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  &.on {
    box-shadow: 0 0 0 2px #fffcfa, 0 0 0 4px #c9a36a;
  }
}
.count {
  font-size: 12px;
  color: #5e564e;
  white-space: nowrap;
}
.empty {
  color: #5e564e;
  font-size: 14px;
}
.add-row {
  display: grid;
  grid-template-columns: 1fr 140px auto;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(22, 19, 16, 0.11);
}
@media (max-width: 900px) {
  .group-item {
    grid-template-columns: 1fr 1fr;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(22, 19, 16, 0.08);
  }
  .swatches {
    grid-column: 1 / -1;
    width: auto;
  }
  .add-row {
    grid-template-columns: 1fr;
  }
}
</style>
