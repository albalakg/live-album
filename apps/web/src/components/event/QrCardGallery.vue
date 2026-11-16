<template>
  <section class="qr-gallery">
    <div class="qr-filters" role="search">
      <div class="qr-search">
        <svg class="qr-search-ico" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.8" />
          <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <input
          v-model="query"
          type="search"
          class="qr-search-input"
          placeholder="חיפוש עיצוב…"
          aria-label="חיפוש עיצוב"
          enterkeyhint="search"
          autocomplete="off"
          @keydown.esc="query = ''"
        />
        <button
          v-if="query"
          type="button"
          class="qr-search-clear"
          aria-label="ניקוי חיפוש"
          @click="query = ''"
        >
          ×
        </button>
      </div>
      <div class="qr-filter-menus">
        <QrFilterMultiSelect
          v-model="eventTypesSel"
          label="סוג אירוע"
          :options="eventTypes"
          data-filter="event"
        />
        <QrFilterMultiSelect
          v-model="stylesSel"
          label="סגנון"
          :options="styles"
          data-filter="style"
        />
      </div>
      <div class="qr-filter-meta">
        <span class="qr-result-count" aria-live="polite">{{ resultLabel }}</span>
        <button v-if="hasFilters" type="button" class="qr-clear-all" @click="clearFilters">
          ניקוי סינון
        </button>
      </div>
    </div>

    <div class="qr-grid">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        class="qr-card"
        :class="{ on: selectable && selected === card.file }"
        :aria-pressed="selectable ? selected === card.file : undefined"
        @click="choose(card.file)"
      >
        <div class="qr-thumb">
          <QrCardBackdrop
            v-if="card.renderer === 'css' && v2ByFile(card.file)"
            :design="v2ByFile(card.file)!"
          />
          <img
            v-else
            :src="`/assets/${card.file}`"
            :alt="card.label"
            loading="lazy"
            decoding="async"
          />
          <QrCardFrame
            mini
            :event-name="eventName"
            :text-color="card.textColor || '#161310'"
            :show-tagline="!card.hideCta"
            :inverted="Boolean(card.inverted)"
            tagline="סרקו והעלו תמונות"
          >
            <template #qr>
              <div class="mini-qr">
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <path
                    fill="#12100e"
                    d="M6 6h20v20H6zm6 6v8h8v-8zM38 6h20v20H38zm6 6v8h8v-8zM6 38h20v20H6zm6 6v8h8v-8zM38 38h6v6h-6zm10 0h10v6H48zm-10 10h6v10h-6zm10 4h10v6H48z"
                  />
                </svg>
              </div>
            </template>
          </QrCardFrame>
        </div>
        <h4>{{ card.label }}</h4>
        <p>{{ styleLabel(card) }}</p>
      </button>
    </div>
    <div v-if="cards.length === 0" class="empty qr-empty">
      <h3>לא נמצאו עיצובים</h3>
      <p>נסו מילה אחרת או פחות מסננים.</p>
      <button type="button" class="qr-empty-clear" @click="clearFilters">ניקוי סינון</button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import QrCardFrame from "@/components/event/QrCardFrame.vue";
import QrCardBackdrop from "@/components/event/qrDesigns/QrCardBackdrop.vue";
import QrFilterMultiSelect from "@/components/event/QrFilterMultiSelect.vue";
import {
  QR_CARD_CATALOG,
  QR_EVENT_TYPES,
  QR_STYLE_FILTERS,
  categoryLabel,
  type QrCardDesign,
} from "@/helpers/qrCardCatalog";
import { filterQrCardsBy } from "@/helpers/qrCardSearch";
import {
  findV2DesignByFile,
  type QrV2Design,
} from "@/helpers/qrCardDesignsV2";

export default defineComponent({
  name: "QrCardGallery",
  components: { QrCardFrame, QrCardBackdrop, QrFilterMultiSelect },
  props: {
    selectable: { type: Boolean, default: false },
    selected: { type: String, default: "" },
    eventName: { type: String, default: "האירוע שלכם" },
  },
  emits: ["select"],
  data() {
    return {
      query: "",
      eventTypesSel: [] as string[],
      stylesSel: [] as string[],
      eventTypes: QR_EVENT_TYPES,
      styles: QR_STYLE_FILTERS,
    };
  },
  computed: {
    cards(): QrCardDesign[] {
      return filterQrCardsBy({
        query: this.query,
        styles: this.stylesSel,
        eventTypes: this.eventTypesSel,
      });
    },
    hasFilters(): boolean {
      return Boolean(this.query.trim() || this.stylesSel.length || this.eventTypesSel.length);
    },
    resultLabel(): string {
      const n = this.cards.length;
      if (!this.hasFilters) return `${n} עיצובים`;
      if (n === 1) return `עיצוב אחד מתוך ${QR_CARD_CATALOG.length}`;
      return `${n} מתוך ${QR_CARD_CATALOG.length} עיצובים`;
    },
  },
  methods: {
    v2ByFile(file: string): QrV2Design | undefined {
      return findV2DesignByFile(file);
    },
    styleLabel(card: QrCardDesign) {
      const primary = card.categories[0] || card.style;
      return categoryLabel(primary);
    },
    choose(file: string) {
      if (this.selectable) this.$emit("select", file);
    },
    clearFilters() {
      this.query = "";
      this.stylesSel = [];
      this.eventTypesSel = [];
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
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin-bottom: 14px;
  min-width: 0;
  max-width: 100%;
}

.qr-search {
  position: relative;
  flex: 1 1 180px;
  min-width: 0;
  max-width: 420px;
}

.qr-search-ico {
  position: absolute;
  inset-inline-start: 13px;
  top: 50%;
  width: 17px;
  height: 17px;
  transform: translateY(-50%);
  color: #8a8178;
  pointer-events: none;
}

.qr-search-input {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 0 38px 0 34px;
  padding-inline-start: 38px;
  padding-inline-end: 34px;
  border: 1px solid #e4dbcf;
  border-radius: 999px;
  background: #fff;
  color: #12100e;
  font: inherit;
  font-size: 0.92rem;
  -webkit-appearance: none;
  appearance: none;
}

.qr-search-input::-webkit-search-cancel-button { display: none; }
.qr-search-input::placeholder { color: #9a9187; }
.qr-search-input:focus { outline: none; border-color: #c9a36a; box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.22); }

.qr-search-clear {
  position: absolute;
  inset-inline-end: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 50%;
  background: #f1ebe3;
  color: #5e564e;
  font-size: 1.05rem;
  line-height: 1;
  cursor: pointer;
}

.qr-filter-menus {
  display: flex;
  gap: 8px;
  flex: none;
}

/* Count + clear sit on their own quiet row so the controls row never wraps
   (the gallery column is narrow next to the card preview). */
.qr-filter-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 100%;
  min-height: 20px;
}

.qr-result-count {
  font-size: 0.82rem;
  font-weight: 700;
  color: #8a8178;
  white-space: nowrap;
}

.qr-clear-all {
  border: 0;
  background: none;
  color: #a06a2c;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 2px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 767.98px) {
  .qr-search { flex: 1 1 100%; max-width: none; }
  .qr-filter-menus { flex: 1 1 auto; }
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
  background: transparent !important;
  line-height: 0;
}

.mini-qr svg {
  width: 100%;
  height: auto;
  display: block;
  background: transparent !important;
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

.qr-empty-clear {
  margin-top: 12px;
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: #12100e;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
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

  .qr-grid {
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  }
}
</style>
