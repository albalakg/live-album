<template>
  <div class="qr-card-frame" :class="{ 'qr-card-frame--mini': mini }">
    <div class="qr-card-frame__stack">
      <div class="qr-card-frame__qr">
        <slot name="qr" />
      </div>
      <div class="qr-card-frame__name" :style="textStyle">
        {{ eventName }}
      </div>
      <div
        v-if="showTagline"
        class="qr-card-frame__tagline"
        :style="textStyle"
      >
        {{ tagline }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/** Shared QR + event-name composition for live preview and gallery thumbnails. */
export default defineComponent({
  name: "QrCardFrame",

  props: {
    eventName: {
      type: String,
      default: "האירוע שלכם",
    },
    textColor: {
      type: String,
      default: "#161310",
    },
    /** Show tagline under the name (templates without baked-in CTA). */
    showTagline: {
      type: Boolean,
      default: false,
    },
    tagline: {
      type: String,
      default: "סרקו והעלו תמונות",
    },
    /** Compact type scale for gallery thumbs. */
    mini: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    textStyle(): Record<string, string> {
      return { color: this.textColor };
    },
  },
});
</script>

<style lang="scss" scoped>
/*
 * Inset approximates the decorative inner window on ornate templates.
 * QR is ~48% of that window (≥ ~3cm on A6 when the card is full-bleed).
 * Stack is flex-centered as one group (QR + name [+ tagline]).
 */
.qr-card-frame {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 15% 16%;
  pointer-events: none;
  z-index: 1;
  container-type: size;
  container-name: qr-card;
}

.qr-card-frame__stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  /* ~4–6% of card height between QR and name */
  gap: 5cqh;
  box-sizing: border-box;
}

@supports not (gap: 1cqh) {
  .qr-card-frame__stack {
    gap: clamp(6px, 3.5vw, 18px);
  }
}

.qr-card-frame__qr {
  width: 48%;
  max-width: 48%;
  min-width: 0;
  flex: 0 0 auto;
  line-height: 0;
  background: #fff;
  overflow: hidden;
  box-sizing: border-box;
}

.qr-card-frame__qr :deep(.qr-code),
.qr-card-frame__qr :deep(.mini-qr) {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  height: auto !important;
  margin: 0 !important;
  background: #fff !important;
}

.qr-card-frame__qr :deep(svg) {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  aspect-ratio: 1 / 1;
  background: #fff !important;
}

.qr-card-frame__name {
  text-align: center;
  font-weight: 900;
  font-size: clamp(0.88rem, 5.2cqw, 1.2rem);
  letter-spacing: -0.02em;
  line-height: 1.25;
  max-width: 100%;
  background: none !important;
  text-shadow: none;
}

.qr-card-frame__tagline {
  text-align: center;
  font-weight: 700;
  font-size: clamp(0.68rem, 3.6cqw, 0.88rem);
  line-height: 1.3;
  max-width: 100%;
  margin-top: -1.2cqh;
  opacity: 0.92;
  background: none !important;
}

.qr-card-frame--mini {
  padding: 14% 15%;
}

.qr-card-frame--mini .qr-card-frame__stack {
  gap: 4.5cqh;
}

.qr-card-frame--mini .qr-card-frame__name {
  font-size: 0.55rem;
  font-weight: 800;
  line-height: 1.2;
}

.qr-card-frame--mini .qr-card-frame__tagline {
  font-size: 0.4rem;
  font-weight: 700;
  margin-top: -0.4cqh;
}
</style>
