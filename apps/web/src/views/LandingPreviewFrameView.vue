<template>
  <div class="lpf" dir="rtl" lang="he">
    <LandingRenderer
      v-if="ready && templateId && hubConfig"
      :template-id="templateId"
      :hub-config="hubConfig"
      mode="preview"
    />
    <div v-else class="lpf-placeholder" aria-hidden="true">תצוגה מקדימה</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import LandingRenderer from "@/components/landing/LandingRenderer.vue";
import type { HubConfig } from "@/components/landing/types";

const MSG_TYPE = "snapshare:landing-preview";
const READY_TYPE = "snapshare:landing-preview-ready";
const PING_TYPE = "snapshare:landing-preview-ping";
/** { type, sectionId, instant? } — scroll the preview to a section (`sec-{block id}`). */
const SCROLL_TYPE = "snapshare:landing-preview-scroll";
const FLASH_CLASS = "lpf-flash";
/** { type, key } — keys the builder handles even while focus is inside the preview (Esc closes). */
const KEY_TYPE = "snapshare:landing-preview-key";

export default defineComponent({
  name: "LandingPreviewFrameView",
  components: { LandingRenderer },
  setup() {
    const ready = ref(false);
    const templateId = ref("");
    const hubConfig = ref<HubConfig | null>(null);

    function postReady() {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: READY_TYPE }, window.location.origin);
      }
    }

    let scrollRaf = 0;

    function scrollToSection(sectionId: string, instant: boolean, tries = 0) {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      const el = document.getElementById(`sec-${sectionId}`);
      if (!el) {
        // The section may have just been enabled: wait for the renderer to paint it.
        if (tries < 40) {
          scrollRaf = requestAnimationFrame(() => scrollToSection(sectionId, instant, tries + 1));
        }
        return;
      }
      const reduce =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: instant || reduce ? "auto" : "smooth", block: "start" });
      if (!reduce) {
        el.classList.remove(FLASH_CLASS);
        void el.offsetWidth;
        el.classList.add(FLASH_CLASS);
        window.setTimeout(() => el.classList.remove(FLASH_CLASS), 1300);
      }
    }

    function onMessage(ev: MessageEvent) {
      if (ev.origin !== window.location.origin) return;
      const data = ev.data;
      if (!data || typeof data !== "object") return;
      if (data.type === PING_TYPE) {
        postReady();
        return;
      }
      if (data.type === SCROLL_TYPE) {
        if (typeof data.sectionId === "string" && data.sectionId) {
          scrollToSection(data.sectionId, Boolean(data.instant));
        }
        return;
      }
      if (data.type !== MSG_TYPE) return;
      const nextId = typeof data.templateId === "string" ? data.templateId : "";
      const nextCfg = data.hubConfig;
      if (!nextId || !nextCfg || typeof nextCfg !== "object") return;
      templateId.value = nextId;
      hubConfig.value = nextCfg as HubConfig;
      ready.value = true;
    }

    function onKeydown(ev: KeyboardEvent) {
      if (ev.key !== "Escape" || !window.parent || window.parent === window) return;
      window.parent.postMessage({ type: KEY_TYPE, key: "Escape" }, window.location.origin);
    }

    // Listen immediately so early parent pings are not lost
    if (typeof window !== "undefined") {
      window.addEventListener("message", onMessage);
      window.addEventListener("keydown", onKeydown);
    }

    onMounted(() => {
      document.documentElement.setAttribute("data-landing-preview-frame", "1");
      const robots = document.querySelector('meta[name="robots"]');
      if (robots) {
        robots.setAttribute("content", "noindex, nofollow");
      } else {
        const meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = "noindex, nofollow";
        document.head.appendChild(meta);
      }
      postReady();
    });

    onBeforeUnmount(() => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKeydown);
      document.documentElement.removeAttribute("data-landing-preview-frame");
    });

    return { ready, templateId, hubConfig };
  },
});
</script>

<style lang="scss">
/* Scrolling to the end of the preview must not chain into (and jump) the builder page behind it. */
html[data-landing-preview-frame],
html[data-landing-preview-frame] body {
  overscroll-behavior: contain;
}
/* Brief highlight on the section the host is editing (preview frame only). */
html[data-landing-preview-frame] .lpf-flash {
  animation: lpf-flash 1.2s ease-out;
}
@keyframes lpf-flash {
  0% {
    box-shadow: inset 0 0 0 4px #dc5b66;
  }
  100% {
    box-shadow: inset 0 0 0 4px transparent;
  }
}
</style>

<style lang="scss" scoped>
.lpf {
  min-height: 100vh;
  background: #fff;
}
.lpf-placeholder {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: #a39a90;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
