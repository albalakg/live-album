<template>
  <div class="pv">
    <div v-if="bar" class="pv-bar">
      <div>
        <b>תצוגה מקדימה</b>
        <small>ככה האורחים יראו את העמוד</small>
      </div>
      <DeviceToggle :model-value="device" @update:model-value="$emit('update:device', $event)" />
    </div>
    <div ref="stageEl" class="pv-stage">
      <div
        v-if="fit.scale > 0"
        class="pv-dev"
        :class="device === 'phone' ? 'pv-phone' : 'pv-desk'"
        :style="devStyle"
      >
        <div class="pv-chrome">
          <i /><i /><i />
          <div class="pv-url"><bdi>{{ urlText }}</bdi></div>
        </div>
        <div class="pv-notch" aria-hidden="true" />
        <div class="pv-screen" :style="screenStyle">
          <div class="pv-loading" :class="{ gone: loaded }">טוענים תצוגה…</div>
          <LandingPreviewIframe
            :template-id="templateId"
            :hub-config="hubConfig"
            :mode="device"
            :fit-scale="fit.scale"
            :view-width="fit.viewW"
            :view-height="fit.viewH"
            :scroll-section="scrollSection"
            :scroll-tick="scrollTick"
            title="תצוגה מקדימה של דף האירוע"
            @ready="onReady"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import type { HubConfig } from "../types";
import type { PreviewDevice } from "./builderTypes";
import DeviceToggle from "./DeviceToggle.vue";
import LandingPreviewIframe from "./LandingPreviewIframe.vue";

const PHONE_W = 390;
const PHONE_H = 844;
const DESK_W = 1440;
/** Browser chrome bar height in desktop mode. */
const CHROME_H = 34;
/** Phone bezel: padding around the screen (left+right, top+bottom). Notch lives in the top pad. */
const BEZEL_X = 9;
const BEZEL_TOP = 24;
const BEZEL_BOTTOM = 14;
/** Desktop viewport height range we render, in CSS px of the guest page (a real laptop/monitor). */
const DESK_MIN_VIEW_H = 480;
const DESK_MAX_VIEW_H = 1100;

export interface PreviewFit {
  scale: number;
  viewW: number;
  viewH: number;
  screenW: number;
  screenH: number;
  devW: number;
  devH: number;
}

/**
 * Pure fit math (exported for tests). Phone: a real 390x844 viewport scaled to fit both axes.
 * Desktop: a real 1440-wide viewport scaled to the width, its height filling the frame
 * (clamped to a 480-1100 px tall viewport).
 */
export function computePreviewFit(device: PreviewDevice, availW: number, availH: number): PreviewFit {
  if (device === "phone") {
    const s = Math.max(
      0.1,
      Math.min(1, (availH - BEZEL_TOP - BEZEL_BOTTOM) / PHONE_H, (availW - BEZEL_X * 2) / PHONE_W)
    );
    const screenW = PHONE_W * s;
    const screenH = PHONE_H * s;
    return {
      scale: s,
      viewW: PHONE_W,
      viewH: PHONE_H,
      screenW,
      screenH,
      devW: screenW + BEZEL_X * 2,
      devH: screenH + BEZEL_TOP + BEZEL_BOTTOM,
    };
  }
  const s = Math.max(0.1, Math.min(1, availW / DESK_W));
  const screenW = DESK_W * s;
  // Fill the frame height, but keep a believable desktop viewport (no 1440x2600 slivers).
  const viewH = Math.min(DESK_MAX_VIEW_H, Math.max(DESK_MIN_VIEW_H, (availH - CHROME_H) / s));
  const screenH = viewH * s;
  return {
    scale: s,
    viewW: DESK_W,
    viewH,
    screenW,
    screenH,
    devW: screenW,
    devH: screenH + CHROME_H,
  };
}

/**
 * Live preview chrome: phone bezel or fake browser, sized so the renderer always sees a real
 * 390 / 1440 px viewport (the inner iframe component scales it to fit the screen box).
 */
export default defineComponent({
  name: "LivePreviewPane",
  components: { DeviceToggle, LandingPreviewIframe },
  props: {
    templateId: { type: String, required: true },
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
    device: { type: String as PropType<PreviewDevice>, default: "desktop" },
    /** Show the "תצוגה מקדימה" bar with the phone / desktop toggle. */
    bar: { type: Boolean, default: true },
    urlText: { type: String, default: "" },
    /** Block id to scroll the preview to. Bump scrollTick to repeat. */
    scrollSection: { type: String, default: "" },
    scrollTick: { type: Number, default: 0 },
  },
  emits: ["update:device"],
  setup(props) {
    const stageEl = ref<HTMLElement | null>(null);
    const fit = ref<PreviewFit>({ scale: 0, viewW: 0, viewH: 0, screenW: 0, screenH: 0, devW: 0, devH: 0 });
    const loaded = ref(false);
    let ro: ResizeObserver | null = null;
    let raf = 0;

    /** Layout box sizes only (clientWidth/Height ignore transforms such as a modal's enter scale). */
    function layout() {
      const stage = stageEl.value;
      if (!stage) return;
      const cs = getComputedStyle(stage);
      const sw =
        stage.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      const sh =
        stage.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
      if (sw <= 0 || sh <= 0) return;
      const next = computePreviewFit(props.device, Math.floor(sw), Math.floor(sh));
      const cur = fit.value;
      if (
        Math.abs(cur.scale - next.scale) < 0.0005 &&
        Math.abs(cur.viewH - next.viewH) < 0.5 &&
        cur.viewW === next.viewW
      ) {
        return;
      }
      fit.value = next;
    }

    function scheduleLayout() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        layout();
      });
    }

    const devStyle = computed(() => ({
      width: `${fit.value.devW}px`,
      height: `${fit.value.devH}px`,
    }));

    const screenStyle = computed(() => ({
      width: `${fit.value.screenW}px`,
      height: `${fit.value.screenH}px`,
    }));

    function onReady() {
      window.setTimeout(() => {
        loaded.value = true;
      }, 350);
    }

    watch(
      () => props.device,
      () => {
        void nextTick(layout);
      }
    );

    onMounted(() => {
      nextTick(layout);
      if (stageEl.value && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(scheduleLayout);
        ro.observe(stageEl.value);
      }
    });

    onBeforeUnmount(() => {
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    });

    return { stageEl, fit, devStyle, screenStyle, loaded, onReady };
  },
});
</script>
