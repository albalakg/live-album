<template>
  <div ref="hostEl" class="lpi" :class="{ phone: mode === 'phone', desktop: mode === 'desktop' }">
    <div class="lpi-align">
      <div class="lpi-clip" :style="clipStyle">
        <div class="lpi-scale" :style="scaleWrapStyle">
          <iframe
            ref="iframeEl"
            class="lpi-frame"
            :src="frameSrc"
            :title="title"
            :style="iframeStyle"
            loading="eager"
            referrerpolicy="same-origin"
            @load="onIframeLoad"
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

const MSG_TYPE = "snapshare:landing-preview";
const READY_TYPE = "snapshare:landing-preview-ready";
const PING_TYPE = "snapshare:landing-preview-ping";
const SCROLL_TYPE = "snapshare:landing-preview-scroll";
const PHONE_W = 390;
const PHONE_H = 844;
const DESKTOP_W = 1440;

export default defineComponent({
  name: "LandingPreviewIframe",
  props: {
    templateId: { type: String, required: true },
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
    mode: { type: String as PropType<"phone" | "desktop">, required: true },
    title: { type: String, default: "תצוגה מקדימה" },
    /** Block id to scroll to inside the preview. Bump `scrollTick` to scroll to the same id again. */
    scrollSection: { type: String, default: "" },
    scrollTick: { type: Number, default: 0 },
  },
  emits: ["ready"],
  setup(props, { emit, expose }) {
    const hostEl = ref<HTMLElement | null>(null);
    const iframeEl = ref<HTMLIFrameElement | null>(null);
    const stageW = ref(0);
    const stageH = ref(0);
    const frameReady = ref(false);
    const frameSrc = "/h-preview";
    let ro: ResizeObserver | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let measureRaf = 0;
    let pingTimer: ReturnType<typeof setInterval> | null = null;

    const designW = computed(() => (props.mode === "phone" ? PHONE_W : DESKTOP_W));

    const scale = computed(() => {
      if (!stageW.value && !stageH.value) return 1;
      if (props.mode === "phone") {
        const byH = stageH.value > 0 ? stageH.value / PHONE_H : 1;
        const byW = stageW.value > 0 ? stageW.value / PHONE_W : byH;
        return Math.min(1, byH, byW);
      }
      return Math.min(1, stageW.value / DESKTOP_W);
    });

    const designH = computed(() => {
      if (props.mode === "phone") return PHONE_H;
      const s = scale.value || 0.42;
      const h = stageH.value > 0 ? stageH.value / s : 900;
      return Math.max(700, Math.round(h));
    });

    const clipStyle = computed(() => {
      if (props.mode === "phone") {
        const s = scale.value;
        return {
          width: `${Math.round(PHONE_W * s)}px`,
          height: `${Math.round(PHONE_H * s)}px`,
        };
      }
      return {
        width: "100%",
        height: stageH.value ? `${stageH.value}px` : "100%",
        overflow: "hidden",
      };
    });

    const scaleWrapStyle = computed(() => {
      const s = scale.value;
      if (props.mode === "phone") {
        return {
          width: `${PHONE_W}px`,
          height: `${PHONE_H}px`,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
        };
      }
      return {
        width: `${DESKTOP_W}px`,
        height: `${designH.value}px`,
        transform: `scale(${s})`,
        transformOrigin: "0 0",
      };
    });

    const iframeStyle = computed(() => ({
      width: `${designW.value}px`,
      height: `${designH.value}px`,
    }));

    function measure() {
      const el = hostEl.value;
      if (!el) return;
      // Prefer the frame parent — host can shrink-wrap the phone clip under RTL flex quirks
      const box = (el.parentElement || el).getBoundingClientRect();
      const w = Math.max(el.clientWidth, Math.floor(box.width));
      const h = Math.max(el.clientHeight, Math.floor(box.height));
      stageW.value = Math.max(0, w);
      stageH.value = Math.max(0, h);
    }

    function scheduleMeasure() {
      if (measureRaf) cancelAnimationFrame(measureRaf);
      measureRaf = requestAnimationFrame(() => {
        measureRaf = 0;
        measure();
      });
    }

    function postConfig() {
      const win = iframeEl.value?.contentWindow;
      if (!win || !frameReady.value) return;
      if (!props.templateId || !props.hubConfig) return;
      try {
        win.postMessage(
          {
            type: MSG_TYPE,
            templateId: props.templateId,
            hubConfig: JSON.parse(JSON.stringify(props.hubConfig)),
          },
          window.location.origin
        );
      } catch (err) {
        console.error(err);
      }
    }

    function pingChild() {
      const win = iframeEl.value?.contentWindow;
      if (!win) return;
      try {
        win.postMessage({ type: PING_TYPE }, window.location.origin);
      } catch {
        /* ignore */
      }
    }

    function schedulePost() {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        postConfig();
      }, 120);
    }

    /** Ask the preview frame to scroll to a section (`sec-{blockId}`). Safe to call before ready. */
    function scrollToSection(sectionId: string, instant = false) {
      if (!sectionId) return;
      const win = iframeEl.value?.contentWindow;
      if (!win || !frameReady.value) return;
      try {
        win.postMessage({ type: SCROLL_TYPE, sectionId, instant }, window.location.origin);
      } catch {
        /* ignore */
      }
    }

    function onFrameReady() {
      frameReady.value = true;
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      postConfig();
      emit("ready");
      if (props.scrollSection) {
        // Let the renderer paint the first config before scrolling.
        setTimeout(() => scrollToSection(props.scrollSection, true), 250);
      }
    }

    function onMessage(ev: MessageEvent) {
      if (ev.origin !== window.location.origin) return;
      if (ev.source !== iframeEl.value?.contentWindow) return;
      const data = ev.data;
      if (!data || typeof data !== "object" || data.type !== READY_TYPE) return;
      onFrameReady();
    }

    function onIframeLoad() {
      frameReady.value = false;
      pingChild();
      if (pingTimer) clearInterval(pingTimer);
      let tries = 0;
      pingTimer = setInterval(() => {
        tries += 1;
        if (frameReady.value || tries > 40) {
          if (pingTimer) clearInterval(pingTimer);
          pingTimer = null;
          return;
        }
        pingChild();
      }, 150);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("message", onMessage);
    }

    onMounted(() => {
      nextTick(() => {
        scheduleMeasure();
        if (hostEl.value && typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(() => scheduleMeasure());
          ro.observe(hostEl.value);
        }
      });
    });

    onBeforeUnmount(() => {
      window.removeEventListener("message", onMessage);
      if (ro) ro.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
      if (measureRaf) cancelAnimationFrame(measureRaf);
      if (pingTimer) clearInterval(pingTimer);
    });

    watch(
      () => [props.templateId, props.hubConfig, props.mode] as const,
      () => {
        scheduleMeasure();
        schedulePost();
      },
      { deep: true }
    );

    watch(
      () => [props.scrollSection, props.scrollTick] as const,
      ([id]) => {
        if (id) scrollToSection(id);
      }
    );

    expose({ scrollToSection });

    return {
      hostEl,
      iframeEl,
      frameSrc,
      clipStyle,
      scaleWrapStyle,
      iframeStyle,
      onIframeLoad,
    };
  },
});
</script>

<style lang="scss" scoped>
.lpi {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  /* Scaling math assumes LTR box edges; parent builder is dir=rtl */
  direction: ltr;
}
.lpi-align {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
}
.lpi-clip {
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
  background: #fff;
  direction: ltr;
}
.lpi-scale {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
}
.lpi-frame {
  border: 0;
  display: block;
  background: #fff;
  pointer-events: none;
}
.lpi.phone .lpi-clip {
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(22, 19, 16, 0.16);
}
.lpi.desktop .lpi-clip {
  border-radius: 8px;
}
</style>
