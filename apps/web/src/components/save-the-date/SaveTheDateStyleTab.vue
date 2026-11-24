<template>
  <div class="std-style-tab">
    <section class="grp">
      <div class="grp-h"><h3>סגנון</h3></div>
      <div class="tgrid" role="list">
        <button
          v-for="s in styles"
          :key="s.id"
          type="button"
          class="tcard"
          role="listitem"
          :class="{ on: current === s.id }"
          :aria-label="s.he + ' · ' + s.desc"
          :aria-pressed="current === s.id ? 'true' : 'false'"
          @click="$emit('style', s.id)"
        >
          <div class="tthumb">
            <div class="tthumb-stage">
              <SaveTheDateFrame :cfg="thumbCfg(s.id)" mode="thumb" state="open" still />
            </div>
          </div>
          <div class="tmeta">
            <b>{{ s.he }}</b>
            <small>{{ s.desc }}</small>
          </div>
        </button>
      </div>
    </section>

    <section class="grp">
      <div class="grp-h"><h3>צבע</h3></div>
      <div class="swatches" role="list">
        <button
          v-for="a in styleDef.accents"
          :key="a.id"
          type="button"
          class="swatch"
          role="listitem"
          :class="{ on: accent === a.id }"
          :style="{ '--sw': a.acc }"
          :aria-label="a.he"
          :aria-pressed="accent === a.id ? 'true' : 'false'"
          @click="$emit('opt', 'accent', a.id)"
        >
          <i :style="{ background: a.acc }"></i>
          <span>{{ a.he }}</span>
        </button>
      </div>
    </section>

    <section v-if="styleDef.options.length" class="grp">
      <div class="grp-h"><h3>אפשרויות</h3></div>
      <label v-for="o in styleDef.options" :key="o.id" class="optrow">
        <span class="rtxt"><b>{{ o.he }}</b></span>
        <span class="tgl">
          <input
            type="checkbox"
            :checked="!!opts[o.id]"
            @change="$emit('opt', o.id, !opts[o.id])"
          /><i></i>
        </span>
      </label>
    </section>

    <section class="grp quiet">
      <button type="button" class="btn btn-line" @click="$emit('replay')">הריצו את האנימציה שוב</button>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import { STYLES, defaultsFor, styleById, type StdCfg, type StyleId, type StyleOpts } from "./saveTheDateCatalog";
import { toStdCfg, type SaveTheDateSlice } from "./saveTheDateModel";
import SaveTheDateFrame from "./SaveTheDateFrame.vue";

export default defineComponent({
  name: "SaveTheDateStyleTab",
  components: { SaveTheDateFrame },
  props: {
    slice: { type: Object as PropType<SaveTheDateSlice>, required: true },
    slug: { type: String, default: "preview" },
  },
  emits: ["style", "opt", "replay"],
  setup(props) {
    const styles = STYLES;
    const styleDef = computed(() => styleById(props.slice.style));
    const current = computed(() => styleDef.value.id);
    const opts = computed<StyleOpts>(() => {
      const id = current.value;
      return { ...defaultsFor(id), ...((props.slice.style_opts || {})[id] as StyleOpts) };
    });
    const accent = computed(() => String(opts.value.accent || styleDef.value.accents[0].id));

    function thumbCfg(id: StyleId): StdCfg {
      const s = { ...props.slice, style: id, style_opts: { ...(props.slice.style_opts || {}) } };
      if (!s.style_opts[id]) s.style_opts[id] = { ...defaultsFor(id) };
      return toStdCfg(s, props.slug);
    }

    return { styles, styleDef, current, opts, accent, thumbCfg };
  },
});
</script>

<style scoped>
/* Portrait phone stage, scaled to the tile — avoids the landscape
   container query that made names and the date collide on מינימלי. */
.tthumb {
  position: relative;
  height: auto;
  aspect-ratio: 390 / 600;
  overflow: hidden;
  pointer-events: none;
  border-radius: 10px;
  container-type: size;
  background: var(--bg-2, #f1eee8);
}
.tthumb-stage {
  position: absolute;
  top: 0;
  right: 0;
  width: 390px;
  height: 600px;
  transform-origin: top right;
  transform: scale(calc(100cqw / 390px));
}
.tthumb-stage :deep(.save-the-date-frame),
.tthumb-stage :deep(.std) {
  width: 100%;
  height: 100%;
}
.tmeta {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
  padding: 8px 4px 2px;
  text-align: start;
}
.tmeta b,
.tmeta small {
  display: block;
  line-height: 1.35;
}
.tmeta b {
  font-weight: 700;
  font-size: 0.92rem;
}
.tmeta small {
  color: var(--muted, #6b6158);
  font-size: 0.75rem;
  font-weight: 500;
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.swatch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 999px;
  font: inherit;
  color: inherit;
}
.swatch i {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: block;
}
.swatch.on {
  border-color: currentColor;
}
</style>
