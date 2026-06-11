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
    <MainCube
      color="pink"
      left="68%"
      top="28%"
      width="medium"
      height="large"
    />
    <MainCube left="22%" top="32%" width="large" height="medium" />

    <div
      class="how-it-looks-content margin--auto"
      :class="$bp.isMobile ? 'width--full' : 'width--page-size'"
    >
      <div class="how-it-looks-inner width--full">
        <h2 class="text--white title--x-large">בואו נראה איך זה נראה</h2>

        <div class="how-it-looks-showcase">
          <div class="how-it-looks-video-showcase">
            <div class="video-showcase__backdrop" aria-hidden="true">
              <span class="video-showcase__shape video-showcase__shape--one" />
              <span class="video-showcase__shape video-showcase__shape--two" />
              <span class="video-showcase__shape video-showcase__shape--three" />
            </div>
            <MobileDeviceFrame :size="$bp.isMobile ? 'sm' : 'md'">
              <video
                ref="galleryVideo"
                src="/assets/gallery_video.mp4"
                muted
                loop
                playsinline
                aria-label="תצוגת הגלריה באירוע"
              />
            </MobileDeviceFrame>
          </div>

          <div
            class="how-it-looks-gallery-wrap"
            :class="{ 'how-it-looks-gallery-wrap--mobile': $bp.isMobile }"
          >
            <template v-if="!$bp.isMobile">
              <div class="how-it-looks-gallery-grid">
                <figure
                  v-for="(image, index) in galleryImages"
                  :key="image.src"
                  class="gallery-grid-item"
                  tabindex="0"
                  role="button"
                  :aria-label="`פתיחת ${image.label}`"
                  @click="onGalleryCardClick(index)"
                  @keydown.enter="onGalleryCardClick(index)"
                  @keydown.space.prevent="onGalleryCardClick(index)"
                >
                  <img
                    class="gallery-image"
                    :src="image.src"
                    :alt="image.alt"
                    loading="lazy"
                    draggable="false"
                  />
                  <figcaption class="gallery-caption">{{ image.label }}</figcaption>
                </figure>
              </div>
            </template>

            <template v-else>
              <button
                class="gallery-carousel-nav gallery-carousel-nav--left"
                type="button"
                aria-label="הזזת הגלריה שמאלה"
                :disabled="!canMobilePanLeft"
                @click="panMobileGallery('left')"
              >
                <svg
                  class="gallery-carousel-nav__icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <div
                class="how-it-looks-gallery-3d"
                :class="{ 'how-it-looks-gallery-3d--dragging': mobileIsDragging }"
                @touchstart.passive="onMobileTouchStart"
                @touchmove="onMobileTouchMove"
                @touchend="onMobileTouchEnd"
                @touchcancel="onMobileTouchEnd"
                @mousedown="onMobileMouseDown"
              >
                <div
                  class="gallery-mobile-track"
                  :class="{ 'gallery-mobile-track--dragging': mobileIsDragging }"
                  :style="mobileTrackStyle"
                >
                  <figure
                    v-for="(image, index) in galleryImages"
                    :key="image.src"
                    class="gallery-item"
                    :data-gallery-index="index"
                    :style="card3dStyle(index)"
                    tabindex="0"
                    role="button"
                    :aria-label="`פתיחת ${image.label}`"
                    @click.stop="onGalleryCardClick(index, $event)"
                    @touchend="onGalleryCardTouchEnd($event)"
                    @keydown.enter="onGalleryCardClick(index)"
                    @keydown.space.prevent="onGalleryCardClick(index)"
                  >
                    <img
                      class="gallery-image"
                      :src="image.src"
                      :alt="image.alt"
                      loading="lazy"
                      draggable="false"
                    />
                    <figcaption class="gallery-caption">{{ image.label }}</figcaption>
                  </figure>
                </div>
              </div>

              <button
                class="gallery-carousel-nav gallery-carousel-nav--right"
                type="button"
                aria-label="הזזת הגלריה ימינה"
                :disabled="!canMobilePanRight"
                @click="panMobileGallery('right')"
              >
                <svg
                  class="gallery-carousel-nav__icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
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
          <svg
            class="gallery-modal-nav__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
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
          <svg
            class="gallery-modal-nav__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        </div>
      </transition>
    </Teleport>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainLine from "../library/background/MainLine.vue";
import MainCube from "@/components/library/background/MainCube.vue";
import MobileDeviceFrame from "@/components/library/display/MobileDeviceFrame.vue";

interface GalleryImage {
  src: string;
  label: string;
  alt: string;
}

const MOBILE_CARD_WIDTH = 100;
const MOBILE_CARD_GAP = 12;
const MOBILE_CARD_STEP = MOBILE_CARD_WIDTH + MOBILE_CARD_GAP;
const MOBILE_DRAG_THRESHOLD = 24;

export default defineComponent({
  name: "HowItLooks",
  components: { MainCube, MainLine, MobileDeviceFrame },

  data() {
    return {
      isModalOpen: false,
      activeImageIndex: 0,
      mobileScrollOffset: 0,
      mobileDragOffset: 0,
      mobileTouchStartX: 0,
      mobileTouchStartY: 0,
      mobileIsDragging: false,
      mobilePeakDragDistance: 0,
      mobilePeakHorizontalDistance: 0,
      mobileGestureActive: false,
      pendingGalleryTapIndex: null as number | null,
      suppressGalleryClick: false,
      prefersReducedMotion: false,
      videoObserver: null as IntersectionObserver | null,
      galleryImages: [
        {
          src: new URL(
            "../../assets/home_gallery/how_it_looks_event_page.jpeg",
            import.meta.url
          ).href,
          label: "עמוד האירוע",
          alt: "עמוד האירוע",
        },
        {
          src: new URL(
            "../../assets/home_gallery/how_it_looks_event_gallery_page.jpeg",
            import.meta.url
          ).href,
          label: "אלבום האירוע",
          alt: "מסך אלבום האירוע",
        },
        {
          src: new URL(
            "../../assets/home_gallery/how_it_looks_event_assets_page.jpeg",
            import.meta.url
          ).href,
          label: "ניהול מדיה",
          alt: "מסך ניהול התמונות והסרטונים",
        },
        {
          src: new URL(
            "../../assets/home_gallery/how_it_looks_event_qr_page.jpeg",
            import.meta.url
          ).href,
          label: "שיתוף מהיר ב-QR",
          alt: "מסך QR לשיתוף מהיר לאורחים",
        },
        {
          src: new URL(
            "../../assets/home_gallery/how_it_looks_event_upload_page.jpeg",
            import.meta.url
          ).href,
          label: "עמוד העלאה",
          alt: "עמוד העלאה",
        },
        {
          src: new URL(
            "../../assets/home_gallery/how_it_looks_event_upload2_page.jpeg",
            import.meta.url
          ).href,
          label: "עמוד העלאה בעריכה",
          alt: "עמוד העלאה עם עריכה",
        },
        {
          src: new URL(
            "../../assets/home_gallery/how_it_looks_event_guest_download_page.jpeg",
            import.meta.url
          ).href,
          label: "פרטי האירוע",
          alt: "מסך פרטי אירוע",
        },
        {
          src: new URL(
            "../../assets/home_gallery/how_it_looks_profile_page.jpeg",
            import.meta.url
          ).href,
          label: "פרופיל אישי",
          alt: "פרופיל אישי",
        },
      ] as GalleryImage[],
    };
  },

  computed: {
    activeImage(): GalleryImage {
      return this.galleryImages[this.activeImageIndex];
    },

    galleryCenterIndex(): number {
      if (this.$bp.isMobile) {
        const effectiveScroll =
          this.mobileScrollOffset -
          this.mobileDragOffset;
        return effectiveScroll / MOBILE_CARD_STEP + 0.5;
      }
      return (this.galleryImages.length - 1) / 2;
    },

    mobileMaxScrollOffset(): number {
      return Math.max(0, (this.galleryImages.length - 2) * MOBILE_CARD_STEP);
    },

    canMobilePanLeft(): boolean {
      return this.mobileScrollOffset < this.mobileMaxScrollOffset;
    },

    canMobilePanRight(): boolean {
      return this.mobileScrollOffset > 0;
    },

    mobileTrackStyle(): Record<string, string> {
      const x = -this.mobileScrollOffset + this.mobileDragOffset;
      return {
        transform: `translateX(${x}px)`,
      };
    },
  },

  mounted() {
    window.addEventListener("keydown", this.handleModalKeydown);
    window.addEventListener("mousemove", this.onMobileMouseMove);
    window.addEventListener("mouseup", this.onMobileMouseUp);
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    this.setupVideoObserver();
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleModalKeydown);
    window.removeEventListener("mousemove", this.onMobileMouseMove);
    window.removeEventListener("mouseup", this.onMobileMouseUp);
    this.videoObserver?.disconnect();
    this.videoObserver = null;
  },

  methods: {
    card3dStyle(index: number): Record<string, string> {
      const center = this.galleryCenterIndex;
      const offset = index - center;
      const isMobile = this.$bp.isMobile;

      const rotateY = isMobile
        ? Math.max(-8, Math.min(8, offset * 10))
        : offset * 14;
      const rotateZ = isMobile ? offset * 1.2 : offset * 1.5;
      const translateZ = isMobile
        ? 28 - Math.abs(offset) * 14
        : 24 - Math.abs(offset) * 12;
      const shadowDepth = Math.max(8, 28 - Math.abs(offset) * 3);

      const style: Record<string, string> = {
        transform: `rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translateZ(${translateZ}px)`,
        boxShadow: `0 ${shadowDepth * 0.4}px ${shadowDepth}px rgba(0, 0, 0, ${0.12 + Math.abs(offset) * 0.02})`,
        zIndex: String(10 - Math.abs(Math.round(offset))),
      };

      if (isMobile) {
        style.flex = `0 0 ${MOBILE_CARD_WIDTH}px`;
        style.width = `${MOBILE_CARD_WIDTH}px`;
        style.marginInline = "0";
        style.transform = "none";
        style.zIndex = "1";
        style.boxShadow = `0 4px 14px rgba(0, 0, 0, ${0.14 + Math.abs(offset) * 0.02})`;
      }

      return style;
    },

    panMobileGallery(direction: "left" | "right") {
      if (direction === "left") {
        this.mobileScrollOffset = Math.min(
          this.mobileScrollOffset + MOBILE_CARD_STEP,
          this.mobileMaxScrollOffset
        );
      } else {
        this.mobileScrollOffset = Math.max(
          this.mobileScrollOffset - MOBILE_CARD_STEP,
          0
        );
      }
    },

    isMobileViewport(): boolean {
      return window.innerWidth < 600;
    },

    onMobileTouchStart(event: TouchEvent) {
      if (!this.isMobileViewport() || event.touches.length !== 1) return;
      const touch = event.touches[0];
      this.beginMobileGesture(touch.clientX, touch.clientY, event);
    },

    onMobileTouchMove(event: TouchEvent) {
      if (!this.isMobileViewport() || !this.mobileGestureActive) return;
      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - this.mobileTouchStartX;
      const deltaY = touch.clientY - this.mobileTouchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      this.mobilePeakDragDistance = Math.max(
        this.mobilePeakDragDistance,
        Math.hypot(deltaX, deltaY)
      );
      this.mobilePeakHorizontalDistance = Math.max(
        this.mobilePeakHorizontalDistance,
        absX
      );

      if (!this.mobileIsDragging) {
        if (absX < MOBILE_DRAG_THRESHOLD) return;
        if (absY > absX * 0.85) return;
        this.mobileIsDragging = true;
      }

      this.applyMobileDragOffset(deltaX);
      event.preventDefault();
    },

    onMobileTouchEnd(event: TouchEvent) {
      if (!this.mobileGestureActive) return;
      const touch = event.changedTouches[0];
      if (touch) {
        const index = this.getGalleryIndexFromTouchPoint(
          touch.clientX,
          touch.clientY
        );
        if (index !== null) {
          this.pendingGalleryTapIndex = index;
        }
      }
      const wasPan = this.mobileIsDragging;
      this.finishMobileGesture();
      if (wasPan) {
        event.preventDefault();
      }
    },

    onMobileMouseDown(event: MouseEvent) {
      if (!this.isMobileViewport() || event.button !== 0) return;
      this.beginMobileGesture(event.clientX, event.clientY, event);
    },

    onMobileMouseMove(event: MouseEvent) {
      if (!this.isMobileViewport() || !this.mobileGestureActive) return;

      const deltaX = event.clientX - this.mobileTouchStartX;
      const deltaY = event.clientY - this.mobileTouchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      this.mobilePeakDragDistance = Math.max(
        this.mobilePeakDragDistance,
        Math.hypot(deltaX, deltaY)
      );
      this.mobilePeakHorizontalDistance = Math.max(
        this.mobilePeakHorizontalDistance,
        absX
      );

      if (!this.mobileIsDragging) {
        if (absX < MOBILE_DRAG_THRESHOLD) return;
        if (absY > absX * 0.85) return;
        this.mobileIsDragging = true;
      }

      this.applyMobileDragOffset(deltaX);
    },

    onMobileMouseUp() {
      if (!this.isMobileViewport() || !this.mobileGestureActive) return;
      this.finishMobileGesture();
    },

    beginMobileGesture(
      clientX: number,
      clientY: number,
      event: TouchEvent | MouseEvent
    ) {
      this.mobileGestureActive = true;
      this.mobileTouchStartX = clientX;
      this.mobileTouchStartY = clientY;
      this.mobilePeakDragDistance = 0;
      this.mobilePeakHorizontalDistance = 0;
      this.mobileDragOffset = 0;
      this.mobileIsDragging = false;
      this.suppressGalleryClick = false;
      this.pendingGalleryTapIndex =
        this.getGalleryIndexFromTouchPoint(clientX, clientY) ??
        this.getGalleryIndexFromEvent(event);
    },

    applyMobileDragOffset(delta: number) {
      const projectedScroll = this.mobileScrollOffset - delta;
      const pastStart = projectedScroll < 0;
      const pastEnd = projectedScroll > this.mobileMaxScrollOffset;

      if ((pastStart && delta > 0) || (pastEnd && delta < 0)) {
        this.mobileDragOffset = delta * 0.35;
      } else {
        this.mobileDragOffset = delta;
      }
    },

    finishMobileGesture() {
      const wasPan = this.mobileIsDragging;
      const tapIndex = this.pendingGalleryTapIndex;

      if (wasPan) {
        const proposedScroll = this.mobileScrollOffset - this.mobileDragOffset;
        this.mobileScrollOffset = Math.max(
          0,
          Math.min(this.mobileMaxScrollOffset, proposedScroll)
        );
        this.blockGalleryTap(350);
      } else if (tapIndex !== null && !this.suppressGalleryClick) {
        this.openModal(tapIndex);
        this.blockGalleryTap();
      }

      this.mobileGestureActive = false;
      this.mobileDragOffset = 0;
      this.mobileIsDragging = false;
      this.mobilePeakDragDistance = 0;
      this.mobilePeakHorizontalDistance = 0;
      this.pendingGalleryTapIndex = null;
    },

    wasMobilePanGesture(): boolean {
      return (
        this.mobileIsDragging ||
        this.mobilePeakHorizontalDistance >= MOBILE_DRAG_THRESHOLD
      );
    },

    tryOpenGalleryFromTap(index: number) {
      if (!this.isMobileViewport()) return false;
      if (this.suppressGalleryClick || this.wasMobilePanGesture()) return false;
      this.openModal(index);
      this.blockGalleryTap();
      return true;
    },

    onGalleryCardTouchEnd(event: TouchEvent) {
      if (!this.isMobileViewport()) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const index = this.getGalleryIndexFromTouchPoint(
        touch.clientX,
        touch.clientY
      );
      if (index === null) return;
      if (this.tryOpenGalleryFromTap(index)) {
        event.preventDefault();
      }
    },

    blockGalleryTap(durationMs = 350) {
      this.suppressGalleryClick = true;
      window.setTimeout(() => {
        this.suppressGalleryClick = false;
      }, durationMs);
    },

    getGalleryIndexFromEvent(event: TouchEvent | MouseEvent): number | null {
      const target =
        "target" in event ? (event.target as Element | null) : null;
      const figure = target?.closest(".gallery-item");
      if (!figure) return null;

      const index = figure.getAttribute("data-gallery-index");
      return index !== null ? Number(index) : null;
    },

    getGalleryIndexFromTouchPoint(
      clientX: number,
      clientY: number
    ): number | null {
      if (!this.isMobileViewport()) return null;

      const root = this.$el as HTMLElement;
      const viewport = root.querySelector(".how-it-looks-gallery-3d--mobile");
      if (!viewport) return null;

      const viewportRect = viewport.getBoundingClientRect();
      if (
        clientX < viewportRect.left ||
        clientX > viewportRect.right ||
        clientY < viewportRect.top ||
        clientY > viewportRect.bottom
      ) {
        return null;
      }

      const items = viewport.querySelectorAll<HTMLElement>(".gallery-item");
      let bestIndex: number | null = null;
      let bestDistance = Infinity;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const visibleLeft = Math.max(rect.left, viewportRect.left);
        const visibleRight = Math.min(rect.right, viewportRect.right);
        if (visibleRight <= visibleLeft) return;
        if (clientY < rect.top || clientY > rect.bottom) return;
        if (clientX < visibleLeft || clientX > visibleRight) return;

        const centerX = (visibleLeft + visibleRight) / 2;
        const distance = Math.abs(clientX - centerX);
        if (distance < bestDistance) {
          bestDistance = distance;
          const index = item.getAttribute("data-gallery-index");
          if (index !== null) bestIndex = Number(index);
        }
      });

      return bestIndex;
    },

    onGalleryCardClick(index: number, event?: MouseEvent) {
      if (this.suppressGalleryClick) return;
      if (this.isMobileViewport()) {
        if (this.wasMobilePanGesture()) return;
        if (event) {
          const resolved = this.getGalleryIndexFromTouchPoint(
            event.clientX,
            event.clientY
          );
          if (resolved !== null) {
            this.openModal(resolved);
            return;
          }
        }
      }
      this.openModal(index);
    },

    setupVideoObserver() {
      const video = this.$refs.galleryVideo as HTMLVideoElement | undefined;
      if (!video) return;

      if (this.prefersReducedMotion) {
        video.pause();
        return;
      }

      this.videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              void video.play().catch(() => undefined);
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.3 }
      );

      this.videoObserver.observe(video);
    },

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
      const nextIndex =
        (this.activeImageIndex + 1) % this.galleryImages.length;
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
  padding: 6% 0 8%;
  text-align: center;
  overflow: hidden;
}

.how-it-looks-inner {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

.how-it-looks-showcase {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  margin-top: 28px;
  min-height: 460px;
  padding-inline: 2%;

  @media only screen and (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 28px;
    min-height: auto;
    padding-inline: 16px;
  }
}

.how-it-looks-video-showcase {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 24px;
  align-self: flex-start;
  flex: 0 0 min(360px, 40%);
  max-width: 380px;
  z-index: 2;
  transform: rotate(-4deg);
  transform-origin: top center;

  @media only screen and (max-width: 600px) {
    align-self: center;
    flex: none;
    max-width: 100%;
    padding-inline: 20px;
    transform: none;
  }
}

.how-it-looks-gallery-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 3;

  &--mobile {
    align-self: center;
    width: min(325px, calc(100vw - 70px));
    gap: 0;
    padding-inline: 0;
  }
}

.how-it-looks-gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 520px;
  padding: 8px 0;

  @media only screen and (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    max-width: 680px;
    gap: 14px;
  }
}

.gallery-grid-item {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  transition: transform 220ms ease, box-shadow 220ms ease;
  outline: none;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent 52%);
    pointer-events: none;
  }

  &:hover,
  &:focus-visible {
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
    z-index: 2;
  }
}

.video-showcase__backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
}

.video-showcase__shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(36px);

  &--one {
    width: 180px;
    height: 180px;
    top: -10%;
    right: 0;
    background: rgba(255, 255, 255, 0.22);
  }

  &--two {
    width: 140px;
    height: 140px;
    bottom: 5%;
    left: -5%;
    background: rgba(121, 174, 96, 0.25);
  }

  &--three {
    width: 120px;
    height: 120px;
    top: 40%;
    left: 30%;
    background: rgba(0, 0, 0, 0.08);
    filter: blur(24px);
  }
}

.video-showcase__caption {
  position: relative;
  z-index: 2;
  margin: 18px 0 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.gallery-carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  flex-shrink: 0;
  border: 0;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.28);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  cursor: pointer;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: background 180ms ease, opacity 180ms ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &--left {
    left: -25px;
  }

  &--right {
    right: -25px;
  }
}

.gallery-carousel-nav__icon {
  width: 22px;
  height: 22px;
  display: block;
  flex-shrink: 0;
}

.how-it-looks-gallery-3d {
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  overflow: hidden;
  width: 100%;
  min-height: 148px;
  padding: 16px 0 24px;
  z-index: 1;
  direction: ltr;
  cursor: grab;
  touch-action: manipulation;

  &--dragging {
    cursor: grabbing;
  }
}

.gallery-mobile-track {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  transform-style: preserve-3d;
  transition: transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;

  &--dragging {
    transition: none;
  }
}

.gallery-item {
  position: relative;
  flex: 0 0 auto;
  width: 100px;
  border-radius: 14px;
  overflow: hidden;
  background: #fff1;
  cursor: pointer;
  aspect-ratio: 4 / 5;
  flex-shrink: 0;
  transition: box-shadow 320ms ease, opacity 280ms ease;
  scroll-snap-align: center;
  pointer-events: auto;
  touch-action: manipulation;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent 48%);
    pointer-events: none;
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
  right: 8px;
  left: 8px;
  bottom: 8px;
  z-index: 2;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  text-align: right;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
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
  padding: 20px;
}

.gallery-modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: min(1100px, calc(90vw - 140px));
  max-height: 88vh;
  width: 100%;
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
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.22);
  cursor: pointer;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  touch-action: manipulation;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  transition: background 180ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.32);
  }
}

.gallery-modal-nav__icon {
  width: 28px;
  height: 28px;
  display: block;
}

.gallery-modal-prev {
  left: max(16px, env(safe-area-inset-left, 0px));
}

.gallery-modal-next {
  right: max(16px, env(safe-area-inset-right, 0px));
}

@media only screen and (max-width: 600px) {
  .gallery-modal {
    padding: max(10px, env(safe-area-inset-top, 0px))
      max(10px, env(safe-area-inset-right, 0px))
      max(10px, env(safe-area-inset-bottom, 0px))
      max(10px, env(safe-area-inset-left, 0px));
  }

  .gallery-modal-content {
    max-width: calc(100% - 112px);
    max-height: calc(100dvh - 80px);
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

  .gallery-modal-nav {
    width: 52px;
    height: 52px;
  }

  .gallery-modal-nav__icon {
    width: 26px;
    height: 26px;
  }

  .gallery-modal-prev {
    left: max(8px, env(safe-area-inset-left, 0px));
  }

  .gallery-modal-next {
    right: max(8px, env(safe-area-inset-right, 0px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .gallery-item,
  .gallery-grid-item {
    transition: none;
  }

  .how-it-looks-video-showcase {
    transform: none;
  }
}
</style>
