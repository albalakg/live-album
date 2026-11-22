<template>
  <div class="ws-content" @focusin="onFocusIn">
    <!-- pinned basics card -->
    <div class="basics" :class="{ open: openKind === 'hero' }" data-row="hero">
      <div class="basics-row">
        <button
          type="button"
          class="basics-h"
          :aria-expanded="openKind === 'hero' ? 'true' : 'false'"
          @click="$emit('open', openKind === 'hero' ? '' : 'hero')"
        >
          <span class="ric hero-ic"><BuilderIcon name="sparkle" /></span>
          <span class="rtxt"
            ><b>הפרטים הבסיסיים</b><small>{{ openKind === "hero" ? "מופיעים בפתיחה של העמוד" : summary }}</small></span
          >
          <span class="rchev"><span v-if="openKind !== 'hero'" class="edit-l">עריכה</span><BuilderIcon name="chev" /></span>
        </button>
        <button
          v-if="vrow('hero')"
          type="button"
          class="stylebtn stylebtn--basics"
          :class="{ on: styleOpen === 'hero' }"
          :aria-expanded="styleOpen === 'hero' ? 'true' : 'false'"
          title="סגנון תצוגה"
          @click="$emit('style-open', 'hero')"
        >
          <span class="swap" aria-hidden="true">⇄</span>{{ vname("hero") }}
        </button>
      </div>
      <WorkspaceVariantStrip
        v-if="vrow('hero') && styleOpen === 'hero'"
        block-he="פתיחה"
        :options="vrow('hero')?.options || []"
        :current="vrow('hero')?.current || ''"
        :preset="vrow('hero')?.preset || ''"
        :sample="stripSample"
        @pick="$emit('variant', 'hero', $event)"
      />
      <div v-if="openKind === 'hero'" class="basics-b">
        <p v-if="essentialsError" class="fld-err" role="alert">{{ essentialsError }}</p>
        <div class="f2">
          <template v-if="event.type === 'wedding'">
            <label class="fld"
              ><span>שם ראשון</span><input type="text" :value="event.name1" maxlength="40" @input="ev('name1', $event)"
            /></label>
            <label class="fld"
              ><span>שם שני</span><input type="text" :value="event.name2" maxlength="40" @input="ev('name2', $event)"
            /></label>
          </template>
          <div v-else class="span2">
            <label class="fld"
              ><span>שם האירוע</span><input type="text" :value="event.title" maxlength="60" @input="ev('title', $event)"
            /></label>
          </div>
          <label class="fld"><span>תאריך</span><input type="date" dir="ltr" :value="event.date" @input="ev('date', $event)" /></label>
          <label class="fld"><span>שעה</span><input type="time" dir="ltr" :value="event.time" @input="ev('time', $event)" /></label>
          <label class="fld"
            ><span>שם המקום</span><input type="text" :value="event.venue" maxlength="80" placeholder="שם האולם או המקום" @input="ev('venue', $event)"
          /></label>
          <label class="fld"
            ><span>עיר</span><input type="text" :value="event.city" maxlength="40" placeholder="עיר" @input="ev('city', $event)"
          /></label>
        </div>
      </div>
    </div>

    <div class="list-h">
      <h3>החלקים בעמוד <small>{{ onKinds.length }}</small></h3>
      <span class="list-tip"><BuilderIcon name="grip" />גוררים לשינוי הסדר</span>
    </div>
    <ol ref="listEl" class="rows-list">
      <li
        v-for="(k, i) in onKinds"
        :key="k"
        class="row"
        :class="{
          open: openKind === k,
          dragging: drag.kind === k,
          'drop-before': drag.target === k && !drag.after,
          'drop-after': drag.target === k && drag.after,
          'has-err': !!errors[k],
        }"
        :style="drag.kind === k ? { transform: `translateY(${drag.dy}px)` } : undefined"
        :data-row="k"
      >
        <div class="rhead">
          <span class="grip" title="גררו כדי לשנות את הסדר" aria-hidden="true" @pointerdown="startDrag(k, $event)"
            ><BuilderIcon name="grip"
          /></span>
          <button
            type="button"
            class="rmain"
            :aria-expanded="openKind === k ? 'true' : 'false'"
            @click="$emit('open', openKind === k ? '' : k)"
          >
            <span class="ric"><BuilderIcon :name="meta(k).icon" /></span>
            <span class="rtxt"
              ><b>{{ meta(k).name }}</b><em v-if="isSample(k)" class="badge-s">טקסט לדוגמה</em
              ><em v-else-if="meta(k).recommended" class="badge-r">מומלץ</em></span
            >
            <span class="rchev"><BuilderIcon name="chev" /></span>
          </button>
          <button
            v-if="vrow(k)"
            type="button"
            class="stylebtn"
            :class="{ on: styleOpen === k }"
            :aria-expanded="styleOpen === k ? 'true' : 'false'"
            title="סגנון תצוגה"
            @click="$emit('style-open', k)"
          >
            <span class="swap" aria-hidden="true">⇄</span>{{ vname(k) }}
          </button>
          <label class="tgl" title="הצגה בעמוד"
            ><input
              type="checkbox"
              checked
              :aria-label="`${meta(k).name}: מוצג בעמוד`"
              @click.prevent="$emit('toggle', k, false)" /><i></i
          ></label>
        </div>
        <WorkspaceVariantStrip
          v-if="vrow(k) && styleOpen === k"
          :block-he="meta(k).name"
          :options="vrow(k)?.options || []"
          :current="vrow(k)?.current || ''"
          :preset="vrow(k)?.preset || ''"
          :sample="stripSample"
          @pick="$emit('variant', k, $event)"
        />
        <div v-if="openKind === k" class="rbody">
          <p v-if="legacyVariant(k)" class="help vnote"><BuilderIcon name="info" /> סגנונות זמינים בתבניות החדשות</p>
          <p v-if="errors[k]" class="fld-err" role="alert">{{ errors[k] }}</p>
          <SectionFields
            v-if="meta(k).fields.length"
            :kind="k"
            :content="content[base(k)]"
            :event="event"
            :event-id="eventId"
            :template-id="templateId"
            :asset-urls="assetUrls"
            @change="$emit('content', base(k), $event)"
          />
          <p v-else class="help"><BuilderIcon name="info" /> {{ autoText(k) }}</p>
          <div class="rfoot">
            <button type="button" class="mini" :disabled="i === 0" @click="$emit('move', k, -1)">
              <BuilderIcon name="up" />למעלה
            </button>
            <button type="button" class="mini" :disabled="i === onKinds.length - 1" @click="$emit('move', k, 1)">
              <BuilderIcon name="down" />למטה
            </button>
            <button type="button" class="mini end" @click="$emit('toggle', k, false)">
              <BuilderIcon name="hide" />הסתרה מהעמוד
            </button>
          </div>
        </div>
      </li>
    </ol>

    <template v-if="offKinds.length">
      <div class="list-h add"><h3>אפשר להוסיף</h3></div>
      <div class="addlist">
        <div v-for="k in offKinds" :key="k" class="addrow">
          <span class="ric"><BuilderIcon :name="meta(k).icon" /></span>
          <span class="rtxt"><b>{{ meta(k).name }}</b><small>{{ meta(k).desc }}</small></span>
          <button type="button" class="btn btn-line btn-sm" @click="$emit('toggle', k, true)">
            <BuilderIcon name="plus" />הוספה
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, type PropType } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import SectionFields from "./SectionFields.vue";
import WorkspaceVariantStrip from "./WorkspaceVariantStrip.vue";
import type { VariantStripSample } from "./variantStrip";
import { baseKind, dateHe, isSampleContent, kindMeta, titleOf } from "./hubWizardModel";
import type { WizardContent, WizardEvent } from "./hubWizardModel";

type VariantRow = {
  type: string;
  current: string;
  preset: string;
  legacy: boolean;
  options: Array<{ id: string; he: string; desc: string }>;
};

/**
 * תוכן tab: pinned basics card, one-open accordion of visible sections (drag grip + up/down),
 * and «אפשר להוסיף» for the hidden ones.
 */
export default defineComponent({
  name: "WorkspaceContentTab",
  components: { BuilderIcon, SectionFields, WorkspaceVariantStrip },
  props: {
    event: { type: Object as PropType<WizardEvent>, required: true },
    content: { type: Object as PropType<WizardContent>, required: true },
    /** All section kinds in page order. */
    order: { type: Array as PropType<string[]>, required: true },
    on: { type: Object as PropType<Record<string, boolean>>, required: true },
    openKind: { type: String, default: "" },
    eventId: { type: Number, default: 0 },
    templateId: { type: String, required: true },
    assetUrls: {
      type: Object as PropType<Record<string, { url: string; thumb_url?: string }>>,
      default: () => ({}),
    },
    errors: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    essentialsError: { type: String, default: "" },
    scroller: { type: Object as PropType<HTMLElement | null>, default: null },
    /** Gen-2 styles: kind -> { current, preset, options, legacy } for the hero / gallery / schedule rows. */
    variantRows: { type: Object as PropType<Record<string, VariantRow>>, default: () => ({}) },
    /** Kind whose style strip is open ("" = none). */
    styleOpen: { type: String, default: "" },
    stripSample: { type: Object as PropType<VariantStripSample>, required: true },
  },
  emits: ["open", "toggle", "move", "reorder", "content", "event-field", "focus-field", "variant", "style-open"],
  setup(props, { emit }) {
    const listEl = ref<HTMLElement | null>(null);
    const onKinds = computed(() => props.order.filter((k) => props.on[k]));
    const offKinds = computed(() => props.order.filter((k) => !props.on[k]));
    const meta = (k: string) => kindMeta(k);
    /** Row with a style chip (gen-2 template only). */
    const vrow = (k: string): VariantRow | null => {
      const r = props.variantRows[k];
      return r && !r.legacy ? r : null;
    };
    const legacyVariant = (k: string) => Boolean(props.variantRows[k]?.legacy);
    const vname = (k: string) => {
      const r = props.variantRows[k];
      return r?.options.find((o) => o.id === r.current)?.he || "";
    };
    const base = (k: string) => baseKind(k);
    const isSample = (k: string) => isSampleContent(k, props.content[baseKind(k)]);
    const summary = computed(() => {
      const e = props.event;
      return [
        titleOf(e) || "האירוע",
        dateHe(e.date).replace(/^יום /, ""),
        e.time,
        [e.venue, e.city].filter(Boolean).join(", "),
      ]
        .filter(Boolean)
        .join(" · ");
    });
    function autoText(k: string): string {
      if (baseKind(k) === "upload") return "הכפתור «העלו תמונות» והסבר קצר לאורחים. נבנה אוטומטית מהאלבום שלכם.";
      return `${kindMeta(k).desc}. החלק הזה מתמלא אוטומטית.`;
    }
    function ev(field: keyof WizardEvent, e: Event) {
      emit("event-field", field, (e.target as HTMLInputElement).value);
    }
    function onFocusIn(e: FocusEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA|SELECT|BUTTON/.test(t.tagName)) emit("focus-field");
    }

    /* ---- drag to reorder (pointer events: mouse + touch, grip only) ---- */
    const drag = reactive({ kind: "", target: "", after: false, dy: 0 });
    function startDrag(kind: string, e: PointerEvent) {
      if (e.button !== 0) return;
      e.preventDefault();
      const grip = e.currentTarget as HTMLElement;
      grip.setPointerCapture?.(e.pointerId);
      const y0 = e.clientY;
      drag.kind = kind;
      drag.dy = 0;
      drag.target = "";
      const rowsEls = Array.from(listEl.value?.querySelectorAll<HTMLElement>(".row") || []).filter(
        (r) => r.dataset.row !== kind
      );
      const move = (ev: PointerEvent) => {
        drag.dy = ev.clientY - y0;
        let target: HTMLElement | null = null;
        let after = false;
        for (const r of rowsEls) {
          const b = r.getBoundingClientRect();
          if (ev.clientY < b.top + b.height / 2) {
            target = r;
            break;
          }
        }
        if (!target && rowsEls.length) {
          target = rowsEls[rowsEls.length - 1];
          after = true;
        }
        drag.target = target?.dataset.row || "";
        drag.after = after;
        const sc = props.scroller;
        if (sc) {
          const pb = sc.getBoundingClientRect();
          if (ev.clientY < pb.top + 40) sc.scrollTop -= 8;
          else if (ev.clientY > pb.bottom - 40) sc.scrollTop += 8;
        }
      };
      const up = () => {
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", up);
        grip.removeEventListener("pointercancel", up);
        const t = drag.target;
        const after = drag.after;
        drag.kind = "";
        drag.target = "";
        drag.dy = 0;
        if (!t) return;
        const o = props.order.filter((x) => x !== kind);
        o.splice(o.indexOf(t) + (after ? 1 : 0), 0, kind);
        if (o.join() !== props.order.join()) emit("reorder", o, kind);
      };
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", up);
      grip.addEventListener("pointercancel", up);
    }

    return {
      listEl,
      onKinds,
      offKinds,
      meta,
      vrow,
      vname,
      legacyVariant,
      base,
      isSample,
      summary,
      autoText,
      ev,
      onFocusIn,
      drag,
      startDrag,
    };
  },
});
</script>

<style scoped>
.stylebtn {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 9px;
  margin-inline-end: 8px;
  border-radius: 999px;
  border: 1px solid var(--line-2);
  background: #fbf8f3;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
  white-space: nowrap;
}
.stylebtn:hover {
  border-color: var(--ink);
  color: var(--ink);
  background: #fff;
}
.stylebtn.on {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.stylebtn .swap {
  font-size: 13px;
  line-height: 1;
}
.basics-row {
  display: flex;
  align-items: center;
}
.basics-row .basics-h {
  flex: 1;
  min-width: 0;
}
.stylebtn--basics {
  margin-inline-end: 12px;
}
.vnote {
  margin-bottom: 10px;
}
</style>
