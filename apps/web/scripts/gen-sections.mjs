import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/components/landing/sections");

const files = {
  "HeroCountdown.vue": `<template>
  <section :id="'sec-' + sectionId" :class="heroClass">
    <div v-if="heroStyle === 'card'" class="hero-card">
      <div class="kicker">{{ data.kicker }}</div>
      <h1 :class="['enames', isShort && 'is-short']">{{ data.title }}</h1>
      <div class="ornament svg" aria-hidden="true">
        <svg viewBox="0 0 72 16" fill="none"><path d="M4 8h20M48 8h20" stroke="currentColor" stroke-width="1.2"/><path d="M36 2l2.2 4.4 4.8.6-3.6 3.4.9 4.6L36 12.8 31.7 15l.9-4.6L29 7l4.8-.6L36 2z" fill="currentColor"/></svg>
      </div>
      <p class="date">{{ dateLine }}</p>
      <p class="venue">{{ venueLine }}</p>
    </div>
    <div v-if="heroStyle === 'card'" class="hero-aside">
      <div class="count" aria-label="ספירה לאחור">
        <div class="cell"><span class="n">{{ pad(parts.days) }}</span><span class="l">ימים</span></div>
        <div class="count-sep" aria-hidden="true"></div>
        <div class="cell"><span class="n">{{ pad(parts.hours) }}</span><span class="l">שעות</span></div>
        <div class="count-sep" aria-hidden="true"></div>
        <div class="cell"><span class="n">{{ pad(parts.mins) }}</span><span class="l">דקות</span></div>
        <div class="count-sep" aria-hidden="true"></div>
        <div class="cell"><span class="n">{{ pad(parts.secs) }}</span><span class="l">שניות</span></div>
      </div>
      <div class="cta-row">
        <button type="button" class="btn btn-primary" :aria-disabled="preview || undefined" @click="onUpload">העלו תמונות</button>
        <a class="btn btn-ghost" href="#sec-join" @click.prevent="scrollJoin">איך זה עובד</a>
      </div>
      <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
    </div>
    <div v-else class="inner">
      <div class="kicker">{{ data.kicker }}</div>
      <h1 :class="['enames', isShort && 'is-short']">{{ data.title }}</h1>
      <div class="ornament svg" aria-hidden="true">
        <svg viewBox="0 0 72 16" fill="none"><path d="M4 8h20M48 8h20" stroke="currentColor" stroke-width="1.2"/><path d="M36 2l2.2 4.4 4.8.6-3.6 3.4.9 4.6L36 12.8 31.7 15l.9-4.6L29 7l4.8-.6L36 2z" fill="currentColor"/></svg>
      </div>
      <p class="date">{{ dateLine }}</p>
      <p class="venue">{{ venueLine }}</p>
      <div class="hero-aside">
        <div class="count" aria-label="ספירה לאחור">
          <div class="cell"><span class="n">{{ pad(parts.days) }}</span><span class="l">ימים</span></div>
          <div class="count-sep" aria-hidden="true"></div>
          <div class="cell"><span class="n">{{ pad(parts.hours) }}</span><span class="l">שעות</span></div>
          <div class="count-sep" aria-hidden="true"></div>
          <div class="cell"><span class="n">{{ pad(parts.mins) }}</span><span class="l">דקות</span></div>
          <div class="count-sep" aria-hidden="true"></div>
          <div class="cell"><span class="n">{{ pad(parts.secs) }}</span><span class="l">שניות</span></div>
        </div>
        <div class="cta-row">
          <button type="button" class="btn btn-primary" :aria-disabled="preview || undefined" @click="onUpload">העלו תמונות</button>
          <a class="btn btn-ghost" href="#sec-join" @click.prevent="scrollJoin">איך זה עובד</a>
        </div>
        <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, reactive } from "vue";
import { LANDING_CTX } from "../landingContext";

const FROZEN = { days: 14, hours: 6, mins: 22, secs: 8 };

export default defineComponent({
  name: "HeroCountdown",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, default: "hero" },
    heroStyle: { type: String, default: "card" },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    const parts = reactive({ days: 0, hours: 0, mins: 0, secs: 0 });
    let timer: ReturnType<typeof setInterval> | null = null;

    const isShort = computed(() => String(props.data.title || "").replace(/\\s/g, "").length <= 6);
    const dateLine = computed(() => {
      const d = props.data.date_he || "";
      const t = props.data.time_he || "";
      return t ? \`\${d} · \${t}\` : d;
    });
    const venueLine = computed(() => [props.data.venue, props.data.city].filter(Boolean).join(", "));
    const heroClass = computed(() => (props.heroStyle === "cinema" ? "hero-cinema" : "hero-stage"));

    function pad(n: number) {
      return String(Math.max(0, n)).padStart(2, "0");
    }

    function tick() {
      if (ctx?.shot) {
        Object.assign(parts, FROZEN);
        return;
      }
      const target = new Date(String(props.data.event_date || "")).getTime();
      const diff = Math.max(0, target - Date.now());
      const secs = Math.floor(diff / 1000);
      parts.days = Math.floor(secs / 86400);
      parts.hours = Math.floor((secs % 86400) / 3600);
      parts.mins = Math.floor((secs % 3600) / 60);
      parts.secs = secs % 60;
    }

    function onUpload() {
      if (preview.value) {
        ctx?.toast("בתצוגה מקדימה");
        return;
      }
      ctx?.openUpload();
    }

    function scrollJoin() {
      const el = document.getElementById("sec-join");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    onMounted(() => {
      tick();
      if (!ctx?.shot) timer = setInterval(tick, 1000);
    });
    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    return { parts, pad, isShort, dateLine, venueLine, heroClass, preview, onUpload, scrollJoin };
  },
});
</script>
`,
};

// Simpler sections via factory
function blockShell(name, inner, extras = "") {
  return `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt', extraClass]">
    <div :class="wrapClass">
${inner}
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
import { useLandingImage } from "../useLandingImage";
${extras}
export default defineComponent({
  name: "${name}",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    const { resolve } = useLandingImage();
    const wrapClass = computed(() => "wrap");
    const extraClass = computed(() => "");
    return { ctx, preview, resolve, wrapClass, extraClass };
  },
});
</script>
`;
}

// We'll write handcrafted better versions below for complex ones
const simple = {
  Quote: `<template>
  <section :id="'sec-' + sectionId" :class="['block', 'quote-band', alt && 'alt']">
    <div class="wrap">
      <blockquote>
        <p>{{ data.text }}</p>
        <cite v-if="data.credit">{{ data.credit }}</cite>
      </blockquote>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Quote",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Hashtag: `<template>
  <section :id="'sec-' + sectionId" :class="['block', 'hashtag-sec', alt && 'alt']">
    <div class="wrap">
      <p class="hash">{{ data.tag }}</p>
      <p class="body">{{ data.body }}</p>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Hashtag",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Networking: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p class="body">{{ data.body }}</p>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Networking",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Rules: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <ol class="rules">
        <li v-for="(r, i) in (data.items || [])" :key="i">{{ r }}</li>
      </ol>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Rules",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Cards: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap wide">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <ul class="info-cards">
        <li v-for="(c, i) in (data.items || [])" :key="i">
          <h3>{{ c.title }}</h3>
          <p>{{ c.body }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Cards",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Zones: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap wide">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:22px">{{ data.note }}</p>
      <ul class="info-cards">
        <li v-for="(c, i) in (data.items || [])" :key="i">
          <h3>{{ c.title }}</h3>
          <p>{{ c.body }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Zones",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  EventTimeline: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">{{ data.kicker || 'לו״ז' }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <ol class="tl">
        <li v-for="(it, i) in (data.items || [])" :key="i">
          <span class="dot" aria-hidden="true"></span>
          <div class="time">{{ it.time }}</div>
          <div>
            <div class="label">{{ it.label }}</div>
            <div v-if="it.description" class="desc">{{ it.description }}</div>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "EventTimeline",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Lineup: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:18px">{{ data.note }}</p>
      <ol class="lineup">
        <li v-for="(it, i) in (data.items || [])" :key="i">
          <div class="lu-time">{{ it.time }}</div>
          <div>
            <div class="lu-title">{{ it.title }}</div>
            <p v-if="it.body">{{ it.body }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Lineup",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Milestones: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:22px">{{ data.note }}</p>
      <ol class="miles">
        <li v-for="(it, i) in (data.items || [])" :key="i">
          <span class="mtag">{{ it.tag }}</span>
          <div>
            <h3>{{ it.title }}</h3>
            <p>{{ it.body }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Milestones",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Playlist: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">מוזיקה</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:12px">{{ data.note }}</p>
      <ol class="tracks">
        <li v-for="(tr, i) in (data.tracks || [])" :key="i">
          <span class="no">{{ String(i + 1).padStart(2, '0') }}</span>
          <div>
            <div class="song">{{ tr.song }}</div>
            <div class="art">{{ tr.art }}</div>
          </div>
          <span class="dur">{{ tr.dur }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Playlist",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Speakers: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">דוברים</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:18px">{{ data.note }}</p>
      <ul class="speakers">
        <li v-for="(s, i) in (data.items || [])" :key="i">
          <div class="mono" aria-hidden="true">{{ s.initials }}</div>
          <div>
            <div class="nm">{{ s.name }}</div>
            <div class="rl">{{ s.role }} <span class="demo-tag">דוגמה</span></div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Speakers",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  Sponsors: `<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap wide">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:22px">{{ data.note }}</p>
      <ul class="sponsors">
        <li v-for="(s, i) in (data.items || [])" :key="i">
          <span class="mono">{{ s.initials }}</span>
          <span>{{ s.name }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Sponsors",
  props: { data: { type: Object, required: true }, sectionId: { type: String, required: true }, alt: { type: Boolean, default: false } },
});
</script>
`,
  FooterSection: `<template>
  <footer class="efoot" :id="'sec-' + sectionId">
    <div class="logo">
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="#DC5B66"/><path d="M16.8 7.2l1.4-1.4" stroke="#C9A36A" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      SnapShare
    </div>
    <p>{{ data.note || defaultNote }}</p>
  </footer>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "FooterSection",
  props: { data: { type: Object, required: true }, sectionId: { type: String, default: "footer" }, alt: { type: Boolean, default: false } },
  setup() {
    return {
      defaultNote: "העמוד הזה נוצר ב־SnapShare. האורחים מעלים בלי אפליקציה, והתמונות מופיעות באלבום החי.",
    };
  },
});
</script>
`,
};

for (const [name, content] of Object.entries({ ...files, ...simple })) {
  fs.writeFileSync(path.join(dir, name), content, "utf8");
}
console.log("wrote", Object.keys({ ...files, ...simple }).length, "section files");
