<template>
  <div class="msg-audience">
    <div class="msg-filters" role="group" aria-label="סינון לפי אישור הגעה">
      <button v-for="s in statusOrder" :key="s" type="button" class="msg-chip-btn" :class="{ on: statuses.includes(s) }" :aria-pressed="statuses.includes(s)" @click="toggleStatus(s)">
        {{ statusLabels[s] }} ({{ countByStatus(s) }})
      </button>
    </div>
    <div class="msg-two" style="margin-top: 10px">
      <div>
        <label class="gs-label" for="aud-side">צד</label>
        <select id="aud-side" v-model="side" class="gs-select" @change="emitSegment">
          <option value="">כל הצדדים</option>
          <option value="bride">צד כלה</option>
          <option value="groom">צד חתן</option>
          <option value="shared">משותף</option>
          <option value="none">ללא צד</option>
        </select>
      </div>
      <div>
        <label class="gs-label" for="aud-group">קבוצה</label>
        <select id="aud-group" v-model="groupId" class="gs-select" @change="emitSegment">
          <option value="">כל הקבוצות</option>
          <option v-for="g in groups" :key="g.id" :value="String(g.id)">{{ g.name }}</option>
        </select>
      </div>
    </div>
    <label class="msg-toggle">
      <input v-model="onlySeated" type="checkbox" @change="emitSegment" />
      <span>רק מי ששובץ לשולחן<small>מתאים להודעת "השולחן שלך" ביום האירוע</small></span>
    </label>
    <label class="msg-toggle">
      <input v-model="pickMode" type="checkbox" @change="onPickMode" />
      <span>בחירה ידנית של אורחים<small>במקום סינון — מסמנים בדיוק למי לשלוח</small></span>
    </label>

    <div class="msg-row" style="margin: 10px 0">
      <input v-model="query" class="gs-input" type="search" placeholder="חיפוש אורח" aria-label="חיפוש אורח" style="max-width: 260px" />
      <span class="msg-spacer"></span>
      <span class="b b-green">{{ matched.length }} יקבלו</span>
      <span v-if="noPhone" class="b b-grey">{{ noPhone }} בלי טלפון</span>
      <span v-if="optedOut" class="b b-red">{{ optedOut }} הוסרו</span>
    </div>

    <div class="msg-scroll gs-card" style="max-height: 340px; overflow: auto">
      <table class="msg-table">
        <thead>
          <tr>
            <th v-if="pickMode"><span class="gs-sr">בחירה</span></th>
            <th>אורח</th>
            <th>אישור</th>
            <th>שולחן</th>
            <th>מכסה</th>
            <th>ממתין בתור</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in visible" :key="g.id">
            <td v-if="pickMode">
              <input type="checkbox" :checked="picked.includes(g.id)" :disabled="!g.has_phone || g.opted_out" :aria-label="'בחירת ' + g.full_name" @change="togglePick(g.id)" />
            </td>
            <td>
              <div class="msg-row">
                <span class="gs-ava" aria-hidden="true">{{ initials(g.full_name) }}</span>
                <span>{{ g.full_name }}</span>
                <span v-if="!g.has_phone" class="b b-grey">אין טלפון</span>
                <span v-else-if="g.opted_out" class="b b-red">הוסר</span>
              </div>
            </td>
            <td><span class="gs-pill" :class="'st-' + g.status">{{ statusLabels[g.status] }}</span></td>
            <td>{{ g.table_label || "—" }}</td>
            <td><span :class="g.left ? 'b b-green' : 'b b-red'">{{ g.used + g.pending }}/{{ perGuest }}</span></td>
            <td>
              <button v-if="g.pending" type="button" class="gs-btn gs-btn-sm" @click="$emit('open-guest', g)">{{ g.pending }} ממתינות</button>
              <span v-else class="msg-muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!visible.length" class="msg-empty">אין אורחים שמתאימים לסינון</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { AudienceGuest, Segment } from "@/helpers/messaging/types";
import { initials, STATUS_LABELS } from "@/helpers/seating/labels";

export default defineComponent({
  name: "MessagingAudiencePicker",
  props: {
    guests: { type: Array as PropType<AudienceGuest[]>, required: true },
    groups: { type: Array as PropType<{ id: number; name: string }[]>, default: () => [] },
    perGuest: { type: Number, default: 1 },
    modelValue: { type: Object as PropType<Segment>, default: () => ({}) },
  },
  emits: ["update:modelValue", "open-guest"],
  data() {
    const v = this.modelValue || {};
    return {
      statusOrder: [0, 3, 1, 2] as number[],
      statusLabels: STATUS_LABELS as Record<number, string>,
      statuses: (v.statuses ? [...v.statuses] : [0, 3]) as number[],
      side: v.sides?.[0] || "",
      groupId: v.group_ids?.[0] ? String(v.group_ids[0]) : "",
      onlySeated: v.has_table === true,
      pickMode: Boolean(v.guest_ids && v.guest_ids.length),
      picked: (v.guest_ids ? [...v.guest_ids] : []) as number[],
      query: "",
    };
  },
  computed: {
    filtered(): AudienceGuest[] {
      if (this.pickMode) return this.guests;
      return this.guests.filter((g) => {
        if (!this.statuses.includes(g.status)) return false;
        if (this.side === "none" ? g.side : this.side && g.side !== this.side) return false;
        if (this.groupId && String(g.group_id) !== this.groupId) return false;
        if (this.onlySeated && !g.table_label) return false;
        return true;
      });
    },
    matched(): AudienceGuest[] {
      const base = this.pickMode ? this.guests.filter((g) => this.picked.includes(g.id)) : this.filtered;
      return base.filter((g) => g.has_phone && !g.opted_out);
    },
    noPhone(): number {
      return this.filtered.filter((g) => !g.has_phone && (!this.pickMode || this.picked.includes(g.id))).length;
    },
    optedOut(): number {
      return this.filtered.filter((g) => g.opted_out && (!this.pickMode || this.picked.includes(g.id))).length;
    },
    visible(): AudienceGuest[] {
      const q = this.query.trim();
      const list = q ? this.filtered.filter((g) => g.full_name.includes(q)) : this.filtered;
      return list.slice(0, 400);
    },
  },
  mounted() {
    this.emitSegment();
  },
  methods: {
    initials,
    countByStatus(s: number): number {
      return this.guests.filter((g) => g.status === s).length;
    },
    toggleStatus(s: number) {
      this.statuses = this.statuses.includes(s) ? this.statuses.filter((x) => x !== s) : [...this.statuses, s];
      this.emitSegment();
    },
    togglePick(id: number) {
      this.picked = this.picked.includes(id) ? this.picked.filter((x) => x !== id) : [...this.picked, id];
      this.emitSegment();
    },
    onPickMode() {
      if (this.pickMode && !this.picked.length) this.picked = this.filtered.filter((g) => g.has_phone && !g.opted_out).map((g) => g.id);
      this.emitSegment();
    },
    emitSegment() {
      const seg: Segment = {};
      if (this.pickMode) {
        seg.guest_ids = [...this.picked];
      } else {
        seg.statuses = [...this.statuses];
        if (this.side) seg.sides = [this.side];
        if (this.groupId) seg.group_ids = [Number(this.groupId)];
        if (this.onlySeated) seg.has_table = true;
      }
      this.$emit("update:modelValue", seg);
    },
  },
});
</script>
