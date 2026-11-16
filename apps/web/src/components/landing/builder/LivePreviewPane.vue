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
      <div class="pv-dev" :class="device === 'phone' ? 'phone' : 'desk'">
        <div class="pv-chrome">
          <i /><i /><i />
          <div class="pv-url"><bdi>{{ urlText }}</bdi></div>
        </div>
        <div class="pv-notch" />
        <div class="pv-screen" :style="screenStyle">
          <div class="pv-loading" :class="{ gone: loaded }">טוענים תצוגה…</div>
          <LandingPreviewIframe
            :template-id="templateId"
            :hub-config="hubConfig"
            :mode="device"
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
const DESK_MAX_H = 1000;
const CHROME_H = 34;
const BEZEL_W = 18;
const BEZEL_H = 38;

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
    const box = ref({ w: 0, h: 0 });
    const loaded = ref(false);
    let ro: ResizeObserver | null = null;
    let raf = 0;

    function layout() {
      const stage = stageEl.value;
      if (!stage) return;
      const cs = getComputedStyle(stage);
      const sw =
        stage.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      const sh =
        stage.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
      if (sw <= 0 || sh <= 0) return;
      if (props.device === "phone") {
        const s = Math.max(0.1, Math.min(1, (sh - BEZEL_H) / PHONE_H, (sw - BEZEL_W) / PHONE_W));
        box.value = { w: Math.round(PHONE_W * s), h: Math.round(PHONE_H * s) };
      } else {
        const s = Math.max(0.1, Math.min(1, sw / DESK_W));
        box.value = {
          w: Math.round(DESK_W * s),
          h: Math.round(Math.min(DESK_MAX_H * s, Math.max(200, sh - CHROME_H))),
        };
      }
    }

    function scheduleLayout() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        layout();
      });
    }

    const screenStyle = computed(() =>
      box.value.w ? { width: `${box.value.w}px`, height: `${box.value.h}px` } : {}
    );

    function onReady() {
      window.setTimeout(() => {
        loaded.value = true;
      }, 350);
    }

    watch(
      () => props.device,
      () => {
        void nextTick(scheduleLayout);
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

    return { stageEl, screenStyle, loaded, onReady };
  },
});
</script>
