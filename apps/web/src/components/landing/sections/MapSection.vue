<template>
  <section :id="'sec-' + sectionId" :class="['block', 'map-sec', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">{{ data.kicker || 'הגעה' }}</p>
      <h2 class="sec-title">{{ data.heading || 'איך מגיעים' }}</h2>
      <div class="map-grid">
        <div class="map-ph" role="img" aria-label="מפה לדוגמה">
          <div class="map-gridlines" aria-hidden="true" />
          <div class="map-pin">
            <span /><b>{{ data.location_name }}</b>
          </div>
          <p class="map-badge">מפה לדוגמה</p>
        </div>
        <div class="map-copy">
          <p class="venue-name">{{ data.location_name }}</p>
          <p class="venue-city">{{ data.city }}</p>
          <p v-if="data.note" class="body" style="margin-bottom:22px">{{ data.note }}</p>
          <div class="nav-actions">
            <button v-if="showWaze" type="button" @click="openWaze">
              <span>פתחו ב־Waze</span><span class="ic">◁</span>
            </button>
            <button v-if="showMaps" type="button" @click="openMaps">
              <span>פתחו בגוגל מפות</span><span class="ic">◁</span>
            </button>
          </div>
          <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";

export default defineComponent({
  name: "MapSection",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    const showWaze = computed(() => preview.value || Boolean(props.data.waze_url));
    const showMaps = computed(() => preview.value || Boolean(props.data.google_maps_url));

    function openWaze() {
      if (preview.value || !props.data.waze_url) {
        ctx?.toast("קישור ווייז לדוגמה — בתצוגה מקדימה אין ניווט אמיתי.");
        return;
      }
      window.open(String(props.data.waze_url), "_blank", "noopener");
    }
    function openMaps() {
      if (preview.value || !props.data.google_maps_url) {
        ctx?.toast("קישור מפות לדוגמה — בתצוגה מקדימה אין ניווט אמיתי.");
        return;
      }
      window.open(String(props.data.google_maps_url), "_blank", "noopener");
    }
    return { preview, showWaze, showMaps, openWaze, openMaps };
  },
});
</script>
