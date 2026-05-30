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
    <div class="lightbox-content" @click.stop>
      <EventGuestCard
        class="lightbox-asset"
        modalView
        :loading="loading"
        :assetIndex="0"
        :asset="currentAsset"
        :eventName="event.name"
        @onClick="doNone"
        controls
        autoplay
      />
    </div>
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
      return this.$store.getters["event/getActiveGuestAssets"];
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
@import "@/styles/lightbox.scss";

.assets-content {
  margin-top: 20px;
  height: 72%;
  overflow-y: auto;
}
</style>
