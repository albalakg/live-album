<template>
  <div class="event-panel" id="event-panel">
    <div class="event-chips" role="tablist" aria-label="סוגי אירועים">
      <button
        v-for="item in events"
        :key="item.id"
        class="chip"
        type="button"
        role="tab"
        :aria-pressed="item.id === current ? 'true' : 'false'"
        @click="select(item.id)"
      >
        {{ item.chip }}
      </button>
    </div>
    <div class="event-body">
      <div class="event-copy">
        <p class="sec-kicker">{{ active.kicker }}</p>
        <h3>{{ active.title }}</h3>
        <p>{{ active.body }}</p>
      </div>
      <div class="event-visual">
        <div class="mood-frame">
          <img :src="src(active.img)" :alt="active.alt" />
        </div>
        <div class="mood-label">{{ active.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{ assetBase?: string }>(),
  { assetBase: "/media" }
);

const events = [
  {
    id: "wedding",
    chip: "חתונה",
    kicker: "לחתונה",
    title: "כל שולחן מצלם. כל הרחבה רואה.",
    body: "האורחים סורקים QR ומעלים רגעים מהחתונה — והם מופיעים על המסך באולם בזמן אמת. ככה נוצרת אווירה משותפת, וכל המזכרות מתאספות לאלבום אחד.",
    label: "המסך החי מעל הרחבה — כולם חלק מהחגיגה",
    img: "photo-night.jpg",
    alt: "עמית וגל בערב החתונה",
  },
  {
    id: "barmitzvah",
    chip: "בר / בת מצווה",
    kicker: "לבר מצווה ולבת מצווה",
    title: "כל המשפחה מצלמת, וכל הרגעים על המסך.",
    body: "מהעלייה לתורה ועד לריקודים — האורחים מעלים מהטלפון, בלי אפליקציה, והאלבום החי מרכיב את הערב כולו למזכרת אחת.",
    label: "המשפחה כולה באלבום אחד, בזמן אמת",
    img: "album-01.jpg",
    alt: "רגע שמחה בגן",
  },
  {
    id: "birthday",
    chip: "יום הולדת",
    kicker: "ליום הולדת",
    title: "יום ההולדת שכולם משתתפים בו.",
    body: "חברים מצלמים, מעלים, ורואים את עצמם על המסך. האווירה עולה — ובסוף נשאר אלבום חי של כל המסיבה.",
    label: "המסיבה עולה על המסך, והחברים עולים איתה",
    img: "album-10.jpg",
    alt: "אורחים במסיבה",
  },
  {
    id: "brit",
    chip: "ברית ובריתה",
    kicker: "לברית ולבריתה",
    title: "הרגעים הקטנים, במקום אחד לכל המשפחה.",
    body: "אורחים מכל הגילים סורקים QR ומעלים תמונות. המשפחה מקבלת אלבום חי של היום, ואפשר להקרין אותו במקום.",
    label: "מזכרת משפחתית שנבנית תוך כדי האירוע",
    img: "album-21.jpg",
    alt: "אווירת אירוע באולם",
  },
  {
    id: "corporate",
    chip: "אירוע חברה",
    kicker: "לאירוע חברה",
    title: "האירוע העסקי הופך לחוויה משותפת.",
    body: "הצוות והאורחים מעלים תמונות מהערב — והן מופיעות על המסך באולם. חיבור טבעי, בלי אפליקציה ובלי הרשמה לאורחים.",
    label: "מסך חי שמשאיר את הערב אצל כולם",
    img: "album-23.jpg",
    alt: "קבוצת אורחים באירוע",
  },
  {
    id: "party",
    chip: "מסיבה",
    kicker: "למסיבה",
    title: "המסיבה עולה על המסך — והאווירה עולה איתה.",
    body: "QR על השולחן, העלאה מהטלפון, ותמונות רצות על המסך. ככה כולם נהיים חלק מהחגיגה, והמזכרות נשארות אחריה.",
    label: "רגעים שצולמו עכשיו, כבר על המסך",
    img: "album-22.jpg",
    alt: "אווירת מסיבה",
  },
  {
    id: "festival",
    chip: "פסטיבל",
    kicker: "לפסטיבל",
    title: "כל הקהל מצלם. כל הבמה חיה.",
    body: "קהל גדול, הרבה טלפונים, אלבום אחד. האורחים סורקים ומעלים — והמסך החי מחזיר להם את האווירה בזמן אמת.",
    label: "האלבום החי של כל הקהל, על המסך",
    img: "album-24.jpg",
    alt: "אולם מוכן לאירוע",
  },
];

const current = ref("wedding");
const active = computed(
  () => events.find((item) => item.id === current.value) || events[0]
);

function src(file: string) {
  return `${props.assetBase}/${file}`;
}

function select(id: string) {
  current.value = id;
  if (typeof document !== "undefined") {
    document.body.setAttribute("data-event", id);
  }
}

onMounted(() => select(current.value));
</script>
