<template>
  <section class="qr-gallery">
    <div class="qr-filters">
      <div class="qr-filter-row" role="tablist" aria-label="סוג אירוע">
        <button type="button" class="qr-chip" :aria-pressed="eventType === 'all'" @click="eventType = 'all'">הכל</button>
        <button
          v-for="item in eventTypes"
          :key="item.id"
          type="button"
          class="qr-chip"
          :aria-pressed="eventType === item.id"
          @click="eventType = item.id"
        >
          {{ item.label }}
        </button>
      </div>
      <div class="qr-filter-row" role="tablist" aria-label="סגנון">
        <button type="button" class="qr-chip" :aria-pressed="style === 'all'" @click="style = 'all'">כל הסגנונות</button>
        <button
          v-for="item in styles"
          :key="item.id"
          type="button"
          class="qr-chip"
          :aria-pressed="style === item.id"
          @click="style = item.id"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
    <p class="qr-count">{{ cards.length }} עיצובים</p>
    <div class="qr-grid">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        class="qr-card"
        :class="{ 'is-selected': selectable && selected === card.file }"
        @click="choose(card.file)"
      >
        <span class="qr-frame">
          <img :src="`/assets/${card.file}`" alt="" />
          <span class="qr-preview">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" fill="#fff"/>
              <path fill="#161310" d="M6 6h20v20H6zm6 6v8h8v-8zM38 6h20v20H38zm6 6v8h8v-8zM6 38h20v20H6zm6 6v8h8v-8zM38 38h6v6h-6zm10 0h10v6H48zm-10 10h6v10h-6zm10 4h10v6H48z"/>
            </svg>
            <span>סרקו, צלמו ותעלו</span>
          </span>
        </span>
        <span class="qr-card-label">{{ card.label }}</span>
        <span class="qr-card-meta">{{ styleLabel(card.style) }}</span>
      </button>
    </div>
    <p v-if="cards.length === 0" class="qr-empty">אין עיצוב שמתאים לסינון הזה.</p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  filterQrCards,
  QR_EVENT_TYPES,
  QR_STYLES,
  type QrCardDesign,
} from "@/helpers/qrCardCatalog";

export default defineComponent({
  name: "QrCardGallery",
  props: {
    selectable: { type: Boolean, default: false },
    selected: { type: String, default: "" },
  },
  emits: ["select"],
  data() {
    return {
      eventType: "all",
      style: "all",
      eventTypes: QR_EVENT_TYPES,
      styles: QR_STYLES,
    };
  },
  computed: {
    cards(): QrCardDesign[] {
      return filterQrCards(this.style, this.eventType);
    },
  },
  methods: {
    styleLabel(id: string) {
      return QR_STYLES.find((item) => item.id === id)?.label || id;
    },
    choose(file: string) {
      if (this.selectable) this.$emit("select", file);
    },
  },
});
</script>

<style lang="scss" scoped>
.qr-gallery { width: 100%; }
.qr-filters { display: flex; flex-direction: column; gap: 8px; }
.qr-filter-row { display: flex; flex-wrap: wrap; gap: 8px; }
.qr-chip {
  appearance: none;
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.11));
  background: #fff;
  color: var(--ink, #161310);
  font-family: var(--font, Heebo, sans-serif);
  font-weight: 700;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}
.qr-chip[aria-pressed="true"] {
  background: var(--espresso, #12100e);
  color: #fff;
  border-color: var(--espresso, #12100e);
}
.qr-count { margin: 12px 0; color: var(--muted, #5e564e); font-weight: 700; }
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.qr-card {
  appearance: none;
  text-align: right;
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.11));
  background: var(--paper, #fffcfa);
  border-radius: 16px;
  padding: 8px;
  cursor: pointer;
  color: inherit;
  font-family: inherit;
}
.qr-card.is-selected { border-color: var(--rose, #dc5b66); box-shadow: 0 0 0 2px rgba(220, 91, 102, 0.25); }
.qr-frame { position: relative; display: block; border-radius: 12px; overflow: hidden; background: #f3eee6; }
.qr-frame img { width: 100%; height: 230px; object-fit: cover; display: block; }
.qr-preview {
  position: absolute;
  left: 18%;
  right: 18%;
  top: 22%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.qr-preview svg { width: 72px; height: 72px; background: #fff; border-radius: 6px; }
.qr-preview span { font-size: 0.72rem; font-weight: 800; color: #161310; line-height: 1.3; }
.qr-card-label { display: block; margin-top: 8px; font-weight: 800; }
.qr-card-meta { display: block; color: var(--muted, #5e564e); font-size: 0.85rem; }
.qr-empty { color: var(--muted, #5e564e); }
</style>
