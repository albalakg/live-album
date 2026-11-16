<template>
  <span class="lst" :data-preview="preview" aria-hidden="true">
    <span v-for="n in slots" :key="n" class="lst-slot" :data-i="n" />
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { LiveModePreviewKind } from "@/helpers/liveScreenModes";

export default defineComponent({
  name: "LiveScreenModeThumb",
  props: {
    preview: {
      type: String as PropType<LiveModePreviewKind>,
      required: true,
    },
    slots: {
      type: Number,
      default: 1,
    },
  },
});
</script>

<style lang="scss" scoped>
.lst {
  display: grid;
  gap: 5px;
  height: 92px;
  padding: 10px;
  border-radius: 12px;
  background: #1c1814;
  overflow: hidden;
  position: relative;
}
.lst-slot {
  display: block;
  border-radius: 7px;
  background: linear-gradient(
    135deg,
    rgba(220, 91, 102, 0.55),
    rgba(201, 163, 106, 0.45)
  );
}
.lst[data-preview="kenburns"],
.lst[data-preview="fade"],
.lst[data-preview="spotlight"] {
  grid-template-columns: 1fr;
}
.lst[data-preview="kenburns"] .lst-slot,
.lst[data-preview="spotlight"] .lst-slot {
  animation: lst-kb 3.2s ease-in-out infinite alternate;
}
.lst[data-preview="fade"] .lst-slot {
  animation: lst-fade 2.4s ease-in-out infinite;
}
.lst[data-preview="mosaic"],
.lst[data-preview="grid"] {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}
.lst[data-preview="mosaic"] .lst-slot:nth-child(5),
.lst[data-preview="grid"] .lst-slot:nth-child(5) {
  animation: lst-pulse 1.8s ease-in-out infinite;
}
.lst[data-preview="masonry"] {
  grid-template-columns: 1.1fr 0.9fr 1fr;
  grid-template-rows: 1.2fr 0.8fr;
}
.lst[data-preview="masonry"] .lst-slot:nth-child(1) {
  grid-row: 1 / 3;
  animation: lst-rise 2.2s ease-in-out infinite;
}
.lst[data-preview="polaroid"],
.lst[data-preview="random"] {
  grid-template-columns: 1fr 1fr 1fr;
}
.lst[data-preview="polaroid"] .lst-slot,
.lst[data-preview="random"] .lst-slot {
  transform-origin: center;
}
.lst[data-preview="polaroid"] .lst-slot:nth-child(1) {
  transform: rotate(-8deg);
  animation: lst-tilt 2.6s ease-in-out infinite alternate;
}
.lst[data-preview="polaroid"] .lst-slot:nth-child(2) {
  transform: rotate(5deg);
}
.lst[data-preview="polaroid"] .lst-slot:nth-child(3) {
  transform: rotate(-3deg);
}
.lst[data-preview="filmstrip"] {
  grid-template-columns: 1fr;
  grid-template-rows: 1.5fr 0.55fr;
}
.lst[data-preview="filmstrip"] .lst-slot:nth-child(2),
.lst[data-preview="filmstrip"] .lst-slot:nth-child(3),
.lst[data-preview="filmstrip"] .lst-slot:nth-child(4),
.lst[data-preview="filmstrip"] .lst-slot:nth-child(5) {
  display: none;
}
.lst[data-preview="filmstrip"]::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  height: 16px;
  border-radius: 4px;
  background: repeating-linear-gradient(
    90deg,
    rgba(201, 163, 106, 0.55) 0 18px,
    transparent 18px 24px
  );
  animation: lst-strip 2.8s linear infinite;
}
.lst[data-preview="split"],
.lst[data-preview="pair"] {
  grid-template-columns: 1fr 1fr;
}
.lst[data-preview="herogrid"] {
  grid-template-columns: 1.4fr 0.8fr;
  grid-template-rows: 1fr 1fr;
}
.lst[data-preview="herogrid"] .lst-slot:nth-child(1) {
  grid-row: 1 / 3;
}
.lst[data-preview="herogrid"] .lst-slot:nth-child(2) {
  animation: lst-pulse 2s ease-in-out infinite;
}

@keyframes lst-kb {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08) translate(-2%, 1%);
  }
}
@keyframes lst-fade {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
}
@keyframes lst-pulse {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.35);
  }
}
@keyframes lst-rise {
  from {
    transform: translateY(4px);
  }
  to {
    transform: translateY(-4px);
  }
}
@keyframes lst-tilt {
  from {
    transform: rotate(-8deg) translateY(0);
  }
  to {
    transform: rotate(-4deg) translateY(-4px);
  }
}
@keyframes lst-strip {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 24px 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lst-slot,
  .lst::after {
    animation: none !important;
  }
}
</style>
