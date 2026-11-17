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
          <span class="tname">{{ t.name_he }}</span><span class="ttype">{{ typeHe(t.type) }}</span>
        </button>
      </div>
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

/** עיצוב tab: template grid + multiselect event-type filter, palette swatches, heading font. */
export default defineComponent({
  name: "WorkspaceDesignTab",
  components: { BuilderIcon },
  props: {
    templateId: { type: String, required: true },
    paletteId: { type: String, required: true },
    fontId: { type: String, required: true },
    filter: { type: Array as PropType<string[]>, required: true },
    filterOpen: { type: Boolean, default: false },
    sampleWord: { type: String, default: "אבג" },
  },
  emits: ["template", "palette", "font", "update:filter", "update:filterOpen"],
  setup(props, { emit }) {
    const msEl = ref<HTMLElement | null>(null);
    const all = listTemplates();
    const cats = CATEGORIES.filter((c) => c.id !== "all");
    const list = computed(() => all.filter((t) => !props.filter.length || props.filter.includes(t.type)));
    const typeHe = (type: string) => CATEGORIES.find((c) => c.id === type)?.he || "";
    const filterLabel = computed(() =>
      props.filter.length ? props.filter.map(typeHe).join(", ") : "כל סוגי האירועים"
    );
    const countFor = (type: string) => all.filter((t) => t.type === type).length;
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
    };
  },
});
</script>
