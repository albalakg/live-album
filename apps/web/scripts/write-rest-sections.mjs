import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/landing/sections"
);

const files = {
  "TriviaCta.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', 'trivia-card', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">טריוויה</p>
      <h2 class="sec-title">{{ data.title }}</h2>
      <p class="body">{{ data.body }}</p>
      <button type="button" class="btn btn-primary" @click="onTrivia">הצטרפו למשחק</button>
      <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "TriviaCta",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function onTrivia() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openTrivia(String(props.data.title || "טריוויה"));
    }
    return { preview, onTrivia };
  },
});
</script>
`,
  "Gift.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p class="body" style="margin-bottom:22px">{{ data.body }}</p>
      <button type="button" class="btn btn-ghost" @click="onGift">{{ data.button || 'לקישור' }}</button>
      <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "Gift",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function onGift() {
      if (preview.value || !props.data.url) {
        ctx?.toast("קישור לדוגמה בלבד.");
        return;
      }
      window.open(String(props.data.url), "_blank", "noopener");
    }
    return { preview, onGift };
  },
});
</script>
`,
  "BeenThere.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', 'been-card', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">חיבור</p>
      <h2 class="sec-title">{{ data.heading }}</h2>
      <p class="body">{{ data.body }}</p>
      <button type="button" class="btn btn-ghost" @click="onAlbum">לאלבום החי</button>
      <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "BeenThere",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function onAlbum() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openAlbum();
    }
    return { preview, onAlbum };
  },
});
</script>
`,
  "Grounds.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:22px">{{ data.note }}</p>
      <svg class="grounds-svg" viewBox="0 0 640 360" role="img" aria-label="תרשים שטח לדוגמה">
        <rect width="640" height="360" rx="18" fill="var(--stage, #EDE4D4)" stroke="var(--line-strong)" />
        <rect x="40" y="40" width="120" height="80" rx="10" class="z-gate" fill="var(--accent)" opacity="0.35" />
        <rect x="220" y="60" width="200" height="120" rx="12" class="z-main" fill="var(--accent)" opacity="0.5" />
        <rect x="460" y="50" width="140" height="90" rx="10" class="z-small" fill="var(--accent-2, var(--accent))" opacity="0.35" />
        <rect x="60" y="200" width="160" height="100" rx="10" class="z-food" fill="var(--accent)" opacity="0.28" />
        <rect x="260" y="220" width="140" height="90" rx="10" class="z-camp" fill="var(--accent-2, var(--accent))" opacity="0.28" />
        <rect x="450" y="210" width="140" height="100" rx="10" class="z-park" fill="var(--muted)" opacity="0.25" />
        <text x="320" y="340" text-anchor="middle" fill="var(--muted)" font-size="14">מפה לדוגמה</text>
      </svg>
      <ul class="zone-legend">
        <li v-for="(z, i) in (data.zones || [])" :key="i">
          <i :class="'z-' + z.id" /><span>{{ z.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Grounds",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
`,
  "SnapshareCta.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', 'block-cta', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">SnapShare</p>
      <h2 class="sec-title">{{ data.button_text }}</h2>
      <div class="cta-row">
        <button type="button" class="btn btn-primary" @click="onUpload">{{ data.button_text }}</button>
        <button type="button" class="btn btn-ghost" @click="onAlbum">{{ data.album_text || 'צפו באלבום' }}</button>
      </div>
      <p class="cta-note">{{ data.subtitle || 'בלי אפליקציה' }}<span v-if="preview" class="preview-note">בתצוגה מקדימה</span></p>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "SnapshareCta",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function onUpload() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openUpload();
    }
    function onAlbum() {
      if (preview.value) return ctx?.toast("בתצוגה מקדימה");
      ctx?.openAlbum();
    }
    return { preview, onUpload, onAlbum };
  },
});
</script>
`,
  "RichText.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', 'welcome', alt && 'alt']">
    <div class="wrap" :style="alignStyle">
      <p class="sec-kicker">ברכה</p>
      <h2 class="sec-title">{{ data.heading }}</h2>
      <p class="body">{{ data.body }}</p>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
export default defineComponent({
  name: "RichText",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const alignStyle = computed(() => {
      const a = String(props.data.alignment || "RIGHT").toUpperCase();
      const map: Record<string, string> = {
        LEFT: "left",
        CENTER: "center",
        RIGHT: "right",
      };
      return { textAlign: map[a] || "right" };
    });
    return { alignStyle };
  },
});
</script>
`,
  "SmartNavigation.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">הגעה</p>
      <h2 class="sec-title">איך מגיעים</h2>
      <p class="venue-name">{{ data.location_name }}</p>
      <p class="venue-city">{{ data.city }}</p>
      <div class="nav-actions">
        <button type="button" @click="openWaze"><span>פתחו ב־Waze</span><span class="ic">◁</span></button>
        <button type="button" @click="openMaps"><span>פתחו בגוגל מפות</span><span class="ic">◁</span></button>
      </div>
      <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "SmartNavigation",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function openWaze() {
      if (preview.value || !props.data.waze_url) return ctx?.toast("קישור ווייז לדוגמה.");
      window.open(String(props.data.waze_url), "_blank", "noopener");
    }
    function openMaps() {
      if (preview.value || !props.data.google_maps_url) return ctx?.toast("קישור מפות לדוגמה.");
      window.open(String(props.data.google_maps_url), "_blank", "noopener");
    }
    return { preview, openWaze, openMaps };
  },
});
</script>
`,
  "LinkList.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">קישורים</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <ul class="links">
        <li v-for="(l, i) in (data.links || [])" :key="i">
          <a href="#" @click.prevent="onLink(l)">{{ l.label }}<span class="ic">←</span></a>
        </li>
      </ul>
      <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "LinkList",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup() {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    function onLink(l: { url?: string; demo?: boolean }) {
      if (preview.value || l.demo || !l.url) return ctx?.toast("קישור לדוגמה בלבד.");
      window.open(String(l.url), "_blank", "noopener");
    }
    return { preview, onLink };
  },
});
</script>
`,
  "MediaStrip.vue": `<template>
  <section :id="'sec-' + sectionId" :class="['block', 'wide', alt && 'alt']">
    <div class="wrap">
      <div class="media-head">
        <div>
          <p class="sec-kicker">אלבום</p>
          <h2 class="sec-title">{{ data.heading || 'האלבום החי' }}</h2>
        </div>
        <span class="media-live"><i /> חי</span>
      </div>
      <div class="media-grid">
        <div v-for="n in 6" :key="n" class="tile ph" aria-hidden="true" />
      </div>
      <p class="media-note">{{ data.note || 'התמונות יופיעו כאן בשידור חי, אחרי שהאורחים מעלים.' }}</p>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "MediaStrip",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
});
</script>
`,
};

for (const [name, body] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, name), body, "utf8");
}
console.log("wrote", Object.keys(files).length);
