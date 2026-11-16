<template>
  <section class="card adv" :class="{ open }">
    <button
      type="button"
      class="adv-h"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="adv-body"
      @click="$emit('update:open', !open)"
    >
      <span class="sec-ic"><BuilderIcon name="palette" /></span>
      <span class="sec-txt">
        <b>עיצוב מתקדם</b>
        <span>צבעים וגופן. לא חובה, העיצוב כבר מוכן.</span>
      </span>
      <BuilderIcon name="chev" class="chev" />
    </button>
    <div v-if="open" id="adv-body" class="adv-b">
      <div id="pal-l" class="lbl">צבעים</div>
      <div class="swatches" role="radiogroup" aria-labelledby="pal-l">
        <button
          v-for="p in palettes"
          :key="p.id"
          type="button"
          class="swatch"
          role="radio"
          :aria-checked="theme.palette_id === p.id ? 'true' : 'false'"
          @click="$emit('palette', p.id)"
        >
          <span class="c" :style="p.a ? undefined : originalStyle">
            <template v-if="p.a">
              <i :style="{ background: p.a }" />
              <i :style="{ background: p.b || p.a }" />
            </template>
          </span>
          {{ p.name }}
        </button>
      </div>
      <div id="font-l" class="lbl">גופן לכותרות</div>
      <div class="fonts" role="radiogroup" aria-labelledby="font-l">
        <button
          v-for="f in fonts"
          :key="f.id"
          type="button"
          class="fontopt"
          role="radio"
          :aria-checked="currentFont === f.id ? 'true' : 'false'"
          @click="$emit('font', f.id)"
        >
          <span class="sample" :style="{ fontFamily: f.css }">{{ titleText || "עמית וגל" }}</span>
          <small>{{ f.name }}{{ templateFontId === f.id ? " · של העיצוב" : "" }}</small>
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import { FONTS, PALETTES } from "./hubWizardModel";
import type { WizardTheme } from "./hubWizardModel";

/** Colours and heading font. Collapsed by default: the design already works without it. */
export default defineComponent({
  name: "AdvancedDesignCard",
  components: { BuilderIcon },
  props: {
    theme: { type: Object as PropType<WizardTheme>, required: true },
    open: { type: Boolean, default: false },
    /** The host's names, shown in each font sample. */
    titleText: { type: String, default: "" },
    /** Font id of the chosen design (tagged "של העיצוב" and used when none is picked). */
    templateFontId: { type: String, default: "classic" },
  },
  emits: ["update:open", "palette", "font"],
  setup(props) {
    const currentFont = computed(() => props.theme.font_id || props.templateFontId);
    const originalStyle = {
      background: "conic-gradient(from 180deg, #E7D3B5, #C9A36A, #3A2A22, #E7D3B5)",
    };
    return { palettes: PALETTES, fonts: FONTS, currentFont, originalStyle };
  },
});
</script>
