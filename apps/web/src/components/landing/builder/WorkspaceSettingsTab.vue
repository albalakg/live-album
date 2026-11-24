<template>
  <div class="ws-settings">
    <section class="grp">
      <div class="grp-h"><h3>כתובת</h3></div>
      <WorkspaceSlugField
        :slug="slug"
        :status="slugStatus"
        :suggestions="suggestions"
        :prefix="prefix"
        @input="$emit('slug', $event)"
        @blur="$emit('slug-blur')"
        @suggest="$emit('suggest', $event)"
      />
      <p class="help">אחרי הפרסום עדיף לא לשנות, כי ה־QR שכבר הדפסתם מוביל לכתובת הזו.</p>
    </section>
    <section class="grp">
      <div class="grp-h"><h3>מי רואה את העמוד</h3></div>
      <label v-if="published || everPublished" class="optrow"
        ><span class="rtxt"
          ><b>מוצג לאורחים</b
          ><small>{{
            published ? "כל מי שיש לו את הקישור או ה־QR" : "מוסתר זמנית. האורחים לא רואים את העמוד"
          }}</small></span
        >
        <span class="tgl"
          ><input type="checkbox" :checked="published" :disabled="busy" @change="$emit('visible', !published)" /><i></i
        ></span>
      </label>
      <div v-else class="status-card">
        <span class="dot-d"></span
        ><span class="rtxt"><b>טיוטה. רק אתם רואים את העמוד</b><small>האורחים יוכלו להיכנס אחרי הפרסום</small></span>
        <button type="button" class="btn btn-dark btn-sm" @click="$emit('publish')">פרסום</button>
      </div>
    </section>
    <section v-if="published" class="grp">
      <div class="grp-h"><h3>שיתוף</h3></div>
      <button type="button" class="btn btn-line wide" @click="$emit('share')">
        <BuilderIcon name="qr" />קישור, QR ווואטסאפ
      </button>
    </section>
    <section v-if="showGraduate" class="grp">
      <div class="grp-h"><h3>הדף המלא</h3></div>
      <p class="help">{{ graduateHint }}</p>
      <button type="button" class="btn btn-line wide" :disabled="busy" @click="$emit('graduate')">
        {{ graduateLabel }}
      </button>
    </section>
    <section class="grp quiet">
      <button type="button" class="link" @click="$emit('reset')">להתחיל מחדש עם העיצוב הזה</button>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import type { SlugUiStatus } from "./builderTypes";
import WorkspaceSlugField from "./WorkspaceSlugField.vue";

/**
 * הגדרות tab: address + live check, who sees the page, share, start over.
 * «לא להופיע בגוגל» is left out on purpose: snapshare-server has no noindex flag yet.
 */
export default defineComponent({
  name: "WorkspaceSettingsTab",
  components: { BuilderIcon, WorkspaceSlugField },
  props: {
    slug: { type: String, required: true },
    slugStatus: { type: String as PropType<SlugUiStatus>, required: true },
    suggestions: { type: Array as PropType<string[]>, default: () => [] },
    prefix: { type: String, required: true },
    published: { type: Boolean, default: false },
    everPublished: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    /** When true, show «המשך לדף אירוע מלא». Default off so דף האירוע is unchanged. */
    showGraduate: { type: Boolean, default: false },
    graduateLabel: { type: String, default: "המשך לדף אירוע מלא" },
    graduateHint: {
      type: String,
      default: "החתונה או האירוע מתקרבים? עברו לדף האירוע המלא. Save the Date נשמר כטיוטה.",
    },
  },
  emits: ["slug", "slug-blur", "suggest", "visible", "publish", "share", "reset", "graduate"],
});
</script>
