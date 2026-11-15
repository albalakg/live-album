<template>
  <section :id="'sec-' + sectionId" :class="['block', 'wide', 'gal-sec', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:22px">{{ data.note }}</p>

      <div v-if="style === 'carousel'" class="g-carousel" tabindex="0">
        <figure
          v-for="(im, i) in images"
          :key="i"
          class="g-item"
          role="button"
          tabindex="0"
          @click="open(i)"
          @keydown.enter.prevent="open(i)"
        >
          <img :src="im.url" :alt="im.alt" loading="lazy" />
          <figcaption><span class="ex-tag">דוגמה</span>{{ im.alt }}</figcaption>
        </figure>
      </div>
      <div v-else-if="style === 'filmstrip'" class="g-film">
        <figure
          v-for="(im, i) in images"
          :key="i"
          class="g-item"
          role="button"
          tabindex="0"
          @click="open(i)"
          @keydown.enter.prevent="open(i)"
        >
          <img :src="im.url" :alt="im.alt" loading="lazy" />
          <figcaption><span class="ex-tag">דוגמה</span>{{ im.alt }}</figcaption>
        </figure>
      </div>
      <div v-else-if="style === 'grid'" class="g-grid">
        <figure
          v-for="(im, i) in images"
          :key="i"
          class="g-item"
          role="button"
          tabindex="0"
          @click="open(i)"
          @keydown.enter.prevent="open(i)"
        >
          <img :src="im.url" :alt="im.alt" loading="lazy" />
          <figcaption><span class="ex-tag">דוגמה</span>{{ im.alt }}</figcaption>
        </figure>
      </div>
      <div v-else class="g-masonry">
        <figure
          v-for="(im, i) in images"
          :key="i"
          class="g-item"
          role="button"
          tabindex="0"
          @click="open(i)"
          @keydown.enter.prevent="open(i)"
        >
          <img :src="im.url" :alt="im.alt" loading="lazy" />
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

export default defineComponent({
  name: "LandingGallery",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const { resolve } = useLandingImage();
    const lbIndex = ref<number | null>(null);
    let touchX = 0;

    const style = computed(() => String(props.data.style || "masonry"));
    const images = computed(() =>
      (props.data.images || [])
        .map((im: { image?: unknown; caption?: string }) => {
          const img = resolve(im.image as never, im.caption || "");
          if (!img) return null;
          return { url: img.url, alt: im.caption || img.alt || "תמונה לדוגמה" };
        })
        .filter(Boolean) as Array<{ url: string; alt: string }>
    );

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

    onMounted(() => window.addEventListener("keydown", onKey));
    onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

    return { style, images, lbIndex, open, close, next, prev, onTouchStart, onTouchEnd };
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
