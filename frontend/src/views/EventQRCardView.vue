<template>
  <div class="event-qr display--flex justify--space-between height--full brs--medium flex--wrap">
    <div class="width--corner width--full-mobile">
      <h1 class="title--large">
        כרטיס QR
      </h1>
      <h1 class="title--small">
        הכנו בשבליכם כרטיס QR שתוכלו לשלוח ולהדפיס
      </h1>
      <br>
      <MainButton :text="downloadCardText" @onClick="downloadCard()"  />
      <br>
      <br>
      <MainButton :text="downloadQRText" @onClick="downloadQRCode()"  />
      <qrcode-svg :value="QRLink" level="H" ref="qrSvg" class="display--none" />
    </div>
    <div
      ref="eventCard"
      class="event-qr-card height--full bg--white brs--medium"
      :style="`background-image: url('http://localhost:8080/assets/qr-card-background-with-text.webp')`"
    >
      <div class="qr-code">
        <qrcode-vue
          ref="qrCode"
          :value="QRLink"
          :background="background"
          :size="$bp.isMobile ? 85 : 100"
          level="H"
          render-as="svg"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IEvent } from '@/helpers/interfaces';
import { defineComponent } from 'vue';
import QrcodeVue, { QrcodeSvg } from 'qrcode.vue';
import html2canvas from 'html2canvas';
import MainButton from '@/components/library/buttons/MainButton.vue';

export default defineComponent({
  name: 'EventQRCardView',

  components: {
    QrcodeVue,
    QrcodeSvg,
    MainButton,
  },

  data() {
    return {
      isDownloadingQR: false as boolean,
      isDownloadingCard: false as boolean,
      background: '#dedfcf' as string,
    };
  },

  computed: {
    event(): IEvent {
      return this.$store.getters['event/getEvent'];
    },

    QRLink(): string {
      return window.location.origin + `/event/uploads/${this.event.path}`;
    },

    downloadCardText(): string {
      return this.isDownloadingCard ? 'מוריד...' : 'הורדה של הכרטיס כתמונה';
    },

    downloadQRText(): string {
      return this.isDownloadingQR ? 'מוריד...' : 'הורדה של ה QR בלבד';
    },
  },

  methods: {
    async downloadCard() {
      try {
        const cardElement = this.$refs.eventCard as HTMLElement;
        if (!cardElement) {
          console.error('Event card element not found.');
          return;
        }

        this.isDownloadingCard = true;
        
        const canvas = await html2canvas(cardElement, { useCORS: true });
        const link = document.createElement('a');
        link.download = 'event-card.jpeg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
      } catch (error) {
        console.error('Failed to download the event card as an image:', error);
      }
      this.isDownloadingCard = false;
    },

    downloadQRCode() {
      try {
        const qrCodeComponent = this.$refs.qrSvg as any;
        const svgElement = qrCodeComponent.$el;
        if (!svgElement) {
          console.error('QR Code SVG not found.');
          return;
        }

        this.isDownloadingQR = true;
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.download = 'qr-code.jpeg';
          link.href = canvas.toDataURL('image/jpeg');
          link.click();
        };

        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      } catch (error) {
        console.error('Failed to download the QR code as an image:', error);
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
    height: 500px;
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
