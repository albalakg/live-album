/**
 * Shared plumbing for the gen-2 variant sections (hero / gallery / schedule):
 * which template + layout to render, the section-width breakpoint, and gen-2 fonts.
 */
import { computed, inject, onBeforeUnmount, onMounted, ref, type Ref } from "vue";
import { LANDING_CTX } from "../../landingContext";
import { getTemplate, googleFontsHref } from "../../templates/registry";
import { resolveVariant, type VariantBlockType } from "../../variants/variants";

/** Same breakpoint as SectionGallery (13f6fcd): the section's own width, not the window. */
export const WIDE_MIN = 768;

export function useVariantBlock(type: VariantBlockType, data: () => Record<string, unknown>) {
  const ctx = inject(LANDING_CTX, null);
  const templateId = computed(() => {
    const hint = data().__tpl;
    return typeof hint === "string" && hint ? hint : ctx?.templateId || "";
  });
  /** "legacy" for the original 14 templates (render the old component untouched). */
  const variant = computed(() => resolveVariant(templateId.value, type, data().__variant));
  const preview = computed(() => ctx?.preview === true);
  return { ctx, templateId, variant, preview };
}

/** isWide = the section is at least WIDE_MIN px wide (rAF-batched ResizeObserver, no RO-loop overlay). */
export function useWideSection(el: Ref<HTMLElement | null>) {
  const isWide = ref(false);
  let ro: ResizeObserver | null = null;
  let tick = 0;
  function measure() {
    const w = el.value?.clientWidth ?? 0;
    const next = w >= WIDE_MIN;
    if (isWide.value !== next) isWide.value = next;
  }
  function schedule() {
    if (tick) return;
    tick = requestAnimationFrame(() => {
      tick = 0;
      measure();
    });
  }
  onMounted(() => {
    measure();
    if (typeof ResizeObserver !== "undefined" && el.value) {
      ro = new ResizeObserver(() => schedule());
      ro.observe(el.value);
    }
  });
  onBeforeUnmount(() => {
    if (tick) cancelAnimationFrame(tick);
    tick = 0;
    ro?.disconnect();
    ro = null;
  });
  return { isWide };
}

const loadedFonts = new Set<string>();

/** Gen-2 templates use a heading + body font pair; load both once (the renderer loads the heading only). */
export function ensureGen2Fonts(templateId: string): void {
  if (typeof document === "undefined" || !templateId || loadedFonts.has(templateId)) return;
  const meta = getTemplate(templateId);
  if (!meta || meta.generation !== 2) return;
  loadedFonts.add(templateId);
  const families = [meta.default_font, meta.body_font || "", "Heebo"].filter(Boolean) as string[];
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = googleFontsHref(families);
  link.setAttribute("data-landing-fonts-v2", templateId);
  document.head.appendChild(link);
}

/** Countdown parts until `iso` (frozen in ?shot mode so screenshots are stable). */
export function useCountdown(iso: () => unknown, frozen: () => boolean) {
  const parts = ref({ days: 0, hours: 0, mins: 0 });
  const ended = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;
  function tick() {
    if (frozen()) {
      ended.value = false;
      parts.value = { days: 204, hours: 22, mins: 0 };
      return;
    }
    const raw = String(iso() || "");
    const target = new Date(raw).getTime();
    if (!raw || Number.isNaN(target)) {
      ended.value = false;
      parts.value = { days: 0, hours: 0, mins: 0 };
      return;
    }
    const diff = target - Date.now();
    if (diff <= 0) {
      ended.value = true;
      parts.value = { days: 0, hours: 0, mins: 0 };
      return;
    }
    ended.value = false;
    const m = Math.floor(diff / 60000);
    parts.value = { days: Math.floor(m / 1440), hours: Math.floor((m % 1440) / 60), mins: m % 60 };
  }
  onMounted(() => {
    tick();
    if (!frozen()) timer = setInterval(tick, 30000);
  });
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
  });
  return { parts, ended, tick };
}
