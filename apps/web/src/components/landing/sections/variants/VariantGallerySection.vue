<template>
  <SectionGallery v-if="variant === 'legacy'" :data="data" :section-id="sectionId" :alt="alt" />
  <section
    v-else
    ref="rootEl"
    :id="'sec-' + sectionId"
    class="block wide vx-sec vx-gal"
    :class="['vx-gal--' + variant, alt && 'alt', isWide && 'is-wide']"
    :data-variant="variant"
  >
    <div class="wrap">
      <header class="vx-head">
        <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
        <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
        <p v-if="data.note" class="media-note">{{ data.note }}</p>
      </header>

      <div class="vg-track" :class="{ 'is-static': isWide }" tabindex="0" v-drag-scroll="!isWide">
        <!-- honeycomb: rows of 4 + 3 (max 7 photos, then a +N tile to the live album) -->
        <div v-if="variant === 'honey'" class="vg-honey">
          <div
            v-for="(row, ri) in honeyRows"
            :key="ri"
            class="vg-hrow"
            :class="{ off: ri > 0, 'sh-a': ri === 0 && honeyShift, 'sh-b': ri > 0 && honeyShift }"
          >
            <template v-for="t in row" :key="t.key">
              <button
                v-if="t.more"
                type="button"
                class="vg-hx vg-more"
                :aria-label="`עוד ${t.more} תמונות באלבום החי`"
                @click="openMore"
              >
                <span class="vg-more-n" dir="ltr">+{{ t.more }}</span>
                <span class="vg-more-l">לאלבום החי</span>
              </button>
              <figure
                v-else
                class="vg-hx"
                role="button"
                tabindex="0"
                :aria-label="t.img.alt || 'פתיחת תמונה'"
                @click="open(t.index)"
                @keydown.enter.prevent="open(t.index)"
              >
                <img :src="t.img.thumb" :alt="t.img.alt" loading="lazy" draggable="false" />
                <span v-if="t.img.isSample" class="ex-tag vg-tag">דוגמה</span>
              </figure>
            </template>
          </div>
        </div>

        <!-- bento: 4-column mosaic with a few large tiles -->
        <div v-else-if="variant === 'bento'" class="vg-bento">
          <figure
            v-for="(im, i) in images"
            :key="i"
            class="vg-bt"
            :class="'bt' + i"
            role="button"
            tabindex="0"
            :aria-label="im.alt || 'פתיחת תמונה'"
            @click="open(i)"
            @keydown.enter.prevent="open(i)"
          >
            <img :src="im.thumb" :alt="im.alt" loading="lazy" draggable="false" />
            <span v-if="im.isSample" class="ex-tag vg-tag">דוגמה</span>
          </figure>
        </div>

        <!-- polaroid: tilted prints with a handwritten caption -->
        <div v-else class="vg-pola">
          <figure
            v-for="(im, i) in images"
            :key="i"
            class="vg-pl"
            role="button"
            tabindex="0"
            :aria-label="im.alt || 'פתיחת תמונה'"
            @click="open(i)"
            @keydown.enter.prevent="open(i)"
          >
            <span class="vg-pl-img">
              <img :src="im.thumb" :alt="im.alt" loading="lazy" draggable="false" />
              <span v-if="im.isSample" class="ex-tag vg-tag">דוגמה</span>
            </span>
            <figcaption>{{ im.caption }}</figcaption>
          </figure>
        </div>
      </div>
      <p v-if="!isWide && images.length > 1" class="vg-hint"><VariantIcon name="chev" />גוררים הצידה לעוד תמונות</p>
    </div>

    <div
      v-if="lbIndex !== null && images[lbIndex]"
      class="overlay center on"
      role="dialog"
      aria-modal="true"
      aria-label="תמונה מוגדלת"
      @click.self="close"
    >
      <button type="button" class="sheet-x lb-x" aria-label="סגירה" @click="close">×</button>
      <button type="button" class="vg-lb-nav vg-lb-prev" aria-label="הקודמת" @click.stop="prev">‹</button>
      <figure class="lb-fig" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <img class="lb-img" :src="images[lbIndex].url" :alt="images[lbIndex].alt" />
        <figcaption v-if="images[lbIndex].caption">{{ images[lbIndex].caption }}</figcaption>
      </figure>
      <button type="button" class="vg-lb-nav vg-lb-next" aria-label="הבאה" @click.stop="next">›</button>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import SectionGallery from "../SectionGallery.vue";
import { useLandingImage } from "../../useLandingImage";
import { accessibleAlt, isStockImageRef, visibleCaption } from "../../sampleCaption";
import dragScroll from "@/directives/dragScroll";
import { isDragScrollClick } from "@/composables/useDragScroll";
import VariantIcon from "./VariantIcon.vue";
import { ensureGen2Fonts, useVariantBlock, useWideSection } from "./useVariantBlock";
import "./variantSections.css";

const MAX_IMAGES = 12;
/** Honeycomb shows at most this many photos; the rest become a "+N" tile to the live album. */
const HONEY_MAX = 7;

type GalImage = { url: string; thumb: string; alt: string; caption: string; isSample: boolean };
type HoneyTile = { key: string; index: number; img: GalImage; more: number };

/**
 * GALLERY for gen-2 templates: honey / bento / polaroid.
 * Desktop (section ≥ 768px): static grid, no scrolling. Mobile: draggable carousel.
 * Old templates (variant "legacy") render the original SectionGallery (data.style keeps working).
 */
export default defineComponent({
  name: "VariantGallerySection",
  components: { SectionGallery, VariantIcon },
  directives: { dragScroll },
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const { ctx, templateId, variant, preview } = useVariantBlock("GALLERY", () => props.data);
    const { resolve } = useLandingImage();
    const rootEl = ref<HTMLElement | null>(null);
    const { isWide } = useWideSection(rootEl);
    const lbIndex = ref<number | null>(null);
    let touchX = 0;

    watch(
      () => (variant.value === "legacy" ? "" : templateId.value),
      (id) => id && ensureGen2Fonts(id),
      { immediate: true }
    );

    const images = computed(
      () =>
        ((props.data.images || []) as Array<{ image?: unknown; caption?: string }>)
          .map((im) => {
            const img = resolve(im.image as never, im.caption || "");
            if (!img) return null;
            const isSample = isStockImageRef(im.image);
            return {
              url: img.url,
              thumb: img.thumb_url || img.url,
              alt: accessibleAlt(im.caption, img.alt, isSample),
              caption: visibleCaption(im.caption, img.alt, isSample),
              isSample,
            };
          })
          .filter(Boolean)
          .slice(0, MAX_IMAGES) as GalImage[]
    );

    const honeyRows = computed(() => {
      const list = images.value;
      const shown = list.slice(0, HONEY_MAX);
      const tiles: HoneyTile[] = shown.map((img, index) => ({ key: "i" + index, index, img, more: 0 }));
      const extra = list.length - shown.length;
      if (extra > 0) tiles.push({ key: "more", index: -1, img: shown[0], more: extra });
      return [tiles.slice(0, 4), tiles.slice(4)].filter((r) => r.length);
    });

    /** 4 + 4 rows (7 photos + the +N tile): offset both rows by a quarter cell so they interlock, centred. */
    const honeyShift = computed(() => honeyRows.value.length > 1 && honeyRows.value[1].length === honeyRows.value[0].length);

    function open(i: number) {
      if (isDragScrollClick()) return;
      lbIndex.value = i;
    }
    function openMore() {
      if (isDragScrollClick()) return;
      if (preview.value) {
        ctx?.toast("בתצוגה מקדימה");
        return;
      }
      ctx?.openAlbum();
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
      const dx = (e.changedTouches[0]?.clientX || 0) - touchX;
      if (Math.abs(dx) < 40) return;
      if (dx > 0) prev();
      else next();
    }
    onMounted(() => window.addEventListener("keydown", onKey));
    onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

    return { variant, rootEl, isWide, images, honeyRows, honeyShift, lbIndex, open, openMore, close, next, prev, onTouchStart, onTouchEnd };
  },
});
</script>
