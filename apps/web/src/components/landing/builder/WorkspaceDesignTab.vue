<template>
  <div class="ws-design">
    <section class="grp">
      <div class="grp-h">
        <h3>תבנית</h3>
        <div ref="msEl" class="ms" :class="{ open: filterOpen }">
          <button
            type="button"
            class="ms-btn"
            aria-haspopup="listbox"
            :aria-expanded="filterOpen ? 'true' : 'false'"
            @click="$emit('update:filterOpen', !filterOpen)"
          >
            <BuilderIcon name="filter" /><span class="ms-lbl">{{ filterLabel }}</span
            ><b v-if="filter.length" class="count">{{ filter.length }}</b><BuilderIcon name="chev" class="chev" />
          </button>
          <div class="ms-pop" role="listbox" aria-multiselectable="true" aria-label="סוג אירוע">
            <label v-for="c in cats" :key="c.id" class="ms-opt">
              <input type="checkbox" :checked="filter.includes(c.id)" @change="toggleCat(c.id)" />
              <span class="box"><BuilderIcon name="check" /></span>{{ c.he }}<small>{{ countFor(c.id) }}</small>
            </label>
            <div class="ms-foot">
              <button type="button" class="link" @click="$emit('update:filter', [])">הצגת הכל</button>
              <button type="button" class="btn btn-dark btn-sm" @click="$emit('update:filterOpen', false)">סיום</button>
            </div>
          </div>
        </div>
      </div>
      <p class="grp-sub">{{ list.length }} עיצובים · ההחלפה מיידית, והתוכן שלכם נשאר</p>
      <div class="tgrid">
        <button
          v-for="t in list"
          :key="t.id"
          type="button"
          class="tcard"
          :class="{ on: t.id === templateId }"
          :aria-pressed="t.id === templateId ? 'true' : 'false'"
          @click="$emit('template', t.id)"
        >
          <span class="tthumb"
            ><img :src="thumb(t.id)" alt="" loading="lazy" /><i v-if="t.id === templateId" class="tcheck"
              ><BuilderIcon name="check" /></i
          ></span>
          <span class="tname">{{ t.name_he }}</span>
          <span v-if="isGen2(t)" class="tmeta">
            <span class="tsw" aria-hidden="true"
              ><i v-for="(c, ci) in swatchesOf(t)" :key="ci" :style="{ background: c }"></i></span
            ><span class="tfont" :style="{ fontFamily: `'${t.default_font}', serif` }">{{ t.default_font }}</span>
          </span>
          <span v-if="isGen2(t)" class="ttype tpreset">{{ presetLine(t) }}</span>
          <span v-else class="ttype">{{ typeHe(t.type) }} · תבנית קודמת</span>
        </button>
      </div>
      <p class="grp-note tnote">התבנית קובעת צבעים, גופנים וסגנון ברירת מחדל לפתיחה, לגלריה וללו״ז. התוכן לא משתנה.</p>
    </section>
    <section class="grp">
      <div class="grp-h"><h3>צבעים</h3><span class="grp-note">{{ paletteName }}</span></div>
      <div class="swatches">
        <button
          v-for="p in palettes"
          :key="p.id"
          type="button"
          class="sw-btn"
          :class="{ on: p.id === paletteId }"
          :aria-pressed="p.id === paletteId ? 'true' : 'false'"
          :title="p.name"
          @click="$emit('palette', p.id)"
        >
          <span class="sw" :style="swStyle(p)"></span><span class="sw-n">{{ p.name }}</span>
        </button>
      </div>
    </section>
    <section class="grp">
      <div class="grp-h"><h3>גופן לכותרות</h3></div>
      <div class="fonts">
        <button
          v-for="f in fonts"
          :key="f.id"
          type="button"
          class="font-btn"
          :class="{ on: f.id === fontId }"
          :aria-pressed="f.id === fontId ? 'true' : 'false'"
          @click="$emit('font', f.id)"
        >
          <span :style="{ fontFamily: f.css }">{{ sampleWord }}</span><small>{{ f.name }}</small>
        </button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from "vue";
import { listTemplates } from "../templates/registry";
import BuilderIcon from "./BuilderIcon.vue";
import { CATEGORIES, FONTS, PALETTES, type Palette } from "./hubWizardModel";
import { thumbFor } from "./templateThumbs";
import { VARIANT_BLOCK_TYPES, presetFor, variantLabel } from "../variants/variants";
import type { TemplateMeta } from "../types";

/** עיצוב tab: template grid + multiselect event-type filter, palette swatches, heading font. */
export default defineComponent({
  name: "WorkspaceDesignTab",
  components: { BuilderIcon },
  props: {
    templateId: { type: String, required: true },
    paletteId: { type: String, required: true },
    fontId: { type: String, required: true },
    /** The page's template when the builder opened: an old (pre-gen-2) one stays listed for that page only. */
    loadedTemplateId: { type: String, default: "" },
    filter: { type: Array as PropType<string[]>, required: true },
    filterOpen: { type: Boolean, default: false },
    sampleWord: { type: String, default: "אבג" },
  },
  emits: ["template", "palette", "font", "update:filter", "update:filterOpen"],
  setup(props, { emit }) {
    const msEl = ref<HTMLElement | null>(null);
    const isGen2 = (t: TemplateMeta) => t.generation === 2;
    const typesOf = (t: TemplateMeta) => (t.types && t.types.length ? t.types : [t.type]);
    /** The 9 gen-2 templates; the 14 old ones are hidden unless this page already uses one. */
    const all = computed(() =>
      listTemplates().filter(
        (t) => isGen2(t) || t.id === props.templateId || (props.loadedTemplateId && t.id === props.loadedTemplateId)
      )
    );
    const cats = CATEGORIES.filter((c) => c.id !== "all");
    const list = computed(() =>
      all.value.filter((t) => !props.filter.length || typesOf(t).some((x) => props.filter.includes(x)))
    );
    const presetLine = (t: TemplateMeta) =>
      VARIANT_BLOCK_TYPES.map((type) => variantLabel(type, presetFor(t.id, type))).join(" · ");
    const swatchesOf = (t: TemplateMeta) => {
      const c = (t.colors || {}) as Record<string, string>;
      return [c.bg, c.accent, c.ink].filter(Boolean);
    };
    const typeHe = (type: string) => CATEGORIES.find((c) => c.id === type)?.he || "";
    const filterLabel = computed(() =>
      props.filter.length ? props.filter.map(typeHe).join(", ") : "כל סוגי האירועים"
    );
    const countFor = (type: string) => all.value.filter((t) => typesOf(t).includes(type)).length;
    const paletteName = computed(() => PALETTES.find((p) => p.id === props.paletteId)?.name || "");
    function toggleCat(id: string) {
      const next = props.filter.includes(id) ? props.filter.filter((x) => x !== id) : [...props.filter, id];
      emit("update:filter", next);
    }
    function swStyle(p: Palette) {
      return p.a
        ? { background: `linear-gradient(135deg,${p.a} 0 50%,${p.b} 50% 100%)` }
        : { backgroundImage: `url(${thumbFor(props.templateId)})` };
    }
    function onDocDown(ev: Event) {
      if (props.filterOpen && msEl.value && !msEl.value.contains(ev.target as Node)) {
        emit("update:filterOpen", false);
      }
    }
    onMounted(() => document.addEventListener("pointerdown", onDocDown, true));
    onBeforeUnmount(() => document.removeEventListener("pointerdown", onDocDown, true));
    return {
      msEl,
      cats,
      list,
      typeHe,
      filterLabel,
      countFor,
      paletteName,
      palettes: PALETTES,
      fonts: FONTS,
      toggleCat,
      swStyle,
      thumb: thumbFor,
      isGen2,
      presetLine,
      swatchesOf,
    };
  },
});
</script>

<style scoped>
.tmeta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 4px 0;
  min-width: 0;
}
.tsw {
  display: inline-flex;
  flex: none;
}
.tsw i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid #fff;
  box-shadow: 0 0 0 1px rgba(30, 24, 19, 0.15);
}
.tsw i + i {
  margin-inline-start: -4px;
}
.tfont {
  font-size: 12.5px;
  color: var(--ink-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpreset {
  font-size: 11.5px;
}
.tnote {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
}
</style>
