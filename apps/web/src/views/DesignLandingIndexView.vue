<template>
  <div class="landing-index" dir="rtl">
    <header class="li-top">
      <router-link class="li-back" to="/design">← עיצוב המערכת</router-link>
      <div class="logo">
        <span class="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="#DC5B66"/><path d="M16.8 7.2l1.4-1.4" stroke="#C9A36A" stroke-width="1.6" stroke-linecap="round"/></svg>
        </span>
        SnapShare
      </div>
      <span class="li-meta">עמוד האירוע · {{ templates.length }} טמפלטים</span>
    </header>

    <div class="li-hero">
      <h1>בחרו טמפלט לעמוד האירוע</h1>
      <p>
        תצוגת עיצוב ל־14 דפי הנחיתה. כל קישור פותח את העמוד במצב תצוגה מקדימה עם כל הסעיפים פעילים.
      </p>
    </div>

    <div class="li-filters" role="tablist" aria-label="סינון לפי סוג אירוע">
      <button
        v-for="t in types"
        :key="t.id"
        type="button"
        class="chip"
        :class="{ on: filter === t.id }"
        role="tab"
        :aria-selected="filter === t.id"
        @click="filter = t.id"
      >{{ t.he }}</button>
    </div>

    <div class="li-grid">
      <template v-for="g in groups" :key="g.id">
        <div v-if="visible(g.id).length" class="li-group-title">{{ g.he }}</div>
        <router-link
          v-for="tpl in visible(g.id)"
          :key="tpl.id"
          class="tcard"
          :to="'/design/landing/' + tpl.id"
        >
          <div
            class="tcard-preview"
            :class="[tpl.heroStyle === 'cinema' && 'cinema', 't-' + tpl.id]"
          >
            <div class="kicker">{{ tpl.name_he }}</div>
            <div class="enames">{{ tpl.name_he }}</div>
            <div class="meta">{{ tpl.type_he || tpl.type }}</div>
          </div>
          <div class="tcard-body">
            <h3>{{ tpl.name_he }}</h3>
            <p>{{ tpl.direction }}</p>
            <span class="tcard-open">פתחו את העמוד ←</span>
          </div>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { listTemplates, loadTemplateTheme, TEMPLATE_IDS } from "@/components/landing/templates/registry";
import "@/components/landing/themes/base.css";

const TYPES = [
  { id: "all", he: "הכול" },
  { id: "wedding", he: "חתונה" },
  { id: "barmitzvah", he: "בר/בת מצווה" },
  { id: "birthday", he: "יום הולדת" },
  { id: "brit", he: "ברית / בריתה" },
  { id: "corporate", he: "אירוע חברה" },
  { id: "party", he: "מסיבה" },
  { id: "festival", he: "פסטיבל" },
];

export default defineComponent({
  name: "DesignLandingIndexView",
  setup() {
    const filter = ref("all");
    const templates = listTemplates();
    const types = TYPES;
    const groups = TYPES.filter((t) => t.id !== "all");

    function visible(typeId: string) {
      return templates.filter(
        (t) => t.type === typeId && (filter.value === "all" || t.type === filter.value)
      );
    }

    onMounted(async () => {
      for (const id of TEMPLATE_IDS) {
        await loadTemplateTheme(id);
      }
    });

    return { filter, templates, types, groups, visible };
  },
});
</script>

<style scoped>
.landing-index {
  min-height: 100dvh;
  background:
    radial-gradient(1200px 600px at 80% -10%, rgba(201,163,106,.16), transparent 55%),
    #F3EEE6;
  color: #161310;
  font-family: Heebo, Assistant, sans-serif;
}
.li-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 28px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(243,238,230,.84);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(22,19,16,.08);
}
.li-back { font-weight: 700; color: #5E564E; }
.logo {
  display: flex; align-items: center; gap: 10px;
  font-family: Outfit, Heebo, sans-serif; font-weight: 800; font-size: 1.25rem;
}
.logo-mark {
  width: 32px; height: 32px; border-radius: 9px; background: #12100E;
  display: grid; place-items: center;
}
.logo-mark svg { width: 18px; height: 18px; }
.li-meta { font-weight: 600; color: #5E564E; font-size: .9rem; }
.li-hero { padding: 48px 28px 28px; max-width: 1080px; margin: 0 auto; }
.li-hero h1 {
  font-size: clamp(2.2rem, 6vw, 3.4rem); font-weight: 900; letter-spacing: -.045em; line-height: 1.12;
}
.li-hero p { margin-top: 16px; font-size: 1.1rem; color: #5E564E; max-width: 38em; line-height: 1.65; }
.li-filters {
  display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 28px 28px;
  max-width: 1080px; margin: 0 auto;
}
.chip {
  padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: .92rem;
  background: transparent; border: 1px solid rgba(22,19,16,.14); color: #3A342E; cursor: pointer;
}
.chip.on { background: #12100E; color: #F3EEE6; border-color: #12100E; }
.li-grid {
  display: grid; grid-template-columns: 1fr; gap: 28px; padding: 8px 20px 80px;
  max-width: 1240px; margin: 0 auto;
}
@media (min-width: 720px) {
  .li-grid { grid-template-columns: 1fr 1fr; }
}
.li-group-title {
  grid-column: 1 / -1;
  font-size: .78rem; font-weight: 800; letter-spacing: .16em;
  text-transform: uppercase; color: #8A8278; padding-top: 12px;
}
.tcard {
  display: block; text-align: right; border-radius: 28px; overflow: hidden;
  background: #fff; text-decoration: none; color: inherit;
  box-shadow: 0 18px 50px rgba(18,16,14,.1);
  border: 1px solid rgba(22,19,16,.06);
}
.tcard-preview {
  aspect-ratio: 3 / 4; height: 360px;
  background-size: cover; background-position: center;
  background-image: var(--hero-art);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 18% 14% 16%; text-align: center; color: var(--hero-ink, #2A221C);
}
.tcard-preview.cinema {
  align-items: flex-end; justify-content: flex-end; padding: 12%; text-align: right;
  background-image: var(--hero-scrim), var(--hero-art);
}
.tcard-preview .kicker {
  font-size: .68rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; opacity: .75; margin-bottom: 8px;
}
.tcard-preview .enames {
  font-family: var(--font-display, "Frank Ruhl Libre", serif);
  font-size: clamp(1.4rem, 4vw, 2.2rem); font-weight: 700; line-height: 1.15;
}
.tcard-preview .meta { margin-top: 8px; font-size: .78rem; font-weight: 600; opacity: .72; }
.tcard-body { padding: 18px 22px 22px; background: #FFFCFA; }
.tcard-body h3 { font-size: 1.15rem; font-weight: 800; }
.tcard-body p { margin-top: 4px; color: #5E564E; font-size: .92rem; line-height: 1.5; }
.tcard-open { display: inline-flex; margin-top: 12px; font-weight: 800; font-size: .88rem; color: #8A5A14; }
</style>
