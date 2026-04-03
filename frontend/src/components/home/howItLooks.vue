<template>
  <section
    class="home-page-section how-it-looks-section bg--pink"
    id="how-it-looks"
  >
    <template v-if="$bp.isMediumAndUp">
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="25%"
        color="white"
        width="x-large"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 45px)"
        color="white"
        width="small"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 56px)"
        color="white"
        width="medium"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 71px)"
        color="white"
        width="xxx-large"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 166px)"
        color="white"
        width="medium"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 181px)"
        color="white"
        width="small"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 192px)"
        color="white"
        width="x-large"
      />
    </template>
    <MainCube left="20%" top="15%" width="xxxx-large" height="large" />
    <MainCube
      color="pink"
      left="10%"
      top="10%"
      width="large"
      height="x-large"
    />
    <MainCube left="8%" top="3%" width="large" height="large" />
    <MainCube left="11%" top="6%" width="medium" height="medium" />
    <MainCube left="60%" top="3%" width="large" height="large" />
    <MainCube
      color="pink"
      left="63%"
      top="10%"
      width="medium"
      height="medium"
    />
    <MainCube color="pink" left="30%" top="73%" width="large" height="large" />
    <MainCube color="pink" left="33%" top="71%" width="large" height="medium" />
    <MainCube
      color="pink"
      left="72%"
      top="80%"
      width="xx-large"
      height="large"
    />

    <div
      class="how-it-looks-content margin--auto"
      :class="$bp.isMobile ? 'width--full' : 'width--page-size'"
    >
      <div class="height--ful width--full">
        <h2 class="text--white title--x-large">בואו נראה איך זה נראה</h2>
        <div class="gallery-wrapper">
          <figure
            v-for="(image, index) in galleryImages"
            :key="image.src"
            class="gallery-item"
            @click="openModal(index)"
          >
            <img
              class="gallery-image"
              :src="image.src"
              :alt="image.alt"
              loading="lazy"
            />
            <figcaption class="gallery-caption">{{ image.label }}</figcaption>
          </figure>
        </div>
      </div>
    </div>

    <transition name="gallery-modal-fade">
      <div
        v-if="isModalOpen"
        class="gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-label="תצוגת גלריה"
        @click.self="closeModal"
      >
        <button class="gallery-modal-close" type="button" @click="closeModal">
          ×
        </button>
        <button
          class="gallery-modal-nav gallery-modal-prev"
          type="button"
          aria-label="תמונה קודמת"
          @click="showPrevious"
        >
          ‹
        </button>
        <div class="gallery-modal-content">
          <img
            :src="activeImage.src"
            :alt="activeImage.alt"
            class="gallery-modal-image"
          />
          <p class="gallery-modal-caption">{{ activeImage.label }}</p>
        </div>
        <button
          class="gallery-modal-nav gallery-modal-next"
          type="button"
          aria-label="תמונה הבאה"
          @click="showNext"
        >
          ›
        </button>
      </div>
    </transition>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainLine from "../library/background/MainLine.vue";
import MainCube from "@/components/library/background/MainCube.vue";

interface GalleryImage {
  src: string;
  label: string;
  alt: string;
}

export default defineComponent({
  name: "HowItLooks",
  components: { MainCube, MainLine },

  data() {
    return {
      isModalOpen: false,
      activeImageIndex: 0,
      galleryImages: [
        {
          src: new URL(
            "../../assets/home_gallery/event_album.jpeg",
            import.meta.url
          ).href,
          label: "אלבום האירוע",
          alt: "מסך אלבום האירוע",
        },
        {
          src: new URL(
            "../../assets/home_gallery/event_assets_manager.jpeg",
            import.meta.url
          ).href,
          label: "ניהול מדיה",
          alt: "מסך ניהול התמונות והסרטונים",
        },
        {
          src: new URL(
            "../../assets/home_gallery/event_info.jpeg",
            import.meta.url
          ).href,
          label: "פרטי האירוע",
          alt: "מסך פרטי אירוע",
        },
        {
          src: new URL(
            "../../assets/home_gallery/event_qr.jpeg",
            import.meta.url
          ).href,
          label: "שיתוף מהיר ב-QR",
          alt: "מסך QR לשיתוף מהיר לאורחים",
        },
        {
          src: new URL("../../assets/home_gallery/profile.jpeg", import.meta.url)
            .href,
          label: "פרופיל אישי",
          alt: "מסך פרופיל אישי",
        },
        {
          src: new URL(
            "../../assets/home_gallery/upload page.jpeg",
            import.meta.url
          ).href,
          label: "עמוד העלאה",
          alt: "מסך העלאת מדיה",
        },
      ] as GalleryImage[],
    };
  },
  computed: {
    activeImage(): GalleryImage {
      return this.galleryImages[this.activeImageIndex];
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleModalKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleModalKeydown);
  },
  methods: {
    openModal(index: number) {
      this.activeImageIndex = index;
      this.isModalOpen = true;
      document.body.style.overflow = "hidden";
    },
    closeModal() {
      this.isModalOpen = false;
      document.body.style.overflow = "";
    },
    showNext() {
      const nextIndex = (this.activeImageIndex + 1) % this.galleryImages.length;
      this.activeImageIndex = nextIndex;
    },
    showPrevious() {
      const prevIndex =
        (this.activeImageIndex - 1 + this.galleryImages.length) %
        this.galleryImages.length;
      this.activeImageIndex = prevIndex;
    },
    handleModalKeydown(event: KeyboardEvent) {
      if (!this.isModalOpen) return;

      if (event.key === "Escape") this.closeModal();
      if (event.key === "ArrowRight") this.showNext();
      if (event.key === "ArrowLeft") this.showPrevious();
    },
  },
});
</script>

<style lang="scss" scoped>
.home-page-section {
  min-height: calc(100vh - 99px);
  position: relative;
  text-align: center;

  h2 {
    width: 80%;
    font-weight: 700;
    word-break: keep-all;
    margin: auto;
  }
}

.how-it-looks-content {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 6% 0;
  text-align: center;
  overflow: hidden;

  .gallery-wrapper {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    width: min(720px, 88vw);
    margin: auto;
    margin-top: 20px;

    @media only screen and (max-width: 600px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      width: min(420px, 90vw);
    }
  }

  .gallery-item {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: #fff1;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    transition: transform 220ms ease, box-shadow 220ms ease;
    aspect-ratio: 4 / 5;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent 48%);
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: 0 12px 26px rgba(0, 0, 0, 0.22);
      cursor: pointer;
    }
  }

  .gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .gallery-caption {
    position: absolute;
    right: 10px;
    left: 10px;
    bottom: 10px;
    z-index: 2;
    color: #fff;
    font-size: 0.82rem;
    font-weight: 700;
    text-align: right;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }
}

.gallery-modal-fade-enter-active,
.gallery-modal-fade-leave-active {
  transition: opacity 180ms ease;
}

.gallery-modal-fade-enter-from,
.gallery-modal-fade-leave-to {
  opacity: 0;
}

.gallery-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.gallery-modal-content {
  max-width: min(1100px, 90vw);
  max-height: 88vh;
  text-align: center;
}

.gallery-modal-image {
  max-width: 100%;
  max-height: calc(88vh - 54px);
  object-fit: contain;
  border-radius: 18px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
}

.gallery-modal-caption {
  margin-top: 10px;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
}

.gallery-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  border: 0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  font-size: 1.9rem;
  line-height: 1;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.gallery-modal-nav {
  border: 0;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  font-size: 2rem;
  line-height: 0;
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  cursor: pointer;
  margin: 0 16px;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 3px;
  /* Guillemets (‹ ›) sit optically off-center in many fonts; tiny nudge */
  &.gallery-modal-prev {
    padding-left: 3px;
  }
  &.gallery-modal-next {
    padding-right: 3px;
  }
}

@media only screen and (max-width: 600px) {
  .gallery-modal {
    padding: max(10px, env(safe-area-inset-top, 0px))
      max(10px, env(safe-area-inset-right, 0px))
      max(10px, env(safe-area-inset-bottom, 0px))
      max(10px, env(safe-area-inset-left, 0px));
    align-items: center;
    justify-content: center;
  }

  .gallery-modal-content {
    max-width: 100%;
    width: 100%;
    max-height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* In-flow width when navs are fixed: no side margin squeeze */
    padding-inline: 0;
  }

  .gallery-modal-image {
    max-height: calc(100vh - 140px);
    max-height: min(72vh, calc(100dvh - 120px));
    border-radius: 12px;
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  .gallery-modal-caption {
    font-size: 0.88rem;
    margin-top: 8px;
    padding-inline: 12px;
    line-height: 1.35;
  }

  .gallery-modal-close {
    top: max(10px, env(safe-area-inset-top, 0px));
    right: max(10px, env(safe-area-inset-right, 0px));
    width: 44px;
    height: 44px;
    touch-action: manipulation;
  }

  /* Overlay edges so the image isn’t squeezed between inline buttons */
  .gallery-modal-nav {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    width: 44px;
    height: 44px;
    z-index: 1001;
    touch-action: manipulation;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  }

  .gallery-modal-prev {
    left: max(6px, env(safe-area-inset-left, 0px));
  }

  .gallery-modal-next {
    right: max(6px, env(safe-area-inset-right, 0px));
  }
}
</style>
