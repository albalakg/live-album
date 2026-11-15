<template>
  <div class="lbe" dir="rtl">
    <header class="lbe-head">
      <h3>{{ title }}</h3>
      <p v-if="hint" class="lbe-hint">{{ hint }}</p>
    </header>

    <div v-if="!block" class="lbe-empty">בחרו סעיף מהרשימה לעריכה.</div>

    <form v-else class="lbe-form" @submit.prevent>
      <div
        v-for="field in fields"
        :key="field.key"
        class="lbe-field"
        :class="{ err: Boolean(errorFor(field.key)) }"
        :data-field="fieldKeyAttr(field.key)"
      >
        <label class="lbe-label">
          {{ field.label }}
          <span v-if="field.required" class="req">*</span>
        </label>

        <template v-if="field.kind === 'text'">
          <input
            class="lbe-input"
            type="text"
            :value="str(field.key)"
            :maxlength="field.max || undefined"
            @input="setScalar(field.key, ($event.target as HTMLInputElement).value)"
          />
        </template>

        <template v-else-if="field.kind === 'textarea'">
          <textarea
            class="lbe-input lbe-area"
            rows="4"
            :value="str(field.key)"
            :maxlength="field.max || undefined"
            @input="setScalar(field.key, ($event.target as HTMLTextAreaElement).value)"
          />
        </template>

        <template v-else-if="field.kind === 'date'">
          <input
            class="lbe-input"
            type="datetime-local"
            :value="dateLocal(field.key)"
            @input="setDate(field.key, ($event.target as HTMLInputElement).value)"
          />
        </template>

        <template v-else-if="field.kind === 'url'">
          <input
            class="lbe-input"
            type="url"
            dir="ltr"
            placeholder="https://"
            :value="str(field.key)"
            :maxlength="field.max || undefined"
            @input="setScalar(field.key, ($event.target as HTMLInputElement).value)"
          />
          <small v-if="str(field.key) && !isHttpsUrl(str(field.key))" class="lbe-inline-err">
            הקישור חייב להתחיל ב־https://
          </small>
        </template>

        <template v-else-if="field.kind === 'select'">
          <select
            class="lbe-input"
            :value="str(field.key)"
            @change="setScalar(field.key, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="o in field.options || []" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </template>

        <template v-else-if="field.kind === 'image'">
          <div class="lbe-image-row">
            <div class="lbe-image-preview">
              <img v-if="imagePreview(field.key)" :src="imagePreview(field.key)!" alt="" />
              <span v-else>אין תמונה</span>
            </div>
            <button type="button" class="lbe-btn" @click="openPicker(field.key)">בחירת תמונה</button>
          </div>
        </template>

        <template v-else-if="field.kind === 'list'">
          <div class="lbe-list">
            <div
              v-for="(item, index) in listItems(field.key)"
              :key="index"
              class="lbe-list-item"
            >
              <div class="lbe-list-toolbar">
                <strong>{{ field.itemLabel || "פריט" }} {{ index + 1 }}</strong>
                <div class="lbe-list-actions">
                  <button type="button" class="lbe-ico" :disabled="index === 0" aria-label="למעלה" @click="moveList(field, index, -1)">↑</button>
                  <button type="button" class="lbe-ico" :disabled="index >= listItems(field.key).length - 1" aria-label="למטה" @click="moveList(field, index, 1)">↓</button>
                  <button type="button" class="lbe-ico danger" aria-label="הסרה" @click="removeList(field, index)">×</button>
                </div>
              </div>

              <template v-if="field.stringItems">
                <input
                  class="lbe-input"
                  type="text"
                  :value="String(item ?? '')"
                  @input="setStringItem(field.key, index, ($event.target as HTMLInputElement).value)"
                />
              </template>
              <template v-else>
                <div
                  v-for="sub in field.subFields || []"
                  :key="sub.key"
                  class="lbe-sub"
                  :data-field="fieldKeyAttr(field.key, index, sub.key)"
                >
                  <label class="lbe-label sm">{{ sub.label }}</label>
                  <template v-if="sub.kind === 'image'">
                    <div class="lbe-image-row">
                      <div class="lbe-image-preview sm">
                        <img v-if="listImagePreview(field.key, index, sub.key)" :src="listImagePreview(field.key, index, sub.key)!" alt="" />
                        <span v-else>—</span>
                      </div>
                      <button type="button" class="lbe-btn" @click="openPicker(field.key, index, sub.key)">בחירה</button>
                    </div>
                  </template>
                  <textarea
                    v-else-if="sub.kind === 'textarea'"
                    class="lbe-input lbe-area"
                    rows="3"
                    :value="listStr(field.key, index, sub.key)"
                    @input="setListSub(field.key, index, sub.key, ($event.target as HTMLTextAreaElement).value)"
                  />
                  <input
                    v-else-if="sub.kind === 'url'"
                    class="lbe-input"
                    type="url"
                    dir="ltr"
                    placeholder="https://"
                    :value="listStr(field.key, index, sub.key)"
                    @input="setListSub(field.key, index, sub.key, ($event.target as HTMLInputElement).value)"
                  />
                  <input
                    v-else
                    class="lbe-input"
                    type="text"
                    :value="listStr(field.key, index, sub.key)"
                    @input="setListSub(field.key, index, sub.key, ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </template>
            </div>

            <button
              v-if="canAdd(field)"
              type="button"
              class="lbe-btn ghost"
              @click="addList(field)"
            >הוספת {{ field.itemLabel || "פריט" }}</button>
          </div>
        </template>

        <small v-if="errorFor(field.key)" class="lbe-err">{{ errorFor(field.key) }}</small>
      </div>
    </form>

    <LandingImagePicker
      v-if="pickerOpen"
      :event-id="eventId"
      :template-id="templateId"
      @close="pickerOpen = false"
      @pick="onPick"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from "vue";
import type { HubBlock, ImageRef } from "../types";
import { resolveImageRef } from "../templates/registry";
import {
  emptyListItem,
  fieldsForBlockType,
  isHttpsUrl,
  type BuilderField,
} from "./builderFields";
import { blockTypeLabel } from "./blockLabels";
import type { FieldError } from "./hubBuilderUtils";
import LandingImagePicker from "./LandingImagePicker.vue";

interface PickerTarget {
  key: string;
  index?: number;
  subKey?: string;
}

export default defineComponent({
  name: "LandingBlockEditor",
  components: { LandingImagePicker },
  props: {
    block: { type: Object as PropType<HubBlock | null>, default: null },
    eventId: { type: Number, required: true },
    templateId: { type: String, required: true },
    errors: { type: Array as PropType<FieldError[]>, default: () => [] },
  },
  emits: ["update"],
  setup(props, { emit }) {
    const pickerOpen = ref(false);
    const pickerTarget = ref<PickerTarget | null>(null);

    const fields = computed(() =>
      props.block ? fieldsForBlockType(props.block.type) : []
    );
    const title = computed(() =>
      props.block ? blockTypeLabel(props.block.type) : "עריכת סעיף"
    );
    const hint = computed(() => {
      if (!props.block) return "";
      if (props.block.type === "WISHING_WELL" || props.block.type === "RSVP") {
        return "תצוגה בלבד — אין שמירת תגובות אורחים בשלב זה.";
      }
      return "";
    });

    function data(): Record<string, unknown> {
      return { ...(props.block?.data || {}) };
    }

    function emitData(next: Record<string, unknown>) {
      emit("update", next);
    }

    function str(key: string): string {
      const v = props.block?.data?.[key];
      return v == null ? "" : String(v);
    }

    function dateLocal(key: string): string {
      const raw = str(key);
      if (!raw) return "";
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return raw.slice(0, 16);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function setScalar(key: string, value: string) {
      const next = data();
      next[key] = value;
      emitData(next);
    }

    function setDate(key: string, value: string) {
      if (!value) {
        setScalar(key, "");
        return;
      }
      const d = new Date(value);
      setScalar(key, Number.isNaN(d.getTime()) ? value : d.toISOString());
    }

    function listItems(key: string): unknown[] {
      const v = props.block?.data?.[key];
      return Array.isArray(v) ? v : [];
    }

    function listStr(key: string, index: number, subKey: string): string {
      const row = listItems(key)[index] as Record<string, unknown> | undefined;
      const v = row?.[subKey];
      return v == null ? "" : String(v);
    }

    function setList(key: string, items: unknown[]) {
      const next = data();
      next[key] = items;
      emitData(next);
    }

    function setListSub(key: string, index: number, subKey: string, value: string) {
      const items = listItems(key).map((row, i) => {
        if (i !== index) return row;
        return { ...(row as Record<string, unknown>), [subKey]: value };
      });
      setList(key, items);
    }

    function setStringItem(key: string, index: number, value: string) {
      const items = [...listItems(key)];
      items[index] = value;
      setList(key, items);
    }

    function addList(field: BuilderField) {
      const items = [...listItems(field.key), emptyListItem(field)];
      setList(field.key, items);
    }

    function removeList(field: BuilderField, index: number) {
      const items = listItems(field.key).filter((_, i) => i !== index);
      setList(field.key, items);
    }

    function moveList(field: BuilderField, index: number, dir: -1 | 1) {
      const items = [...listItems(field.key)];
      const target = index + dir;
      if (target < 0 || target >= items.length) return;
      const tmp = items[index];
      items[index] = items[target];
      items[target] = tmp;
      setList(field.key, items);
    }

    function canAdd(field: BuilderField) {
      const max = field.maxItems ?? 24;
      return listItems(field.key).length < max;
    }

    function imagePreview(key: string): string | null {
      const ref = props.block?.data?.[key] as ImageRef | null | undefined;
      return resolveImageRef(ref)?.url || null;
    }

    function listImagePreview(key: string, index: number, subKey: string): string | null {
      const row = listItems(key)[index] as Record<string, unknown> | undefined;
      const ref = row?.[subKey] as ImageRef | null | undefined;
      return resolveImageRef(ref)?.url || null;
    }

    function openPicker(key: string, index?: number, subKey?: string) {
      pickerTarget.value = { key, index, subKey };
      pickerOpen.value = true;
    }

    function onPick(ref: ImageRef | null) {
      const t = pickerTarget.value;
      pickerOpen.value = false;
      if (!t) return;
      if (t.index != null && t.subKey) {
        const subKey = t.subKey;
        const items = listItems(t.key).map((row, i) => {
          if (i !== t.index) return row;
          return { ...(row as Record<string, unknown>), [subKey]: ref };
        });
        setList(t.key, items);
      } else {
        const next = data();
        next[t.key] = ref;
        emitData(next);
      }
    }

    function errorFor(fieldKey: string): string {
      const block = props.block;
      if (!block) return "";
      const hit = (props.errors || []).find(
        (e) => e.blockId === block.id && e.fieldKey === fieldKey && e.listIndex == null
      );
      return hit?.message || "";
    }

    function fieldKeyAttr(fieldKey: string, index?: number, subKey?: string): string {
      if (index != null && subKey) return `${props.block?.id}.${fieldKey}.${index}.${subKey}`;
      return `${props.block?.id}.${fieldKey}`;
    }

    return {
      fields,
      title,
      hint,
      pickerOpen,
      str,
      dateLocal,
      setScalar,
      setDate,
      listItems,
      listStr,
      setListSub,
      setStringItem,
      addList,
      removeList,
      moveList,
      canAdd,
      imagePreview,
      listImagePreview,
      openPicker,
      onPick,
      errorFor,
      fieldKeyAttr,
      isHttpsUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.lbe {
  display: grid;
  gap: 12px;
}
.lbe-head h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
}
.lbe-hint {
  margin: 4px 0 0;
  color: #5e564e;
  font-size: 0.88rem;
}
.lbe-empty {
  color: #5e564e;
  padding: 12px 0;
}
.lbe-form {
  display: grid;
  gap: 14px;
}
.lbe-field {
  display: grid;
  gap: 6px;
}
.lbe-field.err .lbe-input {
  border-color: #c44;
  box-shadow: 0 0 0 2px rgba(196, 68, 68, 0.15);
}
.lbe-label {
  font-weight: 700;
  font-size: 0.9rem;
}
.lbe-label.sm {
  font-size: 0.82rem;
  font-weight: 600;
  color: #5e564e;
}
.req {
  color: #c44;
}
.lbe-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(22, 19, 16, 0.14);
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  background: #fff;
}
.lbe-area {
  resize: vertical;
  min-height: 88px;
}
.lbe-err,
.lbe-inline-err {
  color: #a33;
  font-size: 0.82rem;
}
.lbe-image-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lbe-image-preview {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(22, 19, 16, 0.06);
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  color: #5e564e;
}
.lbe-image-preview.sm {
  width: 52px;
  height: 52px;
}
.lbe-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lbe-btn {
  border: 0;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  background: rgba(22, 19, 16, 0.08);
}
.lbe-btn.ghost {
  background: transparent;
  border: 1px dashed rgba(22, 19, 16, 0.2);
  justify-self: start;
}
.lbe-list {
  display: grid;
  gap: 10px;
}
.lbe-list-item {
  border: 1px solid rgba(22, 19, 16, 0.1);
  border-radius: 14px;
  padding: 10px;
  background: #fff;
  display: grid;
  gap: 8px;
}
.lbe-list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.lbe-list-actions {
  display: flex;
  gap: 4px;
}
.lbe-ico {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: rgba(22, 19, 16, 0.06);
  cursor: pointer;
}
.lbe-ico.danger {
  color: #a33;
}
.lbe-ico:disabled {
  opacity: 0.35;
}
.lbe-sub {
  display: grid;
  gap: 4px;
}
</style>
