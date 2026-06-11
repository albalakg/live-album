<template>
  <div
    class="mobile-device"
    :class="[`mobile-device--${size}`, { 'mobile-device--tilted': tilt }]"
  >
    <div class="mobile-device__backdrop" aria-hidden="true">
      <span class="mobile-device__blob mobile-device__blob--pink" />
      <span class="mobile-device__blob mobile-device__blob--green" />
      <span class="mobile-device__blob mobile-device__blob--white" />
      <span class="mobile-device__float mobile-device__float--one" />
      <span class="mobile-device__float mobile-device__float--two" />
    </div>

    <div class="mobile-device__bezel">
      <span class="mobile-device__notch" aria-hidden="true" />
      <div class="mobile-device__screen">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "MobileDeviceFrame",

  props: {
    size: {
      type: String as PropType<"sm" | "md">,
      default: "md",
    },
    tilt: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.mobile-device {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 300px;
  margin-inline: auto;

  &--sm {
    max-width: 220px;
  }

  &--tilted {
    .mobile-device__bezel {
      transform: perspective(900px) rotateY(-6deg) rotateZ(2deg);
    }
  }
}

.mobile-device__backdrop {
  position: absolute;
  inset: -18% -28%;
  z-index: 0;
  pointer-events: none;
}

.mobile-device__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);

  &--pink {
    width: 55%;
    height: 45%;
    top: 10%;
    right: 5%;
    background: rgba(246, 133, 137, 0.28);
  }

  &--green {
    width: 45%;
    height: 40%;
    bottom: 8%;
    left: 0;
    background: rgba(121, 174, 96, 0.22);
  }

  &--white {
    width: 35%;
    height: 30%;
    top: 35%;
    left: 25%;
    background: rgba(255, 255, 255, 0.2);
  }
}

.mobile-device__float {
  position: absolute;
  border-radius: 24px;
  opacity: 0.35;
  filter: blur(2px);

  &--one {
    width: 72%;
    height: 58%;
    top: 18%;
    left: -8%;
    background: rgba(255, 255, 255, 0.12);
    transform: rotate(-8deg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  &--two {
    width: 68%;
    height: 54%;
    bottom: 12%;
    right: -6%;
    background: rgba(0, 0, 0, 0.08);
    transform: rotate(12deg);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
  }
}

.mobile-device__bezel {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 12px 10px 14px;
  border-radius: 44px;
  background: linear-gradient(145deg, #2a2a2e 0%, #1a1a1d 55%, #0f0f11 100%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 24px 48px rgba(0, 0, 0, 0.25),
    0 48px 80px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: transform 320ms ease;
}

.mobile-device--sm .mobile-device__bezel {
  padding: 10px 8px 12px;
  border-radius: 36px;
}

.mobile-device__notch {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 28%;
  height: 22px;
  border-radius: 999px;
  background: #0a0a0c;
  z-index: 3;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.06);
}

.mobile-device--sm .mobile-device__notch {
  top: 14px;
  height: 18px;
}

.mobile-device__screen {
  position: relative;
  overflow: hidden;
  border-radius: 32px;
  background: #000;
  aspect-ratio: 9 / 19.5;

  :deep(video),
  :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.mobile-device--sm .mobile-device__screen {
  border-radius: 26px;
}

@media (prefers-reduced-motion: reduce) {
  .mobile-device--tilted .mobile-device__bezel {
    transform: none;
  }
}
</style>
