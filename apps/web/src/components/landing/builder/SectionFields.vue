<template>
  <div class="sfields">
    <!-- story / parasha -->
    <template v-if="base === 'story' || base === 'parasha'">
      <div class="fld">
        <label :for="id('heading')">כותרת</label>
        <input :id="id('heading')" class="inp" :value="c.heading" maxlength="60" @input="setText('heading', $event)" />
      </div>
      <div class="fld">
        <label :for="id('text')">מה תרצו לספר?</label>
        <textarea
          :id="id('text')"
          class="inp"
          :value="c.text"
          maxlength="400"
          placeholder="למשל: הכרנו בטיול, ומאז…"
          @input="setText('text', $event)"
        />
      </div>
    </template>

    <!-- wishes / rsvp -->
    <template v-else-if="base === 'wishes' || base === 'rsvp'">
      <div class="fld">
        <label :for="id('heading')">כותרת</label>
        <input :id="id('heading')" class="inp" :value="c.heading" maxlength="60" @input="setText('heading', $event)" />
      </div>
      <div class="fld">
        <label :for="id('text')">משפט לאורחים</label>
        <textarea :id="id('text')" class="inp" :value="c.text" maxlength="200" @input="setText('text', $event)" />
      </div>
    </template>

    <!-- quote -->
    <template v-else-if="base === 'quote'">
      <div class="fld">
        <label :for="id('text')">המשפט</label>
        <input :id="id('text')" class="inp" :value="c.text" maxlength="120" @input="setText('text', $event)" />
      </div>
    </template>

    <!-- dress -->
    <template v-else-if="base === 'dress'">
      <div class="fld">
        <label :for="id('title')">בכמה מילים</label>
        <input
          :id="id('title')"
          class="inp"
          :value="c.title"
          maxlength="40"
          placeholder="למשל: חגיגי"
          @input="setText('title', $event)"
        />
      </div>
      <div class="fld">
        <label :for="id('text')">פרטים</label>
        <textarea :id="id('text')" class="inp" :value="c.text" maxlength="200" @input="setText('text', $event)" />
      </div>
    </template>

    <!-- gift -->
    <template v-else-if="base === 'gift'">
      <div class="fld">
        <label :for="id('text')">מה כתוב על הכפתור</label>
        <input :id="id('text')" class="inp" :value="c.text" maxlength="30" @input="setText('text', $event)" />
      </div>
      <div class="fld">
        <label :for="id('url')">הקישור</label>
        <input
          :id="id('url')"
          class="inp"
          :class="{ invalid: urlBad(c.url) }"
          :value="c.url"
          dir="ltr"
          inputmode="url"
          placeholder="https://"
          maxlength="300"
          @input="setText('url', $event)"
        />
        <span v-if="urlBad(c.url)" class="fld-err">הקישור חייב להתחיל ב־https://</span>
      </div>
      <p class="help">מדביקים קישור מביט, פייבוקס או רשימת מתנות. הכפתור יופיע רק כשיש קישור.</p>
    </template>

    <!-- map -->
    <template v-else-if="base === 'map'">
      <div class="note">
        <BuilderIcon name="pin" />
        <span>
          המקום: <b>{{ place }}</b>. משנים בפרטים החשובים למעלה.
        </span>
      </div>
      <div class="fld">
        <label :for="id('note')">משהו שכדאי לדעת <span class="opt">(לא חובה)</span></label>
        <input
          :id="id('note')"
          class="inp"
          :value="c.note"
          maxlength="160"
          placeholder="למשל: יש חניה במקום"
          @input="setText('note', $event)"
        />
      </div>
      <div class="fld">
        <label :for="id('waze')">קישור ל־Waze <span class="opt">(לא חובה)</span></label>
        <input
          :id="id('waze')"
          class="inp"
          :class="{ invalid: urlBad(c.waze) }"
          :value="c.waze"
          dir="ltr"
          inputmode="url"
          placeholder="https://waze.com/ul/…"
          maxlength="300"
          @input="setText('waze', $event)"
        />
        <span v-if="urlBad(c.waze)" class="fld-err">הקישור חייב להתחיל ב־https://</span>
      </div>
    </template>

    <!-- schedule -->
    <template v-else-if="base === 'schedule'">
      <div class="rows">
        <div v-for="(r, i) in rows" :key="i" class="trow">
          <input
            :id="id(`time-${i}`)"
            class="inp"
            aria-label="שעה"
            :value="r.time"
            maxlength="5"
            inputmode="numeric"
            placeholder="19:00"
            dir="ltr"
            @input="setRow(i, 'time', $event)"
          />
          <input
            :id="id(`label-${i}`)"
            class="inp"
            aria-label="מה קורה"
            :value="r.label"
            maxlength="40"
            placeholder="מה קורה?"
            @input="setRow(i, 'label', $event)"
          />
          <button type="button" class="x" aria-label="מחיקת השורה" @click="delRow(i)">
            <BuilderIcon name="x" />
          </button>
        </div>
      </div>
      <button type="button" class="add" @click="addRow({ time: '', label: '' }, 'time')">
        <BuilderIcon name="plus" />הוספת שורה
      </button>
    </template>

    <!-- faq -->
    <template v-else-if="base === 'faq'">
      <div class="rows">
        <div v-for="(r, i) in rows" :key="i" class="qrow">
          <div class="qa">
            <input
              :id="id(`q-${i}`)"
              class="inp"
              aria-label="שאלה"
              :value="r.q"
              maxlength="80"
              placeholder="השאלה"
              @input="setRow(i, 'q', $event)"
            />
            <textarea
              class="inp"
              aria-label="תשובה"
              :value="r.a"
              maxlength="300"
              placeholder="התשובה"
              @input="setRow(i, 'a', $event)"
            />
          </div>
          <button type="button" class="x" aria-label="מחיקת השאלה" @click="delRow(i)">
            <BuilderIcon name="x" />
          </button>
        </div>
      </div>
      <button type="button" class="add" @click="addRow({ q: '', a: '' }, 'q')">
        <BuilderIcon name="plus" />הוספת שאלה
      </button>
    </template>

    <!-- gallery -->
    <template v-else-if="base === 'gallery'">
      <div class="imgs">
        <div v-for="(im, i) in images" :key="i" class="im">
          <img :src="imageUrl(im)" alt="" />
          <button type="button" class="x" aria-label="הסרת התמונה" @click="delImage(i)">
            <BuilderIcon name="x" />
          </button>
        </div>
        <button v-if="images.length < 12" type="button" class="addimg" @click="picking = true">
          <BuilderIcon name="plus" />הוספה
        </button>
      </div>
      <p class="help">אלה תמונות לדוגמה. אפשר להחליף בתמונות שלכם, עד 12.</p>
      <Teleport to="body">
        <LandingImagePicker
          v-if="picking"
          :event-id="eventId"
          :template-id="templateId"
          :allow-clear="false"
          @close="picking = false"
          @pick="onPick"
        />
      </Teleport>
    </template>

    <!-- people -->
    <div v-else-if="base === 'people'" class="note">
      <BuilderIcon name="info" />
      <span>השמות נלקחים מהפרטים החשובים למעלה.</span>
    </div>

    <!-- upload -->
    <div v-else-if="base === 'upload'" class="note">
      <BuilderIcon name="camera" />
      <span>מסביר לאורחים איך מעלים תמונות לאלבום, עם כפתור "העלו תמונות". כדאי להשאיר דלוק.</span>
    </div>

    <!-- everything else comes from the design -->
    <div v-else class="note">
      <BuilderIcon name="info" />
      <span>{{ meta.desc }}. התוכן מגיע מהעיצוב.</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref, type PropType } from "vue";
import { resolveImageRef } from "../templates/registry";
import type { ImageRef } from "../types";
import BuilderIcon from "./BuilderIcon.vue";
import { baseKind, kindMeta } from "./hubWizardModel";
import type { KindContent, WizardEvent, WizardImage, WizardRow } from "./hubWizardModel";
import LandingImagePicker from "./LandingImagePicker.vue";

type TextKey = "heading" | "text" | "title" | "note" | "waze" | "url";

/** Editable fields for one section kind. Emits the whole new content object for that kind. */
export default defineComponent({
  name: "SectionFields",
  components: { BuilderIcon, LandingImagePicker },
  props: {
    kind: { type: String, required: true },
    content: { type: Object as PropType<KindContent | undefined>, default: undefined },
    event: { type: Object as PropType<WizardEvent>, required: true },
    eventId: { type: Number, default: 0 },
    templateId: { type: String, default: "" },
    /** asset_id -> urls, for gallery thumbnails of the host's own photos. */
    assetUrls: {
      type: Object as PropType<Record<string, { url: string; thumb_url?: string }>>,
      default: () => ({}),
    },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const picking = ref(false);
    const base = computed(() => baseKind(props.kind));
    const meta = computed(() => kindMeta(props.kind));
    const c = computed<KindContent>(() => props.content || {});
    const rows = computed<WizardRow[]>(() => c.value.rows || []);
    const images = computed<WizardImage[]>(() => c.value.images || []);
    const place = computed(() => {
      const e = props.event;
      return `${e.venue || ""}${e.city ? (e.venue ? ", " : "") + e.city : ""}` || "עוד לא נבחר";
    });

    const id = (key: string) => `x-${props.kind}-${key}`;
    const urlBad = (v: string | undefined) => !!v && !/^https:\/\//i.test(v.trim());

    function patch(p: Partial<KindContent>) {
      emit("change", { ...c.value, ...p });
    }
    function setText(key: TextKey, e: Event) {
      patch({ [key]: (e.target as HTMLInputElement).value } as Partial<KindContent>);
    }

    function setRow(i: number, key: keyof WizardRow, e: Event) {
      const next = rows.value.map((r) => ({ ...r }));
      next[i] = { ...next[i], [key]: (e.target as HTMLInputElement).value };
      patch({ rows: next });
    }
    function delRow(i: number) {
      patch({ rows: rows.value.filter((_, j) => j !== i) });
    }
    function addRow(row: WizardRow, focusKey: string) {
      const next = [...rows.value.map((r) => ({ ...r })), row];
      patch({ rows: next });
      nextTick(() => document.getElementById(id(`${focusKey}-${next.length - 1}`))?.focus());
    }

    function imageUrl(im: WizardImage): string {
      if (im.asset_id != null && im.asset_id !== "") {
        const hit = props.assetUrls[String(im.asset_id)];
        return hit?.thumb_url || hit?.url || im.thumb_url || im.url || "";
      }
      if (im.stock) return resolveImageRef({ stock: im.stock })?.url || "";
      return im.url || "";
    }
    function delImage(i: number) {
      patch({ images: images.value.filter((_, j) => j !== i) });
    }
    function onPick(ref: ImageRef | null) {
      picking.value = false;
      if (!ref) return;
      const r = ref as { asset_id?: number | string; stock?: string };
      const next: WizardImage | null =
        r.asset_id != null ? { asset_id: r.asset_id } : r.stock ? { stock: r.stock } : null;
      if (next && images.value.length < 12) patch({ images: [...images.value, next] });
    }

    return {
      picking,
      base,
      meta,
      c,
      rows,
      images,
      place,
      id,
      urlBad,
      setText,
      setRow,
      delRow,
      addRow,
      imageUrl,
      delImage,
      onPick,
    };
  },
});
</script>
