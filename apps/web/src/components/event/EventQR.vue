<template>
  <div
    class="qr-code"
    :class="{ 'qr-code--inverted': inverted, 'qr-code--quiet': keepQuietZone }"
  >
    <div class="qr-export" aria-hidden="true">
      <qrcode-svg
        :value="QRLink"
        level="H"
        :foreground="foreground"
        :background="resolvedBackground"
        :margin="moduleMargin"
        ref="qrSvg"
      />
    </div>
    <qrcode-vue
      ref="qrCode"
      :value="QRLink"
      :background="resolvedBackground"
      :foreground="foreground"
      :margin="moduleMargin"
      :size="renderedSize"
      level="H"
      render-as="svg"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import QrcodeVue, { QrcodeSvg } from "qrcode.vue";
import { IEvent } from "@/helpers/interfaces";

export default defineComponent({
  name: "EventQR",

  props: {
    background: {
      type: String,
      required: false,
      default: "transparent",
    },
    foreground: {
      type: String,
      required: false,
      default: "#000000",
    },
    inverted: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 0,
    },
    /** Quiet-zone modules around the QR (qrcode.vue margin). */
    margin: {
      type: Number,
      default: 1,
    },
    /** Keep the white quiet-zone plate (do not strip / force transparent). */
    keepQuietZone: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    QrcodeVue,
    QrcodeSvg,
  },

  computed: {
    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },

    QRLink(): string {
      return window.location.origin + `/event/uploads/${this.event.path}`;
    },

    moduleMargin(): number {
      return this.margin > 0 ? this.margin : 1;
    },

    resolvedBackground(): string {
      const bg = this.background || "transparent";
      if (this.keepQuietZone) {
        if (bg === "transparent") return "#ffffff";
        return bg;
      }
      if (bg === "#fff" || bg === "#ffffff" || bg === "#FFFFFF" || bg === "white") {
        return "transparent";
      }
      return bg;
    },

    renderedSize(): number {
      if (this.size > 0) return this.size;
      return this.$bp.isMobile ? 88 : 148;
    },
  },

  watch: {
    foreground() {
      this.$nextTick(() => this.stripWhitePlate());
    },
    resolvedBackground() {
      this.$nextTick(() => this.stripWhitePlate());
    },
    keepQuietZone() {
      this.$nextTick(() => this.stripWhitePlate());
    },
  },

  mounted() {
    this.$nextTick(() => this.stripWhitePlate());
  },

  updated() {
    this.stripWhitePlate();
  },

  methods: {
    stripWhitePlate() {
      if (this.keepQuietZone) return;
      const root = this.$el as HTMLElement | undefined;
      if (!root) return;
      root.querySelectorAll("svg rect").forEach((rect) => {
        const fill = (rect.getAttribute("fill") || "").toLowerCase();
        if (
          !fill ||
          fill === "#fff" ||
          fill === "#ffffff" ||
          fill === "white" ||
          fill === "rgb(255, 255, 255)"
        ) {
          rect.setAttribute("fill", "transparent");
        }
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.qr-export {
  display: none !important;
}
.qr-code {
  display: grid;
  place-items: center;
  background: transparent !important;
  padding: 0;
  box-shadow: none;
  border: 0;
}
.qr-code :deep(canvas),
.qr-code :deep(img) {
  display: none !important;
}
.qr-code :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}
.qr-code:not(.qr-code--quiet) :deep(svg) {
  background: transparent !important;
}
/* Kill any white quiet-zone plate from the QR renderer (print/card cutouts) */
.qr-code:not(.qr-code--quiet) :deep(svg > rect:first-child),
.qr-code:not(.qr-code--quiet) :deep(svg rect[fill="#ffffff"]),
.qr-code:not(.qr-code--quiet) :deep(svg rect[fill="#fff"]),
.qr-code:not(.qr-code--quiet) :deep(svg rect[fill="white"]),
.qr-code:not(.qr-code--quiet) :deep(svg rect[fill="#FFFFFF"]) {
  fill: transparent !important;
}
.qr-code--quiet {
  background: #fff !important;
}
.qr-code--quiet :deep(svg) {
  background: #fff !important;
}
</style>
