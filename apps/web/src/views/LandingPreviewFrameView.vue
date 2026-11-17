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
import { isDragScrollClick } from "@/composables/useDragScroll";

const MSG_TYPE = "snapshare:landing-preview";
const READY_TYPE = "snapshare:landing-preview-ready";
const PING_TYPE = "snapshare:landing-preview-ping";
/** { type, sectionId, instant? } — scroll the preview to a section (`sec-{block id}`). */
const SCROLL_TYPE = "snapshare:landing-preview-scroll";
const FLASH_CLASS = "lpf-flash";
/** { type, key } — keys the builder handles even while focus is inside the preview (Esc closes). */
const KEY_TYPE = "snapshare:landing-preview-key";
/** { type, on, labels: { [blockId]: name } } — builder workspace edit mode (hover outline + «עריכה» chip). */
const EDIT_TYPE = "snapshare:landing-preview-edit";
/** { type, sectionId | "" } — solid outline on the section being edited. */
const SELECT_TYPE = "snapshare:landing-preview-select";
/** out: { type, sectionId } — the host clicked a section in edit mode. */
const PICK_TYPE = "snapshare:landing-preview-pick";

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

    /* ---------- edit mode (builder workspace only) ---------- */
    let editOn = false;
    let editLabels: Record<string, string> = {};
    let hoverEl: HTMLElement | null = null;
    let selId = "";
    let tagEl: HTMLElement | null = null;

    function ensureTag(): HTMLElement {
      if (tagEl) return tagEl;
      tagEl = document.createElement("div");
      tagEl.className = "lpf-tag";
      tagEl.setAttribute("aria-hidden", "true");
      document.body.appendChild(tagEl);
      return tagEl;
    }

    function sectionFrom(target: EventTarget | null): HTMLElement | null {
      let el = target instanceof Element ? target : null;
      if (el && el.closest(".lsn, .lpf-tag")) return null;
      while (el) {
        if (el instanceof HTMLElement && el.id.startsWith("sec-") && editLabels[el.id.slice(4)]) return el;
        el = el.parentElement;
      }
      return null;
    }

    function placeTag(el: HTMLElement | null) {
      const tag = ensureTag();
      if (!el || !editOn) {
        tag.classList.remove("on");
        return;
      }
      const r = el.getBoundingClientRect();
      tag.textContent = `עריכה · ${editLabels[el.id.slice(4)] || ""}`;
      tag.style.top = `${Math.max(8, r.top + 10)}px`;
      tag.style.right = `${Math.max(8, window.innerWidth - r.right + 12)}px`;
      tag.classList.add("on");
    }

    function setHover(el: HTMLElement | null) {
      if (hoverEl === el) return;
      hoverEl?.classList.remove("lpf-hover");
      hoverEl = el;
      el?.classList.add("lpf-hover");
      placeTag(el);
    }

    function applySel() {
      document.querySelectorAll(".lpf-sel").forEach((n) => n.classList.remove("lpf-sel"));
      if (!editOn || !selId) return;
      document.getElementById(`sec-${selId}`)?.classList.add("lpf-sel");
    }

    function onPointerMove(ev: PointerEvent) {
      if (!editOn || ev.pointerType === "touch") return;
      setHover(sectionFrom(ev.target));
    }

    function onClickCapture(ev: MouseEvent) {
      if (!editOn) return;
      // A drag on a carousel must not select the section (a plain click still does).
      if (isDragScrollClick()) return;
      const el = sectionFrom(ev.target);
      if (!el) return;
      // In edit mode a click selects the section instead of following its buttons.
      ev.preventDefault();
      ev.stopPropagation();
      selId = el.id.slice(4);
      applySel();
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: PICK_TYPE, sectionId: selId }, window.location.origin);
      }
    }

    function onScrollEdit() {
      if (hoverEl) placeTag(hoverEl);
    }

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
      if (data.type === EDIT_TYPE) {
        editOn = Boolean(data.on);
        if (data.labels && typeof data.labels === "object") editLabels = data.labels as Record<string, string>;
        document.documentElement.classList.toggle("lpf-edit", editOn);
        if (!editOn) setHover(null);
        applySel();
        return;
      }
      if (data.type === SELECT_TYPE) {
        selId = typeof data.sectionId === "string" ? data.sectionId : "";
        applySel();
        return;
      }
      if (data.type !== MSG_TYPE) return;
      const nextId = typeof data.templateId === "string" ? data.templateId : "";
      const nextCfg = data.hubConfig;
      if (!nextId || !nextCfg || typeof nextCfg !== "object") return;
      templateId.value = nextId;
      hubConfig.value = nextCfg as HubConfig;
      ready.value = true;
      if (selId) window.requestAnimationFrame(applySel);
    }

    function onKeydown(ev: KeyboardEvent) {
      if (ev.key !== "Escape" || !window.parent || window.parent === window) return;
      window.parent.postMessage({ type: KEY_TYPE, key: "Escape" }, window.location.origin);
    }

    // Listen immediately so early parent pings are not lost
    if (typeof window !== "undefined") {
      window.addEventListener("message", onMessage);
      window.addEventListener("keydown", onKeydown);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("click", onClickCapture, true);
      window.addEventListener("scroll", onScrollEdit, { passive: true });
      document.addEventListener("mouseleave", () => setHover(null));
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
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("scroll", onScrollEdit);
      tagEl?.remove();
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
/* Builder workspace edit mode: hover = dashed rose outline + «עריכה» chip, selected = solid. */
html.lpf-edit [id^="sec-"] {
  cursor: pointer;
}
html.lpf-edit .lpf-hover {
  outline: 2px dashed rgba(220, 91, 102, 0.85);
  outline-offset: -4px;
}
html.lpf-edit .lpf-sel {
  outline: 3px solid #dc5b66;
  outline-offset: -3px;
}
.lpf-tag {
  position: fixed;
  z-index: 70;
  display: none;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #dc5b66;
  color: #fff;
  font: 700 13px/1 "Rubik", "Heebo", sans-serif;
  box-shadow: 0 4px 14px rgba(220, 91, 102, 0.35);
  pointer-events: none;
}
html.lpf-edit .lpf-tag.on {
  display: inline-flex;
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
