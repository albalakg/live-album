<template>
  <EventGalleryFullScreenView />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import EventGalleryFullScreenView from "@/views/EventGalleryFullScreenView.vue";

export default defineComponent({
  name: "EventGuestAlbumView",

  components: {
    EventGalleryFullScreenView,
  },

  setup() {
    return {};
  },

  data() {
    return {
      loading: true as boolean,
    };
  },

  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getAssets"];
    },

    event() {
      return this.$store.getters["event/getEvent"];
    },
  },

  created() {
    this.getEventDetails();
  },

  methods: {
    async getEventDetails() {
      await this.$store.dispatch(
        "event/getEventGuestGallery",
        this.$route.params.event_path
      );
      this.loading = false;
    },
  },
});
</script>

<style lang="scss">
.assets-content {
  margin-top: 20px;
  height: 72%;
  overflow-y: auto;
}
</style>
