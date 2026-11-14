<template>
  <section class="qr-gallery">
    <div class="qr-filters">
      <div class="chips" role="tablist" aria-label="סגנון">
        <button type="button" class="chip" :class="{ on: style === 'all' }" @click="style = 'all'">כל הסגנונות</button>
        <button
          v-for="item in styles"
          :key="item.id"
          type="button"
          class="chip"
          :class="{ on: style === item.id }"
          @click="style = item.id"
        >
          {{ item.label }}
        </button>
      </div>
      <div class="chips" aria-label="סוג אירוע">
        <button type="button" class="chip" :class="{ on: eventType === 'all' }" @click="eventType = 'all'">כל האירועים</button>
        <button
          v-for="item in eventTypes"
          :key="item.id"
          type="button"
          class="chip"
          :class="{ on: eventType === item.id }"
          @click="eventType = item.id"
        >
          {{ item.label }}
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
        @click="choose(card.file)"
      >
        <div class="qr-thumb">
          <img :src="`/assets/${card.file}`" :alt="card.label" />
          <div class="mini-qr" :class="{ inv: card.inverted }">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path :fill="card.qrColor || '#000000'" d="M6 6h20v20H6zm6 6v8h8v-8zM38 6h20v20H38zm6 6v8h8v-8zM6 38h20v20H6zm6 6v8h8v-8zM38 38h6v6h-6zm10 0h10v6H48zm-10 10h6v10h-6zm10 4h10v6H48z"/>
            </svg>
          </div>
          <div
            class="mini-name"
            :style="{ color: card.textColor || '#161310' }"
          >
            {{ eventName }}
          </div>
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
    eventName: { type: String, default: "האירוע שלכם" },
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
.qr-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  appearance: none;
  border: 1.5px solid rgba(22, 19, 16, 0.11);
  background: #fff;
  color: #161310;
  font-family: inherit;
  font-weight: 700;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
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
  position: absolute;
  left: 50%;
  top: 28%;
  width: 34%;
  transform: translateX(-50%);
  background: transparent !important;
}
.mini-qr svg {
  width: 100%;
  height: auto;
  display: block;
  background: transparent !important;
}
.mini-name {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 12%;
  text-align: center;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1.2;
  background: none !important;
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
</style>
