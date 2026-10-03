<template>
    <div class="qr-code">
    <qrcode-svg :value="QRLink" level="H" ref="qrSvg" class="display--none" />
    <qrcode-vue
      ref="qrCode"
      :value="QRLink"
      :background="background"
      :size="$bp.isMobile ? 75 : 100"
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
  },
});
</script>

<style lang="scss" scoped>
.event-info {
  min-height: fit-content;
}
</style>
