import { onBeforeUnmount, onMounted, type Ref } from "vue";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Dialog behaviour for the wizard overlays: Esc closes, Tab stays inside, focus moves in on open
 * and returns to the opener on close, background does not scroll.
 */
export function useBuilderDialog(
  container: Ref<HTMLElement | null>,
  onClose: () => void,
  initialFocus?: () => HTMLElement | null | undefined
): void {
  let opener: HTMLElement | null = null;
  let prevOverflow = "";

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !container.value) return;
    const items = Array.from(container.value.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && (active === first || !container.value.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !container.value.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  }

  onMounted(() => {
    opener = document.activeElement as HTMLElement | null;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey, true);
    window.setTimeout(() => {
      const el = initialFocus?.() || container.value?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 30);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", onKey, true);
    document.body.style.overflow = prevOverflow;
    if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus();
  });
}
