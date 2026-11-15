<template>
  <div class="qr-page">
    <header class="page-head">
      <div>
        <h1>כרטיס QR</h1>
        <p class="lede">
          בחרו כרטיס, ראו אותו עם הקוד ושם האירוע, והורידו להדפסה. הספריות החדשות כוללות צבעי קוד וטקסט.
        </p>
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
            <QrCardFrame
              :event-name="eventName"
              :text-color="textColor"
              :show-tagline="showCardTagline"
              :tagline="cardTagline"
              :inverted="Boolean(selectedCard?.inverted)"
            >
              <template #qr>
                <EventQR
                  ref="qrComp"
                  :background="qrBackground"
                  :foreground="qrForeground"
                  :inverted="Boolean(selectedCard?.inverted)"
                  :size="280"
                  :margin="4"
                />
              </template>
            </QrCardFrame>
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
                שמירה
              </button>

              <div class="meta-actions__downloads">
                <button
                  type="button"
                  class="btn btn-outline"
                  :disabled="isDownloadingCard"
                  @click="downloadCard"
                >
                  <span class="material-symbols-outlined" aria-hidden="true"
                    >download</span
                  >
                  {{ downloadCardText }}
                </button>
                <button
                  type="button"
                  class="btn btn-ghost"
                  :disabled="isDownloadingQR"
                  @click="downloadQRCode"
                >
                  {{ downloadQRText }}
                </button>
              </div>

              <button
                type="button"
                class="btn-reset"
                :disabled="isSaving || isDefaultSelection"
                @click="resetToDefaults"
              >
                איפוס לברירת המחדל
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Off-screen export clone: html2canvas still renders it; never in layout -->
    <div
      ref="exportCard"
      class="qr-export-card"
      aria-hidden="true"
      :class="{ inv: selectedCard?.inverted }"
    >
      <img class="bg" :src="`/assets/${selectedQR}`" alt="" />
      <QrCardFrame
        :event-name="eventName"
        :text-color="textColor"
        :show-tagline="showCardTagline"
        :tagline="cardTagline"
        :inverted="Boolean(selectedCard?.inverted)"
      >
        <template #qr>
          <EventQR
            :background="qrBackground"
            :foreground="qrForeground"
            :inverted="Boolean(selectedCard?.inverted)"
            :size="280"
            :margin="4"
          />
        </template>
      </QrCardFrame>
    </div>
  </div>
</template>

<script lang="ts">
import { IEvent } from "@/helpers/interfaces";
import { defineComponent } from "vue";
import html2canvas from "html2canvas";
import EventQR from "@/components/event/EventQR.vue";
import QrCardFrame from "@/components/event/QrCardFrame.vue";
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
    QrCardFrame,
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
      return this.isDownloadingCard ? "מוריד..." : "הורדת הכרטיס";
    },

    downloadQRText(): string {
      return this.isDownloadingQR ? "מוריד..." : "הורדת QR בלבד";
    },

    isDefaultSelection(): boolean {
      return (
        this.selectedQR === DEFAULT_QR_CARD_DESIGN &&
        this.cardText.trim() === DEFAULT_QR_CARD_TEXT
      );
    },

    /** Classic templates without baked-in CTA get a live tagline under the name. */
    showCardTagline(): boolean {
      return !this.selectedCard?.hideCta;
    },

    cardTagline(): string {
      const trimmed = this.cardText.trim();
      return trimmed || "סרקו והעלו תמונות";
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
        const cardElement =
          (this.$refs.exportCard as HTMLElement) ||
          (this.$refs.eventCard as HTMLElement);
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
  overflow-x: clip;
  max-width: 100%;
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
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  padding: 0 22px;
  height: 40px;
  font-weight: 800;
  font-size: 0.95rem;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  width: auto;
  white-space: nowrap;
  box-sizing: border-box;
}
.btn .material-symbols-outlined {
  font-size: 1.2rem;
  line-height: 1;
}
.btn-primary {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  color: #fff;
  box-shadow: 0 8px 22px rgba(201, 163, 106, 0.45);
}
.btn-outline {
  background: #fff;
  color: var(--ink, #161310);
  border: 1.5px solid rgba(22, 19, 16, 0.18);
  box-shadow: none;
}
.btn-ghost {
  background: transparent;
  color: var(--ink, #161310);
  border: 1.5px solid transparent;
  box-shadow: none;
}
.btn-ghost:hover {
  background: rgba(22, 19, 16, 0.05);
}
.btn[disabled] {
  opacity: 0.45;
  cursor: default;
}
.btn-reset {
  appearance: none;
  background: none;
  border: 0;
  padding: 4px 2px;
  margin: 0;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: #8a8278;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  width: fit-content;
  align-self: flex-start;
}
.btn-reset:hover:not([disabled]) {
  color: var(--ink, #161310);
}
.btn-reset[disabled] {
  opacity: 0.45;
  cursor: default;
  text-decoration: none;
}
.page {
  padding: 8px 0 48px;
  overflow-x: clip;
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
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}
.qr-live {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin-inline: auto;
  aspect-ratio: 3 / 4.2;
  border-radius: 22px;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 24px 60px rgba(18, 16, 14, 0.16);
  background: #12100e;
}
.qr-live .bg,
.qr-export-card .bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-top: 16px;
}
.meta-actions__downloads {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
/* Off-screen export node — still painted for html2canvas, out of layout/viewport */
.qr-export-card {
  position: fixed;
  left: -10000px;
  top: 0;
  width: 420px;
  aspect-ratio: 3 / 4.2;
  overflow: hidden;
  isolation: isolate;
  pointer-events: none;
  z-index: -1;
  background: #12100e;
}
@media (max-width: 1024px) {
  .qr-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .qr-layout > * {
    min-width: 0;
    max-width: 100%;
  }
  .qr-preview-col {
    position: static;
    order: -1;
  }
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
  .meta-actions__downloads {
    width: 100%;
  }
  .meta-actions__downloads .btn {
    flex: 1 1 auto;
    min-width: 0;
  }
}
@media (max-width: 420px) {
  .meta-actions__downloads {
    flex-direction: column;
    align-items: stretch;
  }
  .meta-actions__downloads .btn,
  .meta-actions > .btn-primary {
    width: 100%;
  }
}
</style>
