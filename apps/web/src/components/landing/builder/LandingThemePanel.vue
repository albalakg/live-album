<template>
  <div class="ltp-theme" dir="rtl">
    <h3>ערכת נושא</h3>

    <section class="sec">
      <h4>פלטה</h4>
      <div class="swatches">
        <button
          v-for="(p, id) in palettes"
          :key="id"
          type="button"
          class="swatch"
          :class="{ on: theme.palette_id === id }"
          :aria-label="`פלטה ${id}`"
          :aria-pressed="theme.palette_id === id"
          @click="setPalette(String(id))"
        >
          <span class="swatch-a" :style="{ background: p.primary }" />
          <span class="swatch-b" :style="{ background: p.secondary }" />
          <span class="swatch-c" :style="{ background: p.background }" />
        </button>
      </div>
    </section>

    <section class="sec">
      <h4>גופן</h4>
      <select class="input" :value="theme.font_family || ''" @change="setFont(($event.target as HTMLSelectElement).value)">
        <option v-for="f in fonts" :key="f" :value="f" :style="{ fontFamily: `'${f}', sans-serif` }">
          {{ f }}
        </option>
      </select>
    </section>

    <section class="sec">
      <h4>גודל</h4>
      <div class="seg" role="group" aria-label="סקאלה">
        <button
          v-for="s in scales"
          :key="s"
          type="button"
          :class="{ on: (theme.scale || 'M') === s }"
          @click="patch({ scale: s })"
        >{{ s }}</button>
      </div>
    </section>

    <section class="sec">
      <h4>מצב</h4>
      <div class="seg" role="group" aria-label="רקע">
        <button
          type="button"
          :class="{ on: (theme.background_type || 'LIGHT') === 'LIGHT' }"
          @click="patch({ background_type: 'LIGHT' })"
        >בהיר</button>
        <button
          type="button"
          :class="{ on: theme.background_type === 'DARK' }"
          @click="patch({ background_type: 'DARK' })"
        >כהה</button>
      </div>
    </section>

    <section class="sec">
      <h4>תמונת כיסוי</h4>
      <div class="cover-row">
        <div class="cover-preview">
          <img v-if="coverUrl" :src="coverUrl" alt="" />
          <span v-else>ברירת מחדל</span>
        </div>
        <button type="button" class="btn" @click="pickerOpen = true">בחירת תמונה</button>
      </div>
    </section>

    <details class="sec custom">
      <summary>צבעים מותאמים (אופציונלי)</summary>
      <div class="colors">
        <label v-for="c in colorKeys" :key="c.key">
          <span>{{ c.label }}</span>
          <input
            class="input"
            dir="ltr"
            :value="colorVal(c.key)"
            placeholder="#RRGGBB"
            maxlength="7"
            @input="setColor(c.key, ($event.target as HTMLInputElement).value)"
          />
          <small v-if="colorVal(c.key) && !isHex(colorVal(c.key))" class="err">פורמט #RRGGBB</small>
        </label>
      </div>
    </details>

    <LandingImagePicker
      v-if="pickerOpen"
      :event-id="eventId"
      :template-id="templateId"
      @close="pickerOpen = false"
      @pick="onCover"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from "vue";
import type { HubTheme, ImageRef, Scale } from "../types";
import { getTemplate, resolveImageRef } from "../templates/registry";
import { ALLOWED_FONTS } from "./blockLabels";
import LandingImagePicker from "./LandingImagePicker.vue";

const HEX = /^#[0-9A-Fa-f]{6}$/;

export default defineComponent({
  name: "LandingThemePanel",
  components: { LandingImagePicker },
  props: {
    theme: { type: Object as PropType<HubTheme>, required: true },
    templateId: { type: String, required: true },
    eventId: { type: Number, required: true },
  },
  emits: ["update"],
  setup(props, { emit }) {
    const pickerOpen = ref(false);
    const fonts = ALLOWED_FONTS;
    const scales: Scale[] = ["S", "M", "L"];
    const colorKeys = [
      { key: "primary", label: "ראשי" },
      { key: "secondary", label: "משני" },
      { key: "accent", label: "הדגשה" },
      { key: "background", label: "רקע" },
      { key: "text", label: "טקסט" },
    ];

    const palettes = computed(() => getTemplate(props.templateId)?.palettes || {});
    const coverUrl = computed(() => resolveImageRef(props.theme.cover)?.url || null);

    function patch(partial: Partial<HubTheme>) {
      emit("update", { ...props.theme, ...partial });
    }

    function setPalette(id: string) {
      const p = palettes.value[id];
      if (!p) return;
      patch({
        palette_id: id,
        background_type: p.background_type,
        colors: {
          primary: p.primary,
          secondary: p.secondary,
          accent: p.accent,
          background: p.background,
          text: p.text,
        },
      });
    }

    function setFont(font: string) {
      patch({ font_family: font });
    }

    function colorVal(key: string): string {
      const colors = props.theme.colors || {};
      return String((colors as Record<string, string>)[key] || "");
    }

    function setColor(key: string, value: string) {
      const colors = { ...(props.theme.colors || {}), [key]: value };
      patch({ colors });
    }

    function isHex(v: string) {
      return HEX.test(v);
    }

    function onCover(ref: ImageRef | null) {
      pickerOpen.value = false;
      patch({ cover: ref || undefined });
    }

    return {
      pickerOpen,
      fonts,
      scales,
      colorKeys,
      palettes,
      coverUrl,
      patch,
      setPalette,
      setFont,
      colorVal,
      setColor,
      isHex,
      onCover,
    };
  },
});
</script>

<style lang="scss" scoped>
.ltp-theme {
  display: grid;
  gap: 16px;
}
.ltp-theme > h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
}
.sec {
  display: grid;
  gap: 8px;
}
.sec h4 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  color: #5e564e;
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.swatch {
  width: 52px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid transparent;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  padding: 0;
  cursor: pointer;
  background: #fff;
}
.swatch.on {
  border-color: #c9a36a;
}
.swatch-a,
.swatch-b,
.swatch-c {
  display: block;
  height: 100%;
}
.input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(22, 19, 16, 0.14);
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  background: #fff;
}
.seg {
  display: inline-flex;
  background: rgba(22, 19, 16, 0.06);
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
}
.seg button {
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}
.seg button.on {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.cover-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cover-preview {
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
.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  background: rgba(22, 19, 16, 0.08);
}
.custom summary {
  cursor: pointer;
  font-weight: 700;
  color: #5e564e;
}
.colors {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}
.colors label {
  display: grid;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}
.err {
  color: #a33;
}
</style>
