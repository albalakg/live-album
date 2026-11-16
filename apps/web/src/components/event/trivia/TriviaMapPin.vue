<template>
  <div class="map-pin-wrap">
    <div
      ref="area"
      class="map-pin-area"
      :class="{ interactive: !disabled && !readonly, disabled }"
      :tabindex="!disabled && !readonly ? 0 : -1"
      role="application"
      :aria-label="ariaLabel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
    >
      <span class="map-grid" aria-hidden="true"></span>

      <i
        v-for="(g, i) in pins"
        :key="`g-${i}`"
        class="map-dot"
        :style="posStyle(g)"
        aria-hidden="true"
      ></i>

      <span
        v-if="correct"
        class="map-pin correct"
        :style="posStyle(correct)"
        aria-hidden="true"
      >
        <b>✓</b>
        <em v-if="label">{{ label }}</em>
      </span>

      <span
        v-if="modelValue"
        class="map-pin mine"
        :style="posStyle(modelValue)"
        aria-hidden="true"
      >
        <b>📍</b>
      </span>

      <span v-if="!modelValue && !readonly && !disabled" class="map-empty">
        לחצו על המפה כדי להניח נעץ
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

interface Point {
  x: number;
  y: number;
}

export default defineComponent({
  name: "TriviaMapPin",

  props: {
    modelValue: {
      type: Object as PropType<Point | null>,
      default: null,
    },
    /** Correct location (shown on reveal / editor). */
    correct: {
      type: Object as PropType<Point | null>,
      default: null,
    },
    /** Other players' pins (small dots). */
    pins: {
      type: Array as PropType<Point[]>,
      default: () => [],
    },
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    ariaLabel: { type: String, default: "מפה: לחצו כדי להניח נעץ" },
  },

  emits: ["update:modelValue"],

  data() {
    return { dragging: false };
  },

  methods: {
    clamp(n: number): number {
      return Math.max(0, Math.min(100, Math.round(n * 10) / 10));
    },

    posStyle(p: Point): Record<string, string> {
      return { left: `${this.clamp(Number(p.x))}%`, top: `${this.clamp(Number(p.y))}%` };
    },

    setFromEvent(event: PointerEvent) {
      const el = this.$refs.area as HTMLElement | undefined;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = this.clamp(((event.clientX - rect.left) / rect.width) * 100);
      const y = this.clamp(((event.clientY - rect.top) / rect.height) * 100);
      this.$emit("update:modelValue", { x, y });
    },

    onPointerDown(event: PointerEvent) {
      if (this.disabled || this.readonly) return;
      this.dragging = true;
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
      this.setFromEvent(event);
    },

    onPointerMove(event: PointerEvent) {
      if (!this.dragging) return;
      this.setFromEvent(event);
    },

    onPointerUp() {
      this.dragging = false;
    },

    onKeydown(event: KeyboardEvent) {
      if (this.disabled || this.readonly) return;
      const step = event.shiftKey ? 10 : 2;
      const base = this.modelValue || { x: 50, y: 50 };
      let { x, y } = base;
      // The map is always LTR: left = 0, right = 100.
      if (event.key === "ArrowLeft") x -= step;
      else if (event.key === "ArrowRight") x += step;
      else if (event.key === "ArrowUp") y -= step;
      else if (event.key === "ArrowDown") y += step;
      else return;
      event.preventDefault();
      this.$emit("update:modelValue", { x: this.clamp(x), y: this.clamp(y) });
    },
  },
});
</script>

<style lang="scss" scoped>
.map-pin-wrap {
  width: 100%;
  max-width: 100%;
  direction: ltr;
}

.map-pin-area {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  background:
    radial-gradient(ellipse at 22% 28%, #9fcf8b 0 18%, transparent 19%),
    radial-gradient(ellipse at 68% 24%, #b7d98f 0 22%, transparent 23%),
    radial-gradient(ellipse at 55% 68%, #8fc487 0 26%, transparent 27%),
    radial-gradient(ellipse at 18% 78%, #c9dfa0 0 14%, transparent 15%),
    linear-gradient(160deg, #a9d3e8, #7fb8d6);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.55), 0 8px 24px rgba(18, 16, 14, 0.16);
}

.map-pin-area.interactive {
  cursor: crosshair;
}

.map-pin-area.disabled {
  opacity: 0.75;
}

.map-pin-area:focus-visible {
  outline: 3px solid #c9a36a;
  outline-offset: 2px;
}

.map-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.35) 1px, transparent 1px);
  background-size: 25% 25%;
}

.map-empty {
  position: absolute;
  inset-inline: 12px;
  bottom: 12px;
  text-align: center;
  direction: rtl;
  font-weight: 800;
  font-size: 0.9rem;
  color: #12303f;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 999px;
  padding: 6px 12px;
  pointer-events: none;
}

.map-pin {
  position: absolute;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  line-height: 1;
}

.map-pin b {
  font-size: 2rem;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.35));
}

.map-pin.correct {
  transform: translate(-50%, -50%);
}

.map-pin.correct b {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  border-radius: 50%;
  background: #2fbe6a;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(47, 190, 106, 0.35);
}

.map-pin em {
  position: absolute;
  top: 100%;
  font-style: normal;
  font-weight: 800;
  font-size: 0.78rem;
  direction: rtl;
  margin-top: 8px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #fff;
  color: #161310;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: #dc5b66;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
</style>
