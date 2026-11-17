/**
 * Horizontal drag-to-scroll for overflow strips (carousels, filmstrips).
 *
 * Mouse only: grab cursor, drag to scroll, momentum after release, wheel
 * deltaY maps to sideways scroll until either end (then the page may scroll).
 * Touch pointers are left to native swipe. RTL uses the same scrollLeft -= dx
 * formula, which matches Chrome/Firefox (negative scrollLeft) and Safari.
 */

const DRAG_THRESHOLD_PX = 5;
const MOMENTUM_FRICTION = 0.95;
const MOMENTUM_MIN_VELOCITY = 0.04; // px per ms

let dragClickPending = false;
let dragClickTimer = 0;

/** Mark the forthcoming click as a drag so lightbox / builder select ignore it. */
export function flagDragScrollClick(): void {
  dragClickPending = true;
  if (dragClickTimer) window.clearTimeout(dragClickTimer);
  // click is dispatched after pointerup; clear on the next macrotask.
  dragClickTimer = window.setTimeout(() => {
    dragClickPending = false;
    dragClickTimer = 0;
  }, 0);
}

/** True during the click that follows a drag past the movement threshold. */
export function isDragScrollClick(): boolean {
  return dragClickPending;
}

export function bindDragScroll(el: HTMLElement): () => void {
  let pointerId: number | null = null;
  let startX = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let dragging = false;
  let snapSaved: string | null = null;
  let momentumRaf = 0;

  function isRtl(): boolean {
    return getComputedStyle(el).direction === "rtl";
  }

  function isOverflowing(): boolean {
    return el.scrollWidth - el.clientWidth > 1;
  }

  function stopMomentum(): void {
    if (momentumRaf) {
      cancelAnimationFrame(momentumRaf);
      momentumRaf = 0;
    }
  }

  function restoreSnap(): void {
    if (snapSaved === null) return;
    if (snapSaved) el.style.scrollSnapType = snapSaved;
    else el.style.removeProperty("scroll-snap-type");
    snapSaved = null;
  }

  function disableSnap(): void {
    if (snapSaved !== null) return;
    snapSaved = el.style.scrollSnapType;
    el.style.scrollSnapType = "none";
  }

  function startMomentum(): void {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) {
      restoreSnap();
      return;
    }
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      velocity *= Math.pow(MOMENTUM_FRICTION, dt / 16);
      if (Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) {
        momentumRaf = 0;
        restoreSnap();
        return;
      }
      const before = el.scrollLeft;
      el.scrollLeft = before + velocity * dt;
      if (el.scrollLeft === before) {
        momentumRaf = 0;
        restoreSnap();
        return;
      }
      momentumRaf = requestAnimationFrame(step);
    };
    momentumRaf = requestAnimationFrame(step);
  }

  function onPointerDown(e: PointerEvent): void {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (!isOverflowing()) return;
    stopMomentum();
    restoreSnap();
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    lastT = performance.now();
    velocity = 0;
    dragging = false;

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const now = performance.now();
      const dx = ev.clientX - lastX;
      const dt = Math.max(1, now - lastT);
      lastX = ev.clientX;
      lastT = now;
      if (!dragging) {
        if (Math.abs(ev.clientX - startX) < DRAG_THRESHOLD_PX) return;
        dragging = true;
        disableSnap();
        el.classList.add("is-dragging");
        try {
          el.setPointerCapture(ev.pointerId);
        } catch {
          /* setPointerCapture can fail on detached nodes */
        }
      }
      ev.preventDefault();
      const before = el.scrollLeft;
      el.scrollLeft = before - dx;
      const applied = el.scrollLeft - before;
      velocity = 0.75 * velocity + 0.25 * (applied / dt);
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      pointerId = null;
      if (dragging) {
        dragging = false;
        el.classList.remove("is-dragging");
        flagDragScrollClick();
        startMomentum();
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function onWheel(e: WheelEvent): void {
    if (!isOverflowing()) return;
    // Leave trackpad / mouse horizontal swipes to native scrolling.
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (e.deltaY === 0) return;
    // Wheel down (positive deltaY) advances toward the end of the strip.
    const mapped = isRtl() ? -e.deltaY : e.deltaY;
    const before = el.scrollLeft;
    el.scrollLeft = before + mapped;
    if (el.scrollLeft === before) return; // at an end — let the page scroll
    e.preventDefault();
  }

  function onDragStart(e: DragEvent): void {
    e.preventDefault();
  }

  function onClickCapture(e: MouseEvent): void {
    if (!isDragScrollClick()) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  el.classList.add("hub-drag-scroll");
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("dragstart", onDragStart);
  el.addEventListener("click", onClickCapture, true);

  return () => {
    stopMomentum();
    restoreSnap();
    el.classList.remove("hub-drag-scroll", "is-dragging");
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("wheel", onWheel);
    el.removeEventListener("dragstart", onDragStart);
    el.removeEventListener("click", onClickCapture, true);
  };
}
