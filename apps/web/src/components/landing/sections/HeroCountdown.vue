<template>
  <section :id="'sec-' + sectionId" :class="heroClass">
    <template v-if="heroStyle === 'card'">
      <div class="hero-card">
        <div class="kicker">{{ data.kicker }}</div>
        <h1 :class="['enames', isShort && 'is-short']">{{ data.title }}</h1>
        <div class="ornament svg" aria-hidden="true">
          <svg viewBox="0 0 72 16" fill="none">
            <path d="M4 8h20M48 8h20" stroke="currentColor" stroke-width="1.2" />
            <path d="M36 2l2.2 4.4 4.8.6-3.6 3.4.9 4.6L36 12.8 31.7 15l.9-4.6L29 7l4.8-.6L36 2z" fill="currentColor" />
          </svg>
        </div>
        <p class="date">{{ dateLine }}</p>
        <p class="venue">{{ venueLine }}</p>
      </div>
      <div class="hero-aside">
        <div v-if="ended" class="count count-ended" aria-label="האירוע התחיל">
          <p class="ended-title">האירוע התחיל</p>
          <p class="ended-sub">תודה שהייתם איתנו</p>
        </div>
        <div v-else class="count" aria-label="ספירה לאחור">
          <div class="cell"><span class="n">{{ pad(parts.days) }}</span><span class="l">ימים</span></div>
          <div class="count-sep" aria-hidden="true" />
          <div class="cell"><span class="n">{{ pad(parts.hours) }}</span><span class="l">שעות</span></div>
          <div class="count-sep" aria-hidden="true" />
          <div class="cell"><span class="n">{{ pad(parts.mins) }}</span><span class="l">דקות</span></div>
          <div class="count-sep" aria-hidden="true" />
          <div class="cell"><span class="n">{{ pad(parts.secs) }}</span><span class="l">שניות</span></div>
        </div>
        <div class="cta-row">
          <button v-if="canUpload" type="button" class="btn btn-primary" @click="onUpload">העלו תמונות</button>
          <a class="btn btn-ghost" href="#sec-join" @click.prevent="scrollJoin">איך זה עובד</a>
        </div>
        <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
      </div>
    </template>
    <div v-else class="inner">
      <div class="kicker">{{ data.kicker }}</div>
      <h1 :class="['enames', isShort && 'is-short']">{{ data.title }}</h1>
      <div class="ornament svg" aria-hidden="true">
        <svg viewBox="0 0 72 16" fill="none">
          <path d="M4 8h20M48 8h20" stroke="currentColor" stroke-width="1.2" />
          <path d="M36 2l2.2 4.4 4.8.6-3.6 3.4.9 4.6L36 12.8 31.7 15l.9-4.6L29 7l4.8-.6L36 2z" fill="currentColor" />
        </svg>
      </div>
      <p class="date">{{ dateLine }}</p>
      <p class="venue">{{ venueLine }}</p>
      <div class="hero-aside">
        <div v-if="ended" class="count count-ended" aria-label="האירוע התחיל">
          <p class="ended-title">האירוע התחיל</p>
          <p class="ended-sub">תודה שהייתם איתנו</p>
        </div>
        <div v-else class="count" aria-label="ספירה לאחור">
          <div class="cell"><span class="n">{{ pad(parts.days) }}</span><span class="l">ימים</span></div>
          <div class="count-sep" aria-hidden="true" />
          <div class="cell"><span class="n">{{ pad(parts.hours) }}</span><span class="l">שעות</span></div>
          <div class="count-sep" aria-hidden="true" />
          <div class="cell"><span class="n">{{ pad(parts.mins) }}</span><span class="l">דקות</span></div>
          <div class="count-sep" aria-hidden="true" />
          <div class="cell"><span class="n">{{ pad(parts.secs) }}</span><span class="l">שניות</span></div>
        </div>
        <div class="cta-row">
          <button v-if="canUpload" type="button" class="btn btn-primary" @click="onUpload">העלו תמונות</button>
          <a class="btn btn-ghost" href="#sec-join" @click.prevent="scrollJoin">איך זה עובד</a>
        </div>
        <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, reactive, ref } from "vue";
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
    const canUpload = computed(() => preview.value || Boolean(ctx?.eventMeta?.upload_url));
    const parts = reactive({ days: 0, hours: 0, mins: 0, secs: 0 });
    const ended = ref(false);
    let timer: ReturnType<typeof setInterval> | null = null;

    const isShort = computed(
      () => String(props.data.title || "").replace(/\s/g, "").length <= 6
    );
    const dateLine = computed(() => {
      const d = props.data.date_he || "";
      const t = props.data.time_he || "";
      return t ? `${d} · ${t}` : d;
    });
    const venueLine = computed(() =>
      [props.data.venue, props.data.city].filter(Boolean).join(", ")
    );
    const heroClass = computed(() =>
      props.heroStyle === "cinema" ? "hero-cinema" : "hero-stage"
    );

    function pad(n: number) {
      return String(Math.max(0, n)).padStart(2, "0");
    }

    function tick() {
      if (ctx?.shot) {
        ended.value = false;
        Object.assign(parts, FROZEN);
        return;
      }
      const raw = String(props.data.event_date || "");
      const target = new Date(raw).getTime();
      if (!raw || Number.isNaN(target)) {
        ended.value = false;
        Object.assign(parts, { days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      const diffMs = target - Date.now();
      if (diffMs <= 0) {
        ended.value = true;
        Object.assign(parts, { days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      ended.value = false;
      const secs = Math.floor(diffMs / 1000);
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
      document.getElementById("sec-join")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    onMounted(() => {
      tick();
      if (!ctx?.shot) timer = setInterval(tick, 1000);
    });
    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    return {
      parts,
      pad,
      isShort,
      dateLine,
      venueLine,
      heroClass,
      preview,
      canUpload,
      ended,
      onUpload,
      scrollJoin,
    };
  },
});
</script>

<style scoped>
.count-ended {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 4px;
}
.ended-title {
  margin: 0;
  font-weight: 800;
  font-size: 1.15rem;
}
.ended-sub {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95rem;
}
</style>
