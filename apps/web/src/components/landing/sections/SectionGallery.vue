<template>
  <section
    ref="rootEl"
    :id="'sec-' + sectionId"
    :class="['block', 'wide', 'gal-sec', alt && 'alt', isWide && 'gal-bento']"
  >
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:22px">{{ data.note }}</p>

      <div
        v-if="style === 'carousel'"
        class="g-carousel"
        :class="{ 'gal-bento-grid': isWide }"
        :data-count="isWide ? images.length : undefined"
        tabindex="0"
        v-drag-scroll="!isWide"
      >
        <figure
          v-for="(im, i) in images"
          :key="i"
          class="g-item"
          role="button"
          tabindex="0"
          @click="open(i)"
          @keydown.enter.prevent="open(i)"
        >
          <img :src="im.thumb" :alt="im.alt" loading="lazy" draggable="false" />
          <figcaption><span class="ex-tag">דוגמה</span>{{ im.alt }}</figcaption>
        </figure>
      </div>
      <div
        v-else-if="style === 'filmstrip'"
        class="g-film"
        :class="{ 'gal-bento-grid': isWide }"
        :data-count="isWide ? images.length : undefined"
        v-drag-scroll="!isWide"
      >
        <figure
          v-for="(im, i) in images"
          :key="i"
          class="g-item"
          role="button"
          tabindex="0"
          @click="open(i)"
          @keydown.enter.prevent="open(i)"
        >
          <img :src="im.thumb" :alt="im.alt" loading="lazy" draggable="false" />
          <figcaption><span class="ex-tag">דוגמה</span>{{ im.alt }}</figcaption>
        </figure>
      </div>
      <div
        v-else-if="style === 'grid'"
        class="g-grid"
        :class="{ 'gal-bento-grid': isWide }"
        :data-count="isWide ? images.length : undefined"
      >
        <figure
          v-for="(im, i) in images"
          :key="i"
          class="g-item"
          role="button"
          tabindex="0"
          @click="open(i)"
          @keydown.enter.prevent="open(i)"
        >
          <img :src="im.thumb" :alt="im.alt" loading="lazy" draggable="false" />
          <figcaption><span class="ex-tag">דוגמה</span>{{ im.alt }}</figcaption>
        </figure>
      </div>
      <div
        v-else
        class="g-masonry"
        :class="{ 'gal-bento-grid': isWide }"
        :data-count="isWide ? images.length : undefined"
      >
        <figure
          v-for="(im, i) in images"
          :key="i"
          class="g-item"
          role="button"
          tabindex="0"
          @click="open(i)"
          @keydown.enter.prevent="open(i)"
        >
          <img :src="im.thumb" :alt="im.alt" loading="lazy" draggable="false" />
          <figcaption><span class="ex-tag">דוגמה</span>{{ im.alt }}</figcaption>
        </figure>
      </div>
    </div>

    <div
      v-if="lbIndex !== null"
      class="overlay center"
      role="dialog"
      aria-modal="true"
      aria-label="תמונה מוגדלת"
      @click.self="close"
    >
      <button type="button" class="sheet-x lb-x" aria-label="סגירה" @click="close">×</button>
      <button type="button" class="lb-nav lb-prev" aria-label="הקודמת" @click.stop="prev">‹</button>
      <figure class="lb-fig" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <img class="lb-img" :src="images[lbIndex].url" :alt="images[lbIndex].alt" />
        <figcaption>{{ images[lbIndex].alt }}</figcaption>
      </figure>
      <button type="button" class="lb-nav lb-next" aria-label="הבאה" @click.stop="next">›</button>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { useLandingImage } from "../useLandingImage";
import dragScroll from "@/directives/dragScroll";
import "../galleryBento.css";

const WIDE_MIN = 768;
const MAX_IMAGES = 12;

export default defineComponent({
  name: "LandingGallery",
  directives: { dragScroll },
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const { resolve } = useLandingImage();
    const lbIndex = ref<number | null>(null);
    const rootEl = ref<HTMLElement | null>(null);
    const isWide = ref(false);
    let touchX = 0;
    let ro: ResizeObserver | null = null;

    const style = computed(() => String(props.data.style || "masonry"));
    const images = computed(() =>
      (props.data.images || [])
        .map((im: { image?: unknown; caption?: string }) => {
          const img = resolve(im.image as never, im.caption || "תמונה מהאירוע");
          if (!img) return null;
          const alt = im.caption || img.alt || "תמונה מהאירוע";
          return {
            url: img.url,
            thumb: img.thumb_url || img.url,
            alt,
          };
        })
        .filter(Boolean)
        .slice(0, MAX_IMAGES) as Array<{ url: string; thumb: string; alt: string }>
    );

    function measureWide() {
      const w = rootEl.value?.clientWidth ?? 0;
      isWide.value = w >= WIDE_MIN;
    }

    function open(i: number) {
      lbIndex.value = i;
    }
    function close() {
      lbIndex.value = null;
    }
    function next() {
      if (lbIndex.value === null || !images.value.length) return;
      lbIndex.value = (lbIndex.value + 1) % images.value.length;
    }
    function prev() {
      if (lbIndex.value === null || !images.value.length) return;
      lbIndex.value = (lbIndex.value - 1 + images.value.length) % images.value.length;
    }
    function onKey(e: KeyboardEvent) {
      if (lbIndex.value === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") next(); // RTL: left = next
      if (e.key === "ArrowRight") prev();
    }
    function onTouchStart(e: TouchEvent) {
      touchX = e.changedTouches[0]?.clientX || 0;
    }
    function onTouchEnd(e: TouchEvent) {
      const x = e.changedTouches[0]?.clientX || 0;
      const dx = x - touchX;
      if (Math.abs(dx) < 40) return;
      if (dx > 0) prev();
      else next();
    }

    onMounted(() => {
      window.addEventListener("keydown", onKey);
      measureWide();
      if (typeof ResizeObserver !== "undefined" && rootEl.value) {
        ro = new ResizeObserver(() => measureWide());
        ro.observe(rootEl.value);
      }
    });
    onBeforeUnmount(() => {
      window.removeEventListener("keydown", onKey);
      ro?.disconnect();
      ro = null;
    });

    return { style, images, lbIndex, open, close, next, prev, onTouchStart, onTouchEnd, rootEl, isWide };
  },
});
</script>

<style scoped>
.lb-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 90;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: rgba(18, 16, 14, 0.55);
  color: #fff;
  font-size: 1.8rem;
  line-height: 1;
}
.lb-prev { inset-inline-start: 12px; }
.lb-next { inset-inline-end: 12px; }
</style>
