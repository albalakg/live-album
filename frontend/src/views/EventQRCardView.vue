<template>
  <div
    class="event-qr display--flex justify--space-between height--full brs--medium flex--wrap padding--medium-mobile"
  >
    <div class="width--corner width--full-mobile">
      <h1 class="title--large">כרטיס QR</h1>
      <h1 class="title--small">הכנו בשבליכם כרטיס QR שתוכלו לשלוח ולהדפיס</h1>
      <template v-if="$bp.isMobile">
        <br />
        <p class="text--center">מומלץ להוריד מהמחשב</p>
      </template>
      <br />
      <MainSelect
        :options="QROptions"
        v-model="selectedQR"
        ref="actionSelect"
        placeholder="בחר עיצוב כרטיס QR"
        title="בחר עיצוב כרטיס QR"
      />
      <br />
      <MainInput
        v-model="cardText"
        placeholder="הטקסט שיופיע בכרטיס"
        title="הטקסט שיופיע בכרטיס"
      />
      <br />
      <MainButton
        :loading="isSaving"
        text="שמור"
        @onClick="saveSettings()"
      />
    
      <br />
      <br />
      <MainButton :text="downloadCardText" @onClick="downloadCard()" />
      <br />
      <br />
      <MainButton :text="downloadQRText" @onClick="downloadQRCode()" />
      <br />
      <br />
      <MainButton
        :disabled="isSaving || isDefaultSelection"
        text="חזרה לברירת המחדל"
        @onClick="resetToDefaults()"
      />
    </div>
    <div
      ref="eventCard"
      class="event-qr-card height--full bg--white brs--medium"
      :style="`background-image: url('/assets/${selectedQR}')`"
    >
      <EventQR class="qr-code" :background="background" />
      <div class="card-text">
        <p class="title--large">
          {{ cardText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IEvent } from "@/helpers/interfaces";
import { defineComponent } from "vue";
import html2canvas from "html2canvas";
import MainButton from "@/components/library/buttons/MainButton.vue";
import MainSelect from "@/components/library/inputs/MainSelect.vue";
import MainInput from "@/components/library/inputs/MainInput.vue";
import EventQR from "@/components/event/EventQR.vue";
import {
  DEFAULT_QR_CARD_DESIGN,
  DEFAULT_QR_CARD_TEXT,
  isValidQrCardDesign,
  QR_CARD_OPTIONS,
} from "@/helpers/qrCardOptions";

export default defineComponent({
  name: "EventQRCardView",

  components: {
    MainButton,
    MainSelect,
    MainInput,
    EventQR,
  },

  data() {
    return {
      isDownloadingQR: false as boolean,
      isDownloadingCard: false as boolean,
      isSaving: false as boolean,
      background: "transparent" as string,
      selectedQR: DEFAULT_QR_CARD_DESIGN as string,
      QROptions: QR_CARD_OPTIONS.map((option) => ({ ...option })),
      cardText: DEFAULT_QR_CARD_TEXT as string,
    };
  },

  watch: {
    event() {
      this.setForm();
    },
  },

  created() {
    this.setForm();
  },

  computed: {
    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },

    downloadCardText(): string {
      return this.isDownloadingCard ? "מוריד..." : "הורדה של הכרטיס כתמונה";
    },

    downloadQRText(): string {
      return this.isDownloadingQR ? "מוריד..." : "הורדה של ה QR בלבד";
    },

    isDefaultSelection(): boolean {
      return (
        this.selectedQR === DEFAULT_QR_CARD_DESIGN &&
        this.cardText.trim() === DEFAULT_QR_CARD_TEXT
      );
    },
  },

  methods: {
    setForm() {
      const savedDesign = this.event?.config?.qr_card_design;
      this.selectedQR = isValidQrCardDesign(savedDesign)
        ? savedDesign
        : DEFAULT_QR_CARD_DESIGN;
      const savedText = this.event?.config?.qr_card_text?.trim();
      this.cardText = savedText || DEFAULT_QR_CARD_TEXT;
    },

    async saveSettings() {
      this.isSaving = true;
      await this.$store.dispatch("event/updateQrCardSettings", {
        design: this.selectedQR,
        text: this.cardText.trim(),
      });
      this.isSaving = false;
    },

    async resetToDefaults() {
      this.selectedQR = DEFAULT_QR_CARD_DESIGN;
      this.cardText = DEFAULT_QR_CARD_TEXT;
      await this.saveSettings();
    },

    async downloadCard() {
      try {
        const cardElement = this.$refs.eventCard as HTMLElement;
        if (!cardElement) {
          console.error("Event card element not found.");
          return;
        }

        this.isDownloadingCard = true;

        // Scale up for higher resolution (2x or 3x)
        const scaleFactor = 3; // Increase for better print quality
        const canvas = await html2canvas(cardElement, {
          scale: scaleFactor,
          useCORS: true,
          logging: false, // Disable console logs for cleaner debugging
          backgroundColor: null, // Maintain transparency if needed
        });

        // Convert canvas to high-quality JPEG
        const link = document.createElement("a");
        link.download = "event-card-high-quality.jpeg";
        link.href = canvas.toDataURL("image/jpeg", 1.0); // Max quality
        link.click();
      } catch (error) {
        console.error("Failed to download the event card as an image:", error);
      } finally {
        this.isDownloadingCard = false;
      }
    },

    downloadQRCode() {
      try {
        const qrCodeComponent = this.$refs.qrSvg as any;
        const svgElement = qrCodeComponent.$el;
        if (!svgElement) {
          console.error("QR Code SVG not found.");
          return;
        }

        this.isDownloadingQR = true;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const link = document.createElement("a");
          link.download = "qr-code.jpeg";
          link.href = canvas.toDataURL("image/jpeg");
          link.click();
        };

        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      } catch (error) {
        console.error("Failed to download the QR code as an image:", error);
      }

      this.isDownloadingQR = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.event-qr-card {
  width: 40%;
  background-position: center;
  background-size: 100% 100%;
  position: relative;

  @media only screen and (max-width: 600px) {
    width: 100%;
    height: 400px;
    margin-top: 15px;
  }

  .qr-code {
    position: absolute;
    left: 0;
    right: 0;
    top: 25%;
    margin: auto;
    text-align: center;
  }

  .card-text {
    position: absolute;
    left: 0;
    right: 0;
    top: 45%;
    margin: auto;
    text-align: center;

    p {
      max-width: 40%;
      margin: auto;
    }
  }
}

.download-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #79ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #68a153;
  }
}
</style>
