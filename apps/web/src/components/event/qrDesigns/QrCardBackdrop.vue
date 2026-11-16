<template>
  <div
    class="qr-card-backdrop"
    :class="[`qr-card-backdrop--${design.id}`, { 'qr-card-backdrop--inv': design.inverted }]"
    :style="cssVars"
  >
    <div class="qr-card-backdrop__wash" />
    <QrCardMotif :motif="design.motif" />
    <div class="qr-card-backdrop__vignette" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { QrV2Design } from "@/helpers/qrCardDesignsV2";
import QrCardMotif from "@/components/event/qrDesigns/QrCardMotif.vue";

/** CSS/SVG card face for v2 designs (no remote assets). */
export default defineComponent({
  name: "QrCardBackdrop",
  components: { QrCardMotif },
  props: {
    design: {
      type: Object as PropType<QrV2Design>,
      required: true,
    },
  },
  computed: {
    cssVars(): Record<string, string> {
      const v = this.design.vars;
      return {
        "--q-bg": v.bg,
        "--q-bg-2": v.bg2,
        "--q-accent": v.accent,
        "--q-accent-2": v.accent2,
        "--q-ink": v.ink,
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.qr-card-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(165deg, var(--q-bg), var(--q-bg-2));
  color: var(--q-ink);
}

.qr-card-backdrop__wash {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(ellipse 70% 45% at 20% 15%, var(--q-accent), transparent 70%),
    radial-gradient(ellipse 60% 40% at 85% 80%, var(--q-accent-2), transparent 70%);
  opacity: 0.38;
  pointer-events: none;
}

.qr-card-backdrop__vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 0 1px rgba(22, 19, 16, 0.12);
  pointer-events: none;
}

/* Motif-specific polish without heavy per-card components */
.qr-card-backdrop--neon-pulse,
.qr-card-backdrop--neon-grid,
.qr-card-backdrop--festival-burst,
.qr-card-backdrop--dark-velvet,
.qr-card-backdrop--art-deco-fan,
.qr-card-backdrop--gold-foil-ornate,
.qr-card-backdrop--boho-moon,
.qr-card-backdrop--retro-vinyl,
.qr-card-backdrop--corporate-slate {
  .qr-card-backdrop__vignette {
    box-shadow:
      inset 0 0 60px rgba(0, 0, 0, 0.35),
      inset 0 0 0 1px rgba(201, 163, 106, 0.35);
  }
}

.qr-card-backdrop--watercolor-blush .qr-card-backdrop__wash,
.qr-card-backdrop--watercolor-ocean .qr-card-backdrop__wash {
  filter: blur(0.5px);
  opacity: 0.95;
}

.qr-card-backdrop--geometric-tiles {
  background:
    repeating-linear-gradient(
      90deg,
      var(--q-bg) 0 48px,
      var(--q-bg-2) 48px 96px
    ),
    linear-gradient(180deg, var(--q-bg), var(--q-bg-2));
  background-blend-mode: multiply;
}

.qr-card-backdrop--minimal-ink {
  background: var(--q-bg);
}
</style>
