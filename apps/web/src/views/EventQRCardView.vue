<template>
  <div class="qr-page">
    <header class="page-head">
      <div>
        <h1>כרטיס QR</h1>
        <p class="lede">
          בחרו כרטיס, ראו אותו עם הקוד ושם האירוע, והורידו להדפסה. הספריות החדשות כוללות צבעי קוד וטקסט.
        </p>
      </div>
      <div class="head-actions">
        <button type="button" class="btn btn-ghost" @click="downloadQRCode">
          {{ downloadQRText }}
        </button>
        <button type="button" class="btn btn-primary" @click="downloadCard">
          {{ downloadCardText }}
        </button>
      </div>
    </header>

    <div class="page">
      <div class="qr-layout">
        <div>
          <QrCardGallery
            selectable
            :selected="selectedQR"
            :event-name="eventName"
            @select="onSelectDesign"
          />
        </div>

        <div class="qr-preview-col">
          <div
            ref="eventCard"
            class="qr-live"
            :class="{ inv: selectedCard?.inverted }"
          >
            <img class="bg" :src="`/assets/${selectedQR}`" alt="" />
            <div class="qr-ov">
              <EventQR
                ref="qrComp"
                :background="qrBackground"
                :foreground="qrForeground"
                :inverted="Boolean(selectedCard?.inverted)"
                :size="168"
              />
            </div>
            <div class="qr-name" :style="{ color: textColor }">
              {{ eventName }}
            </div>
          </div>

          <div class="card meta-card">
            <h3>{{ selectedCard?.label || "כרטיס" }}</h3>
            <p class="hint">
              צבע הקוד
              <span dir="ltr">{{ qrForeground }}</span>
            </p>
            <div class="field" v-if="!selectedCard?.hideCta">
              <span>משפט על הכרטיס</span>
              <input class="txt" v-model="cardText" type="text" />
            </div>
            <p v-else class="sample-note">
              בכרטיס הזה המשפט מודפס על הרקע עצמו, לכן השדה מוסתר.
            </p>
            <div class="meta-actions">
              <button
                type="button"
                class="btn btn-primary"
                :disabled="isSaving"
                @click="saveSettings"
              >
                שמירת הכרטיס
              </button>
              <button
                type="button"
                class="btn btn-ghost"
                :disabled="isSaving || isDefaultSelection"
                @click="resetToDefaults"
              >
                חזרה לברירת מחדל
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IEvent } from "@/helpers/interfaces";
import { defineComponent } from "vue";
import html2canvas from "html2canvas";
import EventQR from "@/components/event/EventQR.vue";
import QrCardGallery from "@/components/event/QrCardGallery.vue";
import {
  DEFAULT_QR_CARD_DESIGN,
  DEFAULT_QR_CARD_TEXT,
  isValidQrCardDesign,
} from "@/helpers/qrCardOptions";
import {
  findQrCardByFile,
  type QrCardDesign,
} from "@/helpers/qrCardCatalog";
import { notify } from "@/helpers/notify";

export default defineComponent({
  name: "EventQRCardView",

  components: {
    EventQR,
    QrCardGallery,
  },

  data() {
    return {
      isDownloadingQR: false as boolean,
      isDownloadingCard: false as boolean,
      isSaving: false as boolean,
      selectedQR: DEFAULT_QR_CARD_DESIGN as string,
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
    const design = this.$route.query.design;
    if (typeof design === "string" && isValidQrCardDesign(design)) {
      this.selectedQR = design;
    }
  },

  computed: {
    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },

    eventName(): string {
      return this.$store.getters["event/getEventName"] || "האירוע שלכם";
    },

    selectedCard(): QrCardDesign | undefined {
      return findQrCardByFile(this.selectedQR);
    },

    qrForeground(): string {
      return this.selectedCard?.qrColor || "#000000";
    },

    qrBackground(): string {
      return this.selectedCard?.qrBackground || "transparent";
    },

    textColor(): string {
      return this.selectedCard?.textColor || "#161310";
    },

    downloadCardText(): string {
      return this.isDownloadingCard ? "מוריד..." : "הורדה והדפסה";
    },

    downloadQRText(): string {
      return this.isDownloadingQR ? "מוריד..." : "הורדת הקוד בלבד";
    },

    isDefaultSelection(): boolean {
      return (
        this.selectedQR === DEFAULT_QR_CARD_DESIGN &&
        this.cardText.trim() === DEFAULT_QR_CARD_TEXT
      );
    },
  },

  methods: {
    onSelectDesign(file: string) {
      this.selectedQR = file;
    },

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
      try {
        await this.$store.dispatch("event/updateQrCardSettings", {
          design: this.selectedQR,
          text: this.cardText.trim(),
        });
        notify({ text: "הכרטיס נשמר", type: "success" });
      } catch (error) {
        console.error(error);
        notify({ text: "שמירת הכרטיס נכשלה", type: "error" });
      } finally {
        this.isSaving = false;
      }
    },

    async resetToDefaults() {
      this.selectedQR = DEFAULT_QR_CARD_DESIGN;
      this.cardText = DEFAULT_QR_CARD_TEXT;
      await this.saveSettings();
    },

    async downloadCard() {
      try {
        const cardElement = this.$refs.eventCard as HTMLElement;
        if (!cardElement) return;
        this.isDownloadingCard = true;
        const canvas = await html2canvas(cardElement, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: null,
        });
        const link = document.createElement("a");
        link.download = "event-card-high-quality.jpeg";
        link.href = canvas.toDataURL("image/jpeg", 1.0);
        link.click();
      } catch (error) {
        console.error("Failed to download the event card as an image:", error);
      } finally {
        this.isDownloadingCard = false;
      }
    },

    downloadQRCode() {
      try {
        const qrComp = this.$refs.qrComp as any;
        const svgElement =
          qrComp?.$refs?.qrSvg?.$el ||
          qrComp?.$el?.querySelector?.("svg");
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
          this.isDownloadingQR = false;
        };
        img.onerror = () => {
          this.isDownloadingQR = false;
        };
        img.src = `data:image/svg+xml;base64,${btoa(
          unescape(encodeURIComponent(svgData))
        )}`;
      } catch (error) {
        console.error("Failed to download the QR code as an image:", error);
        this.isDownloadingQR = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.qr-page {
  color: var(--ink, #161310);
}
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0 8px;
}
.page-head h1 {
  font-size: clamp(1.8rem, 3vw, 2.55rem);
  letter-spacing: -0.04em;
  font-weight: 900;
  line-height: 1.1;
  margin: 0;
}
.lede {
  color: var(--muted, #5e564e);
  margin-top: 8px;
  font-size: 1.05rem;
  line-height: 1.55;
  max-width: 42em;
  font-weight: 500;
}
.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  padding: 12px 22px;
  font-weight: 800;
  font-size: 0.98rem;
  border: 0;
  cursor: pointer;
  font-family: inherit;
}
.btn-primary {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  color: #fff;
  box-shadow: 0 8px 22px rgba(201, 163, 106, 0.45);
}
.btn-ghost {
  background: #fff;
  color: var(--ink, #161310);
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.btn[disabled] {
  opacity: 0.45;
  cursor: default;
}
.page {
  padding: 8px 0 48px;
}
.qr-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.85fr);
  gap: 28px;
  align-items: start;
}
.qr-preview-col {
  position: relative;
  top: 0;
}
.qr-live {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin-inline: auto;
  aspect-ratio: 3 / 4.2;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(18, 16, 14, 0.16);
  background: #12100e;
}
.qr-live .bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.qr-ov {
  position: absolute;
  left: 50%;
  top: 28%;
  transform: translateX(-50%);
  background: transparent !important;
  padding: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.qr-ov :deep(.qr-code),
.qr-ov :deep(svg) {
  background: transparent !important;
}
.qr-name {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 14%;
  text-align: center;
  font-weight: 900;
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  letter-spacing: -0.02em;
  line-height: 1.25;
  background: none !important;
  text-shadow: none;
}
.meta-card {
  margin-top: 18px;
  background: #fff;
  border-radius: 26px;
  padding: 20px 22px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.meta-card h3 {
  margin: 0;
  font-size: 1.22rem;
  font-weight: 800;
}
.hint {
  color: var(--muted, #5e564e);
  margin: 6px 0 0;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}
.field > span {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 800;
  color: #8a8278;
}
.txt {
  border: 1.5px solid rgba(22, 19, 16, 0.11);
  border-radius: 14px;
  padding: 12px 14px;
  font: inherit;
  background: #fffcfa;
}
.sample-note {
  margin-top: 12px;
  color: var(--muted, #5e564e);
  font-size: 0.92rem;
}
.meta-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}
@media (max-width: 1024px) {
  .qr-layout {
    grid-template-columns: 1fr;
  }
  .qr-preview-col {
    position: static;
    order: -1;
  }
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
