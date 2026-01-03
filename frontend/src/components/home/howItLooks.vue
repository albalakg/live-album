<template>
  <section class="home-page-section how-it-looks-section bg--pink" id="how-it-looks">
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
    <MainCube color="pink" left="10%" top="10%" width="large" height="x-large" />
    <MainCube left="8%" top="3%" width="large" height="large" />
    <MainCube left="11%" top="6%" width="medium" height="medium" />
    <MainCube left="60%" top="3%" width="large" height="large" />
    <MainCube color="pink" left="63%" top="10%" width="medium" height="medium" />
    <MainCube color="pink" left="30%" top="73%" width="large" height="large" />
    <MainCube color="pink" left="33%" top="71%" width="large" height="medium" />
    <MainCube color="pink" left="72%" top="80%" width="xx-large" height="large" />

    <div class="how-it-looks-content margin--auto" :class="$bp.isMobile ? 'width--full' : 'width--page-size'">
      <div class="height--ful width--full">
        <h2 class="text--white title--x-large">בואו נראה איך זה נראה</h2>

        <div class="video-wrapper" :data-state="state">
          <!-- Fallback poster image (shows while loading / if error) -->
          <img
            class="video-poster"
            :src="posterSrc"
            alt="Video preview"
            loading="lazy"
          />

          <video
            ref="videoEl"
            class="video-el"
            :src="videoSrc"
            :poster="posterSrc"
            muted
            playsinline
            autoplay
            loop
            controls
            preload="metadata"
            @loadeddata="onLoadedData"
            @canplay="onCanPlay"
            @playing="onPlaying"
            @pause="onPause"
            @error="onError"
          ></video>

          <!-- Overlay (clickable) -->
          <button
            class="video-overlay"
            type="button"
            aria-label="Play/Pause video"
          >
            <span class="play-icon" aria-hidden="true" @click="togglePlayback"></span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainLine from "../library/background/MainLine.vue";
import MainCube from "@/components/library/background/MainCube.vue";

type VideoState = "loading" | "ready" | "playing" | "error";

export default defineComponent({
  name: "HowItLooks",
  components: { MainCube, MainLine },

  data() {
    return {
      state: "loading" as VideoState,
      videoSrc: "/assets/Login to event.mp4",
      posterSrc: "/assets/gallery.jpg",
      autoplayAttempted: false,
    };
  },

  mounted() {
    // Try autoplay once component mounted (some browsers won't start it)
    this.tryAutoplay();
  },

  methods: {
    getVideo(): HTMLVideoElement | null {
      return (this.$refs.videoEl as HTMLVideoElement) || null;
    },

    async tryAutoplay() {
      if (this.autoplayAttempted) return;
      this.autoplayAttempted = true;

      const video = this.getVideo();
      if (!video) return;

      try {
        // Ensure these are set (some browsers need it set programmatically too)
        video.muted = true;
        (video as any).playsInline = true;

        // Attempt to play
        await video.play();
        // "playing" event will set state
      } catch (e) {
        // Autoplay blocked -> keep poster visible and show play icon
        if (this.state !== "error") this.state = "ready";
      }
    },

    async togglePlayback() {
      const video = this.getVideo();
      if (!video) return;

      try {
        if (video.paused) {
          // Ensure autoplay rules
          video.muted = true;
          (video as any).playsInline = true;

          await video.play();
          // onPlaying will update state
        } else {
          video.pause(); // onPause updates state
        }
      } catch (e) {
        // If play fails (blocked), keep ready state (poster stays until canplay)
        if (this.state !== "error") this.state = "ready";
      }
    },

    onLoadedData() {
      if (this.state !== "error") this.state = "ready";
    },

    onCanPlay() {
      // Video can play, keep ready unless already playing
      if (this.state !== "playing" && this.state !== "error") {
        this.state = "ready";
      }
    },

    onPlaying() {
      this.state = "playing";
    },

    onPause() {
      if (this.state !== "error") this.state = "ready";
    },

    onError() {
      this.state = "error";
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
  padding-top: 6%;
  text-align: center;
  overflow: hidden;

  .video-wrapper {
    box-shadow: 0 5px 8px #0008;
    border-top: #3338 solid 2px;
    background-color: #000;
    position: relative;
    height: 850px;
    max-height: 80vh;
    aspect-ratio: 16 / 9;
    // overflow: hidden;
    margin: auto;
    margin-top: 20px;
  }

  .video-el,
  .video-poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    
    @media only screen and (max-width: 600px) {
      width: 100vw;
    }
  }

  .video-poster {
    z-index: 1;
    transition: opacity 250ms ease;
  }

  .video-el {
    z-index: 0;
  }

  .video-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.12);
    border: 0;
    transition: background 200ms ease;
    pointer-events: none;
  }

  .video-overlay:hover {
    background: rgba(0, 0, 0, 0.18);
  }

  .play-icon {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    background: rgba(17, 17, 17, 0.55);
    backdrop-filter: blur(6px);
    position: relative;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
    transition: opacity 180ms ease, transform 180ms ease;
    cursor: pointer;
    pointer-events: all;
  }

  .play-icon::before {
    content: "";
    position: absolute;
    left: 30px;
    top: 22px;
    width: 0;
    height: 0;
    border-top: 14px solid transparent;
    border-bottom: 14px solid transparent;
    border-left: 22px solid #fff;
  }

  /* Hide play icon when playing */
  .video-wrapper[data-state="playing"] .play-icon {
    opacity: 0;
    transform: scale(0.96);
  }

  /* Softer overlay while playing */
  .video-wrapper[data-state="playing"] .video-overlay {
    background: rgba(0, 0, 0, 0.05);
  }

  /* Fade poster when ready or playing */
  .video-wrapper[data-state="ready"] .video-poster,
  .video-wrapper[data-state="playing"] .video-poster {
    opacity: 0;
    pointer-events: none;
  }

  /* On error: keep poster */
  .video-wrapper[data-state="error"] .video-poster {
    opacity: 1;
  }

  .video-wrapper[data-state="error"] .video-overlay {
    background: rgba(0, 0, 0, 0.22);
  }
}
</style>
