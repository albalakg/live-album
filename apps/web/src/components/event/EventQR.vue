<template>
    <div class="qr-code">
    <div class="qr-export" aria-hidden="true">
      <qrcode-svg :value="QRLink" level="H" ref="qrSvg" />
    </div>
    <qrcode-vue
      ref="qrCode"
      :value="QRLink"
      :background="background"
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
      default: "#ffffff",
    },
    size: {
      type: Number,
      default: 0,
    },
  },

  components: {
    QrcodeVue,
    QrcodeSvg,
  },

  data() {
    return {
      startsAtCounter: "" as string,
      loading: false as boolean,
      intervalId: null as ReturnType<typeof setInterval> | null,
    };
  },

  computed: {
    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },

    QRLink(): string {
      return window.location.origin + `/event/uploads/${this.event.path}`;
    },

    renderedSize(): number {
      if (this.size > 0) return this.size;
      return this.$bp.isMobile ? 88 : 112;
    },
  },
});
</script>

<style lang="scss" scoped>
.qr-export {
  display: none !important;
}
.qr-code :deep(canvas),
.qr-code :deep(img) {
  display: none !important;
}
</style>
