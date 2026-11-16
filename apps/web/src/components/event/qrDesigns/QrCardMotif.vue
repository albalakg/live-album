<template>
  <svg
    class="qr-card-motif"
    viewBox="0 0 300 420"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <!-- floral-spray -->
    <g v-if="motif === 'floral-spray'" fill="none" stroke="currentColor" stroke-width="2.2">
      <path d="M40 380c40-80 40-160 10-240" opacity=".55" />
      <path d="M60 360c50-70 70-150 40-230" opacity=".4" />
      <circle cx="52" cy="130" r="14" fill="var(--q-accent)" stroke="none" />
      <circle cx="88" cy="168" r="10" fill="var(--q-accent-2)" stroke="none" opacity=".85" />
      <circle cx="36" cy="190" r="8" fill="var(--q-accent)" stroke="none" opacity=".7" />
      <g transform="translate(210,40)">
        <circle cx="30" cy="40" r="12" fill="var(--q-accent)" stroke="none" />
        <circle cx="54" cy="58" r="9" fill="var(--q-accent-2)" stroke="none" />
        <path d="M20 90c20-30 40-40 60-35" stroke="var(--q-accent-2)" />
      </g>
      <path d="M20 40h260M20 380h260" stroke="var(--q-accent-2)" stroke-width="1.4" opacity=".5" />
    </g>

    <!-- rose-arc -->
    <g v-else-if="motif === 'rose-arc'">
      <path
        d="M30 360c40-20 80-80 90-140 10 60 50 120 90 140"
        fill="none"
        stroke="var(--q-accent)"
        stroke-width="3"
        opacity=".7"
      />
      <circle cx="120" cy="200" r="16" fill="var(--q-accent)" opacity=".85" />
      <circle cx="150" cy="188" r="11" fill="var(--q-accent-2)" />
      <circle cx="180" cy="205" r="13" fill="var(--q-accent)" opacity=".75" />
      <path d="M40 50h220" stroke="var(--q-accent-2)" stroke-width="1.5" opacity=".6" />
      <path d="M60 70h180" stroke="var(--q-accent)" stroke-width="1" opacity=".35" />
    </g>

    <!-- ink-line -->
    <g v-else-if="motif === 'ink-line'" fill="none" stroke="currentColor" stroke-width="1.6">
      <rect x="28" y="28" width="244" height="364" rx="2" opacity=".55" />
      <path d="M48 56h204" opacity=".35" />
      <path d="M48 364h120" opacity=".35" />
      <circle cx="230" cy="364" r="4" fill="currentColor" stroke="none" />
    </g>

    <!-- sand-dots -->
    <g v-else-if="motif === 'sand-dots'" fill="var(--q-accent)">
      <circle v-for="(p, i) in sandDots" :key="i" :cx="p[0]" :cy="p[1]" :r="p[2]" :opacity="p[3]" />
      <rect
        x="36"
        y="36"
        width="228"
        height="348"
        rx="18"
        fill="none"
        stroke="var(--q-accent-2)"
        stroke-width="1.5"
        opacity=".45"
      />
    </g>

    <!-- neon-rings -->
    <g v-else-if="motif === 'neon-rings'" fill="none">
      <circle cx="150" cy="210" r="120" stroke="var(--q-accent)" stroke-width="2" opacity=".55" />
      <circle cx="150" cy="210" r="88" stroke="var(--q-accent-2)" stroke-width="2.5" opacity=".7" />
      <circle cx="150" cy="210" r="56" stroke="var(--q-accent)" stroke-width="1.5" opacity=".4" />
      <path d="M40 40h220M40 380h220" stroke="var(--q-accent-2)" stroke-width="1" opacity=".35" />
    </g>

    <!-- neon-grid -->
    <g v-else-if="motif === 'neon-grid'" stroke="var(--q-accent)" stroke-width="1" opacity=".35">
      <path v-for="x in [50, 100, 150, 200, 250]" :key="'vx' + x" :d="`M${x} 20v380`" />
      <path
        v-for="y in [60, 120, 180, 240, 300, 360]"
        :key="'hy' + y"
        :d="`M20 ${y}h260`"
        stroke="var(--q-accent-2)"
      />
      <rect
        x="24"
        y="24"
        width="252"
        height="372"
        fill="none"
        stroke="var(--q-accent)"
        stroke-width="2"
        opacity=".7"
      />
    </g>

    <!-- retro-sun -->
    <g v-else-if="motif === 'retro-sun'">
      <circle cx="150" cy="70" r="36" fill="var(--q-accent)" />
      <g stroke="var(--q-accent)" stroke-width="3" opacity=".75">
        <path v-for="(a, i) in sunRays" :key="i" :d="a" />
      </g>
      <path
        d="M0 320c40-40 80-40 120 0s80 40 120 0 80-40 120 0v100H0z"
        fill="var(--q-accent-2)"
        opacity=".35"
      />
      <path
        d="M0 350c40-30 80-30 120 0s80 30 120 0 80-30 120 0v70H0z"
        fill="var(--q-accent)"
        opacity=".25"
      />
    </g>

    <!-- vinyl -->
    <g v-else-if="motif === 'vinyl'">
      <circle cx="150" cy="210" r="130" fill="#0e0c10" opacity=".55" />
      <circle cx="150" cy="210" r="100" fill="none" stroke="var(--q-accent-2)" stroke-width="2" opacity=".4" />
      <circle cx="150" cy="210" r="70" fill="none" stroke="var(--q-accent)" stroke-width="1.5" opacity=".5" />
      <circle cx="150" cy="210" r="22" fill="var(--q-accent)" />
      <circle cx="150" cy="210" r="8" fill="#1a1218" />
    </g>

    <!-- boho-weave -->
    <g v-else-if="motif === 'boho-weave'" fill="none" stroke="var(--q-accent)" stroke-width="2">
      <path d="M40 60c40 20 40 40 0 60s-40 40 0 60 40 40 0 60 40 40 0 60" opacity=".55" />
      <path
        d="M260 60c-40 20-40 40 0 60s40 40 0 60-40 40 0 60-40 40 0 60"
        stroke="var(--q-accent-2)"
        opacity=".65"
      />
      <circle cx="150" cy="50" r="10" fill="var(--q-accent)" stroke="none" />
      <circle cx="150" cy="370" r="10" fill="var(--q-accent-2)" stroke="none" />
    </g>

    <!-- boho-moon -->
    <g v-else-if="motif === 'boho-moon'">
      <circle cx="220" cy="70" r="34" fill="var(--q-accent)" opacity=".9" />
      <circle cx="232" cy="64" r="28" fill="var(--q-bg)" />
      <g fill="var(--q-accent-2)" opacity=".7">
        <circle cx="50" cy="100" r="2.5" />
        <circle cx="80" cy="60" r="1.8" />
        <circle cx="110" cy="90" r="2.2" />
        <circle cx="70" cy="140" r="1.5" />
        <circle cx="40" cy="320" r="2" />
        <circle cx="260" cy="340" r="2.4" />
      </g>
      <path
        d="M30 380c50-40 90-40 140 0s100 40 150 0"
        fill="none"
        stroke="var(--q-accent)"
        stroke-width="1.5"
        opacity=".45"
      />
    </g>

    <!-- deco-fan -->
    <g v-else-if="motif === 'deco-fan'" fill="none" stroke="var(--q-accent)" stroke-width="1.8">
      <path d="M150 400 L40 120" opacity=".7" />
      <path d="M150 400 L80 90" opacity=".55" />
      <path d="M150 400 L120 70" opacity=".7" />
      <path d="M150 400 L150 60" opacity=".85" />
      <path d="M150 400 L180 70" opacity=".7" />
      <path d="M150 400 L220 90" opacity=".55" />
      <path d="M150 400 L260 120" opacity=".7" />
      <path
        d="M50 130c30-40 70-70 100-70s70 30 100 70"
        stroke="var(--q-accent-2)"
        stroke-width="2.2"
      />
      <rect x="40" y="20" width="220" height="8" fill="var(--q-accent)" stroke="none" />
      <rect x="40" y="392" width="220" height="8" fill="var(--q-accent)" stroke="none" />
    </g>

    <!-- deco-geo -->
    <g v-else-if="motif === 'deco-geo'" fill="none" stroke="currentColor" stroke-width="1.6">
      <path d="M150 30 L270 120 L150 210 L30 120 Z" opacity=".5" />
      <path d="M150 90 L210 135 L150 180 L90 135 Z" stroke="var(--q-accent-2)" />
      <path d="M30 300h240M30 320h240" opacity=".35" />
      <rect x="24" y="24" width="252" height="372" opacity=".4" />
    </g>

    <!-- balloons -->
    <g v-else-if="motif === 'balloons'">
      <g transform="translate(40,40)">
        <ellipse cx="28" cy="36" rx="22" ry="28" fill="var(--q-accent)" />
        <path d="M28 64c0 20-8 40-4 70" fill="none" stroke="#5a5048" stroke-width="1.5" />
      </g>
      <g transform="translate(210,55)">
        <ellipse cx="28" cy="36" rx="22" ry="28" fill="var(--q-accent-2)" />
        <path d="M28 64c0 18 6 36 2 66" fill="none" stroke="#5a5048" stroke-width="1.5" />
      </g>
      <g transform="translate(120,30)">
        <ellipse cx="28" cy="36" rx="20" ry="26" fill="#f0c040" />
        <path d="M28 62c-4 22 4 44 0 72" fill="none" stroke="#5a5048" stroke-width="1.5" />
      </g>
      <circle cx="60" cy="360" r="6" fill="var(--q-accent)" opacity=".5" />
      <circle cx="240" cy="350" r="8" fill="var(--q-accent-2)" opacity=".5" />
    </g>

    <!-- kid-stars -->
    <g v-else-if="motif === 'kid-stars'" fill="var(--q-accent)">
      <path
        v-for="(s, i) in kidStars"
        :key="i"
        :d="s.d"
        :transform="s.t"
        :fill="i % 2 ? 'var(--q-accent)' : 'var(--q-accent-2)'"
        opacity=".85"
      />
    </g>

    <!-- navy-rule -->
    <g v-else-if="motif === 'navy-rule'" fill="none" stroke="var(--q-accent)" stroke-width="2">
      <path d="M40 48h220" />
      <path d="M40 58h140" stroke="var(--q-accent-2)" stroke-width="1.4" />
      <path d="M40 372h220" />
      <path d="M120 382h140" stroke="var(--q-accent-2)" stroke-width="1.4" />
      <rect x="36" y="36" width="228" height="348" rx="4" opacity=".35" stroke-width="1.2" />
    </g>

    <!-- slate-blocks -->
    <g v-else-if="motif === 'slate-blocks'">
      <rect x="24" y="24" width="70" height="50" fill="var(--q-accent)" opacity=".35" />
      <rect x="206" y="24" width="70" height="50" fill="var(--q-accent-2)" opacity=".35" />
      <rect x="24" y="346" width="70" height="50" fill="var(--q-accent-2)" opacity=".3" />
      <rect x="206" y="346" width="70" height="50" fill="var(--q-accent)" opacity=".3" />
      <rect
        x="40"
        y="40"
        width="220"
        height="340"
        fill="none"
        stroke="var(--q-accent)"
        stroke-width="1.5"
        opacity=".45"
      />
    </g>

    <!-- wash-blush -->
    <g v-else-if="motif === 'wash-blush'" opacity=".55">
      <ellipse cx="70" cy="80" rx="70" ry="50" fill="var(--q-accent)" />
      <ellipse cx="230" cy="120" rx="80" ry="60" fill="var(--q-accent-2)" />
      <ellipse cx="90" cy="340" rx="90" ry="55" fill="var(--q-accent-2)" />
      <ellipse cx="240" cy="320" rx="60" ry="45" fill="var(--q-accent)" />
    </g>

    <!-- wash-ocean -->
    <g v-else-if="motif === 'wash-ocean'" opacity=".5">
      <ellipse cx="80" cy="70" rx="90" ry="55" fill="var(--q-accent)" />
      <ellipse cx="220" cy="100" rx="75" ry="50" fill="var(--q-accent-2)" />
      <path
        d="M0 340c40-30 80-30 120 0s80 30 120 0 60-20 90 10v70H0z"
        fill="var(--q-accent)"
        opacity=".8"
      />
    </g>

    <!-- foil-ornament -->
    <g v-else-if="motif === 'foil-ornament'" fill="none" stroke="var(--q-accent)" stroke-width="1.8">
      <path d="M150 36c-30 20-40 40-40 60 0-20-10-40-40-60 30 8 50 8 80 0z" fill="var(--q-accent)" stroke="none" opacity=".85" />
      <path d="M70 70h160M70 350h160" stroke-width="1.2" opacity=".55" />
      <path d="M90 90h120M90 330h120" stroke="var(--q-accent-2)" stroke-width="1" opacity=".45" />
      <circle cx="150" cy="384" r="8" fill="var(--q-accent)" stroke="none" />
    </g>

    <!-- foil-frame -->
    <g v-else-if="motif === 'foil-frame'" fill="none" stroke="var(--q-accent)" stroke-width="2">
      <rect x="28" y="28" width="244" height="364" rx="6" />
      <rect x="40" y="40" width="220" height="340" rx="3" stroke-width="1" opacity=".45" />
      <path d="M60 56h180M60 364h180" stroke="var(--q-accent-2)" stroke-width="1.2" />
    </g>

    <!-- fest-burst -->
    <g v-else-if="motif === 'fest-burst'" stroke-linecap="round">
      <g stroke="var(--q-accent)" stroke-width="3">
        <path v-for="(r, i) in burstRays" :key="i" :d="r" opacity=".8" />
      </g>
      <circle cx="150" cy="210" r="18" fill="var(--q-accent-2)" />
    </g>

    <!-- fest-dunes -->
    <g v-else-if="motif === 'fest-dunes'">
      <circle cx="150" cy="64" r="28" fill="var(--q-accent)" opacity=".9" />
      <path d="M0 280c50-50 100-50 150 0s100 50 150 0v140H0z" fill="var(--q-accent-2)" opacity=".35" />
      <path d="M0 320c55-40 110-40 165 0s90 35 135 0v100H0z" fill="var(--q-accent)" opacity=".28" />
    </g>

    <!-- soft-clouds -->
    <g v-else-if="motif === 'soft-clouds'" fill="var(--q-accent-2)" opacity=".7">
      <ellipse cx="70" cy="70" rx="40" ry="22" />
      <ellipse cx="100" cy="70" rx="28" ry="18" />
      <ellipse cx="220" cy="90" rx="36" ry="20" />
      <ellipse cx="250" cy="90" rx="24" ry="16" />
      <ellipse cx="80" cy="350" rx="44" ry="22" />
      <ellipse cx="230" cy="340" rx="38" ry="20" />
      <circle cx="150" cy="48" r="6" fill="var(--q-accent)" />
    </g>

    <!-- pastel-bow -->
    <g v-else-if="motif === 'pastel-bow'">
      <path d="M110 50c-30-20-50 10-30 30l40 10 40-10c20-20 0-50-30-30l-20 14z" fill="var(--q-accent)" opacity=".85" />
      <circle cx="150" cy="64" r="8" fill="var(--q-accent-2)" />
      <path
        d="M40 360c40-30 80-30 120 0s80 30 120 0"
        fill="none"
        stroke="var(--q-accent-2)"
        stroke-width="2"
        opacity=".6"
      />
    </g>

    <!-- torah-motif -->
    <g v-else-if="motif === 'torah-motif'" fill="none" stroke="var(--q-accent)" stroke-width="2">
      <rect x="100" y="40" width="100" height="70" rx="8" fill="var(--q-accent-2)" stroke="none" opacity=".35" />
      <path d="M110 50h80M110 65h80M110 80h60" stroke-width="1.4" opacity=".6" />
      <circle cx="150" cy="120" r="6" fill="var(--q-accent)" stroke="none" />
      <path d="M40 360h220M40 375h160" stroke="var(--q-accent-2)" stroke-width="1.5" />
    </g>

    <!-- spark-arch -->
    <g v-else-if="motif === 'spark-arch'">
      <path
        d="M50 160c0-70 45-110 100-110s100 40 100 110"
        fill="none"
        stroke="var(--q-accent)"
        stroke-width="2.5"
        opacity=".75"
      />
      <g fill="var(--q-accent-2)">
        <circle cx="80" cy="90" r="3" />
        <circle cx="150" cy="55" r="3.5" />
        <circle cx="220" cy="90" r="3" />
        <circle cx="110" cy="70" r="2" />
        <circle cx="190" cy="70" r="2" />
      </g>
      <path d="M40 370h220" stroke="var(--q-accent)" stroke-width="1.5" opacity=".45" />
    </g>

    <!-- romance-hearts -->
    <g v-else-if="motif === 'romance-hearts'" fill="var(--q-accent)" opacity=".75">
      <path d="M60 70c0-12 10-20 20-20 8 0 14 4 20 12 6-8 12-12 20-12 10 0 20 8 20 20 0 22-40 42-40 42S60 92 60 70z" />
      <path
        d="M200 330c0-10 8-16 16-16 6 0 11 3 16 10 5-7 10-10 16-10 8 0 16 6 16 16 0 18-32 34-32 34S200 348 200 330z"
        fill="var(--q-accent-2)"
      />
      <path d="M40 380c70-40 150-40 220 0" fill="none" stroke="var(--q-accent-2)" stroke-width="1.5" opacity=".5" />
    </g>

    <!-- confetti -->
    <g v-else-if="motif === 'confetti'">
      <rect
        v-for="(c, i) in confettiBits"
        :key="i"
        :x="c[0]"
        :y="c[1]"
        :width="c[2]"
        :height="c[3]"
        :fill="c[4]"
        :transform="`rotate(${c[5]} ${c[0]} ${c[1]})`"
        opacity=".8"
      />
    </g>

    <!-- velvet -->
    <g v-else-if="motif === 'velvet'" fill="none" stroke="var(--q-accent)" stroke-width="1.5">
      <rect x="32" y="32" width="236" height="356" rx="10" opacity=".55" />
      <path d="M70 56h160M70 364h160" stroke="var(--q-accent-2)" opacity=".5" />
      <circle cx="150" cy="56" r="5" fill="var(--q-accent)" stroke="none" />
      <circle cx="150" cy="364" r="5" fill="var(--q-accent)" stroke="none" />
    </g>

    <!-- palm -->
    <g v-else-if="motif === 'palm'" fill="none" stroke="var(--q-accent)" stroke-width="2.2">
      <path d="M60 200c20-60 40-100 50-140" />
      <path d="M110 70c-40 10-70 40-80 70" stroke="var(--q-accent-2)" />
      <path d="M110 70c-10 40 10 80 40 110" />
      <path d="M110 70c40 5 70 30 90 60" stroke="var(--q-accent-2)" />
      <path d="M220 360c-20-40-40-60-70-80" opacity=".5" />
      <circle cx="240" cy="70" r="22" fill="var(--q-accent-2)" stroke="none" opacity=".85" />
    </g>

    <!-- tiles -->
    <g v-else-if="motif === 'tiles'" fill="none" stroke="var(--q-accent)" stroke-width="1.4" opacity=".55">
      <rect v-for="(t, i) in tileCells" :key="i" :x="t[0]" :y="t[1]" width="44" height="44" />
      <rect
        x="24"
        y="24"
        width="252"
        height="372"
        stroke="var(--q-accent-2)"
        stroke-width="2"
        opacity="1"
      />
    </g>

    <!-- ribbon -->
    <g v-else-if="motif === 'ribbon'">
      <path
        d="M0 70h300"
        stroke="var(--q-accent)"
        stroke-width="18"
        opacity=".85"
      />
      <path
        d="M0 70h300"
        stroke="var(--q-accent-2)"
        stroke-width="6"
        opacity=".7"
      />
      <path
        d="M0 350h300"
        stroke="var(--q-accent)"
        stroke-width="14"
        opacity=".7"
      />
      <circle cx="150" cy="70" r="10" fill="#fff" opacity=".5" />
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { QrV2Motif } from "@/helpers/qrCardDesignsV2";

export default defineComponent({
  name: "QrCardMotif",
  props: {
    motif: {
      type: String as PropType<QrV2Motif>,
      required: true,
    },
  },
  data() {
    return {
      sandDots: [
        [48, 56, 3, 0.45],
        [72, 90, 2, 0.35],
        [40, 140, 2.5, 0.4],
        [250, 70, 3, 0.4],
        [230, 120, 2, 0.35],
        [260, 180, 2.5, 0.3],
        [50, 320, 3, 0.4],
        [80, 360, 2, 0.35],
        [240, 340, 3, 0.4],
        [210, 370, 2, 0.3],
      ] as number[][],
      sunRays: [
        "M150 20v18",
        "M150 102v18",
        "M90 70h18",
        "M192 70h18",
        "M108 38l12 12",
        "M180 90l12 12",
        "M108 102l12-12",
        "M180 38l12-12",
      ],
      kidStars: [
        {
          d: "M0-10 L3-3 L10-3 L4 2 L6 10 L0 5 L-6 10 L-4 2 L-10-3 L-3-3 Z",
          t: "translate(60 60) scale(1.4)",
        },
        {
          d: "M0-10 L3-3 L10-3 L4 2 L6 10 L0 5 L-6 10 L-4 2 L-10-3 L-3-3 Z",
          t: "translate(230 80) scale(1.1)",
        },
        {
          d: "M0-10 L3-3 L10-3 L4 2 L6 10 L0 5 L-6 10 L-4 2 L-10-3 L-3-3 Z",
          t: "translate(80 340) scale(1.2)",
        },
        {
          d: "M0-10 L3-3 L10-3 L4 2 L6 10 L0 5 L-6 10 L-4 2 L-10-3 L-3-3 Z",
          t: "translate(220 350) scale(1)",
        },
      ],
      burstRays: [
        "M150 210 L150 60",
        "M150 210 L240 90",
        "M150 210 L270 210",
        "M150 210 L240 330",
        "M150 210 L150 360",
        "M150 210 L60 330",
        "M150 210 L30 210",
        "M150 210 L60 90",
      ],
      confettiBits: [
        [40, 50, 10, 4, "var(--q-accent)", 20],
        [70, 80, 8, 3, "var(--q-accent-2)", -15],
        [220, 60, 12, 4, "var(--q-accent)", 40],
        [250, 100, 8, 3, "#f0c040", -25],
        [50, 340, 10, 4, "var(--q-accent-2)", 10],
        [90, 360, 8, 3, "var(--q-accent)", -30],
        [210, 350, 11, 4, "#f0c040", 18],
        [250, 320, 8, 3, "var(--q-accent)", -12],
        [150, 40, 9, 3, "var(--q-accent-2)", 5],
        [180, 380, 10, 4, "var(--q-accent)", 22],
      ] as (number | string)[][],
      tileCells: [
        [40, 40],
        [100, 40],
        [160, 40],
        [220, 40],
        [40, 100],
        [220, 100],
        [40, 280],
        [220, 280],
        [40, 340],
        [100, 340],
        [160, 340],
        [220, 340],
      ] as number[][],
    };
  },
});
</script>

<style scoped>
.qr-card-motif {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--q-ink, #161310);
  pointer-events: none;
  opacity: 0.92;
}
</style>
