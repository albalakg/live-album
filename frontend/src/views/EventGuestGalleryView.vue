<template>
  <div>
    <div>
      <h1 class="title--large text--pink text--center">
        {{ event.name }}
      </h1>
    </div>
    <div class="assets-content display--flex flex--wrap brs--medium">
      <template v-for="(asset, index) in assets" :key="index">
        <EventGuestCard class="pointer" :loading="loading" :assetIndex="index" :asset="asset" :eventName="event.name" @onClick="openModal" />
      </template>
    </div>

  </div>
  <div v-if="isModalOpened" class="lightbox" @click="isModalOpened = false">
    <span class="lightbox-close lightbox-icon">&times;</span>
    <button @click.stop="changeAsset(currentAssetIndex + 1)" class="lightbox-next lightbox-icon">&#10094;</button>
    <button @click.stop="changeAsset(currentAssetIndex - 1)" class="lightbox-prev lightbox-icon">&#10095;</button>
    <EventGuestCard class="lightbox-asset" :loading="loading" :assetIndex="0" :asset="currentAsset" :eventName="event.name" @onClick="doNone" controls autoplay />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import EventGuestCard from "@/components/event/EventGuestCard.vue";

export default defineComponent({
  name: "EventGuestGalleryView",

  components: {
    EventGuestCard,
  },

  setup() {
    return {};
  },

  data() {
    return {
      loading: true as boolean,
      isModalOpened: false as boolean,
      currentAssetIndex: 0 as number,
    };
  },

  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getAssets"];
    },

    event() {
      return this.$store.getters["event/getEvent"];
    },

    currentAsset(): IEventAsset {
      return this.assets[this.currentAssetIndex];
    },
  },

  created() {
    this.getEventDetails();
  },

  mounted() {
    this.keysListen();
  },

  methods: {
    async getEventDetails() {
      await this.$store.dispatch(
        "event/getEventGuestGallery",
        this.$route.params.event_path
      );
      this.loading = false;
    },

    openModal(assetIndex: number) {
      this.isModalOpened = true;
      this.currentAssetIndex = assetIndex;
    },

    changeAsset(newIndex: number) {
      if (newIndex < 0) {
        this.currentAssetIndex = this.assets.length - 1;
      } else if (newIndex >= this.assets.length) {
        this.currentAssetIndex = 0;
      } else {
        this.currentAssetIndex = newIndex;
      }
    },

    keysListen() {
      window.addEventListener("keydown", (e) => {
        if (!this.isModalOpened) {
          return;
        }
        
        if (e.key === "ArrowRight") {
          this.changeAsset(this.currentAssetIndex - 1);
        } else if (e.key === "ArrowLeft") {
          this.changeAsset(this.currentAssetIndex + 1);
        } else if (e.key === "Escape") {
          this.isModalOpened = false;
        }
      });
    },

    doNone() {
      // do nothing
    }
  },
});
</script>

<style lang="scss">
.assets-content {
  margin-top: 20px;
  height: 72%;
  overflow-y: auto;
}

.lightbox {
  height: 100vh;
  width: 100vw;
  background-color: #000c;
  position: fixed;
  z-index: 1000;
  top: 0;

  .lightbox-asset {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 850px;
    max-width: 90%;
    height: 600px;
    max-height: 90%;
    aspect-ratio: auto;
    transform: translate(-50%, -50%);
  }

  .lightbox-icon {
    position: absolute;
    top: 50%;
    font-size: 3rem;
    background: none;
    border: none;
    cursor: pointer;
    color: white;
    transform: translateY(-50%);
    transition: background-color 0.3s;

    &:hover {
      color: var(--pink);
    }
  }

  .lightbox-next {
    right: 20px;
  }
  
  .lightbox-close {
    top: 30px;
    right: 20px;
  }

  .lightbox-prev {
    position: absolute;
    top: 50%;
    left: 20px;
    font-size: 3rem;
    color: white;
    background: none;
    border: none;
    cursor: pointer;
    transform: translateY(-50%);
  }
}
</style>
