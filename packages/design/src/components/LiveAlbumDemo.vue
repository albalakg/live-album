<template>
  <section id="album">
    <div class="wrap">
      <p class="sec-kicker reveal">האלבום החי</p>
      <h2 class="sec-title reveal">האלבום שנבנה תוך כדי החגיגה.</h2>
      <p class="sec-sub reveal">
        כל העלאה מופיעה בזמן אמת. כאן זו הדמיה עם תמונות אמיתיות מאלבום החתונה של עמית וגל — תראו איך תמונות חדשות קופצות פנימה.
      </p>
      <div class="album-frame reveal">
        <div class="album-top">
          <h3>החתונה של עמית וגל</h3>
          <div class="meta">
            <span class="live-pill" style="background:#111;"><i></i> LIVE</span>
            <span>{{ shown.length }} תמונות</span>
          </div>
        </div>
        <div ref="gridEl" class="album-grid" aria-live="polite">
          <figure
            v-for="photo in shown"
            :key="photo.src"
            :class="{ tall: photo.tall, wide: photo.wide, show: photo.show, seeded: photo.seeded }"
          >
            <img :src="src(photo.file)" :alt="photo.alt" loading="lazy" />
            <span v-if="photo.isNew" class="now">חדש</span>
          </figure>
        </div>
        <div class="guest-lead">
          <p>
            רוצים אלבום כזה לאירוע שלכם?
            <span>ניסיון חינם, בלי כרטיס אשראי. תשלום אחד לאירוע, בלי מנוי.</span>
          </p>
          <a class="btn btn-primary" :href="orderHref">נסו בחינם</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(defineProps<{ assetBase?: string; orderHref?: string }>(), {
  assetBase: "/media",
  orderHref: "/order",
});

type Photo = {
  file: string;
  alt: string;
  tall?: boolean;
  wide?: boolean;
  show: boolean;
  seeded?: boolean;
  isNew?: boolean;
};

const catalog = [
  { file: "photo-night.jpg", alt: "עמית וגל בסלפי בערב החתונה", wide: true, tall: true },
  { file: "photo-lounge.jpg", alt: "עמית וגל בסלפי על הדשא", tall: true },
  { file: "album-02.jpg", alt: "נשיקה בשקיעה" },
  { file: "album-11.jpg", alt: "סלפי של אורחים" },
  { file: "photo-hat.jpg", alt: "עמית וגל ביום שמשי", tall: true },
  { file: "album-22.jpg", alt: "אורחת בשמלה אדומה", wide: true },
  { file: "album-10.jpg", alt: "אורחים במסיבה" },
  { file: "album-11.jpg", alt: "סלפי של אורחים" },
  { file: "album-13.jpg", alt: "רגעים ליד החופה" },
  { file: "album-00.jpg", alt: "אורח יושב בספסל בגן" },
  { file: "album-20.jpg", alt: "אורח בין צמחים" },
  { file: "album-21.jpg", alt: "רחבת האירוע" },
  { file: "album-22.jpg", alt: "אורחת בשמלה אדומה" },
  { file: "album-23.jpg", alt: "קבוצת חברים באירוע", wide: true },
  { file: "album-24.jpg", alt: "האולם לפני הריקודים" },
  { file: "album-03.jpg", alt: "זוג מצטלם בטיול" },
  { file: "album-04.jpg", alt: "כרטיס Save the Date מהאלבום" },
];

const shown = ref<Photo[]>(
  catalog.slice(0, 5).map((photo) => ({ ...photo, show: true, seeded: true }))
);
const gridEl = ref<HTMLElement | null>(null);
let started = false;
let timer = 0;
let observer: IntersectionObserver | null = null;

function src(file: string) {
  return `${props.assetBase}/${file}`;
}

function addNext(isNew: boolean) {
  const next = catalog[shown.value.length];
  if (!next) return;
  shown.value = [...shown.value, { ...next, show: false, isNew }];
  requestAnimationFrame(() => {
    const copy = shown.value.slice();
    const last = copy[copy.length - 1];
    if (last) last.show = true;
    shown.value = copy;
  });
  if (isNew) {
    window.setTimeout(() => {
      const copy = shown.value.slice();
      const match = copy.find((photo) => photo.file === next.file);
      if (match) match.isNew = false;
      shown.value = copy;
    }, 4200);
  }
}

function start() {
  if (started) return;
  started = true;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    while (shown.value.length < catalog.length) addNext(false);
    return;
  }
  const tick = () => {
    if (shown.value.length >= catalog.length) return;
    addNext(true);
    if (shown.value.length < catalog.length) {
      timer = window.setTimeout(tick, 1500);
    }
  };
  timer = window.setTimeout(tick, 800);
}

onMounted(() => {
  const el = gridEl.value;
  if (!el || !("IntersectionObserver" in window)) {
    start();
    return;
  }
  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      start();
      observer?.disconnect();
    }
  }, { threshold: 0.12 });
  observer.observe(el);
  window.setTimeout(() => {
    if (el.getBoundingClientRect().top < window.innerHeight * 1.4) start();
  }, 600);
});

onUnmounted(() => {
  window.clearTimeout(timer);
  observer?.disconnect();
});
</script>
