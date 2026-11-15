<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">הגעה</p>
      <h2 class="sec-title">איך מגיעים</h2>
      <p class="venue-name">{{ data.location_name }}</p>
      <p class="venue-city">{{ data.city }}</p>
      <div class="nav-actions">
        <button v-if="showWaze" type="button" @click="openWaze"><span>פתחו ב־Waze</span><span class="ic">◁</span></button>
        <button v-if="showMaps" type="button" @click="openMaps"><span>פתחו בגוגל מפות</span><span class="ic">◁</span></button>
      </div>
      <p v-if="preview" class="preview-note">בתצוגה מקדימה</p>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { LANDING_CTX } from "../landingContext";
export default defineComponent({
  name: "SmartNavigation",
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
      if (preview.value || !props.data.waze_url) return ctx?.toast("קישור ווייז לדוגמה.");
      window.open(String(props.data.waze_url), "_blank", "noopener");
    }
    function openMaps() {
      if (preview.value || !props.data.google_maps_url) return ctx?.toast("קישור מפות לדוגמה.");
      window.open(String(props.data.google_maps_url), "_blank", "noopener");
    }
    return { preview, showWaze, showMaps, openWaze, openMaps };
  },
});
</script>
