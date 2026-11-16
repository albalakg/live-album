<template>
  <section class="ov-analytics" aria-labelledby="ov-analytics-title">
    <div class="ov-analytics__head">
      <h2 id="ov-analytics-title">צפיות ומעורבות</h2>
      <span v-if="loading" class="ov-analytics__meta">טוען…</span>
      <span
        v-else-if="available && activeVisitors > 0"
        class="ov-analytics__meta"
      >
        {{ activeVisitors }} פעילים ב־15 דק׳
      </span>
    </div>

    <div v-if="loading" class="ov-analytics__skel" aria-busy="true">
      <div v-for="n in 4" :key="n" class="ov-analytics__skel-item" />
    </div>

    <div v-else-if="!available" class="ov-analytics__quiet">
      <p>נתוני הצפיות יופיעו כאן כשיהיו זמינים.</p>
    </div>

    <div v-else class="ov-analytics__grid">
      <article class="ov-analytics__stat">
        <strong>{{ landingVisitors }}</strong>
        <span>דף האירוע</span>
      </article>
      <article class="ov-analytics__stat">
        <strong>{{ uploadPageVisitors }}</strong>
        <span>עמוד העלאה</span>
        <small v-if="rateLanding">{{ rateLanding }}</small>
      </article>
      <article class="ov-analytics__stat">
        <strong>{{ uploaders }}</strong>
        <span>העלו קבצים</span>
        <small v-if="rateUpload">{{ rateUpload }}</small>
      </article>
      <article class="ov-analytics__stat">
        <strong>{{ galleryVisitors }}</strong>
        <span>גלריה</span>
        <small v-if="rateGallery">{{ rateGallery }}</small>
      </article>
    </div>

    <div
      v-if="available && showExtra"
      class="ov-analytics__extra"
    >
      <span v-if="photos != null">{{ photos }} תמונות</span>
      <span v-if="videos != null">{{ videos }} סרטונים</span>
      <span v-if="downloads != null">{{ downloads }} הורדות</span>
      <span v-if="peakHour">שיא העלאות {{ peakHour }}</span>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "OverviewAnalyticsBlock",

  props: {
    loading: { type: Boolean, default: false },
    /** false = endpoint missing / empty — quiet state, never an error toast. */
    available: { type: Boolean, default: false },
    landingVisitors: { type: Number, default: 0 },
    uploadPageVisitors: { type: Number, default: 0 },
    uploaders: { type: Number, default: 0 },
    galleryVisitors: { type: Number, default: 0 },
    activeVisitors: { type: Number, default: 0 },
    rateLanding: { type: String, default: "" },
    rateUpload: { type: String, default: "" },
    rateGallery: { type: String, default: "" },
    photos: { type: Number, default: null },
    videos: { type: Number, default: null },
    downloads: { type: Number, default: null },
    peakHour: { type: String, default: "" },
  },

  computed: {
    showExtra(): boolean {
      return (
        this.photos != null ||
        this.videos != null ||
        this.downloads != null ||
        Boolean(this.peakHour)
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.ov-analytics {
  background: #fff;
  border-radius: 22px;
  padding: 20px 22px;
  box-shadow: 0 6px 20px rgba(18, 16, 14, 0.06);
  border: 1px solid rgba(22, 19, 16, 0.05);
}

.ov-analytics__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.ov-analytics__head h2 {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
}

.ov-analytics__meta {
  font-size: 0.85rem;
  font-weight: 700;
  color: #5e564e;
}

.ov-analytics__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.ov-analytics__stat {
  min-width: 0;
  padding: 12px 10px;
  border-radius: 14px;
  background: #f7f2ea;
}

.ov-analytics__stat strong {
  display: block;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.ov-analytics__stat span {
  display: block;
  margin-top: 2px;
  font-weight: 700;
  font-size: 0.86rem;
}

.ov-analytics__stat small {
  display: block;
  margin-top: 2px;
  color: #8a8278;
  font-size: 0.75rem;
}

.ov-analytics__quiet {
  padding: 10px 2px 4px;
}

.ov-analytics__quiet p {
  margin: 0;
  color: #8a8278;
  font-weight: 500;
}

.ov-analytics__extra {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(22, 19, 16, 0.06);
  color: #5e564e;
  font-size: 0.86rem;
  font-weight: 600;
}

.ov-analytics__skel {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.ov-analytics__skel-item {
  height: 72px;
  border-radius: 14px;
  background: linear-gradient(90deg, #ebe4da, #f7f2ea, #ebe4da);
  background-size: 200% 100%;
}

@media (prefers-reduced-motion: no-preference) {
  .ov-analytics__skel-item {
    animation: ov-shimmer 1.2s infinite;
  }
}

@keyframes ov-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 1024px) {
  .ov-analytics__grid,
  .ov-analytics__skel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .ov-analytics {
    padding: 16px;
  }
  .ov-analytics__grid,
  .ov-analytics__skel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
