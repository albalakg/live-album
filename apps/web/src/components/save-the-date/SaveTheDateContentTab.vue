<template>
  <div class="std-content-tab">
    <section class="grp">
      <div class="grp-h"><h3>סוג האירוע</h3></div>
      <div class="kind-chips" role="list">
        <button
          v-for="k in kinds"
          :key="k.id"
          type="button"
          class="chip"
          :class="{ on: content.kind === k.id }"
          :aria-pressed="content.kind === k.id ? 'true' : 'false'"
          @click="$emit('content', { kind: k.id })"
        >
          {{ k.he }}
        </button>
      </div>
    </section>

    <section class="grp">
      <div class="grp-h"><h3>{{ content.kind === "wedding" ? "השמות" : "הכותרת" }}</h3></div>
      <template v-if="content.kind === 'wedding'">
        <label class="fld"
          >שם ראשון
          <input type="text" :value="content.a" data-field="a" @focus="$emit('focus-field')" @input="on('a', $event)" />
        </label>
        <label class="fld"
          >שם שני
          <input type="text" :value="content.b" data-field="b" @focus="$emit('focus-field')" @input="on('b', $event)" />
        </label>
      </template>
      <template v-else>
        <label class="fld"
          >כותרת
          <input type="text" :value="content.title" data-field="title" @focus="$emit('focus-field')" @input="on('title', $event)" />
        </label>
        <label class="fld"
          >שורה משנית
          <input type="text" :value="content.sub" data-field="sub" @focus="$emit('focus-field')" @input="on('sub', $event)" />
        </label>
      </template>
    </section>

    <section class="grp">
      <div class="grp-h"><h3>מתי ואיפה</h3></div>
      <label class="fld"
        >תאריך
        <input type="date" :value="content.date" data-field="date" @focus="$emit('focus-field')" @input="on('date', $event)" />
      </label>
      <label class="fld"
        >שעה
        <input type="time" :value="content.time" data-field="time" @focus="$emit('focus-field')" @input="on('time', $event)" />
      </label>
      <label class="fld"
        >מקום
        <input type="text" :value="content.venue" data-field="venue" @focus="$emit('focus-field')" @input="on('venue', $event)" />
      </label>
      <label class="fld"
        >עיר
        <input type="text" :value="content.city" data-field="city" @focus="$emit('focus-field')" @input="on('city', $event)" />
      </label>
      <label class="fld"
        >שורה תחתונה
        <input type="text" :value="content.line" data-field="line" @focus="$emit('focus-field')" @input="on('line', $event)" />
      </label>
    </section>

    <section class="grp">
      <div class="grp-h"><h3>תמונה</h3></div>
      <div class="photo-row">
        <div class="photo-prev" :style="photoUrl ? { backgroundImage: 'url(' + photoUrl + ')' } : {}">
          <span v-if="!photoUrl">אין תמונה</span>
        </div>
        <div class="photo-acts">
          <button type="button" class="btn btn-line" @click="picker = true">בחירת תמונה</button>
        </div>
      </div>
    </section>

    <section class="grp">
      <div class="grp-h"><h3>מה מוצג בעמוד</h3></div>
      <label v-for="row in showRows" :key="row.id" class="optrow">
        <span class="rtxt"><b>{{ row.he }}</b></span>
        <span class="tgl">
          <input type="checkbox" :checked="!!show[row.id]" @change="$emit('show', { [row.id]: !show[row.id] })" /><i></i>
        </span>
      </label>
    </section>

    <LandingImagePicker
      v-if="picker"
      :event-id="eventId"
      :template-id="templateId"
      allow-clear
      @close="picker = false"
      @pick="onPick"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from "vue";
import LandingImagePicker from "@/components/landing/builder/LandingImagePicker.vue";
import type { ImageRef } from "@/components/landing/types";
import { BASE_SHOW, type StdContent, type StdKind, type StdShow } from "./saveTheDateCatalog";
import { resolvePhotoSrc, type SaveTheDateSlice } from "./saveTheDateModel";

const KINDS: Array<{ id: StdKind; he: string }> = [
  { id: "wedding", he: "חתונה" },
  { id: "barmitzvah", he: "בר / בת מצווה" },
  { id: "birthday", he: "יום הולדת" },
  { id: "brit", he: "ברית" },
  { id: "other", he: "אחר" },
];

const SHOW_ROWS: Array<{ id: keyof StdShow; he: string }> = [
  { id: "countdown", he: "ספירה לאחור" },
  { id: "calendar", he: "הוספה ליומן" },
  { id: "whatsapp", he: "שיתוף בוואטסאפ" },
  { id: "line", he: "שורה תחתונה" },
  { id: "venue", he: "מקום" },
  { id: "hebdate", he: "תאריך עברי" },
  { id: "footer", he: "לוגו SnapShare" },
];

export default defineComponent({
  name: "SaveTheDateContentTab",
  components: { LandingImagePicker },
  props: {
    slice: { type: Object as PropType<SaveTheDateSlice>, required: true },
    eventId: { type: Number, required: true },
    templateId: { type: String, required: true },
    assetUrls: { type: Object as PropType<Record<string, { url: string; thumb_url?: string }>>, default: () => ({}) },
    stockUrls: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  },
  emits: ["content", "show", "photo", "focus-field"],
  setup(props, { emit }) {
    const picker = ref(false);
    const content = computed(() => (props.slice.content || {}) as StdContent);
    const show = computed(() => ({ ...BASE_SHOW, ...(props.slice.show || {}) }) as StdShow);
    const photoUrl = computed(() =>
      resolvePhotoSrc(props.slice.content && props.slice.content.photo, {
        assetUrls: props.assetUrls,
        stockUrls: props.stockUrls,
      })
    );

    function on(key: string, ev: Event) {
      const el = ev.target as HTMLInputElement;
      emit("content", { [key]: el.value });
    }
    function onPick(ref: ImageRef | null) {
      emit("photo", ref);
      picker.value = false;
    }

    return { kinds: KINDS, showRows: SHOW_ROWS, picker, content, show, photoUrl, on, onPick };
  },
});
</script>

<style scoped>
.kind-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font: inherit;
  cursor: pointer;
}
.chip.on {
  background: #1e1813;
  color: #fff;
  border-color: #1e1813;
}
.fld {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 10px;
  font-weight: 600;
  font-size: 0.86rem;
}
.fld input {
  font: inherit;
  font-weight: 500;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
.photo-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.photo-prev {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  background: #f1eee8 center/cover no-repeat;
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  color: #6b6158;
}
</style>
