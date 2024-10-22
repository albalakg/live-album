<template>
  <div class="gallery">
    <div class="album-wrapper">
      <div class="title-container">
        <button class="arrow-button left-arrow" @click="previousFile">&#8592;</button>
        <h1 class="gallery-title">Amit & Gal</h1>
        <button class="arrow-button right-arrow" @click="nextFile">&#8594;</button>
      </div>
      <div class="album" v-for="(file, index) in sessionFile" :key="index">
        <template v-if="file.type === 'image'">
          <img :src="file.path" alt="image" class="album-file" />
        </template>
        <template v-else-if="file.type === 'video'">
          <video :src="file.path" class="album-file" autoplay muted @loadedmetadata="handleVideoDuration" @ended="nextFile"></video>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { IEventFile } from '@/helpers/interfaces';

export default defineComponent({
  name: 'GalleryView',
  data() {
    return {
      displayedIndexes: new Set<number>(),
      sessionFile: [] as IEventFile[],
      currentIndex: 0,
      timeoutId: null as ReturnType<typeof setTimeout> | null,
      intervalId: null as ReturnType<typeof setInterval> | null,
    };
  },
  
  computed: {
    files(): IEventFile[] {
      return this.$store.getters['event/getFiles'];
    },
  },
  
  methods: {
    getRandomFileIndexes(): number {
      const availableIndexes = this.files
        .map((_, index) => index)
        .filter((index) => !this.displayedIndexes.has(index));

      if (availableIndexes.length === 0) {
        this.displayedIndexes.clear();
        return this.getRandomFileIndexes();
      }

      const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      this.displayedIndexes.add(randomIndex);
      
      return randomIndex;
    },
    updatesessionFile(): void {
      if (this.files.length === 0) return;
      const index = this.getRandomFileIndexes();
      this.sessionFile = [this.files[index]];
      this.currentIndex = index;
    },
    nextFile(): void {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      this.currentIndex = (this.currentIndex + 1) % this.files.length;
      this.sessionFile = [this.files[this.currentIndex]];
      this.resetInterval();
    },
    previousFile(): void {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      this.currentIndex = (this.currentIndex - 1 + this.files.length) % this.files.length;
      this.sessionFile = [this.files[this.currentIndex]];
      this.resetInterval();
    },
    handleVideoDuration(event: Event): void {
      const videoElement = event.target as HTMLVideoElement;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.timeoutId = setTimeout(() => {
        if (!videoElement.ended) {
          this.nextFile();
        }
      }, 8000); // Move to next file after 8 seconds if the video has not ended
    },
    resetInterval(): void {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.intervalId = setInterval(this.updatesessionFile, 3000); // Updates the displayed file every 3 seconds
    },
  },

  created() {
    this.$store.dispatch("event/find");
    setInterval(() => {
      this.$store.dispatch("event/find");
    }, 10000);
  },

  mounted() {
    this.updatesessionFile();
  },

  watch: {
    sessionFile: {
      handler(newSessionFile) {
        if (newSessionFile.length && newSessionFile[0].type === 'video') {
          if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
        } else {
          this.resetInterval();
        }
      },
      immediate: true,
    },
  },
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Great+Vibes&display=swap');

.gallery {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #f8f9fa;
  min-height: 100vh;
  position: relative;
}

.album-wrapper {
  width: 100%;
  height: 100vh;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
  padding: 10px;
}

.gallery-title {
  font-family: 'Great Vibes', cursive;
  font-size: 3rem;
  color: #333;
}

.arrow-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 20px;
  transition: transform 0.2s;
}

.arrow-button:hover {
  transform: scale(1.2);
}

.album {
  position: relative;
  width: 100vw;
  height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #000;
}

.album-file {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
