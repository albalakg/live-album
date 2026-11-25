<template>
  <Teleport to="body">
  <div class="gs-ui gs-overlay guest-drawer-overlay" @mousedown.self="$emit('close')">
    <form class="gs-dialog guest-drawer" role="dialog" aria-modal="true" :aria-label="title" @submit.prevent="save">
      <header class="drawer-head">
        <h2>{{ title }}</h2>
        <button class="gs-btn gs-btn-sm gs-btn-ghost" type="button" @click="$emit('close')">סגירה</button>
      </header>

      <div class="gs-field">
        <label class="gs-label" for="ge-name">שם מלא</label>
        <input
          id="ge-name"
          ref="nameInput"
          v-model="form.full_name"
          class="gs-input"
          maxlength="120"
          autocomplete="off"
          :aria-invalid="errors.full_name ? 'true' : 'false'"
          placeholder="לדוגמה: משפחת לוי"
        />
        <p v-if="errors.full_name" class="gs-error">{{ errors.full_name }}</p>
      </div>

      <div class="grid-2">
        <div class="gs-field">
          <label class="gs-label" for="ge-phone">טלפון <span class="opt">(רשות)</span></label>
          <input
            id="ge-phone"
            v-model="form.phone"
            class="gs-input ltr"
            inputmode="tel"
            dir="ltr"
            maxlength="32"
            autocomplete="off"
            placeholder="050-0000000"
            :aria-invalid="errors.phone ? 'true' : 'false'"
          />
          <p v-if="errors.phone" class="gs-error">{{ errors.phone }}</p>
          <p v-else class="gs-hint">בלי טלפון האורח לא יקבל הודעות WhatsApp</p>
        </div>
        <div class="gs-field">
          <label class="gs-label" for="ge-email">מייל <span class="opt">(רשות)</span></label>
          <input id="ge-email" v-model="form.email" class="gs-input ltr" type="email" dir="ltr" maxlength="255" autocomplete="off" />
        </div>
      </div>

      <div class="grid-2">
        <div class="gs-field">
          <span class="gs-label">מספר מגיעים</span>
          <div class="party-stepper">
            <button type="button" class="gs-btn gs-btn-sm gs-icon-btn" aria-label="פחות" :disabled="form.party_size <= 1" @click="form.party_size--">−</button>
            <span aria-live="polite">{{ form.party_size }}</span>
            <button type="button" class="gs-btn gs-btn-sm gs-icon-btn" aria-label="יותר" :disabled="form.party_size >= 30" @click="form.party_size++">+</button>
          </div>
        </div>
        <div class="gs-field">
          <label class="gs-label" for="ge-side">צד</label>
          <select id="ge-side" v-model="form.side" class="gs-select">
            <option :value="null">ללא</option>
            <option v-for="(label, key) in sides" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
      </div>

      <div class="gs-field">
        <span class="gs-label">אישור הגעה</span>
        <div class="status-seg" role="radiogroup" aria-label="אישור הגעה">
          <button
            v-for="s in statusOrder"
            :key="s"
            type="button"
            role="radio"
            :aria-checked="form.status === s"
            class="seg"
            :class="['st-' + s, { on: form.status === s }]"
            @click="form.status = s"
          >
            {{ statusLabels[s] }}
          </button>
        </div>
        <p v-if="guest && guest.table_label && (form.status === 2 || form.status === 4)" class="gs-hint warn">
          האורח יוסר מ{{ guest.table_label }} כשנשמור
        </p>
      </div>

      <div class="gs-field">
        <label class="gs-label" for="ge-group">קבוצה</label>
        <div class="group-row">
          <select id="ge-group" v-model="groupChoice" class="gs-select">
            <option :value="0">ללא קבוצה</option>
            <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            <option :value="-1">+ קבוצה חדשה…</option>
          </select>
          <input
            v-if="groupChoice === -1"
            v-model="newGroupName"
            class="gs-input"
            maxlength="80"
            placeholder="שם הקבוצה"
            aria-label="שם הקבוצה החדשה"
          />
        </div>
      </div>

      <div class="gs-field">
        <label class="gs-label" for="ge-notes">הערות</label>
        <textarea id="ge-notes" v-model="form.notes" class="gs-textarea" maxlength="1000" placeholder="למשל: כסא תינוק, קרוב ליציאה, צמחוני"></textarea>
      </div>

      <div class="gs-dialog-actions">
        <button class="gs-btn gs-btn-deep" type="submit" :disabled="busy">{{ guest ? "שמירה" : "הוספה" }}</button>
        <button v-if="!guest" class="gs-btn" type="button" :disabled="busy" @click="save(true)">הוספה והמשך</button>
        <button class="gs-btn gs-btn-ghost" type="button" @click="$emit('close')">ביטול</button>
        <button v-if="guest" class="gs-btn gs-btn-danger gs-btn-ghost push" type="button" :disabled="busy" @click="remove">מחיקה</button>
      </div>
    </form>
  </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { guestsApi } from "@/helpers/seating/api";
import { apiError, SIDE_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/helpers/seating/labels";
import { CrmGuest, GuestGroup, GuestStatus, Side } from "@/helpers/seating/types";
import { notify } from "@/helpers/notify";

interface FormState {
  full_name: string;
  phone: string;
  email: string;
  party_size: number;
  status: GuestStatus;
  side: Side | null;
  notes: string;
}

export default defineComponent({
  name: "GuestEditorDrawer",

  props: {
    eventId: { type: Number, required: true },
    guest: { type: Object as PropType<CrmGuest | null>, default: null },
    groups: { type: Array as PropType<GuestGroup[]>, default: () => [] },
  },

  emits: ["close", "saved", "deleted"],

  data() {
    return {
      form: this.initialForm() as FormState,
      groupChoice: (this.guest?.group_id || 0) as number,
      newGroupName: "",
      errors: {} as Record<string, string>,
      busy: false,
      statusLabels: STATUS_LABELS,
      statusOrder: STATUS_ORDER,
      sides: SIDE_LABELS,
    };
  },

  computed: {
    title(): string {
      return this.guest ? "עריכת אורח" : "הוספת אורח";
    },
  },

  mounted() {
    (this.$refs.nameInput as HTMLInputElement | undefined)?.focus();
    window.addEventListener("keydown", this.onKey);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.onKey);
  },

  methods: {
    initialForm(): FormState {
      const g = this.guest;
      return {
        full_name: g?.full_name || "",
        phone: g?.phone || "",
        email: g?.email || "",
        party_size: g?.party_size || 1,
        status: (g?.status ?? 0) as GuestStatus,
        side: g?.side || null,
        notes: g?.notes || "",
      };
    },
    onKey(e: KeyboardEvent) {
      if (e.key === "Escape") this.$emit("close");
    },
    validate(): boolean {
      const errors: Record<string, string> = {};
      if (!this.form.full_name.trim()) errors.full_name = "חסר שם";
      const digits = this.form.phone.replace(/\D/g, "");
      if (this.form.phone.trim() && (digits.length < 7 || digits.length > 15)) errors.phone = "מספר טלפון לא תקין";
      this.errors = errors;
      return Object.keys(errors).length === 0;
    },
    async save(keepOpen = false) {
      if (this.busy || !this.validate()) return;
      this.busy = true;
      const payload = {
        full_name: this.form.full_name.trim(),
        phone: this.form.phone.trim() || null,
        email: this.form.email.trim() || null,
        party_size: this.form.party_size,
        status: this.form.status,
        side: this.form.side,
        notes: this.form.notes.trim() || null,
        ...(this.groupChoice === -1
          ? this.newGroupName.trim()
            ? { group_name: this.newGroupName.trim() }
            : { group_id: null }
          : { group_id: this.groupChoice || null }),
      };
      try {
        const saved = this.guest
          ? await guestsApi.update(this.eventId, this.guest.id, payload)
          : await guestsApi.create(this.eventId, payload);
        notify({ text: this.guest ? "האורח עודכן" : `${saved.full_name} נוסף/ה לרשימה`, type: "success", duration: 3000 });
        this.$emit("saved", { guest: saved, keepOpen: keepOpen === true });
        if (keepOpen === true) {
          this.form = { ...this.initialForm(), side: this.form.side, status: this.form.status };
          this.form.full_name = "";
          this.form.phone = "";
          this.form.email = "";
          this.form.notes = "";
          this.form.party_size = 1;
          (this.$refs.nameInput as HTMLInputElement | undefined)?.focus();
        }
      } catch (err) {
        const msg = apiError(err, "השמירה נכשלה");
        if (msg.includes("טלפון")) this.errors = { ...this.errors, phone: msg };
        notify({ text: msg, type: "error", duration: 5000 });
      } finally {
        this.busy = false;
      }
    },
    async remove() {
      if (!this.guest || this.busy) return;
      if (!window.confirm(`למחוק את ${this.guest.full_name} מהרשימה?`)) return;
      this.busy = true;
      try {
        await guestsApi.remove(this.eventId, [this.guest.id]);
        notify({ text: "האורח נמחק", type: "success", duration: 3000 });
        this.$emit("deleted", this.guest.id);
      } catch (err) {
        notify({ text: apiError(err, "המחיקה נכשלה"), type: "error", duration: 5000 });
      } finally {
        this.busy = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.guest-drawer-overlay {
  justify-content: flex-start;
  align-items: stretch;
  padding: 0;
}
.guest-drawer {
  width: min(460px, 100%);
  max-height: none;
  height: 100%;
  border-radius: 24px 0 0 24px;
  padding: 20px 22px 28px;
}
.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  h2 {
    margin: 0;
  }
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.opt {
  font-weight: 500;
  color: #8a8278;
}
.ltr {
  direction: ltr;
  text-align: right;
}
.party-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  border: 1px solid rgba(22, 19, 16, 0.11);
  border-radius: 12px;
  padding: 0 4px;
  background: #fffcfa;
  span {
    font-weight: 800;
    font-size: 16px;
  }
}
.status-seg {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.seg {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(22, 19, 16, 0.14);
  background: #fffcfa;
  color: #161310;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  &.on.st-0 { background: #f6ecd2; color: #5c4210; border-color: #d9c38a; }
  &.on.st-1 { background: #dff1e5; color: #14502f; border-color: #8cc4a0; }
  &.on.st-2 { background: #fbe3e5; color: #7d1a25; border-color: #e3a0a7; }
  &.on.st-3 { background: #ece6f6; color: #43306b; border-color: #b9a8d8; }
  &.on.st-4 { background: #e6e2dc; color: #4a443d; border-color: #bdb4a8; }
}
.group-row {
  display: grid;
  gap: 8px;
}
.warn {
  color: #7d1a25;
  font-weight: 600;
}
.push {
  margin-inline-start: auto;
}
@media (max-width: 900px) {
  .guest-drawer-overlay {
    align-items: flex-end;
  }
  .guest-drawer {
    height: auto;
    max-height: 92vh;
    border-radius: 22px 22px 0 0;
  }
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
