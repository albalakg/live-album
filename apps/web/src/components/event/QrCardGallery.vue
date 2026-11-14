<template>
  <section class="qr-gallery">
    <div class="qr-filters">
      <div class="filter-row" data-filter="style">
        <span class="filter-label" id="qr-filter-style-label">סגנון</span>
        <div
          class="chips-fade"
          :class="{
            'fade-start': styleFade.start,
            'fade-end': styleFade.end,
          }"
        >
          <div
            ref="styleScroll"
            class="chips-scroll"
            role="radiogroup"
            aria-labelledby="qr-filter-style-label"
            @scroll="onStyleScroll"
          >
            <button
              type="button"
              class="chip"
              role="radio"
              :aria-checked="style === 'all'"
              :class="{ on: style === 'all' }"
              @click="style = 'all'"
            >
              כל הסגנונות
            </button>
            <button
              v-for="item in styles"
              :key="item.id"
              type="button"
              class="chip"
              role="radio"
              :aria-checked="style === item.id"
              :class="{ on: style === item.id }"
              @click="style = item.id"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="filter-row" data-filter="event">
        <span class="filter-label" id="qr-filter-event-label">סוג אירוע</span>
        <div
          class="chips-fade"
          :class="{
            'fade-start': eventFade.start,
            'fade-end': eventFade.end,
          }"
        >
          <div
            ref="eventScroll"
            class="chips-scroll"
            role="radiogroup"
            aria-labelledby="qr-filter-event-label"
            @scroll="onEventScroll"
          >
            <button
              type="button"
              class="chip"
              role="radio"
              :aria-checked="eventType === 'all'"
              :class="{ on: eventType === 'all' }"
              @click="eventType = 'all'"
            >
              כל האירועים
            </button>
            <button
              v-for="item in eventTypes"
              :key="item.id"
              type="button"
              class="chip"
              role="radio"
              :aria-checked="eventType === item.id"
              :class="{ on: eventType === item.id }"
              @click="eventType = item.id"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="qr-grid">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        class="qr-card"
        :class="{ on: selectable && selected === card.file }"
        @click="choose(card.file)"
      >
        <div class="qr-thumb">
          <img :src="`/assets/${card.file}`" :alt="card.label" />
          <QrCardFrame
            mini
            :event-name="eventName"
            :text-color="card.textColor || '#161310'"
            :show-tagline="!card.hideCta"
            tagline="סרקו והעלו תמונות"
          >
            <template #qr>
              <div class="mini-qr" :class="{ inv: card.inverted }">
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <rect width="64" height="64" fill="#fff" />
                  <path
                    :fill="card.qrColor || '#000000'"
                    d="M6 6h20v20H6zm6 6v8h8v-8zM38 6h20v20H38zm6 6v8h8v-8zM6 38h20v20H6zm6 6v8h8v-8zM38 38h6v6h-6zm10 0h10v6H48zm-10 10h6v10h-6zm10 4h10v6H48z"
                  />
                </svg>
              </div>
            </template>
          </QrCardFrame>
        </div>
        <h4>{{ card.label }}</h4>
        <p>{{ styleLabel(card.style) }}</p>
      </button>
    </div>
    <div v-if="cards.length === 0" class="empty">
      <h3>אין כרטיס בסנן הזה</h3>
      <p>נסו סגנון אחר או «כל האירועים».</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import QrCardFrame from "@/components/event/QrCardFrame.vue";
import {
  filterQrCards,
  QR_EVENT_TYPES,
  QR_STYLE_FILTERS,
  QR_STYLES,
  type QrCardDesign,
} from "@/helpers/qrCardCatalog";

type FadeState = { start: boolean; end: boolean };

function measureFade(el: HTMLElement | undefined | null): FadeState {
  if (!el) return { start: false, end: false };
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 2) return { start: false, end: false };
  const sl = el.scrollLeft;
  // Chromium RTL often uses negative scrollLeft; others keep 0…max.
  const fromStart = sl < 0 ? -sl : sl;
  const fromEnd = max - fromStart;
  return {
    start: fromStart > 2,
    end: fromEnd > 2,
  };
}

export default defineComponent({
  name: "QrCardGallery",
  components: { QrCardFrame },
  props: {
    selectable: { type: Boolean, default: false },
    selected: { type: String, default: "" },
    eventName: { type: String, default: "האירוע שלכם" },
  },
  emits: ["select"],
  data() {
    return {
      eventType: "all",
      style: "all",
      eventTypes: QR_EVENT_TYPES,
      styles: QR_STYLE_FILTERS,
      styleFade: { start: false, end: false } as FadeState,
      eventFade: { start: false, end: false } as FadeState,
      resizeObserver: null as ResizeObserver | null,
    };
  },
  computed: {
    cards(): QrCardDesign[] {
      return filterQrCards(this.style, this.eventType);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.refreshFades();
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => this.refreshFades());
        const styleEl = this.$refs.styleScroll as HTMLElement | undefined;
        const eventEl = this.$refs.eventScroll as HTMLElement | undefined;
        if (styleEl) {
          this.resizeObserver.observe(styleEl);
          if (styleEl.parentElement) this.resizeObserver.observe(styleEl.parentElement);
        }
        if (eventEl) {
          this.resizeObserver.observe(eventEl);
          if (eventEl.parentElement) this.resizeObserver.observe(eventEl.parentElement);
        }
      }
    });
    window.addEventListener("resize", this.refreshFades);
  },
  beforeUnmount() {
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.refreshFades);
  },
  methods: {
    styleLabel(id: string) {
      return QR_STYLES.find((item) => item.id === id)?.label || id;
    },
    choose(file: string) {
      if (this.selectable) this.$emit("select", file);
    },
    onStyleScroll() {
      this.styleFade = measureFade(this.$refs.styleScroll as HTMLElement);
    },
    onEventScroll() {
      this.eventFade = measureFade(this.$refs.eventScroll as HTMLElement);
    },
    refreshFades() {
      this.styleFade = measureFade(this.$refs.styleScroll as HTMLElement);
      this.eventFade = measureFade(this.$refs.eventScroll as HTMLElement);
    },
  },
});
</script>

<style lang="scss" scoped>
.qr-gallery {
  min-width: 0;
  max-width: 100%;
  width: 100%;
}

.qr-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
  max-height: 90px;
  min-width: 0;
  max-width: 100%;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  width: 100%;
}

.filter-label {
  flex: 0 0 auto;
  font-size: 0.75rem;
  font-weight: 700;
  color: #8a8178;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.chips-fade {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.chips-fade::before,
.chips-fade::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 36px;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.15s ease;
}

/* Start edge (right in RTL): opaque at the edge, clear toward center */
.chips-fade::before {
  inset-inline-start: 0;
  background: linear-gradient(
    to left,
    var(--qr-filter-fade, #f6f1ea) 35%,
    transparent
  );
}

/* End edge (left in RTL) */
.chips-fade::after {
  inset-inline-end: 0;
  background: linear-gradient(
    to right,
    var(--qr-filter-fade, #f6f1ea) 35%,
    transparent
  );
}

:global(html:not([dir="rtl"])) .chips-fade::before {
  background: linear-gradient(
    to right,
    var(--qr-filter-fade, #f6f1ea) 18%,
    transparent
  );
}

:global(html:not([dir="rtl"])) .chips-fade::after {
  background: linear-gradient(
    to left,
    var(--qr-filter-fade, #f6f1ea) 18%,
    transparent
  );
}

.chips-fade.fade-start::before {
  opacity: 1;
}

.chips-fade.fade-end::after {
  opacity: 1;
}

.chips-scroll {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-block: 1px;
}

.chips-scroll::-webkit-scrollbar {
  display: none;
}

.chip {
  appearance: none;
  flex: 0 0 auto;
  height: 32px;
  box-sizing: border-box;
  border: 1.5px solid rgba(22, 19, 16, 0.16);
  background: rgba(255, 255, 255, 0.55);
  color: #161310;
  font-family: inherit;
  font-size: 0.8125rem; /* 13px */
  font-weight: 700;
  line-height: 1;
  border-radius: 999px;
  padding: 0 11px;
  cursor: pointer;
  white-space: nowrap;
}

.chip:focus-visible {
  outline: 2px solid #c9a36a;
  outline-offset: 2px;
}

.chip.on {
  background: #12100e;
  color: #fff;
  border-color: #12100e;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 12px;
}

.qr-card {
  appearance: none;
  text-align: right;
  border: 1.5px solid transparent;
  background: transparent;
  border-radius: 16px;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font-family: inherit;
}

.qr-card.on .qr-thumb {
  box-shadow: 0 0 0 3px #c9a36a;
}

.qr-thumb {
  position: relative;
  display: block;
  border-radius: 14px;
  overflow: hidden;
  background: #f3eee6;
  aspect-ratio: 3 / 4;
}

.qr-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mini-qr {
  width: 100%;
  background: #fff !important;
  line-height: 0;
}

.mini-qr svg {
  width: 100%;
  height: auto;
  display: block;
  background: #fff !important;
}

.qr-card h4 {
  margin: 8px 2px 0;
  font-size: 0.95rem;
  font-weight: 800;
}

.qr-card p {
  margin: 2px;
  color: #5e564e;
  font-size: 0.82rem;
}

.empty {
  margin-top: 18px;
  background: #fff;
  border-radius: 22px;
  padding: 28px;
  text-align: center;
}

@media (max-width: 600px) {
  .qr-filters {
    max-height: none;
  }
}
</style>
