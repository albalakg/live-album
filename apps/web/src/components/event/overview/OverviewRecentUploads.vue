<template>
  <section class="ov-recent" aria-labelledby="ov-recent-title">
    <div class="ov-recent__head">
      <h2 id="ov-recent-title">העלאות אחרונות</h2>
      <router-link v-if="items.length" class="ov-recent__all" to="/event/assets">
        לכל הקבצים
      </router-link>
    </div>

    <div v-if="items.length" class="ov-recent__grid">
      <router-link
        v-for="item in items"
        :key="item.id"
        class="ov-thumb"
        :to="'/event/assets'"
        :aria-label="item.alt"
      >
        <img
          :src="item.src"
          :alt="item.alt"
          loading="lazy"
          decoding="async"
          @error="onImgError"
        />
        <span v-if="item.isVideo" class="ov-thumb__badge" aria-hidden="true">סרטון</span>
      </router-link>
    </div>

    <div v-else class="ov-recent__empty">
      <div class="ov-recent__empty-art" aria-hidden="true">
        <span /><span /><span />
      </div>
      <strong>עדיין אין העלאות</strong>
      <p>כשאורחים יעלו תמונות, הן יופיעו כאן.</p>
      <router-link class="ov-recent__empty-cta" to="/event/qr">
        להדפסת כרטיס QR
      </router-link>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { OverviewUploadThumb } from "@/helpers/overviewRecentUploads";

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" fill="#efe8de"/>
      <rect x="28" y="28" width="184" height="184" rx="18" fill="#f7f2ea" stroke="#d9d0c3"/>
      <circle cx="92" cy="96" r="18" fill="#d9d0c3"/>
      <path d="M44 176l46-52 28 30 22-18 56 40H44z" fill="#d9d0c3"/>
    </svg>`
  );

export default defineComponent({
  name: "OverviewRecentUploads",

  props: {
    items: {
      type: Array as PropType<OverviewUploadThumb[]>,
      default: () => [],
    },
  },

  methods: {
    onImgError(ev: Event) {
      const img = ev.target as HTMLImageElement | null;
      if (!img) return;
      if (img.dataset.fallback === "1") return;
      img.dataset.fallback = "1";
      img.src = PLACEHOLDER;
    },
  },
});
</script>

<style lang="scss" scoped>
.ov-recent__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.ov-recent__head h2 {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
}

.ov-recent__all {
  color: #5e564e;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  white-space: nowrap;
}

.ov-recent__all:hover {
  color: #161310;
}

.ov-recent__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.ov-thumb {
  position: relative;
  display: block;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: #efe8de;
  border: 1px solid rgba(22, 19, 16, 0.05);
}

.ov-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ov-thumb__badge {
  position: absolute;
  inset-inline-start: 8px;
  inset-block-end: 8px;
  background: rgba(18, 16, 14, 0.72);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
}

.ov-recent__empty {
  background: #fff;
  border-radius: 20px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(18, 16, 14, 0.06);
  border: 1px solid rgba(22, 19, 16, 0.05);
}

.ov-recent__empty-art {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.ov-recent__empty-art span {
  width: 42px;
  height: 52px;
  border-radius: 10px;
  background: linear-gradient(160deg, #efe8de, #f7f2ea);
  border: 1px solid rgba(22, 19, 16, 0.06);
}

.ov-recent__empty-art span:nth-child(2) {
  transform: translateY(-6px);
}

.ov-recent__empty strong {
  display: block;
  font-size: 1.05rem;
  font-weight: 800;
}

.ov-recent__empty p {
  margin: 6px 0 14px;
  color: #5e564e;
}

.ov-recent__empty-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 10px 18px;
  border-radius: 999px;
  background: #12100e;
  color: #fff;
  text-decoration: none;
  font-weight: 800;
}

@media (prefers-reduced-motion: reduce) {
  .ov-recent__empty-art span:nth-child(2) {
    transform: none;
  }
}

@media (max-width: 1024px) {
  .ov-recent__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .ov-recent__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
