<template>
  <section id="how">
    <div class="wrap">
      <div class="how-head">
        <div>
          <p class="sec-kicker reveal">איך זה עובד</p>
          <h2 class="sec-title reveal">שלושה צעדים,<br />והאירוע כבר חי.</h2>
          <p class="sec-sub reveal">לחצו על שלב, או הפעילו את ההדגמה — מסריקה ועד למסך הגדול.</p>
        </div>
      </div>

      <div class="steps" role="tablist" aria-label="שלושת השלבים">
        <button
          v-for="item in steps"
          :key="item.id"
          class="step-btn"
          :class="{ active: step === item.id }"
          type="button"
          role="tab"
          :aria-selected="step === item.id ? 'true' : 'false'"
          @click="choose(item.id)"
        >
          <div class="num">{{ item.num }}</div>
          <div class="lbl">{{ item.label }}</div>
        </button>
      </div>

      <div class="demo-stage" :data-step="step" aria-live="polite">
        <div class="demo-col" :class="{ on: step === 1, visible: colVisible(1) }" data-col="1">
          <h4>כרטיס QR על השולחן</h4>
          <div class="qr-card-wrap">
            <img :src="src('qr-card.jpg')" alt="כרטיס QR מעוצב של SnapShare עם הטקסט: סרקו, צלמו ותעלו, בואו נחגוג ביחד" />
          </div>
        </div>
        <div class="arrow" aria-hidden="true"></div>
        <div class="demo-col" :class="{ on: step === 2, visible: colVisible(2) }" data-col="2">
          <h4>הטלפון של האורח</h4>
          <div class="phone">
            <div class="notch"></div>
            <div class="screen">
              <img :src="phoneSrc" alt="" />
              <div class="scan-frame"></div>
              <div class="scan-line"></div>
              <div class="flash" :class="{ go: flashOn }"></div>
              <div class="phone-badge" :class="{ show: badgeOn }">{{ badge }}</div>
            </div>
          </div>
        </div>
        <div class="arrow" aria-hidden="true"></div>
        <div class="demo-col" :class="{ on: step === 3, visible: colVisible(3) }" data-col="3">
          <h4>המסך באולם</h4>
          <div class="mini-tv">
            <div class="tv-bar">
              <span class="live-pill"><i></i> LIVE</span>
              <span>האלבום החי</span>
            </div>
            <div class="tv-grid">
              <figure :class="{ in: tvIn[0] }"><img :src="tvFirst" alt="" /></figure>
              <figure :class="{ in: tvIn[1] }"><img :src="src('album-11.jpg')" alt="" /></figure>
              <figure :class="{ in: tvIn[2] }"><img :src="src('album-23.jpg')" alt="" /></figure>
            </div>
          </div>
        </div>
      </div>
      <div class="demo-controls">
        <button class="play-demo" type="button" @click="play">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          {{ playLabel }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(defineProps<{ assetBase?: string }>(), { assetBase: "/media" });

const steps = [
  { id: 1, num: "שלב 01", label: "סורקים את ה-QR" },
  { id: 2, num: "שלב 02", label: "מצלמים ומעלים" },
  { id: 3, num: "שלב 03", label: "מופיע על המסך" },
];

const step = ref(1);
const narrow = ref(false);
const phoneSrc = ref("");
const badge = ref("נסרק ✓");
const badgeOn = ref(false);
const flashOn = ref(false);
const tvIn = ref([false, false, false]);
const tvFirst = ref("");
const playLabel = ref("הפעילו את ההדגמה");
const playing = ref(false);
const preventAuto = ref(false);
let timers: number[] = [];
let observer: IntersectionObserver | null = null;

function src(file: string) {
  return `${props.assetBase}/${file}`;
}

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearTimers() {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
}

function later(fn: () => void, ms: number) {
  timers.push(window.setTimeout(fn, ms));
}

function colVisible(n: number) {
  if (!narrow.value) return true;
  if (n === step.value) return true;
  if (step.value < 3 && n === 2) return true;
  if (step.value === 3 && n === 3) return true;
  if (step.value === 1 && n === 1) return true;
  return false;
}

function applyStep(next: number, fromPlay: boolean) {
  step.value = next;
  badgeOn.value = false;
  flashOn.value = false;
  if (next === 1) {
    phoneSrc.value = src("qr-card.jpg");
    badge.value = "נסרק ✓";
    if (fromPlay) later(() => { badgeOn.value = true; }, 1800);
  } else if (next === 2) {
    phoneSrc.value = src("upload-phone.jpg");
    badge.value = "הועלה ✓";
    if (fromPlay) {
      later(() => {
        flashOn.value = true;
        badgeOn.value = true;
      }, 900);
    } else {
      badgeOn.value = true;
    }
  } else {
    phoneSrc.value = src("photo-night.jpg");
    badge.value = "על המסך ✓";
    badgeOn.value = true;
    tvIn.value = [false, false, false];
    const mark = (index: number) => {
      const copy = tvIn.value.slice();
      copy[index] = true;
      tvIn.value = copy;
    };
    if (fromPlay) {
      [0, 1, 2].forEach((index) => later(() => mark(index), 300 + index * 280));
      later(() => { tvFirst.value = src("photo-night.jpg"); }, 350);
    } else {
      tvIn.value = [true, true, true];
    }
  }
}

function choose(next: number) {
  clearTimers();
  playing.value = false;
  preventAuto.value = true;
  playLabel.value = "הפעילו את ההדגמה";
  applyStep(next, false);
}

function play() {
  preventAuto.value = false;
  clearTimers();
  playing.value = true;
  playLabel.value = "ההדגמה פועלת…";
  tvFirst.value = src("photo-lounge.jpg");
  applyStep(1, true);
  later(() => applyStep(2, true), 2800);
  later(() => applyStep(3, true), 5600);
  later(() => {
    playing.value = false;
    playLabel.value = "הפעילו שוב";
  }, 8500);
}

function onResize() {
  narrow.value = window.innerWidth <= 980;
}

onMounted(() => {
  phoneSrc.value = src("qr-card.jpg");
  tvFirst.value = src("photo-lounge.jpg");
  onResize();
  window.addEventListener("resize", onResize);
  applyStep(1, false);
  const stage = document.querySelector("#how .demo-stage");
  if (!stage || prefersReduced() || !("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !playing.value && !preventAuto.value) {
        play();
        observer?.disconnect();
      }
    });
  }, { threshold: 0.45 });
  observer.observe(stage);
});

onUnmounted(() => {
  clearTimers();
  window.removeEventListener("resize", onResize);
  observer?.disconnect();
});
</script>
