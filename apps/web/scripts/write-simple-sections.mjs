import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/landing/sections"
);
fs.mkdirSync(dir, { recursive: true });

const props = `props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },`;

function vue(name, template) {
  return `<template>
${template}
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "${name}",
  ${props}
});
</script>
`;
}

const files = {
  Quote: vue(
    "Quote",
    `  <section :id="'sec-' + sectionId" :class="['block', 'quote-band', alt && 'alt']">
    <div class="wrap">
      <blockquote>
        <p>{{ data.text }}</p>
        <cite v-if="data.credit">{{ data.credit }}</cite>
      </blockquote>
    </div>
  </section>`
  ),
  Hashtag: vue(
    "Hashtag",
    `  <section :id="'sec-' + sectionId" :class="['block', 'hashtag-sec', alt && 'alt']">
    <div class="wrap">
      <p class="hash">{{ data.tag }}</p>
      <p class="body">{{ data.body }}</p>
    </div>
  </section>`
  ),
  Networking: vue(
    "Networking",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p class="body">{{ data.body }}</p>
    </div>
  </section>`
  ),
  Rules: vue(
    "Rules",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <ol class="rules">
        <li v-for="(r, i) in (data.items || [])" :key="i">{{ r }}</li>
      </ol>
    </div>
  </section>`
  ),
  Cards: vue(
    "Cards",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
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
  </section>`
  ),
  Zones: vue(
    "Zones",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
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
  </section>`
  ),
  EventTimeline: vue(
    "EventTimeline",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
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
  </section>`
  ),
  Lineup: vue(
    "Lineup",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
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
  </section>`
  ),
  Milestones: vue(
    "Milestones",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
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
  </section>`
  ),
  Playlist: vue(
    "Playlist",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
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
  </section>`
  ),
  Speakers: vue(
    "Speakers",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
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
  </section>`
  ),
  Sponsors: vue(
    "Sponsors",
    `  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
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
  </section>`
  ),
  FooterSection: `<template>
  <footer class="efoot" :id="'sec-' + sectionId">
    <div class="logo">
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="#DC5B66"/><path d="M16.8 7.2l1.4-1.4" stroke="#C9A36A" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      SnapShare
    </div>
    <p>{{ data.note || 'העמוד הזה נוצר ב־SnapShare. האורחים מעלים בלי אפליקציה, והתמונות מופיעות באלבום החי.' }}</p>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "FooterSection",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, default: "footer" },
    alt: { type: Boolean, default: false },
  },
});
</script>
`,
};

for (const [name, body] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, `${name}.vue`), body, "utf8");
}
console.log("wrote", Object.keys(files).length);
